# Modules and Features Log

This document tracks all successfully implemented modules and features in the application.
For each entry, we describe its purpose, operational flow, and system connections.

## 1. Authentication System
*   **Description**: A robust, secure authentication engine handling user login, session management, and password security. It uses JSON Web Tokens (JWT) for stateless authentication and Bcrypt for password hashing.
*   **Flow**:
    1.  User submits credentials on the Login Page (`/login`).
    2.  Server verifies credentials and issues an HTTP-only JWT cookie.
    3.  `middleware.ts` intercepts requests to protected routes, verifying the token.
    4.  Invalid tokens redirect to login; valid tokens allow access.
*   **Connections**:
    *   **Database**: `User` model (stores hashed passwords).
    *   **Libraries**: `lib/jwt.ts` (token logic), `lib/password.ts` (hashing).
    *   **Middleware**: Protects `/dashboard` and `/api/protected` routes.

## 2. Role-Based Access Control (RBAC)
*   **Description**: A granular permission system that restricts access to features and data based on user roles. It supports dynamic role assignment and permission checking.
*   **Flow**:
    1.  **Definition**: Roles (e.g., Admin, Manager) and Permissions (e.g., `create:users`) are defined in the database.
    2.  **Assignment**: Admins assign roles to users via the User Management interface.
    3.  **Enforcement**:
        *   **UI**: The `<Protect>` component hides/disables elements (buttons, links) if the user lacks permissions.
        *   **Server**: API routes and Server Actions verify permissions before executing logic.
*   **Connections**:
    *   **Database**: `Role`, `Permission`, `RolePermission`, `UserRole` models.
    *   **Components**: `<Protect>` component, `Sidebar` (filters links).
    *   **Utilities**: `lib/rbac.ts` (`hasPermission`, `hasRole`).

## 3. User Management Module
*   **Description**: A comprehensive interface for administrators to view, onboard, and manage system users.
*   **Flow**:
    1.  **List View**: Displays a paginated/searchable table of users with their roles and status.
    2.  **Creation**: "Add User" form creates a new account and assigns initial roles.
    3.  **Management**: Admins can update details, change roles, or deactivate users.
*   **Connections**:
    *   **RBAC**: "Add User" and "Edit" actions are protected by RBAC permissions.
    *   **Database**: CRUD operations on the `User` model.

## 4. Dashboard & Layout Engine
*   **Description**: The core application shell providing a responsive, consistent user interface structure.
*   **Flow**:
    1.  **Layout**: Wraps all dashboard pages, providing a consistent Sidebar and Header.
    2.  **Navigation**: Sidebar dynamically renders links based on the user's permissions (hiding inaccessible modules).
    3.  **Responsive**: Adapts to mobile and desktop screens with collapsible navigation.
*   **Connections**:
    *   **Auth**: Displays current user info in the header.
    *   **Theming**: Hosts the Theme Toggles and applies global styles.

## 5. Theme & UI Customization
*   **Description**: A personalization engine allowing users to choose from over 25 professional color palettes and toggle between Light/Dark modes.
*   **Flow**:
    1.  **Selection**: User selects a theme from the Settings or Profile menu.
    2.  **Application**: `ThemeProvider` injects CSS variables (H/S/L values) into the document root.
    3.  **Persistence**: Preferences are saved (e.g., local storage) to persist across sessions.
*   **Connections**:
    *   **Global Styles**: Updates `globals.css` variables dynamically.
    *   **UI Library**: All `shadcn/ui` components automatically adapt to the active theme colors.

## 6. Database Layer (Prisma ORM)
*   **Description**: The data backbone of the application, managing the schema, migrations, and type-safe database access.
*   **Flow**:
    1.  **Schema**: Defined in `prisma/schema.prisma`.
    2.  **Seeding**: `prisma/seed.ts` populates initial data (default Admin user, basic Roles/Permissions).
    3.  **Access**: `lib/prisma.ts` provides a singleton client for the app to query the database.
*   **Connections**:
    *   Underpins **ALL** other modules (Auth, Users, RBAC, etc.) by providing data persistence.
