# SAIL Bokaro Unified Launcher - PowerShell Version
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "                    SAIL BOKARO LOGISTICS SYSTEM" -ForegroundColor Green
Write-Host "                         Unified Launcher v2.0" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""

# Step 1: Kill existing processes
Write-Host "[STEP 1/5] Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Step 2: Check prerequisites
Write-Host "[STEP 2/5] Checking prerequisites..." -ForegroundColor Yellow
$nodeCheck = node --version 2>$null
$pythonCheck = python --version 2>$null

if (-not $nodeCheck) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    exit 1
}

if (-not $pythonCheck) {
    Write-Host "ERROR: Python is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host "Node.js: OK" -ForegroundColor Green
Write-Host "Python: OK" -ForegroundColor Green
Write-Host ""

# Step 3: Setup frontend
Write-Host "[STEP 3/5] Setting up frontend..." -ForegroundColor Yellow
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    Set-Location frontend
    npm install
    Set-Location ..
} else {
    Write-Host "Frontend dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Step 4: Setup backend
Write-Host "[STEP 4/5] Setting up backend..." -ForegroundColor Yellow
Write-Host "Backend dependencies check skipped" -ForegroundColor Green
Write-Host ""

# Step 5: Start services
Write-Host "[STEP 5/5] Starting services..." -ForegroundColor Yellow
Write-Host ""

# Start Backend
Write-Host "Starting Backend Server on http://127.0.0.1:8000..." -ForegroundColor Cyan
$backendScript = @"
cd backend
python -m app.main
"@
$backendScript | Out-File -FilePath "$env:TEMP\start_backend.bat" -Encoding ASCII
Start-Process cmd.exe -ArgumentList "/k `"$env:TEMP\start_backend.bat`"" -WindowStyle Normal -PassThru

Write-Host "Waiting for backend to initialize (10 seconds)..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# Start Frontend
Write-Host "Starting Frontend Server on http://localhost:5173..." -ForegroundColor Cyan
$frontendScript = @"
cd frontend
npm run dev
"@
$frontendScript | Out-File -FilePath "$env:TEMP\start_frontend.bat" -Encoding ASCII
Start-Process cmd.exe -ArgumentList "/k `"$env:TEMP\start_frontend.bat`"" -WindowStyle Normal -PassThru

Write-Host "Waiting for frontend to initialize (8 seconds)..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# Open browser
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "                         SYSTEM STARTED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access Points:" -ForegroundColor Yellow
Write-Host "   - Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "   - Backend:   http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "   - API Docs:  http://127.0.0.1:8000/api/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening application in browser..." -ForegroundColor Yellow
Write-Host ""
Start-Sleep -Seconds 3

Start-Process "http://localhost:5173"

Write-Host "============================================================================" -ForegroundColor Green
Write-Host "IMPORTANT: Keep both terminal windows open while using the application" -ForegroundColor Yellow
Write-Host "To stop: Close both terminal windows or press Ctrl+C in each" -ForegroundColor Yellow
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""
