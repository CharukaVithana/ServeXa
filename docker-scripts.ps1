# ServeXa Docker Management Script for PowerShell
param(
    [Parameter(Mandatory=$false, Position=0)]
    [ValidateSet("up", "down", "build", "rebuild", "logs", "status", "clean", "dev", "prod", "db-only", "backend", "frontend", "restart", "health", "help")]
    [string]$Command = "help",
    
    [Parameter(Mandatory=$false, Position=1)]
    [string]$Service
)

function Show-Help {
    Write-Host "ServeXa Docker Management Script" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: .\docker-scripts.ps1 [command]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Available commands:" -ForegroundColor Cyan
    Write-Host "  up          - Start all services" -ForegroundColor White
    Write-Host "  down        - Stop all services" -ForegroundColor White
    Write-Host "  build       - Build all services" -ForegroundColor White
    Write-Host "  rebuild     - Rebuild and start all services" -ForegroundColor White
    Write-Host "  logs        - Show logs from all services" -ForegroundColor White
    Write-Host "  status      - Show status of all services" -ForegroundColor White
    Write-Host "  clean       - Remove all containers and volumes (WARNING: Data loss!)" -ForegroundColor Red
    Write-Host "  dev         - Start in development mode" -ForegroundColor White
    Write-Host "  prod        - Start in production mode" -ForegroundColor White
    Write-Host "  db-only     - Start only database services" -ForegroundColor White
    Write-Host "  backend     - Start only backend services" -ForegroundColor White
    Write-Host "  frontend    - Start only frontend service" -ForegroundColor White
    Write-Host "  restart     - Restart all services" -ForegroundColor White
    Write-Host "  health      - Check health of all services" -ForegroundColor White
    Write-Host "  help        - Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Service-specific commands:" -ForegroundColor Cyan
    Write-Host "  .\docker-scripts.ps1 logs [service]   - Show logs for specific service" -ForegroundColor White
    Write-Host "  .\docker-scripts.ps1 restart [service] - Restart specific service" -ForegroundColor White
}

function Check-ServiceHealth {
    # PostgreSQL
    Write-Host -NoNewline "  PostgreSQL: "
    try {
        $pgHealth = docker exec servexa-postgres pg_isready -U postgres 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Healthy" -ForegroundColor Green
        } else {
            Write-Host "✗ Unhealthy" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Not running" -ForegroundColor Red
    }
    
    # Redis
    Write-Host -NoNewline "  Redis: "
    try {
        $redisHealth = docker exec servexa-redis redis-cli ping 2>&1
        if ($redisHealth -match "PONG") {
            Write-Host "✓ Healthy" -ForegroundColor Green
        } else {
            Write-Host "✗ Unhealthy" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Not running" -ForegroundColor Red
    }
    
    # Services
    $services = @(
        @{Name="Auth Service"; Url="http://localhost:8081/actuator/health"},
        @{Name="Appointment Service"; Url="http://localhost:8083/actuator/health"},
        @{Name="Vehicle Service"; Url="http://localhost:8084/actuator/health"},
        @{Name="Frontend"; Url="http://localhost:3000"}
    )
    
    foreach ($service in $services) {
        Write-Host -NoNewline "  $($service.Name): "
        try {
            $response = Invoke-WebRequest -Uri $service.Url -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "✓ Healthy" -ForegroundColor Green
            } else {
                Write-Host "✗ Unhealthy (Status: $($response.StatusCode))" -ForegroundColor Red
            }
        } catch {
            Write-Host "✗ Not responding" -ForegroundColor Red
        }
    }
}

function Start-Services {
    Write-Host "Starting all ServeXa services..." -ForegroundColor Green
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Services started successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Access points:" -ForegroundColor Cyan
        Write-Host "  Frontend:           http://localhost:3000" -ForegroundColor White
        Write-Host "  Auth Service:       http://localhost:8081" -ForegroundColor White
        Write-Host "  Appointment Service: http://localhost:8083" -ForegroundColor White
        Write-Host "  Vehicle Service:    http://localhost:8084" -ForegroundColor White
        
        # Health check
        Start-Sleep -Seconds 5
        Write-Host ""
        Write-Host "Health Check:" -ForegroundColor Cyan
        Check-ServiceHealth
    } else {
        Write-Host "❌ Failed to start services" -ForegroundColor Red
    }
}

