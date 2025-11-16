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
SECRET_KEY=$(openssl rand -hex 32)

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
