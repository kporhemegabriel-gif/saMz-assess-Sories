import mongoose from 'mongoose';

// MongoDB connection string (can be overridden with env variable)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://migration:migration@84.247.188.211:14002/Mydb?authSource=admin';

console.log('[DB] MongoDB URI configured:', MONGO_URI.replace(/password:[^@]+@/, 'password:***@'));

// Connect to MongoDB with Docker-optimized settings
export async function connectDB() {
  try {
    console.log('[DB] Attempting MongoDB connection...');
    
    await mongoose.connect(MONGO_URI, {
      // Docker networking options
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      maxPoolSize: 10,
      minPoolSize: 2,
      
      // Connection pool settings
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
      // Automatic reconnection
      autoIndex: true,
      family: 4 // Force IPv4 for Docker compatibility
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: Mydb`);
    console.log(`🏠 Host: 84.247.188.211:14002`);
    
    // Test connection
    const admin = mongoose.connection.db.admin();
    const status = await admin.ping();
    console.log('✅ MongoDB ping successful:', status);
    
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('📍 Connection Details:');
    console.error('   - URI:', MONGO_URI.replace(/password:[^@]+@/, 'password:***@'));
    console.error('   - Host: 84.247.188.211:14002');
    console.error('   - Database: Mydb');
    
    // Retry after 5 seconds
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(() => connectDB(), 5000);
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('⚠️ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose disconnected from MongoDB');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB connection closed on app shutdown');
  process.exit(0);
});

// ===== SCHEMAS =====
const productSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: String,
  category: String,
  price: Number,
  imageData: String,
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

const customerSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true, index: true },
  name: String,
  phone: String,
  passwordHash: String,
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  customerEmail: { type: String, lowercase: true, index: true },
  customerName: String,
  phone: String,
  address: String,
  items: String,
  total: Number,
  status: { type: String, default: 'Pending', index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

// ===== MODELS =====
export const Product = mongoose.model('Product', productSchema);
export const Customer = mongoose.model('Customer', customerSchema);
export const Order = mongoose.model('Order', orderSchema);

// ===== DATABASE FUNCTIONS =====
export async function getProducts() {
  try {
    return await Product.find().sort({ createdAt: -1 });
  } catch (err) {
    console.error('[DB ERROR] getProducts:', err.message);
    throw err;
  }
}

export async function addProduct(product) {
  try {
    const newProduct = new Product(product);
    return await newProduct.save();
  } catch (err) {
    console.error('[DB ERROR] addProduct:', err.message);
    throw err;
  }
}

export async function deleteProduct(id) {
  try {
    return await Product.deleteOne({ id });
  } catch (err) {
    console.error('[DB ERROR] deleteProduct:', err.message);
    throw err;
  }
}

export async function getCustomers() {
  try {
    return await Customer.find();
  } catch (err) {
    console.error('[DB ERROR] getCustomers:', err.message);
    throw err;
  }
}

export async function addCustomer(customer) {
  try {
    const newCustomer = new Customer(customer);
    return await newCustomer.save();
  } catch (err) {
    console.error('[DB ERROR] addCustomer:', err.message);
    throw err;
  }
}

export async function getCustomer(email) {
  try {
    return await Customer.findOne({ email: email.toLowerCase() });
  } catch (err) {
    console.error('[DB ERROR] getCustomer:', err.message);
    throw err;
  }
}

export async function customerExists(email) {
  try {
    const customer = await Customer.findOne({ email: email.toLowerCase() });
    return customer !== null;
  } catch (err) {
    console.error('[DB ERROR] customerExists:', err.message);
    throw err;
  }
}

export async function getOrders() {
  try {
    return await Order.find().sort({ createdAt: -1 });
  } catch (err) {
    console.error('[DB ERROR] getOrders:', err.message);
    throw err;
  }
}

export async function addOrder(order) {
  try {
    const newOrder = new Order(order);
    return await newOrder.save();
  } catch (err) {
    console.error('[DB ERROR] addOrder:', err.message);
    throw err;
  }
}

export async function getOrder(id) {
  try {
    return await Order.findOne({ id });
  } catch (err) {
    console.error('[DB ERROR] getOrder:', err.message);
    throw err;
  }
}

export async function updateOrderStatus(id, status) {
  try {
    return await Order.updateOne({ id }, { status, updatedAt: Date.now() });
  } catch (err) {
    console.error('[DB ERROR] updateOrderStatus:', err.message);
    throw err;
  }
}

export async function getCustomerOrders(email) {
  try {
    return await Order.find({ customerEmail: email.toLowerCase() }).sort({ createdAt: -1 });
  } catch (err) {
    console.error('[DB ERROR] getCustomerOrders:', err.message);
    throw err;
  }
}
