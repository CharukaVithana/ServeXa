Write-Host "Building notification service..." -ForegroundColor Green

# Navigate to backend directory
Set-Location backend

# Build the notification service with Maven
Write-Host "Running Maven build..." -ForegroundColor Yellow
mvn clean package -pl notification-service -am -DskipTests

# Check if build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Maven build failed" -ForegroundColor Red
    exit 1
}

# Navigate back to root
Set-Location ..

# Build and deploy with docker-compose
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker-compose build notification-service

Write-Host "Starting notification service..." -ForegroundColor Yellow
docker-compose up -d notification-service

Write-Host "Waiting for service to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "Checking service status..." -ForegroundColor Yellow
docker-compose ps notification-service

Write-Host "Checking logs..." -ForegroundColor Yellow
docker-compose logs --tail 50 notification-service

Write-Host "Deployment complete!" -ForegroundColor Green