#!/bin/bash

# ============================================================================
# SAIL Bokaro - CSV to PostgreSQL Bulk Loader
# Loads synthetic CSVs into PostgreSQL database
# ============================================================================

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-sihdb}"
DB_USER="${DB_USER:-postgres}"
CSV_DIR="${CSV_DIR:-../ml/synthetic/raw}"

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

# Check if psql is available
if ! command -v psql &> /dev/null; then
  print_error "psql not found. Please install PostgreSQL client."
  exit 1
fi

# Check if CSV directory exists
if [ ! -d "$CSV_DIR" ]; then
  print_error "CSV directory not found: $CSV_DIR"
  exit 1
fi

print_info "Loading CSVs from: $CSV_DIR"
print_info "Database: $DB_NAME on $DB_HOST:$DB_PORT"
echo ""

# Function to load CSV into table
load_csv() {
  local table=$1
  local csv_file=$2

  if [ ! -f "$csv_file" ]; then
    print_error "CSV file not found: $csv_file"
    return 1
  fi

  print_info "Loading $table from $csv_file..."

  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF
\copy $table FROM '$csv_file' WITH (FORMAT csv, HEADER true, DELIMITER ',', NULL 'NULL');
EOF

  if [ $? -eq 0 ]; then
    print_status "$table loaded successfully"
  else
    print_error "Failed to load $table"
    return 1
  fi
}

# Load all tables
echo "=========================================="
echo "Loading Tables"
echo "=========================================="

load_csv "orders" "$CSV_DIR/orders.csv"
load_csv "inventory" "$CSV_DIR/inventory.csv"
load_csv "rake_arrivals" "$CSV_DIR/rake_arrivals.csv"
load_csv "lp_throughput" "$CSV_DIR/lp_throughput.csv"
load_csv "route_congestion" "$CSV_DIR/route_congestion.csv"
load_csv "truck_transport" "$CSV_DIR/truck_transport.csv"
load_csv "material_production" "$CSV_DIR/material_production.csv"

echo ""
echo "=========================================="
echo "Refreshing Materialized Views"
echo "=========================================="

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_latest_inventory;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_forecast_summary;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_lp_daily_stats;
EOF

if [ $? -eq 0 ]; then
  print_status "Materialized views refreshed"
else
  print_error "Failed to refresh materialized views"
fi

echo ""
echo "=========================================="
echo "Load Complete"
echo "=========================================="

# Print summary
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF
SELECT 'orders' as table_name, COUNT(*) as row_count FROM orders
UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'rake_arrivals', COUNT(*) FROM rake_arrivals
UNION ALL
SELECT 'lp_throughput', COUNT(*) FROM lp_throughput
UNION ALL
SELECT 'route_congestion', COUNT(*) FROM route_congestion
UNION ALL
SELECT 'truck_transport', COUNT(*) FROM truck_transport
UNION ALL
SELECT 'material_production', COUNT(*) FROM material_production
ORDER BY table_name;
EOF

print_status "All data loaded successfully!"
