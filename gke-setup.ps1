# ServeXa GKE Quick Setup Script
param()

function Write-ColorText {
    param([string]$Text, [string]$Color = "White")
    Write-Host $Text -ForegroundColor $Color
}

Clear-Host
Write-Host ""
Write-ColorText "" "Cyan"
Write-ColorText "       ServeXa GKE Deployment Quick Setup              " "Cyan"
Write-ColorText "" "Cyan"
Write-Host ""

# Get Docker Hub username
Write-ColorText "Enter your Docker Hub username:" "Cyan"
$dockerHubUsername = Read-Host "Docker Hub Username"

if ([string]::IsNullOrEmpty($dockerHubUsername)) {
    Write-ColorText "Docker Hub username is required" "Red"
    exit 1
}

# Check Docker
Write-ColorText "`nChecking Docker..." "Cyan"
docker info 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-ColorText " Docker is running" "Green"
} else {
    Write-ColorText " Docker is not running" "Red"
    exit 1
}

# Docker login
Write-ColorText "`nPlease login to Docker Hub:" "Cyan"
docker login
if ($LASTEXITCODE -ne 0) {
    Write-ColorText "Docker Hub login failed" "Red"
    exit 1
}

# Check gcloud
Write-ColorText "`nChecking gcloud..." "Cyan"
gcloud --version 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-ColorText " gcloud is installed" "Green"
} else {
    Write-ColorText " gcloud is not installed" "Red"
    Write-ColorText "Install from: https://cloud.google.com/sdk/docs/install" "Yellow"
    exit 1
}

# Authenticate to Google Cloud
Write-ColorText "`nAuthenticating to Google Cloud..." "Cyan"
$confirm = Read-Host "Login to Google Cloud? (Y/n)"
if ($confirm -ne "n") {
    gcloud auth login
}

# Get project ID
Write-ColorText "`nEnter your Google Cloud Project ID:" "Cyan"
$projectId = Read-Host "Project ID"
if ([string]::IsNullOrEmpty($projectId)) {
    Write-ColorText "Project ID is required" "Red"
    exit 1
}

gcloud config set project $projectId

# Enable APIs
Write-ColorText "`nEnabling required APIs..." "Cyan"
gcloud services enable container.googleapis.com 2>&1 | Out-Null
gcloud services enable compute.googleapis.com 2>&1 | Out-Null
Write-ColorText " APIs enabled" "Green"

# Cluster setup
Write-ColorText "`nGKE Cluster Setup" "Cyan"
$clusterName = Read-Host "Enter cluster name (default: servexa-cluster)"
if ([string]::IsNullOrEmpty($clusterName)) {
    $clusterName = "servexa-cluster"
}

$region = Read-Host "Enter region (default: us-central1)"
if ([string]::IsNullOrEmpty($region)) {
    $region = "us-central1"
}

Write-ColorText "`nCreate cluster? This takes 5-10 minutes." "Yellow"
$create = Read-Host "Create cluster '$clusterName' in $region? (y/N)"
if ($create -eq "y") {
    gcloud container clusters create-auto $clusterName --region=$region --project=$projectId
    if ($LASTEXITCODE -ne 0) {
        Write-ColorText "Failed to create cluster" "Red"
        exit 1
    }
}

# Get credentials
Write-ColorText "`nGetting cluster credentials..." "Cyan"
gcloud container clusters get-credentials $clusterName --region=$region --project=$projectId
if ($LASTEXITCODE -eq 0) {
    Write-ColorText " kubectl configured" "Green"
} else {
    Write-ColorText " Failed to get credentials" "Red"
    exit 1
}

# Build images
Write-ColorText "`nBuild and push images? (10-20 minutes)" "Yellow"
$build = Read-Host "Build images? (Y/n)"
if ($build -ne "n") {
    & "$PSScriptRoot\build-and-push-dockerhub.ps1" -DockerHubUsername $dockerHubUsername
}

# Update manifests
Write-ColorText "`nUpdating Kubernetes manifests..." "Cyan"
& "$PSScriptRoot\update-k8s-images.ps1" -DockerHubUsername $dockerHubUsername

# Deploy
Write-ColorText "`nDeploy to GKE?" "Yellow"
$deploy = Read-Host "Deploy now? (Y/n)"
if ($deploy -ne "n") {
    & "$PSScriptRoot\deploy-to-gke.ps1"
}

# Summary
Write-Host ""
Write-ColorText "" "Magenta"
Write-ColorText "Setup Complete!" "Green"
Write-ColorText "" "Magenta"
Write-Host ""
Write-ColorText "Next: kubectl get all -n servexa" "Cyan"
Write-ColorText "Get IP: kubectl get ingress -n servexa" "Cyan"
Write-Host ""
