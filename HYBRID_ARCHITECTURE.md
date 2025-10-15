# Hybrid Architecture Overview

Your application now uses **both Supabase (cloud) and your VPS (self-hosted)** for optimal performance and cost.

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                   Frontend                      │
│         (React - mypersonalprojects.com)        │
└──────────────┬─────────────────┬────────────────┘
               │                 │
               │                 │
      ┌────────▼────────┐   ┌───▼──────────────────┐
      │    Supabase     │   │    VPS Backend       │
      │     (Cloud)     │   │  (mypersonalprojects)│
      └─────────────────┘   └──────────────────────┘
      │                     │
      │ • Authentication    │ • Heavy Data
      │ • User Profiles     │ • File Uploads
      │ • Projects          │ • Notes & Meetings
      │ • Todos             │ • Knowledge Base
      │ • Links             │ • Configurations
      │                     │
      │ (JWT Tokens)        │ (MySQL Database)
      └─────────────────────┴──────────────────────┘
```

## Data Distribution

### Supabase Tables (Light & Fast)
- ✅ `profiles` - User information
- ✅ `projects` - Project metadata
- ✅ `todos` - Task lists
- ✅ `links` - Quick links with credentials

**Why Supabase?**
- Real-time updates
- Built-in authentication
- Fast global access
- Free tier sufficient

### VPS Tables (Heavy Data)
- 📦 `notes` - Large text content (160 kB)
- 📦 `attachments` - File metadata (48 kB)
- 📦 `meetings` - Meeting records (136 kB)
- 📦 `meeting_transcripts` - Long transcripts (192 kB)
- 📦 `meeting_summaries` - Summaries (112 kB)
- 📦 `meeting_todos` - Meeting tasks (120 kB)
- 📦 `knowledge_topics` - Knowledge base topics
- 📦 `knowledge_sections` - Knowledge sections
- 📦 `knowledge_tiles` - Detailed content (360 kB)
- 📦 `project_configurations` - BRDs and setup (112 kB)
- 📦 `configurator_blocks` - Config blocks (104 kB)

**Why VPS?**
- Unlimited storage
- File uploads
- Full control
- Cost-effective for large data

## Authentication Flow

```
1. User logs in
   ↓
2. Supabase generates JWT token
   ↓
3. Frontend stores token
   ↓
4. Frontend sends token to VPS
   ↓
5. VPS verifies token with Supabase
   ↓
6. VPS returns data if valid
```

## API Endpoints

### Supabase APIs (Automatic)
```javascript
// Use Supabase client
import { supabase } from './lib/supabase'

// Get projects
const { data } = await supabase.from('projects').select('*')

// Get todos
const { data } = await supabase.from('todos').select('*')
```

### VPS APIs (Custom)
```javascript
// Use VPS client
import { vpsClient } from './lib/vpsClient'

// Get notes
const notes = await vpsClient.notes.getByProject(projectId)

// Get configuration
const config = await vpsClient.configurations.getByProject(projectId)
```

## Benefits

### Cost Savings
- Supabase free tier: 500 MB database
- VPS: Unlimited storage for heavy data
- Pay only for VPS hosting (~$5-20/month)

### Performance
- Light data cached in Supabase (fast)
- Heavy data on VPS (on-demand)
- Users don't download unnecessary data

### Scalability
- Add more tables to VPS as needed
- Keep Supabase for real-time features
- Easy to migrate data between systems

### Security
- Supabase handles authentication
- VPS verifies every request
- JWT tokens ensure secure access
- No passwords stored on VPS

## File Structure

```
project/
├── src/
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client (auth + light data)
│   │   └── vpsClient.ts       # VPS client (heavy data)
│   ├── hooks/
│   │   ├── useProjects.ts     # Uses Supabase
│   │   ├── useTodos.ts        # Uses Supabase
│   │   ├── useNotes.ts        # Uses VPS
│   │   └── useMeetings.ts     # Uses VPS
│   └── components/
│       └── ...
└── backend/                    # VPS Backend
    ├── api/
    │   ├── vps-notes.php
    │   └── vps-configurations.php
    ├── config/
    │   ├── vps_database.php
    │   └── cors.php
    ├── utils/
    │   └── supabase_auth.php  # JWT verification
    └── schema/
        └── vps_schema.sql
```

## Deployment Status

### ✅ Completed
- Frontend deployed to VPS
- Supabase configured and running
- Backend files ready for deployment

### 🔄 Next Steps
1. Upload backend files to VPS
2. Create MySQL database
3. Import database schema
4. Configure environment variables
5. Test API endpoints

## Monitoring

### Supabase Dashboard
- Monitor auth usage
- Check database size
- View API requests

### VPS Monitoring
```bash
# Check disk usage
df -h

# Check MySQL status
sudo systemctl status mysql

# View error logs
sudo tail -f /var/log/apache2/error.log
```

## Backup Strategy

### Supabase
- Automatic daily backups (built-in)
- Point-in-time recovery available

### VPS
```bash
# Backup MySQL database
mysqldump -u projectmanager -p projectmanager > backup.sql

# Backup uploads
tar -czf uploads_backup.tar.gz backend/uploads/
```

## Summary

You now have a **hybrid architecture** that combines the best of both worlds:
- **Supabase** for authentication and real-time light data
- **VPS** for heavy data, files, and custom logic

This setup is:
- ✅ Cost-effective
- ✅ Scalable
- ✅ Fast
- ✅ Secure
- ✅ Easy to maintain

**Ready to deploy?** Follow the `backend/DEPLOY.md` guide!
