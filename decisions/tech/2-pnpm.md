# pnpm - Fast Node.js Package Manager

We use [pnpm](https://pnpm.io/) for dependency management. It's 2-10x faster than npm with efficient disk usage via a global content-addressed cache.

## Installation

Follow the [official installation instructions](https://pnpm.io/installation)

or, if you have npm installed

```bash
npm install -g pnpm
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm run dev
```

## Why pnpm?

- **Fast:** Content-addressed cache speeds up installs dramatically
- **Efficient:** Shares packages across projects -> saves disk space
- **Reproducible:** Deterministic `pnpm-lock.yaml` ensures consistent environments
- **Compatible:** Works with npm registry and Node.js ecosystem

## Key Commands

```bash
pnpm install         # Install dependencies
pnpm add <package>   # Add dependency
pnpm remove <pkg>    # Remove dependency
pnpm run <script>    # Run package.json script
pnpm update          # Update all dependencies
pnpm dlx <pkg>       # Run package without installing
```

## Alternatives Considered

- **npm:** Standard but slower, duplicates dependencies across projects
- **yarn:** Fragmented ecosystem after v2 (Berry), added complexity
- **bun:** Fast but immature, Node.js compatibility issues

[Documentation](https://pnpm.io/)
