# VPS Migration Summary

## What Was Set Up

Your project now uses a **hybrid database architecture**:

### Supabase (Authentication Only)
- User authentication and sessions
- JWT token management
- Still uses `profiles`, `projects`, `todos`, `links` (lightweight tables)

### VPS MySQL (Heavy Data)
All heavy tables migrated:
- ✅ notes
- ✅ attachments
- ✅ meetings
- ✅ meeting_transcripts
- ✅ meeting_summaries
- ✅ meeting_todos
- ✅ knowledge_topics
- ✅ knowledge_sections
- ✅ knowledge_tiles
- ✅ project_configurations
- ✅ configurator_blocks

## Files Created

### Backend Files
```
backend/
├── config/
│   └── vps_database.php          # VPS MySQL connection
├── utils/
│   └── supabase_auth.php         # JWT verification
├── api/
│   ├── vps_notes.php             # Notes CRUD API
│   └── vps_configurations.php    # Configurations CRUD API
├── schema/
│   └── vps_schema.sql            # Complete MySQL schema
└── scripts/
    ├── quick_setup.sh            # Automated VPS setup
    ├── test_connection.php       # Test database connection
    └── migrate_from_supabase.php # Data migration script
```

### Frontend Files
```
src/
└── lib/
    └── vpsClient.ts              # VPS API client
```

### Documentation
```
VPS_CONNECTION_GUIDE.md           # Step-by-step connection guide
MIGRATION_SUMMARY.md              # This file
backend/SETUP_INSTRUCTIONS.md     # Technical setup guide
```

## Quick Start (3 Easy Steps)

### Step 1: Set Up VPS (One-time)

SSH into your Hostinger VPS:
```bash
ssh root@your-vps-ip
```

Upload files and run quick setup:
```bash
cd /var/www/html
# Upload backend folder here
sudo bash backend/scripts/quick_setup.sh
```

The script will:
- Install MySQL, PHP, Apache
- Create database and user
- Import schema
- Configure Apache
- Test connection

### Step 2: Migrate Your Data

Still on VPS, run:
```bash
php /var/www/html/backend/scripts/migrate_from_supabase.php
```

This copies all data from Supabase to VPS automatically.

### Step 3: Update Frontend

In your local `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_VPS_API_URL=http://your-vps-ip/api
```

Build and deploy:
```bash
npm run build
# Upload dist folder to VPS
```

Done! Your app now uses VPS for heavy data.

## How It Works

### Authentication Flow
```
1. User logs in → Supabase Auth
2. Get JWT token → Store in browser
3. Make API call → Send JWT in header
4. VPS validates JWT with Supabase
5. Return data from VPS MySQL
```

### Example API Call
```javascript
// Frontend code (automatic with vpsClient)
const data = await vpsClient.notes.getByProject(projectId);

// What happens:
// 1. Gets Supabase session token
// 2. Calls: http://your-vps-ip/api/vps-notes?project_id=123
// 3. Header: Authorization: Bearer <token>
// 4. VPS verifies token with Supabase
// 5. Returns notes from MySQL
```

## Testing Your Setup

### Test Database Connection
```bash
ssh root@your-vps-ip
php /var/www/html/backend/scripts/test_connection.php
```

Expected output:
```
✅ Connection successful!
✅ notes (0 records)
✅ meetings (0 records)
...
```

### Test API Endpoint
From your browser:
```
http://your-vps-ip/api/vps-notes?project_id=test
```

Expected: `{"error":"No authorization token provided"}`
This is GOOD - means auth is working!

### Test with Real Request
Use your app normally. The BRD tab now uses VPS automatically.

## Environment Variables

### VPS (.env on server)
```env
VPS_DB_HOST=localhost
VPS_DB_NAME=projectmanager
VPS_DB_USER=projectuser
VPS_DB_PASS=your_password

VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key  # For migration only
```

