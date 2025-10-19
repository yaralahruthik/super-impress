# Getting Started With Backend

We use [uv](https://github.com/astral-sh/uv) for dependency management. It's 10-100x faster than pip, built in Rust, and provides reproducible environments via lockfiles.

## Installation

Follow the [official installation instructions](https://docs.astral.sh/uv/getting-started/installation/)

## Quick Start

```bash
# Setup virtual environment for the project and install dependencies
uv sync

source .venv/bin/activate

# Run application
uv run fastapi dev
```

## Key Commands

```bash
uv sync              # Install dependencies
uv add <package>     # Add dependency
uv remove <package>  # Remove dependency
uv run <command>     # Run in virtual environment
uv pip list          # Show installed packages
```

## Pre-commit Setup

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
