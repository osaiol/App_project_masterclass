const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { initDB, getDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'super_secret_key_for_event_centre'; // In production, use process.env.JWT_SECRET

app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// --- PUBLIC ROUTES ---

// Get all non-canceled bookings (to show blocked slots on calendar)
app.get('/api/bookings', async (req, res) => {
  try {
    const db = getDB();
    const bookings = await db.all(`
      SELECT id, date, start_time, end_time, status 
      FROM bookings 
      WHERE status != 'canceled'
    `);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Submit a new booking request
app.post('/api/bookings', async (req, res) => {
  const { planner_name, contact_info, event_details, date, start_time, end_time } = req.body;
  if (!planner_name || !date || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const db = getDB();
    
    // Check for overlaps with approved bookings
    const overlapping = await db.get(`
      SELECT id FROM bookings 
      WHERE date = ? AND status = 'approved'
      AND (
        (start_time < ? AND end_time > ?) OR
        (start_time < ? AND end_time > ?) OR
        (start_time >= ? AND end_time <= ?)
      )
    `, [date, end_time, start_time, end_time, start_time, start_time, end_time]);
    
    if (overlapping) {
      return res.status(400).json({ error: 'This time slot overlaps with an approved booking.' });
    }

    const result = await db.run(`
      INSERT INTO bookings (planner_name, contact_info, event_details, date, start_time, end_time, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `, [planner_name, contact_info, event_details, date, start_time, end_time]);
    
    res.status(201).json({ id: result.lastID, message: 'Booking request submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit booking' });
  }
});

// --- ADMIN ROUTES ---

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const db = getDB();
    const admin = await db.get('SELECT * FROM admins WHERE username = ?', [username]);
    
    if (admin && await bcrypt.compare(password, admin.password_hash)) {
      const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all bookings for dashboard
app.get('/api/admin/bookings', authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    const bookings = await db.all('SELECT * FROM bookings ORDER BY date ASC, start_time ASC');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Update booking status
app.patch('/api/admin/bookings/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['pending', 'approved', 'canceled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  try {
    const db = getDB();
    await db.run('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// --- INITIALIZE SERVER ---
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database', err);
});
