# Database Connection Localhost Resolution

## Context
When running the stack in **Mode 2** (Postgres in Docker + Backend Local), using `localhost` as the hostname in the `DATABASE_URL` can lead to significant connection delays.

This happens because modern OSs/drivers may attempt to resolve `localhost` via IPv6 first (`::1`). If the Docker container is only listening on IPv4 (which is common for published ports), the connection hangs until the IPv6 attempt times out and defaults back to IPv4 (`127.0.0.1`).

This delay accumulates, causing:
1. Slow application startup.
2. Extremely slow automated tests (which create many connections).
3. Timeouts in test suites and migrations.

## Decision
We have decided to **automatically resolve `localhost` to `127.0.0.1` within the application configuration**.

We implemented this using a Pydantic `field_validator` in `backend/app/config.py` that intercepts the `DATABASE_URL`. If the host is `localhost`, it is rewritten to `127.0.0.1`.

```python
    @field_validator("db_url")
    @classmethod
    def resolve_localhost(cls, v: str) -> str:
        from sqlalchemy.engine.url import make_url

        url = make_url(v)
        if url.host == "localhost":
            return url.set(host="127.0.0.1").render_as_string(hide_password=False)
        return v
```

## Consequences

### Positive
*   **Zero-Config Optimization**: Developers don't need to know about the Windows/IPv6 quirk. It "just works" out of the box.
*   **Universal Fix**: Because the fix is in `config.py` (the source of truth for settings), it automatically applies to:
    *   The Main FastAPI Application
    *   Alembic Migrations (`env.py` imports settings)
    *   Tests
*   **Robustness**: CI/CD pipelines or new setups that default to `localhost` won't suffer from timeouts.

### Negative
*   **Implicit Behavior**: There is a small amount of "magic" happening in the config that might surprise someone explicitly trying to use IPv6 localhost (edge case).

### Alternatives Considered
*   **Updating `.env` manually**: We could have required every developer to change `localhost` to `127.0.0.1` in their `.env`. This was rejected because it is fragile, bad for developer experience (easy to forget), and doesn't solve the issue for default test configurations.
