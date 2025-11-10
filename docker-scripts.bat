@echo off
REM ServeXa Docker Management Script for Windows

if "%1"=="" (
    echo Usage: docker-scripts.bat [command]
    echo.
    echo Available commands:
    echo   up          - Start all services
    echo   down        - Stop all services
    echo   build       - Build all services
    echo   rebuild     - Rebuild and start all services
    echo   logs        - Show logs from all services
    echo   status      - Show status of all services
    echo   clean       - Remove all containers and volumes ^(WARNING: Data loss!^)
    echo   dev         - Start in development mode
    echo   prod        - Start in production mode
    echo   db-only     - Start only database services
    echo   backend     - Start only backend services
    echo   frontend    - Start only frontend service
    echo   restart     - Restart all services
    goto :eof
)

if "%1"=="up" (
    echo Starting all ServeXa services...
    docker-compose up -d
    echo.
    echo Services started! Access points:
    echo Frontend: http://localhost:3000
    echo Auth Service: http://localhost:8081
    echo Appointment Service: http://localhost:8083
    echo Vehicle Service: http://localhost:8084
    goto :eof
)

if "%1"=="down" (
    echo Stopping all ServeXa services...
    docker-compose down
    goto :eof
)

if "%1"=="build" (
    echo Building all ServeXa services...
    docker-compose build
    goto :eof
)

if "%1"=="rebuild" (
    echo Rebuilding and starting all ServeXa services...
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    goto :eof
)

if "%1"=="logs" (
    docker-compose logs -f
    goto :eof
)

if "%1"=="status" (
    docker-compose ps
    goto :eof
)

if "%1"=="clean" (
    echo WARNING: This will remove all containers and volumes ^(DATA LOSS^)!
    set /p confirm="Are you sure? (y/N): "
    if /i "%confirm%"=="y" (
        docker-compose down -v --remove-orphans
        docker system prune -f
        echo Cleanup completed.
    ) else (
        echo Cleanup cancelled.
    )
    goto :eof
)

if "%1"=="dev" (
    echo Starting ServeXa in development mode...
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    goto :eof
)

if "%1"=="prod" (
    echo Starting ServeXa in production mode...
    docker-compose --profile with-gateway up -d
    goto :eof
)

if "%1"=="db-only" (
    echo Starting only database services...
    docker-compose up -d postgres redis
    goto :eof
)

if "%1"=="backend" (
    echo Starting backend services...
    docker-compose up -d postgres redis auth-service appointment-service vehicle-service
    goto :eof
)

if "%1"=="frontend" (
    echo Starting frontend service...
    docker-compose up -d frontend
    goto :eof
)

if "%1"=="restart" (
    echo Restarting all ServeXa services...
    docker-compose restart
    goto :eof
)

echo Unknown command: %1
echo Use 'docker-scripts.bat' without arguments to see available commands.