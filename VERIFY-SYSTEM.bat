@echo off
REM ============================================================================
REM SAIL BOKARO - SYSTEM VERIFICATION
REM ============================================================================
REM This script verifies that all components are properly installed and ready
REM ============================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

color 0A
title SAIL Bokaro - System Verification

echo.
echo ============================================================================
echo SAIL BOKARO - SYSTEM VERIFICATION
echo ============================================================================
echo.

set ERRORS=0

REM Check Node.js
echo [CHECK 1] Node.js Installation...
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

REM Check Python
echo [CHECK 2] Python Installation...
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

REM Check npm
echo [CHECK 3] npm Installation...
npm --version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo [OK] npm !NPM_VERSION! is installed
) else (
    echo [ERROR] npm is not installed
    set /a ERRORS=!ERRORS!+1
)
echo.

REM Check frontend directory
echo [CHECK 4] Frontend Directory...
if exist "frontend" (
    echo [OK] Frontend directory exists
) else (
    echo [ERROR] Frontend directory not found
    set /a ERRORS=!ERRORS!+1
)
echo.

REM Check backend directory
echo [CHECK 5] Backend Directory...
if exist "backend" (
    echo [OK] Backend directory exists
) else (
    echo [ERROR] Backend directory not found
    set /a ERRORS=!ERRORS!+1
)
echo.

REM Check frontend package.json
echo [CHECK 6] Frontend Configuration...
if exist "frontend\package.json" (
    echo [OK] Frontend package.json exists
) else (
    echo [ERROR] Frontend package.json not found
    set /a ERRORS=!ERRORS!+1
)
echo.

REM Check backend requirements.txt
echo [CHECK 7] Backend Configuration...
if exist "backend\requirements.txt" (
    echo [OK] Backend requirements.txt exists
) else (
    echo [ERROR] Backend requirements.txt not found
    set /a ERRORS=!ERRORS!+1
)
echo.

REM Check frontend node_modules
echo [CHECK 8] Frontend Dependencies...
if exist "frontend\node_modules" (
    echo [OK] Frontend dependencies are installed
) else (
    echo [WARNING] Frontend dependencies not installed
    echo Run: cd frontend ^&^& npm install
)
echo.

REM Summary
echo ============================================================================
echo VERIFICATION SUMMARY
echo ============================================================================
echo.

if !ERRORS! equ 0 (
    echo [SUCCESS] All checks passed!
    echo.
    echo Your system is ready to use. You can now:
    echo.
    echo 1. Launch the desktop app:
    echo    Double-click: START-APP.bat
    echo.
    echo 2. Launch the website:
    echo    Run: cd frontend ^&^& npm run dev
    echo    Then open: http://localhost:5173
    echo.
) else (
    echo [FAILED] !ERRORS! check(s) failed
    echo.
    echo Please fix the errors above and try again.
    echo.
)

echo ============================================================================
echo.
pause
