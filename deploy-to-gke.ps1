# Deploy ServeXa to Google Kubernetes Engine
param(
    [string]$Namespace = "servexa",
    [string]$K8sDir = "k8s-gke"
)

Write-Host "Deploying ServeXa to GKE" -ForegroundColor Cyan
Write-Host "Namespace: $Namespace" -ForegroundColor Gray
Write-Host ""

$K8S_PATH = Join-Path $PSScriptRoot $K8sDir

if (-not (Test-Path $K8S_PATH)) {
    Write-Host "Kubernetes manifests not found: $K8S_PATH" -ForegroundColor Red
    Write-Host "Run: .\update-k8s-images.ps1 first" -ForegroundColor Yellow
    exit 1
}

# Check kubectl
kubectl version --client 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "kubectl is not installed or not configured" -ForegroundColor Red
    exit 1
}

Write-Host "✓ kubectl is available" -ForegroundColor Green

# Deploy in order
$deployOrder = @(
    "namespace.yaml",
    "postgres.yaml",
    "redis.yaml",
    "auth-service.yaml",
    "backend-services.yaml",
    "frontend.yaml",
    "ingress-and-scaling.yaml",
    "ingress.yaml"
)

foreach ($fileName in $deployOrder) {
    $filePath = Join-Path $K8S_PATH $fileName
    
    if (Test-Path $filePath) {
        Write-Host "Deploying: $fileName" -ForegroundColor Cyan
        kubectl apply -f $filePath
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Applied: $fileName" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed: $fileName" -ForegroundColor Red
        }
        Write-Host ""
    }
}

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Deployment Status" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

Write-Host "Checking pods..." -ForegroundColor Cyan
kubectl get pods -n $Namespace

Write-Host ""
Write-Host "Checking services..." -ForegroundColor Cyan
kubectl get svc -n $Namespace

Write-Host ""
Write-Host "Checking ingress..." -ForegroundColor Cyan
kubectl get ingress -n $Namespace

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Wait for external IP: kubectl get ingress -n $Namespace --watch" -ForegroundColor Gray
Write-Host "  2. Check pod status: kubectl get pods -n $Namespace" -ForegroundColor Gray
Write-Host "  3. View logs: kubectl logs -n $Namespace -l app=auth-service" -ForegroundColor Gray
Write-Host ""
