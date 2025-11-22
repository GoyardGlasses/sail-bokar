@echo off
setlocal enabledelayedexpansion
title SAIL Bokaro - Unified Launcher
color 0A

REM ============================================================================
REM SAIL BOKARO UNIFIED LAUNCHER
REM Starts both backend and frontend with proper initialization
REM ============================================================================

echo.
echo ============================================================================
echo                    SAIL BOKARO LOGISTICS SYSTEM
echo                         Unified Launcher v2.0
echo ============================================================================
echo.

REM Kill any existing processes
echo [STEP 1/5] Cleaning up existing processes...
taskkill /IM node.exe /F >nul 2>&1
taskkill /IM python.exe /F >nul 2>&1
timeout /t 2 /nobreak >nul

REM Check if Node.js is installed
echo [STEP 2/5] Checking prerequisites...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed!
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo Node.js: OK
echo Python: OK
echo.

REM Install frontend dependencies if needed
echo [STEP 3/5] Setting up frontend...
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies (this may take a minute)...
    cd frontend
    call npm install --silent
    cd ..
) else (
    echo Frontend dependencies already installed
)
echo.

REM Install backend dependencies if needed
echo [STEP 4/5] Setting up backend...
if not exist "backend\venv" (
    echo Installing backend dependencies (this may take a minute)...
    cd backend
    python -m pip install -q -r requirements.txt
    cd ..
) else (
    echo Backend dependencies already installed
)
echo.

REM Start backend in a new window
echo [STEP 5/5] Starting services...
echo.
echo Starting Backend Server on http://127.0.0.1:8000...
start "SAIL Bokaro - Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

REM Wait for backend to start
echo Waiting for backend to initialize (10 seconds)...
timeout /t 10 /nobreak >nul

REM Check if backend is responding
echo Checking backend health...
:check_backend
curl -s http://127.0.0.1:8000/meta/health >nul 2>&1
if errorlevel 1 (
    echo Backend is still starting... waiting 3 more seconds
    timeout /t 3 /nobreak >nul
    goto check_backend
)

echo Backend is ready!
echo.

REM Start frontend in a new window
echo Starting Frontend Server on http://localhost:5173...
start "SAIL Bokaro - Frontend" cmd /k "cd frontend && npm run dev"

REM Wait for frontend to start
echo Waiting for frontend to initialize (8 seconds)...
timeout /t 8 /nobreak >nul

REM Open browser
echo.
echo ============================================================================
echo                         SYSTEM STARTED SUCCESSFULLY!
echo ============================================================================
echo.
echo Access Points:
echo   - Frontend:  http://localhost:5173
echo   - Backend:   http://127.0.0.1:8000
echo   - API Docs:  http://127.0.0.1:8000/api/docs
echo   - Health:    http://127.0.0.1:8000/meta/health
echo.
echo Opening application in browser...
echo.
timeout /t 3 /nobreak >nul

start http://localhost:5173

echo.
echo ============================================================================
echo IMPORTANT: Keep both terminal windows open while using the application
echo To stop: Close both terminal windows or press Ctrl+C in each
echo ============================================================================
echo.

exit /b 0
