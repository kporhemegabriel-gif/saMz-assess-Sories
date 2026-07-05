import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'products.db');

let dbInstance = null;

export function getDatabase() {
  if (!dbInstance) {
    dbInstance = new Database(dbPath);
    dbInstance.pragma('journal_mode = WAL');
    console.log('✅ Database connected:', dbPath);
  }
  return dbInstance;
}

export function initDatabase() {
  const db = getDatabase();

  try {
    // Create products table
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        imageData TEXT,
        createdAt INTEGER,
        updatedAt INTEGER
      )
    `);

    // Create customers table
    db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        email TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        passwordHash TEXT NOT NULL,
        createdAt INTEGER
      )
    `);

    // Create orders table
    db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customerEmail TEXT,
        customerName TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        items TEXT NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'Pending',
        createdAt INTEGER
      )
    `);

    // Check if products exist and insert defaults if not
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM products');
    const { count } = countStmt.get();
    
    if (count === 0) {
      const defaults = [
        { id: '1', name: 'Luxury Amethyst Crystal Wristlet', category: 'luxury-bracelets', price: 180 },
        { id: '2', name: 'Premium Royal Waist Bead Trio', category: 'premium-beads', price: 250 },
        { id: '3', name: 'Rose Quartz Gold Accented Bracelet', category: 'luxury-bracelets', price: 195 },
        { id: '4', name: 'Turquoise Heritage Statement Cuff', category: 'luxury-bracelets', price: 210 }
      ];
      
      const insertStmt = db.prepare(
        'INSERT INTO products (id, name, category, price, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
      );
      
      const insertMany = db.transaction((items) => {
        for (const p of items) {
          insertStmt.run(p.id, p.name, p.category, p.price, Date.now(), Date.now());
        }
      });
      
      insertMany(defaults);
      console.log('✅ Default products inserted');
    }

    console.log('✅ Database initialized successfully');
    return db;
  } catch (err) {
    console.error('❌ Database initialization error:', err);
    throw err;
  }
}
