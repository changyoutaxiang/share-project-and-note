# Personal Project Management Application

## Overview

A comprehensive personal project management tool built with React, TypeScript, and Node.js. The application provides task management, project tracking, and progress visualization through multiple views including a Kanban board, dashboard, and task list. It's designed specifically for individual developers and project managers to organize their work efficiently.

The system follows a Material Design-inspired approach with a focus on productivity and functionality. It supports both light and dark themes, features a responsive design, and includes advanced search capabilities across projects and tasks.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with pages for Dashboard, Kanban View, Projects, Tasks, Analytics, and Settings
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Radix UI components with shadcn/ui configuration for consistent design system
- **Styling**: Tailwind CSS with custom theme variables supporting light/dark modes
- **Component Structure**: Organized into reusable components (TaskCard, ProjectCard, KanbanColumn, etc.) with example components for documentation

### Backend Architecture
- **Runtime**: Node.js with Express server
- **API Design**: RESTful API with routes for projects, tasks, tags, and search functionality
- **Data Layer**: Abstract storage interface (IStorage) with in-memory implementation (MemStorage) for development
- **Validation**: Zod schemas for request validation with Drizzle-Zod integration
- **Development**: Hot module replacement with Vite middleware integration

### Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Three main tables - projects, tasks, and tags with proper relationships
- **Features**: UUID primary keys, timestamps, status enums, and array fields for tags
- **Migrations**: Drizzle Kit for schema management and migrations

### Theme System
- **Implementation**: Context-based theme provider with system preference detection
- **Storage**: LocalStorage persistence for user theme preferences
- **Variables**: CSS custom properties for consistent color theming across light/dark modes
- **Components**: Integrated theme toggle with Radix UI dropdown menu

### Search and Filtering
- **Implementation**: Debounced search with 300ms delay using custom hook
- **Scope**: Full-text search across projects and tasks
- **API**: Dedicated search endpoints for projects and tasks
- **UX**: Real-time search results with loading states and clear functionality

## External Dependencies

### Core Runtime
- **@neondatabase/serverless**: PostgreSQL database connection for production
- **drizzle-orm** & **drizzle-kit**: Database ORM and migration toolkit
- **express**: Node.js web framework for API server
- **tsx**: TypeScript execution for development server

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing
- **@radix-ui/***: Comprehensive set of accessible UI components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for components
- **lucide-react**: Icon library for consistent iconography

### Development Tools
- **vite**: Fast build tool and development server
- **@vitejs/plugin-react**: React support for Vite
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit-specific development enhancements

### Validation and Forms
- **zod**: TypeScript-first schema validation
- **@hookform/resolvers**: React Hook Form integration with Zod
- **react-hook-form**: Form state management and validation

### Utilities
- **date-fns**: Date manipulation and formatting
- **clsx** & **tailwind-merge**: Conditional CSS class utilities
- **nanoid**: Unique ID generation
- **cmdk**: Command palette component for search interfaces