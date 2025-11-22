# SAIL Bokaro - PostgreSQL + TimescaleDB Setup Guide

**SIH25208 - Smart India Hackathon 2025**

---

## 📋 Overview

This guide covers setting up PostgreSQL + TimescaleDB for the SAIL Bokaro Logistics Optimization System.

### Architecture

```
┌─────────────────────────────────────┐
│   FastAPI Backend (Python)          │
│   - SQLAlchemy ORM                  │
│   - Connection pooling              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   PostgreSQL 14+ + TimescaleDB      │
│   - 8 main tables                   │
│   - 3 materialized views            │
│   - Time-series hypertables         │
└─────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Start PostgreSQL + TimescaleDB
docker-compose up -d

# Wait for database to be ready
sleep 10

# Load schema
docker exec sail-bokaro-postgres psql -U postgres -d sihdb -f /docker-entrypoint-initdb.d/01-schema.sql

# Load sample data
python scripts/csv_to_postgres.py
```

### Option 2: Local Installation

```bash
# Install PostgreSQL 14+
# macOS: brew install postgresql@14
# Ubuntu: sudo apt-get install postgresql-14
# Windows: Download from https://www.postgresql.org/download/windows/

# Install TimescaleDB
# Follow: https://docs.timescale.com/install/latest/

# Create database
createdb -U postgres sihdb

# Enable extension
psql -U postgres -d sihdb -c "CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"

# Load schema
psql -U postgres -d sihdb -f backend/db/schema.sql

# Load data
python scripts/csv_to_postgres.py
```

---

## 📊 Database Schema

### Tables

#### 1. orders
- **Purpose:** Store customer orders
- **Key Fields:** order_id, material_type, quantity_tonnes, destination, priority
- **Indexes:** destination, order_date, status, material_type

#### 2. inventory
- **Purpose:** Track material stock levels
- **Key Fields:** stockyard, material_type, quantity_tonnes, safety_stock_tonnes
- **Indexes:** stockyard, material_type, as_of
- **Unique:** (stockyard, material_type, as_of)

#### 3. rake_arrivals (Time-Series)
- **Purpose:** Track rake arrivals at yards
- **Key Fields:** rake_id, yard, arrival_time, wagons_count, capacity_tonnes
- **Hypertable:** Yes (partitioned by arrival_time)
- **Indexes:** yard, arrival_time

#### 4. lp_throughput (Time-Series)
- **Purpose:** Track loading point throughput
- **Key Fields:** loading_point, ts, throughput_tonnes, utilization_percent
- **Hypertable:** Yes (partitioned by ts)
- **Indexes:** loading_point, ts

#### 5. route_congestion
- **Purpose:** Store route congestion data
- **Key Fields:** route_id, date, congestion_level, avg_delay_hours
- **Indexes:** route_id, date

#### 6. dispatch_history
- **Purpose:** Track dispatch decisions
- **Key Fields:** dispatch_id, dispatch_date, rake_id, truck_id, order_id
- **Indexes:** dispatch_date, rake_id, truck_id, status

#### 7. truck_transport
- **Purpose:** Track truck transport assignments
- **Key Fields:** truck_id, transport_date, destination, tonnes_loaded
- **Indexes:** transport_date, destination

#### 8. material_production
- **Purpose:** Track material production
- **Key Fields:** production_id, production_date, material_type, quantity_tonnes
- **Indexes:** production_date, material_type, loading_point

### Materialized Views

#### mv_latest_inventory
- **Purpose:** Get latest inventory per stockyard + material
- **Columns:** stockyard, material_type, quantity_tonnes, available_tonnes, stock_status
- **Refresh:** Periodically or on-demand

#### mv_daily_forecast_summary
- **Purpose:** Aggregate daily demand by destination + material
- **Columns:** order_date, destination, material_type, total_demand_tonnes, order_count
- **Refresh:** Daily

#### mv_lp_daily_stats
- **Purpose:** Daily loading point statistics
- **Columns:** loading_point, stat_date, avg_throughput_tonnes, avg_utilization_percent
- **Refresh:** Daily

---

## 🔧 Setup Instructions

### Step 1: Install PostgreSQL + TimescaleDB

**macOS:**
```bash
brew install postgresql@14
brew install timescaledb

# Start service
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql-14 postgresql-14-timescaledb

# Start service
sudo systemctl start postgresql
```

**Windows:**
1. Download PostgreSQL 14 from https://www.postgresql.org/download/windows/
2. Run installer
3. Download TimescaleDB from https://docs.timescale.com/install/latest/windows/
4. Run installer

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sihdb;

# Connect to new database
\c sihdb

# Enable TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

# Exit
\q
```

### Step 3: Load Schema

```bash
# Load schema from file
psql -U postgres -d sihdb -f backend/db/schema.sql

# Verify tables
psql -U postgres -d sihdb -c "\dt"
```

### Step 4: Load Sample Data

```bash
# Using Python script
python scripts/csv_to_postgres.py

