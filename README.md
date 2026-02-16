# SuperImpress

| Project | Status |
| :--- | :--- |
| Frontend | |
| Backend | |
| Docs | [![Netlify Status](https://api.netlify.com/api/v1/badges/7f8daa6a-9fc6-4c05-b5d3-081db5765441/deploy-status)](https://app.netlify.com/projects/superimpress-docs/deploys) |
| Marketing Site | [![Netlify Status](https://api.netlify.com/api/v1/badges/e1cd233a-d4f6-4187-aa65-563597045d13/deploy-status)](https://app.netlify.com/projects/superimpress/deploys) |

SuperImpress is a [Frontend Hire](https://www.frontendhire.com/) initiative where we build a serious product in public as a community.

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

### Prerequisites

- [Bun](https://bun.sh/) — runtime and package manager for all packages
- [Docker](https://www.docker.com/) — for PostgreSQL and Redis
- [prek](https://prek.j178.dev/) — for git hooks

### Git Hooks Setup (prek)

This project uses [prek](https://prek.j178.dev/) to run git hooks that ensure code quality and consistency.

```bash
# Install prek
brew install prek

# Install the git hooks
prek install
```

Now prek hooks will automatically run on staged files before each commit. If a hook fails, the commit will be blocked until issues are resolved.

**Manual execution (optional):**

```bash
# Run on staged files
prek run

# Run on all files
prek run --all-files
```

### Database & Infrastructure Setup

SuperImpress uses PostgreSQL as its database and Redis for caching/state. Both run via Docker in development.

```bash
docker compose up postgres redis -d
```

### Development Modes

You can run the project in two modes:

#### Mode 1: Local Dev Servers + Docker Infrastructure (Recommended)

Best for active development with fast restarts, HMR, and debugging.

1. **Start infrastructure:**

   ```bash
   docker compose up postgres redis -d
   ```

2. **Start backend:**

   ```bash
   cd backend && bun run dev
   ```

3. **Start frontend:**

   ```bash
   cd frontend && bun dev
   ```

4. **Start docs (optional):**

   ```bash
   cd docs && bun dev
   ```

5. **Verify the setup:**
   - Backend: http://localhost:3000
   - Frontend: http://localhost:5173
   - PostgreSQL: `localhost:5432`
   - Redis: `localhost:6379`

#### Mode 2: Full Docker (All Services)

Run everything in Docker with a single command.

```bash
docker compose up -d
```

### Database Migrations

We use [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) for database schema migrations.

```bash
# Push schema changes to the database (from backend/)
bun run drizzle-kit push

# Generate migration files (from backend/)
bun run drizzle-kit generate

# Docker mode
docker compose exec backend bun run drizzle-kit push
docker compose exec backend bun run drizzle-kit generate
```

### Quick Command Reference

#### Frontend (run from `frontend/`)

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `bun dev`       | Start development server                 |
| `bun run build` | TypeScript check + production build      |
| `bun run check` | Check formatting and linting (ultracite) |
| `bun run fix`   | Fix formatting and linting (ultracite)   |
| `bun run orval` | Regenerate API client from OpenAPI spec  |

#### Backend (run from `backend/`)

| Command                        | Description                              |
| ------------------------------ | ---------------------------------------- |
| `bun run dev`                  | Development server with watch            |
| `bun run build`                | Production build (if configured)         |
| `bun run check`                | Check formatting and linting (ultracite) |
| `bun run fix`                  | Fix formatting and linting (ultracite)   |
| `bun run typecheck`            | TypeScript type checking                 |
| `bun run drizzle-kit push`     | Push database schema changes             |
| `bun run drizzle-kit generate` | Generate migrations                      |

#### Documentation (run from `docs/`)

| Command               | Description                              |
| --------------------- | ---------------------------------------- |
| `bun dev`             | Start development server                 |
| `bun run build`       | Production build                         |
| `bun run types:check` | TypeScript and MDX validation            |
| `bun run check`       | Check formatting and linting (ultracite) |
| `bun run fix`         | Fix formatting and linting (ultracite)   |
