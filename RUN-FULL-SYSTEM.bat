@echo off
REM ============================================================================
REM SAIL BOKARO - COMPLETE SYSTEM APPLICATION LAUNCHER
REM ============================================================================
REM This script launches the complete system with backend, frontend, and UI
REM ============================================================================

setlocal enabledelayedexpansion

color 0A
title SAIL Bokaro - Complete System Application v1.0.0

cls

REM Display banner
echo.
echo ============================================================================
echo.
echo   SAIL BOKARO LOGISTICS OPTIMIZATION SYSTEM
echo   Complete System Application Launcher
echo   Version 1.0.0
echo.
echo ============================================================================
echo.

REM Get project directory
set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo [*] Starting SAIL Bokaro Complete System...
echo [*] Project Directory: %PROJECT_DIR%
echo.

REM ============================================================================
REM CHECK PREREQUISITES
REM ============================================================================
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

echo [OK] Node.js and Python found
echo.

REM ============================================================================
REM INSTALL DEPENDENCIES (if needed)
REM ============================================================================
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

REM ============================================================================
REM START BACKEND SERVER
REM ============================================================================
echo [STARTING] Backend Server...
echo.

cd backend
start "SAIL Bokaro - Backend Server (http://127.0.0.1:8000)" cmd /k "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

cd ..

echo [OK] Backend server started in new window
echo.

REM Wait for backend to initialize
echo Waiting for backend to initialize...
timeout /t 4 /nobreak

REM ============================================================================
REM START FRONTEND DEV SERVER
REM ============================================================================
echo [STARTING] Frontend Development Server...
echo.

cd frontend
start "SAIL Bokaro - Frontend Server (http://localhost:5173)" cmd /k "npm run dev"

cd ..

echo [OK] Frontend server started in new window
echo.

REM Wait for frontend to initialize
echo Waiting for frontend to initialize...
timeout /t 8 /nobreak

REM ============================================================================
REM LAUNCH ELECTRON APPLICATION
REM ============================================================================
echo [LAUNCHING] Desktop Application...
echo.

cd frontend
start "SAIL Bokaro - Desktop Application" cmd /k "npm run electron-dev"

cd ..

echo.
echo ============================================================================
echo.
echo [OK] SAIL Bokaro Complete System is Running!
echo.
echo Access Points:
echo   - Desktop Application: Electron window (should open automatically)
echo   - Web Dashboard: http://localhost:5173
echo   - Backend API: http://127.0.0.1:8000
echo   - API Docs: http://127.0.0.1:8000/api/docs
echo.
echo Keyboard Shortcuts:
echo   - Ctrl+I: Open Developer Tools
echo   - Ctrl+R: Reload Application
echo   - Ctrl+Q: Close Application
echo.
echo ============================================================================
echo.
echo All systems are running in separate windows.
echo Close any window to stop that service.
echo.
pause
