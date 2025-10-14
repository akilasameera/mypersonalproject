# CloudPanel VPS Setup Guide

**For: mypersonalprojects.com (31.220.48.83)**

This guide shows you how to set up your backend using only the CloudPanel web interface - no SSH required!

## Prerequisites

- CloudPanel access at your VPS
- Your Supabase credentials
- All backend files

## Step-by-Step Setup

### Step 1: Create Database

1. Go to **Databases** tab in CloudPanel
2. Click **"Add Database"**
3. Fill in:
   - **Database Name**: `projectmanager`
   - **Database User**: `projectuser`
   - **Password**: [Create a strong password and save it]
4. Click **"Add"**

✅ Database created!

### Step 2: Upload Backend Files

#### Option A: Using File Manager (Recommended)

1. Go to **File Manager** tab
2. Navigate to **`htdocs`** folder
3. Click **"Add New"** → **"Upload Files"**
4. Upload the `backend.zip` file
5. Right-click on `backend.zip` → **"Extract"**
6. Delete `backend.zip` after extraction

#### Option B: Using FTP

1. Go to **SSH/FTP** tab
2. Click **"Add User"** under **FTP Users**
3. Username: `ftpuser`
4. Password: [create password]
5. Use FileZilla:
   - Host: `31.220.48.83`
   - Username: `ftpuser`
   - Password: [your password]
   - Port: `21`
6. Navigate to `/htdocs/`
7. Upload `backend` folder

### Step 3: Import Database Schema

1. Still in **Databases** tab
2. Find `projectmanager` database
3. Click **"phpMyAdmin"** button
4. In phpMyAdmin:
   - Click **"Import"** tab
   - Click **"Choose File"**
   - Navigate to: `/htdocs/backend/schema/vps_schema.sql`
   - Click **"Go"** at bottom

✅ All tables created!

### Step 4: Create .env Configuration File

1. Go to **File Manager**
2. Navigate to **`htdocs/backend/`**
3. Click **"Add New"** → **"Create File"**
4. Filename: `.env`
5. Click on `.env` to edit it
6. Paste this content (replace with your actual values):

```env
# VPS Database Configuration
VPS_DB_HOST=localhost
VPS_DB_NAME=projectmanager
VPS_DB_USER=projectuser
VPS_DB_PASS=YOUR_DATABASE_PASSWORD_FROM_STEP1

# Supabase Configuration (for authentication)
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

7. Click **"Save"**

### Step 5: Configure URL Rewriting

1. Go to **File Manager**
2. Navigate to **`htdocs`** (root folder)
3. Look for `.htaccess` file (create if doesn't exist)
4. Edit `.htaccess` and add these lines at the **top**:

```apache
RewriteEngine On

# API Routes
RewriteRule ^api/vps-notes$ /backend/api/vps_notes.php [L]
RewriteRule ^api/vps-configurations$ /backend/api/vps_configurations.php [L]

# Other existing rules below...
```

5. Click **"Save"**

### Step 6: Set Correct Permissions

1. In **File Manager**, navigate to **`htdocs/backend`**
2. Right-click on `backend` folder
3. Select **"Permissions"**
4. Set to: `755` for folders
5. Set to: `644` for files
6. Check **"Apply to subdirectories"**
7. Click **"OK"**

### Step 7: Test Database Connection

#### Using Browser

1. Go to **Terminal** (if available in CloudPanel)
   - Or create a test file

2. Create test file: `htdocs/test.php`

```php
<?php
require_once __DIR__ . '/backend/scripts/test_connection.php';
```

3. Visit in browser: `https://mypersonalprojects.com/test.php`

You should see:
```
✅ Connection successful!
✅ notes (0 records)
✅ meetings (0 records)
...
```

4. **Delete test.php after testing!**

### Step 8: Test API Endpoints

Open browser and visit:
```
https://mypersonalprojects.com/api/vps-notes?project_id=test
```

**Expected response:**
```json
{"error":"No authorization token provided"}
```

✅ This is **GOOD**! It means:
- API is working
- Authentication is required (secure!)
- Ready for your app

### Step 9: Migrate Data from Supabase

1. Go to **Terminal** in CloudPanel (or use PHP execution)

2. If Terminal available:
```bash
cd /home/mypersonalprojects/htdocs
php backend/scripts/migrate_from_supabase.php
```

3. If no Terminal, create temporary file: `htdocs/migrate.php`
```php
<?php
require_once __DIR__ . '/backend/scripts/migrate_from_supabase.php';
```

4. Visit: `https://mypersonalprojects.com/migrate.php`

5. **Delete migrate.php after running!**

### Step 10: Update Your Local Frontend

In your local project `.env` file:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_VPS_API_URL=https://mypersonalprojects.com/api
```

Then rebuild:
```bash
npm run build
```

Upload `dist` folder contents to `htdocs/` on your VPS.

## Your API Endpoints

All endpoints require: `Authorization: Bearer <supabase-jwt-token>`

### Notes API
```
GET  https://mypersonalprojects.com/api/vps-notes?project_id=xxx
GET  https://mypersonalprojects.com/api/vps-notes?id=xxx
POST https://mypersonalprojects.com/api/vps-notes
PUT  https://mypersonalprojects.com/api/vps-notes
DELETE https://mypersonalprojects.com/api/vps-notes
```

### Configurations API
```
GET  https://mypersonalprojects.com/api/vps-configurations?project_id=xxx
POST https://mypersonalprojects.com/api/vps-configurations
PUT  https://mypersonalprojects.com/api/vps-configurations
DELETE https://mypersonalprojects.com/api/vps-configurations
```

## Troubleshooting

### "Database connection failed"

1. Check database credentials in `.env`
2. Verify database exists in **Databases** tab
3. Check user has permissions

### "404 Not Found" on API

1. Check `.htaccess` exists in `htdocs/`
2. Verify RewriteEngine is On
3. Check file paths are correct

### "Permission denied"

1. Set folder permissions to `755`
2. Set file permissions to `644`
3. Ensure web server can read files

### "Invalid token"

1. Check Supabase URL in `.env`
2. Verify anon key is correct
3. User needs to be logged in

## Verify Setup Checklist

- [ ] Database `projectmanager` created
- [ ] Schema imported (11 tables)
- [ ] `.env` file created with correct credentials
- [ ] `.htaccess` configured with rewrite rules
- [ ] Permissions set correctly
- [ ] Test script shows success
- [ ] API returns auth error (good!)
- [ ] Data migrated from Supabase
- [ ] Frontend updated with VPS_API_URL

## Security Notes

✅ SSL already enabled (https://)
✅ All API requests require authentication
✅ Database separate user (not root)
✅ .env file not publicly accessible

## Next Steps

1. ✅ Backend fully operational on VPS
2. ✅ API endpoints working
3. 🔄 Build and deploy frontend
4. 🔄 Test from live app
5. 🔄 Monitor performance
6. 🔄 Set up automated backups

## Support

If you encounter issues:
1. Check **Logs** tab in CloudPanel
2. View error logs
3. Check PHP error logs
4. Review MySQL logs

Your VPS backend is now ready! All heavy data will be stored on your own server while authentication remains on Supabase.
