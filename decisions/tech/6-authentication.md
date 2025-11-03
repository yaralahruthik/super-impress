# Authentication System

## Overview

Super Impress uses **JWT-based authentication** with OAuth2 password flow for user authentication and authorization. This provides a stateless, scalable authentication system suitable for both web and future mobile clients.

**Authentication Flow:**
1. User registers with email and password
2. Password is hashed using Argon2 and stored securely
3. User logs in with credentials
4. Server issues a signed JWT access token (30-minute expiration)
5. Client includes token in Authorization header for protected endpoints
6. Server validates token on each request

## Security Choices

### JWT (JSON Web Tokens)

**Why JWT:**
- **Stateless**: No server-side session storage needed, enables horizontal scaling
- **Self-contained**: Token includes user identity, reducing database lookups
- **Industry standard**: Well-understood security model with extensive library support
- **Multi-client ready**: Same token works for web, mobile, and third-party integrations
- **FastAPI integration**: Native OAuth2 support with automatic OpenAPI documentation

**Implementation:**
- Algorithm: HS256 (HMAC with SHA-256)
- Token lifetime: 30 minutes (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)
- Payload: Contains email in "sub" (subject) claim
- Signing: Uses `SECRET_KEY` from environment variables

**Why not alternatives:**
- **Session-based auth**: Requires server-side storage, harder to scale horizontally
- **API keys**: Less secure for user authentication (no expiration, harder to revoke)
- **OAuth2 (external)**: Too complex for MVP, adds third-party dependencies

### Argon2 Password Hashing

**Why Argon2:**
- **OWASP recommended**: Winner of Password Hashing Competition (PHC)
- **Memory-hard**: Resistant to GPU/ASIC attacks
- **Modern standard**: Supersedes bcrypt and PBKDF2 for new systems
- **Side-channel resistant**: Protects against timing attacks

**Implementation:**
- Library: `pwdlib[argon2]>=0.3.0`
- Configuration: `PasswordHash.recommended()` uses secure defaults
- Automatic salting: Each password gets unique salt
- Timing-safe comparison: Prevents password enumeration

**Why not alternatives:**
- **Bcrypt**: Older, less resistant to hardware attacks
- **SHA-256/SHA-512**: Not designed for passwords (too fast, no built-in salting)
- **PBKDF2**: Slower and more complex than Argon2 for equivalent security

### OAuth2 Password Flow

**Why OAuth2:**
- **Standardized**: RFC 6749 compliant
- **FastAPI native**: Built-in support with `OAuth2PasswordBearer`
- **API documentation**: Automatic "Authorize" button in Swagger UI
- **Extensible**: Easy to add refresh tokens, scopes, and OAuth2 providers later

**Current limitations:**
- Uses password grant (deprecated in OAuth 2.1) - acceptable for first-party apps
- No refresh tokens yet
- No scopes/permissions system yet

## Implementation Details

### Database Schema

**User Model** (`backend/app/auth/models.py`):
```python
class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: EmailStr = Field(unique=True, index=True)
    password: str  # Argon2 hash
```

**Supporting Models:**
- `UserCreate`: Registration request (email + plain password)
- `UserPublic`: Response schema (excludes password)
- `Token`: JWT response (`access_token`, `token_type`)
- `TokenData`: Token payload (contains email)

**Schema management:**
- Auto-created on app startup via SQLModel's `create_db_and_tables()`
- No migration system currently (planned: Alembic)

### API Endpoints

**1. POST /register**
- **Purpose**: Create new user account
- **Input**: `{"email": "user@example.com", "password": "plaintext"}`
- **Output**: `{"id": 1, "email": "user@example.com"}`
- **Validation**: Email format via Pydantic's `EmailStr`
- **Error handling**:
  - 400 if email already exists
  - 422 if invalid email format

**2. POST /login**
- **Purpose**: Authenticate and issue JWT
- **Input**: Form data (`username=user@example.com`, `password=plaintext`)
  - Note: Uses "username" field name per OAuth2 spec, but accepts email
- **Output**: `{"access_token": "eyJ...", "token_type": "bearer"}`
- **Error handling**:
  - 401 if credentials invalid (generic message: "Incorrect username or password")
  - Does not reveal whether email exists (prevents enumeration)

