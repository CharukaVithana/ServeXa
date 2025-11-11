# Build all backend services using Docker
Write-Host "Building backend services in Docker..." -ForegroundColor Green

# Create a temporary Docker container with Maven and Java 17
Write-Host "Creating build container..." -ForegroundColor Yellow

docker run --rm -v "${PWD}:/workspace" -w /workspace maven:3.8-openjdk-17 mvn clean package -DskipTests

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
    
    # List generated JARs
    Write-Host "`nGenerated JAR files:" -ForegroundColor Cyan
    Get-ChildItem -Path . -Filter "*.jar" -Recurse | Where-Object { $_.FullName -like "*target*" } | ForEach-Object {
        Write-Host "  - $($_.FullName)" -ForegroundColor Gray
    }
} else {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}