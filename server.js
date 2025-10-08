const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

// Connect to SQLite database
const db = new sqlite3.Database('./database.sqlite');

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    description TEXT,
    value TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_listing INTEGER,
    to_listing INTEGER,
    status TEXT
  )`);
});

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, hashed], function(err){
    if(err) return res.status(400).json({ error: 'Email already exists' });
    res.json({ userId: this.lastID });
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if(!user) return res.status(400).json({ error: 'Invalid email or password' });
    const valid = await bcrypt.compare(password, user.password);
    if(!valid) return res.status(400).json({ error: 'Invalid email or password' });
    res.json({ userId: user.id });
  });
});

// Create listing
app.post('/listings', (req, res) => {
  const { user_id, title, description, value } = req.body;
  db.run(`INSERT INTO listings (user_id, title, description, value) VALUES (?, ?, ?, ?)`,
    [user_id, title, description, value], function(err){
      if(err) return res.status(400).json({ error: err.message });
      res.json({ listingId: this.lastID });
    });
});

// Get all listings
app.get('/listings', (req, res) => {
  db.all(`SELECT * FROM listings`, (err, rows) => {
    res.json(rows);
  });
});

// Propose trade
app.post('/trades', (req, res) => {
  const { from_listing, to_listing } = req.body;
  db.run(`INSERT INTO trades (from_listing, to_listing, status) VALUES (?, ?, 'pending')`,
    [from_listing, to_listing], function(err){
      if(err) return res.status(400).json({ error: err.message });
      res.json({ tradeId: this.lastID });
    });
});

// Accept/reject trade
app.post('/trades/:id/status', (req, res) => {
  const { status } = req.body; // 'accepted' or 'rejected'
  db.run(`UPDATE trades SET status = ? WHERE id = ?`, [status, req.params.id], function(err){
    if(err) return res.status(400).json({ error: err.message });
    res.json({ success: true });
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
