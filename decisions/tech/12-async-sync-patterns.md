# Async/Sync Design Patterns

## Overview

Super Impress uses a **hybrid async/sync architecture** in the backend. The design principle is simple:

- **Async** for network I/O (external API calls)
- **Sync** for everything else (database, encryption, in-memory operations)

This approach balances performance with simplicity, avoiding the complexity of fully async database drivers while still benefiting from non-blocking I/O for external calls.

## Design Principles

### When to Use Async

Use `async def` when the function:
1. Makes HTTP requests to external services (LinkedIn API, OAuth providers)
2. Calls other async functions and needs to `await` them
3. Would otherwise block the event loop with slow I/O

### When to Use Sync

Use regular `def` when the function:
1. Only performs database operations (sync SQLAlchemy is fast enough)
2. Does CPU-bound work (encryption, hashing, validation)
3. Works with in-memory data structures
4. Has no async dependencies

## Layer-by-Layer Breakdown

### HTTP Client Layer (Async)

**Files:** `backend/app/social/linkedin/client.py`

Uses `httpx.AsyncClient` for non-blocking HTTP requests:

```python
async def get_user_info(access_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(USERINFO_URL, headers=headers)
        return response.json()

async def create_post(access_token: str, person_urn: str, content: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(POSTS_URL, headers=headers, json=payload)
        return response.json()["id"]
```

**Why httpx:**
- Native async support (unlike `requests`)
- Familiar requests-like API
- Built-in connection pooling
- Type hints support

### OAuth Layer (Mixed)

**Files:** `backend/app/social/linkedin/oauth.py`

```python
# Async: External API call
async def exchange_code_for_tokens(code: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(TOKEN_URL, data=data)
        return response.json()

# Sync: In-memory operations only
def generate_oauth_state() -> str:
    state = secrets.token_urlsafe(32)
    _pending_states[state] = datetime.now()
    return state

def verify_oauth_state(state: str) -> bool:
    return state in _pending_states

def get_authorization_url(state: str) -> str:
    return f"{AUTH_URL}?{urlencode(params)}"
```

### Database Layer (Sync)

**Files:** `backend/app/social/service.py`, `backend/app/database.py`

SQLAlchemy is used synchronously:

```python
def get_connection(session: Session, user: User, platform: SocialPlatform):
    return session.query(SocialConnection).filter(...).first()

def create_or_update_connection(session: Session, ...):
    session.add(connection)
    session.commit()

def delete_connection(session: Session, ...):
    session.delete(connection)
    session.commit()
```

**Why sync SQLAlchemy:**
- Database operations are typically fast (<10ms)
- Async SQLAlchemy adds significant complexity
- Connection pooling handles concurrency well
- No practical performance difference for our use case

### Encryption Layer (Sync)

**Files:** `backend/app/social/linkedin/encryption.py`

```python
def encrypt_token(token: str) -> str:
    return fernet.encrypt(token.encode()).decode()

def decrypt_token(encrypted: str) -> str:
    return fernet.decrypt(encrypted.encode()).decode()
```

CPU-bound but fast (~1ms). No benefit from async.

### Service Layer (Mixed)

**Files:** `backend/app/social/linkedin/service.py`

This layer orchestrates async and sync operations:

```python
# Async: Calls external APIs
async def connect_linkedin(session: Session, user: User, code: str) -> User:
    token_data = await exchange_code_for_tokens(code)  # Async API call
    user_info = await get_user_info(access_token)      # Async API call
    create_or_update_connection(session, ...)          # Sync DB operation
    return user

# Sync: Only database operations
def disconnect_linkedin(session: Session, user: User) -> User:
    delete_connection(session, user, SocialPlatform.LINKEDIN)
    return user

# Sync: Only database + decryption
def get_access_token(session: Session, user: User) -> str:
    linkedin_conn = get_connection(session, user, SocialPlatform.LINKEDIN)
    encrypted_token = get_valid_access_token(linkedin_conn)
    return decrypt_token(encrypted_token)

# Async: Calls external API
async def post_to_linkedin(session: Session, user: User, post: Post) -> str:
    access_token = get_access_token(session, user)           # Sync
    linkedin_post_id = await create_linkedin_post(...)       # Async API call
    post.status = PostStatus.PUBLISHED
    session.commit()                                          # Sync
    return linkedin_post_id
```

### Router Layer (Async)

**Files:** `backend/app/social/linkedin/router.py`

All FastAPI route handlers are async to work with the event loop:

```python
@linkedin_router.post("/connect/callback")
async def complete_linkedin_connection(...):
    user = await connect_linkedin(session, current_user, code)  # Await async
    linkedin_conn = get_connection(session, user, ...)           # Sync is OK
    return LinkedInConnectionStatus(...)

@linkedin_router.post("/disconnect")
async def disconnect_linkedin_account(...):
    disconnect_linkedin(session, current_user)  # No await - it's sync!
    return LinkedInConnectionStatus(...)
```

## Common Pitfalls

### 1. Awaiting Sync Functions

**Wrong:**
```python
async def handler():
    await disconnect_linkedin(session, user)  # Bug! disconnect_linkedin is sync
```

**Correct:**
```python
async def handler():
    disconnect_linkedin(session, user)  # No await for sync functions
```

Python won't raise an error, but awaiting a non-coroutine can cause unexpected behavior.

### 2. Blocking in Async Context

**Wrong:**
```python
async def get_data():
    response = requests.get(url)  # Blocks the event loop!
    return response.json()
```

**Correct:**
```python
async def get_data():
    async with httpx.AsyncClient() as client:
        response = await client.get(url)  # Non-blocking
        return response.json()
```

### 3. Unnecessary Async

**Unnecessary:**
```python
async def format_name(first: str, last: str) -> str:
    return f"{first} {last}"  # No I/O, no await - async adds overhead
```

**Better:**
```python
def format_name(first: str, last: str) -> str:
    return f"{first} {last}"
```

## Guidelines for New Code

1. **External HTTP calls**: Always use `async` with `httpx.AsyncClient`
2. **Database operations**: Use sync SQLAlchemy, no need for `async`
3. **Service functions**: Mark as `async` only if they call async functions
4. **Router handlers**: Always `async` (FastAPI convention)
5. **Utility functions**: Keep sync unless they have async dependencies
6. **When in doubt**: Check what the function calls - if no `await` needed, keep it sync

## Rationale

### Why Not Full Async?

1. **Complexity**: Async SQLAlchemy requires different session management patterns
2. **Minimal benefit**: Database queries are fast; async won't improve throughput significantly
3. **Debugging**: Sync code has simpler stack traces
4. **Dependencies**: Many libraries don't support async

### Why Not Full Sync?

1. **External API latency**: LinkedIn API calls take 100-500ms
2. **Event loop blocking**: Sync HTTP calls block the entire worker
3. **Throughput**: Async I/O allows handling more concurrent requests

The hybrid approach gives us the best of both worlds.

## References

- [FastAPI Async Documentation](https://fastapi.tiangolo.com/async/)
- [httpx Async Guide](https://www.python-httpx.org/async/)
- [SQLAlchemy Async (if needed later)](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
