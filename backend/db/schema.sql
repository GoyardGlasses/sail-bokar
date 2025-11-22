-- ============================================================================
-- SAIL Bokaro Logistics Optimization System - PostgreSQL Schema
-- SIH25208 - Smart India Hackathon 2025
-- ============================================================================

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    order_date DATE NOT NULL,
    material_type VARCHAR(50) NOT NULL,
    quantity_tonnes DECIMAL(10, 2) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    loading_point VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_destination ON orders(destination);
CREATE INDEX idx_orders_order_date ON orders(order_date DESC);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_material_type ON orders(material_type);

-- ============================================================================
-- INVENTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventory (
    inventory_id SERIAL PRIMARY KEY,
    stockyard VARCHAR(50) NOT NULL,
    material_type VARCHAR(50) NOT NULL,
    quantity_tonnes DECIMAL(10, 2) NOT NULL,
    safety_stock_tonnes DECIMAL(10, 2) NOT NULL DEFAULT 0,
    as_of DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_stockyard ON inventory(stockyard);
CREATE INDEX idx_inventory_material_type ON inventory(material_type);
CREATE INDEX idx_inventory_as_of ON inventory(as_of DESC);
CREATE UNIQUE INDEX idx_inventory_unique ON inventory(stockyard, material_type, as_of);

-- ============================================================================
-- RAKE_ARRIVALS TABLE (Time-Series)
-- ============================================================================
CREATE TABLE IF NOT EXISTS rake_arrivals (
    rake_id VARCHAR(50) NOT NULL,
    yard VARCHAR(50) NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    wagons_count INT NOT NULL,
    capacity_tonnes DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ARRIVED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (rake_id, arrival_time)
);

CREATE INDEX idx_rake_arrivals_yard ON rake_arrivals(yard);
CREATE INDEX idx_rake_arrivals_arrival_time ON rake_arrivals(arrival_time DESC);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable(
    'rake_arrivals',
    'arrival_time',
    if_not_exists => TRUE
);

-- ============================================================================
-- LP_THROUGHPUT TABLE (Time-Series)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lp_throughput (
    loading_point VARCHAR(50) NOT NULL,
    ts TIMESTAMP NOT NULL,
    throughput_tonnes DECIMAL(10, 2) NOT NULL,
    utilization_percent DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (loading_point, ts)
);

CREATE INDEX idx_lp_throughput_loading_point ON lp_throughput(loading_point);
CREATE INDEX idx_lp_throughput_ts ON lp_throughput(ts DESC);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable(
    'lp_throughput',
    'ts',
    if_not_exists => TRUE
);

-- ============================================================================
-- ROUTE_CONGESTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS route_congestion (
    route_id VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    congestion_level VARCHAR(20) NOT NULL,
    avg_delay_hours DECIMAL(5, 2) NOT NULL,
    traffic_factor DECIMAL(3, 2) NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (route_id, date)
);

CREATE INDEX idx_route_congestion_route_id ON route_congestion(route_id);
CREATE INDEX idx_route_congestion_date ON route_congestion(date DESC);

-- ============================================================================
-- DISPATCH_HISTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS dispatch_history (
    dispatch_id SERIAL PRIMARY KEY,
    dispatch_date DATE NOT NULL,
    rake_id VARCHAR(50),
    truck_id VARCHAR(50),
    order_id INT REFERENCES orders(order_id),
    destination VARCHAR(100) NOT NULL,
    tonnes_dispatched DECIMAL(10, 2) NOT NULL,
    estimated_cost DECIMAL(12, 2) NOT NULL,
    estimated_delay_hours DECIMAL(5, 2),
    transport_mode VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dispatch_history_dispatch_date ON dispatch_history(dispatch_date DESC);
CREATE INDEX idx_dispatch_history_rake_id ON dispatch_history(rake_id);
CREATE INDEX idx_dispatch_history_truck_id ON dispatch_history(truck_id);
CREATE INDEX idx_dispatch_history_status ON dispatch_history(status);

-- ============================================================================
-- TRUCK_TRANSPORT TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS truck_transport (
    truck_id VARCHAR(50) NOT NULL,
    transport_date DATE NOT NULL,
    destination VARCHAR(100) NOT NULL,
    tonnes_capacity DECIMAL(10, 2) NOT NULL,
    tonnes_loaded DECIMAL(10, 2) NOT NULL,
    estimated_cost DECIMAL(12, 2) NOT NULL,
    estimated_delay_hours DECIMAL(5, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (truck_id, transport_date)
);

CREATE INDEX idx_truck_transport_transport_date ON truck_transport(transport_date DESC);
CREATE INDEX idx_truck_transport_destination ON truck_transport(destination);

-- ============================================================================
-- MATERIAL_PRODUCTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS material_production (
    production_id SERIAL PRIMARY KEY,
    production_date DATE NOT NULL,
    material_type VARCHAR(50) NOT NULL,
    quantity_tonnes DECIMAL(10, 2) NOT NULL,
    loading_point VARCHAR(50) NOT NULL,
    quality_grade VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_material_production_production_date ON material_production(production_date DESC);
CREATE INDEX idx_material_production_material_type ON material_production(material_type);
CREATE INDEX idx_material_production_loading_point ON material_production(loading_point);

-- ============================================================================
-- MATERIALIZED VIEW: Latest Inventory
-- ============================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_latest_inventory AS
SELECT
    stockyard,
    material_type,
    quantity_tonnes,
    safety_stock_tonnes,
    (quantity_tonnes - safety_stock_tonnes) AS available_tonnes,
    as_of,
    CASE
        WHEN quantity_tonnes < safety_stock_tonnes THEN 'CRITICAL'
        WHEN quantity_tonnes < (safety_stock_tonnes * 1.5) THEN 'LOW'
        ELSE 'ADEQUATE'
    END AS stock_status
FROM inventory
WHERE as_of = (SELECT MAX(as_of) FROM inventory);

CREATE UNIQUE INDEX idx_mv_latest_inventory ON mv_latest_inventory(stockyard, material_type);

-- ============================================================================
-- MATERIALIZED VIEW: Daily Forecast Summary
-- ============================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_forecast_summary AS
SELECT
    order_date,
    destination,
    material_type,
    SUM(quantity_tonnes) AS total_demand_tonnes,
    COUNT(*) AS order_count,
    AVG(CASE WHEN priority = 'HIGH' THEN 1 ELSE 0 END) AS high_priority_ratio,
    MAX(order_date) AS latest_order_date
FROM orders
WHERE status IN ('PENDING', 'CONFIRMED')
GROUP BY order_date, destination, material_type;

CREATE INDEX idx_mv_daily_forecast_summary ON mv_daily_forecast_summary(order_date DESC, destination);

-- ============================================================================
-- MATERIALIZED VIEW: LP Daily Stats
-- ============================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_lp_daily_stats AS
SELECT
    loading_point,
    DATE(ts) AS stat_date,
    AVG(throughput_tonnes) AS avg_throughput_tonnes,
    MAX(throughput_tonnes) AS max_throughput_tonnes,
    MIN(throughput_tonnes) AS min_throughput_tonnes,
    AVG(utilization_percent) AS avg_utilization_percent,
    COUNT(*) AS measurement_count
FROM lp_throughput
GROUP BY loading_point, DATE(ts);

CREATE INDEX idx_mv_lp_daily_stats ON mv_lp_daily_stats(stat_date DESC, loading_point);

-- ============================================================================
-- REFRESH MATERIALIZED VIEWS
-- ============================================================================
-- Note: Run these periodically (e.g., via cron job or scheduled task)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_latest_inventory;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_forecast_summary;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_lp_daily_stats;

-- ============================================================================
-- GRANT PERMISSIONS (if needed)
-- ============================================================================
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT INSERT, UPDATE ON orders, dispatch_history TO app_user;
