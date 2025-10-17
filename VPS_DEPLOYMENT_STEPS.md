# VPS Deployment Step-by-Step Guide

## Overview
This guide will walk you through deploying your Project Manager application to your VPS at mypersonalprojects.com.

---

## STEP 1: Prepare Your VPS Database

### 1.1 Access phpMyAdmin
1. Go to your CloudPanel: `https://www.mypersonalprojects.com:8443`
2. Login with your credentials
3. Click on your site `www.mypersonalprojects.com`
4. Click on "Databases" in the left menu
5. Click "phpMyAdmin" button

### 1.2 Import the Database Schema
1. In phpMyAdmin, select the `project_manager` database from the left sidebar
2. Click on the "SQL" tab at the top
3. Open the file: `backend/schema/vps_schema.sql` from your project
4. Copy all the SQL content
5. Paste it into the SQL query box in phpMyAdmin
6. Click "Go" button at the bottom right
7. You should see: "X rows affected" messages confirming success

### 1.3 Verify Tables Were Created
1. In phpMyAdmin, click on the `project_manager` database in left sidebar
2. You should now see these tables:
   - users
   - projects
   - todos
   - links
   - notes
   - attachments
   - meetings
   - meeting_transcripts
   - meeting_summaries
   - meeting_todos
   - knowledge_topics
   - knowledge_sections
   - knowledge_tiles
   - project_configurations
   - configurator_blocks

---

## STEP 2: Upload Backend Files to VPS

### 2.1 Access File Manager
1. In CloudPanel, go to your site `www.mypersonalprojects.com`
2. Click "File Manager" in the left menu
3. Navigate to: `/home/projectman/htdocs/www.mypersonalprojects.com/backend`

### 2.2 Update Configuration Files

**File 1: `/backend/.env`**
1. Create or edit the `.env` file
2. Add these contents:
```
VPS_DB_HOST=127.0.0.1
VPS_DB_NAME=project_manager
VPS_DB_USER=project_user
VPS_DB_PASS=projectmanager2025!
```

**File 2: `/backend/config/database.php`**
1. Open `database.php` in the File Manager editor
2. Replace the entire content with the updated version from your local project
3. Make sure it includes the `loadEnv()` function at the top
4. Save the file

### 2.3 Upload All Backend Files
You need to upload/update these files and folders:
- `/backend/api/` (all PHP files)
- `/backend/config/` (all PHP files)
- `/backend/utils/` (all PHP files)
- `/backend/schema/` (SQL files)
- `/backend/.env` (environment variables)

**Option A: Upload via File Manager**
1. In CloudPanel File Manager, navigate to each folder
2. Click "Upload" button
3. Select the corresponding file from your local project
4. Confirm overwrite if prompted

**Option B: Upload via FTP**
1. Use FileZilla or similar FTP client
2. Connect to your VPS:
   - Host: www.mypersonalprojects.com
   - Port: 21 (or 22 for SFTP)
   - Use your CloudPanel credentials
3. Navigate to `/home/projectman/htdocs/www.mypersonalprojects.com/`
4. Upload the entire `backend` folder

---

## STEP 3: Test Backend API

### 3.1 Test Database Connection
1. Open browser and go to: `https://www.mypersonalprojects.com/backend/test.php`
2. You should see JSON response with:
   ```json
   {
     "status": "success",
     "message": "VPS backend is working!",
     "database_connected": true,
     "database_name": "project_manager"
   }
   ```

### 3.2 Test User Registration
1. Open Postman or use browser console
2. Send POST request to: `https://www.mypersonalprojects.com/backend/api/auth.php`
3. Request body (JSON):
   ```json
   {
     "email": "test@example.com",
     "password": "test123456",
     "name": "Test User"
   }
   ```
4. You should receive:
   ```json
   {
     "success": true,
     "message": "Account created successfully",
     "data": {
       "user": {...},
       "token": "..."
     }
   }
   ```

### 3.3 Test Login
1. Send POST request to: `https://www.mypersonalprojects.com/backend/api/auth.php`
2. Request body:
   ```json
   {
     "email": "test@example.com",
     "password": "test123456"
   }
   ```
3. Save the token from the response

---

## STEP 4: Deploy Frontend

