# Squashing Migration Files

## Overview

This document outlines the plan to squash the existing Alembic migration files into a single consolidated migration. The goal is to simplify the migration history while maintaining a clean starting point for future schema changes.

## Current State

We currently have **7 migration files** spanning from November 2025 to December 2025:

| Migration      | Description                                                      | Created    |
| -------------- | ---------------------------------------------------------------- | ---------- |
| `ee3dec5a0673` | Initial migration (user table)                                   | 2025-11-05 |
| `94740395d249` | Add email verification fields                                    | 2025-12-14 |
| `3e80a7f6ba45` | Add posts table                                                  | 2025-12-25 |
| `5250977d40cd` | Make post title optional                                         | 2025-12-25 |
| `3524ea2b729e` | Add LinkedIn connection fields                                   | 2025-12-27 |
| `9420f5168691` | Replace LinkedIn refresh token with access token                 | 2025-12-30 |
| `9e37f1f5cdbd` | Create social_connection table, remove LinkedIn fields from user | 2025-12-30 |

### Migration Chain Complexity

The migrations include iterative changes that cancel each other out:

- LinkedIn fields were added to `user` table, then modified, then removed entirely
- The `social_connection` table was created as a replacement

This results in unnecessary complexity - the current schema is simpler than the sum of all migrations suggests.

## Why Squash Migrations

- **Simplified History**: New developers see one clean starting point instead of iterative changes
- **Faster Setup**: Single migration runs faster than 7+ sequential migrations
- **Reduced Cruft**: Remove intermediate states that no longer exist (e.g., LinkedIn fields on user table)
- **Pre-Production Timing**: We're still in development with no production database to migrate

## Why Now

- **No Production Data**: We can recreate the database from scratch without data loss
- **Schema Stabilizing**: Core tables (`user`, `post`, `social_connection`) are established
- **Clean Slate**: Before going to production, we want a clean migration history

## Proposed Approach

### Option 1: Generate Fresh Migration (Recommended)

1. Drop all existing migrations in `versions/` directory
2. Drop and recreate the database
3. Run `alembic revision --autogenerate -m "initial_schema"` to generate a fresh migration from SQLAlchemy models
4. Verify the generated migration matches current schema

**Pros:**

- Clean, auto-generated migration
- Guaranteed to match current SQLAlchemy models
- No manual editing required

**Cons:**

- Requires database recreation (acceptable in development)

### Option 2: Manual Squash

1. Create a new migration file manually
2. Copy final schema operations from existing migrations
3. Remove intermediate steps (LinkedIn field additions/removals)
4. Test thoroughly

**Pros:**

- Preserves some migration history context

**Cons:**

- Error-prone manual process
- Risk of missing operations

## Final Schema After Squash

The squashed migration will create:

### `user` Table

```sql
- id: Integer (PK)
- email: String (unique index)
- password: String
- email_verified: Boolean
- verification_token: String (nullable, indexed)
- verification_token_expires_at: DateTime (nullable)
- verification_sent_at: DateTime (nullable)
- verified_at: DateTime (nullable)
```

### `post` Table

```sql
- id: Integer (PK)
- user_id: Integer (FK -> user.id, indexed)
- title: String(255) (nullable, indexed)
- content: Text
- tags: Array[String]
- status: Enum (DRAFT, PUBLISHED, ARCHIVED) (indexed)
- created_at: DateTime
- updated_at: DateTime
```

### `social_connection` Table

```sql
- id: Integer (PK)
- user_id: Integer (FK -> user.id, indexed, CASCADE delete)
- platform: String(50) (indexed)
- platform_user_id: String(255)
- access_token: String (nullable)
- access_token_expires_at: DateTime (nullable)
- connected_at: DateTime
- updated_at: DateTime
- platform_data: JSON (nullable)
- Unique constraint: (user_id, platform, platform_user_id)
- Index: (user_id, platform)
```

## Implementation Steps

1. **Backup**: Export current database if needed (development data only)
2. **Delete migrations**: Remove all files in `versions/` except `__pycache__`
3. **Drop database**: `docker-compose down -v` or drop PostgreSQL database
4. **Recreate database**: Start fresh PostgreSQL instance
5. **Generate migration**: `alembic revision --autogenerate -m "initial_schema"`
6. **Review migration**: Verify it captures all tables, columns, indexes, constraints
7. **Apply migration**: `alembic upgrade head`
8. **Test**: Run application and verify all features work

## Risks and Mitigations

| Risk                    | Mitigation                                           |
| ----------------------- | ---------------------------------------------------- |
| Missing schema elements | Review generated migration against SQLAlchemy models |
| Application breaks      | Run full test suite after squash                     |
| Lost migration context  | Document schema evolution in this decision doc       |

## Alternatives Considered

### Keep All Migrations

**Why not:** 7 migrations for 3 tables is excessive cruft. The LinkedIn field churn adds no value to history.

### Partial Squash

**Why not:** If we're squashing, might as well do it completely. Partial squash still leaves unclear history.

## Decision

We will proceed with **Option 1: Generate Fresh Migration** as it's the safest and cleanest approach given we're in development.

## When to Squash Again

Consider squashing migrations again when:

- Before major releases or production deployment
- When migration count exceeds ~20-30 files
- When significant schema pivots leave obsolete migration steps
- When migration runtime becomes noticeable
