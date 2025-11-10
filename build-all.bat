@echo off
REM Complete build script for ServeXa

echo ============================================
echo ServeXa Complete Build and Docker Script
echo ============================================

if "%1"=="" (
    echo Usage: build-all.bat [command]
    echo.
    echo Commands:
    echo   build-backend    - Build all Spring Boot services with Maven
    echo   build-frontend   - Build React frontend
    echo   build-docker     - Build Docker images (requires backend built first)
    echo   build-all        - Build everything (backend + frontend + docker)
    echo   clean           - Clean all build artifacts
    echo   test            - Run all tests
    goto :eof
)

if "%1"=="build-backend" (
    echo [INFO] Building backend services with Maven...
    cd backend
    
    echo Building common-libs...
    cd common-libs && mvn clean install -DskipTests && cd ..
    
    echo Building authentication-service...
    cd authentication-service && mvn clean package -DskipTests && cd ..
    

    
    echo Building appointment-service...
    cd appointment-service && mvn clean package -DskipTests && cd ..
    
    echo Building vehicle-service...
    cd vehicle-service && mvn clean package -DskipTests && cd ..
    
    cd ..
    echo [SUCCESS] Backend build completed!
    goto :eof
)

if "%1"=="build-frontend" (
    echo [INFO] Building frontend...
    cd frontend
    npm ci
    npm run build
    cd ..
    echo [SUCCESS] Frontend build completed!
    goto :eof
)

if "%1"=="build-docker" (
    echo [INFO] Building Docker images...
    docker-compose build
    
    if %errorlevel% neq 0 (
        echo [ERROR] Docker build failed
        exit /b 1
    )
    
    echo [SUCCESS] Docker images built successfully!
    goto :eof
)

if "%1"=="build-all" (
    echo [INFO] Building everything...
    
    REM Build backend
    call %0 build-backend
    if %errorlevel% neq 0 exit /b 1
    
    REM Build frontend
    call %0 build-frontend
    if %errorlevel% neq 0 exit /b 1
    
    REM Build Docker images
    call %0 build-docker
    if %errorlevel% neq 0 exit /b 1
    
    echo [SUCCESS] Complete build finished!
    echo.
    echo Next steps:
    echo 1. Test locally: docker-compose up -d
    echo 2. Deploy to Kubernetes: deploy-k8s.bat deploy
    goto :eof
)

if "%1"=="clean" (
    echo [INFO] Cleaning build artifacts...
    
    REM Clean Maven builds
    cd backend
    for /d %%i in (authentication-service appointment-service vehicle-service common-libs) do (
        if exist %%i\target rmdir /s /q %%i\target
    )
    cd ..
    
    REM Clean frontend build
    cd frontend
    if exist dist rmdir /s /q dist
    if exist node_modules rmdir /s /q node_modules
    cd ..
    
    REM Clean Docker images (optional)
    set /p CLEAN_DOCKER="Clean Docker images too? (y/N): "
    if /i "%CLEAN_DOCKER%"=="y" (
        docker-compose down --rmi all --volumes --remove-orphans
    )
    
    echo [SUCCESS] Cleanup completed!
    goto :eof
)

if "%1"=="test" (
    echo [INFO] Running all tests...
    
    REM Backend tests
    cd backend
    for %%i in (authentication-service appointment-service vehicle-service) do (
        echo Testing %%i...
        cd %%i && mvn test && cd ..
    )
    cd ..
    
    REM Frontend tests
    cd frontend
    npm test -- --watchAll=false
    cd ..
    
    echo [SUCCESS] All tests completed!
    goto :eof
)

echo Unknown command: %1
echo Use 'build-all.bat' without arguments to see available commands.