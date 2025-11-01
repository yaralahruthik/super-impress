# Getting Started With Backend

We use [uv](https://github.com/astral-sh/uv) for dependency management. It's 10-100x faster than pip, built in Rust, and provides reproducible environments via lockfiles.

## Installation

Follow the [official installation instructions](https://docs.astral.sh/uv/getting-started/installation/)

## Quick Start

```bash
# Setup virtual environment for the project and install dependencies
uv sync

source .venv/bin/activate

# Run application
uv run fastapi dev
```

## Key Commands

```bash
uv sync              # Install dependencies
uv add <package>     # Add dependency
uv remove <package>  # Remove dependency
uv run <command>     # Run in virtual environment
uv pip list          # Show installed packages
```

## Pre-commit Setup

This project uses pre-commit hooks to ensure code quality and consistency.

**Steps to setup pre-commit:**

```bash
# Install pre-commit
pip install pre-commit

# or if you have uv installed
uv tool install pre-commit

# Install the git hooks
pre-commit install
```

Now pre-commit hooks will automatically run on staged files before each commit. If a hook fails, the commit will be blocked until issues are resolved.

**Manual execution (optional):**

```bash
# Run on staged files
pre-commit run

# Run on all files
pre-commit run --all-files
```

## Database Setup

This project uses PostgreSQL as the primary database. The database choice is documented in `decisions/tech/5-postgresql.md`.

The application connects via `DATABASE_URL` and works with any PostgreSQL instance - Docker (recommended for development), local installation, or cloud services like Supabase.

### Development Setup

There are two ways to run the backend during development:

#### Option 1: Local Backend + Docker PostgreSQL (Recommended)

Run the backend on your machine with PostgreSQL in Docker. Best for active development.

**1. Create `backend/.env`:**
```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/super_impress
```

**2. Start PostgreSQL:**
```bash
# From project root
docker compose up postgres -d
```

**3. Run backend:**
```bash
cd backend
uv sync
uv run fastapi dev
```

**Note:** Use `localhost` as the database hostname since the backend runs on your local machine.

#### Option 2: Full Docker (Backend + PostgreSQL)

Run everything in Docker containers.

**1. Create `backend/.env`:**
```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@postgres:5432/super_impress
```

**2. Start all services:**
```bash
# From project root
docker compose up -d
```

**Note:** Use `postgres` as the database hostname since both services run in Docker and communicate via Docker networking.

### Switching Between Modes

To switch from one mode to another, simply update the hostname in `backend/.env`:
- **Local Backend:** `localhost:5432`
- **Docker Backend:** `postgres:5432`

All other connection details remain the same (username: `postgres`, password: `postgres`, database: `super_impress`).

### Database Operations

```bash
# Run with database auto-creation
uv run fastapi dev

# The application will automatically:
# - Create database tables on startup
# - Handle schema migrations via SQLModel
```

### Database Schema

The application uses SQLModel for type-safe database operations. Current models:

- `Post`: Basic content model with title, content, and timestamps

Models are defined in `app/models/` and automatically create corresponding database tables.
