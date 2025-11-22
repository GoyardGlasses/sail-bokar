#!/bin/bash

# ============================================================================
# SAIL Bokaro - Smoke Test
# Quick health → forecast → optimize test
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
TIMEOUT=30
TESTS_PASSED=0
TESTS_FAILED=0

echo ""
echo "=========================================="
echo "SAIL Bokaro - Smoke Test"
echo "=========================================="
echo ""

# ============================================================================
# Test 1: Health
# ============================================================================
print_info "Test 1/4: Health Check"

if curl -s "$BACKEND_URL/meta/health" --max-time $TIMEOUT > /dev/null 2>&1; then
  print_status "Health check passed"
  ((TESTS_PASSED++))
else
  print_error "Health check failed"
  ((TESTS_FAILED++))
  exit 1
fi

# ============================================================================
# Test 2: Forecast
# ============================================================================
print_info "Test 2/4: Demand Forecast"

FORECAST=$(curl -s -X POST "$BACKEND_URL/predict/demand" \
  -H "Content-Type: application/json" \
  -d '{"destination":"Kolkata","horizon_days":7,"historical_data":[{"date":"2025-11-15","demand":500}]}' \
  --max-time $TIMEOUT)

if echo "$FORECAST" | jq -e '.forecast' > /dev/null 2>&1; then
  print_status "Demand forecast passed"
  ((TESTS_PASSED++))
else
  print_error "Demand forecast failed"
  ((TESTS_FAILED++))
fi

# ============================================================================
# Test 3: Optimize
# ============================================================================
print_info "Test 3/4: Optimization"

OPTIMIZE=$(curl -s -X POST "$BACKEND_URL/optimize/dispatch" \
  -H "Content-Type: application/json" \
  -d '{
    "orders": [{"order_id":1,"material_type":"HR_Coils","quantity_tonnes":500,"destination":"Kolkata","priority":"HIGH","loading_point":"LP1"}],
    "available_rakes": 2,
    "available_trucks": 5,
    "inventory": [{"stockyard":"Bokaro","material_type":"HR_Coils","quantity_tonnes":1000}]
  }' \
  --max-time 120)

if echo "$OPTIMIZE" | jq -e '.rakes' > /dev/null 2>&1; then
  print_status "Optimization passed"
  ((TESTS_PASSED++))
else
  print_error "Optimization failed"
  ((TESTS_FAILED++))
fi

# ============================================================================
# Test 4: Metrics
# ============================================================================
print_info "Test 4/4: System Metrics"

METRICS=$(curl -s "$BACKEND_URL/meta/metrics" \
  -H "X-API-Token: sail-bokaro-admin-token-secret" \
  --max-time $TIMEOUT)

if echo "$METRICS" | jq -e '.uptime' > /dev/null 2>&1; then
  print_status "System metrics passed"
  ((TESTS_PASSED++))
else
  print_error "System metrics failed"
  ((TESTS_FAILED++))
fi

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "=========================================="
echo "Smoke Test Results"
echo "=========================================="
echo "Passed: $TESTS_PASSED/4"
echo "Failed: $TESTS_FAILED/4"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  print_status "All smoke tests passed!"
  exit 0
else
  print_error "Some tests failed"
  exit 1
fi
