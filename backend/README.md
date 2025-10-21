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

The easiest way to run the database is using Docker Compose from the project root:

```bash
# Start PostgreSQL container
docker compose up postgres -d

# Check if database is running
docker compose ps
```

### Environment Variables

Create a `.env` file in the project root with the following database configuration:

```env
# Database Configuration (for Docker setup)
POSTGRES_DB=super_impress
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# Application Database URLs
# Docker: postgresql+psycopg://postgres:password@postgres:5432/your_db
# Local: postgresql+psycopg://user:password@localhost:5432/your_db
# Cloud: postgresql+psycopg://user:password@your-host:5432/your_db
```

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
