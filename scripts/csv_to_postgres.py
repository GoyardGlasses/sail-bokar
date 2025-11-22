#!/usr/bin/env python3

"""
CSV to PostgreSQL Bulk Loader
Loads synthetic CSVs into PostgreSQL using pandas + SQLAlchemy
"""

import os
import sys
import pandas as pd
from pathlib import Path
from sqlalchemy import create_engine, text
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:postgres@localhost:5432/sihdb'
)
CSV_DIR = os.getenv(
    'CSV_DIR',
    os.path.join(os.path.dirname(__file__), '../backend/ml/synthetic/raw')
)

# Table configurations
TABLES = {
    'orders': {
        'file': 'orders.csv',
        'dtype': {
            'order_id': 'int32',
            'material_type': 'string',
            'quantity_tonnes': 'float64',
            'destination': 'string',
            'priority': 'string',
            'loading_point': 'string',
            'status': 'string',
        },
        'parse_dates': ['order_date'],
    },
    'inventory': {
        'file': 'inventory.csv',
        'dtype': {
            'inventory_id': 'int32',
            'stockyard': 'string',
            'material_type': 'string',
            'quantity_tonnes': 'float64',
            'safety_stock_tonnes': 'float64',
        },
        'parse_dates': ['as_of'],
    },
    'rake_arrivals': {
        'file': 'rake_arrivals.csv',
        'dtype': {
            'rake_id': 'string',
            'yard': 'string',
            'wagons_count': 'int32',
            'capacity_tonnes': 'float64',
            'status': 'string',
        },
        'parse_dates': ['arrival_time'],
    },
    'lp_throughput': {
        'file': 'lp_throughput.csv',
        'dtype': {
            'loading_point': 'string',
            'throughput_tonnes': 'float64',
            'utilization_percent': 'float64',
        },
        'parse_dates': ['ts'],
    },
    'route_congestion': {
        'file': 'route_congestion.csv',
        'dtype': {
            'route_id': 'string',
            'congestion_level': 'string',
            'avg_delay_hours': 'float64',
            'traffic_factor': 'float64',
        },
        'parse_dates': ['date'],
    },
    'truck_transport': {
        'file': 'truck_transport.csv',
        'dtype': {
            'truck_id': 'string',
            'destination': 'string',
            'tonnes_capacity': 'float64',
            'tonnes_loaded': 'float64',
            'estimated_cost': 'float64',
            'estimated_delay_hours': 'float64',
            'status': 'string',
        },
        'parse_dates': ['transport_date'],
    },
    'material_production': {
        'file': 'material_production.csv',
        'dtype': {
            'production_id': 'int32',
            'material_type': 'string',
            'quantity_tonnes': 'float64',
            'loading_point': 'string',
            'quality_grade': 'string',
        },
        'parse_dates': ['production_date'],
    },
}


def create_engine_safe():
    """Create SQLAlchemy engine with error handling"""
    try:
        logger.info(f"Connecting to database: {DATABASE_URL.split('@')[1]}")
        engine = create_engine(
            DATABASE_URL,
            echo=False,
            pool_size=10,
            max_overflow=20,
        )
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("✓ Database connection successful")
        return engine
    except Exception as e:
        logger.error(f"✗ Failed to connect to database: {e}")
        sys.exit(1)


def load_csv_to_table(engine, table_name, config):
    """Load CSV file into database table"""
    csv_path = os.path.join(CSV_DIR, config['file'])

    if not os.path.exists(csv_path):
        logger.warning(f"CSV file not found: {csv_path}")
        return 0

    try:
        logger.info(f"Loading {table_name} from {config['file']}...")

        # Read CSV
        df = pd.read_csv(
            csv_path,
            dtype=config.get('dtype'),
            parse_dates=config.get('parse_dates', []),
        )

        # Data cleaning
        df = df.fillna(value=pd.NA)

        # Load into database
        row_count = len(df)
        df.to_sql(
            table_name,
            engine,
            if_exists='append',
            index=False,
            method='multi',
            chunksize=1000,
        )

        logger.info(f"✓ Loaded {row_count} rows into {table_name}")
        return row_count

    except Exception as e:
        logger.error(f"✗ Failed to load {table_name}: {e}")
        return 0


def refresh_materialized_views(engine):
    """Refresh all materialized views"""
    try:
        logger.info("Refreshing materialized views...")

        views = [
            'mv_latest_inventory',
            'mv_daily_forecast_summary',
            'mv_lp_daily_stats',
        ]

        with engine.connect() as conn:
            for view in views:
                conn.execute(text(f"REFRESH MATERIALIZED VIEW CONCURRENTLY {view}"))
                logger.info(f"✓ Refreshed {view}")
            conn.commit()

    except Exception as e:
        logger.error(f"✗ Failed to refresh materialized views: {e}")


def print_summary(engine):
    """Print data summary"""
    try:
        logger.info("Data Summary:")
        logger.info("-" * 50)

        with engine.connect() as conn:
            for table_name in TABLES.keys():
                result = conn.execute(
                    text(f"SELECT COUNT(*) as count FROM {table_name}")
                )
                count = result.scalar()
                logger.info(f"  {table_name}: {count:,} rows")

    except Exception as e:
        logger.error(f"Failed to print summary: {e}")


def main():
    """Main function"""
    logger.info("=" * 60)
    logger.info("CSV to PostgreSQL Bulk Loader")
    logger.info("=" * 60)
    logger.info(f"CSV Directory: {CSV_DIR}")
    logger.info("")

    # Create engine
    engine = create_engine_safe()

    # Load all tables
    logger.info("Loading tables...")
    logger.info("-" * 60)

    total_rows = 0
    for table_name, config in TABLES.items():
        rows = load_csv_to_table(engine, table_name, config)
        total_rows += rows

    logger.info("")
    logger.info("Refreshing materialized views...")
    logger.info("-" * 60)
    refresh_materialized_views(engine)

    # Print summary
    logger.info("")
    print_summary(engine)

    logger.info("")
    logger.info("=" * 60)
    logger.info(f"✓ Load complete! Total rows: {total_rows:,}")
    logger.info("=" * 60)

    engine.dispose()


if __name__ == '__main__':
    main()
