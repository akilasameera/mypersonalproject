# Hybrid Supabase + VPS Deployment Guide

This guide explains how to deploy your application using **both Supabase and your VPS**.

## Architecture Overview

### Supabase (Cloud)
- **Authentication** - User login, registration, JWT tokens
- **Light Tables** - profiles, projects, links, todos (small, fast data)
- **Real-time Updates** - Live data synchronization

### VPS (Your Server)
- **Heavy Tables** - notes, attachments, meetings, transcripts, summaries, knowledge base
- **File Storage** - Document uploads, PDFs, images
- **Custom APIs** - Business logic, integrations

## Why Hybrid?

- **Cost Effective** - Supabase free tier + VPS storage
- **Performance** - Light data in cloud, heavy data local
- **Control** - Full control over sensitive/large data
- **Scalability** - Easy to balance load

---

## Part 1: Supabase Setup (Already Done)

Your Supabase is already configured with:
- URL: `https://ifllwtljorvgcnthicuy.supabase.co`
- Authentication enabled
- Light tables created

✅ **No action needed**

---

## Part 2: VPS MySQL Setup

### Step 1: Connect to Your VPS via SSH

```bash
ssh username@mypersonalprojects.com
```

### Step 2: Install MySQL (if not installed)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server -y

# CentOS/RHEL
sudo yum install mysql-server -y
```

### Step 3: Secure MySQL

```bash
sudo mysql_secure_installation
```

Set root password and answer 'Y' to all security questions.

### Step 4: Create Database and User

```bash
sudo mysql -u root -p
```

Then run:

```sql
-- Create database
CREATE DATABASE projectmanager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (replace 'your_password' with a strong password)
CREATE USER 'projectmanager'@'localhost' IDENTIFIED BY 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON projectmanager.* TO 'projectmanager'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

### Step 5: Import Database Schema

Upload the schema file to your VPS:

```bash
# On your local machine
scp backend/schema/vps_schema.sql username@mypersonalprojects.com:/tmp/
```

Then on your VPS:

```bash
mysql -u projectmanager -p projectmanager < /tmp/vps_schema.sql
```

---

## Part 3: Backend Deployment

### Step 1: Upload Backend Files

From your local machine:

```bash
# Navigate to your project directory
cd /path/to/project

# Upload backend to VPS
scp -r backend/* username@mypersonalprojects.com:/var/www/mypersonalprojects.com/backend/
```

### Step 2: Set File Permissions

On your VPS:

```bash
cd /var/www/mypersonalprojects.com/backend

# Set correct ownership (replace 'www-data' with your web server user)
sudo chown -R www-data:www-data .

# Set directory permissions
sudo find . -type d -exec chmod 755 {} \;

# Set file permissions
sudo find . -type f -exec chmod 644 {} \;

# Create uploads directory if it doesn't exist
mkdir -p uploads/attachments
sudo chmod 775 uploads/attachments
```

### Step 3: Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
sudo nano /var/www/mypersonalprojects.com/backend/.env
```

Add these variables (replace with your actual values):

```env
# VPS Database
VPS_DB_HOST=localhost
VPS_DB_NAME=projectmanager
VPS_DB_USER=projectmanager
VPS_DB_PASS=your_mysql_password_here

# Supabase (for JWT verification)
VITE_SUPABASE_URL=https://ifllwtljorvgcnthicuy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbGx3dGxqb3J2Z2NudGhpY3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDE5NDIsImV4cCI6MjA2OTU3Nzk0Mn0.mbKCd-EKcaQWn2zmzwPeep190TS5XIkni2cMu57Fzr0
```

### Step 4: Load Environment Variables in PHP

Update `/var/www/mypersonalprojects.com/backend/config/vps_database.php`:

```php
<?php
// Load .env file
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            putenv(trim($line));
        }
    }
}

$vps_host = getenv('VPS_DB_HOST') ?: 'localhost';
$vps_dbname = getenv('VPS_DB_NAME') ?: 'projectmanager';
$vps_user = getenv('VPS_DB_USER') ?: 'projectmanager';
$vps_pass = getenv('VPS_DB_PASS') ?: '';

