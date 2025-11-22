@echo off
REM ============================================================================
REM SAIL BOKARO - COMPLETE WEBSITE LAUNCHER
REM ============================================================================
REM This script launches the complete website with backend and frontend
REM ============================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

color 0A
title SAIL Bokaro - Website Launcher

cls

echo.
echo ============================================================================
echo.
echo   SAIL BOKARO LOGISTICS OPTIMIZATION SYSTEM
echo   Complete Website Launcher
echo.
echo ============================================================================
echo.

REM Step 1: Kill any existing processes
echo [STEP 1] Cleaning up existing processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Step 2: Check prerequisites
echo [STEP 2] Checking prerequisites...
where node >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org/
    pause
    exit /b 1
)

where python >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] Python not found. Install from https://www.python.org/
    pause
    exit /b 1
)
echo [OK] Prerequisites met

REM Step 3: Install frontend dependencies
echo.
echo [STEP 3] Installing frontend dependencies...
cd frontend
if not exist "node_modules" (
    call npm install
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
)
cd ..
echo [OK] Frontend dependencies ready

REM Step 4: Install backend dependencies
echo.
echo [STEP 4] Installing backend dependencies...
cd backend
python -m pip install -q -r requirements.txt >nul 2>&1
if !errorlevel! neq 0 (
    echo [WARNING] Some backend dependencies may not have installed correctly
    echo Attempting to continue...
)
cd ..
echo [OK] Backend dependencies ready

REM Step 5: Start backend in background
echo.
echo [STEP 5] Starting backend server...
cd backend
start /B python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
timeout /t 3 /nobreak >nul
cd ..
echo [OK] Backend server started on http://127.0.0.1:8000

REM Step 6: Start frontend
echo.
echo [STEP 6] Starting frontend dev server...
echo.
echo ============================================================================
echo SYSTEM READY!
echo ============================================================================
echo.
echo Frontend will start in a few seconds...
echo Once ready, open your browser to: http://localhost:5173
echo.
echo To stop the system, close this window.
echo.
echo ============================================================================
echo.

cd frontend
call npm run dev

REM Cleanup on exit
echo.
echo Shutting down...
taskkill /F /IM python.exe >nul 2>&1
echo Done.
pause
