# Project Overview

This is a web application for a bookstore. It is built with React, TypeScript, and Vite. It uses Supabase for the backend and Tailwind CSS for styling.

The application allows users to:
- Browse a list of books
- Purchase books
- View their purchased books in a library
- Upload new books (for users with the "author" or "admin" role)

# Building and Running

To run the project locally, you will need to have Node.js and npm installed.

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the following variables:
    ```
    VITE_SUPABASE_URL=<your-supabase-url>
    VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

To build the project for production, run:
```bash
npm run build
```

# Development Conventions

- The project uses ESLint for linting. To run the linter, use `npm run lint`.
- The project uses TypeScript for type checking. To run the type checker, use `npm run typecheck`.
- The project follows the standard file structure for a Vite + React project.
- Components are located in the `src/components` directory.
- The Supabase client is initialized in `src/lib/supabase.ts`.
- The main application component is `src/App.tsx`.
