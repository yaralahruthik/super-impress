# uv - Fast Python Package Manager

We use [uv](https://github.com/astral-sh/uv) for dependency management. It's 10-100x faster than pip, built in Rust, and provides reproducible environments via lockfiles.

## Installation

Follow the [official installation instructions](https://docs.astral.sh/uv/getting-started/installation/)

or, if you have pip installed

```bash
pip install uv
```

## Quick Start

```bash
# Setup project and install dependencies
uv sync

# Run application
uv run fastapi dev
```

## Why uv?

- **Fast:** Rust-based with parallel operations and smart caching
- **Reproducible:** `uv.lock` ensures consistent environments
- **Simple:** Replaces pip, venv, and pip-tools with one tool


## Key Commands

```bash
uv sync              # Install dependencies
uv add <package>     # Add dependency
uv remove <package>  # Remove dependency
uv run <command>     # Run in virtual environment
uv pip list          # Show installed packages
```

## Alternatives Considered

- **pip + venv:** Standard but slow, no lockfile
- **poetry / pip-tools:** Adds reproducibility, but more tooling overhead.

[Documentation](https://docs.astral.sh/uv/)