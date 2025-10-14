# Project Manager Backend API

A complete PHP backend API for the Personal Project Management System.

## Features

- **User Authentication** - Registration, login, logout with token-based auth
- **Project Management** - CRUD operations for projects with due dates
- **Notes System** - Rich notes with file attachments support
- **Links Management** - Store links with credentials
- **Todo Lists** - Full-featured todos with priorities and due dates
- **File Uploads** - Secure file attachment system
- **Security** - Input validation, SQL injection prevention, CORS support

## Installation

### Requirements
- PHP 8.0+
- MySQL 5.7+
- Apache/Nginx with mod_rewrite
- Write permissions for uploads directory

### Setup Steps

1. **Database Setup**
   ```sql
   CREATE DATABASE project_manager;
   ```
   
2. **Import Schema**
   ```bash
   mysql -u username -p project_manager < database/schema.sql
   ```

3. **Configure Database**
   Edit `config/database.php`:
   ```php
   define('DB_HOST', 'your_host');
   define('DB_NAME', 'project_manager');
   define('DB_USER', 'your_username');
   define('DB_PASS', 'your_password');
   ```

4. **Set Permissions**
   ```bash
   chmod 755 uploads/
   chmod 755 uploads/attachments/
   ```

5. **Configure Web Server**
   Ensure mod_rewrite is enabled and .htaccess files are processed.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Projects
- `GET /api/projects` - Get all user projects
- `GET /api/projects/{id}` - Get specific project
- `POST /api/projects` - Create new project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Notes
- `GET /api/notes/{project_id}` - Get project notes
- `GET /api/notes/{project_id}/{note_id}` - Get specific note
- `POST /api/notes/{project_id}` - Create new note
- `PUT /api/notes/{project_id}/{note_id}` - Update note
- `DELETE /api/notes/{project_id}/{note_id}` - Delete note
- `POST /api/notes/{note_id}/upload` - Upload attachment
- `DELETE /api/notes/{note_id}/attachments/{attachment_id}` - Delete attachment

### Links
- `GET /api/links/{project_id}` - Get project links
- `GET /api/links/{project_id}/{link_id}` - Get specific link
- `POST /api/links/{project_id}` - Create new link
- `PUT /api/links/{project_id}/{link_id}` - Update link
- `DELETE /api/links/{project_id}/{link_id}` - Delete link

### Todos
- `GET /api/todos/{project_id}` - Get project todos
- `GET /api/todos/{project_id}/{todo_id}` - Get specific todo
- `POST /api/todos/{project_id}` - Create new todo
- `PUT /api/todos/{project_id}/{todo_id}` - Update todo
- `PATCH /api/todos/{project_id}/{todo_id}` - Toggle todo completion
- `DELETE /api/todos/{project_id}/{todo_id}` - Delete todo

## Request/Response Format

### Authentication Required
Include in headers:
```
Authorization: Bearer {token}
```

### Request Body (JSON)
```json
{
  "title": "Project Title",
  "description": "Project description",
  "color": "#3B82F6",
  "due_date": "2025-12-31"
}
```

### Response Format
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {...}
}
```

## Security Features

- **Password Hashing** - Using PHP's password_hash()
- **SQL Injection Prevention** - Prepared statements
- **Input Validation** - Comprehensive validation system
- **CORS Support** - Configurable cross-origin requests
- **File Upload Security** - Type and size validation
- **Token-based Auth** - Secure session management

## File Structure

```
backend/
├── api/
│   ├── auth.php          # Authentication endpoints
│   ├── projects.php      # Project management
│   ├── notes.php         # Notes with attachments
│   ├── links.php         # Link management
│   └── todos.php         # Todo management
├── config/
│   ├── database.php      # Database configuration
│   └── cors.php          # CORS handling
├── utils/
│   ├── auth.php          # Authentication utilities
│   ├── response.php      # Response helpers
│   └── validator.php     # Input validation
├── database/
│   └── schema.sql        # Database schema
├── uploads/
│   └── attachments/      # File uploads directory
├── .htaccess             # URL rewriting rules
└── README.md             # This file
```

## Environment Variables

For production, use environment variables:
```bash
export DB_HOST="your_host"
export DB_NAME="your_database"
export DB_USER="your_username"
export DB_PASS="your_password"
```

## Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Server Error

## Sample Data

The schema includes sample data for testing:
- 2 sample users
- 3 sample projects
- Sample notes, links, and todos

Default login credentials:
- Email: `john@example.com`
- Password: `password`

## Production Deployment

1. Upload files to your web server
2. Create MySQL database and import schema
3. Configure database credentials
4. Set proper file permissions
5. Enable mod_rewrite
6. Configure SSL/HTTPS
7. Set up regular backups

## Support

For issues or questions, please check the API responses for detailed error messages and validation feedback.