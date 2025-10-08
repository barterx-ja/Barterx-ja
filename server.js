const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve frontend files
app.use(express.static(__dirname));

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Database setup
const db = new sqlite3.Database('barterx.db', (err) => {
  if (err) console.error('Database opening error:', err);
});

// Listings API
app.get('/listings', (req, res) => {
  db.all('SELECT * FROM listings', [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(rows);
  });
});

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

// Trades API
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

app.post('/trades/:id/status', (req, res) => {
  const { status } = req.body; // 'accepted' or 'rejected'
  db.run(
    `UPDATE trades SET status = ? WHERE id = ?`,
    [status, req.params.id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Only one PORT declaration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

 
