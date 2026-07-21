const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcrypt');

let db;

async function initDB() {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      planner_name TEXT,
      contact_info TEXT,
      event_details TEXT,
      date TEXT,
      start_time TEXT,
      end_time TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default admin if not exists
  const admin = await db.get('SELECT * FROM admins WHERE username = ?', ['admin']);
  if (!admin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await db.run('INSERT INTO admins (username, password_hash) VALUES (?, ?)', ['admin', passwordHash]);
    console.log('Default admin seeded: username: admin, password: admin123');
  }

  return db;
}

function getDB() {
  return db;
}

module.exports = { initDB, getDB };
