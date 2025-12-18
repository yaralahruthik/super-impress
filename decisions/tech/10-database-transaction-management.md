# Database Transaction Management

## Overview

Super Impress uses a **Service Layer Transaction Management** pattern where service functions are responsible for managing their own transaction boundaries. This means that service functions (not routers) explicitly commit database changes, while FastAPI's dependency injection handles session lifecycle and cleanup.

**Core Principle:**
- Service layer owns transaction commits
- Routers receive sessions but never commit
- FastAPI dependency system handles session creation and cleanup
- Each service function represents one atomic transaction

**Session Lifecycle:**
1. FastAPI creates session via dependency injection (`SessionDep`)
2. Service function performs operations and commits
3. Session automatically closes after request (via `finally` block)
4. Uncaught exceptions trigger automatic rollback

## Why Service Layer Commits

**Why we chose this approach:**

- **Clear ownership**: Service functions control when data is persisted, making transaction boundaries explicit and obvious
- **Explicit control**: No hidden commits or magic - developers see exactly when data is saved
- **Separation of concerns**: Routers handle HTTP (request/response), services handle business logic and data persistence
- **Transaction boundaries**: Aligned with business operations - one function call = one transaction
- **Testability**: Easy to test service functions without the HTTP layer
- **FastAPI integration**: Natural fit with FastAPI's dependency injection model
- **Simplicity**: Straightforward pattern that new developers can understand quickly

**When we chose this:**
- Implemented from project start with authentication system
- Aligns with FastAPI best practices
- Keeps codebase simple and predictable
- Sufficient for current CRUD-focused operations

## Implementation Details

### Session Configuration

**Database Setup** (`app/database.py`):
```python
engine = create_engine(settings.db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

**Configuration choices:**
- `autocommit=False`: Requires explicit `session.commit()` calls for changes to persist
- `autoflush=False`: Manual control over when SQL statements are sent to the database

### Dependency Injection

**Session Provider** (`app/database.py`):
```python
def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

SessionDep = Annotated[Session, Depends(get_session)]
```

**How it works:**
- Session created once per HTTP request
- `try/finally` guarantees session cleanup even if exceptions occur
- Automatic rollback happens when session closes without commit
- FastAPI handles the entire lifecycle automatically

**Usage in services:**
```python
def create_user(session: SessionDep, user: UserCreate):
    # session is injected automatically
    # no manual session creation needed
```

### Standard Commit Patterns

**Pattern 1: Creating New Objects**

From `app/auth/service.py:30-37`:
```python
def create_user(session: SessionDep, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, password=hashed_password, email_verified=False)

    session.add(db_user)        # 1. Add new object to session
    session.commit()            # 2. Commit transaction to database
    session.refresh(db_user)    # 3. Refresh to get DB-generated values (id, timestamps)

    return db_user
```

**Why this sequence:**
- `add()`: Tells SQLAlchemy to track this object
- `commit()`: Persists changes to database
- `refresh()`: Loads DB-generated values back into the object (auto-incrementing IDs, defaults)

**Pattern 2: Updating Existing Objects**

From `app/email_verification/service.py:90-110`:
```python
def verify_email_token(session: Session, token: str) -> User | None:
    statement = select(User).where(User.verification_token == token)
    user = session.scalars(statement).first()

    if not user:
        return None

    # Modify tracked object directly
    user.email_verified = True
    user.verified_at = datetime.now()
    user.verification_token = None
    user.verification_token_expires_at = None

    session.commit()  # Commit changes

    return user
```

**Why this works:**
- Object loaded from database is automatically tracked by session
- Direct attribute modification is detected by SQLAlchemy
- No need to call `session.add()` for already-tracked objects
- `refresh()` optional for updates (object already has all data)

**Pattern 3: Read-Only Operations**

From `app/auth/service.py:40-43`:
```python
def get_user_by_email(session: SessionDep, email: EmailStr):
    statement = select(User).where(User.email == email)
    user = session.scalars(statement).first()
    return user
```

**No commit needed:**
- Query operations don't modify data
- Session automatically handles read operations
- No transaction to commit

### Error Handling

**Automatic rollback:**
```python
def change_user_password(user: User, old_password: str, new_password: str, session: SessionDep):
    if not verify_password(old_password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password",
        )

    user.password = get_password_hash(new_password)
    session.add(user)
    session.commit()  # If this fails, exception propagates
    session.refresh(user)
    return user
