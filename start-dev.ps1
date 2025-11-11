# PowerShell script to start development environment with hot reload

Write-Host "🚀 Starting ServeXa Development Environment with Hot Reload..." -ForegroundColor Green

# First, build all services locally
Write-Host "📦 Building Spring Boot services locally..." -ForegroundColor Yellow
Set-Location backend
mvn clean compile
Set-Location ..

Write-Host "🔧 Starting Docker services..." -ForegroundColor Yellow

# Start only database and redis first
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Now start the Spring Boot services
docker-compose -f docker-compose.dev.yml up -d

Write-Host "✅ Development environment started!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Service URLs:" -ForegroundColor Cyan
Write-Host "   - Frontend:          http://localhost:3000"
Write-Host "   - Auth Service:      http://localhost:8081"
Write-Host "   - Appointment:       http://localhost:8083"
Write-Host "   - Vehicle:           http://localhost:8084"
Write-Host "   - Notification:      http://localhost:8085"
Write-Host ""
Write-Host "🔧 Debug Ports:" -ForegroundColor Cyan
Write-Host "   - Auth Service:      localhost:5005"
Write-Host "   - Appointment:       localhost:5006"
Write-Host "   - Vehicle:           localhost:5007"
Write-Host "   - Notification:      localhost:5008"
Write-Host ""
Write-Host "📝 To view logs:" -ForegroundColor Yellow
Write-Host "   docker-compose -f docker-compose.dev.yml logs -f [service-name]"
Write-Host ""
Write-Host "🔥 Hot reload is enabled! Just save your Java files and watch the services restart automatically." -ForegroundColor Green