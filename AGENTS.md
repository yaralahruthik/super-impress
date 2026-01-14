# AGENTS.md

Guidelines for AI coding agents working in this monorepo.

## Repository Structure

```
super-impress/
├── backend/                 # FastAPI/Python backend (see backend/AGENTS.md)
├── frontend/                # SvelteKit frontend (see frontend/AGENTS.md)
├── docker-compose.yml       # Local services (PostgreSQL, Redis)
├── decisions/               # Architecture Decision Records
│   ├── product/            # Product decisions
│   └── tech/               # Technical decisions
└── .pre-commit-config.yaml  # Pre-commit hooks
```

## Quick Reference

| Component | Language    | Package Manager | Framework                |
| --------- | ----------- | --------------- | ------------------------ |
| Backend   | Python 3.13 | uv              | FastAPI + SQLAlchemy 2.0 |
| Frontend  | TypeScript  | pnpm            | SvelteKit + Svelte 5     |
| Database  | PostgreSQL  | -               | PostgreSQL 18            |
| Cache     | Redis       | -               | Redis 8 (Alpine)         |

## Build/Lint/Test Commands

### Backend (run from `backend/` directory)

```bash
# Setup
uv sync                         # Install dependencies

# Development
uv run fastapi dev              # Start dev server (hot reload)

# Database
uv run alembic upgrade head                              # Apply migrations
uv run alembic revision --autogenerate -m "description"  # Create migration

# Lint/Format
uv run ruff check .             # Lint
uv run ruff check --fix .       # Lint + auto-fix
uv run ruff format .            # Format

# Testing
uv run pytest                                            # All tests
uv run pytest path/to/test_file.py                       # Single file
uv run pytest path/to/test_file.py::test_function_name   # Single test
uv run pytest -k "pattern"                               # Pattern match
```

### Frontend (run from `frontend/` directory)

```bash
# Setup
pnpm install                    # Install dependencies

# Development
pnpm dev                        # Start dev server
pnpm build                      # Production build
pnpm check                      # Type checking

# Lint/Format
pnpm lint:check                 # Check ESLint
pnpm lint                       # Fix ESLint
pnpm format:check               # Check Prettier
pnpm format                     # Fix Prettier

# Testing
pnpm test:unit -- --run                                  # All unit tests (once)
pnpm test:unit -- --run src/path/to/file.spec.ts         # Single file
pnpm test:unit -- --run -t "test name"                   # Pattern match
pnpm test:e2e                                            # All E2E tests
pnpm test:e2e e2e/specific.test.ts                       # Single E2E file
pnpm test:e2e --grep "test name"                         # E2E pattern match

# Code Generation
pnpm codegen                    # Regenerate API client (backend must be running)
```

### Docker (run from project root)

```bash
docker compose up -d                 # Start all services
docker compose up postgres -d        # Start only PostgreSQL
docker compose up redis -d           # Start only Redis
docker compose up postgres redis -d  # Start data services only
docker compose down                  # Stop all services
```

## Code Style Guidelines

### Backend (Python)

- **Formatter/Linter:** Ruff
- **Imports:** stdlib, third-party, local (separated by blank lines)
- **Naming:** snake_case (files, functions, variables), PascalCase (classes)
- **Types:** Always use type hints; `Annotated` for DI, `Mapped[T]` for ORM
- **Errors:** `HTTPException` with `status.HTTP_XXX` codes
- **Structure:** Feature packages with `models.py`, `service.py`, `router.py`
- **Schemas:** `XxxBase`, `XxxCreate`, `XxxUpdate`, `XxxPublic` pattern
- **Async:** Routers are `async def`, services are sync unless making HTTP calls

### Frontend (TypeScript/Svelte)

- **Formatter:** Prettier (tabs, single quotes, no trailing commas, 100 width)
- **Linter:** ESLint with Svelte/TypeScript plugins
- **Imports:** SvelteKit, libraries, local components, relative (in order)
- **Naming:** kebab-case (files), PascalCase (components/types), camelCase (functions)
- **Svelte 5:** Use runes (`$props()`, `$bindable()`, `{@render}`)
- **Variants:** class-variance-authority (CVA) pattern
- **Classes:** `cn()` utility for conditional merging
- **Forms:** TanStack Form + Zod validation
- **Errors:** `getErrorMessage()` utility for API errors
- **Tests:** Vitest (unit), Playwright (E2E with accessible selectors)

## Pre-commit Hooks

Pre-commit runs automatically on staged files:

- **Backend:** Ruff check + format
- **Frontend:** Prettier format + ESLint
- **General:** trailing whitespace, EOF fixer, YAML check, large file check

Setup:

```bash
pip install pre-commit
pre-commit install
```

Run manually:

```bash
pre-commit run --all-files
```

## API Client Generation

The frontend API client in `frontend/src/lib/api/` is auto-generated from the backend OpenAPI spec.

**DO NOT manually edit files in `frontend/src/lib/api/`** (except `axios.ts` for interceptors).

To regenerate after backend API changes:

```bash
# 1. Ensure backend is running
cd backend && uv run fastapi dev

# 2. Regenerate client
cd frontend && pnpm codegen
```

## Environment Setup

### Backend

Create `backend/.env`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/super_impress
REDIS_HOST=localhost
REDIS_PORT=6379
SECRET_KEY=your-secret-key
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

### Frontend

Create `frontend/.env`:

```
PUBLIC_API_URL=http://localhost:8000
```

## Testing Strategy

- **Backend unit tests:** Co-located with modules (`test_*.py`)
- **Frontend unit tests:** Vitest in `*.spec.ts` files
- **E2E tests:** Playwright in `frontend/e2e/` directory

Run tests before committing changes. CI pipelines check:

- Backend formatting (Ruff)
- Frontend formatting (Prettier + ESLint)
- E2E tests (Playwright)

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.

## Detailed Documentation

For comprehensive guidelines specific to each subsystem:

- **Backend:** See `backend/AGENTS.md` (Python/FastAPI patterns, SQLAlchemy, Pydantic)
- **Frontend:** See `frontend/AGENTS.md` (Svelte 5, TanStack, component patterns)
