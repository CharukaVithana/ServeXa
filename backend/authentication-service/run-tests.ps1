# Build common-libs first
Set-Location -Path "C:\Users\User\Desktop\desktop\ServeXa\backend\common-libs"
Write-Host "Building common-libs..." -ForegroundColor Green
mvn clean install -DskipTests

# Then run authentication service tests
Set-Location -Path "C:\Users\User\Desktop\desktop\ServeXa\backend\authentication-service"
Write-Host "Running authentication service tests..." -ForegroundColor Green
mvn clean test