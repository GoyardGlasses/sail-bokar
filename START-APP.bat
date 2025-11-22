@echo off
REM ============================================================================
REM SAIL BOKARO - SIMPLE APPLICATION LAUNCHER
REM ============================================================================
REM This is the simplest way to launch the complete application
REM ============================================================================

setlocal enabledelayedexpansion

color 0A
title SAIL Bokaro - Application Launcher

cls

echo.
echo ============================================================================
echo.
echo   SAIL BOKARO LOGISTICS OPTIMIZATION SYSTEM
echo   Application Launcher
echo.
echo ============================================================================
echo.

REM Get project directory
set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo [*] Starting SAIL Bokaro Application...
echo.

REM Check prerequisites
echo [CHECKING] Prerequisites...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install from https://nodejs.org/
    pause
    exit /b 1
)

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install from https://www.python.org/
    pause
    exit /b 1
)

echo [OK] Prerequisites met
echo.

REM Install dependencies if needed
echo [INSTALLING] Dependencies...

if not exist "frontend\node_modules" (
    echo Installing frontend packages...
    cd frontend
    call npm install --legacy-peer-deps >nul 2>&1
    cd ..
)

python -c "import fastapi" >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing backend packages...
    cd backend
    call pip install -r requirements.txt --quiet >nul 2>&1
    cd ..
)

echo [OK] Dependencies ready
echo.

REM Start the complete system
echo [LAUNCHING] Complete System...
echo.
echo Starting backend server...
echo Starting frontend dev server...
echo Starting desktop application...
echo.
echo This will open in 5-10 seconds...
echo.

cd frontend

REM Run electron-dev which starts both dev server and electron
call npm run electron-dev

cd ..

echo.
echo Application closed.
echo.

pause
