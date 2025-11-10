@echo off
REM ServeXa Kubernetes Deployment Script for Windows

setlocal EnableDelayedExpansion

REM Configuration
set NAMESPACE=servexa
set VERSION=latest
set USE_HELM=true

REM Check if kubectl is available
kubectl version --client >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] kubectl is not installed or not in PATH
    exit /b 1
)

REM Check if helm is available
helm version --short >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] helm is not installed. Using kubectl deployment.
    set USE_HELM=false
)

REM Check cluster connectivity
kubectl cluster-info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Cannot connect to Kubernetes cluster
    exit /b 1
)

if "%1"=="" (
    set COMMAND=deploy
) else (
    set COMMAND=%1
)

if "%COMMAND%"=="deploy" (
    echo [INFO] Deploying ServeXa to Kubernetes...
    
    if "!USE_HELM!"=="true" (
        echo [INFO] Using Helm deployment...
        helm upgrade --install servexa ./helm/servexa --namespace %NAMESPACE% --create-namespace --values ./helm/servexa/values.yaml --wait --timeout 10m
    ) else (
        echo [INFO] Using kubectl deployment...
        kubectl apply -f k8s/namespace.yaml
        kubectl apply -f k8s/postgres.yaml
        kubectl apply -f k8s/redis.yaml
        
        echo [INFO] Waiting for database to be ready...
        kubectl wait --for=condition=available --timeout=300s deployment/postgres -n %NAMESPACE%
        
        kubectl apply -f k8s/auth-service.yaml
        kubectl apply -f k8s/backend-services.yaml
        kubectl apply -f k8s/frontend.yaml
        kubectl apply -f k8s/ingress-and-scaling.yaml
    )
    
    echo [INFO] Waiting for deployments to be ready...
    kubectl wait --for=condition=available --timeout=300s --all deployments -n %NAMESPACE%
    
    echo [SUCCESS] Deployment completed!
    echo.
    echo Access information:
    kubectl get svc -n %NAMESPACE%
    echo.
    echo To access via port-forwarding:
    echo kubectl port-forward -n %NAMESPACE% svc/frontend 3000:80
    echo Then visit: http://localhost:3000
    
) else if "%COMMAND%"=="status" (
    kubectl get all -n %NAMESPACE%
    
) else if "%COMMAND%"=="logs" (
    if "%2"=="" (
        set SERVICE=frontend
    ) else (
        set SERVICE=%2
    )
    kubectl logs -n %NAMESPACE% -f deployment/!SERVICE!
    
) else if "%COMMAND%"=="clean" (
    echo [WARNING] This will delete the entire ServeXa deployment!
    set /p CONFIRM="Are you sure? (y/N): "
    if /i "!CONFIRM!"=="y" (
        if "!USE_HELM!"=="true" (
            helm uninstall servexa -n %NAMESPACE% 2>nul
        ) else (
            kubectl delete -f k8s/ 2>nul
        )
        kubectl delete namespace %NAMESPACE% 2>nul
        echo [SUCCESS] Cleanup completed
    ) else (
        echo Cleanup cancelled
    )
    
) else if "%COMMAND%"=="port-forward" (
    echo [INFO] Starting port forwarding for frontend...
    echo Access the application at: http://localhost:3000
    kubectl port-forward -n %NAMESPACE% svc/frontend 3000:80
    
) else (
    echo ServeXa Kubernetes Deployment Script
    echo Usage: %0 [command]
    echo.
    echo Commands:
    echo   deploy       - Deploy ServeXa to Kubernetes (default)
    echo   status       - Show deployment status
    echo   logs [svc]   - Show logs for service (default: frontend)
    echo   port-forward - Start port forwarding for frontend
    echo   clean        - Remove ServeXa deployment
    echo   help         - Show this help message
)

endlocal