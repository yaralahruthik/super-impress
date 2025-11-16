# Super Impress

Super Impress is a [Frontend Hire](https://www.frontendhire.com/) initiative where we build a serious product in public as a community.

## Quick Intro

This is why I am (or hopefully, we are) building SuperImpress.

There are many LinkedIn tools out there but:

- They make excessive use of AI to create content.
- This automatically results in not-so-authentic content.
- In order to sell themselves, they are marketing writing on LinkedIn in a wrong way.

SuperImpress will:

- Be author first and AI second.
- You write, then if needed you use AI to fix the writing.
- Give you templates that are plagiarism safe.
- And more, as I myself use the product.

---

Do note that I have already built the v0 (I have taken it down) of the product and it has served me and a few other users well.

For v1, I want to re-build it both from a product and a tech perspective.

We will be documenting every decision while re-building the product and this would be stored in the `decisions` folder.

---

Join [the discord community](https://discord.gg/DWAVqksVtx) for the latest updates.

---

## Getting Started

### Setup Environment

First, make the setup script executable:

```bash
chmod +x setup.sh
```

Then, run the script to set up your environment variables:

```bash
./setup.sh
```

Follow the prompts to select your development mode.

### Pre-commit Setup

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

Super Impress uses PostgreSQL as its database. The database choice is documented in `decisions/tech/5-postgresql.md`.

The application connects via `DATABASE_URL` and works with any PostgreSQL instance - Docker (recommended for development), local installation, or cloud services like AWS RDS.

### Development Modes

You can run the project in two modes:

#### Mode 1: Local Backend + Docker PostgreSQL (Recommended)

Best for active development with fast backend restarts and debugging.

1. **Configure backend environment:**
   Create `backend/.env`:

   ```bash
   # Backend runs locally, PostgreSQL in Docker
   DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/super_impress
   ```

2. **Start PostgreSQL:**

   ```bash
   docker compose up postgres -d
   ```

3. **Install dependencies:**

   ```bash
   cd backend
   uv sync
   ```

4. **Run database migrations:**

   ```bash
   uv run alembic upgrade head
   ```

5. **Start backend locally:**

   ```bash
   uv run fastapi dev
   ```

6. **Test the setup:**
   - Backend: http://localhost:8000/docs
   - PostgreSQL: Available on `localhost:5432`

#### Mode 2: Full Docker (Backend + PostgreSQL)

Run everything in Docker with a single command.

1. **Configure backend environment:**
   Create `backend/.env`:

   ```bash
   # Both backend and PostgreSQL in Docker
   DATABASE_URL=postgresql+psycopg://postgres:postgres@postgres:5432/super_impress
   ```

2. **Start all services:**

   ```bash
   docker compose up backend -d
   ```

3. **Run database migrations:**
   ```bash
   docker compose exec backend uv run alembic upgrade head
   ```

**Key Difference:** The hostname in `DATABASE_URL`:

- `localhost` - Backend runs on your machine (Mode 1)
- `postgres` - Backend runs in Docker (Mode 2)

### Database Migrations

We use Alembic for database schema migrations.

#### Creating a new migration

After modifying models in `backend/app/*/models.py`:

```bash
# Mode 1 (Local backend)
cd backend
uv run alembic revision --autogenerate -m "describe your changes"

# Mode 2 (Docker backend)
docker compose exec backend uv run alembic revision --autogenerate -m "describe your changes"
```

Review the generated migration file in `backend/alembic/versions/` before applying.

#### Applying migrations

```bash
# Mode 1 (Local backend)
uv run alembic upgrade head

# Mode 2 (Docker backend)
docker compose exec backend uv run alembic upgrade head
```

#### Reverting migrations

```bash
# Rollback one migration
uv run alembic downgrade -1

# Rollback to specific revision
uv run alembic downgrade <revision_id>

# Rollback all migrations
uv run alembic downgrade base
```

#### Viewing migration history

```bash
# Show current revision
uv run alembic current

# Show migration history
uv run alembic history

# Show pending migrations
uv run alembic heads
```
