# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Super Impress is an author-first LinkedIn content tool built as a full-stack monorepo. The project emphasizes authentic content creation with AI as a secondary tool, documented through Architecture Decision Records in the `decisions/` folder.

**Stack:**
- Backend: FastAPI (Python 3.13) with SQLModel ORM
- Frontend: SvelteKit (Svelte 5) with Tailwind CSS
- Database: PostgreSQL 18
- Package Managers: uv (Python), pnpm (Node)

## Development Commands

### Backend (Python FastAPI)
```bash
cd backend
uv sync                      # Install/sync dependencies
uv run fastapi dev          # Run dev server (auto-reload on :8000)
uv add <package>            # Add new dependency
```

### Frontend (SvelteKit)
```bash
cd frontend
pnpm install                # Install dependencies (uses frozen lockfile)
pnpm dev                   # Dev server on :5173
pnpm build                 # Build for production
pnpm test                  # Run unit (Vitest) + E2E (Playwright) tests
pnpm lint                  # ESLint check
pnpm format                # Prettier format
```

### Docker
```bash
docker compose up postgres -d    # Start PostgreSQL only
docker compose up -d             # Start all services (postgres, backend, frontend)
docker compose down              # Stop all services
```

### Code Quality
```bash
# Setup (one-time)
pip install pre-commit
pre-commit install

# Manual execution
pre-commit run              # Run on staged files
pre-commit run --all-files  # Run on entire codebase
```

Pre-commit hooks automatically run ruff (backend) and eslint/prettier (frontend) on commit.

## Architecture

### Backend Structure
```
backend/app/
├── main.py          # FastAPI app with lifespan hooks for DB initialization
├── config.py        # Pydantic-settings based configuration
├── database.py      # SQLModel engine and table creation
├── dependencies.py  # SessionDep for DB session injection
├── models/          # SQLModel models (e.g., Post)
└── routers/         # API endpoints organized by domain
```

**Key Patterns:**
- **Dependency Injection**: Use FastAPI's `Depends()` with `SessionDep` for database sessions
- **Configuration**: All settings managed via pydantic-settings in `config.py`, loaded from environment variables
- **Database**: SQLModel combines SQLAlchemy and Pydantic - models are both ORM and validation schemas. Tables auto-created on startup via `create_db_and_tables()` in lifespan
- **Routing**: Endpoints organized in `routers/` and included in `main.py` with prefixes (e.g., `/posts`)

**Database Connection:**
- Requires `DATABASE_URL` environment variable in backend/.env
- Format: `postgresql+psycopg://user:pass@host:port/dbname`
- For Docker: `postgresql+psycopg://postgres:password@localhost:5432/super_impress`

### Frontend Structure
```
frontend/src/
├── routes/          # File-based routing (SvelteKit)
│   ├── +layout.svelte    # Root layout
│   ├── +layout.ts        # Layout data loading
│   └── +page.svelte      # Home page
├── lib/
│   ├── assets/      # Static files (favicons, images)
│   └── index.ts     # Shared utilities
├── app.html         # HTML template
└── app.css          # Global styles (Tailwind)
```

**Key Patterns:**
- **API Integration**: Vite proxy configured in `vite.config.ts` maps `/api/*` to backend (controlled by `VITE_API_BASE` env var)
- **Routing**: File-based - `+page.svelte` files become routes, `+layout.svelte` for shared layouts
- **Static Export**: Using `@sveltejs/adapter-static` for deployment
- **Testing**: Unit tests alongside components (`.spec.ts`), E2E in `e2e/` directory

### Environment Configuration

**PostgreSQL (docker-compose)** - No setup required:
- Default credentials configured in `docker-compose.yml`:
  - `POSTGRES_USER=postgres`
  - `POSTGRES_PASSWORD=postgres`
  - `POSTGRES_DB=super_impress`
- Optional: Create root `.env` to override defaults

**Backend `.env`**:
- `DATABASE_URL` - PostgreSQL connection string
- Example: `postgresql+psycopg://postgres:postgres@localhost:5432/super_impress`

**Frontend `.env`**:
- `VITE_API_BASE` - Backend API URL (http://localhost:8000 for local dev)

## Important Notes

- **uv over pip**: This project uses uv for Python package management (10-100x faster). Always use `uv sync`, `uv add`, not pip
- **pnpm over npm**: Frontend uses pnpm with hoisted node_modules. Use `pnpm install`, not npm
- **Pre-commit Required**: Install pre-commit hooks before contributing - they enforce code quality standards
- **Database Schema**: No migration system currently - schema changes happen via SQLModel auto-creation on app startup
- **Decisions Folder**: Check `decisions/` for architectural decisions and rationale behind tech choices
