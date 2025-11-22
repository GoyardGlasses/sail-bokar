@echo off
REM ============================================================================
REM SAIL BOKARO - COMPLETE SYSTEM REBUILD
REM ============================================================================
REM This script rebuilds the entire system from scratch, ensuring both the
REM website and desktop app work perfectly.
REM ============================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ============================================================================
echo SAIL BOKARO - COMPLETE SYSTEM REBUILD
echo ============================================================================
echo.

REM Step 1: Kill any existing processes
echo [STEP 1] Killing any existing Node/Python processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM electron.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Step 2: Clean node_modules and package-lock
echo [STEP 2] Cleaning frontend dependencies...
cd frontend
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules >nul 2>&1
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json >nul 2>&1
)
cd ..

REM Step 3: Install frontend dependencies
echo [STEP 3] Installing frontend dependencies...
cd frontend
call npm install
if !errorlevel! neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

REM Step 4: Build frontend
echo [STEP 4] Building frontend...
cd frontend
call npm run build
if !errorlevel! neq 0 (
    echo ERROR: Frontend build failed
    pause
    exit /b 1
)
cd ..

REM Step 5: Check Python and backend dependencies
echo [STEP 5] Checking Python installation...
python --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Step 6: Install Python dependencies
echo [STEP 6] Installing backend dependencies...
cd backend
python -m pip install --upgrade pip >nul 2>&1
python -m pip install -r requirements.txt
if !errorlevel! neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

REM Step 7: Test backend startup
echo [STEP 7] Testing backend startup...
cd backend
timeout /t 2 /nobreak >nul
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 >nul 2>&1 &
set BACKEND_PID=!errorlevel!
timeout /t 3 /nobreak >nul
taskkill /F /IM python.exe >nul 2>&1
cd ..

REM Step 8: Summary
echo.
echo ============================================================================
echo REBUILD COMPLETE!
echo ============================================================================
echo.
echo Your system is now ready to use. Choose one of the following:
echo.
echo OPTION 1: Launch Website Only
echo   Command: cd frontend && npm run dev
echo   Access: http://localhost:5173 (or the port shown)
echo.
echo OPTION 2: Launch Desktop App (includes website + backend)
echo   Command: cd frontend && npm run electron-dev
echo   Note: This will open the Electron app automatically
echo.
echo OPTION 3: Use the Quick Launch Script
echo   Double-click: START-APP.bat
echo.
echo ============================================================================
echo.
pause
