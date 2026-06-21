import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'ajm.db');
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

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
    event_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    options TEXT,
    "order" INTEGER DEFAULT 0,
    required INTEGER DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'pending',
    invited_at TEXT,
    responded_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guest_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer_value TEXT
  );
  CREATE TABLE IF NOT EXISTS itinerary_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    day_label TEXT NOT NULL,
    time TEXT,
    title TEXT NOT NULL,
    description TEXT,
    "order" INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    caption TEXT,
    category TEXT DEFAULT 'accommodation',
    "order" INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS info_blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    icon TEXT,
    "order" INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guest_id INTEGER NOT NULL,
    amount_owed INTEGER DEFAULT 0,
    amount_paid INTEGER DEFAULT 0,
    stripe_payment_id TEXT,
    status TEXT DEFAULT 'pending'
  );
`);

// Create event
const eventStmt = db.prepare(`
  INSERT OR IGNORE INTO events (name, slug, start_date, end_date, location, description)
  VALUES (?, ?, ?, ?, ?, ?)
`);
eventStmt.run(
  'Homecoming 2026',
  'homecoming-2026',
  '2026-10-09',
  '2026-10-12',
  'Somewhere Special',
  'The crew is back together for a long weekend of good vibes, great food, and even better people.'
);

const event = db.prepare('SELECT id FROM events WHERE slug = ?').get('homecoming-2026') as { id: number };
const eventId = event.id;

// Questions
const qStmt = db.prepare(`
  INSERT INTO questions (event_id, type, label, options, "order", required)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const existingQ = db.prepare('SELECT COUNT(*) as c FROM questions WHERE event_id = ?').get(eventId) as { c: number };
if (existingQ.c === 0) {
  qStmt.run(eventId, 'select', 'Which day are you arriving?',
    JSON.stringify(['Thursday evening', 'Friday morning', 'Friday afternoon', 'Friday evening']), 0, 1);
  qStmt.run(eventId, 'text', 'Any dietary restrictions or allergies we should know about?', null, 1, 0);
  qStmt.run(eventId, 'select', 'T-shirt size (for the group merch)?',
    JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']), 2, 0);
}

// Itinerary
const iStmt = db.prepare(`
  INSERT INTO itinerary_items (event_id, day_label, time, title, description, "order")
  VALUES (?, ?, ?, ?, ?, ?)
`);
const existingI = db.prepare('SELECT COUNT(*) as c FROM itinerary_items WHERE event_id = ?').get(eventId) as { c: number };
if (existingI.c === 0) {
  iStmt.run(eventId, 'Friday, Oct 9', 'All day', 'Arrivals', 'Come whenever — the house is yours. First ones in get first pick of rooms.', 0);
  iStmt.run(eventId, 'Friday, Oct 9', '7:00 PM', 'Welcome Dinner', 'Group dinner at the house. We\'re cooking.', 1);
  iStmt.run(eventId, 'Saturday, Oct 10', '10:00 AM', 'Slow Morning', 'Coffee, breakfast, no agenda. Enjoy the space.', 2);
  iStmt.run(eventId, 'Saturday, Oct 10', '2:00 PM', 'Group Activity', 'TBD based on weather and vibes.', 3);
  iStmt.run(eventId, 'Saturday, Oct 10', '7:00 PM', 'Big Night Out', 'Dinner + evening out. Details to come.', 4);
  iStmt.run(eventId, 'Sunday, Oct 11', '11:00 AM', 'Brunch', 'One last meal together before people head out.', 5);
  iStmt.run(eventId, 'Sunday, Oct 11', 'Afternoon', 'Departures', 'Safe travels. See you next time.', 6);
}

// Info blocks
const bStmt = db.prepare(`
  INSERT INTO info_blocks (event_id, title, body, icon, "order")
  VALUES (?, ?, ?, ?, ?)
`);
const existingB = db.prepare('SELECT COUNT(*) as c FROM info_blocks WHERE event_id = ?').get(eventId) as { c: number };
if (existingB.c === 0) {
  bStmt.run(eventId, 'What to Pack', 'Casual clothes, one nice outfit for Saturday night, comfortable shoes. Weather in October can be unpredictable — bring a light jacket.', '🎒', 0);
  bStmt.run(eventId, 'Getting There', 'The house is about 45 minutes from the airport. We recommend renting a car or coordinating rides with people on the same flight.', '✈️', 1);
  bStmt.run(eventId, 'Parking', 'Plenty of parking at the house. Street parking is also fine.', '🚗', 2);
  bStmt.run(eventId, 'Payment', 'We\'ll collect costs after the trip — Airbnb split, group dinner, etc. Expect details after the headcount is finalized.', '💳', 3);
}

console.log('Seed complete. Event ID:', eventId);
db.close();
