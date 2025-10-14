#!/bin/bash

# Quick Setup Script for VPS Database
# Run this on your VPS after uploading files

echo "======================================"
echo "  VPS Database Quick Setup"
echo "======================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "⚠️  This script should be run as root"
    echo "Run: sudo bash quick_setup.sh"
    exit 1
fi

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "${YELLOW}Step 1: Installing required packages...${NC}"
apt update
apt install -y mysql-server php php-mysql php-curl php-mbstring php-json apache2

echo ""
echo "${YELLOW}Step 2: Starting services...${NC}"
systemctl start mysql
systemctl enable mysql
systemctl start apache2
systemctl enable apache2

echo ""
echo "${YELLOW}Step 3: Creating database and user...${NC}"
read -p "Enter database name [projectmanager]: " DB_NAME
DB_NAME=${DB_NAME:-projectmanager}

read -p "Enter database username [projectuser]: " DB_USER
DB_USER=${DB_USER:-projectuser}

read -sp "Enter database password: " DB_PASS
echo ""

# Create database and user
mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

echo "${GREEN}✅ Database and user created${NC}"

echo ""
echo "${YELLOW}Step 4: Creating .env file...${NC}"

read -p "Enter Supabase URL: " SUPABASE_URL
read -p "Enter Supabase Anon Key: " SUPABASE_ANON
read -sp "Enter Supabase Service Role Key (for migration): " SUPABASE_SERVICE
echo ""

# Create .env file
cat > /var/www/html/backend/.env << EOF
# VPS Database
VPS_DB_HOST=localhost
VPS_DB_NAME=$DB_NAME
VPS_DB_USER=$DB_USER
VPS_DB_PASS=$DB_PASS

# Supabase (for authentication)
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE
EOF

echo "${GREEN}✅ .env file created${NC}"

echo ""
echo "${YELLOW}Step 5: Importing database schema...${NC}"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < /var/www/html/backend/schema/vps_schema.sql

echo "${GREEN}✅ Database schema imported${NC}"

echo ""
echo "${YELLOW}Step 6: Setting permissions...${NC}"
chown -R www-data:www-data /var/www/html/backend
chmod -R 755 /var/www/html/backend

echo "${GREEN}✅ Permissions set${NC}"

echo ""
echo "${YELLOW}Step 7: Configuring Apache...${NC}"

# Enable mod_rewrite
a2enmod rewrite

# Create Apache config
cat > /etc/apache2/sites-available/api.conf << 'EOF'
<VirtualHost *:80>
    DocumentRoot /var/www/html

    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    RewriteEngine On
    RewriteRule ^api/vps-notes$ /backend/api/vps_notes.php [L]
    RewriteRule ^api/vps-configurations$ /backend/api/vps_configurations.php [L]

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
EOF

a2ensite api.conf
systemctl restart apache2

echo "${GREEN}✅ Apache configured${NC}"

echo ""
echo "${YELLOW}Step 8: Testing connection...${NC}"
php /var/www/html/backend/scripts/test_connection.php

echo ""
echo "======================================"
echo "${GREEN}✅ Setup Complete!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Run migration: php /var/www/html/backend/scripts/migrate_from_supabase.php"
echo "2. Update frontend .env with: VITE_VPS_API_URL=http://$(hostname -I | awk '{print $1}')/api"
echo "3. Set up SSL: sudo certbot --apache -d yourdomain.com"
echo ""
echo "Your API endpoints:"
echo "  http://$(hostname -I | awk '{print $1}')/api/vps-notes"
echo "  http://$(hostname -I | awk '{print $1}')/api/vps-configurations"
echo ""
