# AGENTS.md

This document provides guidance for AI coding agents working in this SvelteKit frontend codebase.

## Project Overview

- **Framework**: SvelteKit with Svelte 5 (runes syntax)
- **Package Manager**: pnpm
- **Styling**: Tailwind CSS v4 + DaisyUI
- **API Client**: Auto-generated via Orval from OpenAPI spec
- **State Management**: Svelte stores + TanStack Query
- **Forms**: TanStack Form + Zod validation

## Build / Lint / Test Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Production build
pnpm preview                # Preview production build

# Type Checking
pnpm check                  # Run svelte-check (type checking)
pnpm check:watch            # Type checking in watch mode

# Linting & Formatting
pnpm lint:check             # Check ESLint issues
pnpm lint                   # Fix ESLint issues
pnpm format:check           # Check Prettier formatting
pnpm format                 # Fix formatting

# Testing
pnpm test:unit              # Run unit tests in watch mode
pnpm test:unit -- --run     # Run unit tests once (CI mode)
pnpm test:unit -- --run src/demo.spec.ts              # Run single test file
pnpm test:unit -- --run -t "test name pattern"        # Run tests matching pattern
pnpm test:e2e               # Run Playwright E2E tests
pnpm test:e2e e2e/login.test.ts                       # Run single E2E test file
pnpm test:e2e --grep "test name"                      # Run E2E tests matching pattern
pnpm test                   # Run all tests (unit + e2e)

# Code Generation
pnpm codegen                # Generate API client from OpenAPI spec (requires backend running)
```

## Project Structure

```
src/
├── lib/
│   ├── api/                 # Auto-generated API clients (DO NOT EDIT MANUALLY)
│   │   └── axios.ts         # Custom Axios instance (edit this for interceptors)
│   ├── components/
│   │   └── ui/              # Primitive UI components (button, input, label, textarea)
│   ├── features/            # Feature modules (domain-specific components)
│   │   ├── auth/            # Authentication (login, register, verify-email, etc.)
│   │   ├── dashboard/
│   │   ├── linkedin/
│   │   └── posts/
│   ├── layouts/             # Layout components (app-layout, auth-layout)
│   ├── stores/              # Svelte stores (auth.ts)
│   └── utils/               # Utility functions
├── routes/                  # SvelteKit file-based routes
│   └── (protected)/         # Auth-protected routes (guard in +layout.ts)
e2e/                         # Playwright E2E tests
```

## Code Style Guidelines

### Formatting (Prettier)

- Use **tabs** for indentation
- **Single quotes** for strings
- **No trailing commas**
- **100 character** print width
- Plugins: prettier-plugin-svelte, prettier-plugin-tailwindcss

### Imports

Order imports logically (framework, libraries, local):

```typescript
// 1. SvelteKit imports
import { goto } from '$app/navigation';
import { browser } from '$app/environment';

// 2. Library imports (API clients, external packages)
import { createLoginUser } from '$lib/api/authentication/authentication';
import { createForm } from '@tanstack/svelte-form';
import z from 'zod';

// 3. Local components and utilities
import Button from '$lib/components/ui/button.svelte';
import { cn } from '$lib/utils/cn';
import { getErrorMessage } from '$lib/utils/get-error-message';

// 4. Relative imports (same feature)
import FieldInfo from '../field-info.svelte';
```

### Svelte 5 Patterns

Use Svelte 5 runes syntax throughout:

```svelte
<script lang="ts" module>
  // Module-level exports (types, constants)
  export type ButtonProps = { ... };
</script>

<script lang="ts">
	// Use $props() for component props
	let { variant = 'default', class: className, ...restProps }: ButtonProps = $props();

	// Use $bindable() for two-way bindings
	let { ref = $bindable(null) } = $props();
</script>

<!-- Use {@render} for children/slots -->
{@render children?.()}
```

### Component Variants

Use class-variance-authority (CVA) for component variants:

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva('btn', {
	variants: {
		variant: { default: 'btn-primary', ghost: 'btn-ghost' },
		size: { default: '', sm: 'btn-sm', lg: 'btn-lg' }
	},
	defaultVariants: { variant: 'default', size: 'default' }
});
```

### CSS Classes

Use the `cn()` utility for conditional class merging:

```typescript
import { cn } from '$lib/utils/cn';
cn('base-class', condition && 'conditional-class', className);
```

### Form Handling

Standard pattern for forms with TanStack Form + Zod:

```svelte
<script lang="ts">
	// 1. Define schema
	const formSchema = z.object({
		email: z.email('Invalid email').trim(),
		password: z.string().min(1, 'Required')
	});

	// 2. Create mutation
	const mutation = createApiEndpoint({
		mutation: {
			onSuccess: (data) => {
				/* handle success */
			}
		}
	});

	// 3. Create form
	const form = createForm(() => ({
		defaultValues: { email: '', password: '' },
		validators: { onSubmit: formSchema },
		onSubmit: async ({ value }) => {
			mutation.mutate({ data: value });
		}
	}));
</script>
```

### Error Handling

Use `getErrorMessage()` utility for API errors:

```svelte
{#if mutation.isError}
	<em role="alert" class="text-error">{getErrorMessage(mutation.error)}</em>
{/if}
```

### Naming Conventions

- **Files**: kebab-case (`login.svelte`, `get-error-message.ts`)
- **Components**: PascalCase in imports (`Button`, `AuthLayout`)
- **Functions/variables**: camelCase (`createAuthStore`, `loginMutation`)
- **Types**: PascalCase (`ButtonProps`, `AuthState`)
- **Constants**: camelCase or SCREAMING_SNAKE_CASE for true constants

### TypeScript

- Strict mode enabled
- Use explicit types for function parameters and return types
- Prefer `type` over `interface` for object types
- Use Zod schemas for runtime validation

### Testing

**Unit tests** (Vitest):

```typescript
import { describe, it, expect } from 'vitest';

describe('feature', () => {
	it('does something', () => {
		expect(result).toBe(expected);
	});
});
```

**E2E tests** (Playwright):

- Use accessible selectors: `getByRole`, `getByLabel`, `getByText`
- Page object pattern for complex flows

```typescript
import { expect, test } from '@playwright/test';

test.describe('Feature', () => {
	test('scenario', async ({ page }) => {
		await page.goto('/path');
		await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
	});
});
```

### Accessibility

- Use semantic HTML and ARIA attributes
- Add `aria-invalid` for form validation states
- Add `aria-busy` for loading states
- Use `role="alert"` with `aria-live="polite"` for error messages
- Ensure form fields have associated labels

## API Layer

- API clients are auto-generated in `src/lib/api/` - **DO NOT EDIT** these files
- Edit `src/lib/api/axios.ts` for custom interceptors
- Run `pnpm codegen` to regenerate after backend API changes (backend must be running)
- Use TanStack Query mutations/queries from generated clients

## Protected Routes

Routes under `src/routes/(protected)/` require authentication. The auth guard in `(protected)/+layout.ts` redirects unauthenticated users to `/login`.

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
