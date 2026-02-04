# AGENTS.md - Super Impress

Guidelines for AI coding agents working in this monorepo.

## Overview

Super Impress is a LinkedIn post management tool with a monorepo structure:

- **Frontend**: React 19 SPA with TypeScript → see `frontend/AGENTS.md`
- **Backend**: Bun + Elysia + TypeScript API → see `backend/AGENTS.md`

Always check the detailed AGENTS.md in the relevant subdirectory for comprehensive guidelines.

## Repository Structure

```
super-impress/
├── frontend/             # React/TypeScript SPA (pnpm)
│   ├── src/
│   │   ├── api/          # Auto-generated - DO NOT EDIT
│   │   ├── components/   # UI components (shadcn/ui)
│   │   ├── features/     # Feature modules
│   │   └── routes/       # TanStack Router file-based routes
│   └── AGENTS.md         # Frontend-specific guidelines
├── backend/              # Bun/Elysia/TypeScript API
│   ├── src/
│   │   ├── modules/      # Feature modules (posts, linkedin)
│   │   ├── db/           # Database layer (Drizzle)
│   │   └── auth.ts       # better-auth configuration
│   ├── drizzle/          # Database migrations
│   └── AGENTS.md         # Backend-specific guidelines
├── decisions/            # Architecture Decision Records
│   ├── product/          # Product decisions
│   └── tech/             # Technical decisions
├── docker-compose.yml    # Development infrastructure
└── .pre-commit-config.yaml
```

## Docker Commands (Development Infrastructure)

Start individual services:

```bash
docker compose up postgres -d     # PostgreSQL database
docker compose up redis -d        # Redis cache/state store
docker compose up backend -d      # Backend + all dependencies
docker compose up -d              # All services
```

Database migrations (Docker mode):

```bash
docker compose exec backend bun run drizzle-kit push
docker compose exec backend bun run drizzle-kit generate
```

Redis debugging:

```bash
docker compose exec redis redis-cli ping
docker compose exec redis redis-cli KEYS "oauth_state:*"
docker compose exec redis redis-cli MONITOR
```

## Quick Command Reference

### Frontend (run from `frontend/`)

| Command             | Description                             |
| ------------------- | --------------------------------------- |
| `pnpm dev`          | Start development server                |
| `pnpm build`        | TypeScript check + production build     |
| `pnpm lint:check`   | Check for ESLint issues                 |
| `pnpm lint`         | Fix ESLint issues                       |
| `pnpm format:check` | Check Prettier formatting                |
| `pnpm format`       | Format with Prettier                    |
| `pnpm orval`        | Regenerate API client from OpenAPI spec |

Note: No test framework configured for frontend.

### Backend (run from `backend/`)

| Command                          | Description                   |
| -------------------------------- | ----------------------------- |
| `bun run dev`                    | Development server with watch  |
| `bun run build`                  | Production build (if configured) |
| `bun run lint`                   | Run Biome linter (auto-fix)   |
| `bun run format`                 | Format code with Biome        |
| `bun run typecheck`              | TypeScript type checking      |
| `bun run drizzle-kit push`       | Push database schema changes   |
| `bun run drizzle-kit generate`   | Generate migrations           |
| `bun run test`                   | Run tests (not implemented)   |

## Code Style Summary

### Frontend

- **Formatting**: Tabs, single quotes, no trailing commas, 100 char width
- **TypeScript**: Strict mode, no `any`, use `import type` for type-only imports
- **Imports**: Use `@/` path alias for internal imports
- **Components**: Function components only, CVA for variants, `cn()` for class merging

### Backend

- **Runtime**: Bun with TypeScript
- **Formatting**: Biome (tabs, single quotes)
- **Linting**: Biome with auto-import organization
- **Type hints**: Required for all function parameters and return types
- **Framework**: Elysia with TypeBox validation schemas
- **Database**: Drizzle ORM with PostgreSQL
- **Imports**: Organized automatically by Biome

## Database Management

### Backend Patterns

- **Schemas**: Use TypeBox schemas in `model.ts` files for request/response validation
- **Database**: Drizzle ORM with schema definitions in `src/db/schema/`
- **Migrations**: Use `bun run drizzle-kit generate` then `bun run drizzle-kit push`
- **Services**: Business logic in `service.ts` files
- **Routes**: API endpoints in `index.ts` files with Elysia route definitions

### Module Structure

Each feature module follows this pattern:

```
modules/[feature]/
├── index.ts      # Elysia routes and endpoints
├── model.ts      # TypeBox validation schemas
├── service.ts    # Business logic and database operations
└── client.ts     # External API clients (if needed)
```

## Git Hooks (pre-commit)

Hooks run automatically on commit:

- **Biome** (backend only): Linting and formatting
- **Prettier/ESLint** (frontend only): Code formatting and linting
- **General**: Trailing whitespace, end-of-file fixer, YAML validation, large file check (1MB max)

Manual execution:

```bash
prek run              # Staged files only
prek run --all-files  # All files
```

## Critical Notes

1. **Auto-generated code**: `frontend/src/api/` is generated by Orval. Never edit manually. Regenerate with `pnpm orval` after backend API changes.

2. **Environment files**: `frontend/.env` and `backend/.env` are not committed. See README.md for required variables.

3. **Database**: PostgreSQL via Docker. Always use Drizzle migrations, never modify the database directly.

4. **Package managers**: Use `pnpm` for frontend, `bun` for backend. Do not mix.

5. **Testing**: No test frameworks are currently configured. Tests need to be set up from scratch.

6. **API Documentation**: Backend uses @elysiajs/openapi for automatic OpenAPI/Swagger documentation.

## Development Workflow

### Starting Development

1. Start infrastructure: `docker compose up postgres redis -d`
2. Start backend: `cd backend && bun run dev`
3. Start frontend: `cd frontend && pnpm dev`

### Making Changes

1. Backend changes automatically restart with `bun --watch`
2. Frontend hot reloads with Vite HMR
3. Database schema changes require Drizzle migrations
4. API changes require regenerating frontend client: `pnpm orval`

### Code Quality

- Backend: `bun run lint` and `bun run format` (Biome)
- Frontend: `pnpm lint` and `pnpm format` (ESLint + Prettier)
- Type checking: `bun run typecheck` (backend), `pnpm build` (frontend includes type check)
