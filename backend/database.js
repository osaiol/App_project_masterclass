const { Pool } = require('pg');
const bcrypt = require('bcrypt');

let pool;

async function initDB() {
  if (!process.env.DATABASE_URL) {
    console.warn("WARNING: No DATABASE_URL provided. App will not function properly.");
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE,
        password_hash TEXT
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        planner_name TEXT,
        contact_info TEXT,
        event_details TEXT,
        date TEXT,
        start_time TEXT,
        end_time TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default admin if not exists
    const result = await pool.query('SELECT * FROM admins WHERE username = $1', ['admin']);
    if (result.rows.length === 0) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await pool.query('INSERT INTO admins (username, password_hash) VALUES ($1, $2)', ['admin', passwordHash]);
      console.log('Default admin seeded: username: admin, password: admin123');
    }

    console.log("Connected to PostgreSQL database successfully.");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }

  return pool;
}

async function getDB() {
  if (!pool) {
    await initDB();
  }
  return pool;
}

module.exports = { initDB, getDB };