# Or using bash script
bash backend/db/load_csv.sh
```

---

## 📝 Configuration

### Environment Variables

Create `.env` file in project root:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/sihdb
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
USE_CSV_MODE=false

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=false
```

### Docker Environment

```bash
# In docker-compose.yml
environment:
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  POSTGRES_DB: sihdb
  POSTGRES_INITDB_ARGS: "-c shared_preload_libraries=timescaledb"
```

---

## 🔄 Data Loading

### Method 1: Python Script (Recommended)

```bash
# Install dependencies
pip install pandas sqlalchemy psycopg2-binary

# Run loader
python scripts/csv_to_postgres.py
```

**Features:**
- Auto-detects CSV files
- Type conversion
- Error handling
- Progress logging
- Materialized view refresh

### Method 2: Bash Script

```bash
# Set environment
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=sihdb
export DB_USER=postgres
export CSV_DIR=backend/ml/synthetic/raw

# Run loader
bash backend/db/load_csv.sh
```

### Method 3: Manual SQL

```bash
# Connect to database
psql -U postgres -d sihdb

# Load orders
\copy orders FROM 'backend/ml/synthetic/raw/orders.csv' WITH (FORMAT csv, HEADER true);

# Load other tables similarly
\copy inventory FROM 'backend/ml/synthetic/raw/inventory.csv' WITH (FORMAT csv, HEADER true);
# ... etc
```

---

## 🧪 Verification

### Check Database Connection

```bash
# From Python
python -c "from backend.app.db import test_connection; test_connection()"

# From psql
psql -U postgres -d sihdb -c "SELECT 1"
```

### Check Tables

```bash
psql -U postgres -d sihdb -c "
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
"
```

### Check Data

```bash
psql -U postgres -d sihdb -c "
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
SELECT 'dispatch_history', COUNT(*) FROM dispatch_history
UNION ALL
SELECT 'truck_transport', COUNT(*) FROM truck_transport
UNION ALL
SELECT 'material_production', COUNT(*) FROM material_production
ORDER BY table_name;
"
```

### Check Materialized Views

```bash
psql -U postgres -d sihdb -c "
SELECT * FROM mv_latest_inventory LIMIT 5;
SELECT * FROM mv_daily_forecast_summary LIMIT 5;
SELECT * FROM mv_lp_daily_stats LIMIT 5;
"
```

---

## 🔍 Query Examples

### Get Orders by Destination

```python
from backend.app.db import get_orders_by_destination

orders = get_orders_by_destination('Kolkata', status='PENDING')
for order in orders:
    print(f"{order['order_id']}: {order['quantity_tonnes']} tonnes")
```

### Get Latest Inventory

```python
from backend.app.db import get_latest_inventory

inventory = get_latest_inventory('Bokaro')
for item in inventory:
    print(f"{item['material_type']}: {item['available_tonnes']} tonnes")
```

### Get LP Throughput

```python
from backend.app.db import get_lp_throughput

throughput = get_lp_throughput('LP1', hours=24)
for record in throughput:
    print(f"{record['ts']}: {record['throughput_tonnes']} tonnes")
```

---

## 🔧 Maintenance

### Refresh Materialized Views

```bash
# Refresh all views
psql -U postgres -d sihdb -c "
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_latest_inventory;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_forecast_summary;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_lp_daily_stats;
"
```

### Analyze Tables

```bash
psql -U postgres -d sihdb -c "ANALYZE;"
```

### Vacuum Database

```bash
psql -U postgres -d sihdb -c "VACUUM ANALYZE;"
```

### Backup Database

```bash
# Full backup
pg_dump -U postgres -d sihdb > backup.sql

# Restore
psql -U postgres -d sihdb < backup.sql
```

---

## 🐛 Troubleshooting

### Connection Refused

```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT 1"

# If not, start service
# macOS: brew services start postgresql@14
# Ubuntu: sudo systemctl start postgresql
```

### Extension Not Found

```bash
# Enable TimescaleDB
psql -U postgres -d sihdb -c "CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"
```

### Permission Denied

```bash
# Check user permissions
psql -U postgres -d sihdb -c "
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name='orders';
"
```

### Slow Queries

```bash
# Enable query logging
psql -U postgres -d sihdb -c "
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
"
```

---

## 📊 Performance Tips

1. **Indexes:** Already created on all key columns
2. **Hypertables:** rake_arrivals and lp_throughput are time-series optimized
3. **Materialized Views:** Pre-computed for common queries
4. **Connection Pooling:** Configured in SQLAlchemy
5. **Batch Inserts:** Use bulk_insert_mappings for large datasets

---

## 🔐 Security

### Create App User

```bash
psql -U postgres -d sihdb -c "
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_user;
GRANT INSERT, UPDATE ON orders, dispatch_history TO app_user;
"
```

### Update Connection String

```bash
DATABASE_URL=postgresql://app_user:secure_password@localhost:5432/sihdb
```

---

**Database setup complete! Ready for Phase 5.**

