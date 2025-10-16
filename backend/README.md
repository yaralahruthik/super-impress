# Getting Started With Backend

We use [uv](https://github.com/astral-sh/uv) for dependency management. It's 10-100x faster than pip, built in Rust, and provides reproducible environments via lockfiles.

## Installation

Follow the [official installation instructions](https://docs.astral.sh/uv/getting-started/installation/)

## Quick Start

```bash
# Setup virtual environment for the project and install dependencies
uv sync

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
