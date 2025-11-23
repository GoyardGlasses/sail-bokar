@echo off
REM SAIL Bokaro - Complete Application Launcher
REM Starts Backend (Port 8000) and Frontend (Port 5173) together

echo.
echo ============================================
echo   SAIL Bokaro - Complete Application
echo ============================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Install Python 3.10+
    pause
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Install Node.js 18+
    pause
    exit /b 1
)

REM Setup Backend
echo [1/4] Setting up Backend...
cd backend
if not exist venv python -m venv venv
call venv\Scripts\activate.bat
pip install -q -r requirements.txt 2>nul

if not exist .env (
    (
        echo APP_NAME=SAIL Bokaro
        echo APP_VERSION=1.0.0
        echo DEBUG=true
        echo HOST=0.0.0.0
        echo PORT=8000
        echo CORS_ORIGINS=http://localhost:5173,http://localhost:3000
        echo LOG_LEVEL=INFO
        echo API_TIMEOUT=30
        echo SECRET_TOKEN=sail-bokaro-admin-token-secret
        echo USE_CSV_MODE=true
    ) > .env
)
cd ..

REM Setup Frontend
echo [2/4] Setting up Frontend...
cd frontend
call npm install -q 2>nul

if not exist .env (
    (
        echo VITE_API_URL=http://localhost:8000
        echo VITE_DEMO_MODE=false
        echo VITE_ADMIN_TOKEN=sail-bokaro-admin-token-secret
    ) > .env
)
cd ..

echo [3/4] Starting Backend (Port 8000)...
start "Backend - SAIL Bokaro" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak

echo [4/4] Starting Frontend (Port 5173)...
start "Frontend - SAIL Bokaro" cmd /k "cd frontend && npm run dev"

timeout /t 5 /nobreak

echo.
echo ============================================
echo   APPLICATION RUNNING
echo ============================================
echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:8000
echo API Docs:  http://localhost:8000/api/docs
echo Health:    http://localhost:8000/meta/health
echo.
echo Opening browser...
timeout /t 2 /nobreak
start http://localhost:5173

echo.
echo To stop: Close both windows (Ctrl+C in each)
echo.
pause
