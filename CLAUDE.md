# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Textile ERP - A Next.js 16 ERP system for textile manufacturing and management. Uses the App Router, Prisma ORM with PostgreSQL, and JWT-based authentication.

## Development Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

### Database Commands

```bash
npx prisma migrate dev     # Run migrations in development
npx prisma migrate deploy  # Run migrations in production
npx prisma generate        # Generate Prisma client
npx tsx prisma/seed.ts     # Seed database with initial users
```

## Architecture

### Directory Structure

- `app/` - Next.js App Router pages and API routes
- `app/api/` - API route handlers (thin layer, delegates to controllers)
- `app/generated/prisma/` - Auto-generated Prisma client (do not edit)
- `controllers/` - Business logic layer (no HTTP handling)
- `middleware/` - Request middleware (auth, error handling)
- `lib/` - Utility functions and shared logic
- `components/` - React components (UI and layout)
- `components/ui/` - shadcn/ui base components (Radix-based)
- `constants/` - Application constants (auth, HTTP, roles)
- `types/` - TypeScript type definitions
- `prisma/` - Database schema and migrations

### API Layer Pattern

Routes follow a thin handler pattern:
1. Route handler (`app/api/.../route.ts`) - HTTP layer only, validates and delegates
2. Controller (`controllers/`) - Contains business logic, returns `ControllerResponse<T>`
3. Response helpers (`lib/response.ts`) - Standardized HTTP responses

Example flow:
```
route.ts → controller → lib utilities → Prisma
```

### Authentication System

- JWT-based with access + refresh tokens
- Access token: Short-lived, stored client-side
- Refresh token: Longer-lived, stored in DB
- Middleware: `middleware/authenticate.ts` - protects routes
- Controller: `controllers/authController.ts` - login/refresh/logout logic
- Currently has in-memory demo mode (see `DEMO_USER` in authController)

User roles: `USER`, `ADMIN`, `SUPER_ADMIN`

### Color System

Uses OKLCH color space with auto-generated shades. Three main colors:
- `brand` - Primary purple/blue
- `accent` - Secondary teal/cyan
- `neutral` - Grays

Configure base colors in `lib/color-config.ts`. CSS variables in `app/globals.css` map to Tailwind classes.

### Component Patterns

- UI components use shadcn/ui patterns with Radix primitives
- Dashboard layout: `DashboardLayout` wraps pages with sidebar + header
- Theme: Dark/light mode via `ThemeProvider` component

### Path Aliases

`@/*` maps to project root (configured in `tsconfig.json`)

## Key Files

- `lib/prisma.ts` - Singleton Prisma client with PG adapter
- `lib/response.ts` - HTTP response helpers (success, error, unauthorized, etc.)
- `lib/jwt.ts` - Token generation and verification
- `lib/validation.ts` - Input validation
- `middleware/errorHandler.ts` - Global error wrapper for routes
- `constants/index.ts` - Central export for all constants
