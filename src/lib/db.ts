import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'resologix.db');

const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      needs_password_change INTEGER DEFAULT 1,
      is_admin INTEGER DEFAULT 0,
      is_superadmin INTEGER DEFAULT 0,
      name TEXT,
      last_login TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS evaluations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      fluid_type TEXT DEFAULT 'OIL',
      country TEXT DEFAULT 'undefined',
      geol_basin TEXT DEFAULT 'undefined',
      play_type TEXT DEFAULT 'undefined',
      reservoir_age TEXT DEFAULT 'undefined',
      lithology TEXT DEFAULT 'undefined',
      depo_env TEXT DEFAULT 'undefined',
      exp_stage TEXT DEFAULT 'undefined',
      terrain TEXT DEFAULT 'undefined',
      lahee_class TEXT DEFAULT 'undefined',
      type_well TEXT DEFAULT 'None',
      folder TEXT DEFAULT 'Uncategorized',
      include_secondary INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS parameters (
      id TEXT PRIMARY KEY,
      evaluation_id TEXT NOT NULL,
      name TEXT NOT NULL,
      distribution TEXT DEFAULT 'LOGNORMAL',
      p90_value REAL NOT NULL,
      p10_value REAL NOT NULL,
      FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS risk_factors (
      evaluation_id TEXT PRIMARY KEY,
      source REAL DEFAULT 1.0,
      migration REAL DEFAULT 1.0,
      reservoir REAL DEFAULT 1.0,
      closure REAL DEFAULT 1.0,
      containment REAL DEFAULT 1.0,
      FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "dca-scenarios" (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      scenario_name TEXT NOT NULL,
      folder TEXT DEFAULT 'Uncategorized',
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- Parameters
      qi REAL,
      di REAL,
      b REAL,
      q_limit REAL,
      
      -- Historical data stored as JSON string
      historical_data TEXT,
      
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);



  // Migration: add reserve profile and folder fields to evaluations if not exists
  const reserveProfileColumns = [
    'country',
    'geol_basin',
    'play_type',
    'reservoir_age',
    'lithology',
    'depo_env',
    'exp_stage',
    'terrain',
    'lahee_class',
    'type_well',
    'folder'
  ];
  for (const col of reserveProfileColumns) {
    try {
      let defaultValue = 'undefined';
      if (col === 'type_well') defaultValue = 'None';
      if (col === 'folder') defaultValue = 'Uncategorized';
      db.exec(`ALTER TABLE evaluations ADD COLUMN ${col} TEXT DEFAULT '${defaultValue}';`);
    } catch (e) {
      // Column already exists, ignore error
    }
  }

  // Migration: add name, last_login, is_superadmin to users
  const userColumns = ['name', 'last_login', 'is_superadmin'];
  for (const col of userColumns) {
    try {
      if (col === 'is_superadmin') {
        db.exec(`ALTER TABLE users ADD COLUMN ${col} INTEGER DEFAULT 0;`);
      } else {
        db.exec(`ALTER TABLE users ADD COLUMN ${col} TEXT;`);
      }
    } catch (e) {
      // Column already exists
    }
  }

  // Migrate DCA data if the old database exists
  try {
    const dcaDbPath = path.join(DATA_DIR, 'resologix-dca.db');
    if (fs.existsSync(dcaDbPath)) {
      db.exec(`ATTACH DATABASE '${dcaDbPath}' AS dca_db;`);
      db.exec(`INSERT OR IGNORE INTO "dca-scenarios" SELECT * FROM dca_db.dca_scenarios;`);
      db.exec(`DETACH DATABASE dca_db;`);
      // Rename the old file so we don't migrate again
      fs.renameSync(dcaDbPath, path.join(DATA_DIR, 'resologix-dca.db.bak'));
    }
  } catch (e) {
    console.error("DCA migration error:", e);
  }

  // Migration: rename dca_scenarios to "dca-scenarios" if it exists
  try {
    const tableExists = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='dca_scenarios';`).get();
    if (tableExists) {
      db.exec(`ALTER TABLE dca_scenarios RENAME TO "dca-scenarios";`);
      console.log('Migrated dca_scenarios to "dca-scenarios"');
    }
  } catch (e) {
    console.error("Failed to rename dca_scenarios:", e);
  }

  // Migration: add folder to "dca-scenarios"
  try {
    db.exec(`ALTER TABLE "dca-scenarios" ADD COLUMN folder TEXT DEFAULT 'Uncategorized';`);
    console.log('Added folder column to "dca-scenarios"');
  } catch (e) {
    // Column likely already exists
  }

  // Migration: add is_example to evaluations and "dca-scenarios"
  try {
    db.exec(`ALTER TABLE evaluations ADD COLUMN is_example INTEGER DEFAULT 0;`);
    console.log('Added is_example column to evaluations');
  } catch (e) {
    // Column likely already exists
  }
  
  try {
    db.exec(`ALTER TABLE "dca-scenarios" ADD COLUMN is_example INTEGER DEFAULT 0;`);
    console.log('Added is_example column to "dca-scenarios"');
  } catch (e) {
    // Column likely already exists
  }

  // Migration: add emv_params to evaluations
  try {
    db.exec(`ALTER TABLE evaluations ADD COLUMN emv_params TEXT;`);
    console.log('Added emv_params column to evaluations');
  } catch (e) {
    // Column likely already exists
  }

  // Migration: add econ_params to evaluations
  try {
    db.exec(`ALTER TABLE evaluations ADD COLUMN econ_params TEXT;`);
    console.log('Added econ_params column to evaluations');
  } catch (e) {
    // Column likely already exists
  }
}

// Ensure database is initialized
initDb();

export default db;