function Stop-Services {
    Write-Host "Stopping all ServeXa services..." -ForegroundColor Yellow
    docker-compose down
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Services stopped successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to stop services" -ForegroundColor Red
    }
}

function Build-Services {
    Write-Host "Building all ServeXa services..." -ForegroundColor Blue
    docker-compose build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed" -ForegroundColor Red
    }
}

function Rebuild-Services {
    Write-Host "Rebuilding and starting all ServeXa services..." -ForegroundColor Blue
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Rebuild and restart completed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Rebuild failed" -ForegroundColor Red
    }
}

function Show-Logs {
    if ($Service) {
        Write-Host "Showing logs for $Service (Ctrl+C to exit)..." -ForegroundColor Cyan
        docker-compose logs -f $Service
    } else {
        Write-Host "Showing logs from all services (Ctrl+C to exit)..." -ForegroundColor Cyan
        docker-compose logs -f
    }
}

function Show-Status {
    Write-Host "Service Status:" -ForegroundColor Cyan
    docker-compose ps
}

function Clean-Environment {
    Write-Host "⚠️  WARNING: This will remove all containers and volumes (DATA LOSS)!" -ForegroundColor Red
    $confirm = Read-Host "Are you sure? (y/N)"
    
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        Write-Host "Cleaning up Docker environment..." -ForegroundColor Yellow
        docker-compose down -v --remove-orphans
        docker system prune -f
        Write-Host "✅ Cleanup completed." -ForegroundColor Green
    } else {
        Write-Host "Cleanup cancelled." -ForegroundColor Yellow
    }
}

function Start-Development {
    Write-Host "Starting ServeXa in development mode..." -ForegroundColor Green
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Development environment started!" -ForegroundColor Green
    }
}

function Start-Production {
    Write-Host "Starting ServeXa in production mode..." -ForegroundColor Green
    docker-compose --profile with-gateway up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Production environment started!" -ForegroundColor Green
    }
}

function Start-DatabaseOnly {
    Write-Host "Starting only database services..." -ForegroundColor Blue
    docker-compose up -d postgres redis
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database services started!" -ForegroundColor Green
    }
}

function Start-Backend {
    Write-Host "Starting backend services..." -ForegroundColor Blue
    docker-compose up -d postgres redis auth-service appointment-service vehicle-service
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend services started!" -ForegroundColor Green
    }
}

function Start-Frontend {
    Write-Host "Starting frontend service..." -ForegroundColor Blue
    docker-compose up -d frontend
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend service started!" -ForegroundColor Green
        Write-Host "Access at: http://localhost:3000" -ForegroundColor Cyan
    }
}

function Restart-Services {
    if ($Service) {
        Write-Host "Restarting $Service..." -ForegroundColor Yellow
        docker-compose restart $Service
    } else {
        Write-Host "Restarting all ServeXa services..." -ForegroundColor Yellow
        docker-compose restart
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Services restarted successfully!" -ForegroundColor Green
    }
}

# Main script logic
switch ($Command.ToLower()) {
    "up" { Start-Services }
    "down" { Stop-Services }
    "build" { Build-Services }
    "rebuild" { Rebuild-Services }
    "logs" { Show-Logs }
    "status" { Show-Status }
    "clean" { Clean-Environment }
    "dev" { Start-Development }
    "prod" { Start-Production }
    "db-only" { Start-DatabaseOnly }
    "backend" { Start-Backend }
    "frontend" { Start-Frontend }
    "restart" { Restart-Services }
    "health" { Check-ServiceHealth }
    "help" { Show-Help }
    default { Show-Help }
}