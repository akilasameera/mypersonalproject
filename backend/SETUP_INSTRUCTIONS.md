# Hybrid Database Setup Instructions

This project uses a **hybrid database approach**:
- **Supabase**: Authentication, real-time data (projects, todos, links, profiles)
- **VPS MySQL**: Heavy data tables (notes, meetings, knowledge base, configurations)

## VPS Database Setup

### Step 1: Create MySQL Database

SSH into your Hostinger VPS and run:

```bash
mysql -u root -p
```

Then execute the schema:

```sql
source /path/to/backend/schema/vps_schema.sql
```

Or manually:

```bash
mysql -u root -p projectmanager < backend/schema/vps_schema.sql
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# VPS Database Configuration
VPS_DB_HOST=localhost
VPS_DB_NAME=projectmanager
VPS_DB_USER=root
VPS_DB_PASS=your_mysql_password

# Supabase Configuration (for auth verification)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Set Up PHP Environment

Make sure your VPS has:
- PHP 7.4+ with PDO MySQL extension
- MySQL 5.7+ or MariaDB 10.3+
- curl extension enabled

Install if needed:

```bash
sudo apt update
sudo apt install php php-mysql php-curl php-mbstring
```

### Step 4: Configure Apache/Nginx

**For Apache**, add to your `.htaccess` or VirtualHost:

```apache
RewriteEngine On
RewriteRule ^api/vps-notes$ backend/api/vps_notes.php [L]
RewriteRule ^api/vps-configurations$ backend/api/vps_configurations.php [L]
```

**For Nginx**, add to your server block:

```nginx
location ~ ^/api/vps-(notes|configurations)$ {
    rewrite ^/api/vps-notes$ /backend/api/vps_notes.php last;
    rewrite ^/api/vps-configurations$ /backend/api/vps_configurations.php last;
}

location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
    fastcgi_index index.php;
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
}
```

### Step 5: Test the Setup

Test VPS database connection:

```bash
curl -X GET "https://yourdomain.com/api/vps-notes?project_id=test" \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN"
```

You should get a response (empty array is fine for first test).

## Data Migration (Optional)

If you have existing data in Supabase you want to migrate:

1. Export data from Supabase:
```sql
-- In Supabase SQL Editor
SELECT * FROM notes;
SELECT * FROM project_configurations;
-- etc.
```

2. Import to VPS MySQL using the API endpoints or direct SQL INSERT statements

## Architecture Overview

### Frontend Layer
- React app connects to both databases
- Supabase Client: Auth + lightweight realtime tables
- Fetch API: Heavy tables via VPS endpoints

### Authentication Flow
1. User logs in via Supabase Auth
2. Frontend gets JWT token
3. All VPS API calls include: `Authorization: Bearer <token>`
4. VPS validates token with Supabase before processing

### Security
- All VPS endpoints verify Supabase JWT tokens
- User ID is extracted from verified token
- All queries filtered by `user_id`
- No direct database access from frontend

## Troubleshooting

### "Database connection failed"
- Check MySQL is running: `sudo systemctl status mysql`
- Verify credentials in `.env`
- Check PHP PDO MySQL extension: `php -m | grep pdo_mysql`

### "Invalid or expired token"
- Token expires after 1 hour by default
- User needs to refresh or re-login
- Check Supabase URL and anon key are correct

### CORS errors
- Verify `cors.php` is included in all API files
- Check Apache/Nginx allows CORS headers
- Add domain to allowed origins if needed

## Performance Tips

1. **Add Indexes**: Already included in schema, but monitor slow queries
2. **Connection Pooling**: Consider using persistent connections in production
3. **Caching**: Add Redis/Memcached for frequently accessed data
4. **Query Optimization**: Use EXPLAIN to analyze slow queries

## Monitoring

Check MySQL slow query log:

```bash
sudo tail -f /var/log/mysql/slow-query.log
```

Enable if not active:

```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```
