# AGENTS.md - SuperImpress Frontend

This document provides guidelines for AI coding agents working in this repository.

## Overview

React 19 Single Page Application (SPA) with TypeScript. A LinkedIn post management tool
with authentication, post creation, and scheduling features.

## Tech Stack

- **Framework**: React 19.2 with React Compiler (babel-plugin-react-compiler)
- **Language**: TypeScript 5.9 (strict mode)
- **Build Tool**: Vite 7.2
- **Package Manager**: pnpm 10.25 (required)
- **Node Version**: 24.11.1
- **Styling**: Tailwind CSS 4.1 (CSS-based config in `src/index.css`)
- **UI Components**: shadcn/ui (new-york style) with Radix UI primitives
- **Routing**: TanStack Router (file-based routing)
- **Data Fetching**: TanStack React Query
- **Forms**: TanStack React Form with Zod validation
- **State Management**: Jotai (auth state only)
- **API Client**: Axios with auto-generated hooks via Orval

## Commands

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `pnpm dev`          | Start development server                 |
| `pnpm build`        | TypeScript check + Vite production build |
| `pnpm lint:check`   | Check for ESLint issues                  |
| `pnpm lint`         | Fix ESLint issues (quiet mode)           |
| `pnpm format:check` | Check Prettier formatting                |
| `pnpm format`       | Format code with Prettier                |
| `pnpm preview`      | Preview production build                 |
| `pnpm orval`        | Regenerate API client from OpenAPI spec  |

**Note**: No test framework is configured. There are no test commands.

## Project Structure

```
src/
├── api/              # Auto-generated API clients (DO NOT EDIT)
├── components/
│   └── ui/           # shadcn/ui components
├── features/         # Feature modules (auth, dashboard, posts, settings)
├── hooks/            # Custom React hooks
├── layouts/          # Layout components (AuthLayout, AppLayout)
├── routes/           # TanStack Router file-based routes
├── stores/           # Jotai atom stores
└── utils/            # Utility functions
```

## Code Style Guidelines

### Formatting (Prettier)

- **Indentation**: Tabs (not spaces)
- **Quotes**: Single quotes
- **Trailing commas**: None
- **Print width**: 100 characters
- **Semicolons**: Yes

### Imports

Use the `@/` path alias for all internal imports. Order: external packages first, then internal.

```typescript
// External imports
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { AxiosError } from 'axios';

// Internal imports
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import type { PostPublic } from '@/api/superimpress.schemas';
```

Use `import type` for type-only imports (enforced by `verbatimModuleSyntax`).

### Naming Conventions

| Type             | Convention                   | Example                         |
| ---------------- | ---------------------------- | ------------------------------- |
| Files            | kebab-case                   | `login-page.tsx`, `use-auth.ts` |
| Components       | PascalCase                   | `function LoginPage()`          |
| Hooks            | camelCase with `use` prefix  | `useAuth`, `useMobile`          |
| Utilities        | camelCase                    | `getErrorMessage`, `formatDate` |
| Jotai atoms      | camelCase with `Atom` suffix | `tokenAtom`, `authStateAtom`    |
| Types/Interfaces | PascalCase                   | `PostPublic`, `AuthState`       |

### TypeScript

- Strict mode enabled - no `any` types
- Use `React.ComponentProps<'element'>` for component prop types
- All unused variables and parameters are errors
- Use explicit return types for exported functions

### Components

- **Function components only** - no class components
- **Default exports** for page components
- **Named exports** for UI components and utilities
- Use `data-slot` attributes on UI components for styling hooks
- Use CVA (class-variance-authority) for component variants
- Use `cn()` utility for conditional class merging

```typescript
function Button({
	className,
	variant = 'default',
	...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
	return (
		<button
			data-slot="button"
			className={cn(buttonVariants({ variant, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
```

### Forms

Use TanStack Form with Zod validation. Pattern:

```typescript
const formSchema = z.object({
	email: z.email('Invalid email address'),
	password: z.string().min(1, 'Password is required')
});

const form = useForm({
	defaultValues: { email: '', password: '' },
	validators: { onSubmit: formSchema },
	onSubmit: async ({ value }) => {
		mutate(
			{ data: value },
			{
				onSuccess: () => {
					/* handle success */
				},
				onError: (error) => setError(getErrorMessage(error))
			}
		);
	}
});
```

### Error Handling

- Use `getErrorMessage()` from `@/utils/get-error-message` for API errors
- Component-level error state with `useState<string | null>(null)`
- Query errors: check `isError` and render dedicated error components
- Display errors in styled alert divs with `role="alert"`

```typescript
const [error, setError] = useState<string | null>(null);

// In mutation callbacks:
onError: (error) => setError(getErrorMessage(error))

// In JSX:
{error && (
	<div role="alert" className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
		{error}
	</div>
)}
```

### API Layer

**IMPORTANT**: Files in `src/api/` are auto-generated by Orval. Never edit them manually.

To regenerate after backend API changes:

```bash
pnpm orval
```

Use the generated React Query hooks directly:

```typescript
import { useLoginUser } from '@/api/authentication/authentication';
import { useGetUserPosts } from '@/api/posts/posts';
```

### Routing

TanStack Router with file-based routing. Route files in `src/routes/`.

- Protected routes go under `/_protected/` directory
- Route guard in `_protected.tsx` redirects unauthenticated users
- Use `Link` component from `@tanstack/react-router` for navigation
- Use `useNavigate()` for programmatic navigation

### State Patterns

- **Server state**: TanStack React Query (queries and mutations)
- **Global client state**: Jotai atoms (auth only)
- **Local UI state**: React useState
- **Form state**: TanStack Form

### Query State Handling

Always handle loading, error, and empty states:

```typescript
export function PostListLoading() {
	return <Skeleton className="h-48 w-full" />;
}

export function PostListError() {
	return <p className="text-destructive">Error loading posts.</p>;
}

export function PostListEmpty() {
	return <Empty><EmptyTitle>No posts found</EmptyTitle></Empty>;
}
```

## UI Components

shadcn/ui components are in `@/components/ui/`. Add new components via:

```bash
npx shadcn@latest add <component-name>
```

Use compound component patterns (Card, CardHeader, CardTitle, CardContent, etc.).
Icons from `@tabler/icons-react`.
