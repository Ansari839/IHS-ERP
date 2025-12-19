# SpecKit Plus ERP

A modern, comprehensive Enterprise Resource Planning (ERP) system built with Next.js 16, Prisma, and PostgreSQL. This application features a robust authentication system, granular Role-Based Access Control (RBAC), and a dynamic, customizable user interface.

## 🚀 Features

### Core Modules
-   **Authentication**: Secure login system using JWT (stateless) and Bcrypt password hashing. Includes middleware protection for routes and API endpoints.
-   **Role-Based Access Control (RBAC)**: Granular permission system allowing dynamic assignment of roles (e.g., Admin, Manager) and permissions (e.g., `create:users`) to users.
-   **User Management**: Complete administration interface to view, add, edit, and manage system users and their roles.
-   **Dashboard**: Responsive, collapsible sidebar navigation that dynamically adapts based on user permissions.

### UI/UX
-   **Theme Customization**: Built-in theme engine with over 25+ professional color palettes.
-   **Dark Mode**: Fully supported dark/light mode toggling.
-   **Modern Components**: Built using `shadcn/ui` (Radix primitives) and Tailwind CSS v4 for a premium, accessible feel.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
-   **ORM**: [Prisma](https://www.prisma.io/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/) / Radix UI
-   **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### Prerequisites
-   Node.js (v18+ recommended)
-   PostgreSQL database

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd erp
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your database connection string and JWT secret:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/erp_db?schema=public"
    JWT_SECRET="your-super-secret-key-change-this"
    ```

4.  **Database Setup**
    Run the Prisma migrations to create the database schema:
    ```bash
    npx prisma migrate dev
    ```

    Seed the database with initial data (Admin user, default roles/permissions):
    ```bash
    npm run db:seed
    ```
    *Default Admin Login: `admin@example.com` / `password123`* (Check `prisma/seed.ts` to confirm)

5.  **Run the Development Server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📂 Project Structure

-   `/app`: Next.js App Router pages and layouts.
    -   `/api`: Backend API routes.
    -   `/dashboard`: Protected dashboard pages.
    -   `/users`: User management pages.
-   `/components`: Reusable UI components (buttons, inputs, etc.).
-   `/lib`: Utility functions (auth, db, rbac).
-   `/prisma`: Database schema and seed scripts.
-   `/middleware.ts`: Auth protection middleware.

## 📄 Documentation

For a detailed log of implemented modules and their operational flows, please refer to [MODULES.md](./MODULES.md).
