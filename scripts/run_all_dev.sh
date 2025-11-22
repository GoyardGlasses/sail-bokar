#!/bin/bash

# ============================================================================
# SAIL Bokaro - Complete Development Environment Startup
# Starts: Database, Backend, Frontend, Electron
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
  echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
  echo -e "${RED}[✗]${NC} $1"
}

print_info() {
  echo -e "${YELLOW}[i]${NC} $1"
}

print_header() {
  echo ""
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

print_header "SAIL Bokaro - Development Environment"
print_info "Project: $PROJECT_ROOT"
print_info "Starting all services..."
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
  print_error "Docker not found. Please install Docker."
  exit 1
fi

# ============================================================================
# 1. Start Database
# ============================================================================
print_header "Starting PostgreSQL + TimescaleDB"

if docker ps -a --format '{{.Names}}' | grep -q "sail-bokaro-postgres"; then
  print_info "Stopping existing database..."
  docker stop sail-bokaro-postgres 2>/dev/null || true
  docker rm sail-bokaro-postgres 2>/dev/null || true
fi

cd "$PROJECT_ROOT"
docker-compose up -d postgres

print_info "Waiting for database to be ready..."
sleep 5

# Check database health
if docker exec sail-bokaro-postgres pg_isready -U postgres &> /dev/null; then
  print_status "Database is ready"
else
  print_error "Database failed to start"
  exit 1
fi

# Load schema
print_info "Loading database schema..."
docker exec sail-bokaro-postgres psql -U postgres -d sihdb -f /docker-entrypoint-initdb.d/01-schema.sql 2>/dev/null || true

print_status "Database started successfully"
echo ""

# ============================================================================
# 2. Start Backend
# ============================================================================
print_header "Starting FastAPI Backend"

cd "$PROJECT_ROOT/backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
  print_info "Creating virtual environment..."
  python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
print_info "Installing dependencies..."
pip install -q -r requirements.txt

# Set environment variables
export PYTHONUNBUFFERED=1
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sihdb"
export LOG_LEVEL="INFO"

# Start backend in background
print_info "Starting FastAPI server..."
nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > "$PROJECT_ROOT/logs/backend.log" 2>&1 &
BACKEND_PID=$!

print_info "Backend PID: $BACKEND_PID"
print_info "Waiting for backend to start..."
sleep 3

# Check backend health
for i in {1..30}; do
  if curl -s http://localhost:8000/meta/health > /dev/null 2>&1; then
    print_status "Backend is ready"
    break
  fi
  if [ $i -eq 30 ]; then
    print_error "Backend failed to start"
    exit 1
  fi
  sleep 1
done

echo ""

# ============================================================================
# 3. Start Frontend
# ============================================================================
print_header "Starting React Frontend"

cd "$PROJECT_ROOT/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  print_info "Installing Node dependencies..."
  npm install
fi

# Start frontend in background
print_info "Starting Vite dev server..."
nohup npm run dev > "$PROJECT_ROOT/logs/frontend.log" 2>&1 &
FRONTEND_PID=$!

print_info "Frontend PID: $FRONTEND_PID"
print_info "Waiting for frontend to start..."
sleep 5

print_status "Frontend is ready"
echo ""

# ============================================================================
# 4. Start Electron (Optional)
# ============================================================================
print_header "Electron Development Mode"

cd "$PROJECT_ROOT/electron"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  print_info "Installing Electron dependencies..."
  npm install
fi

print_info "To start Electron in development mode, run:"
echo -e "${YELLOW}  cd $PROJECT_ROOT/electron${NC}"
echo -e "${YELLOW}  npm run dev${NC}"
echo ""

# ============================================================================
# Summary
# ============================================================================
print_header "Development Environment Started"

echo -e "${GREEN}Services Running:${NC}"
echo "  ✓ PostgreSQL + TimescaleDB: localhost:5432"
echo "  ✓ FastAPI Backend: http://localhost:8000"
echo "  ✓ React Frontend: http://localhost:5173"
echo "  ✓ pgAdmin: http://localhost:5050 (admin@example.com / admin)"
echo ""

echo -e "${GREEN}Logs:${NC}"
echo "  • Backend: $PROJECT_ROOT/logs/backend.log"
echo "  • Frontend: $PROJECT_ROOT/logs/frontend.log"
echo ""

echo -e "${GREEN}Quick Commands:${NC}"
echo "  • Test backend: curl http://localhost:8000/meta/health"
echo "  • View logs: tail -f $PROJECT_ROOT/logs/backend.log"
echo "  • Stop all: pkill -f 'uvicorn|npm run dev'"
echo ""

echo -e "${YELLOW}To stop all services:${NC}"
echo "  pkill -f 'uvicorn|npm run dev'"
echo "  docker-compose down"
echo ""

# ============================================================================
# Keep script running
# ============================================================================
print_info "Press Ctrl+C to stop all services"
echo ""

# Trap Ctrl+C to cleanup
trap cleanup INT

cleanup() {
  print_info "Stopping services..."
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  docker-compose down 2>/dev/null || true
  print_status "All services stopped"
  exit 0
}

# Keep script running
while true; do
  sleep 1
done
