import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

// GET all evaluations
export async function GET() {
  try {
    const evaluations = db.prepare(`
      SELECT * FROM evaluations ORDER BY updated_at DESC
    `).all() as any[];

    const results = evaluations.map((ev) => {
      // Fetch parameters
      const params = db.prepare(`
        SELECT name, distribution, p90_value as p90, p10_value as p10 
        FROM parameters 
        WHERE evaluation_id = ?
      `).all(ev.id) as any[];

      // Fetch risk factors
      let risk = db.prepare(`
        SELECT source, migration, reservoir, closure, containment 
        FROM risk_factors 
        WHERE evaluation_id = ?
      `).get(ev.id) as any;

      if (!risk) {
        risk = { source: 1.0, migration: 1.0, reservoir: 1.0, closure: 1.0, containment: 1.0 };
      }

      // Format parameters as key-value structure
      const formattedParams: any = {};
      params.forEach((p) => {
        formattedParams[p.name] = {
          p90: p.p90,
          p10: p.p10,
          distribution: p.distribution,
        };
      });

      return {
        id: ev.id,
        name: ev.name,
        description: ev.description || '',
        fluid_type: ev.fluid_type,
        include_secondary: ev.include_secondary !== 0,
        country: ev.country || 'undefined',
        geol_basin: ev.geol_basin || 'undefined',
        play_type: ev.play_type || 'undefined',
        reservoir_age: ev.reservoir_age || 'undefined',
        lithology: ev.lithology || 'undefined',
        depo_env: ev.depo_env || 'undefined',
        exp_stage: ev.exp_stage || 'undefined',
        terrain: ev.terrain || 'undefined',
        lahee_class: ev.lahee_class || 'undefined',
        created_at: ev.created_at,
        updated_at: ev.updated_at,
        parameters: formattedParams,
        risk_factors: risk,
      };
    });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Save or update an evaluation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      fluid_type, 
      include_secondary, 
      country,
      geol_basin,
      play_type,
      reservoir_age,
      lithology,
      depo_env,
      exp_stage,
      terrain,
      lahee_class,
      parameters, 
      risk_factors 
    } = body;
    let { id } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!id) {
      id = crypto.randomUUID();
    }

    // Run in a transaction
    const saveTransaction = db.transaction(() => {
      // 1. Insert or update evaluation
      db.prepare(`
        INSERT INTO evaluations (
          id, name, description, fluid_type, include_secondary, 
          country, geol_basin, play_type, reservoir_age, lithology, 
          depo_env, exp_stage, terrain, lahee_class, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          description = excluded.description,
          fluid_type = excluded.fluid_type,
          include_secondary = excluded.include_secondary,
          country = excluded.country,
          geol_basin = excluded.geol_basin,
          play_type = excluded.play_type,
          reservoir_age = excluded.reservoir_age,
          lithology = excluded.lithology,
          depo_env = excluded.depo_env,
          exp_stage = excluded.exp_stage,
          terrain = excluded.terrain,
          lahee_class = excluded.lahee_class,
          updated_at = CURRENT_TIMESTAMP
      `).run(
        id, 
        name, 
        description || '', 
        fluid_type || 'OIL', 
        include_secondary ? 1 : 0,
        country || 'undefined',
        geol_basin || 'undefined',
        play_type || 'undefined',
        reservoir_age || 'undefined',
        lithology || 'undefined',
        depo_env || 'undefined',
        exp_stage || 'undefined',
        terrain || 'undefined',
        lahee_class || 'undefined'
      );

      // 2. Delete existing parameters
      db.prepare(`DELETE FROM parameters WHERE evaluation_id = ?`).run(id);

      // 3. Insert new parameters
      if (parameters) {
        const insertParam = db.prepare(`
          INSERT INTO parameters (id, evaluation_id, name, distribution, p90_value, p10_value)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        for (const [paramName, config] of Object.entries(parameters) as [string, any][]) {
          insertParam.run(
            crypto.randomUUID(),
            id,
            paramName,
            config.distribution || 'LOGNORMAL',
            Number(config.p90),
            Number(config.p10)
          );
        }
      }

      // 4. Insert or update risk factors
      if (risk_factors) {
        db.prepare(`
          INSERT INTO risk_factors (evaluation_id, source, migration, reservoir, closure, containment)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(evaluation_id) DO UPDATE SET
            source = excluded.source,
            migration = excluded.migration,
            reservoir = excluded.reservoir,
            closure = excluded.closure,
            containment = excluded.containment
        `).run(
          id,
          Number(risk_factors.source ?? 1.0),
          Number(risk_factors.migration ?? 1.0),
          Number(risk_factors.reservoir ?? 1.0),
          Number(risk_factors.closure ?? 1.0),
          Number(risk_factors.containment ?? 1.0)
        );
      }
    });

    saveTransaction();

    return NextResponse.json({
      id,
      name,
      description,
      fluid_type,
      include_secondary,
      country,
      geol_basin,
      play_type,
      reservoir_age,
      lithology,
      depo_env,
      exp_stage,
      terrain,
      lahee_class,
      parameters,
      risk_factors,
    });
  } catch (error: any) {
    console.error('Error saving evaluation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