**3. GET /users/me/**
- **Purpose**: Retrieve current authenticated user
- **Input**: Authorization header: `Bearer <token>`
- **Output**: `{"id": 1, "email": "user@example.com"}`
- **Protection**: Requires valid JWT via `Depends(get_current_user)`
- **Error handling**:
  - 401 if token missing, invalid, or expired
  - 401 if user no longer exists in database

### Configuration

**Environment Variables** (`backend/.env`):
```bash
# Required
SECRET_KEY=your-secret-key-here-change-this-in-production  # JWT signing key
DATABASE_URL=postgresql+psycopg://user:pass@host:port/db   # For User table

# Optional (have defaults)
ALGORITHM=HS256                      # JWT algorithm (default: HS256)
ACCESS_TOKEN_EXPIRE_MINUTES=30      # Token lifetime (default: 30)
```

**Configuration Management:**
- Pydantic-settings based (`backend/app/auth/config.py`)
- Type-safe with validation
- Global `auth_settings` instance
- `.env.example` includes all auth variables

**Security notes:**
- `SECRET_KEY` must be strong random string (min 32 characters recommended)
- Never commit `.env` to version control
- Rotate `SECRET_KEY` to invalidate all existing tokens

### Code Structure

**New Module: `backend/app/auth/`**
```
auth/
├── __init__.py      # Module marker
├── config.py        # AuthSettings (SECRET_KEY, ALGORITHM, expiration)
├── models.py        # User, UserCreate, UserPublic, Token, TokenData
├── router.py        # API endpoints (/register, /login, /users/me/)
└── service.py       # Business logic (hashing, JWT, user CRUD)
```

**Service Layer** (`service.py`):
- `get_password_hash()` / `verify_password()`: Password operations
- `create_user()` / `get_user_by_email()`: User CRUD
- `authenticate_user()`: Credential validation
- `create_access_token()`: JWT generation
- `get_current_user()`: JWT validation + user retrieval
- `oauth2_scheme`: OAuth2PasswordBearer with `tokenUrl="login"`

**Dependency Injection:**
- `SessionDep`: Database session (from `app.database`)
- `Depends(get_current_user)`: Protects endpoints requiring authentication
- `Depends(OAuth2PasswordRequestForm)`: Handles login form data

**Integration:**
- Router included in `main.py` with `app.include_router(auth_router)`
- No prefix (endpoints at root: `/register`, `/login`, `/users/me/`)

### Dependencies

**New Python Packages** (`pyproject.toml`):
- `pwdlib[argon2]>=0.3.0` - Password hashing with Argon2 support
- `pyjwt>=2.10.1` - JWT encoding and decoding

**Existing Dependencies:**
- `fastapi` - OAuth2 support
- `sqlmodel` - User model and database
- `pydantic[email]` - EmailStr validation

## Known Limitations

### Security Gaps

1. **No refresh tokens**
   - Users must re-authenticate every 30 minutes
   - Cannot revoke access tokens before expiration
   - Impact: Poor UX for long sessions, security risk if token stolen

2. **No rate limiting**
   - Login/register endpoints vulnerable to brute force
   - No protection against credential stuffing attacks
   - Recommendation: Add rate limiting middleware (e.g., `slowapi`)

3. **No email verification**
   - Users can register with fake/unowned emails
   - No way to reset password without email verification
   - Recommendation: Add email confirmation flow before account activation

4. **No password complexity requirements**
   - Only client-side validation (if any)
   - Users can set weak passwords (e.g., "password123")
   - Recommendation: Add Pydantic validator for min length, complexity

5. **No account lockout**
   - Unlimited failed login attempts allowed
   - Combined with no rate limiting, enables brute force
   - Recommendation: Temporary lockout after N failed attempts

6. **Generic error messages**
   - While good for security (prevents enumeration), poor UX
   - Users don't know if email is wrong vs password
   - Trade-off: Security vs usability

7. **No token revocation**
   - Cannot invalidate specific tokens (logout doesn't work server-side)
   - Compromise: User must wait for token expiration
   - Recommendation: Add token blacklist or switch to refresh token pattern

### Operational Gaps

1. **No password reset flow**
   - If user forgets password, no recovery mechanism
   - Requires email verification system first

2. **No user profile updates**
   - Cannot change email or password
   - Recommendation: Add PUT /users/me/ endpoint

3. **No admin functionality**
   - Cannot disable accounts, view users, etc.
   - Recommendation: Add admin role and endpoints

4. **No audit logging**
   - Failed logins not logged
   - Cannot detect suspicious activity
   - Recommendation: Add structured logging for auth events

### Technical Debt

1. **No database migrations**
   - Schema changes require manual coordination
   - Risk: Data loss on schema changes
   - Recommendation: Add Alembic

2. **SECRET_KEY rotation not supported**
   - Changing SECRET_KEY invalidates all tokens
   - No graceful migration path
   - Recommendation: Support multiple keys with key ID in token header

3. **No testing**
   - Auth endpoints not covered by unit/integration tests
   - Security regressions possible
   - Recommendation: Add pytest test suite

4. **Password field in User model**
   - Technically called "password" but stores hash
   - Confusing naming
   - Recommendation: Rename to `password_hash` for clarity

## Future Considerations

### Short-term Enhancements (MVP+)

1. **Refresh tokens**
   - Implement RFC 6749 refresh token flow
   - Access token: 30 minutes, refresh token: 7 days
   - Allows token revocation and better UX

2. **Rate limiting**
   - Add `slowapi` or similar middleware
   - Limit: 5 failed logins per 15 minutes per IP
   - Limit: 10 registrations per hour per IP

3. **Email verification**
   - Send confirmation email with signed token
   - Block login until email confirmed
   - Enables password reset flow

4. **Password requirements**
   - Min 8 characters, at least one number, one uppercase
   - Validate with Pydantic validator
   - Use `zxcvbn` for strength estimation

5. **CORS configuration**
   - Currently not configured
   - Required for frontend (SvelteKit) to call backend
   - Add CORS middleware with allowed origins

### Medium-term Enhancements

1. **Social OAuth providers**
   - Google, LinkedIn, GitHub login
   - Requires OAuth2 authorization code flow
   - Library: `authlib` or `fastapi-sso`

2. **Role-based access control (RBAC)**
   - Add `Role` model and user-role relationship
   - Implement permission decorators
   - Scopes in JWT token

3. **Two-factor authentication (2FA)**
   - TOTP (Google Authenticator, Authy)
   - Library: `pyotp`
   - Backup codes for recovery

4. **Session management**
   - View active sessions (devices/locations)
   - Revoke specific sessions
   - Requires session storage (Redis)

5. **Security monitoring**
   - Log failed auth attempts
   - Alert on suspicious patterns (many failed logins)
   - Integration with logging service

### Long-term Considerations

1. **Single Sign-On (SSO)**
   - SAML 2.0 for enterprise customers
   - Centralized identity provider

2. **Passwordless authentication**
   - Magic links via email
   - WebAuthn/FIDO2 for biometric auth

3. **Multi-tenancy**
   - Organization/workspace concept
   - Team member invitations
   - Shared resources with permissions

4. **API key management**
   - For programmatic access (CLI, integrations)
   - Scoped keys with rate limits
   - Key rotation and revocation

## Migration Path

If we need to migrate to a different auth system:

**From JWT to session-based:**
1. Add session storage (Redis/PostgreSQL)
2. Add session middleware
3. Deprecate JWT endpoints gradually
4. Support both during transition

**From JWT to OAuth2 server:**
1. Add authorization server (Authlib, ORY Hydra)
2. Migrate to authorization code flow
3. Issue refresh tokens from new server
4. Existing access tokens expire naturally

**Adding refresh tokens:**
1. Add `refresh_token` field to response
2. Create POST /refresh endpoint
3. Store refresh tokens in database (hashed)
4. Implement token rotation on refresh

## References

- [FastAPI Security Documentation](https://fastapi.tiangolo.com/tutorial/security/)
- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
- [JWT RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Argon2 RFC 9106](https://datatracker.ietf.org/doc/html/rfc9106)
- [pwdlib Documentation](https://pwdlib.readthedocs.io/)
