@echo off
REM SAIL Bokaro - Local Development Startup Script
REM This script starts both backend and frontend for local development

echo.
echo ========================================
echo SAIL Bokaro - Local Development Setup
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

REM Activate venv
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing backend dependencies...
pip install -q -r requirements.txt

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
    echo Backend .env created successfully
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
call npm install -q

REM Create .env if it doesn't exist
if not exist .env (
    echo Creating frontend .env file...
    (
        echo VITE_API_URL=http://localhost:8000
        echo VITE_DEMO_MODE=false
        echo VITE_ADMIN_TOKEN=sail-bokaro-admin-token-secret
    ) > .env
    echo Frontend .env created successfully
)

cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo.
echo 1. Open Terminal 1 and run:
echo    cd backend
echo    venv\Scripts\activate
echo    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
echo.
echo 2. Open Terminal 2 and run:
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open browser:
echo    Frontend: http://localhost:5173
echo    Backend API Docs: http://localhost:8000/api/docs
echo.
echo For more details, see LOCAL_SETUP_GUIDE.md
echo.
pause