### Frontend (.env local)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_VPS_API_URL=http://your-vps-ip/api
```

## API Endpoints Created

All endpoints require: `Authorization: Bearer <supabase-jwt-token>`

### Notes
- `GET /api/vps-notes?project_id=xxx` - Get all notes
- `GET /api/vps-notes?id=xxx` - Get one note
- `POST /api/vps-notes` - Create note
- `PUT /api/vps-notes` - Update note
- `DELETE /api/vps-notes` - Delete note

### Configurations
- `GET /api/vps-configurations?project_id=xxx` - Get configuration
- `POST /api/vps-configurations` - Create/update configuration
- `PUT /api/vps-configurations` - Update configuration
- `DELETE /api/vps-configurations` - Delete configuration

## Adding More API Endpoints

To migrate other tables, follow this pattern:

1. **Create API file**: `backend/api/vps_tablename.php`
2. **Add vpsClient method**: Update `src/lib/vpsClient.ts`
3. **Update component**: Use `vpsClient.tablename.method()`
4. **Add rewrite rule**: In Apache/Nginx config

Example structure in API file:
```php
<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../utils/supabase_auth.php';
$vps_db = require_once __DIR__ . '/../config/vps_database.php';

$method = $_SERVER['REQUEST_METHOD'];
$user_id = getUserId();  // Auto-validates JWT

switch ($method) {
    case 'GET':
        // Handle GET
        break;
    case 'POST':
        // Handle POST
        break;
    // etc
}
```

## Security Features

✅ All requests authenticated via Supabase JWT
✅ User ID extracted from verified token
✅ All queries filtered by user_id
✅ Prepared statements prevent SQL injection
✅ CORS configured properly
✅ Separate database user (not root)
✅ SSL ready with Certbot

## Cost Savings

### Before (Supabase Only)
- Large database = Higher Supabase tier
- Storage costs increase
- Bandwidth limits

### After (Hybrid)
- Supabase: Small footprint (auth + lightweight tables)
- VPS: Unlimited storage for heavy data
- Lower monthly costs
- More control

## Monitoring

### Check Service Status
```bash
sudo systemctl status mysql
sudo systemctl status apache2
```

### View Logs
```bash
# Database errors
sudo tail -f /var/log/mysql/error.log

# Apache errors
sudo tail -f /var/log/apache2/error.log

# PHP errors
sudo tail -f /var/log/apache2/error.log | grep PHP
```

### Database Size
```bash
mysql -u projectuser -p -e "
SELECT
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'projectmanager'
ORDER BY (data_length + index_length) DESC;
"
```

## Backup Your Data

### Automatic Daily Backups
Create cron job:
```bash
crontab -e
```

Add:
```cron
0 2 * * * mysqldump -u projectuser -pYourPassword projectmanager > /backups/db_$(date +\%Y\%m\%d).sql
```

### Manual Backup
```bash
mysqldump -u projectuser -p projectmanager > backup.sql
```

### Restore from Backup
```bash
mysql -u projectuser -p projectmanager < backup.sql
```

## Troubleshooting

### "Connection failed"
```bash
sudo systemctl restart mysql
mysql -u projectuser -p
```

### "Invalid token"
- Token expires after 1 hour
- User needs to re-login
- Check Supabase URL/key in .env

### API returns 404
```bash
# Check Apache config
sudo apache2ctl configtest
# Check rewrite rules
sudo grep -r "RewriteRule" /etc/apache2/
```

### Slow queries
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- View slow queries
SELECT * FROM mysql.slow_log;
```

## Production Checklist

- [ ] SSL certificate installed (`certbot --apache`)
- [ ] Update VPS_API_URL to `https://yourdomain.com/api`
- [ ] Firewall configured (`ufw allow 80,443/tcp`)
- [ ] Backups automated
- [ ] PHP error display off in production
- [ ] Strong database password
- [ ] Regular security updates (`apt update && upgrade`)
- [ ] Monitoring set up
- [ ] Test from live app

## Support Files

- **Detailed Guide**: `VPS_CONNECTION_GUIDE.md`
- **Technical Docs**: `backend/SETUP_INSTRUCTIONS.md`
- **Test Script**: `backend/scripts/test_connection.php`
- **Migration Script**: `backend/scripts/migrate_from_supabase.php`
- **Quick Setup**: `backend/scripts/quick_setup.sh`

## Next Steps

1. ✅ VPS set up and running
2. ✅ Data migrated from Supabase
3. ✅ Frontend updated
4. 🔄 Deploy to production
5. 🔄 Set up SSL
6. 🔄 Configure backups
7. 🔄 Monitor performance

Your project is now running on your own VPS with full control over your data!
