import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'products.db');

let dbInstance = null;

export function getDatabase() {
  if (!dbInstance) {
    dbInstance = new sqlite3.Database(dbPath, (err) => {
      if (err) console.error('Database connection error:', err);
      else console.log('Database connected');
    });
    dbInstance.configure('busyTimeout', 5000);
    dbInstance.run('PRAGMA foreign_keys = ON');
  }
  return dbInstance;
}

export async function initDatabase() {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          price REAL NOT NULL,
          imageData TEXT,
          createdAt INTEGER,
          updatedAt INTEGER
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) console.error(err);
      });

      // Create customers table
      db.run(`
        CREATE TABLE IF NOT EXISTS customers (
          email TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT,
          passwordHash TEXT NOT NULL,
          createdAt INTEGER
        )
      `, (err) => {
        if (err && !err.message.includes('already exists')) console.error(err);
      });

      // Create orders table
      db.run(`
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
      `, (err) => {
        if (err && !err.message.includes('already exists')) console.error(err);
      });

      // Check if products exist and insert defaults if not
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (err) {
          console.error('Error checking products:', err);
          resolve(db);
          return;
        }
        
        if (row.count === 0) {
          const defaults = [
            { id: '1', name: 'Luxury Amethyst Crystal Wristlet', category: 'luxury-bracelets', price: 180 },
            { id: '2', name: 'Premium Royal Waist Bead Trio', category: 'premium-beads', price: 250 },
            { id: '3', name: 'Rose Quartz Gold Accented Bracelet', category: 'luxury-bracelets', price: 195 },
            { id: '4', name: 'Turquoise Heritage Statement Cuff', category: 'luxury-bracelets', price: 210 }
          ];
          
          defaults.forEach(p => {
            db.run(
              'INSERT INTO products (id, name, category, price, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
              [p.id, p.name, p.category, p.price, Date.now(), Date.now()],
              (err) => {
                if (err) console.error('Error inserting default product:', err);
              }
            );
          });
        }
        
        resolve(db);
      });
    });
  });
}
