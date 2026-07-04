# 🚀 Deployment Steps for JoyTree

Follow these steps to deploy SaMzcaccesSories to your JoyTree account.

## Step 1: Prepare Files

All files are ready in this folder:
```
samz-accessories/
├── server.js
├── db-init.js
├── package.json
├── public/
│   ├── index.html
│   └── image_8435fe.png
├── .gitignore
└── README.md
```

## Step 2: Upload to JoyTree

### Method A: Direct Upload (Easiest)

1. Go to **https://joytree.site/dashboard**
2. Find your existing project: **samz-acces-sories**
3. Click **"Replace Files"** or **"Upload"**
4. Select all files from this folder (excluding node_modules/)
5. Upload and wait for build to complete

### Method B: GitHub Push (For auto-deploy)

1. Create a GitHub repository
2. Push all files:
   ```bash
   git init
   git add .
   git commit -m "Full-stack SaMzcaccesSories with database"
   git remote add origin https://github.com/YOUR-USERNAME/samz-accessories
   git push -u origin main
   ```
3. On JoyTree dashboard: Connect GitHub repo
4. Select this branch and deploy

## Step 3: Configure JoyTree

When uploading/deploying, make sure:
- **Project Name**: samz-acces-sories
- **Build Command**: `npm install` (auto-detected)
- **Start Command**: `node server.js` (or leave auto-detect)
- **Node Version**: 18.x

## Step 4: Access Your Live Site

Once deployed:
- **Live URL**: https://samz-acces-sories.joytree.site
- **Admin Login**: 
  - Button: "Admin Desk"
  - Password: `Samara@2026`

## Step 5: Upload Your First Products

1. Click **"Admin Desk"** (top right)
2. Enter password: `Samara@2026`
3. Click **"Products Catalog"** tab
4. Fill in product details:
   - Product Title: e.g., "Luxury Amethyst Bracelet"
   - Category: "Luxury Wrist Bracelets" or "Premium Custom Beads"
   - Price: GHS amount
   - Product Image: Upload a photo of your beads/bracelets
5. Click **"Publish To Storefront"**
6. **Done!** Product is now live for customers to see

## Troubleshooting

### Products not appearing?
- Check admin orders tab to see if it's loading
- Refresh the page (browser cache)
- Check JoyTree logs

### Database errors?
- First deployment: database will auto-create
- If errors persist, JoyTree support can help reset the database

### Image uploads failing?
- Max file size: ~5MB per image
- Supported formats: JPG, PNG, WebP
- Try a different browser if issues persist

## Security Reminder

⚠️ **IMPORTANT**: Change the admin password!

Once deployed:
1. Access admin panel
2. In the HTML, update line with `'Samara@2026'` 
3. Redeploy with your new password hash

(Or contact us to help you set a custom password)

## Support

Need help?
1. Check JoyTree dashboard logs
2. Review the README.md for API documentation
3. Check browser console (F12) for client-side errors

---

**Questions?** The full backend API is documented in README.md. Every product upload, customer registration, and order is stored in the SQLite database on JoyTree.

Good luck! 🎉
