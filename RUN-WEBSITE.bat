@echo off
REM ============================================================================
REM SAIL BOKARO - WEBSITE LAUNCHER (SIMPLIFIED)
REM ============================================================================
REM This is the simplest way to launch the complete website
REM ============================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

color 0A
title SAIL Bokaro - Website

cls

echo.
echo ============================================================================
echo   SAIL BOKARO - WEBSITE LAUNCHER
echo ============================================================================
echo.

REM Kill any existing processes
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
timeout /t 1 /nobreak >nul

REM Check if dependencies are installed
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

if not exist "backend\venv" (
    echo Installing backend dependencies...
    cd backend
    python -m pip install -q -r requirements.txt
    cd ..
)

REM Start backend
echo.
echo Starting backend server...
cd backend
start /B python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
timeout /t 3 /nobreak >nul
cd ..

REM Start frontend
echo Starting frontend server...
echo.
echo ============================================================================
echo SYSTEM STARTED!
echo ============================================================================
echo.
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Opening browser in 5 seconds...
echo.
timeout /t 5 /nobreak >nul
start http://localhost:5173

cd frontend
call npm run dev
