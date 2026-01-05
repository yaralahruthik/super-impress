# AGENTS.md - Backend (FastAPI/Python)

This document provides guidelines for AI coding agents working in this repository.

## Project Overview

- **Language:** Python 3.13
- **Framework:** FastAPI with SQLAlchemy 2.0 ORM
- **Database:** PostgreSQL with Alembic migrations
- **Package Manager:** uv (Astral's fast Python package manager)

## Build/Lint/Test Commands

### Package Management

```bash
uv sync                    # Install dependencies from uv.lock
uv add <package>           # Add a dependency
uv add --dev <package>     # Add a dev dependency
uv remove <package>        # Remove a dependency
```

### Running the Application

```bash
uv run fastapi dev                           # Development server with hot reload
uv run fastapi run app/main.py --port 80     # Production mode
```

### Database Migrations

```bash
uv run alembic upgrade head                              # Apply all migrations
uv run alembic downgrade -1                              # Rollback one migration
uv run alembic revision --autogenerate -m "description"  # Create new migration
```

### Linting and Formatting

```bash
uv run ruff check .          # Lint all files
uv run ruff check --fix .    # Lint and auto-fix issues
uv run ruff format .         # Format all files
uv run ruff format --check . # Check formatting without changes
```

### Testing

```bash
uv run pytest                                                    # Run all tests
uv run pytest app/auth/test_password_validation.py               # Run specific test file
uv run pytest app/auth/test_password_validation.py::test_name    # Run single test
uv run pytest -k "pattern"                                       # Run tests matching pattern
uv run pytest -v                                                 # Verbose output
uv run pytest --tb=short                                         # Shorter tracebacks
```

## Code Style Guidelines

### Import Organization

Organize imports in three groups separated by blank lines:

1. Standard library imports
2. Third-party imports
3. Local/project imports

```python
from datetime import datetime, timedelta
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.models import User
from app.database import SessionDep
```

### Naming Conventions

- **Files:** snake_case (`service.py`, `router.py`, `models.py`)
- **Functions:** snake_case (`get_user_by_email`, `create_access_token`)
- **Variables:** snake_case (`db_user`, `access_token`, `hashed_password`)
- **Classes:** PascalCase (`User`, `UserCreate`, `PostStatus`)
- **Constants:** SCREAMING_SNAKE_CASE for env vars, snake_case for settings attributes
- **Routers:** snake_case with `_router` suffix (`auth_router`, `posts_router`)

### Type Hints

- Always use type hints for function parameters and return types
- Use `Annotated` for dependency injection: `SessionDep = Annotated[Session, Depends(get_session)]`
- Use `Optional[T]` or `T | None` for nullable types
- Use `Mapped[T]` with `mapped_column()` for SQLAlchemy models

```python
def create_user(session: SessionDep, user: UserCreate) -> User:
    ...

def list_posts(session: Session, user_id: int) -> tuple[list[Post], int]:
    ...
```

### Pydantic Models

- Inherit from `BaseModel` for request/response schemas
- Use `model_config = ConfigDict(from_attributes=True)` for ORM compatibility
- Create separate schemas: `XxxBase`, `XxxCreate`, `XxxUpdate`, `XxxPublic`
- Use `Field()` for validation and metadata
- Use `model_validate()` to convert ORM objects to Pydantic models

```python
class PostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str

class PostPublic(PostBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
```

### SQLAlchemy Models

- Inherit from `Base` (defined in `app/database.py`)
- Use `Mapped[T]` type hints with `mapped_column()`
- Define `__tablename__` explicitly

```python
class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
```

### Error Handling

- Use `HTTPException` from FastAPI with status codes from `fastapi.status`
- Raise exceptions in service layer, not just routers
- For reusable exceptions, define once and raise multiple times

```python
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Post not found"
)

raise HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)
```

### Async/Await Patterns

- Router endpoints are always `async def`
- Service functions are sync unless making external HTTP calls
- Use `httpx.AsyncClient` for external API calls

```python
# Router (async)
@router.post("/posts")
async def create_post(data: PostCreate, session: SessionDep) -> PostPublic:
    db_post = create_post_service(session, data)  # sync service call
    return PostPublic.model_validate(db_post)

# Service with HTTP call (async)
async def fetch_external_data(url: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()
```

### Module Structure

Each feature should be a package with consistent file structure:

```
app/
├── feature_name/
│   ├── __init__.py      # Empty or minimal
│   ├── models.py        # SQLAlchemy models + Pydantic schemas
│   ├── service.py       # Business logic functions
│   ├── router.py        # FastAPI router and endpoints
│   ├── config.py        # Feature-specific settings (optional)
│   └── test_*.py        # Tests co-located with module
```

### Settings/Configuration

- Use `pydantic-settings` with `BaseSettings`
- Load from `.env` file with `SettingsConfigDict`
- Export singleton instance at module level

```python
class AuthSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )
    secret_key: str = Field(default="", alias="SECRET_KEY")
    access_token_expire_minutes: int = Field(default=30, alias="ACCESS_TOKEN_EXPIRE_MINUTES")

auth_settings = AuthSettings()
```

### Database Session Pattern

```python
# Create
db_obj = Model(**data)
session.add(db_obj)
session.commit()
session.refresh(db_obj)

# Read
statement = select(Model).where(Model.id == id)
obj = session.scalars(statement).first()

# Update
obj = get_by_id(session, id)
for field, value in update_dict.items():
    setattr(obj, field, value)
session.commit()
session.refresh(obj)

# Delete
session.delete(obj)
session.commit()
```

### Documentation

- Use docstrings for functions (Google style preferred)
- One-line docstrings for simple functions
- Multi-line with Args/Returns/Raises for complex functions
- Use inline comments sparingly, prefer self-documenting code

```python
def get_user_by_email(session: Session, email: str) -> User | None:
    """Fetch a user by their email address."""
    statement = select(User).where(User.email == email)
    return session.scalars(statement).first()
```
