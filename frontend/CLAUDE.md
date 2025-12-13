# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit SPA (Single Page Application) frontend for Super Impress. It uses static adapter with client-side routing, TanStack Query for data fetching, and auto-generated API clients from OpenAPI specs.

## Essential Commands

### Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build

### Code Quality

- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check formatting without changes
- `pnpm lint` - Lint and auto-fix issues
- `pnpm lint:check` - Lint without fixes
- `pnpm check` - Run svelte-check for type errors

### Testing

- `pnpm test:unit` - Run Vitest unit tests in watch mode
- `pnpm test:unit -- --run` - Run unit tests once
- `pnpm test:e2e` - Run Playwright E2E tests (builds first)
- `pnpm test` - Run all tests
- Run single test file: `pnpm vitest run src/path/to/test.spec.ts`

### API Code Generation

- `pnpm codegen` - Regenerate API client from OpenAPI spec at `http://localhost:8000/openapi.json`
  - Must have backend running before executing
  - Generates files in `src/lib/api/` (do not manually edit these files)

## Architecture

### Project Structure

```
src/
├── lib/
│   ├── api/                        # Auto-generated API clients (via Orval)
│   │   ├── authentication/         # Auth endpoints
│   │   ├── default/                # Other endpoints
│   │   ├── axios.ts                # Custom axios instance (manual)
│   │   └── superimpress.schemas.ts # TypeScript types
│   ├── components/ui/              # Reusable UI components
│   ├── features/                   # Feature-specific components
│   │   └── auth/                   # Auth forms (login, register, etc.)
│   ├── layouts/                    # Page layout components
│   ├── stores/                     # Global Svelte stores
│   │   └── auth.ts                 # Authentication state
│   └── utils/                      # Utility functions
└── routes/                         # SvelteKit file-based routing
    ├── (protected)/                # Protected route group with guard
    │   └── +layout.ts              # Checks auth, redirects to /login
    ├── +layout.svelte              # Root layout (QueryClientProvider)
    └── [page folders]
```

### State Management

Uses custom Svelte writable store for authentication (src/lib/stores/auth.ts):

- Stores `isAuthenticated` boolean and JWT `token`
- Persists token to localStorage with key `'access_token'`
- Methods: `auth.login(token)`, `auth.logout()`
- No Redux/Pinia - just vanilla Svelte stores

### API Integration

**Orval Code Generation:**

- Configuration: `orval.config.ts`
- Fetches OpenAPI spec from backend at `http://localhost:8000/openapi.json`
- Generates TanStack Query hooks with TypeScript types
- Files split by OpenAPI tags into `src/lib/api/{tag}/{tag}.ts`
- Uses custom axios instance from `src/lib/api/axios.ts`

**Custom Axios Instance (src/lib/api/axios.ts):**

- Request interceptor: Auto-adds `Authorization: Bearer {token}` header from localStorage
- Response interceptor: Catches 401 errors, logs out user, redirects to `/login`
- All generated API functions use this instance automatically

**Usage Pattern:**

```typescript
import { createLoginUser } from '$lib/api/authentication/authentication';

const loginMutation = createLoginUser({
	mutation: {
		onSuccess: (data) => {
			auth.login(data.access_token);
			goto('/');
		}
	}
});

loginMutation.mutate({ data: { username, password } });
```

### Authentication & Route Guards

**Route Protection:**

- Protected routes live in `src/routes/(protected)/` route group
- Guard logic in `src/routes/(protected)/+layout.ts`
- Reads auth store synchronously with `get(auth)`
- Throws `redirect(302, '/login')` if not authenticated

**Auth Flow:**

1. User submits login form
2. API returns JWT token
3. Token stored via `auth.login(token)` → localStorage
4. Axios interceptor auto-includes token in all subsequent requests
5. On 401 response, user logged out and redirected to `/login`

**SSR:** Disabled (`export const ssr = false` in root `+layout.ts`) - this is a pure SPA

### Form Handling

Uses TanStack Svelte Form with Zod validation:

```typescript
// 1. Define schema
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required')
});

// 2. Create form
const form = createForm(() => ({
  defaultValues: { email: '', password: '' },
  validators: { onSubmit: schema },
  onSubmit: async ({ value }) => {
    mutation.mutate({ data: value });
  }
}));

// 3. Use in template
<form.Field name="email">
  {#snippet children(field)}
    <Input
      value={field.state.value}
      onchange={(e) => field.handleChange(e.target.value)}
      aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
    />
    <FieldInfo {field} />
  {/snippet}
</form.Field>
```

**Error Display:**

- Use `<FieldInfo>` component (src/lib/features/auth/field-info.svelte) for field errors
- Handles both Zod validation errors and server-side validation errors
- Server errors extracted via `getErrorMessage()` utility

### Testing

**Two test environments:**

1. **Unit Tests (Vitest):**
   - Component tests: `src/**/*.svelte.{test,spec}.{js,ts}` (run in browser via Playwright)
   - Server tests: `src/**/*.{test,spec}.{js,ts}` (run in Node)
   - Uses `vitest-browser-svelte` for component rendering

2. **E2E Tests (Playwright):**
   - Located in `e2e/` directory
   - Runs against production build on port 4173
   - Auto-builds before running

### Configuration

**Important Files:**

- `svelte.config.js` - Static adapter, outputs to `build/`, uses `200.html` fallback for SPA routing
- `vite.config.ts` - Tailwind v4 plugin, API proxy (`/api/*` → `VITE_API_BASE`), Vitest config
- `orval.config.ts` - API code generation config, uses `tags-split` mode
- `.env.example` - Set `VITE_API_BASE=http://localhost:8000` for local development

**Package Manager:** pnpm 10.25.0+ (specified in packageManager field)
**Node Version:** 24.11.1

## Development Workflow

### Adding New API Endpoints

1. Update backend OpenAPI spec
2. Ensure backend is running on `http://localhost:8000`
3. Run `pnpm codegen` to regenerate API client
4. Import generated hooks from `src/lib/api/{tag}/{tag}.ts`
5. Do not manually edit generated files

### Adding Protected Routes

1. Create route under `src/routes/(protected)/your-route/`
2. Route guard automatically applies (checks auth store)
3. Unauthenticated users redirected to `/login`

### Form Validation

- Use Zod schemas for client-side validation
- Use `.refine()` for cross-field validation (e.g., password confirmation)
- Display errors with `<FieldInfo field={field} />` component
- Server-side errors automatically merged via mutation error handling

### Styling

- Tailwind CSS v4 with DaisyUI components
- Use `cn()` utility (src/lib/utils/cn.ts) to safely merge Tailwind classes
- Global styles in `src/app.css`
- Prettier plugin automatically sorts Tailwind classes

## Key Architectural Decisions

1. **SPA Architecture:** No SSR, static adapter with 200.html fallback
2. **Token Storage:** localStorage (not httpOnly cookies)
3. **Type Safety:** Full TypeScript from OpenAPI spec to UI via Orval
4. **Code Generation:** API client auto-generated, keeps frontend/backend in sync
5. **State Management:** Minimal - just Svelte stores for auth, TanStack Query for server state
6. **Route Guards:** SvelteKit layout load functions, not middleware
7. **Error Handling:** Centralized in axios interceptors + utility functions
