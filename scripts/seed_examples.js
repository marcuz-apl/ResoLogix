const db = require('better-sqlite3')('data/resologix.db');
const https = require('https');

const userId = 'uid-2026-06-11-18-08-21-a56b'; 
const evalId = 'eid_example_mc_001';
const dcaId = 'dca_example_001';

const csvUrl = 'https://raw.githubusercontent.com/AbderrahmaneTAIBI/Decline-Curve-Analysis/main/synthetic_decline_curves02.csv';

https.get(csvUrl, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      // Parse CSV
      const lines = data.split('\n');
      const historical_data = [];
      
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',');
        if (cols.length >= 2) {
          const t = parseFloat(cols[0]);
          const q = parseFloat(cols[1]); // Well 01
          // ensure data is somewhat smooth by ignoring negative noise if any, or just keeping it
          if (!isNaN(t) && !isNaN(q)) {
            historical_data.push({ t: t, q: Math.max(0, q) });
          }
        }
        // let's use first 100 months for a good fit showcase
        if (historical_data.length >= 100) break;
      }

      // Insert Monte Carlo Evaluation Example
      db.prepare(`
        INSERT OR REPLACE INTO evaluations (
          id, user_id, name, description, fluid_type, include_secondary, 
          country, geol_basin, play_type, reservoir_age, lithology, 
          depo_env, exp_stage, terrain, lahee_class, type_well, folder, is_example
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        evalId, userId, "Example: Alpha Prospect", "An example of an offshore oil prospect.", "OIL", 1,
        "United States of America", "Gulf of Mexico", "Fault Dependent Closure", "Miocene", "Sandstone",
        "Turbidite/Fan", "Prospect", "Offshore Deep-Water", "New Field Wildcat", "None", "Example Scenarios", 1
      );

      // Parameters
      db.prepare('DELETE FROM parameters WHERE evaluation_id = ?').run(evalId);
      const insertParam = db.prepare(`INSERT INTO parameters (id, evaluation_id, name, distribution, p90_value, p10_value) VALUES (?, ?, ?, ?, ?, ?)`);
      
      const params = {
        A: { dist: 'LOGNORMAL', p90: 2000, p10: 8000 },
        h: { dist: 'LOGNORMAL', p90: 50, p10: 150 },
        Phi: { dist: 'LOGNORMAL', p90: 0.18, p10: 0.28 },
        Sw: { dist: 'LOGNORMAL', p90: 0.35, p10: 0.15 },
        Boi: { dist: 'LOGNORMAL', p90: 1.2, p10: 1.4 },
        RE: { dist: 'LOGNORMAL', p90: 0.20, p10: 0.45 },
        GOR: { dist: 'LOGNORMAL', p90: 800, p10: 2000 },
        RE_SolGas: { dist: 'LOGNORMAL', p90: 0.30, p10: 0.60 },
      };

      for (const [key, val] of Object.entries(params)) {
        insertParam.run('pid_' + key + '_' + Date.now(), evalId, key, val.dist, val.p90, val.p10);
      }

      // Risk Factors
      db.prepare(`
        INSERT OR REPLACE INTO risk_factors (evaluation_id, source, migration, reservoir, closure, containment)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(evalId, 0.9, 0.85, 0.8, 0.7, 0.9);

      // Insert DCA Example
      db.prepare(`
        INSERT OR REPLACE INTO "dca-scenarios" (
          id, user_id, scenario_name, folder, description, 
          qi, di, b, q_limit, historical_data, is_example
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        dcaId, userId, "Example: Open-Source Well 01", "Example Scenarios", 
        "An open-source production decline curve from a public Kaggle/GitHub dataset.",
        1000, 0.2, 0.5, 50, JSON.stringify(historical_data), 1
      );

      console.log("Seed examples created successfully with open-source DCA data.");
    } catch (e) {
      console.error("Failed to parse and seed examples:", e);
    }
  });
}).on('error', (e) => {
  console.error("Error fetching open source data:", e);
});
