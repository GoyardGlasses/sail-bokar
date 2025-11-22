#!/bin/bash

# Production startup script for SAIL Bokaro API
# SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System

set -e

echo "================================"
echo "SAIL Bokaro Logistics API"
echo "Starting Production Server"
echo "================================"

# Load environment variables from .env if it exists
if [ -f ".env" ]; then
    echo "Loading environment from .env..."
    export $(cat .env | grep -v '#' | xargs)
fi

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

# Start the server
echo ""
echo "Starting FastAPI server..."
echo "API will be available at: http://localhost:8000"
echo "Documentation at: http://localhost:8000/docs"
echo ""

# Use gunicorn for production (if available)
if command -v gunicorn &> /dev/null; then
    echo "Starting with gunicorn..."
    gunicorn app.main:app \
        --workers 4 \
        --worker-class uvicorn.workers.UvicornWorker \
        --bind 0.0.0.0:8000 \
        --access-logfile - \
        --error-logfile -
else
    echo "Starting with uvicorn..."
    uvicorn app.main:app \
        --host 0.0.0.0 \
        --port 8000 \
        --log-level info
fi
