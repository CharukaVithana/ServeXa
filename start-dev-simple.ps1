# Simple approach: Run Spring Boot locally, Docker for databases only

Write-Host "🚀 Starting ServeXa Development Environment (Simple Mode)..." -ForegroundColor Green
Write-Host ""
Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "1. Start PostgreSQL and Redis in Docker"
Write-Host "2. Run Spring Boot services locally with hot reload"
Write-Host ""

# Start only database services
Write-Host "📦 Starting database services..." -ForegroundColor Yellow
docker-compose -f docker-compose.yml up -d postgres redis

# Wait for databases
Write-Host "⏳ Waiting for databases to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "✅ Database services started!" -ForegroundColor Green
Write-Host ""
Write-Host "Now run each Spring Boot service locally in separate terminals:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Terminal 1 - Auth Service:" -ForegroundColor Cyan
Write-Host "cd backend\authentication-service"
Write-Host "mvn spring-boot:run"
Write-Host ""
Write-Host "Terminal 2 - Appointment Service:" -ForegroundColor Cyan
Write-Host "cd backend\appointment-service"
Write-Host "mvn spring-boot:run"
Write-Host ""
Write-Host "Terminal 3 - Vehicle Service:" -ForegroundColor Cyan
Write-Host "cd backend\vehicle-service"
Write-Host "mvn spring-boot:run"
Write-Host ""
Write-Host "Terminal 4 - Notification Service:" -ForegroundColor Cyan
Write-Host "cd backend\notification-service"
Write-Host "mvn spring-boot:run"
Write-Host ""
Write-Host "Terminal 5 - Frontend:" -ForegroundColor Cyan
Write-Host "cd frontend"
Write-Host "npm run dev"
Write-Host ""
Write-Host "🔥 Hot reload will work automatically when you save files!" -ForegroundColor Green