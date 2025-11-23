#!/bin/bash

# SAIL Bokaro - Local Development Startup Script
# This script sets up both backend and frontend for local development

echo ""
echo "========================================"
echo "SAIL Bokaro - Local Development Setup"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.10+ from https://www.python.org/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "Python version:"
python3 --version
echo ""
echo "Node.js version:"
node --version
echo ""

# Setup Backend
echo "========================================"
echo "Setting up Backend..."
echo "========================================"
cd backend

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "Installing backend dependencies..."
pip install -q -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating backend .env file..."
    cat > .env << EOF
APP_NAME=SAIL Bokaro
APP_VERSION=1.0.0
DEBUG=true
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
LOG_LEVEL=INFO
API_TIMEOUT=30
SECRET_TOKEN=sail-bokaro-admin-token-secret
USE_CSV_MODE=true
EOF
    echo "Backend .env created successfully"
fi

cd ..

# Setup Frontend
echo ""
echo "========================================"
echo "Setting up Frontend..."
echo "========================================"
cd frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install -q

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cat > .env << EOF
VITE_API_URL=http://localhost:8000
VITE_DEMO_MODE=false
VITE_ADMIN_TOKEN=sail-bokaro-admin-token-secret
EOF
    echo "Frontend .env created successfully"
fi

cd ..

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "To start the application:"
echo ""
echo "1. Open Terminal 1 and run:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
echo ""
echo "2. Open Terminal 2 and run:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Open browser:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API Docs: http://localhost:8000/api/docs"
echo ""
echo "For more details, see LOCAL_SETUP_GUIDE.md"
echo ""