try {
    $vps_db = new PDO(
        "mysql:host=$vps_host;dbname=$vps_dbname;charset=utf8mb4",
        $vps_user,
        $vps_pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch(PDOException $e) {
    error_log("VPS DB Connection failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

return $vps_db;
```

### Step 5: Test Backend Connection

Create a test file:

```bash
sudo nano /var/www/mypersonalprojects.com/backend/test.php
```

Add:

```php
<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/vps_database.php';

try {
    $stmt = $vps_db->query("SELECT 1 as test");
    $result = $stmt->fetch();
    echo json_encode([
        'status' => 'success',
        'message' => 'Database connection successful',
        'test' => $result
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
```

Test it:

```bash
curl https://mypersonalprojects.com/backend/test.php
```

Expected output:
```json
{"status":"success","message":"Database connection successful","test":{"test":"1"}}
```

---

## Part 4: Frontend Configuration

Your frontend is already configured correctly with:

```javascript
// src/config.ts
export const config = {
  supabaseUrl: 'https://ifllwtljorvgcnthicuy.supabase.co',
  supabaseAnonKey: '...',
  vpsApiUrl: 'https://mypersonalprojects.com/backend/api',
}
```

The frontend will:
1. **Authenticate with Supabase** - Get JWT token
2. **Send JWT to VPS** - VPS verifies token with Supabase
3. **Access VPS data** - Read/write heavy tables on VPS

---

## Part 5: How It Works

### User Login Flow

```
1. User enters email/password
   ↓
2. Frontend → Supabase Auth
   ↓
3. Supabase returns JWT token
   ↓
4. Frontend stores token in localStorage
```

### Data Access Flow

```
For light data (projects, todos):
Frontend → Supabase → Return data

For heavy data (notes, meetings):
Frontend → VPS Backend (with JWT) → VPS verifies JWT with Supabase → Return data
```

### JWT Verification on VPS

Your VPS backend (`utils/supabase_auth.php`) automatically:
1. Extracts JWT from `Authorization: Bearer {token}` header
2. Calls Supabase API to verify token
3. Returns user ID if valid
4. All API endpoints use this to secure access

---

## Part 6: API Endpoints

### VPS Endpoints

**Base URL:** `https://mypersonalprojects.com/backend/api`

#### VPS Notes
- `GET /vps-notes?project_id={id}` - Get project notes
- `GET /vps-notes?id={id}` - Get specific note
- `POST /vps-notes` - Create note
- `PUT /vps-notes` - Update note
- `DELETE /vps-notes` - Delete note

#### VPS Configurations
- `GET /vps-configurations?project_id={id}` - Get configuration
- `POST /vps-configurations` - Create/update configuration
- `PUT /vps-configurations` - Update configuration
- `DELETE /vps-configurations` - Delete configuration

**All endpoints require:**
```http
Authorization: Bearer {supabase_jwt_token}
Content-Type: application/json
```

---

## Part 7: Monitoring & Maintenance

### Check MySQL Status

```bash
sudo systemctl status mysql
```

### View MySQL Logs

```bash
sudo tail -f /var/log/mysql/error.log
```

### Check Disk Space

```bash
df -h
```

### Database Backup

```bash
# Backup
mysqldump -u projectmanager -p projectmanager > backup_$(date +%Y%m%d).sql

# Restore
mysql -u projectmanager -p projectmanager < backup_20251015.sql
```

### PHP Error Logs

```bash
sudo tail -f /var/log/apache2/error.log
# or
sudo tail -f /var/log/nginx/error.log
```

---

## Part 8: Security Checklist

- ✅ MySQL root password set
- ✅ Dedicated MySQL user with limited privileges
- ✅ `.env` file protected (not web accessible)
- ✅ CORS configured properly
- ✅ JWT verification on all VPS endpoints
- ✅ SQL injection prevention (prepared statements)
- ✅ HTTPS enabled (SSL certificate)
- ✅ File upload directory permissions set correctly

---

## Part 9: Troubleshooting

### Issue: "Database connection failed"

**Check:**
1. MySQL is running: `sudo systemctl status mysql`
2. Database exists: `sudo mysql -e "SHOW DATABASES;"`
3. User has access: `sudo mysql -e "SHOW GRANTS FOR 'projectmanager'@'localhost';"`
4. Password is correct in `.env` file

### Issue: "Invalid or expired token"

**Check:**
1. Supabase URL and key are correct in backend `.env`
2. User is logged in (token exists in frontend)
3. Token hasn't expired (check Supabase dashboard for token lifetime)

### Issue: "CORS error"

**Check:**
1. `backend/config/cors.php` is included in all API files
2. Apache/Nginx is configured to allow CORS headers
3. Frontend URL is in allowed origins

### Issue: "File upload failed"

**Check:**
1. Upload directory exists: `backend/uploads/attachments`
2. Permissions: `sudo chmod 775 backend/uploads/attachments`
3. Ownership: `sudo chown www-data:www-data backend/uploads/attachments`
4. PHP upload limits in `php.ini`:
   ```ini
   upload_max_filesize = 50M
   post_max_size = 50M
   ```

---

## Part 10: Next Steps

1. ✅ **Test the hybrid setup** - Create a project, add notes, upload files
2. ✅ **Monitor performance** - Check database and API response times
3. ✅ **Set up automated backups** - Daily MySQL backups
4. ✅ **Configure monitoring** - Set up alerts for server issues
5. ✅ **Optimize queries** - Add indexes for frequently accessed data

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. View backend error logs
3. Test database connection with `test.php`
4. Verify Supabase is accessible

---

**Your hybrid architecture is now complete!** 🎉

Supabase handles auth and light data, your VPS handles heavy data and files.
