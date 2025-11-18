# Update Kubernetes manifests with Docker Hub image names
param(
    [Parameter(Mandatory=$true)]
    [string]$DockerHubUsername,
    [string]$Tag = "latest",
    [string]$OutputDir = "k8s-gke"
)

Write-Host "Updating Kubernetes manifests for GKE" -ForegroundColor Cyan
Write-Host "Docker Hub Username: $DockerHubUsername" -ForegroundColor Gray
Write-Host "Tag: $Tag" -ForegroundColor Gray
Write-Host ""

$K8S_SOURCE = Join-Path $PSScriptRoot "k8s"
$K8S_TARGET = Join-Path $PSScriptRoot $OutputDir

# Create target directory
if (-not (Test-Path $K8S_TARGET)) {
    New-Item -ItemType Directory -Path $K8S_TARGET | Out-Null
    Write-Host "Created directory: $K8S_TARGET" -ForegroundColor Green
}

# Image mappings
$mappings = @{
    "servexa/auth-service:latest" = "$DockerHubUsername/servexa-auth-service:$Tag"
    "servexa/appointment-service:latest" = "$DockerHubUsername/servexa-appointment-service:$Tag"
    "servexa/vehicle-service:latest" = "$DockerHubUsername/servexa-vehicle-service:$Tag"
    "servexa/notification-service:latest" = "$DockerHubUsername/servexa-notification-service:$Tag"
    "servexa/chatbot-service:latest" = "$DockerHubUsername/servexa-chatbot-service:$Tag"
    "servexa/frontend:latest" = "$DockerHubUsername/servexa-frontend:$Tag"
}

# Copy and update files
$files = Get-ChildItem -Path $K8S_SOURCE -Filter "*.yaml" -ErrorAction SilentlyContinue

if ($files.Count -eq 0) {
    Write-Host "No YAML files found in $K8S_SOURCE" -ForegroundColor Yellow
    exit 1
}

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)" -ForegroundColor Cyan
    
    $content = Get-Content -Path $file.FullName -Raw
    
    foreach ($old in $mappings.Keys) {
        $new = $mappings[$old]
        if ($content -like "*$old*") {
            $content = $content -replace [regex]::Escape($old), $new
            Write-Host "  Updated: $old -> $new" -ForegroundColor Gray
        }
    }
    
    $targetFile = Join-Path $K8S_TARGET $file.Name
    $content | Set-Content -Path $targetFile
    Write-Host "  Saved: $targetFile" -ForegroundColor Green
}

Write-Host ""
Write-Host "Kubernetes manifests updated successfully!" -ForegroundColor Green
Write-Host "Updated files in: $K8S_TARGET" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step: Deploy to GKE" -ForegroundColor Yellow
Write-Host "  .\deploy-to-gke.ps1" -ForegroundColor Gray
Write-Host ""
