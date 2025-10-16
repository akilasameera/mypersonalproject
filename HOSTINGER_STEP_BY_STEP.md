# Hostinger VPS Setup - Complete Step-by-Step Guide

Follow these steps **exactly** in order. Don't skip anything.

---

## STEP 1: Create MySQL Database in hPanel

### 1.1 Login to hPanel
1. Go to: https://hpanel.hostinger.com
2. Enter your email and password
3. Click "Log In"

### 1.2 Go to Your VPS
1. On the dashboard, find your VPS
2. Click on it to open VPS management

### 1.3 Open Database Management
1. Look for a menu on the left side
2. Find and click: **"Databases"** or **"MySQL Databases"**
3. If you can't find it, look under **"Advanced"** section

### 1.4 Create New Database
1. Click the button that says **"Create New Database"** or **"Add Database"**
2. In the "Database Name" field, type exactly: `projectmanager`
3. Click **"Create"** or **"Add"**
4. **WRITE THIS DOWN:** Database name is `projectmanager`

### 1.5 Create Database User
1. Scroll down or look for **"MySQL Users"** section
2. Click **"Create New User"** or **"Add User"**
3. Username: type exactly `projectmanager`
4. Password: Click **"Generate Password"** button
5. **IMPORTANT:** Copy this password and save it somewhere safe (Notepad, phone notes, etc.)
6. Click **"Create User"**

### 1.6 Connect User to Database
1. Scroll down to **"Add User to Database"** section
2. Select user: `projectmanager`
3. Select database: `projectmanager`
4. Click **"Add"**
5. When it asks for privileges, select **"All Privileges"**
6. Click **"Make Changes"** or **"Save"**

**✅ CHECKPOINT:** You should now have:
- Database name: `projectmanager`
- Username: `projectmanager`
- Password: (the one you saved)

---

## STEP 2: Connect to VPS via SSH

### 2.1 Find Your SSH Details
1. In hPanel, go back to your VPS dashboard
2. Look for **"SSH Access"** or **"Server Information"**
3. Write down:
   - IP Address: (looks like 123.456.78.90)
   - SSH Port: (usually 22)
   - Username: (usually "root" or similar)

### 2.2 Connect Using SSH

**On Windows:**
1. Press `Windows Key + R`
2. Type: `cmd` and press Enter
3. In the black window, type:
```bash
ssh root@YOUR_IP_ADDRESS
```
(Replace YOUR_IP_ADDRESS with your actual IP)
4. Press Enter
5. Type "yes" if it asks "Are you sure?"
6. Enter your VPS password (it won't show anything when you type - that's normal)

**On Mac/Linux:**
1. Open "Terminal" app
2. Type:
```bash
ssh root@YOUR_IP_ADDRESS
```
3. Press Enter
4. Type "yes" if it asks
5. Enter your VPS password

**✅ CHECKPOINT:** You should see something like `root@server:~#` - this means you're connected

---

## STEP 3: Upload Backend Files to VPS

### 3.1 Open Another Terminal/Command Prompt Window
- Don't close your SSH connection
- Open a NEW terminal/cmd window

### 3.2 Navigate to Your Project
In the NEW window, type:
```bash
cd /tmp/cc-agent/53950341/project
```

### 3.3 Create a Zip File
```bash
tar -czf backend.tar.gz backend/
```

