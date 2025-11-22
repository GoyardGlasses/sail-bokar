"""
Database module for SAIL Bokaro
Handles PostgreSQL connections and queries
"""

import os
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any

from sqlalchemy import create_engine, text, pool
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)

# Configuration
DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:postgres@localhost:5432/sihdb'
)
DB_POOL_SIZE = int(os.getenv('DB_POOL_SIZE', '10'))
DB_MAX_OVERFLOW = int(os.getenv('DB_MAX_OVERFLOW', '20'))
USE_CSV_MODE = os.getenv('USE_CSV_MODE', 'false').lower() == 'true'

# Create engine
try:
    engine = create_engine(
        DATABASE_URL,
        poolclass=pool.QueuePool,
        pool_size=DB_POOL_SIZE,
        max_overflow=DB_MAX_OVERFLOW,
        echo=False,
        connect_args={'connect_timeout': 10},
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logger.info("✓ Database engine created successfully")
except Exception as e:
    logger.error(f"✗ Failed to create database engine: {e}")
    engine = None
    SessionLocal = None


def get_db() -> Optional[Session]:
    """Get database session"""
    if SessionLocal is None:
        return None
    return SessionLocal()


def close_db():
    """Close database connection"""
    if engine:
        engine.dispose()


def test_connection() -> bool:
    """Test database connectivity"""
    if engine is None:
        logger.warning("Database engine not initialized")
        return False

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("✓ Database connection test passed")
        return True
    except SQLAlchemyError as e:
        logger.error(f"✗ Database connection test failed: {e}")
        return False


# ============================================================================
# Query Functions
# ============================================================================


def get_orders_by_destination(
    destination: str,
    date: Optional[datetime] = None,
    status: str = 'PENDING'
) -> List[Dict[str, Any]]:
    """
    Get orders for a specific destination
    
    Args:
        destination: Destination name
        date: Optional date filter (defaults to today)
        status: Order status filter
    
    Returns:
        List of order dictionaries
    """
    if engine is None:
        logger.warning("Database not available, using CSV mode")
        return []

    if date is None:
        date = datetime.now().date()

    try:
        with engine.connect() as conn:
            query = text("""
                SELECT
                    order_id,
                    order_date,
                    material_type,
                    quantity_tonnes,
                    destination,
                    priority,
                    loading_point,
                    status
                FROM orders
                WHERE destination = :destination
                    AND order_date = :date
                    AND status = :status
                ORDER BY priority DESC, order_date ASC
            """)

            result = conn.execute(query, {
                'destination': destination,
                'date': date,
                'status': status,
            })

            rows = result.fetchall()
            return [dict(row._mapping) for row in rows]

    except SQLAlchemyError as e:
        logger.error(f"Error fetching orders: {e}")
        return []


def get_latest_inventory(stockyard: str) -> List[Dict[str, Any]]:
    """
    Get latest inventory for a stockyard
    
    Args:
        stockyard: Stockyard name
    
    Returns:
        List of inventory records
    """
    if engine is None:
        logger.warning("Database not available, using CSV mode")
        return []

    try:
        with engine.connect() as conn:
            query = text("""
                SELECT
                    stockyard,
                    material_type,
                    quantity_tonnes,
                    safety_stock_tonnes,
                    available_tonnes,
                    stock_status,
                    as_of
                FROM mv_latest_inventory
                WHERE stockyard = :stockyard
                ORDER BY stock_status DESC, material_type ASC
            """)

            result = conn.execute(query, {'stockyard': stockyard})
            rows = result.fetchall()
            return [dict(row._mapping) for row in rows]

    except SQLAlchemyError as e:
        logger.error(f"Error fetching inventory: {e}")
        return []


def get_lp_throughput(
    loading_point: str,
    date: Optional[datetime] = None,
    hours: int = 24
) -> List[Dict[str, Any]]:
    """
    Get loading point throughput for a period
    
    Args:
        loading_point: Loading point name
        date: Optional date (defaults to today)
        hours: Number of hours to look back
    
    Returns:
        List of throughput records
    """
    if engine is None:
        logger.warning("Database not available, using CSV mode")
        return []

    if date is None:
        date = datetime.now()

    start_time = date - timedelta(hours=hours)

    try:
        with engine.connect() as conn:
            query = text("""
                SELECT
                    loading_point,
                    ts,
                    throughput_tonnes,
                    utilization_percent
                FROM lp_throughput
                WHERE loading_point = :loading_point
                    AND ts >= :start_time
                    AND ts <= :end_time
                ORDER BY ts DESC
            """)

            result = conn.execute(query, {
                'loading_point': loading_point,
                'start_time': start_time,
                'end_time': date,
            })

            rows = result.fetchall()
            return [dict(row._mapping) for row in rows]

    except SQLAlchemyError as e:
        logger.error(f"Error fetching LP throughput: {e}")
        return []


def get_recent_rake_arrivals(
    yard: str,
    days: int = 7
) -> List[Dict[str, Any]]:
    """
    Get recent rake arrivals at a yard
    
    Args:
        yard: Yard name
        days: Number of days to look back
    
    Returns:
        List of rake arrival records
    """
    if engine is None:
        logger.warning("Database not available, using CSV mode")
        return []

    start_time = datetime.now() - timedelta(days=days)

    try:
        with engine.connect() as conn:
            query = text("""
                SELECT
                    rake_id,
                    yard,
                    arrival_time,
                    wagons_count,
                    capacity_tonnes,
                    status
                FROM rake_arrivals
                WHERE yard = :yard
                    AND arrival_time >= :start_time
                ORDER BY arrival_time DESC
            """)

            result = conn.execute(query, {
                'yard': yard,
                'start_time': start_time,
            })

            rows = result.fetchall()
            return [dict(row._mapping) for row in rows]

    except SQLAlchemyError as e:
        logger.error(f"Error fetching rake arrivals: {e}")
        return []


def get_daily_forecast_summary(
    destination: str,
    date: Optional[datetime] = None
) -> List[Dict[str, Any]]:
    """
    Get daily forecast summary for a destination
    
    Args:
        destination: Destination name
        date: Optional date (defaults to today)
    
    Returns:
        List of forecast records
    """
    if engine is None:
        logger.warning("Database not available, using CSV mode")
        return []

    if date is None:
        date = datetime.now().date()

    try:
        with engine.connect() as conn:
            query = text("""
                SELECT
                    order_date,
                    destination,
                    material_type,
                    total_demand_tonnes,
                    order_count,
                    high_priority_ratio
                FROM mv_daily_forecast_summary
                WHERE destination = :destination
                    AND order_date = :date
                ORDER BY total_demand_tonnes DESC
            """)

            result = conn.execute(query, {
                'destination': destination,
                'date': date,
            })

            rows = result.fetchall()
            return [dict(row._mapping) for row in rows]

    except SQLAlchemyError as e:
        logger.error(f"Error fetching forecast summary: {e}")
        return []


def get_route_congestion(
    route_id: str,
    date: Optional[datetime] = None
) -> Optional[Dict[str, Any]]:
    """
    Get route congestion information
    
    Args:
        route_id: Route identifier
        date: Optional date (defaults to today)
    
    Returns:
        Route congestion record or None
    """
    if engine is None:
        logger.warning("Database not available, using CSV mode")
        return None

    if date is None:
        date = datetime.now().date()

    try:
        with engine.connect() as conn:
            query = text("""
                SELECT
                    route_id,
                    date,
                    congestion_level,
                    avg_delay_hours,
                    traffic_factor
                FROM route_congestion
                WHERE route_id = :route_id
                    AND date = :date
            """)

            result = conn.execute(query, {
                'route_id': route_id,
                'date': date,
            })

            row = result.fetchone()
            return dict(row._mapping) if row else None

    except SQLAlchemyError as e:
        logger.error(f"Error fetching route congestion: {e}")
        return None


def insert_dispatch_record(
    dispatch_data: Dict[str, Any]
) -> Optional[int]:
    """
    Insert a dispatch record
    
    Args:
        dispatch_data: Dictionary with dispatch information
    
    Returns:
        Dispatch ID or None on error
    """
    if engine is None:
        logger.warning("Database not available, cannot insert dispatch")
        return None

    try:
        with engine.connect() as conn:
            query = text("""
                INSERT INTO dispatch_history (
                    dispatch_date, rake_id, truck_id, order_id,
                    destination, tonnes_dispatched, estimated_cost,
                    estimated_delay_hours, transport_mode, status
                ) VALUES (
                    :dispatch_date, :rake_id, :truck_id, :order_id,
                    :destination, :tonnes_dispatched, :estimated_cost,
                    :estimated_delay_hours, :transport_mode, :status
                )
                RETURNING dispatch_id
            """)

            result = conn.execute(query, dispatch_data)
            dispatch_id = result.scalar()
            conn.commit()

            logger.info(f"✓ Dispatch record inserted: {dispatch_id}")
            return dispatch_id

    except SQLAlchemyError as e:
        logger.error(f"Error inserting dispatch record: {e}")
        return None


# ============================================================================
# Health Check
# ============================================================================


def health_check() -> Dict[str, Any]:
    """
    Check database health
    
    Returns:
        Health status dictionary
    """
    status = {
        'database': 'unavailable',
        'connected': False,
        'tables': 0,
    }

    if engine is None:
        return status

    try:
        with engine.connect() as conn:
            # Test connection
            conn.execute(text("SELECT 1"))
            status['connected'] = True

            # Count tables
            result = conn.execute(text("""
                SELECT COUNT(*) FROM information_schema.tables
                WHERE table_schema = 'public'
            """))
            status['tables'] = result.scalar()
            status['database'] = 'healthy'

    except SQLAlchemyError as e:
        logger.error(f"Database health check failed: {e}")
        status['database'] = 'error'

    return status