```

**How errors are handled:**
- Service functions raise `HTTPException` for business logic errors (before commit)
- Database errors during commit propagate up to router
- FastAPI's dependency system catches exceptions
- Session closes in `finally` block
- Uncommitted changes are automatically rolled back on session close
- No manual `session.rollback()` needed

**Error flow:**
1. Exception raised in service function
2. Exception propagates to router (FastAPI handles it)
3. Session's `finally` block executes
4. Session closes, triggering automatic rollback
5. FastAPI returns appropriate HTTP error response

## Code Examples

### Write Operations

**User creation** (`app/auth/service.py:30-37`):
```python
def create_user(session: SessionDep, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, password=hashed_password, email_verified=False)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user
```

**Password change** (`app/auth/service.py:94-107`):
```python
def change_user_password(user: User, old_password: str, new_password: str, session: SessionDep):
    if not verify_password(old_password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password",
        )
    user.password = get_password_hash(new_password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
```

**Verification token creation** (`app/email_verification/service.py:78-87`):
```python
def create_verification_token(session: Session, user: User) -> str:
    token = generate_verification_token()
    user.verification_token = token
    user.verification_token_expires_at = datetime.now() + timedelta(
        hours=email_settings.verification_token_expire_hours
    )
    user.verification_sent_at = datetime.now()
    session.commit()
    return token
```

**Email verification** (`app/email_verification/service.py:90-110`):
```python
def verify_email_token(session: Session, token: str) -> User | None:
    statement = select(User).where(User.verification_token == token)
    user = session.scalars(statement).first()

    if not user:
        return None

    if user.verification_token_expires_at and user.verification_token_expires_at < datetime.now():
        return None

    user.email_verified = True
    user.verified_at = datetime.now()
    user.verification_token = None
    user.verification_token_expires_at = None
    session.commit()

    return user
```

### Read-Only Operations

**User lookup** (`app/auth/service.py:40-43`):
```python
def get_user_by_email(session: SessionDep, email: EmailStr):
    statement = select(User).where(User.email == email)
    user = session.scalars(statement).first()
    return user
```

**Authentication** (`app/auth/service.py:46-52`):
```python
def authenticate_user(session: SessionDep, email: EmailStr, password: str):
    user = get_user_by_email(session, email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user
```

**Validation** (`app/email_verification/service.py:113-121`):
```python
def can_resend_verification(user: User) -> bool:
    """Check if enough time has passed to resend verification email."""
    if not user.verification_sent_at:
        return True

    time_since_last = datetime.now() - user.verification_sent_at
    cooldown = timedelta(minutes=email_settings.resend_cooldown_minutes)
    return time_since_last >= cooldown
```

## Alternatives Considered

### Repository Pattern with Unit of Work

**Pattern:**
- Create repository classes for each model (UserRepository, etc.)
- Unit of Work manages transactions across multiple repositories
- Services work with repositories, not sessions directly

**Pros:**
- More abstraction - easier to swap out ORM or database
- Clear separation between data access and business logic
- Easier to mock for testing

**Cons:**
- Additional complexity and boilerplate
- Extra layers between service and database
- Over-engineering for current needs (simple CRUD operations)
- More files to maintain

**Why we didn't choose it:**
- Current codebase is small and focused on CRUD
- SQLAlchemy already provides good abstraction
- FastAPI dependency injection is sufficient for our needs
- Can migrate to this pattern later if complexity grows

### Router-Level Transaction Management

**Pattern:**
- Routers receive session dependency
- Routers call service functions (which don't commit)
- Routers commit at the end of request handling

**Pros:**
- Centralized transaction control
- Single commit point per request

**Cons:**
- Services become stateful and harder to compose
- Can't reuse service functions in different contexts
- Tight coupling between routers and services
- Harder to test services independently
- Unclear transaction boundaries

**Why we didn't choose it:**
- Services lose independence
- Difficult to compose multiple service calls
- Testing becomes more complex

### Automatic Commit (autocommit=True)

**Pattern:**
- Configure SQLAlchemy with `autocommit=True`
- Every operation commits immediately
- No manual commit calls needed

**Pros:**
- No manual commits required
- Simpler code (fewer lines)

**Cons:**
- Loss of transaction control
- Can't batch multiple operations into one transaction
- Harder to test (data persists immediately)
- Can't rollback on business logic errors
- Performance issues (many small commits vs. one batch)

**Why we didn't choose it:**
- Need explicit transaction boundaries
- Want ability to rollback before commit
- Need to batch operations for consistency

## Trade-offs and Limitations

### Current Limitations

**1. No Nested Transactions**

Each service function is its own transaction boundary:
```python
# ❌ Can't do this - each function commits independently
def complex_workflow(session: SessionDep):
    create_user(session, user_data)      # commits here
    create_verification_token(session)   # commits here
    # If second commit fails, first commit already persisted
```

**Workaround:**
Create a coordinating service function that handles the entire workflow:
```python
# ✅ Better approach
def create_user_with_verification(session: SessionDep, user: UserCreate):
    # Create user
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, password=hashed_password)
    session.add(db_user)

    # Create verification token
    token = generate_verification_token()
    db_user.verification_token = token
    db_user.verification_token_expires_at = datetime.now() + timedelta(hours=24)

    # Single commit for both operations
    session.commit()
    session.refresh(db_user)
    return db_user, token
```

**2. Manual Commit Requirement**

Developers must remember to call `commit()`:

**Risk:**
```python
# ❌ Bug - forgot to commit!
def update_user_email(session: SessionDep, user: User, new_email: str):
    user.email = new_email
    session.add(user)
    # Missing: session.commit()
    return user  # Changes won't persist!
```

**Mitigation:**
- Code reviews catch missing commits
- Consistent patterns across codebase
- Testing reveals missing commits (data doesn't persist in tests)

**3. Transaction Per Function**

Can't easily span transactions across multiple service calls:
- Each function = atomic unit
- Complex workflows need careful design
- Must create higher-level coordinating functions

### Future Considerations

**When to migrate to Unit of Work pattern:**
- If we need complex multi-step transactions
- If service composition becomes difficult
- If we want to swap ORMs or databases
- If transaction management becomes error-prone

**For now:**
- Current pattern works well for CRUD operations
- Team understands the pattern
- Sufficient for current scale and complexity

## Best Practices

### 1. Always Commit in Services, Never in Routers

**✅ Good (service layer):**
```python
# app/auth/service.py
def create_user(session: SessionDep, user: UserCreate):
    db_user = User(email=user.email, password=hashed_password)
    session.add(db_user)
    session.commit()  # Service commits
    session.refresh(db_user)
    return db_user

# app/auth/router.py
@router.post("/register")
def register(user: UserCreate, session: SessionDep):
    db_user = create_user(session, user)  # Service handles commit
    return db_user
```

**❌ Bad (router commits):**
```python
# app/auth/service.py
def create_user(session: SessionDep, user: UserCreate):
    db_user = User(email=user.email, password=hashed_password)
    session.add(db_user)
    # No commit - leaves it to router
    return db_user

# app/auth/router.py
@router.post("/register")
def register(user: UserCreate, session: SessionDep):
    db_user = create_user(session, user)
    session.commit()  # ❌ Don't commit in routers!
    return db_user
```

### 2. Follow the Standard Sequences

**New objects:**
```python
session.add(obj)      # 1. Add to session
session.commit()      # 2. Commit transaction
session.refresh(obj)  # 3. Refresh to get DB values
```

**Updates to existing objects:**
```python
obj.field = new_value  # 1. Modify tracked object
session.commit()       # 2. Commit transaction
# refresh optional for updates
```

**Deletes:**
```python
session.delete(obj)   # 1. Mark for deletion
session.commit()      # 2. Commit transaction
```

### 3. Read-Only Functions Don't Commit

**✅ Good:**
```python
def get_user_by_email(session: SessionDep, email: EmailStr):
    statement = select(User).where(User.email == email)
    user = session.scalars(statement).first()
    return user  # No commit needed
```

**❌ Bad:**
```python
def get_user_by_email(session: SessionDep, email: EmailStr):
    statement = select(User).where(User.email == email)
    user = session.scalars(statement).first()
    session.commit()  # ❌ Unnecessary commit!
    return user
```

### 4. Let Exceptions Propagate

**✅ Good:**
```python
def change_password(user: User, old_password: str, new_password: str, session: SessionDep):
    if not verify_password(old_password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password",
        )

    user.password = get_password_hash(new_password)
    session.add(user)
    session.commit()  # If this fails, exception propagates
    return user
```

**❌ Bad:**
```python
def change_password(user: User, old_password: str, new_password: str, session: SessionDep):
    try:
        user.password = get_password_hash(new_password)
        session.add(user)
        session.commit()
    except Exception:
        # ❌ Don't suppress errors!
        return None
```

**Why:**
- FastAPI handles exceptions and returns appropriate HTTP responses
- Session cleanup happens automatically in `finally` block
- Automatic rollback on uncaught exceptions
- Better error visibility for debugging

### 5. One Service Function = One Transaction

**✅ Good:**
```python
# Single function, single transaction
def create_user_with_verification(session: SessionDep, user: UserCreate):
    db_user = User(email=user.email, password=hashed_password)
    session.add(db_user)

    token = generate_verification_token()
    db_user.verification_token = token

    session.commit()  # One commit for everything
    session.refresh(db_user)
    return db_user
```

**❌ Bad (for complex workflows):**
```python
# Multiple service calls = multiple transactions
def register_user(session: SessionDep, user: UserCreate):
    db_user = create_user(session, user)          # Commits here
    token = create_verification_token(session)    # Commits here
    send_verification_email(db_user.email, token) # If this fails, data already committed!
```

**When to use each:**
- Multiple transactions: OK for independent operations
- Single transaction: Required for operations that must succeed/fail together

## References

- [SQLAlchemy Session Basics](https://docs.sqlalchemy.org/en/20/orm/session_basics.html) - Official documentation on session management
- [FastAPI Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/) - Dependency injection pattern used for sessions
- [SQLAlchemy Session Transaction Behavior](https://docs.sqlalchemy.org/en/20/orm/session_transaction.html) - Understanding commits, rollbacks, and transaction boundaries
