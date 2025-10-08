const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static frontend files
app.use(express.static(__dirname));

// Database setup
const db = new sqlite3.Database('barterx.db', (err) => {
  if (err) console.error('Database opening error:', err);
});

// Automatically create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    owner TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_listing INTEGER,
    to_listing INTEGER,
    status TEXT
  )`);
});

// Default route to serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- LISTINGS API ---

// Get all listings
app.get('/listings', (req, res) => {
  db.all('SELECT * FROM listings', [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(rows);
  });
});

// Add a new listing
app.post('/listings', (req, res) => {
  const { title, description, owner } = req.body;
  db.run(
    `INSERT INTO listings (title, description, owner) VALUES (?, ?, ?)`,
    [title, description, owner],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ listingId: this.lastID });
    }
  );
});

// --- TRADES API ---

// Propose a trade
app.post('/trades', (req, res) => {
  const { from_listing, to_listing } = req.body;
  db.run(
    `INSERT INTO trades (from_listing, to_listing, status) VALUES (?, ?, 'pending')`,
    [from_listing, to_listing],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ tradeId: this.lastID });
    }
  );
});

// Update trade status (accept/reject)
app.post('/trades/:id/status', (req, res) => {
  const { status } = req.body;
  db.run(
    `UPDATE trades SET status = ? WHERE id = ?`,
    [status, req.params.id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ BarterX server running on port ${PORT}`));
