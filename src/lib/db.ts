import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'resologix.db');

const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id TEXT PRIMARY KEY,
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
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
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
  `);

  // Migration: add include_secondary to evaluations if not exists
  try {
    db.exec(`ALTER TABLE evaluations ADD COLUMN include_secondary INTEGER DEFAULT 1;`);
  } catch (e) {
    // Column already exists, ignore error
  }

  // Migration: add reserve profile fields to evaluations if not exists
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
    'type_well'
  ];
  for (const col of reserveProfileColumns) {
    try {
      const defaultValue = col === 'type_well' ? 'None' : 'undefined';
      db.exec(`ALTER TABLE evaluations ADD COLUMN ${col} TEXT DEFAULT '${defaultValue}';`);
    } catch (e) {
      // Column already exists, ignore error
    }
  }
}

// Ensure database is initialized
initDb();

export default db;
