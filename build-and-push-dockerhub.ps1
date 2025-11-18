# Build and Push ServeXa Docker Images to Docker Hub
param(
    [Parameter(Mandatory=$true)]
    [string]$DockerHubUsername,
    [string]$Tag = "latest"
)

Write-Host "Building and pushing images to Docker Hub..." -ForegroundColor Cyan
Write-Host "Docker Hub Username: $DockerHubUsername" -ForegroundColor Gray
Write-Host "Tag: $Tag" -ForegroundColor Gray
Write-Host ""

# Build common-libs first
Write-Host "Building common-libs..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\backend\common-libs"
mvn clean install -DskipTests
Set-Location $PSScriptRoot

# Define services
$services = @(
    @{Name="auth-service"; Path="backend/authentication-service"},
    @{Name="appointment-service"; Path="backend/appointment-service"},
    @{Name="vehicle-service"; Path="backend/vehicle-service"},
    @{Name="notification-service"; Path="backend/notification-service"},
    @{Name="chatbot-service"; Path="backend/chatbot-service"},
    @{Name="frontend"; Path="frontend"}
)

$success = 0
$failed = 0

foreach ($service in $services) {
    $name = $service.Name
    $path = $service.Path
    $imageName = "$DockerHubUsername/servexa-$name`:$Tag"
    
    Write-Host "----------------------------------------" -ForegroundColor Yellow
    Write-Host "Building: $name" -ForegroundColor Cyan
    Write-Host "Image: $imageName" -ForegroundColor Gray
    
    $contextPath = Join-Path $PSScriptRoot $path
    
    if (Test-Path $contextPath) {
        docker build -t $imageName $contextPath
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Build successful: $name" -ForegroundColor Green
            
            Write-Host "Pushing: $imageName" -ForegroundColor Cyan
            docker push $imageName
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Push successful: $name" -ForegroundColor Green
                $success++
            } else {
                Write-Host "✗ Push failed: $name" -ForegroundColor Red
                $failed++
            }
        } else {
            Write-Host "✗ Build failed: $name" -ForegroundColor Red
            $failed++
        }
    } else {
        Write-Host "✗ Path not found: $contextPath" -ForegroundColor Red
        $failed++
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Summary:" -ForegroundColor Magenta
Write-Host "  Success: $success" -ForegroundColor Green
Write-Host "  Failed: $failed" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Magenta

if ($failed -eq 0) {
    Write-Host "All images built and pushed successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some images failed. Check errors above." -ForegroundColor Yellow
    exit 1
}
