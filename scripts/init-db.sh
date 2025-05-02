#!/bin/bash
# filepath: scripts/init-db.sh

set -e

echo "Starting database initialization..."

# Wait for PostgreSQL to be ready
until PGPASSWORD=$POSTGRES_PASSWORD psql -h db -U $POSTGRES_USER -d $POSTGRES_DB -c '\q'; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

>&2 echo "PostgreSQL is up - starting initialization"

# Check if tables already exist
TABLES_COUNT=$(PGPASSWORD=$POSTGRES_PASSWORD psql -h db -U $POSTGRES_USER -d $POSTGRES_DB -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")

if [ "$TABLES_COUNT" -eq "0" ]; then
  echo "No tables found. Initializing database with huniya-seed.sql..."
  PGPASSWORD=$POSTGRES_PASSWORD psql -h db -U $POSTGRES_USER -d $POSTGRES_DB < /app/huniya-seed.sql
  echo "Database initialization completed."
else
  echo "Tables already exist. Skipping initialization."
fi

echo "Starting NestJS application..."
echo "Looking for: $(pwd)/dist/main.js"
ls -la dist/

# Start the application
exec "$@"