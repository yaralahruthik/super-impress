# AGENTS.md - SuperImpress

Guidelines for AI coding agents working in this monorepo.

## Overview

SuperImpress is a LinkedIn post management tool with a monorepo structure:

- **Frontend**: React 19 SPA with TypeScript → see `frontend/AGENTS.md`
- **Backend**: Bun + Elysia + TypeScript API → see `backend/AGENTS.md`
- **Docs**: TanStack Start + Fumadocs documentation site → see `docs/AGENTS.md`

Always check the detailed AGENTS.md in the relevant subdirectory for comprehensive guidelines.

## Repository Structure

```
super-impress/
├── frontend/             # React/TypeScript SPA (bun)
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
├── docs/                 # TanStack Start + Fumadocs documentation site
│   ├── content/docs/     # MDX documentation content
│   ├── src/              # React components and routing
│   └── AGENTS.md         # Docs-specific guidelines
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

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `bun dev`       | Start development server                 |
| `bun run build` | TypeScript check + production build      |
| `bun run check` | Check formatting and linting (ultracite) |
| `bun run fix`   | Fix formatting and linting (ultracite)   |
| `bun run orval` | Regenerate API client from OpenAPI spec  |

Note: No test framework configured for frontend.

### Documentation (run from `docs/`)

| Command               | Description                              |
| --------------------- | ---------------------------------------- |
| `bun dev`             | Start development server                 |
| `bun run build`       | Production build                         |
| `bun run types:check` | TypeScript and MDX validation            |
| `bun run check`       | Check formatting and linting (ultracite) |
| `bun run fix`         | Fix formatting and linting (ultracite)   |

Note: Uses Biome for linting and formatting, not ESLint/Prettier.

### Backend (run from `backend/`)

| Command                        | Description                      |
| ------------------------------ | -------------------------------- |
| `bun run dev`                  | Development server with watch    |
| `bun run build`                | Production build (if configured) |
| `bun run check`                | Check formatting and linting (ultracite) |
| `bun run fix`                  | Fix formatting and linting (ultracite)   |
| `bun run typecheck`            | TypeScript type checking         |
| `bun run drizzle-kit push`     | Push database schema changes     |
| `bun run drizzle-kit generate` | Generate migrations              |
| `bun run test`                 | Run tests (not implemented)      |

## Code Style Summary

### Frontend

- **Formatting/Linting**: ultracite (Biome-based) — tabs, single quotes, no trailing commas, 100 char width
- **TypeScript**: Strict mode, no `any`, use `import type` for type-only imports
- **Imports**: Use `@/` path alias for internal imports
- **Components**: Function components only, CVA for variants, `cn()` for class merging

### Documentation

- **Runtime**: TanStack Start + React with TypeScript
- **Formatting**: Biome (2 spaces, single quotes)
- **Linting**: Biome with auto-import organization
- **Content**: MDX files in `content/docs/`
- **Framework**: Fumadocs for documentation UI
- **Package Manager**: bun

### Backend

- **Runtime**: Bun with TypeScript
- **Formatting**: ultracite (Biome-based) — tabs, single quotes
- **Linting**: ultracite with auto-import organization
- **Type hints**: Required for all function parameters and return types
- **Framework**: Elysia with TypeBox validation schemas
- **Database**: Drizzle ORM with PostgreSQL
- **Imports**: Organized automatically by ultracite

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

- **ultracite** (backend, frontend, docs): Linting and formatting
- **General**: Trailing whitespace, end-of-file fixer, YAML validation, large file check (1MB max)

Manual execution:

```bash
prek run              # Staged files only
prek run --all-files  # All files
```

## Critical Notes

1. **Auto-generated code**: `frontend/src/api/` is generated by Orval. Never edit manually. Regenerate with `bun run orval` after backend API changes.

2. **Environment files**: `frontend/.env` and `backend/.env` are not committed. See README.md for required variables.

3. **Database**: PostgreSQL via Docker. Always use Drizzle migrations, never modify the database directly.

4. **Package managers**: Use `bun` for all packages.

5. **Testing**: No test frameworks are currently configured. Tests need to be set up from scratch.

6. **API Documentation**: Backend uses @elysiajs/openapi for automatic OpenAPI/Swagger documentation.

## Development Workflow

### Starting Development

1. Start infrastructure: `docker compose up postgres redis -d`
2. Start backend: `cd backend && bun run dev`
3. Start frontend: `cd frontend && bun dev`
4. Start docs: `cd docs && bun dev`

### Making Changes

1. Backend changes automatically restart with `bun --watch`
2. Frontend hot reloads with Vite HMR
3. Database schema changes require Drizzle migrations
4. API changes require regenerating frontend client: `bun run orval`

### Code Quality

- Backend: `bun run check` and `bun run fix` (ultracite)
- Frontend: `bun run check` and `bun run fix` (ultracite)
- Docs: `bun run check` and `bun run fix` (ultracite)
- Type checking: `bun run typecheck` (backend), `bun run build` (frontend includes type check), `bun run types:check` (docs)
