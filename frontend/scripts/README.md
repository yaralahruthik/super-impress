# OpenAPI Transformation Scripts

## Overview

This directory contains scripts to pre-process the OpenAPI specification from the backend before Orval generates the TypeScript API client.

## Why This Is Needed

The Elysia backend with Better Auth generates OpenAPI specs with inline `requestBody` and `response` schemas. Orval's validator requires these to be `$ref` references to schemas in `components.schemas`. Additionally, the spec contains:

- Type arrays like `["string", "null"]` that need conversion to `{type: "string", nullable: true}`
- `anyOf` patterns with null types that should be simplified
- `$id` fields that cause validation errors

## Scripts

### `fetch-openapi.ts`

Fetches the OpenAPI spec from the backend, applies transformations, and saves to `openapi.json`.

**What it does:**

1. Downloads spec from `http://localhost:3000/api/openapi/json` (or `$BACKEND_URL`)
2. Extracts inline requestBody/response schemas to `components.schemas`
3. Replaces inline schemas with `$ref` pointers
4. Fixes nullable types (`["string", "null"]` → `{type: "string", nullable: true}`)
5. Removes `$id` fields
6. Saves transformed spec to `openapi.json`

**Usage:**

```bash
bun fetch-openapi
```

**Environment variables:**

- `BACKEND_URL` - Backend URL (default: `http://localhost:3000`)

## Workflow

The `bun orval` command automatically runs the fetch script first:

```bash
bun orval
# Internally runs: bun fetch-openapi && orval
```

**Step-by-step:**

1. `fetch-openapi` downloads and transforms the spec → `openapi.json`
2. `orval` reads `openapi.json` and generates TypeScript client code → `src/api/`

## Files

- `openapi.json` (generated, gitignored) - Transformed OpenAPI spec
- `src/api/` (generated) - TypeScript API client code

## Troubleshooting

**"Failed to fetch OpenAPI spec"**

- Ensure backend is running: `cd ../backend && bun run dev`
- Check backend URL is correct (default: `http://localhost:3000`)

**Orval validation errors**

- The transformation should fix validation issues
- Check the console output for transformation statistics
- Inspect `openapi.json` to verify transformations applied

**Need to update transformations**

- Edit `scripts/fetch-openapi.ts`
- The transformation logic is in the `transformOpenAPISpec()` function
