# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Super Impress is a full-stack web application for creating authentic LinkedIn content. It's built as a community project in public, prioritizing author-first content creation over AI-generated posts.

**Stack:**
- Frontend: SvelteKit SPA with TailwindCSS, TanStack Query
- Backend: FastAPI (Python 3.13) with SQLAlchemy ORM
- Database: PostgreSQL 18
- Package Managers: pnpm (frontend), uv (backend)

**Monorepo Structure:**
```
.
├── frontend/          # SvelteKit SPA (see frontend/CLAUDE.md)
├── backend/           # FastAPI API server (see backend/CLAUDE.md)
├── decisions/         # Architectural Decision Records (ADRs)
│   ├── tech/          # Technical decisions
│   └── product/       # Product decisions
└── docker-compose.yml # Multi-service orchestration
```

Each subdirectory has its own CLAUDE.md with detailed guidance. This file covers cross-cutting concerns and project-wide workflows.

## Quick Start

### Prerequisites
- Node.js 24.11.1
- pnpm 10.25.0+
- Python 3.13
- uv package manager
- Docker + Docker Compose
- pre-commit (optional but recommended)

### Full Stack Setup (Recommended for Development)

```bash
# 1. Install pre-commit hooks (optional)
pip install pre-commit  # or: uv tool install pre-commit
pre-commit install

# 2. Start PostgreSQL in Docker
docker compose up postgres -d

# 3. Setup backend
cd backend
cp .env.example .env  # Edit DATABASE_URL to use localhost:5432
uv sync
uv run alembic upgrade head
uv run fastapi dev  # Runs on http://localhost:8000

# 4. Setup frontend (in new terminal)
cd frontend
cp .env.example .env  # Set VITE_API_BASE=http://localhost:8000
pnpm install
pnpm codegen  # Generate API client from backend OpenAPI spec
pnpm dev  # Runs on http://localhost:5173
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/docs (Swagger UI)
- PostgreSQL: localhost:5432

### Alternative: Full Docker Setup

```bash
# Configure backend/.env with DATABASE_URL using 'postgres' hostname
docker compose up -d
docker compose exec backend uv run alembic upgrade head
```

## Development Workflow

### Working on Backend

```bash
cd backend

# Make model changes in app/*/models.py
# Create migration
uv run alembic revision --autogenerate -m "add user profile"

# Review migration in migrations/versions/
# Apply migration
uv run alembic upgrade head

# Run tests
uv run pytest

# Lint/format
uv run ruff check . --fix
uv run ruff format .
```

See `backend/CLAUDE.md` for detailed backend architecture and patterns.

### Working on Frontend

```bash
cd frontend

# After backend API changes, regenerate client
pnpm codegen  # Backend must be running on localhost:8000

# Run dev server
pnpm dev

# Run tests
pnpm test:unit  # Unit tests
pnpm test:e2e   # E2E tests with Playwright

# Lint/format
pnpm lint
pnpm format
```

See `frontend/CLAUDE.md` for detailed frontend architecture and patterns.

### Adding New Features

When implementing features that span frontend and backend:

1. **Backend First:**
   - Add SQLAlchemy models in `backend/app/{feature}/models.py`
   - Create migration: `uv run alembic revision --autogenerate -m "..."`
   - Add routes in `backend/app/{feature}/router.py`
   - Add business logic in `backend/app/{feature}/service.py`
   - Register router in `backend/app/main.py`
   - Test backend endpoint in Swagger UI

2. **Frontend Second:**
   - Regenerate API client: `cd frontend && pnpm codegen`
   - Create UI components in `frontend/src/lib/features/{feature}/`
   - Add route in `frontend/src/routes/`
   - Use generated TanStack Query hooks from `src/lib/api/`

3. **Protected Routes:**
   - Backend: Add `current_user: CurrentUserDep` to endpoint
   - Frontend: Place route under `src/routes/(protected)/`

### Pre-commit Hooks

Hooks run automatically on commit after `pre-commit install`:

**Backend:**
- Ruff linting (auto-fix)
- Ruff formatting

**Frontend:**
- Prettier formatting
- ESLint linting

**General:**
- Trailing whitespace removal
- End-of-file fixer
- YAML validation
- Large file check
- Merge conflict detection

**Manual execution:**
```bash
pre-commit run              # Run on staged files
pre-commit run --all-files  # Run on entire codebase
```

## Architecture Decisions

All technical decisions are documented in `decisions/tech/`:
- `1-svelte.md` - Frontend framework choice
- `2-docker.md` - Containerization strategy
- `3-uv.md` - Python package manager
- `4-pnpm.md` - JavaScript package manager
- `5-postgresql.md` - Database choice
- `6-authentication.md` - Auth strategy (JWT)
- `7-ui-component-architecture.md` - Component patterns
- `8-ui-form-decisions.md` - Form handling
- `9-orval-api-client.md` - API client generation

When making architectural changes, document them following the existing ADR format.

## Key Integration Points

### API Client Generation (Orval)

Frontend API client is auto-generated from backend OpenAPI spec:

```bash
# In frontend directory
pnpm codegen
```

**Configuration:** `frontend/orval.config.ts`
- Fetches spec from `http://localhost:8000/openapi.json`
- Generates TanStack Query hooks in `src/lib/api/`
- Splits by OpenAPI tags (authentication, default, etc.)
- Uses custom axios instance with auth interceptors

