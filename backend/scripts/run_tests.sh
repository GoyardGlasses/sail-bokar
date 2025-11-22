#!/bin/bash

# Test runner script for SAIL Bokaro API
# SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System

set -e

echo "================================"
echo "SAIL Bokaro API - Test Suite"
echo "================================"
echo ""

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

# Run unit tests
echo ""
echo "Running unit tests..."
pytest tests/unit/ -v --tb=short

# Run integration tests
echo ""
echo "Running integration tests..."
pytest tests/integration/ -v --tb=short

# Run all tests with coverage
echo ""
echo "Running all tests with coverage..."
pytest tests/ -v --cov=app --cov-report=html --cov-report=term-missing

echo ""
echo "================================"
echo "Test suite complete!"
echo "Coverage report: htmlcov/index.html"
echo "================================"
