# Task Management System

## Overview

This is a full-stack task management application built with React and Express.js. The app provides a dual-interface system with a public User Dashboard for task submission and a protected Admin Panel for user and task management. The application features a modern UI built with shadcn/ui components and Tailwind CSS, with PostgreSQL database integration via Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development tooling
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessible, composable components
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API with JSON responses and proper HTTP status codes
- **Development Server**: Custom Vite integration for hot module replacement in development

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database serverless platform
- **ORM**: Drizzle ORM chosen for its TypeScript-first approach and performance
- **Schema Management**: Drizzle Kit for database migrations and schema changes
- **Development Fallback**: In-memory storage implementation for development/testing scenarios

### Authentication and Authorization
- **Admin Protection**: Simple code-based access control (code: 332133) for admin panel access
- **Session Management**: Built-in session handling for admin state persistence
- **No User Authentication**: Public user interface requires no login or registration

### Data Models
The system uses two primary entities:
- **Users**: Contains name, assigned project, and array of available tasks
- **TaskLogs**: Records user task submissions with timestamps for audit trail

### API Structure
RESTful endpoints following conventional patterns:
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `DELETE /api/users/:name` - Remove user
- `GET /api/tasks/:user` - Get user's available tasks
- `PUT /api/users/:name/tasks` - Update user's task assignments
- `POST /api/logs` - Submit task completion log
- `GET /api/logs` - Retrieve all task logs (admin)

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: TypeScript ORM for database operations and migrations

### UI and Styling
- **shadcn/ui**: Pre-built component library based on Radix UI
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Build tool and development server with HMR
- **TypeScript**: Static typing throughout the application
- **TanStack Query**: Server state management and data fetching
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation library

### Runtime Dependencies
- **Express.js**: Web application framework
- **Wouter**: Lightweight routing for React
- **date-fns**: Date manipulation utilities
- **clsx**: Conditional CSS class utilities