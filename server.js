import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';
import { getProducts, addProduct, deleteProduct, getCustomer, addCustomer, customerExists, addOrder, getOrder, getCustomerOrders, getOrders, updateOrderStatus } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

const upload = multer({ storage: multer.memoryStorage() });

function hashPassword(pw) {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

// ===== PRODUCTS API =====
app.get('/api/products', (req, res) => {
  try {
    const products = getProducts();
    res.json(products || []);
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
    const product = { id, name, category, price: parseFloat(price), imageData, createdAt: Date.now(), updatedAt: Date.now() };
    addProduct(product);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  try {
    deleteProduct(id);
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

  if (customerExists(email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const passwordHash = hashPassword(password);
  try {
    const customer = { email: email.toLowerCase(), name, phone, passwordHash, createdAt: Date.now() };
    addCustomer(customer);
    res.json({ success: true, email: email.toLowerCase(), name });
  } catch (err) {
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
    const customer = getCustomer(email);
    if (!customer || customer.passwordHash !== passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ success: true, name: customer.name, email: customer.email });
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
    const order = { id, customerEmail: email.toLowerCase(), customerName: name, phone, address, items, total: parseFloat(total), status: 'Pending', createdAt: Date.now() };
    addOrder(order);
    res.json({ id, status: 'Pending' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  try {
    const order = getOrder(id.toUpperCase());
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/customer/:email', (req, res) => {
  const { email } = req.params;
  try {
    const orders = getCustomerOrders(email);
    res.json(orders || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/orders', (req, res) => {
  try {
    const orders = getOrders();
    res.json(orders || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Missing status' });

  try {
    updateOrderStatus(id.toUpperCase(), status);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`🛍️  SaMzcaccesSories running on http://localhost:${port}`);
});
