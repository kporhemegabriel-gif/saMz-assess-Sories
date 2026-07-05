import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';
import { initDatabase, getDatabase } from './db-init.js';
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

// Initialize database
initDatabase();
const db = getDatabase();

// Helper: hash password
function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

// ===== PRODUCTS API =====
app.get('/api/products', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM products ORDER BY createdAt DESC');
    const rows = stmt.all();
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

  try {
    const stmt = db.prepare(
      'INSERT INTO products (id, name, category, price, imageData, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run(id, name, category, parseFloat(price), imageData, Date.now(), Date.now());
    res.json({ id, name, category, price, imageData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    stmt.run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CUSTOMER AUTH API =====
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const passwordHash = hashPassword(password);
  try {
    const stmt = db.prepare(
      'INSERT INTO customers (email, name, phone, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(email.toLowerCase(), name, phone, passwordHash, Date.now());
    res.json({ success: true, email: email.toLowerCase(), name });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  const passwordHash = hashPassword(password);
  try {
    const stmt = db.prepare(
      'SELECT name, email FROM customers WHERE email = ? AND passwordHash = ?'
    );
    const row = stmt.get(email.toLowerCase(), passwordHash);
    if (!row) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ success: true, name: row.name, email: row.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ORDERS API =====
app.post('/api/orders', (req, res) => {
  const { name, email, phone, address, items, total } = req.body;
  if (!name || !phone || !address || !items || !total) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = 'SZA-' + Math.floor(1000 + Math.random() * 9000);
  try {
    const stmt = db.prepare(
      'INSERT INTO orders (id, customerEmail, customerName, phone, address, items, total, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run(id, email.toLowerCase(), name, phone, address, items, parseFloat(total), 'Pending', Date.now());
    res.json({ id, status: 'Pending' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
    const row = stmt.get(id.toUpperCase());
    if (!row) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/customer/:email', (req, res) => {
  const { email } = req.params;
  try {
    const stmt = db.prepare(
      'SELECT * FROM orders WHERE customerEmail = ? ORDER BY createdAt DESC'
    );
    const rows = stmt.all(email.toLowerCase());
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: get all orders
app.get('/api/admin/orders', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC');
    const rows = stmt.all();
    res.json(rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: update order status
app.patch('/api/admin/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Missing status' });

  try {
    const stmt = db.prepare(
      'UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?'
    );
    stmt.run(status, Date.now(), id.toUpperCase());
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`🛍️  SaMzcaccesSories running on http://localhost:${port}`);
});
