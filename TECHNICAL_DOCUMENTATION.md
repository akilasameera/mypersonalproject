# Project Manager - Complete Technical Documentation

## Overview
A comprehensive project management application built with React, TypeScript, Tailwind CSS, and Supabase. The application provides a full-featured project management system with authentication, real-time data, file uploads, and a beautiful responsive UI.

## Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for styling with custom animations
- **Lucide React** for consistent iconography
- **Vite** for fast development and building
- **Supabase** for backend services (database, auth, storage)

### Backend Services
- **Supabase Database** (PostgreSQL) with Row Level Security (RLS)
- **Supabase Authentication** with email/password
- **Supabase Storage** for file attachments
- **Real-time subscriptions** for live updates

## Core Features

### 1. Authentication System
**Location**: `src/hooks/useAuth.ts`, `src/components/LoginPage.tsx`

**Functionality**:
- Email/password registration and login
- Automatic profile creation on signup
- Session management with persistent login
- Secure logout with token cleanup
- Profile linking to Supabase auth users

**Technical Details**:
- Uses Supabase Auth with automatic profile creation
- Implements proper error handling and loading states
- Responsive design with gradient backgrounds
- Password visibility toggle for better UX

### 2. Project Management System

#### Project Categories
**Two distinct project types**:
- **Main Projects** (`category: 'main'`) - Primary work projects
- **My Office** (`category: 'mine'`) - Personal/private projects

#### Project Features
**Location**: `src/components/ProjectGrid.tsx`, `src/components/MyOfficeView.tsx`

**Functionality**:
- Create, edit, delete projects
- Color-coded project organization (10 predefined colors)
- Project status tracking (Active, Hold, Completed)
- Due date management with overdue indicators
- Progress tracking based on todo completion
- Project statistics (tasks, notes, links count)
- Status filtering and search

**Technical Implementation**:
- Uses `useProjects` hook for state management
- Real-time updates via Supabase subscriptions
- Optimistic UI updates for better performance
- Responsive grid layout with hover animations

### 3. Project Detail System
**Location**: `src/components/ProjectDetail.tsx`

**Tab-based Interface**:
- **Notes Tab** - General project notes
- **Current Status Tab** - Project status tracking
- **Links Tab** - URL management with credentials
- **Todos Tab** - Task management
- **Calendar Tab** - Project timeline view

**Technical Features**:
- Dynamic tab switching with state preservation
- Mobile-responsive tab navigation
- Breadcrumb navigation with back functionality
- Real-time data synchronization

### 4. Notes Management System

#### General Notes
**Location**: `src/components/tabs/NotesTab.tsx`

**Features**:
- Rich text note creation and editing
- File attachment support (multiple files per note)
- Due date tracking with overdue indicators
- Note categorization (General vs Current Status)
- Full-text search capabilities
- Note detail modal for expanded view

#### Current Status Notes
**Location**: `src/components/tabs/CurrentStatusTab.tsx`

**Special Functionality**:
- **Single Current Status Rule**: Only one current status note per project
- **Automatic Migration**: When creating new current status, old ones move to general notes
- **Status Types**: "Me" vs "Customer" status updates
- **Priority Display**: Current status shows prominently in project cards

**Technical Implementation**:
- Complex database logic to maintain single current status
- Automatic note migration with transaction safety
- Real-time UI updates across all views

### 5. File Attachment System
**Location**: `src/hooks/useNotes.ts`, integrated in Notes components

**Features**:
- Multiple file uploads per note
- File type validation and size limits
- Secure file storage in Supabase Storage
- File preview and download functionality
- File deletion with cleanup
- Progress indicators during upload

**Technical Details**:
- Uses Supabase Storage with organized folder structure
- Implements proper error handling and retry logic
- File metadata stored in database with foreign keys
- Automatic cleanup on note deletion

### 6. Links Management
**Location**: `src/components/tabs/LinksTab.tsx`

**Features**:
- URL storage with title and description
- Credential management (username/password)
- Password visibility toggle for security
- External link opening in new tabs
- Domain extraction for display
- Link validation and formatting

**Security Features**:
- Encrypted credential storage
- Secure password display/hide functionality
- Input validation for URLs

### 7. Todo Management System
**Location**: `src/components/tabs/TodosTab.tsx`

**Features**:
- Task creation with title, description, notes
- Priority levels (Low, Medium, High) with color coding
- Due date tracking with overdue alerts
- Completion status toggle
- Task notes for additional context
- Progress tracking for project completion rates

**Technical Implementation**:
- Optimistic updates for instant feedback
- Bulk operations support
- Status-based filtering and sorting
- Integration with project progress calculations

### 8. Calendar System

#### Project Calendar
**Location**: `src/components/tabs/CalendarTab.tsx`

**Features**:
- Monthly calendar view for individual projects
- Visual indicators for todos and notes with due dates
- Project due date highlighting
- Upcoming items summary (next 7 days)
- Interactive date navigation

#### Consolidated Calendar
**Location**: `src/components/ConsolidatedCalendar.tsx`

**Features**:
- Cross-project calendar view
- All projects' todos, notes, and deadlines in one view
- Item detail popups with project navigation
- Upcoming items sidebar
- Project overview panel

**Technical Details**:
- Efficient date filtering and sorting algorithms
- Responsive calendar grid with mobile optimization
- Real-time data aggregation from multiple projects

### 9. Universal Search System
**Location**: `src/components/UniversalSearch.tsx`

**Features**:
- Global search across all content types
- Search in projects, notes, todos, links, and attachments
- Real-time search results with highlighting
- Result categorization and filtering
- Direct navigation to source projects

**Technical Implementation**:
- Client-side search with optimized indexing
- Debounced search input for performance
- Result ranking and relevance scoring
- Keyboard navigation support (ESC to close)

