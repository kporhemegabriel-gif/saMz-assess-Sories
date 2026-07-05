console.log('[START] Initializing server...');

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, getProducts, addProduct, deleteProduct, getCustomer, addCustomer, customerExists, addOrder, getOrder, getCustomerOrders, getOrders, updateOrderStatus } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({ storage: multer.memoryStorage() });

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ===== PRODUCTS API =====
app.get('/api/products', async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products || []);
  } catch (err) {
    console.error('[ERROR] GET /api/products:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const { name, category, price } = req.body;
    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const id = uuid();
    let imageData = null;
    if (req.file) {
      imageData = req.file.buffer.toString('base64');
    }
    const product = { id, name, category, price: parseFloat(price), imageData, createdAt: Date.now(), updatedAt: Date.now() };
    const saved = await addProduct(product);
    res.json(saved);
  } catch (err) {
    console.error('[ERROR] POST /api/products:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await deleteProduct(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[ERROR] DELETE /api/products:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== CUSTOMER AUTH API =====
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const exists = await customerExists(email);
    if (exists) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const passwordHash = hashPassword(password);
    const customer = { email: email.toLowerCase(), name, phone, passwordHash, createdAt: Date.now() };
    const saved = await addCustomer(customer);
    res.json({ success: true, email: email.toLowerCase(), name });
  } catch (err) {
    console.error('[ERROR] POST /api/auth/register:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    const passwordHash = hashPassword(password);
    const customer = await getCustomer(email);
    if (!customer || customer.passwordHash !== passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ success: true, name: customer.name, email: customer.email });
  } catch (err) {
    console.error('[ERROR] POST /api/auth/login:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== ORDERS API =====
app.post('/api/orders', async (req, res) => {
  try {
    const { name, email, phone, address, items, total } = req.body;
    if (!name || !phone || !address || !items || !total) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const id = 'SZA-' + Math.floor(1000 + Math.random() * 9000);
    const order = { id, customerEmail: email.toLowerCase(), customerName: name, phone, address, items, total: parseFloat(total), status: 'Pending', createdAt: Date.now() };
    const saved = await addOrder(order);
    res.json({ id, status: 'Pending' });
  } catch (err) {
    console.error('[ERROR] POST /api/orders:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await getOrder(req.params.id.toUpperCase());
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('[ERROR] GET /api/orders/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/customer/:email', async (req, res) => {
  try {
    const orders = await getCustomerOrders(req.params.email);
    res.json(orders || []);
  } catch (err) {
    console.error('[ERROR] GET /api/orders/customer/:email:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await getOrders();
    res.json(orders || []);
  } catch (err) {
    console.error('[ERROR] GET /api/admin/orders:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Missing status' });
    await updateOrderStatus(req.params.id.toUpperCase(), status);
    res.json({ success: true });
  } catch (err) {
    console.error('[ERROR] PATCH /api/admin/orders/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ===== START SERVER =====
async function start() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    app.listen(port, '0.0.0.0', () => {
      console.log(`
╔════════════════════════════════════════╗
║  ✅ SERVER STARTED SUCCESSFULLY        ║
║  🛍️  SaMzcaccesSories                   ║
║  🌐 Listening on 0.0.0.0:${port}             ║
║  📊 MongoDB Connected                  ║
║  ⏰ ${new Date().toISOString()}    ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('[FATAL ERROR]', err);
    process.exit(1);
  }
}

start();
