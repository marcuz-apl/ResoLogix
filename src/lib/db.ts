import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'resologix.db');

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
}

// Ensure database is initialized
initDb();

export default db;
