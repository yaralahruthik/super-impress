# AGENTS.md - SuperImpress Backend

This document provides guidelines for AI coding agents working in this repository.

## Overview

Bun + Elysia + TypeScript backend API for SuperImpress, a LinkedIn post management tool with authentication, post creation, and LinkedIn integration features.

## Tech Stack

- **Runtime**: Bun (JavaScript/TypeScript runtime)
- **Framework**: Elysia (modern web framework)
- **Language**: TypeScript 5.8 (strict mode)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: better-auth with OAuth support
- **Validation**: TypeBox runtime type validation
- **API Documentation**: OpenAPI/Swagger via @elysiajs/openapi
- **Linting/Formatting**: ultracite (Biome-based preset)
- **Package Manager**: Bun (required)

## Commands

| Command                        | Description                      |
| ------------------------------ | -------------------------------- |
| `bun run dev`                  | Development server with watch    |
| `bun run build`                | Production build (if configured) |
| `bun run check`                | Check formatting and linting (ultracite) |
| `bun run fix`                  | Fix formatting and linting (ultracite)   |
| `bun run typecheck`            | TypeScript type checking         |
| `bun run drizzle-kit generate` | Generate database migrations     |
| `bun run drizzle-kit push`     | Push database schema changes     |
| `bun run test`                 | Run tests (not implemented)      |

**Note**: No test framework is currently configured. Test commands will fail until testing infrastructure is added.

## Project Structure

```
src/
├── modules/              # Feature-based modules
│   ├── posts/           # Post management
│   │   ├── index.ts     # Elysia routes
│   │   ├── model.ts     # TypeBox validation schemas
│   │   └── service.ts   # Business logic
│   └── linkedin/        # LinkedIn integration
│       ├── index.ts     # Elysia routes
│       ├── model.ts     # TypeBox validation schemas
│       ├── service.ts   # Business logic
│       └── client.ts    # LinkedIn API wrapper
├── db/                  # Database layer
│   ├── schema/          # Drizzle database schemas
│   │   ├── auth.ts      # Authentication tables
│   │   ├── posts.ts     # Post-related tables
│   │   └── index.ts     # Schema exports
│   └── index.ts         # Database client setup
├── auth.ts              # better-auth configuration
└── index.ts             # Main application entry point
```

## Code Style Guidelines

### Formatting (ultracite)

- **Indentation**: Tabs (not spaces)
- **Quotes**: Single quotes
- **Semicolons**: Yes
- **Auto-import organization**: Enabled automatically by ultracite

### Imports

ultracite automatically organizes imports into three groups:

```typescript
// Standard library imports
import { serve } from "bun";

// Third-party imports
import { Elysia } from "elysia";
import type { Static } from "@sinclair/typebox";

// Local imports
import { db } from "@/db";
import type { PostModel } from "@/modules/posts/model";
```

### TypeScript

- **Strict mode** enabled - no `any` types
- **Type hints required** for all function parameters and return types
- **Import type** for type-only imports (enforced by ultracite)
- **No unused variables or parameters** (enforced by TypeScript compiler)

```typescript
export async function createPost(
  data: CreatePostRequest,
): Promise<PostResponse> {
  // Implementation
}
```

### Naming Conventions

| Type             | Convention       | Example                            |
| ---------------- | ---------------- | ---------------------------------- |
| Files            | kebab-case       | `post-service.ts`, `auth.ts`       |
| Modules/Classes  | PascalCase       | `PostService`, `AuthModule`        |
| Functions        | camelCase        | `createPost`, `validateUser`       |
| Constants        | UPPER_SNAKE_CASE | `MAX_POST_LENGTH`, `API_BASE_URL`  |
| Types/Interfaces | PascalCase       | `PostModel`, `CreatePostRequest`   |
| Database tables  | snake_case       | `user_sessions`, `linked_accounts` |

### Elysia Routes

Use Elysia's chaining syntax for consistent route definitions:

