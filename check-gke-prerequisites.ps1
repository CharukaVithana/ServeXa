# Check GKE Prerequisites and Configuration
# Quick diagnostic tool to check if everything is ready for deployment

# Color output functions
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Clear-Host

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                       ║" -ForegroundColor Cyan
Write-Host "║       ServeXa GKE Prerequisites Checker               ║" -ForegroundColor Cyan
Write-Host "║                                                       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Docker
Write-Info "Checking Docker..."
try {
    $dockerVersion = docker --version 2>&1
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ Docker is installed and running"
        Write-Host "  $dockerVersion" -ForegroundColor Gray
    } else {
        Write-Warning "⚠ Docker is installed but not running"
        Write-Host "  Please start Docker Desktop" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Error "✗ Docker is not installed"
    Write-Host "  Install from: https://www.docker.com/products/docker-desktop" -ForegroundColor Gray
    $allGood = $false
}

Write-Host ""

# Check Docker Hub login
Write-Info "Checking Docker Hub authentication..."
try {
    $dockerInfo = docker info 2>&1 | Out-String
    if ($dockerInfo -match "Username: (.+)") {
        Write-Success "✓ Logged in to Docker Hub as: $($Matches[1])"
    } else {
        Write-Warning "⚠ Not logged in to Docker Hub"
        Write-Host "  Run: docker login" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Warning "⚠ Cannot check Docker Hub login status"
}

Write-Host ""

# Check gcloud CLI
Write-Info "Checking Google Cloud SDK..."
try {
    $gcloudVersion = gcloud --version 2>&1 | Select-Object -First 1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ gcloud CLI is installed"
        Write-Host "  $gcloudVersion" -ForegroundColor Gray
    } else {
        Write-Error "✗ gcloud CLI is not working properly"
        $allGood = $false
    }
} catch {
    Write-Error "✗ gcloud CLI is not installed"
    Write-Host "  Install from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Gray
    $allGood = $false
}

Write-Host ""

# Check gcloud authentication
Write-Info "Checking Google Cloud authentication..."
try {
    $activeAccount = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>&1
    if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrEmpty($activeAccount)) {
        Write-Success "✓ Authenticated to Google Cloud"
        Write-Host "  Account: $activeAccount" -ForegroundColor Gray
    } else {
        Write-Warning "⚠ Not authenticated to Google Cloud"
        Write-Host "  Run: gcloud auth login" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Warning "⚠ Cannot check Google Cloud authentication"
}

Write-Host ""

# Check active project
Write-Info "Checking Google Cloud project..."
try {
    $activeProject = gcloud config get-value project 2>&1
    if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrEmpty($activeProject) -and $activeProject -notmatch "unset") {
        Write-Success "✓ Active project set"
        Write-Host "  Project: $activeProject" -ForegroundColor Gray
    } else {
        Write-Warning "⚠ No active project set"
        Write-Host "  Run: gcloud config set project PROJECT_ID" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Warning "⚠ Cannot check active project"
}

Write-Host ""

# Check kubectl
Write-Info "Checking kubectl..."
try {
    $kubectlVersion = kubectl version --client --short 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ kubectl is installed"
        Write-Host "  $kubectlVersion" -ForegroundColor Gray
    } else {
        Write-Warning "⚠ kubectl is not working properly"
        Write-Host "  Install: gcloud components install kubectl" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Warning "⚠ kubectl is not installed"
    Write-Host "  Install: gcloud components install kubectl" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# Check cluster connection
Write-Info "Checking Kubernetes cluster connection..."
try {
    $clusterInfo = kubectl cluster-info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ Connected to Kubernetes cluster"
        $clusterUrl = $clusterInfo | Select-String "Kubernetes control plane" | Select-Object -First 1
        if ($clusterUrl) {
            Write-Host "  $clusterUrl" -ForegroundColor Gray
        }
    } else {
        Write-Warning "⚠ Not connected to a Kubernetes cluster"
        Write-Host "  Connect with: gcloud container clusters get-credentials CLUSTER_NAME --region=REGION" -ForegroundColor Yellow
    }
} catch {
    Write-Warning "⚠ Cannot check cluster connection"
}

Write-Host ""

# Check for existing GKE clusters
Write-Info "Checking for GKE clusters..."
try {
    $clusters = gcloud container clusters list --format="value(name,location,status)" 2>&1
    if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrEmpty($clusters)) {
        Write-Success "✓ Found GKE clusters:"
        $clusters -split "`n" | ForEach-Object {
            if (-not [string]::IsNullOrEmpty($_)) {
                Write-Host "  $_" -ForegroundColor Gray
            }
        }
    } else {
        Write-Info "○ No GKE clusters found"
        Write-Host "  Create one with the setup script" -ForegroundColor Gray
    }
} catch {
    Write-Warning "⚠ Cannot check for GKE clusters"
}

