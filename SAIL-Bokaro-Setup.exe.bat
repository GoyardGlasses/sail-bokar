@echo off
REM ============================================================================
REM SAIL BOKARO LOGISTICS OPTIMIZATION SYSTEM - COMPLETE SETUP & LAUNCHER
REM ============================================================================
REM This is a complete system application that installs and runs everything
REM ============================================================================

setlocal enabledelayedexpansion

REM Set colors and styling
color 0A
title SAIL Bokaro - Complete System Application

REM Clear screen
cls

REM Display banner
echo.
echo ============================================================================
echo.
echo   ███████╗ █████╗ ██╗██╗         ██████╗  ██████╗ ██╗  ██╗ █████╗ ██████╗ 
echo   ██╔════╝██╔══██╗██║██║         ██╔══██╗██╔═══██╗██║ ██╔╝██╔══██╗██╔══██╗
echo   ███████╗███████║██║██║         ██████╔╝██║   ██║█████╔╝ ███████║██████╔╝
echo   ╚════██║██╔══██║██║██║         ██╔══██╗██║   ██║██╔═██╗ ██╔══██║██╔══██╗
echo   ███████║██║  ██║██║███████╗    ██████╔╝╚██████╔╝██║  ██╗██║  ██║██║  ██║
echo   ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝    ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
echo.
echo   Logistics Optimization System v1.0.0
echo   Complete System Application
echo.
echo ============================================================================
echo.

REM Get the project directory
set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo [*] Project Directory: %PROJECT_DIR%
echo.

REM ============================================================================
REM STEP 1: CHECK PREREQUISITES
REM ============================================================================
echo [STEP 1] Checking Prerequisites...
echo.

REM Check Node.js
echo Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js found: %NODE_VERSION%

REM Check Python
echo Checking Python...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed!
    echo Please install Python from: https://www.python.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo [OK] Python found: %PYTHON_VERSION%

echo.
echo [OK] All prerequisites met!
echo.

REM ============================================================================
REM STEP 2: INSTALL DEPENDENCIES
REM ============================================================================
echo [STEP 2] Installing Dependencies...
echo.

REM Check and install frontend dependencies
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Frontend dependencies installed
) else (
    echo [OK] Frontend dependencies already installed
)

echo.

REM Check and install backend dependencies
echo Checking backend dependencies...
python -c "import fastapi" >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing backend dependencies...
    cd backend
    call pip install -r requirements.txt --quiet
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install backend dependencies
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Backend dependencies installed
) else (
    echo [OK] Backend dependencies already installed
)

echo.

REM ============================================================================
REM STEP 3: START BACKEND SERVER
REM ============================================================================
echo [STEP 3] Starting Backend Server...
echo.

cd backend
echo Starting FastAPI server on http://127.0.0.1:8000...
start "SAIL Bokaro Backend" cmd /k "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

REM Wait for backend to start
echo Waiting for backend to start...
timeout /t 3 /nobreak

cd ..

echo [OK] Backend server started
echo.

REM ============================================================================
REM STEP 4: START FRONTEND APPLICATION
REM ============================================================================
echo [STEP 4] Starting Frontend Application...
echo.

cd frontend

REM Check if Vite dev server is already running
netstat -ano | findstr ":5173" >nul 2>nul
if %errorlevel% neq 0 (
    echo Starting Vite development server...
    start "SAIL Bokaro Frontend" cmd /k "npm run dev"
    echo Waiting for frontend to start...
    timeout /t 5 /nobreak
) else (
    echo [OK] Frontend already running on port 5173
)

cd ..

echo [OK] Frontend started
echo.

REM ============================================================================
REM STEP 5: LAUNCH ELECTRON APPLICATION
REM ============================================================================
echo [STEP 5] Launching Desktop Application...
echo.

cd frontend
echo Launching Electron application...
timeout /t 2 /nobreak

REM Try to run electron-dev
call npm run electron-dev

cd ..

REM ============================================================================
REM CLEANUP
REM ============================================================================
echo.
echo [*] Application closed
echo.
echo Cleaning up...

REM Kill any remaining processes
taskkill /F /IM python.exe >nul 2>nul
taskkill /F /IM node.exe >nul 2>nul

echo [OK] Cleanup complete
echo.
echo Thank you for using SAIL Bokaro!
echo.

pause