### 3.4 Upload to VPS
```bash
scp backend.tar.gz root@YOUR_IP_ADDRESS:/root/
```
(Replace YOUR_IP_ADDRESS with your actual IP)
- Enter password when asked
- Wait for upload to complete (you'll see progress)

### 3.5 Go Back to SSH Window
Switch back to your SSH window (the one with `root@server:~#`)

### 3.6 Extract Files
Type these commands one by one:
```bash
cd /root
ls
```
You should see `backend.tar.gz` in the list

```bash
tar -xzf backend.tar.gz
```

```bash
ls
```
You should now see a `backend` folder

### 3.7 Move Backend to Web Directory
```bash
mkdir -p /var/www/mypersonalprojects.com
mv backend /var/www/mypersonalprojects.com/
```

**✅ CHECKPOINT:** Type `ls /var/www/mypersonalprojects.com/backend` - you should see folders like "api", "config", etc.

---

## STEP 4: Create Environment File

### 4.1 Create .env File
In your SSH window, type:
```bash
nano /var/www/mypersonalprojects.com/backend/.env
```

### 4.2 Copy This Text
Copy this ENTIRE text block:
```
VPS_DB_HOST=localhost
VPS_DB_NAME=projectmanager
VPS_DB_USER=projectmanager
VPS_DB_PASS=PASTE_YOUR_PASSWORD_HERE

VITE_SUPABASE_URL=https://ifllwtljorvgcnthicuy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbGx3dGxqb3J2Z2NudGhpY3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDE5NDIsImV4cCI6MjA2OTU3Nzk0Mn0.mbKCd-EKcaQWn2zmzwPeep190TS5XIkni2cMu57Fzr0
```

### 4.3 Paste in Nano
- Right-click in the SSH window to paste
- **IMPORTANT:** Replace `PASTE_YOUR_PASSWORD_HERE` with the password you saved in Step 1.5

### 4.4 Save and Exit
1. Press `Ctrl + X`
2. Press `Y` (for Yes)
3. Press `Enter`

**✅ CHECKPOINT:** Type `cat /var/www/mypersonalprojects.com/backend/.env` - you should see your text with your real password

---

## STEP 5: Import Database Schema

### 5.1 Import the Tables
In your SSH window, type this **EXACT** command:
```bash
mysql -u projectmanager -p projectmanager < /var/www/mypersonalprojects.com/backend/schema/vps_schema.sql
```

### 5.2 Enter Password
- It will ask: `Enter password:`
- Type the password you saved (it won't show anything)
- Press Enter

### 5.3 Wait
- If it works, it will just return to the prompt (no error)
- If you see an error, **STOP** and tell me what it says

**✅ CHECKPOINT:** Type this to verify:
```bash
mysql -u projectmanager -p -e "SHOW TABLES FROM projectmanager;"
```
Enter password. You should see a list of tables like "notes", "meetings", etc.

---

## STEP 6: Set Permissions

### 6.1 Fix Ownership
```bash
chown -R www-data:www-data /var/www/mypersonalprojects.com/backend
```

If that gives an error, try:
```bash
chown -R apache:apache /var/www/mypersonalprojects.com/backend
```

### 6.2 Fix File Permissions
```bash
find /var/www/mypersonalprojects.com/backend -type d -exec chmod 755 {} \;
find /var/www/mypersonalprojects.com/backend -type f -exec chmod 644 {} \;
```

### 6.3 Create Upload Directory
```bash
mkdir -p /var/www/mypersonalprojects.com/backend/uploads/attachments
chmod 775 /var/www/mypersonalprojects.com/backend/uploads/attachments
```

---

## STEP 7: Configure Web Server

### 7.1 Find Your Web Server
Type:
```bash
ps aux | grep -E 'apache|nginx'
```

Look at the results:
- If you see "apache" → you have Apache
- If you see "nginx" → you have Nginx

### 7.2 Configure Apache (if you have Apache)

Create config file:
```bash
nano /etc/apache2/sites-available/mypersonalprojects.conf
```

Paste this:
```apache
<VirtualHost *:80>
    ServerName mypersonalprojects.com
    DocumentRoot /var/www/mypersonalprojects.com

    <Directory /var/www/mypersonalprojects.com>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/mypersonalprojects_error.log
    CustomLog ${APACHE_LOG_DIR}/mypersonalprojects_access.log combined
</VirtualHost>
```

Save: `Ctrl+X`, `Y`, `Enter`

Enable site:
```bash
a2ensite mypersonalprojects.conf
systemctl reload apache2
```

### 7.3 Configure Nginx (if you have Nginx)

Create config file:
```bash
nano /etc/nginx/sites-available/mypersonalprojects
```

Paste this:
```nginx
server {
    listen 80;
    server_name mypersonalprojects.com;
    root /var/www/mypersonalprojects.com;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

Save: `Ctrl+X`, `Y`, `Enter`

Enable site:
```bash
ln -s /etc/nginx/sites-available/mypersonalprojects /etc/nginx/sites-enabled/
systemctl reload nginx
```

---

## STEP 8: Test Everything

### 8.1 Test from Command Line
In SSH, type:
```bash
curl http://localhost/backend/test.php
```

You should see:
```json
{"status":"success","message":"Database connection successful","test":{"test":"1"}}
```

### 8.2 Test from Browser
Open your web browser and go to:
```
http://mypersonalprojects.com/backend/test.php
```

You should see the same success message.

### 8.3 If You See an Error
**STOP** and tell me:
1. What exact error message you see
2. Which step you're on

---

## STEP 9: Update Your Website

Now your backend is ready. Your website should automatically start using it.

Visit: `https://mypersonalprojects.com`

Try:
1. Login
2. Create a project
3. Add a note
4. Everything should work!

---

## If Something Goes Wrong

### Error: "Database connection failed"
```bash
# Check if MySQL is running
systemctl status mysql

# If not running, start it
systemctl start mysql
```

### Error: "Permission denied"
```bash
# Fix permissions again
chown -R www-data:www-data /var/www/mypersonalprojects.com/backend
chmod -R 755 /var/www/mypersonalprojects.com/backend
```

### Error: "Cannot find database"
```bash
# Check if database exists
mysql -u projectmanager -p -e "SHOW DATABASES;"
```

### Can't Connect to SSH
- Double-check IP address
- Check if VPS is running in hPanel
- Try restarting VPS from hPanel

---

## Need Help?

If you get stuck:
1. Tell me EXACTLY which step number you're on
2. Copy the EXACT error message you see
3. I'll help you fix it

---

**That's it!** Follow each step carefully and your backend will be running on your Hostinger VPS.
