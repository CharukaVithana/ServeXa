# PowerShell script to test PostgreSQL connection
Write-Host "Testing PostgreSQL Connection..." -ForegroundColor Yellow

# Check if container is running
$container = docker ps --filter "name=servexa-postgres" --format "{{.Names}}"
if ($container -eq "servexa-postgres") {
    Write-Host "✓ PostgreSQL container is running" -ForegroundColor Green
} else {
    Write-Host "✗ PostgreSQL container is NOT running" -ForegroundColor Red
    Write-Host "Starting container..." -ForegroundColor Yellow
    docker-compose up -d postgres
    Start-Sleep -Seconds 5
}

# Check container health
Write-Host "`nChecking container health..." -ForegroundColor Yellow
docker exec servexa-postgres pg_isready -U postgres

# Test connection
Write-Host "`nTesting database connection..." -ForegroundColor Yellow
docker exec servexa-postgres psql -U postgres -c "SELECT current_database();"

# Create database
Write-Host "`nCreating database if not exists..." -ForegroundColor Yellow
docker exec servexa-postgres psql -U postgres -c "CREATE DATABASE servexa_auth;" 2>$null
docker exec servexa-postgres psql -U postgres -c "\l" | Select-String "servexa_auth"

# Check port
Write-Host "`nChecking port 5432..." -ForegroundColor Yellow
$port = Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue
if ($port) {
    Write-Host "✓ Port 5432 is listening" -ForegroundColor Green
} else {
    Write-Host "✗ Port 5432 is NOT listening" -ForegroundColor Red
}

Write-Host "`nConnection test complete!" -ForegroundColor Green