### 10. All Todos View
**Location**: `src/components/AllTodosView.tsx`

**Features**:
- Consolidated view of all todos across projects
- Advanced filtering (All, Pending, Completed)
- Date range filtering with calendar pickers
- Sorting by due date, priority, or creation date
- Project context for each todo
- Overdue highlighting and statistics

**Technical Features**:
- Complex filtering logic with multiple criteria
- Real-time statistics calculation
- Responsive design with mobile-first approach
- Efficient data aggregation from multiple projects

### 11. Attachments Management
**Location**: `src/components/AttachmentsView.tsx`

**Features**:
- Global view of all file attachments
- File type categorization with icons
- Search functionality across file names and metadata
- File size and upload date tracking
- Direct download links
- Project and note context for each file

**Technical Implementation**:
- Efficient file metadata aggregation
- File type detection and icon mapping
- Search indexing for fast filtering
- Storage usage statistics

### 12. Settings & User Management
**Location**: `src/components/SettingsPage.tsx`

**Features**:
- User profile management
- Account settings and preferences
- Data export capabilities
- Security settings
- Theme and appearance options
- Account deletion functionality

## Database Schema

### Core Tables
1. **profiles** - User profile information
2. **projects** - Project data with categories and status
3. **notes** - Notes with status categorization
4. **todos** - Task management with priorities
5. **links** - URL storage with credentials
6. **attachments** - File metadata and references

### Key Relationships
- Users → Projects (one-to-many)
- Projects → Notes/Todos/Links (one-to-many)
- Notes → Attachments (one-to-many)

### Security Features
- Row Level Security (RLS) on all tables
- User-based data isolation
- Secure file storage with access controls
- Encrypted credential storage

## State Management

### Custom Hooks
- **useAuth** - Authentication state and methods
- **useProjects** - Project CRUD operations and state
- **useNotes** - Notes management with file uploads
- **useTodos** - Todo operations and state
- **useLinks** - Links management

### Data Flow
1. Components use custom hooks for data operations
2. Hooks interact with Supabase client
3. Real-time subscriptions update UI automatically
4. Optimistic updates provide instant feedback
5. Error handling with user-friendly messages

## UI/UX Features

### Design System
- **Color Palette**: Blue/purple gradients with accent colors
- **Typography**: Hierarchical text sizing with proper contrast
- **Spacing**: 8px grid system for consistent layouts
- **Animations**: Smooth transitions and hover effects
- **Icons**: Consistent Lucide React icon set

### Responsive Design
- **Mobile-first approach** with touch-friendly interactions
- **Breakpoint system**: sm, md, lg, xl for different screen sizes
- **Flexible layouts** that adapt to screen size
- **Touch gestures** for mobile interactions

### Accessibility
- **Keyboard navigation** support
- **Screen reader compatibility**
- **High contrast ratios** for text readability
- **Focus indicators** for interactive elements
- **ARIA labels** for complex components

## Performance Optimizations

### Frontend
- **Code splitting** with dynamic imports
- **Lazy loading** for non-critical components
- **Optimistic updates** for instant feedback
- **Debounced search** to reduce API calls
- **Memoized calculations** for expensive operations

### Backend
- **Database indexing** on frequently queried columns
- **Row Level Security** for data isolation
- **Connection pooling** for efficient database usage
- **File storage optimization** with CDN delivery

## Development Workflow

### Code Organization
```
src/
├── components/          # React components
│   ├── tabs/           # Tab-specific components
│   └── modals/         # Modal components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries (Supabase)
├── types.ts            # TypeScript type definitions
└── index.css           # Global styles
```

### Key Patterns
- **Custom hooks** for data operations
- **Component composition** for reusability
- **Props drilling avoidance** with context when needed
- **Error boundaries** for graceful error handling
- **Loading states** for better UX

## Deployment & Infrastructure

### Build Process
- **Vite** for fast builds and hot reloading
- **TypeScript compilation** with strict type checking
- **Tailwind CSS** processing and optimization
- **Asset optimization** and bundling

### Environment Configuration
- **Development**: Local Supabase instance
- **Production**: Hosted Supabase with custom domain
- **Environment variables** for configuration
- **CORS configuration** for cross-origin requests

## Security Considerations

### Authentication
- **JWT tokens** with automatic refresh
- **Secure session management**
- **Password hashing** with bcrypt
- **Rate limiting** on authentication endpoints

### Data Protection
- **Row Level Security** enforced at database level
- **Input validation** and sanitization
- **SQL injection prevention** with parameterized queries
- **File upload restrictions** and validation

### Privacy
- **User data isolation** with RLS policies
- **Secure file storage** with access controls
- **No data sharing** between users
- **GDPR compliance** with data export/deletion

## Future Enhancement Opportunities

### Features
- **Real-time collaboration** with multiple users per project
- **Advanced reporting** and analytics
- **Integration APIs** for third-party tools
- **Mobile app** with React Native
- **Offline support** with service workers

### Technical Improvements
- **GraphQL API** for more efficient data fetching
- **Advanced caching** strategies
- **Microservices architecture** for scalability
- **Advanced search** with full-text indexing
- **Automated testing** suite

## Troubleshooting Guide

### Common Issues
1. **Authentication failures** - Check Supabase configuration
2. **File upload errors** - Verify storage bucket permissions
3. **Real-time updates not working** - Check RLS policies
4. **Performance issues** - Review database queries and indexing

### Debug Tools
- **Browser DevTools** for frontend debugging
- **Supabase Dashboard** for database inspection
- **Network tab** for API call analysis
- **Console logs** for error tracking

This documentation provides a complete technical overview of your Project Manager application. The system is well-architected with proper separation of concerns, security measures, and scalability considerations.