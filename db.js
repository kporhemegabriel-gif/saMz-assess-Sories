import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://migration:migration@84.247.188.211:14002/Mydb?authSource=admin';

// Connect to MongoDB
export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
}

// ===== SCHEMAS =====
const productSchema = new mongoose.Schema({
  id: String,
  name: String,
  category: String,
  price: Number,
  imageData: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const customerSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  name: String,
  phone: String,
  passwordHash: String,
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  id: String,
  customerEmail: String,
  customerName: String,
  phone: String,
  address: String,
  items: String,
  total: Number,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ===== MODELS =====
export const Product = mongoose.model('Product', productSchema);
export const Customer = mongoose.model('Customer', customerSchema);
export const Order = mongoose.model('Order', orderSchema);

// ===== DATABASE FUNCTIONS =====
export async function getProducts() {
  return await Product.find().sort({ createdAt: -1 });
}

export async function addProduct(product) {
  const newProduct = new Product(product);
  return await newProduct.save();
}

export async function deleteProduct(id) {
  return await Product.deleteOne({ id });
}

export async function getCustomers() {
  return await Customer.find();
}

export async function addCustomer(customer) {
  const newCustomer = new Customer(customer);
  return await newCustomer.save();
}

export async function getCustomer(email) {
  return await Customer.findOne({ email: email.toLowerCase() });
}

export async function customerExists(email) {
  return await Customer.findOne({ email: email.toLowerCase() }) !== null;
}

export async function getOrders() {
  return await Order.find().sort({ createdAt: -1 });
}

export async function addOrder(order) {
  const newOrder = new Order(order);
  return await newOrder.save();
}

export async function getOrder(id) {
  return await Order.findOne({ id });
}

export async function updateOrderStatus(id, status) {
  return await Order.updateOne({ id }, { status, updatedAt: Date.now() });
}

export async function getCustomerOrders(email) {
  return await Order.find({ customerEmail: email.toLowerCase() }).sort({ createdAt: -1 });
}
