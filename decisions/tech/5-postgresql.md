# PostgreSQL Database

From v0 of Super Impress, we know that almost all of our application data will be structured and relational in nature.
So we will use PostgreSQL as our primary database.

## Why PostgreSQL

- **Structured Data**: User profiles, projects, templates, permissions are all relational
- **ACID Compliance**: Strong consistency for user data and transactions
- **Industry Standard**: Great for team career development
- **Python Ecosystem**: Excellent integration with SQLModel and psycopg3

## Why Not Alternatives

- **MongoDB**: Data is structured, not document-based
- **SQLite**: Can't handle multi-user concurrent access
- **MySQL**: PostgreSQL has better JSON support

## Current Schema

As of the authentication implementation, PostgreSQL stores:

- **User Table**: Authentication data (email, hashed passwords using Argon2)
  - Email serves as unique identifier with database-level uniqueness constraint
  - Passwords never stored in plaintext