**Important:** Backend must be running before codegen.

### Authentication Flow

**Backend (JWT):**
- Login: `POST /api/login` returns JWT token
- Protected routes: Use `CurrentUserDep` dependency
- Password hashing: Argon2 via pwdlib
- Config: `backend/app/auth/config.py`

**Frontend (Token Storage):**
- Token stored in localStorage via `auth` store
- Axios interceptor auto-adds `Authorization` header
- 401 responses trigger logout + redirect to `/login`
- Protected routes use layout guard in `(protected)/+layout.ts`

### Database Migrations

Backend uses Alembic for schema management:

```bash
# Create migration after model changes
cd backend
uv run alembic revision --autogenerate -m "description"

# Review generated file in migrations/versions/
# Apply migration
uv run alembic upgrade head

# Rollback
uv run alembic downgrade -1
```

**Important:** Always review autogenerated migrations before applying.

## Docker Modes

### Mode 1: Local Backend + Docker PostgreSQL (Recommended)
- Fast backend restarts for active development
- Easy debugging with local Python process
- Backend `.env`: `DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/super_impress`

```bash
docker compose up postgres -d
cd backend && uv run fastapi dev
```

### Mode 2: Full Docker (Backend + PostgreSQL)
- Consistent environment across team
- Closer to production setup
- Backend `.env`: `DATABASE_URL=postgresql+psycopg://postgres:postgres@postgres:5432/super_impress`

```bash
docker compose up -d
docker compose exec backend uv run alembic upgrade head
```

**Key Difference:** Hostname in DATABASE_URL (`localhost` vs `postgres`)

## Testing Strategy

**Backend:**
- Framework: pytest
- Location: Test files alongside implementation (`test_*.py`)
- Run: `cd backend && uv run pytest`

**Frontend:**
- Unit tests: Vitest with browser mode for components
- E2E tests: Playwright
- Run: `cd frontend && pnpm test`
- Single file: `pnpm vitest run src/path/to/test.spec.ts`

## Common Gotchas

1. **API client out of sync:** Always run `pnpm codegen` after backend changes
2. **Migration conflicts:** Pull latest before creating new migrations
3. **DATABASE_URL hostname:** Use `localhost` for local backend, `postgres` for Docker backend
4. **Pre-commit failures:** Hooks auto-format code; review changes before re-committing
5. **Protected routes:** Frontend route guards only work in `(protected)` group
6. **Token expiry:** Default 30 minutes (configured in backend auth settings)

## Development Tips

- **Backend hot reload:** `uv run fastapi dev` auto-reloads on file changes
- **Frontend hot reload:** `pnpm dev` has Vite HMR
- **API exploration:** Use Swagger UI at http://localhost:8000/docs
- **Database inspection:** Connect to `localhost:5432` with any PostgreSQL client
- **Type safety:** Both frontend and backend use strict typing (TypeScript + mypy-style hints)

## Feature Organization

Both frontend and backend use feature-based organization:

**Backend:**
```
app/
└── {feature}/
    ├── models.py     # SQLAlchemy models + Pydantic schemas
    ├── router.py     # FastAPI endpoints
    ├── service.py    # Business logic
    └── config.py     # Feature-specific settings
```

**Frontend:**
```
src/lib/features/{feature}/
├── component-name.svelte
├── another-component.svelte
└── utils.ts
```

When adding new features, follow this modular structure rather than organizing by file type.
