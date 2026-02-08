# SuperImpress Backend

Backend API built with Elysia, Bun, and PostgreSQL.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Elysia
- **Database**: PostgreSQL
- **ORM**: Drizzle
- **Authentication**: better-auth
- **Validation**: TypeBox

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- PostgreSQL database running

### Installation

1. Install dependencies:
```bash
bun install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure your `.env` file with:
   - Database connection string
   - better-auth secret and URL
   - Resend API key and sender email (for password reset emails)
   - LinkedIn OAuth credentials (see LinkedIn Setup below)

4. Run database migrations:
```bash
bun run drizzle-kit generate  # Generate migration
bun run drizzle-kit push      # Apply to database
```

### Development

Start the development server:
```bash
bun run dev
```

The API will be available at:
- Base URL: http://localhost:3000/api
- API Documentation: http://localhost:3000/api/openapi

## LinkedIn OAuth Setup

To enable LinkedIn posting functionality:

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app or select an existing one
3. Add these products to your app:
   - **Sign In with LinkedIn using OpenID Connect** (for authentication)
   - **Share on LinkedIn** (for posting)
4. Set the redirect URI: `http://localhost:3000/api/auth/callback/linkedin`
5. Copy the Client ID and Client Secret to your `.env` file:
   ```
   LINKEDIN_CLIENT_ID=your_client_id
   LINKEDIN_CLIENT_SECRET=your_client_secret
   ```

### Required Scopes

The LinkedIn integration uses these scopes:
- `openid` - Basic authentication
- `profile` - User profile information
- `email` - User email address
- `w_member_social` - Permission to post on behalf of the user

## API Endpoints

### Authentication (better-auth)
- `POST /api/auth/signup/email` - Sign up with email
- `POST /api/auth/signin/email` - Sign in with email
- `POST /api/auth/signout` - Sign out
- `POST /api/auth/sign-in/oauth2` - Start LinkedIn OAuth (providerId: linkedin)
- `GET /api/auth/callback/linkedin` - LinkedIn OAuth callback

### Posts
- `GET /api/posts` - List user's posts
- `POST /api/posts` - Create a new post
- `GET /api/posts/:id` - Get a specific post
- `PATCH /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post

### LinkedIn
- `GET /api/linkedin/status` - Check LinkedIn connection status
- `POST /api/linkedin/post` - Publish a post to LinkedIn

## Database Schema

### Tables
- `user` - User accounts
- `session` - User sessions
- `account` - OAuth accounts (including LinkedIn)
- `post` - User posts
- `post_publication` - Tracks posts published to social platforms

### Migrations

Generate a new migration after schema changes:
```bash
bun run drizzle-kit generate
```

Apply migrations:
```bash
bun run drizzle-kit push
```

View current schema:
```bash
bun run drizzle-kit studio
```

## Project Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── posts/          # Post management
│   │   │   ├── index.ts    # Routes
│   │   │   ├── model.ts    # TypeBox schemas
│   │   │   └── service.ts  # Business logic
│   │   └── linkedin/       # LinkedIn integration
│   │       ├── index.ts    # Routes
│   │       ├── model.ts    # TypeBox schemas
│   │       ├── service.ts  # Business logic
│   │       └── client.ts   # LinkedIn API wrapper
│   ├── db/
│   │   ├── schema/         # Database schemas
│   │   │   ├── auth.ts     # Auth tables
│   │   │   ├── posts.ts    # Post tables
│   │   │   └── index.ts
│   │   └── index.ts        # Database client
│   ├── auth.ts             # better-auth configuration
│   └── index.ts            # Main application
├── drizzle/                # Migrations
└── .env                    # Environment variables
```
