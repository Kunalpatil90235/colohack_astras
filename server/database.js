import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = resolve(__dirname, 'vani.db');
const db = new Database(dbPath);

// 1. Create Tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    rawText TEXT,
    totalEarnings REAL DEFAULT 0,
    totalExpenses REAL DEFAULT 0,
    items_json TEXT,
    expenses_json TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    current_qty INTEGER DEFAULT 0,
    target_qty INTEGER DEFAULT 100,
    unit TEXT DEFAULT 'units',
    UNIQUE(user_id, name),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// 2. Migrations: Add user_id column if it doesn't exist (safety for existing DBs)
try {
    const tableInfo = db.prepare("PRAGMA table_info(entries)").all();
    const hasUserId = tableInfo.some(col => col.name === 'user_id');
    if (!hasUserId) {
        db.exec("ALTER TABLE entries ADD COLUMN user_id INTEGER;");
        console.log("Migration: Added user_id to entries");
    }
} catch (e) {
    console.error("Migration error (entries):", e.message);
}

try {
    const tableInfo = db.prepare("PRAGMA table_info(inventory)").all();
    const hasUserId = tableInfo.some(col => col.name === 'user_id');
    if (!hasUserId) {
        db.exec("ALTER TABLE inventory ADD COLUMN user_id INTEGER;");
        console.log("Migration: Added user_id to inventory");
    }
} catch (e) {
    console.error("Migration error (inventory):", e.message);
}

export default db;
