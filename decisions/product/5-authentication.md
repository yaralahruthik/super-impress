### Authentication: Sessions, Tokens, and Modern Best Practices

We're using a hybrid approach that combines stateless JWT tokens (bearer tokens) with stateful refresh token management.

This document explains the trade-offs we considered and why we chose this specific implementation.

#### The Core Concept

Authentication isn't about choosing between tokens or sessions. It's using **both**. Sessions represent authenticated state, managed using tokens. The key difference is where session state lives.

#### Stateful Sessions

The server stores session info (in a database or Redis) linked to a session ID, typically sent as a cookie. You get explicit control. Want to log someone out? Just delete their session record for immediate invalidation.

The trade-off: the server must maintain and query this state on every request, adding latency and complexity when scaling horizontally (you'll need a shared session store).

#### Stateless Tokens

The server issues a cryptographically signed token with user info, stores nothing, and only verifies signatures. The client holds the token.This is fast (no database calls for validation) and scales horizontally with ease.

The trade-off: a stolen token stays valid until expiration. Revoking it early requires a server-side blocklist, which reintroduces state and diminishes the "stateless" advantage.

#### Our Hybrid Flow

1. User submits credentials
2. We verify against the database
3. On success, generate two JWTs: a short-lived **access token** and long-lived **refresh token**
4. Store a hashed refresh token in the database. **This is our backend 'session identifier'**, the stateful record that lets us revoke access
5. Send both tokens to the client

The client sends the access token with each request. The backend (using something like `HTTPBearer`) extracts it from the `Authorization` header, verifies the signature with the secret key, trusts the payload data, and processes the request.

#### Client-Side Token Strategies

Two approaches, each with a security trade-off:

##### Approach 1: HttpOnly Cookies (Browser-Managed)

Backend sets tokens in `HttpOnly` cookies; browser manages them automatically.

**Pros:**

- **Strong XSS Protection:** JavaScript can't access `HttpOnly` cookies. Even if malicious scripts run, they can't steal tokens
- **Simpler Client Code:** Browser automatically sends cookies (no manual `Authorization` header logic)

**Cons:**

- **CSRF Vulnerability:** Browsers auto-attach cookies to any request to your domain. A malicious site can trick users into unwanted requests, requiring complex anti-CSRF defenses
- **Less Flexible:** Cookie configuration across domains/subdomains is tricky (CORS issues), and they're browser-centric (not ideal for mobile apps)

##### Approach 2: Bearer Tokens (JavaScript-Managed)

Our approach: backend sends tokens in the response body, client JavaScript stores them and adds the access token to `Authorization: Bearer <token>` headers.

**Pros:**

- **CSRF Immunity:** Browser doesn't auto-attach the header. Your code explicitly adds it, so malicious sites can't forge authenticated requests
- **Flexible & Stateless:** Works with any HTTP client (SPAs, mobile apps, services), scales easily, no CORS headaches

**Cons:**

- **XSS Vulnerability:** JavaScript must access tokens to attach them to headers, making them stealable via XSS. Mitigated by storing short-lived access tokens in memory and only persisting refresh tokens in `localStorage`

> The modern consensus for SPAs: use the bearer token approach, build strong XSS defenses (like a robust Content Security Policy), which you need anyway, and enjoy CSRF immunity and flexibility.

### Implementation Details

#### Token Refresh Strategy

Short-lived access tokens (15-30 minutes) provide security with good UX through refresh tokens:

1. Expired access token triggers `HTTP 401`
2. Frontend detects this (via HTTP interceptor)
3. Client requests `/refresh` with the refresh token
4. Backend validates and issues new tokens
5. Frontend updates storage and retries the original request (transparent to the user)

#### Secure Frontend Storage

Given XSS risks when JavaScript accesses tokens, use this hybrid approach:

- **Access Token:** Store in **volatile JavaScript memory** (Pinia, Redux, Svelte store). Not in `localStorage`. Lost on refresh, but safe from persistent XSS attacks.

- **Refresh Token:** Store in **`localStorage`** (or `sessionStorage`). Provides persistence across refreshes. Less sensitive since it can't directly access resources (only get new access tokens). Backend can detect suspicious usage (concurrent uses, IP changes) and revoke.

**XSS Mitigation:**

- Implement strict Content Security Policy (CSP)
- Sanitize and escape user-generated content
- Regularly audit third-party dependencies

#### Logout Flow

**Client:** Delete access token (memory) and refresh token (`localStorage`)

**Backend:** Call `/logout` to invalidate the stored refresh token in the database, completely ending the server-side session even if tokens were stolen
