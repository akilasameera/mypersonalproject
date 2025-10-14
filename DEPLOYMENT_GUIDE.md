# Frontend Deployment Guide for VPS

## Overview
Your React frontend has been built and is ready to deploy to your VPS at mypersonalprojects.com alongside your PHP backend.

## What Was Done
1. ✅ Updated API URL to point to `https://mypersonalprojects.com/backend/api`
2. ✅ Built production files in the `dist/` folder

## Deployment Steps

### 1. Upload Frontend Files to VPS

You need to upload the contents of the `dist/` folder to your VPS. Your directory structure should be:

```
htdocs/
├── backend/          (already exists with PHP files)
│   ├── api/
│   ├── config/
│   └── ...
├── index.html        (from dist/)
└── assets/           (from dist/)
    ├── index-Gfrgy9Zv.css
    └── index-UqWIr5dZ.js
```

### 2. Upload Using Your Hosting File Manager

**Option A: Using Hostinger File Manager**
1. Log into your Hostinger control panel
2. Go to File Manager
3. Navigate to `htdocs/`
4. Upload ALL files from the `dist/` folder to `htdocs/`
   - `index.html` → goes directly in `htdocs/`
   - `assets/` folder → goes in `htdocs/assets/`

**Option B: Using SCP from your local machine**
```bash
# From your project directory, run:
scp -r dist/* mypersonalprojects@srv1063749:/home/mypersonalprojects/htdocs/
```

**Option C: Using SFTP (FileZilla)**
1. Connect to your VPS via SFTP
2. Navigate to `/home/mypersonalprojects/htdocs/`
3. Upload all contents from your local `dist/` folder

### 3. Configure Nginx

Since you're using Nginx (not Apache), you need to set up proper routing. Contact your hosting provider or add this to your Nginx configuration:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location /backend/ {
    try_files $uri $uri/ =404;
}
```

This ensures:
- Frontend routes work properly (React Router)
- API calls to `/backend/api/*` reach your PHP files

### 4. Verify Deployment

After uploading:

1. **Visit your site:** `https://mypersonalprojects.com`
   - You should see your React app, not the Hostinger landing page

2. **Test the API:** Open browser console and check if API calls work
   - They should now hit `https://mypersonalprojects.com/backend/api/*`

3. **Check authentication:** Try logging in with your Supabase credentials

## Troubleshooting

### Still seeing Hostinger landing page?
- Clear your browser cache
- Make sure `index.html` is in the correct location
- Check that your domain's document root points to `htdocs/`

### API calls failing?
- Verify PHP files are in `htdocs/backend/api/`
- Check that `.env` file exists in `htdocs/backend/` with database credentials
- Test API directly: `https://mypersonalprojects.com/backend/api/vps-notes?project_id=test`

### 404 errors when refreshing pages?
- You need to configure Nginx to redirect all routes to `index.html`
- Contact your hosting provider for help with Nginx configuration

## Future Updates

Whenever you make changes to your React app:

1. Run `npm run build` locally
2. Upload the new files from `dist/` to your VPS
3. Clear your browser cache to see the changes

## Need Help?

If you run into issues:
1. Check the browser console for JavaScript errors
2. Check the Network tab to see where requests are failing
3. Verify your backend PHP files are working by testing API endpoints directly
