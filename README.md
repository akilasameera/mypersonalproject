# Personal Project Management System

A comprehensive project management application built with React and PHP, designed for organizing projects, notes, links, and todos with a beautiful, production-ready interface.

## Features

### Authentication
- User registration and login
- Secure token-based authentication
- Session management

### Project Management
- Create, edit, and delete projects
- Color-coded project organization
- Project cards with progress tracking
- Detailed project statistics

### Project Details
- **Notes Tab**: Create notes with attachments and due dates
- **Links Tab**: Store links with username/password credentials
- **Todos Tab**: Full-featured todo lists with priorities and notes
- **Calendar Tab**: Calendar view of all project items with due dates

### Dashboard
- Collapsible sidebar with project overview
- Consolidated todo list across all projects
- Today's tasks and pending items overview
- Responsive design for all devices

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Vite for development and building

### Backend
- PHP 8+ with PDO
- MySQL database
- RESTful API architecture
- JWT-like token authentication

## Installation

### Prerequisites
- Node.js 18+
- PHP 8+
- MySQL 5.7+
- Web server (Apache/Nginx)

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Upload the `backend` folder to your Hostinger hosting
2. Create a MySQL database
3. Import the database schema:
   ```sql
   mysql -u username -p database_name < backend/database/schema.sql
   ```

4. Update database credentials in `backend/config/database.php`
5. Ensure your web server has URL rewriting enabled

### Database Configuration
Update the database credentials in `backend/config/database.php`:
```php
define('DB_HOST', 'your_host');
define('DB_NAME', 'your_database');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Notes
- `GET /api/notes/{project_id}` - Get project notes
- `POST /api/notes/{project_id}` - Create note
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note

## Features in Detail

### Project Cards
- Visual project representation with color coding
- Progress bars showing task completion
- Quick stats (tasks, notes, links)
- Hover effects and smooth animations

### Notes System
- Rich text notes with attachments
- Due date support with calendar picker
- File attachment management
- Overdue indicators

### Links Management
- Secure credential storage
- Username/password fields with visibility toggle
- URL validation and domain display
- Quick external link access

### Todo Lists
- Priority levels (low, medium, high)
- Due dates with overdue indicators
- Task notes for additional context
- Completion tracking and statistics

### Calendar Integration
- Monthly calendar view
- Visual indicators for tasks and notes
- Upcoming items summary
- Date-based filtering and navigation

## Deployment

### Hostinger Deployment
1. Upload the `backend` folder to your public_html directory
2. Create and configure your MySQL database
3. Build the frontend: `npm run build`
4. Upload the `dist` folder contents to your domain root
5. Configure your domain to point to the uploaded files

### Environment Variables
Create a `.env` file for production:
```
VITE_API_URL=https://yourdomain.com/backend/api
```

## Security Features
- Password hashing with PHP's password_hash()
- SQL injection prevention with prepared statements
- CORS configuration for API access
- Input validation and sanitization
- Secure token-based authentication

## Browser Support
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
This project is licensed under the MIT License.