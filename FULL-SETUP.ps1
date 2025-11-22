# ============================================================================
# SAIL BOKARO - COMPLETE SETUP SCRIPT
# ============================================================================
# This PowerShell script sets up and launches the entire system

param(
    [switch]$SkipInstall = $false,
    [switch]$DiagnosticOnly = $false
)

# Set error action
$ErrorActionPreference = "Continue"

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

# ============================================================================
# DIAGNOSTIC CHECKS
# ============================================================================

Write-Info "=========================================="
Write-Info "SAIL BOKARO - SYSTEM SETUP"
Write-Info "=========================================="
Write-Info ""

$errors = 0
$warnings = 0

# Check Node.js
Write-Info "[CHECK 1] Node.js Installation..."
try {
    $nodeVersion = node --version
    Write-Success "[OK] Node.js $nodeVersion is installed"
} catch {
    Write-Error "[ERROR] Node.js not found. Install from https://nodejs.org/"
    $errors++
}

# Check Python
Write-Info "[CHECK 2] Python Installation..."
try {
    $pythonVersion = python --version 2>&1
    Write-Success "[OK] $pythonVersion is installed"
} catch {
    Write-Error "[ERROR] Python not found. Install from https://www.python.org/"
    $errors++
}

# Check npm
Write-Info "[CHECK 3] npm Installation..."
try {
    $npmVersion = npm --version
    Write-Success "[OK] npm $npmVersion is installed"
} catch {
    Write-Error "[ERROR] npm not found"
    $errors++
}

# Check directories
Write-Info "[CHECK 4] Frontend Directory..."
if (Test-Path "frontend") {
    Write-Success "[OK] frontend/ directory exists"
    if (Test-Path "frontend\package.json") {
        Write-Success "[OK] frontend/package.json exists"
    } else {
        Write-Error "[ERROR] frontend/package.json not found"
        $errors++
    }
} else {
    Write-Error "[ERROR] frontend/ directory not found"
    $errors++
}

Write-Info "[CHECK 5] Backend Directory..."
if (Test-Path "backend") {
    Write-Success "[OK] backend/ directory exists"
    if (Test-Path "backend\requirements.txt") {
        Write-Success "[OK] backend/requirements.txt exists"
    } else {
        Write-Error "[ERROR] backend/requirements.txt not found"
        $errors++
    }
} else {
    Write-Error "[ERROR] backend/ directory not found"
    $errors++
}

# Check environment files
Write-Info "[CHECK 6] Environment Files..."
if (Test-Path "frontend\.env") {
    Write-Success "[OK] frontend/.env exists"
} else {
    Write-Warning "[WARNING] frontend/.env not found"
    $warnings++
}

if (Test-Path "backend\.env") {
    Write-Success "[OK] backend/.env exists"
} else {
    Write-Warning "[WARNING] backend/.env not found"
    $warnings++
}

Write-Info ""
Write-Info "=========================================="
Write-Info "DIAGNOSTIC SUMMARY"
Write-Info "=========================================="

if ($errors -eq 0) {
    Write-Success "[SUCCESS] All critical checks passed!"
} else {
    Write-Error "[FAILED] $errors critical error(s) found"
    Write-Error "Please fix the errors above before proceeding."
    exit 1
}

if ($warnings -gt 0) {
    Write-Warning "[WARNING] $warnings warning(s) found"
}

Write-Info ""

# Exit if diagnostic only
if ($DiagnosticOnly) {
    exit 0
}

# ============================================================================
# INSTALLATION
# ============================================================================

if (-not $SkipInstall) {
    Write-Info "=========================================="
    Write-Info "INSTALLING DEPENDENCIES"
    Write-Info "=========================================="
    Write-Info ""

    # Kill existing processes
    Write-Info "Stopping any existing processes..."
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2

    # Install frontend dependencies
    Write-Info "[STEP 1] Installing frontend dependencies..."
    if (-not (Test-Path "frontend\node_modules")) {
        Set-Location frontend
        npm install
        Set-Location ..
        Write-Success "[OK] Frontend dependencies installed"
    } else {
        Write-Success "[OK] Frontend dependencies already installed"
    }

    # Install backend dependencies
    Write-Info "[STEP 2] Installing backend dependencies..."
    Set-Location backend
    python -m pip install -q -r requirements.txt
    Set-Location ..
    Write-Success "[OK] Backend dependencies installed"

    Write-Info ""
}

# ============================================================================
# STARTUP
# ============================================================================

Write-Info "=========================================="
Write-Info "STARTING SYSTEM"
Write-Info "=========================================="
Write-Info ""

Write-Info "[STEP 1] Starting backend server..."
Set-Location backend
Start-Process python -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000" -NoNewWindow
Start-Sleep -Seconds 3
Set-Location ..
Write-Success "[OK] Backend started on http://127.0.0.1:8000"

Write-Info "[STEP 2] Starting frontend dev server..."
Write-Info ""
Write-Info "=========================================="
Write-Info "SYSTEM READY!"
Write-Info "=========================================="
Write-Info ""
Write-Info "Backend: http://127.0.0.1:8000"
Write-Info "Frontend: http://localhost:5173"
Write-Info ""
Write-Info "Opening browser in 5 seconds..."
Write-Info ""
Write-Info "=========================================="
Write-Info ""

Start-Sleep -Seconds 5

# Open browser
Start-Process "http://localhost:5173"

# Start frontend
Set-Location frontend
npm run dev
