#!/bin/bash

# Build script for all platforms
# Usage: ./build-all-platforms.sh [win|mac|linux|all]

set -e

PLATFORM=${1:-all}
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

echo "=========================================="
echo "SAIL Bokaro - Multi-Platform Build"
echo "=========================================="
echo "Platform: $PLATFORM"
echo "Project: $PROJECT_ROOT"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
  echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
  echo -e "${RED}[✗]${NC} $1"
}

print_info() {
  echo -e "${YELLOW}[i]${NC} $1"
}

# Build frontend
build_frontend() {
  print_info "Building frontend..."
  cd "$PROJECT_ROOT/frontend"
  npm run build
  print_status "Frontend built"
}

# Build backend
build_backend() {
  print_info "Building backend..."
  cd "$PROJECT_ROOT/electron"
  node scripts/build-backend.js
  print_status "Backend built"
}

# Build for Windows
build_windows() {
  print_info "Building for Windows..."
  cd "$PROJECT_ROOT/electron"
  npm run dist:win
  print_status "Windows build complete"
}

# Build for macOS
build_macos() {
  print_info "Building for macOS..."
  cd "$PROJECT_ROOT/electron"
  npm run dist:mac
  print_status "macOS build complete"
}

# Build for Linux
build_linux() {
  print_info "Building for Linux..."
  cd "$PROJECT_ROOT/electron"
  npm run dist:linux
  print_status "Linux build complete"
}

# Main build process
case $PLATFORM in
  win)
    build_frontend
    build_backend
    build_windows
    ;;
  mac)
    build_frontend
    build_backend
    build_macos
    ;;
  linux)
    build_frontend
    build_backend
    build_linux
    ;;
  all)
    build_frontend
    build_backend
    print_info "Building for all platforms..."
    cd "$PROJECT_ROOT/electron"
    npm run dist:all
    print_status "All platforms built"
    ;;
  *)
    print_error "Unknown platform: $PLATFORM"
    echo "Usage: $0 [win|mac|linux|all]"
    exit 1
    ;;
esac

echo ""
print_status "Build complete!"
echo "Installers: $PROJECT_ROOT/release/installers/"
