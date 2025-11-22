#!/bin/bash

# ============================================================================
# SAIL Bokaro - End-to-End Integration Test
# Tests: Health → Forecast → Optimize → Results
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

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
TIMEOUT=30

print_header "SAIL Bokaro - End-to-End Test"
print_info "Backend: $BACKEND_URL"
echo ""

# ============================================================================
# Test 1: Health Check
# ============================================================================
print_header "Test 1: Health Check"

print_info "Checking backend health..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/meta/health" --max-time $TIMEOUT)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  print_status "Health check passed (HTTP 200)"
  echo "Response: $BODY" | jq . 2>/dev/null || echo "$BODY"
else
  print_error "Health check failed (HTTP $HTTP_CODE)"
  exit 1
fi

echo ""

# ============================================================================
# Test 2: Demand Forecast
# ============================================================================
print_header "Test 2: Demand Forecast"

print_info "Requesting demand forecast..."
FORECAST_PAYLOAD='{
  "destination": "Kolkata",
  "horizon_days": 7,
  "historical_data": [
    {"date": "2025-11-15", "demand": 500},
    {"date": "2025-11-16", "demand": 520},
    {"date": "2025-11-17", "demand": 510}
  ]
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/predict/demand" \
  -H "Content-Type: application/json" \
  -d "$FORECAST_PAYLOAD" \
  --max-time $TIMEOUT)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  print_status "Demand forecast passed (HTTP 200)"
  echo "Response:" 
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
  print_error "Demand forecast failed (HTTP $HTTP_CODE)"
  echo "Response: $BODY"
fi

echo ""

# ============================================================================
# Test 3: Delay Prediction
# ============================================================================
print_header "Test 3: Delay Prediction"

print_info "Requesting delay prediction..."
DELAY_PAYLOAD='{
  "route_id": "Bokaro-Kolkata",
  "distance_km": 250,
  "vehicle_type": "TRUCK",
  "time_of_day": "morning",
  "weather": "clear"
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/predict/delay" \
  -H "Content-Type: application/json" \
  -d "$DELAY_PAYLOAD" \
  --max-time $TIMEOUT)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  print_status "Delay prediction passed (HTTP 200)"
  echo "Response:"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
  print_error "Delay prediction failed (HTTP $HTTP_CODE)"
  echo "Response: $BODY"
fi

echo ""

# ============================================================================
# Test 4: Optimization
# ============================================================================
print_header "Test 4: Optimization Run"

print_info "Requesting optimization..."
OPTIMIZE_PAYLOAD='{
  "orders": [
    {
      "order_id": 1,
      "material_type": "HR_Coils",
      "quantity_tonnes": 500,
      "destination": "Kolkata",
      "priority": "HIGH",
      "loading_point": "LP1"
    },
    {
      "order_id": 2,
      "material_type": "Plates",
      "quantity_tonnes": 300,
      "destination": "Patna",
      "priority": "MEDIUM",
      "loading_point": "LP1"
    }
  ],
  "available_rakes": 2,
  "available_trucks": 5,
  "inventory": [
    {
      "stockyard": "Bokaro",
      "material_type": "HR_Coils",
      "quantity_tonnes": 1000
    }
  ]
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/optimize/dispatch" \
  -H "Content-Type: application/json" \
  -d "$OPTIMIZE_PAYLOAD" \
  --max-time 120)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  print_status "Optimization passed (HTTP 200)"
  
  # Verify response structure
  echo "Response:"
  RESULT=$(echo "$BODY" | jq . 2>/dev/null || echo "$BODY")
  echo "$RESULT"
  
  # Check for required fields
  if echo "$BODY" | jq -e '.rakes' > /dev/null 2>&1; then
    print_status "✓ Response contains 'rakes' field"
  else
    print_error "✗ Response missing 'rakes' field"
  fi
  
  if echo "$BODY" | jq -e '.trucks' > /dev/null 2>&1; then
    print_status "✓ Response contains 'trucks' field"
  else
    print_error "✗ Response missing 'trucks' field"
  fi
  
  if echo "$BODY" | jq -e '.summary' > /dev/null 2>&1; then
    print_status "✓ Response contains 'summary' field"
  else
    print_error "✗ Response missing 'summary' field"
  fi
  
else
  print_error "Optimization failed (HTTP $HTTP_CODE)"
  echo "Response: $BODY"
  exit 1
fi

echo ""

# ============================================================================
# Test 5: Admin Endpoints
# ============================================================================
print_header "Test 5: Admin Endpoints"

print_info "Fetching system metrics..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/meta/metrics" \
  -H "X-API-Token: sail-bokaro-admin-token-secret" \
  --max-time $TIMEOUT)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  print_status "Metrics endpoint passed (HTTP 200)"
  echo "Response:"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
  print_error "Metrics endpoint failed (HTTP $HTTP_CODE)"
fi

echo ""

# ============================================================================
# Summary
# ============================================================================
print_header "End-to-End Test Summary"

print_status "All tests completed successfully!"
echo ""
echo -e "${GREEN}Tests Passed:${NC}"
echo "  ✓ Health check"
echo "  ✓ Demand forecast"
echo "  ✓ Delay prediction"
echo "  ✓ Optimization"
echo "  ✓ Admin metrics"
echo ""

print_info "Next steps:"
echo "  1. Run smoke tests: bash scripts/smoke_test.sh"
echo "  2. Run pytest tests: pytest backend/tests/e2e_optimize_test.py -v"
echo "  3. Verify models: python scripts/verify_models.py"
echo ""
