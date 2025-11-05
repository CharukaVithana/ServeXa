# PowerShell version
Write-Host "=== PostgreSQL Database Check ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. All Users:" -ForegroundColor Yellow
docker exec servexa-postgres psql -U postgres -d servexa_auth -c "SELECT id, email, full_name, role, is_active, created_at FROM users;"

Write-Host "`n2. User Count:" -ForegroundColor Yellow
docker exec servexa-postgres psql -U postgres -d servexa_auth -c "SELECT COUNT(*) as total_users FROM users;"

Write-Host "`n3. Users by Role:" -ForegroundColor Yellow
docker exec servexa-postgres psql -U postgres -d servexa_auth -c "SELECT role, COUNT(*) as count FROM users GROUP BY role;"

Write-Host "`n4. Recent Users (Last 5):" -ForegroundColor Yellow
docker exec servexa-postgres psql -U postgres -d servexa_auth -c "SELECT email, full_name, created_at FROM users ORDER BY created_at DESC LIMIT 5;"

Write-Host "`n5. All Tables:" -ForegroundColor Yellow
docker exec servexa-postgres psql -U postgres -d servexa_auth -c "\dt"