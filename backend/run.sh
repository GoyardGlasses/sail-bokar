#!/bin/bash

# FastAPI Backend Startup Script
# SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System

echo "================================"
echo "SAIL Bokaro Logistics API"
echo "================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Check if virtual environment exists
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

# Start the server
echo "Starting FastAPI server..."
echo "API will be available at: http://localhost:8000"
echo "Documentation at: http://localhost:8000/api/docs"
echo ""

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
