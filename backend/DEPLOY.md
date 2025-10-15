# Quick Backend Deployment Guide

## 1. Upload Backend to VPS

```bash
# From your local machine, navigate to your project directory
cd /path/to/your/project

# Upload backend files to VPS (replace with your SSH details)
scp -r backend/* username@mypersonalprojects.com:/var/www/mypersonalprojects.com/backend/
```

## 2. Configure Database on VPS

SSH into your VPS:
```bash
ssh username@mypersonalprojects.com
```

Create MySQL database and user:
```bash
sudo mysql -u root -p
```

Run these SQL commands:
```sql
CREATE DATABASE projectmanager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'projectmanager'@'localhost' IDENTIFIED BY 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON projectmanager.* TO 'projectmanager'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 3. Import Database Schema

```bash
# Upload schema file
scp backend/schema/vps_schema.sql username@mypersonalprojects.com:/tmp/

# Import on VPS
ssh username@mypersonalprojects.com
mysql -u projectmanager -p projectmanager < /tmp/vps_schema.sql
```

## 4. Create Backend .env File

On your VPS:
```bash
cd /var/www/mypersonalprojects.com/backend
nano .env
```

Add these variables:
```env
VPS_DB_HOST=localhost
VPS_DB_NAME=projectmanager
VPS_DB_USER=projectmanager
VPS_DB_PASS=YourSecurePassword123!

VITE_SUPABASE_URL=https://ifllwtljorvgcnthicuy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbGx3dGxqb3J2Z2NudGhpY3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDE5NDIsImV4cCI6MjA2OTU3Nzk0Mn0.mbKCd-EKcaQWn2zmzwPeep190TS5XIkni2cMu57Fzr0
```

Save with `Ctrl+O`, then `Enter`, then exit with `Ctrl+X`.

## 5. Set Permissions

```bash
cd /var/www/mypersonalprojects.com/backend

# Set ownership (replace www-data with your web server user)
sudo chown -R www-data:www-data .

# Set directory permissions
sudo find . -type d -exec chmod 755 {} \;

# Set file permissions
sudo find . -type f -exec chmod 644 {} \;

# Protect .env file
sudo chmod 600 .env

# Create uploads directory
mkdir -p uploads/attachments
sudo chmod 775 uploads/attachments
sudo chown www-data:www-data uploads/attachments
```

## 6. Test Backend

Visit in your browser or use curl:
```bash
curl https://mypersonalprojects.com/backend/test.php
```

Expected response:
```json
{
    "status": "success",
    "message": "VPS backend is working!",
    "database_connected": true,
    "database_name": "projectmanager",
    "test_query": "1"
}
```

## 7. Test VPS API Endpoint

```bash
# This requires authentication, so test from your frontend after login
# Or use a tool like Postman with a valid JWT token
```

## Troubleshooting

### "Database connection failed"
- Check MySQL is running: `sudo systemctl status mysql`
- Verify credentials in `.env` file
- Check database exists: `sudo mysql -e "SHOW DATABASES;"`

### "Permission denied" on uploads
- Run: `sudo chmod 775 backend/uploads/attachments`
- Run: `sudo chown www-data:www-data backend/uploads/attachments`

### "File not found" errors
- Ensure .htaccess is in place
- Check Apache mod_rewrite is enabled: `sudo a2enmod rewrite`
- Restart Apache: `sudo systemctl restart apache2`

## Complete! 🎉

Your hybrid Supabase + VPS backend is now deployed.

**Next Steps:**
1. Test the frontend with your VPS backend
2. Upload files and verify storage works
3. Monitor error logs for issues
