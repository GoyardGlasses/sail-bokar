#!/bin/bash

# Local development startup script
# SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System

set -e

echo "================================"
echo "SAIL Bokaro Logistics API"
echo "Starting Development Server"
echo "================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -q -r requirements.txt

# Create logs directory
mkdir -p logs/optimize_runs

# Start the server with auto-reload
echo ""
echo "Starting FastAPI development server..."
echo "API will be available at: http://localhost:8000"
echo "Documentation at: http://localhost:8000/docs"
echo "Press Ctrl+C to stop"
echo ""

uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --reload \
    --log-level debug
