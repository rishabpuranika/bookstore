# Agent Guidelines for Bookstore Project

## Commands
- **Dev server**: `npm run dev` (Vite)
- **Build**: `npm run build` (Vite build)
- **Lint**: `npm run lint` (ESLint)
- **Type check**: `npm run typecheck` (TypeScript)
- **No test framework configured**

## Code Style
- **Language**: TypeScript with strict mode enabled
- **Framework**: React with hooks
- **Styling**: Tailwind CSS
- **Imports**: React → external libs → relative imports
- **Naming**: PascalCase (components/interfaces), camelCase (functions/vars), snake_case (DB fields)
- **Types**: Explicit interfaces, union types for enums, nullable with `| null`
- **Patterns**: Destructuring, optional chaining (`?.`), nullish coalescing (`??`)
- **Async**: Async/await for API calls, throw errors on failure
- **Formatting**: No semicolons, 2-space indentation (inferred from ESLint)