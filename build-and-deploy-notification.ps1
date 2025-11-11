Write-Host "Building notification service locally..." -ForegroundColor Green

# Save current directory
$originalDir = Get-Location

try {
    # Navigate to backend directory
    Set-Location backend
    
    # Try to build with Maven
    Write-Host "Attempting Maven build..." -ForegroundColor Yellow
    mvn clean package -pl notification-service -am -DskipTests
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Maven build successful!" -ForegroundColor Green
    } else {
        Write-Host "Maven build failed. Trying alternative approach..." -ForegroundColor Yellow
        
        # Build each module individually
        Write-Host "Building common-libs..." -ForegroundColor Yellow
        Set-Location common-libs
        mvn clean install -DskipTests
        Set-Location ..
        
        Write-Host "Building notification-service..." -ForegroundColor Yellow
        Set-Location notification-service
        mvn clean package -DskipTests
        Set-Location ..
    }
    
    # Return to original directory
    Set-Location $originalDir
    
    # Check if JAR was created
    $jarPath = "backend/notification-service/target/*.jar"
    if (Test-Path $jarPath) {
        Write-Host "JAR file created successfully!" -ForegroundColor Green
        
        # Build Docker image
        Write-Host "Building Docker image..." -ForegroundColor Yellow
        docker-compose build notification-service
        
        # Start the service
        Write-Host "Starting notification service..." -ForegroundColor Yellow
        docker-compose up -d notification-service
        
        # Wait for service to start
        Write-Host "Waiting for service to start..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
        
        # Check status
        Write-Host "Checking service status..." -ForegroundColor Yellow
        docker-compose ps notification-service
        
        # Show logs
        Write-Host "`nService logs:" -ForegroundColor Yellow
        docker-compose logs --tail 50 notification-service
        
        Write-Host "`nNotification service deployed successfully!" -ForegroundColor Green
        Write-Host "Service is available at: http://localhost:8085" -ForegroundColor Cyan
    } else {
        Write-Host "Failed to create JAR file" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error occurred: $_" -ForegroundColor Red
    exit 1
} finally {
    # Make sure we return to original directory
    Set-Location $originalDir
}