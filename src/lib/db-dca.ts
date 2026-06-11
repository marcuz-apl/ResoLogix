import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'resologix-dca.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Initialize database schema for DCA
db.exec(`
  CREATE TABLE IF NOT EXISTS dca_scenarios (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    scenario_name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Parameters
    qi REAL,
    di REAL,
    b REAL,
    q_limit REAL,
    
    -- Historical data stored as JSON string
    historical_data TEXT
  );
`);

export default db;
