# SaMzcaccesSories - Full-Stack E-Commerce Platform

Premium handcrafted beads and bracelets platform with dynamic product management.

## Features

✅ **Customer Accounts** - Register, login, password security with SHA-256 hashing
✅ **Dynamic Products** - Upload product images via admin panel, instantly visible to customers
✅ **Order Management** - Full order pipeline (Pending → Processing → Delivery → Delivered)
✅ **Admin Dashboard** - Manage orders, upload new products
✅ **Mobile Responsive** - Works seamlessly on all devices
✅ **Database Persistence** - All data persists using SQLite (D1 on JoyTree)

## File Structure

```
samz-accessories/
├── server.js          # Express backend with API routes
├── db-init.js         # Database initialization
├── package.json       # Node.js dependencies
├── public/
│   ├── index.html     # Frontend application
│   └── image_8435fe.png  # Brand logo
├── products.db        # SQLite database (generated on first run)
└── README.md          # This file
```

## API Endpoints

### Products
- `GET /api/products` - Fetch all products
- `POST /api/products` - Create new product with image (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Customer Auth
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login to account

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by reference ID
- `GET /api/orders/customer/:email` - Get customer's orders

### Admin
- `GET /api/admin/orders` - Get all orders
- `PATCH /api/admin/orders/:id` - Update order status

## Deployment to JoyTree

### Option 1: Upload to JoyTree Direct (Recommended)

1. **Prepare files**: Zip all files (server.js, db-init.js, package.json, public/)
2. **Upload to JoyTree**: 
   - Go to your JoyTree dashboard
   - Find "samz-acces-sories" project
   - Use the "Upload" feature to upload this project
   - Select "static" site type
3. **JoyTree will**: 
   - Install dependencies (`npm install`)
   - Start the server (`node server.js`)
   - Make it live at `https://samz-acces-sories.joytree.site`

### Option 2: Push via GitHub (For continuous deployment)

1. Create a GitHub repository with these files
2. On JoyTree dashboard, connect the GitHub repo
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Deploy!

## Using the Admin Panel

1. **Access Admin**: Click "Admin Desk" button on navigation
   - Password: `Samara@2026`

2. **Upload New Products**:
   - Go to "Products Catalog" tab
   - Fill in: Product Title, Category, Price
   - Select product image file
   - Click "Publish To Storefront"
   - Image appears instantly for all customers!

3. **Manage Orders**:
   - View all orders in "Manage Orders" tab
   - Update status (Pending → Processing → Out for Delivery → Delivered)
   - Send email notifications to customers

## Customer Registration

Strong password required:
- Minimum 8 characters
- At least one letter (A-Z, a-z)
- At least one number (0-9)
- At least one symbol (!, @, #, etc.)

Examples of strong passwords:
- `SecurePass123!`
- `Beads@2024Luxury`
- `MyShop#Gold88`

## Database Schema

### products
- id (TEXT, PRIMARY KEY)
- name (TEXT)
- category (TEXT) - "luxury-bracelets" or "premium-beads"
- price (REAL)
- imageData (TEXT) - Base64-encoded image
- createdAt (INTEGER)
- updatedAt (INTEGER)

### customers
- email (TEXT, PRIMARY KEY)
- name (TEXT)
- phone (TEXT)
- passwordHash (TEXT) - SHA-256 hash
- createdAt (INTEGER)

### orders
- id (TEXT, PRIMARY KEY) - Format: SZA-XXXX
- customerEmail (TEXT)
- customerName (TEXT)
- phone (TEXT)
- address (TEXT)
- items (TEXT) - Comma-separated product names
- total (REAL)
- status (TEXT) - "Pending", "Processing", "Out for Delivery", "Delivered"
- createdAt (INTEGER)

## Local Development

```bash
npm install
npm run dev  # Watch mode
# Visit http://localhost:3000
```

## Security Notes

- Passwords are hashed with SHA-256 (client-side)
- In production, use HTTPS and add server-side authentication
- Admin password should be changed from default "Samara@2026"
- Images are stored as base64 in database (can be optimized with S3/R2)

## Troubleshooting

**Products not showing**: 
- Ensure you uploaded the product with an image
- Check server logs for errors

**Orders not saving**: 
- Check database connection
- Verify form fields are filled correctly

**Images uploading but not displaying**: 
- Images are base64-encoded in database
- Browser cache may need clearing

## Support

For issues or questions about deployment to JoyTree:
- Check JoyTree documentation
- Review server logs via JoyTree dashboard
- Ensure Node.js version is 18.x

---

Built with ❤️ for SaMzcaccesSories
