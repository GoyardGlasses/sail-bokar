@echo off
REM ============================================================================
REM SAIL BOKARO - SYSTEM DIAGNOSTIC
REM ============================================================================
REM This script diagnoses the system and identifies any issues
REM ============================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

color 0A
title SAIL Bokaro - System Diagnostic

cls

echo.
echo ============================================================================
echo SAIL BOKARO - SYSTEM DIAGNOSTIC
echo ============================================================================
echo.

set ERRORS=0
set WARNINGS=0

REM ============================================================================
REM CHECK 1: Node.js
REM ============================================================================
echo [CHECK 1] Node.js Installation
node --version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js !NODE_VERSION! is installed
) else (
    echo [ERROR] Node.js is not installed
    echo Install from: https://nodejs.org/
    set /a ERRORS=!ERRORS!+1
)
echo.

REM ============================================================================
REM CHECK 2: Python
REM ============================================================================
echo [CHECK 2] Python Installation
python --version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo [OK] !PYTHON_VERSION! is installed
) else (
    echo [ERROR] Python is not installed
    echo Install from: https://www.python.org/
    set /a ERRORS=!ERRORS!+1
)
echo.

REM ============================================================================
REM CHECK 3: npm
REM ============================================================================
echo [CHECK 3] npm Installation
npm --version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo [OK] npm !NPM_VERSION! is installed
) else (
    echo [ERROR] npm is not installed
    set /a ERRORS=!ERRORS!+1
)
echo.

REM ============================================================================
REM CHECK 4: Frontend Directory
REM ============================================================================
echo [CHECK 4] Frontend Directory Structure
if exist "frontend" (
    echo [OK] frontend/ directory exists
    if exist "frontend\package.json" (
        echo [OK] frontend/package.json exists
    ) else (
        echo [ERROR] frontend/package.json not found
        set /a ERRORS=!ERRORS!+1
    )
    if exist "frontend\src" (
        echo [OK] frontend/src/ directory exists
    ) else (
        echo [ERROR] frontend/src/ directory not found
        set /a ERRORS=!ERRORS!+1
    )
    if exist "frontend\src\main.jsx" (
        echo [OK] frontend/src/main.jsx exists
    ) else (
        echo [ERROR] frontend/src/main.jsx not found
        set /a ERRORS=!ERRORS!+1
    )
    if exist "frontend\src\App.jsx" (
        echo [OK] frontend/src/App.jsx exists
    ) else (
        echo [ERROR] frontend/src/App.jsx not found
        set /a ERRORS=!ERRORS!+1
    )
    if exist "frontend\.env" (
        echo [OK] frontend/.env exists
    ) else (
        echo [WARNING] frontend/.env not found
        set /a WARNINGS=!WARNINGS!+1
    )
) else (
    echo [ERROR] frontend/ directory not found
    set /a ERRORS=!ERRORS!+1
)
echo.

REM ============================================================================
REM CHECK 5: Backend Directory
REM ============================================================================
echo [CHECK 5] Backend Directory Structure
if exist "backend" (
    echo [OK] backend/ directory exists
    if exist "backend\requirements.txt" (
        echo [OK] backend/requirements.txt exists
    ) else (
        echo [ERROR] backend/requirements.txt not found
        set /a ERRORS=!ERRORS!+1
    )
    if exist "backend\app" (
        echo [OK] backend/app/ directory exists
    ) else (
        echo [ERROR] backend/app/ directory not found
        set /a ERRORS=!ERRORS!+1
    )
    if exist "backend\app\main.py" (
        echo [OK] backend/app/main.py exists
    ) else (
        echo [ERROR] backend/app/main.py not found
        set /a ERRORS=!ERRORS!+1
    )
    if exist "backend\.env" (
        echo [OK] backend/.env exists
    ) else (
        echo [WARNING] backend/.env not found
        set /a WARNINGS=!WARNINGS!+1
    )
) else (
    echo [ERROR] backend/ directory not found
    set /a ERRORS=!ERRORS!+1
)
echo.

REM ============================================================================
REM CHECK 6: Frontend Dependencies
REM ============================================================================
echo [CHECK 6] Frontend Dependencies
if exist "frontend\node_modules" (
    echo [OK] frontend/node_modules/ exists
) else (
    echo [WARNING] frontend/node_modules/ not found
    echo Run: cd frontend ^&^& npm install
    set /a WARNINGS=!WARNINGS!+1
)
echo.

REM ============================================================================
REM CHECK 7: Backend Dependencies
REM ============================================================================
echo [CHECK 7] Backend Dependencies
python -c "import fastapi" >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] FastAPI is installed
) else (
    echo [WARNING] FastAPI not installed
    echo Run: cd backend ^&^& pip install -r requirements.txt
    set /a WARNINGS=!WARNINGS!+1
)
echo.

REM ============================================================================
REM CHECK 8: Configuration Files
REM ============================================================================
echo [CHECK 8] Configuration Files
if exist "frontend\vite.config.js" (
    echo [OK] frontend/vite.config.js exists
) else (
    echo [ERROR] frontend/vite.config.js not found
    set /a ERRORS=!ERRORS!+1
)
if exist "frontend\tailwind.config.js" (
    echo [OK] frontend/tailwind.config.js exists
) else (
    echo [ERROR] frontend/tailwind.config.js not found
    set /a ERRORS=!ERRORS!+1
)
if exist "frontend\postcss.config.js" (
    echo [OK] frontend/postcss.config.js exists
) else (
    echo [ERROR] frontend/postcss.config.js not found
    set /a ERRORS=!ERRORS!+1
)
if exist "backend\app\config.py" (
    echo [OK] backend/app/config.py exists
) else (
    echo [ERROR] backend/app/config.py not found
    set /a ERRORS=!ERRORS!+1
)
echo.

REM ============================================================================
REM SUMMARY
REM ============================================================================
echo ============================================================================
echo DIAGNOSTIC SUMMARY
echo ============================================================================
echo.
if !ERRORS! equ 0 (
    if !WARNINGS! equ 0 (
        echo [SUCCESS] All checks passed!
        echo.
        echo Your system is ready to use. Run:
        echo   Double-click: RUN-WEBSITE.bat
        echo.
    ) else (
        echo [WARNING] !WARNINGS! warning(s) found
        echo.
        echo Your system should work, but some dependencies may need installation.
        echo Run: RUN-WEBSITE.bat to auto-install missing dependencies
        echo.
    )
) else (
    echo [FAILED] !ERRORS! error(s) found
    echo.
    echo Please fix the errors above before launching the system.
    echo.
)
echo ============================================================================
echo.
pause