```typescript
// modules/posts/index.ts
export const postsRoutes = new Elysia({ prefix: "/posts" })
  .use(authPlugin)
  .model(PostModel)
  .post("/", createPost, { body: CreatePostRequest })
  .get("/", getPosts, { response: GetPostsResponse })
  .get("/:id", getPost, { params: PostIdParams });
```

### TypeBox Validation

All API inputs/outputs must use TypeBox schemas defined in `model.ts` files:

```typescript
// modules/posts/model.ts
import { Type } from "@sinclair/typebox";

export const CreatePostRequest = Type.Object({
  content: Type.String({ minLength: 1, maxLength: 2000 }),
  scheduled_at: Type.Optional(Type.String({ format: "date-time" })),
});

export const PostResponse = Type.Object({
  id: Type.Integer(),
  content: Type.String(),
  created_at: Type.String({ format: "date-time" }),
  updated_at: Type.String({ format: "date-time" }),
});
```

### Database Patterns

#### Schemas

Use Drizzle schema definitions in `src/db/schema/`:

```typescript
// src/db/schema/posts.ts
import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  content: text().notNull(),
  userId: integer()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
```

#### Services

Business logic belongs in `service.ts` files:

```typescript
// modules/posts/service.ts
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { CreatePostRequest, PostResponse } from "./model";

export async function createPost(
  data: CreatePostRequest,
  userId: number,
): Promise<PostResponse> {
  const [post] = await db
    .insert(posts)
    .values({ ...data, userId })
    .returning();

  return transformPostResponse(post);
}
```

### Error Handling

Use Elysia's built-in error handling with consistent patterns:

```typescript
// Return validation errors
return { error: "Validation failed", details: validationErrors };

// Return not found
return { error: "Post not found", code: "NOT_FOUND" };

// Return auth errors
return { error: "Unauthorized", code: "UNAUTHORIZED" };
```

### Authentication

better-auth is configured in `src/auth.ts` and used as an Elysia plugin:

```typescript
// Access current user in routes
export const postsRoutes = new Elysia()
  .use(authPlugin)
  .get("/my-posts", ({ user }) => {
    // user is available from auth middleware
    return getPostsByUserId(user.id);
  });
```

### Response Transformation

Transform database records to API responses for consistent date handling:

```typescript
export function transformPostResponse(post: DbPost): PostResponse {
  return {
    ...post,
    created_at: post.createdAt.toISOString(),
    updated_at: post.updatedAt.toISOString(),
  };
}
```

## Database Management

### Schema Changes

1. Modify schema in `src/db/schema/`
2. Generate migration: `bun run drizzle-kit generate`
3. Apply migration: `bun run drizzle-kit push`

### Migrations

Migrations are stored in `drizzle/` directory. Always use Drizzle migrations - never modify the database directly.

### Database Client

Database client is configured in `src/db/index.ts`:

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema });
```

## API Documentation

OpenAPI documentation is automatically generated by @elysiajs/openapi. Access at `http://localhost:3000/openapi` when running the development server.

All routes should include proper TypeBox schemas for comprehensive API documentation.

## Testing

**No test framework is currently configured.** When adding tests:

1. Choose a testing framework (Bun test, Jest, Vitest)
2. Update `package.json` test scripts
3. Add test files alongside source files or in `__tests__/` directories
4. Update this AGENTS.md file with testing guidelines

## Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - better-auth secret key
- `BETTER_AUTH_URL` - Application URL for redirects
- `LINKEDIN_CLIENT_ID` - LinkedIn OAuth client ID
- `LINKEDIN_CLIENT_SECRET` - LinkedIn OAuth client secret

## Critical Notes

1. **Auto-generated schemas**: Use `drizzle-typebox` to generate TypeBox schemas from database models when possible
2. **Always validate**: All API inputs must use TypeBox schemas
3. **Never expose internals**: Transform database records to API responses
4. **Consistent error responses**: Use standard error response format across all endpoints
5. **Type safety everywhere**: From database to API responses, maintain type safety
6. **ultracite handles formatting**: Trust ultracite to handle all code formatting and import organization