Write-Host ""

# Check Docker images in k8s manifests
Write-Info "Checking Docker Hub configuration..."
$k8sDir = Join-Path $PSScriptRoot "k8s-gke"
if (Test-Path $k8sDir) {
    Write-Success "✓ GKE Kubernetes manifests directory exists"
    
    # Check for image references
    $manifestFiles = Get-ChildItem -Path $k8sDir -Filter "*.yaml"
    $imageRefs = @()
    
    foreach ($file in $manifestFiles) {
        $content = Get-Content -Path $file.FullName -Raw
        $matches = [regex]::Matches($content, 'image:\s*([^\s]+)')
        foreach ($match in $matches) {
            $image = $match.Groups[1].Value
            if ($image -match "servexa") {
                $imageRefs += $image
            }
        }
    }
    
    if ($imageRefs.Count -gt 0) {
        $uniqueImages = $imageRefs | Select-Object -Unique
        Write-Host "  Found $($uniqueImages.Count) ServeXa images:" -ForegroundColor Gray
        $uniqueImages | ForEach-Object {
            Write-Host "    - $_" -ForegroundColor Gray
        }
        
        # Check if images use Docker Hub format
        $needsUpdate = $false
        foreach ($image in $uniqueImages) {
            if ($image -match "^servexa/" -or $image -notmatch "/") {
                $needsUpdate = $true
                break
            }
        }
        
        if ($needsUpdate) {
            Write-Warning "⚠ Some images need to be updated with Docker Hub username"
            Write-Host "  Run: .\update-k8s-images.ps1 -DockerHubUsername 'yourusername'" -ForegroundColor Yellow
            $allGood = $false
        } else {
            Write-Success "✓ Images appear to be configured for Docker Hub"
        }
    }
} else {
    Write-Warning "⚠ GKE Kubernetes manifests directory not found"
    Write-Host "  Run: .\update-k8s-images.ps1 -DockerHubUsername 'yourusername'" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# Check Maven (for building Java services)
Write-Info "Checking Maven..."
try {
    $mvnVersion = mvn --version 2>&1 | Select-Object -First 1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ Maven is installed"
        Write-Host "  $mvnVersion" -ForegroundColor Gray
    } else {
        Write-Warning "⚠ Maven is not installed (required for building Java services)"
        Write-Host "  Install from: https://maven.apache.org/download.cgi" -ForegroundColor Yellow
    }
} catch {
    Write-Warning "⚠ Maven is not installed (required for building Java services)"
    Write-Host "  Install from: https://maven.apache.org/download.cgi" -ForegroundColor Yellow
}

Write-Host ""

# Check Node.js (for frontend)
Write-Info "Checking Node.js..."
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ Node.js is installed"
        Write-Host "  Version: $nodeVersion" -ForegroundColor Gray
    } else {
        Write-Warning "⚠ Node.js is not installed (required for frontend build)"
        Write-Host "  Install from: https://nodejs.org/" -ForegroundColor Yellow
    }
} catch {
    Write-Warning "⚠ Node.js is not installed (required for frontend build)"
    Write-Host "  Install from: https://nodejs.org/" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  Summary" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

if ($allGood) {
    Write-Success "✓ All critical prerequisites are met!"
    Write-Host ""
    Write-Info "You are ready to deploy to GKE! 🚀"
    Write-Host ""
    Write-Info "Next steps:"
    Write-Host "  1. Run the setup wizard: .\gke-setup.ps1" -ForegroundColor Gray
    Write-Host "  OR" -ForegroundColor Gray
    Write-Host "  2. Build images: .\build-and-push-dockerhub.ps1 -DockerHubUsername 'yourusername'" -ForegroundColor Gray
    Write-Host "  3. Update manifests: .\update-k8s-images.ps1 -DockerHubUsername 'yourusername'" -ForegroundColor Gray
    Write-Host "  4. Deploy: .\deploy-to-gke.ps1" -ForegroundColor Gray
} else {
    Write-Warning "⚠ Some prerequisites are missing or not configured"
    Write-Host ""
    Write-Info "Please address the warnings above, then run this script again."
    Write-Host ""
    Write-Info "For a guided setup that helps fix issues:"
    Write-Host "  .\gke-setup.ps1" -ForegroundColor Gray
}

Write-Host ""
Write-Info "Documentation:"
Write-Host "  Quick Start: GKE-README.md" -ForegroundColor Gray
Write-Host "  Full Guide: GKE-DEPLOYMENT-GUIDE.md" -ForegroundColor Gray
Write-Host "  Command Reference: GKE-QUICK-REFERENCE.md" -ForegroundColor Gray
Write-Host ""