### 4.1 Build Production Frontend
On your local machine:
1. Open terminal in project root
2. Run: `npm run build`
3. This creates a `dist` folder with optimized files

### 4.2 Upload Frontend Files
1. In CloudPanel File Manager, navigate to: `/home/projectman/htdocs/www.mypersonalprojects.com/`
2. Create a new folder called `app` (if it doesn't exist)
3. Upload all files from your local `dist` folder to the `app` folder:
   - `index.html`
   - `assets/` folder (contains CSS and JS files)

### 4.3 Configure Web Server
1. In CloudPanel, go to your site settings
2. Set document root to: `/home/projectman/htdocs/www.mypersonalprojects.com/app`
3. OR create an `.htaccess` file in the root with:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Redirect /app to /app/ (with trailing slash)
  RewriteRule ^app$ /app/ [R=301,L]

  # Serve the React app for /app routes
  RewriteCond %{REQUEST_URI} ^/app/
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^app/(.*)$ /app/index.html [L]
</IfModule>
```

---

## STEP 5: Access Your Application

### 5.1 Open the Application
1. Go to: `https://www.mypersonalprojects.com/app/`
2. You should see your login page

### 5.2 Create Your Account
1. Click "Sign Up" or "Register"
2. Enter your email, password, and name
3. Click "Create Account"
4. You should be logged in automatically

### 5.3 Verify Functionality
Test each feature:
- Create a new project
- Add todos to the project
- Add notes
- Add links
- Check calendar view
- Verify all data is saving

---

## STEP 6: Troubleshooting

### Issue: "Database connection failed"
**Solution:**
1. Verify `.env` file has correct credentials
2. Check database user permissions in phpMyAdmin
3. Verify database name is `project_manager`

### Issue: "CORS errors in browser"
**Solution:**
1. Check `backend/config/cors.php` exists
2. Verify it includes:
   ```php
   header('Access-Control-Allow-Origin: *');
   header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
   header('Access-Control-Allow-Headers: Content-Type, Authorization');
   ```

### Issue: "404 Not Found" for API calls
**Solution:**
1. Verify `.htaccess` file exists in `/backend/` folder
2. Check Apache mod_rewrite is enabled in CloudPanel
3. Verify file paths are correct

### Issue: Frontend shows blank page
**Solution:**
1. Check browser console for errors
2. Verify `VITE_VPS_API_URL` is set correctly
3. Make sure files uploaded to correct directory
4. Clear browser cache and hard refresh (Ctrl+F5)

---

## STEP 7: Final Verification Checklist

- [ ] Database `project_manager` exists
- [ ] All tables created successfully (15 tables)
- [ ] Backend `.env` file configured
- [ ] Test endpoint returns success
- [ ] User registration works
- [ ] User login works
- [ ] Frontend files uploaded
- [ ] Application loads in browser
- [ ] Can create projects
- [ ] Can add todos
- [ ] Can add notes
- [ ] All data persists after refresh

---

## Environment Variables Reference

### Backend `.env` (on VPS)
```
VPS_DB_HOST=127.0.0.1
VPS_DB_NAME=project_manager
VPS_DB_USER=project_user
VPS_DB_PASS=projectmanager2025!
```

### Frontend `.env` (local - for building)
```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbGx3dGxqb3J2Z2NudGhpY3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDE5NDIsImV4cCI6MjA2OTU3Nzk0Mn0.mbKCd-EKcaQWn2zmzwPeep190TS5XIkni2cMu57Fzr0
VITE_SUPABASE_URL=https://ifllwtljorvgcnthicuy.supabase.co
VITE_VPS_API_URL=https://www.mypersonalprojects.com/backend/api
```

---

## Support

If you encounter any issues:
1. Check CloudPanel error logs
2. Check PHP error logs in CloudPanel
3. Check browser console for JavaScript errors
4. Verify all file permissions are correct (644 for files, 755 for directories)

---

## Next Steps After Deployment

1. **Secure your API**: Add rate limiting and IP whitelisting
2. **Setup SSL**: Ensure HTTPS is working (CloudPanel usually handles this)
3. **Configure backups**: Set up automated database backups in CloudPanel
4. **Monitor performance**: Check server resources and optimize as needed
5. **Add custom domain**: If using a different domain, update DNS settings
