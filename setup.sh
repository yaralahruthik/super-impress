#!/bin/bash

echo "Which development mode will you be using?"
echo "1. Local Backend + Docker PostgreSQL (Recommended)"
echo "2. Full Docker (Backend + PostgreSQL)"
read -p "Enter the number of your choice: " dev_mode

if [ "$dev_mode" == "1" ]; then
  DATABASE_HOST="localhost"
elif [ "$dev_mode" == "2" ]; then
  DATABASE_HOST="postgres"
else
  echo "Invalid choice. Please enter '1' or '2'."
  exit 1
fi

# Generate a secret key
if command -v openssl &> /dev/null; then
  SECRET_KEY=$(openssl rand -hex 32)
else
  SECRET_KEY="your-secret-key-here-change-this-in-production"
  echo "WARNING: openssl not found. Using a placeholder for SECRET_KEY."
  echo "Please generate a real secret for production and set it in backend/.env"
fi

# Check if .env files already exist
if [ -f "backend/.env" ] || [ -f "frontend/.env" ]; then
  echo "WARNING: .env files already exist. This will overwrite them."
  read -p "Continue? (y/n): " confirm
  if [ "$confirm" != "y" ]; then
    echo "Setup cancelled."
    exit 0
  fi
fi

echo "Creating backend/.env"
cat > backend/.env << EOL
# Database URL
DATABASE_URL=postgresql+psycopg://postgres:postgres@$DATABASE_HOST:5432/super_impress

# ============================================
# JWT Authentication Configuration
# ============================================
SECRET_KEY=$SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EOL

echo "Creating frontend/.env"
cat > frontend/.env << EOL
VITE_API_BASE=http://localhost:8000
EOL

echo "All .env files created successfully."
