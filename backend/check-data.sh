#!/bin/bash

echo "=== PostgreSQL Database Check ==="
echo

echo "1. All Users:"
docker exec servexa-postgres psql -U postgres -d servexa_auth -c "SELECT id, email, full_name, role, is_active, created_at FROM users;"

echo -e "\n2. User Count:"
docker exec servexa-postgres psql -U postgres -d servexa_auth -c "SELECT COUNT(*) as total_users FROM users;"

echo -e "\n3. Users by Role:"
docker exec servexa-postgres psql -U postgres -d servexa_auth -c "SELECT role, COUNT(*) as count FROM users GROUP BY role;"

echo -e "\n4. Recent Users (Last 5):"
docker exec servexa-postgres psql -U postgres -d servexa_auth -c "SELECT email, full_name, created_at FROM users ORDER BY created_at DESC LIMIT 5;"

echo -e "\n5. All Tables:"
docker exec servexa-postgres psql -U postgres -d servexa_auth -c "\dt"