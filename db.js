import mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';

const MONGO_URI = 'mongodb://migration:migration@84.247.188.211:14002/Mydb?authSource=admin';

// Connect with exact pattern for Docker MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ===== SCHEMAS =====

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  imageData: { type: String, default: null },
  createdAt: { type: Number, default: Date.now },
  updatedAt: { type: Number, default: Date.now }
});

const customerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  phone: String,
  passwordHash: { type: String, required: true },
  createdAt: { type: Number, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerEmail: { type: String, lowercase: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  items: { type: String, required: true },
  total: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Number, default: Date.now },
  updatedAt: { type: Number, default: Date.now }
});

// ===== MODELS =====

const Product = mongoose.model('Product', productSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Order = mongoose.model('Order', orderSchema);

// ===== INITIALIZE DEFAULT PRODUCTS =====

async function initDefaultProducts() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const defaults = [
        { id: '1', name: 'Luxury Amethyst Crystal Wristlet', category: 'luxury-bracelets', price: 180 },
        { id: '2', name: 'Premium Royal Waist Bead Trio', category: 'premium-beads', price: 250 },
        { id: '3', name: 'Rose Quartz Gold Accented Bracelet', category: 'luxury-bracelets', price: 195 },
        { id: '4', name: 'Turquoise Heritage Statement Cuff', category: 'luxury-bracelets', price: 210 }
      ];
      await Product.insertMany(defaults);
      console.log('✅ Default products inserted');
    }
  } catch (err) {
    console.error('Error initializing products:', err.message);
  }
}

initDefaultProducts();

// ===== EXPORT FUNCTIONS =====

export async function getProducts() {
  try {
    return await Product.find().sort({ createdAt: -1 });
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
}

export async function addProduct(product) {
  try {
    const newProduct = new Product(product);
    return await newProduct.save();
  } catch (err) {
    console.error('Error adding product:', err);
    return null;
  }
}

export async function deleteProduct(id) {
  try {
    return await Product.deleteOne({ id });
  } catch (err) {
    console.error('Error deleting product:', err);
  }
}

export async function getCustomers() {
  try {
    return await Customer.find();
  } catch (err) {
    console.error('Error fetching customers:', err);
    return [];
  }
}

export async function addCustomer(customer) {
  try {
    const newCustomer = new Customer(customer);
    return await newCustomer.save();
  } catch (err) {
    console.error('Error adding customer:', err);
    return null;
  }
}

export async function getCustomer(email) {
  try {
    return await Customer.findOne({ email: email.toLowerCase() });
  } catch (err) {
    console.error('Error fetching customer:', err);
    return null;
  }
}

export async function customerExists(email) {
  try {
    const customer = await Customer.findOne({ email: email.toLowerCase() });
    return !!customer;
  } catch (err) {
    console.error('Error checking customer:', err);
    return false;
  }
}

export async function getOrders() {
  try {
    return await Order.find().sort({ createdAt: -1 });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return [];
  }
}

export async function addOrder(order) {
  try {
    const newOrder = new Order(order);
    return await newOrder.save();
  } catch (err) {
    console.error('Error adding order:', err);
    return null;
  }
}

export async function getOrder(id) {
  try {
    return await Order.findOne({ id });
  } catch (err) {
    console.error('Error fetching order:', err);
    return null;
  }
}

export async function updateOrderStatus(id, status) {
  try {
    return await Order.findOneAndUpdate({ id }, { status, updatedAt: Date.now() }, { new: true });
  } catch (err) {
    console.error('Error updating order:', err);
  }
}

export async function getCustomerOrders(email) {
  try {
    return await Order.find({ customerEmail: email.toLowerCase() }).sort({ createdAt: -1 });
  } catch (err) {
    console.error('Error fetching customer orders:', err);
    return [];
  }
}
