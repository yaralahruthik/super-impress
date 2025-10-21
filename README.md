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

### Quick Setup

1. **Create environment file:**

   ```bash
   # Create .env file with DATABASE_URL pointing to your PostgreSQL instance
   # For Docker setup: postgresql+psycopg://postgres:password@localhost:5432/super_impress
   # For local/cloud: postgresql+psycopg://user:pass@your-host:5432/your_db
   ```

2. **Start the database:**

   ```bash
   docker compose up postgres -d
   ```

3. **Start the backend:**

   ```bash
   cd backend
   uv run fastapi dev
   ```

4. **Test the setup:**
   - Visit: http://localhost:8000/docs
