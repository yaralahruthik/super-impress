# LinkedIn Integration Implementation

This document describes the LinkedIn posting integration implemented in the Super Impress backend.

## Overview

The LinkedIn integration enables users to:
1. Connect their LinkedIn account via OAuth 2.0
2. Publish posts from Super Impress directly to LinkedIn
3. Track which posts have been published to which platforms

## Architecture

### Technology Stack

- **OAuth Provider**: Better Auth LinkedIn social provider + manual account linking (`/api/auth/link-social`)
- **LinkedIn API**: REST API v2 with OpenID Connect
- **Token Storage**: better-auth's built-in account table
- **HTTP Client**: Native fetch API (Bun)

### Database Schema

#### New Table: `post_publication`

Tracks posts published to social media platforms:

```sql
CREATE TABLE post_publication (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES post(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  platform_post_id TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  account_id TEXT REFERENCES account(id) ON DELETE CASCADE,
  metadata JSONB,
  UNIQUE(post_id, platform, account_id)
);
```

#### New Enum: `social_platform`

```sql
CREATE TYPE social_platform AS ENUM ('linkedin', 'twitter', 'facebook');
```

This design supports:
- One post published to multiple platforms
- Per-platform tracking (post IDs, timestamps, metadata)
- Easy extensibility for new platforms
- Multiple social accounts per platform

### File Structure

```
backend/src/
├── auth.ts                       # LinkedIn OAuth provider config
├── db/schema/
│   └── posts.ts                  # post_publication table + relations
├── modules/linkedin/
│   ├── index.ts                  # Route handlers (2 endpoints)
│   ├── model.ts                  # TypeBox validation schemas
│   ├── service.ts                # Business logic
│   └── client.ts                 # LinkedIn API wrapper
└── modules/posts/
    ├── model.ts                  # Updated with publications field
    └── service.ts                # Updated to include publications
```

## API Endpoints

### OAuth Flow (handled by better-auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/link-social` | Start LinkedIn OAuth flow for a logged-in user (account linking) |
| GET/POST | `/api/auth/callback/linkedin` | OAuth callback endpoint |

**Frontend Usage:**
```typescript
import { authClient } from '@/lib/auth-client';

// Link LinkedIn to existing account with posting permission
await authClient.linkSocialAccount({
  provider: 'linkedin',
  callbackURL: 'http://localhost:5173/settings',
  errorCallbackURL: 'http://localhost:5173/settings',
  scopes: ['w_member_social'],
});
```

### LinkedIn Module Endpoints

#### 1. Get Connection Status

```http
GET /api/linkedin/status
Authorization: Bearer {session_token}
```

**Response:**
```json
{
  "connected": true,
  "accountId": "account_123",
  "email": "user@example.com"
}
```

#### 2. Publish Post to LinkedIn

```http
POST /api/linkedin/post
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "postId": "uuid-of-post"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "linkedInPostId": "urn:li:share:123456789"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Post already published to LinkedIn"
}
```

### Posts Endpoints (Updated)

All post endpoints now include a `publications` array:

```http
GET /api/posts/:id
```

**Response:**
```json
{
  "id": "uuid",
  "content": "My awesome post",
  "publications": [
    {
      "platform": "linkedin",
      "platformPostId": "urn:li:share:123456789",
      "publishedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## LinkedIn OAuth Setup

### 1. Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app or select existing app
3. Add these products:
   - **Sign In with LinkedIn using OpenID Connect** (for authentication)
   - **Share on LinkedIn** (for posting capability)
4. Set redirect URI: `http://localhost:3000/api/auth/callback/linkedin`

### 2. Required Scopes

The integration requests these OAuth scopes:

- `openid` - Basic OpenID Connect authentication
- `profile` - User profile information (name, picture)
- `email` - User email address
- `w_member_social` - **Permission to post on behalf of the user** (requested during account linking)

### 3. Environment Variables

Add to `backend/.env`:

```bash
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
```

## Implementation Details

### OAuth Configuration

Using Better Auth's built-in LinkedIn social provider:

```typescript
// src/auth.ts
socialProviders: {
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID!,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
  },
},

// Request `w_member_social` when linking via `/api/auth/link-social`.
```

### Token Management

- **Storage**: better-auth's `account` table
- **Refresh**: Automatic via better-auth's token management
- **Security**: Tokens stored securely in database, never exposed to frontend

### LinkedIn API Integration

#### Creating Posts

Uses LinkedIn's Posts API (REST v2):

```typescript
POST https://api.linkedin.com/rest/posts
Headers:
  - Authorization: Bearer {access_token}
  - Content-Type: application/json
  - LinkedIn-Version: 202405
  - X-RestLi-Protocol-Version: 2.0.0

Body:
{
  "author": "urn:li:person:{person_id}",
  "commentary": "Post content here",
  "visibility": "PUBLIC",
  "distribution": {
    "feedDistribution": "MAIN_FEED"
  },
  "lifecycleState": "PUBLISHED"
}
```

#### Getting User Profile

```typescript
GET https://api.linkedin.com/v2/userinfo
Headers:
  - Authorization: Bearer {access_token}
```

## Security Features

1. **Post Ownership Verification**: Users can only publish their own posts
2. **Duplicate Prevention**: Unique constraint prevents publishing same post twice
3. **OAuth State Management**: CSRF protection via better-auth
4. **Token Security**: Tokens never exposed to frontend
5. **Cascade Deletes**: Deleting a post removes all publications

## Error Handling

Common error scenarios:

| Error | Status | Message |
|-------|--------|---------|
| No LinkedIn account | 400 | "LinkedIn account not connected" |
| Post not found | 400 | "Post not found or unauthorized" |
| Already published | 400 | "Post already published to LinkedIn" |
| LinkedIn API error | 400 | "LinkedIn API error ({status}): {details}" |

## Testing Checklist

- [ ] User can link LinkedIn account via OAuth
- [ ] OAuth callback succeeds and stores tokens
- [ ] `/api/linkedin/status` returns correct connection state
- [ ] Can publish a post to LinkedIn
- [ ] Post appears on LinkedIn timeline
- [ ] Publication tracked in `post_publication` table
- [ ] `/api/posts/:id` includes publications array
- [ ] Cannot publish same post twice (unique constraint)
- [ ] Deleting post cascades to delete publications
- [ ] Deleting account sets `accountId` to null in publications

## Future Enhancements

1. **Additional Platforms**: Add Twitter, Facebook using same pattern
2. **Media Support**: Upload images/videos with posts
3. **Scheduled Publishing**: Queue posts for future publication
4. **Analytics**: Track engagement metrics from LinkedIn API
5. **Multiple Accounts**: Support publishing to multiple LinkedIn accounts
6. **Unpublish**: Delete posts from LinkedIn
7. **Edit Published**: Update already-published LinkedIn posts

## Migration Notes

This implementation replaces the Python/FastAPI backend's social media integration:

- **Old**: `backend-legacy/app/social/` (FastAPI + Redis)
- **New**: `backend/src/modules/linkedin/` (Elysia + better-auth)

Benefits of new implementation:
- ✅ Native OAuth support (no custom implementation)
- ✅ Automatic token refresh
- ✅ Type-safe with TypeScript
- ✅ No Redis dependency
- ✅ Better security with better-auth
- ✅ Extensible multi-platform design
