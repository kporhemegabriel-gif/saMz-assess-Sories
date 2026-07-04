import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';
import { initDatabase, getDatabase } from './db-init.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

const upload = multer({ storage: multer.memoryStorage() });

// Initialize database on startup
await initDatabase();
const db = getDatabase();

// Helper: hash password
function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

// ===== PRODUCTS API =====
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY createdAt DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

app.post('/api/products', upload.single('image'), (req, res) => {
  const { name, category, price } = req.body;
  if (!name || !category || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = uuid();
  let imageData = null;
  if (req.file) {
    imageData = req.file.buffer.toString('base64');
  }

  db.run(
    'INSERT INTO products (id, name, category, price, imageData, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name, category, parseFloat(price), imageData, Date.now(), Date.now()],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, category, price, imageData });
    }
  );
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ===== CUSTOMER AUTH API =====
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const passwordHash = hashPassword(password);
  db.run(
    'INSERT INTO customers (email, name, phone, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)',
    [email.toLowerCase(), name, phone, passwordHash, Date.now()],
    (err) => {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, email: email.toLowerCase(), name });
    }
  );
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  const passwordHash = hashPassword(password);
  db.get(
    'SELECT name, email FROM customers WHERE email = ? AND passwordHash = ?',
    [email.toLowerCase(), passwordHash],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      res.json({ success: true, name: row.name, email: row.email });
    }
  );
});

// ===== ORDERS API =====
app.post('/api/orders', (req, res) => {
  const { name, email, phone, address, items, total } = req.body;
  if (!name || !phone || !address || !items || !total) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = 'SZA-' + Math.floor(1000 + Math.random() * 9000);
  db.run(
    'INSERT INTO orders (id, customerEmail, customerName, phone, address, items, total, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, email.toLowerCase(), name, phone, address, items, parseFloat(total), 'Pending', Date.now()],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, status: 'Pending' });
    }
  );
});

app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM orders WHERE id = ?', [id.toUpperCase()], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Order not found' });
    res.json(row);
  });
});

app.get('/api/orders/customer/:email', (req, res) => {
  const { email } = req.params;
  db.all(
    'SELECT * FROM orders WHERE customerEmail = ? ORDER BY createdAt DESC',
    [email.toLowerCase()],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

// Admin: get all orders
app.get('/api/admin/orders', (req, res) => {
  // In production, add authentication here
  db.all('SELECT * FROM orders ORDER BY createdAt DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// Admin: update order status
app.patch('/api/admin/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Missing status' });

  db.run(
    'UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?',
    [status, Date.now(), id.toUpperCase()],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`🛍️  SaMzcaccesSories running on http://localhost:${port}`);
});
