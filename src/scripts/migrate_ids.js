const Database = require('better-sqlite3');
const crypto = require('crypto');

function generateHumanId(prefix) {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const yyyy = now.getUTCFullYear();
  const mm = pad(now.getUTCMonth() + 1);
  const dd = pad(now.getUTCDate());
  const hh = pad(now.getUTCHours());
  const min = pad(now.getUTCMinutes());
  const ss = pad(now.getUTCSeconds());
  const randomSuffix = crypto.randomBytes(2).toString('hex');
  return `${prefix}-${yyyy}-${mm}-${dd}-${hh}-${min}-${ss}-${randomSuffix}`;
}

const db = new Database('resologix.db');

try {
  // Disable foreign keys temporarily
  db.pragma('foreign_keys = OFF');

  db.transaction(() => {
    // 1. Migrate Users
    const users = db.prepare('SELECT id FROM users').all();
    console.log(`Migrating ${users.length} users...`);
    for (const user of users) {
      if (user.id.startsWith('uid-')) continue; // Already migrated
      const newUid = generateHumanId('uid');
      
      db.prepare('UPDATE users SET id = ? WHERE id = ?').run(newUid, user.id);
      db.prepare('UPDATE evaluations SET user_id = ? WHERE user_id = ?').run(newUid, user.id);
    }

    // 2. Migrate Evaluations
    const evals = db.prepare('SELECT id FROM evaluations').all();
    console.log(`Migrating ${evals.length} evaluations...`);
    for (const ev of evals) {
      if (ev.id.startsWith('eid-')) continue;
      const newEid = generateHumanId('eid');

      db.prepare('UPDATE evaluations SET id = ? WHERE id = ?').run(newEid, ev.id);
      db.prepare('UPDATE parameters SET evaluation_id = ? WHERE evaluation_id = ?').run(newEid, ev.id);
      db.prepare('UPDATE risk_factors SET evaluation_id = ? WHERE evaluation_id = ?').run(newEid, ev.id);
    }

    // 3. Migrate Parameters
    const params = db.prepare('SELECT id FROM parameters').all();
    console.log(`Migrating ${params.length} parameters...`);
    for (const param of params) {
      if (param.id.startsWith('pid-')) continue;
      const newPid = generateHumanId('pid');
      db.prepare('UPDATE parameters SET id = ? WHERE id = ?').run(newPid, param.id);
    }
  })();

  console.log('Migration completed successfully.');

} catch (err) {
  console.error('Migration failed:', err);
} finally {
  // Re-enable foreign keys
  db.pragma('foreign_keys = ON');
}
