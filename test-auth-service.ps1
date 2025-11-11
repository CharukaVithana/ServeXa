# =========================================
# ServeXa Authentication Service Test Script
# =========================================

$BASE_URL = "http://localhost:8081/api/auth"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Testing Authentication Service" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# =========================================
# TEST 1: Sign Up (Register New User)
# =========================================
Write-Host "`n[TEST 1] Signing up new user..." -ForegroundColor Yellow

$signupData = @{
    email = "testuser@example.com"
    password = "password123"
    fullName = "Test User"
    phoneNumber = "1234567890"
    role = "CUSTOMER"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod -Uri "$BASE_URL/signup" `
        -Method Post `
        -Body $signupData `
        -ContentType "application/json"
    
    Write-Host "✅ Signup successful!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $signupResponse | ConvertTo-Json -Depth 5 | Write-Host
    
    # Extract token for next tests
    $accessToken = $signupResponse.data.accessToken
    
} catch {
    Write-Host "❌ Signup failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception.Response
}

# =========================================
# TEST 2: Login
# =========================================
Write-Host "`n[TEST 2] Logging in..." -ForegroundColor Yellow

$loginData = @{
    email = "testuser@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/login" `
        -Method Post `
        -Body $loginData `
        -ContentType "application/json"
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $loginResponse | ConvertTo-Json -Depth 5 | Write-Host
    
    # Save token for authenticated requests
    $accessToken = $loginResponse.data.accessToken
    Write-Host "`nAccess Token: $accessToken" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

# =========================================
# TEST 3: Get Current User (Authenticated Request)
# =========================================
Write-Host "`n[TEST 3] Getting current user..." -ForegroundColor Yellow

if ($accessToken) {
    try {
        $headers = @{
            "Authorization" = "Bearer $accessToken"
        }
        
        $meResponse = Invoke-RestMethod -Uri "$BASE_URL/me" `
            -Method Get `
            -Headers $headers
        
        Write-Host "✅ Got current user!" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor White
        $meResponse | ConvertTo-Json -Depth 5 | Write-Host
        
    } catch {
        Write-Host "❌ Get user failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ Skipping - no access token" -ForegroundColor Yellow
}

# =========================================
# TEST 4: Validate Token
# =========================================
Write-Host "`n[TEST 4] Validating token..." -ForegroundColor Yellow

if ($accessToken) {
    try {
        $validateResponse = Invoke-RestMethod -Uri "$BASE_URL/validate?token=$accessToken" `
            -Method Get
        
        Write-Host "✅ Token validated!" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor White
        $validateResponse | ConvertTo-Json -Depth 5 | Write-Host
        
    } catch {
        Write-Host "❌ Validation failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ Skipping - no access token" -ForegroundColor Yellow
}

# =========================================
# TEST 5: Login with Wrong Password (Error Case)
# =========================================
Write-Host "`n[TEST 5] Testing wrong password..." -ForegroundColor Yellow

$wrongLoginData = @{
    email = "testuser@example.com"
    password = "wrongpassword"
} | ConvertTo-Json

try {
    $wrongResponse = Invoke-RestMethod -Uri "$BASE_URL/login" `
        -Method Post `
        -Body $wrongLoginData `
        -ContentType "application/json"
    
    Write-Host "❌ Should have failed!" -ForegroundColor Red
    
} catch {
    Write-Host "✅ Correctly rejected wrong password!" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
