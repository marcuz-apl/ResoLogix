import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import db from '@/lib/db';
import { generateHumanId } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    let scenarios = [];
    if (!session || !session.user) {
      scenarios = db.prepare(`
        SELECT id, scenario_name, folder, description, qi, di, b, q_limit, d_min, method, method_params, historical_data, created_at, updated_at, is_example, enable_economics, emv_params, econ_params
        FROM "dca-scenarios" 
        WHERE is_example = 1 
        ORDER BY updated_at DESC
      `).all();
    } else {
      const userId = (session.user as any).id;
      scenarios = db.prepare(`
        SELECT id, scenario_name, folder, description, qi, di, b, q_limit, d_min, method, method_params, historical_data, created_at, updated_at, is_example, enable_economics, emv_params, econ_params
        FROM "dca-scenarios" 
        WHERE user_id = ? OR is_example = 1
        ORDER BY is_example DESC, updated_at DESC
      `).all(userId);
    }

    // Parse historical_data JSON strings back to objects
    const parsedScenarios = scenarios.map((s: any) => ({
      ...s,
      is_example: s.is_example === 1,
      historical_data: s.historical_data ? JSON.parse(s.historical_data) : [],
      method: s.method || 'ARPS',
      method_params: s.method_params ? JSON.parse(s.method_params) : undefined,
      params: { qi: s.qi, di: s.di, b: s.b, d_min: s.d_min },
      enable_economics: s.enable_economics === 1,
      emv_params: s.emv_params ? JSON.parse(s.emv_params) : undefined,
      econ_params: s.econ_params ? JSON.parse(s.econ_params) : undefined
    }));

    return NextResponse.json(parsedScenarios);
  } catch (error: any) {
    console.error('DCA GET Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const body = await request.json();

    const { scenario_name, folder, description, method, method_params, params, q_limit, historical_data, enable_economics, emv_params, econ_params } = body;
    let { id } = body;

    if (!id) {
      id = generateHumanId('dca');
    } else {
      // Check if trying to save an example scenario
      const existing = db.prepare('SELECT is_example FROM "dca-scenarios" WHERE id = ?').get(id) as any;
      const isSuperAdmin = (session.user as any).isSuperAdmin === 1 || (session.user as any).isSuperAdmin === true;
      if (existing && existing.is_example === 1 && !isSuperAdmin) {
        return NextResponse.json({ error: "Cannot overwrite an example scenario. Please use 'Copy Scenario' to save your own version." }, { status: 403 });
      }
    }

    db.prepare(`
      INSERT INTO "dca-scenarios" (
        id, user_id, scenario_name, folder, description, 
        qi, di, b, q_limit, d_min, method, method_params, historical_data, updated_at,
        enable_economics, emv_params, econ_params
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        scenario_name = excluded.scenario_name,
        folder = excluded.folder,
        description = excluded.description,
        qi = excluded.qi,
        di = excluded.di,
        b = excluded.b,
        q_limit = excluded.q_limit,
        d_min = excluded.d_min,
        method = excluded.method,
        method_params = excluded.method_params,
        historical_data = excluded.historical_data,
        enable_economics = excluded.enable_economics,
        emv_params = excluded.emv_params,
        econ_params = excluded.econ_params,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      id, userId, scenario_name, folder || 'Uncategorized', description || '',
      params?.qi, params?.di, params?.b, q_limit, params?.d_min || null, 
      method || 'ARPS', method_params ? JSON.stringify(method_params) : null,
      JSON.stringify(historical_data),
      enable_economics ? 1 : 0,
      emv_params ? JSON.stringify(emv_params) : null,
      econ_params ? JSON.stringify(econ_params) : null
    );

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('DCA POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Missing ID parameter" }, { status: 400 });
    }

    const isSuperAdmin = (session.user as any).isSuperAdmin === 1 || (session.user as any).isSuperAdmin === true;

    // Check if it's an example
    const existing = db.prepare('SELECT is_example FROM "dca-scenarios" WHERE id = ?').get(id) as any;
    if (existing && existing.is_example === 1 && !isSuperAdmin) {
      return NextResponse.json({ error: "Unauthorized: Cannot delete example scenarios." }, { status: 403 });
    }

    db.prepare('DELETE FROM "dca-scenarios" WHERE id = ? AND (user_id = ? OR ? = 1)').run(id, userId, isSuperAdmin ? 1 : 0);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DCA DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}
