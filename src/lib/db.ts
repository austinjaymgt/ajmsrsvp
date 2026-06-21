import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'ajm.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      start_date TEXT,
      end_date TEXT,
      location TEXT,
      hero_image_url TEXT,
      description TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL REFERENCES events(id),
      type TEXT NOT NULL CHECK(type IN ('text', 'select', 'multiselect')),
      label TEXT NOT NULL,
      options TEXT,
      "order" INTEGER DEFAULT 0,
      required INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS guests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL REFERENCES events(id),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('confirmed','maybe','declined','pending')),
      invited_at TEXT,
      responded_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guest_id INTEGER NOT NULL REFERENCES guests(id),
      question_id INTEGER NOT NULL REFERENCES questions(id),
      answer_value TEXT
    );

    CREATE TABLE IF NOT EXISTS itinerary_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL REFERENCES events(id),
      day_label TEXT NOT NULL,
      time TEXT,
      title TEXT NOT NULL,
      description TEXT,
      "order" INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL REFERENCES events(id),
      url TEXT NOT NULL,
      caption TEXT,
      category TEXT DEFAULT 'accommodation' CHECK(category IN ('accommodation','location','past_trips')),
      "order" INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS info_blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL REFERENCES events(id),
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      icon TEXT,
      "order" INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guest_id INTEGER NOT NULL REFERENCES guests(id),
      amount_owed INTEGER DEFAULT 0,
      amount_paid INTEGER DEFAULT 0,
      stripe_payment_id TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','partial','paid','refunded'))
    );
  `);
}
