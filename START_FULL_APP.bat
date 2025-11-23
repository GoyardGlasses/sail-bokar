@echo off
REM SAIL Bokaro - Full Application Startup (Backend + Frontend Together)
REM This script starts both backend and frontend in separate windows

setlocal enabledelayedexpansion

echo.
echo ========================================
echo SAIL Bokaro - Full Application Startup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo Python version:
python --version
echo.
echo Node.js version:
node --version
echo.

REM Setup Backend
echo ========================================
echo Setting up Backend...
echo ========================================

cd backend

REM Check if venv exists
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Install dependencies
echo Installing backend dependencies...
pip install -q -r requirements.txt >nul 2>&1

REM Create .env if it doesn't exist
if not exist .env (
    echo Creating backend .env file...
    (
        echo APP_NAME=SAIL Bokaro
        echo APP_VERSION=1.0.0
        echo DEBUG=true
        echo HOST=0.0.0.0
        echo PORT=8000
        echo CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
        echo LOG_LEVEL=INFO
        echo API_TIMEOUT=30
        echo SECRET_TOKEN=sail-bokaro-admin-token-secret
        echo USE_CSV_MODE=true
    ) > .env
)

cd ..

REM Setup Frontend
echo.
echo ========================================
echo Setting up Frontend...
echo ========================================

cd frontend

REM Install dependencies
echo Installing frontend dependencies...
call npm install -q >nul 2>&1

REM Create .env if it doesn't exist
if not exist .env (
    echo Creating frontend .env file...
    (
        echo VITE_API_URL=http://localhost:8000
        echo VITE_DEMO_MODE=false
        echo VITE_ADMIN_TOKEN=sail-bokaro-admin-token-secret
    ) > .env
)

cd ..

echo.
echo ========================================
echo Starting Application...
echo ========================================
echo.
echo Opening Backend in new window...
start "SAIL Bokaro Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak

echo Opening Frontend in new window...
start "SAIL Bokaro Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak

echo.
echo ========================================
echo Application Starting!
echo ========================================
echo.
echo Waiting for services to start...
echo.
timeout /t 5 /nobreak

echo.
echo ========================================
echo SERVICES RUNNING
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend API Docs: http://localhost:8000/api/docs
echo Health Check: http://localhost:8000/meta/health
echo.
echo The application should open automatically in your browser.
echo If not, open http://localhost:5173 manually.
echo.
echo To stop:
echo - Close the Backend window (Ctrl+C)
echo - Close the Frontend window (Ctrl+C)
echo.
echo ========================================
echo.

REM Open browser automatically
timeout /t 2 /nobreak
start http://localhost:5173

echo Application is running! Check the windows above.
echo.
pause
