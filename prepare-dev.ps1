# Prepare development environment by building parent project

Write-Host "🔧 Preparing development environment..." -ForegroundColor Green

# Navigate to backend and install parent project
Write-Host "📦 Installing parent project and common-libs..." -ForegroundColor Yellow
Set-Location backend

# Clean and install parent project
mvn clean install -DskipTests

Set-Location ..

Write-Host "✅ Parent project installed!" -ForegroundColor Green
Write-Host ""
Write-Host "Now you can run:" -ForegroundColor Yellow
Write-Host "docker-compose -f docker-compose.dev.yml up -d" -ForegroundColor Cyan