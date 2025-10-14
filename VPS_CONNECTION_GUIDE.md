# Complete VPS Connection & Migration Guide

This guide walks you through connecting your project to Hostinger VPS and migrating all data.

## Step 1: Access Your Hostinger VPS

### SSH into VPS
```bash
ssh root@your-vps-ip-address
# Enter your password when prompted
```

Or use Hostinger's web-based SSH terminal in your hosting panel.

## Step 2: Install Required Software

### Install MySQL/MariaDB
```bash
sudo apt update
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql
```

### Install PHP and Extensions
```bash
sudo apt install php php-mysql php-curl php-mbstring php-json -y
php -v  # Verify installation
```

### Install Apache or Nginx
For Apache:
```bash
sudo apt install apache2 -y
sudo systemctl start apache2
sudo systemctl enable apache2
```

For Nginx:
```bash
sudo apt install nginx php-fpm -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 3: Set Up MySQL Database

### Secure MySQL (Important!)
```bash
sudo mysql_secure_installation
```
- Set root password
- Remove anonymous users: Yes
- Disallow root login remotely: Yes
- Remove test database: Yes
- Reload privilege tables: Yes

### Create Database
```bash
mysql -u root -p
```

Then run:
```sql
CREATE DATABASE projectmanager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'projectuser'@'localhost' IDENTIFIED BY 'your_strong_password_here';
GRANT ALL PRIVILEGES ON projectmanager.* TO 'projectuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Step 4: Upload Project Files to VPS

### Option A: Using FTP/SFTP (FileZilla)
1. Open FileZilla
2. Host: `your-vps-ip`
3. Username: `root`
4. Password: your password
5. Port: `22`
6. Upload the `backend` folder to `/var/www/html/`

### Option B: Using Git
```bash
cd /var/www/html
git clone https://your-repo-url.git
cd your-project-name
```

### Option C: Using SCP from your computer
```bash
scp -r ./backend root@your-vps-ip:/var/www/html/
```

## Step 5: Configure Backend

### Create .env file
```bash
cd /var/www/html/backend
nano .env
```

Add this content:
```env
# VPS Database
VPS_DB_HOST=localhost
VPS_DB_NAME=projectmanager
VPS_DB_USER=projectuser
VPS_DB_PASS=your_strong_password_here

# Supabase (for auth)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Save with: `Ctrl+X`, then `Y`, then `Enter`

### Import Database Schema
```bash
mysql -u projectuser -p projectmanager < /var/www/html/backend/schema/vps_schema.sql
```

### Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/html/backend
sudo chmod -R 755 /var/www/html/backend
```

## Step 6: Configure Web Server

### For Apache

Create virtual host:
```bash
sudo nano /etc/apache2/sites-available/api.conf
```

Add:
```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    DocumentRoot /var/www/html

    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # API Rewrites
    RewriteEngine On
    RewriteRule ^api/vps-notes$ /backend/api/vps_notes.php [L]
    RewriteRule ^api/vps-configurations$ /backend/api/vps_configurations.php [L]

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

Enable and restart:
```bash
sudo a2enmod rewrite
sudo a2ensite api.conf
sudo systemctl restart apache2
```

### For Nginx

Edit config:
```bash
sudo nano /etc/nginx/sites-available/default
```

Add inside `server` block:
```nginx
location ~ ^/api/vps-(notes|configurations)$ {
    rewrite ^/api/vps-notes$ /backend/api/vps_notes.php last;
    rewrite ^/api/vps-configurations$ /backend/api/vps_configurations.php last;
}

location ~ \.php$ {
    include snippets/fastcgi-php.conf;
    fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
}
```

Restart:
```bash
sudo systemctl restart nginx
```

## Step 7: Test Connection

### Run Test Script
```bash
cd /var/www/html/backend/scripts
php test_connection.php
```

You should see:
```
✅ Connection successful!
✅ All tables exist
```

### Test API Endpoint
From your local computer:
```bash
curl http://your-vps-ip/api/vps-notes?project_id=test
```

Or visit in browser: `http://your-vps-ip/api/vps-notes?project_id=test`

Expected response: `{"error":"No authorization token provided"}` (This is good! Auth is working)

## Step 8: Migrate Data from Supabase

### Get Supabase Service Role Key
1. Go to Supabase Dashboard
2. Settings > API
3. Copy "service_role" key (NOT anon key)
4. Add to backend/.env as `SUPABASE_SERVICE_ROLE_KEY`

### Run Migration
```bash
cd /var/www/html/backend/scripts
php migrate_from_supabase.php
```

This will:
- Export all data from Supabase
- Import into VPS MySQL
- Show progress for each table

## Step 9: Configure Frontend

### Update .env in your frontend
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_VPS_API_URL=http://your-vps-ip/api
```

For production with domain:
```env
VITE_VPS_API_URL=https://yourdomain.com/api
```

## Step 10: Set Up SSL (Production)

### Install Certbot
```bash
sudo apt install certbot python3-certbot-apache -y  # For Apache
# OR
sudo apt install certbot python3-certbot-nginx -y  # For Nginx
```

### Get SSL Certificate
```bash
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com  # Apache
# OR
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com  # Nginx
```

Update frontend .env:
```env
VITE_VPS_API_URL=https://yourdomain.com/api
```

## Troubleshooting

### Can't connect to MySQL
```bash
sudo systemctl status mysql
sudo systemctl restart mysql
mysql -u root -p -e "SHOW DATABASES;"
```

### Permission denied errors
```bash
sudo chown -R www-data:www-data /var/www/html/backend
sudo chmod -R 755 /var/www/html/backend
```

### API returns 404
Check Apache/Nginx config:
```bash
# Apache
sudo apache2ctl configtest
sudo tail -f /var/log/apache2/error.log

# Nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### PHP errors
Enable error display temporarily:
```bash
sudo nano /etc/php/8.1/apache2/php.ini  # or fpm/php.ini for Nginx
```

Change:
```ini
display_errors = On
error_reporting = E_ALL
```

Restart:
```bash
sudo systemctl restart apache2  # or php8.1-fpm for Nginx
```

### Can't run migration script
Check you have service_role key:
```bash
grep SUPABASE_SERVICE_ROLE_KEY /var/www/html/backend/.env
```

### CORS errors from frontend
Make sure cors.php is included in all API files and Apache/Nginx allows headers.

## Security Checklist

- [ ] Changed default MySQL root password
- [ ] Created separate database user (not root)
- [ ] Set up firewall: `sudo ufw allow 80,443/tcp`
- [ ] Disabled PHP error display in production
- [ ] Set up SSL certificate
- [ ] Changed all default passwords
- [ ] Keep system updated: `sudo apt update && sudo apt upgrade`

## Next Steps

1. Build your frontend: `npm run build`
2. Deploy dist folder to VPS
3. Point your domain to VPS IP
4. Monitor logs regularly
5. Set up automated backups

## Quick Commands Reference

```bash
# Check services
sudo systemctl status mysql
sudo systemctl status apache2  # or nginx

# View logs
sudo tail -f /var/log/mysql/error.log
sudo tail -f /var/log/apache2/error.log  # or /var/log/nginx/error.log

# Restart services
sudo systemctl restart mysql
sudo systemctl restart apache2  # or nginx

# Test database
mysql -u projectuser -p projectmanager -e "SHOW TABLES;"

# View environment
cat /var/www/html/backend/.env
```

Your VPS is now fully configured and ready to handle all your project data!
