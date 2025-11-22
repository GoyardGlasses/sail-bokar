# SAIL Bokaro Logistics System - Application Launcher (PowerShell)
# This script starts the entire application (Backend + Frontend + Electron)

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "  SAIL BOKARO LOGISTICS OPTIMIZATION SYSTEM" -ForegroundColor Cyan
Write-Host "  Application Launcher" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[✓] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "[✓] Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python from https://www.python.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Get project directory
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectDir

Write-Host "Starting SAIL Bokaro Application..." -ForegroundColor Cyan
Write-Host ""

# Check if frontend node_modules exists
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
    Write-Host "[✓] Frontend dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Check if Python dependencies are installed
Write-Host "Checking backend dependencies..." -ForegroundColor Yellow
try {
    python -c "import fastapi" 2>$null
} catch {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    pip install -r requirements.txt
    Set-Location ..
    Write-Host "[✓] Backend dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Start the Electron app
Write-Host "Launching SAIL Bokaro Application..." -ForegroundColor Cyan
Write-Host ""

Set-Location frontend
npm run electron

Read-Host "Press Enter to exit"
