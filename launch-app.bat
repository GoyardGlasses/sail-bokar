@echo off
REM SAIL Bokaro Logistics System - Application Launcher
REM This script starts the entire application (Backend + Frontend + Electron)

setlocal enabledelayedexpansion

echo.
echo ================================================================================
echo   SAIL BOKARO LOGISTICS OPTIMIZATION SYSTEM
echo   Application Launcher
echo ================================================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo [✓] Node.js found
echo [✓] Python found
echo.

REM Navigate to project directory
cd /d "%~dp0"

echo Starting SAIL Bokaro Application...
echo.

REM Check if node_modules exists in frontend
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo [✓] Frontend dependencies installed
    echo.
)

REM Check if Python dependencies are installed
echo Checking backend dependencies...
python -c "import fastapi" >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing backend dependencies...
    cd backend
    call pip install -r requirements.txt
    cd ..
    echo [✓] Backend dependencies installed
    echo.
)

REM Start the Electron app
echo Launching SAIL Bokaro Application...
echo.

cd frontend
call npm run electron-dev

pause
