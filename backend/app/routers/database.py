"""
Database Router
Provides endpoints for accessing historical data from PostgreSQL
"""

from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Query, HTTPException
from sqlalchemy import text

from app.db import get_db, engine
from app.schemas import BaseResponse
from app.utils import app_logger

router = APIRouter(prefix="/api/database", tags=["database"])


# ============================================================================
# HISTORICAL SHIPMENTS ENDPOINTS
# ============================================================================

@router.get("/shipments", response_model=BaseResponse)
async def get_shipments(
    route: Optional[str] = Query(None),
    material: Optional[str] = Query(None),
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(100, ge=1, le=1000)
):
    """
    Get historical shipment data
    
    Query Parameters:
    - route: Filter by route (optional)
    - material: Filter by material (optional)
    - days: Number of days to look back (default: 30)
    - limit: Maximum records to return (default: 100, max: 1000)
    """
    try:
        if engine is None:
            return BaseResponse(
                status="warning",
                timestamp=datetime.utcnow(),
                message="Database not available, using mock data",
                data=_get_mock_shipments(route, material, limit)
            )
        
        try:
            with engine.connect() as conn:
                query = "SELECT * FROM historical_shipments WHERE 1=1"
                params = {}
                
                # Add date filter
                start_date = datetime.now() - timedelta(days=days)
                query += " AND date >= :start_date"
                params['start_date'] = start_date
                
                # Add optional filters
                if route:
                    query += " AND route = :route"
                    params['route'] = route
                
                if material:
                    query += " AND material = :material"
                    params['material'] = material
                
                # Order and limit
                query += " ORDER BY date DESC LIMIT :limit"
                params['limit'] = limit
                
                result = conn.execute(text(query), params)
                rows = result.fetchall()
                
                data = [dict(row._mapping) for row in rows]
                
                return BaseResponse(
                    status="success",
                    timestamp=datetime.utcnow(),
                    message=f"Retrieved {len(data)} shipment records",
                    data=data
                )
        except Exception as db_error:
            app_logger.warning(f"Database query failed: {db_error}, using mock data")
            return BaseResponse(
                status="warning",
                timestamp=datetime.utcnow(),
                message="Database unavailable, using mock data",
                data=_get_mock_shipments(route, material, limit)
            )
    
    except Exception as e:
        app_logger.error(f"Error in get_shipments: {e}")
        return BaseResponse(
            status="warning",
            timestamp=datetime.utcnow(),
            message="Using mock data due to error",
            data=_get_mock_shipments(route, material, limit)
        )


@router.get("/shipments/summary", response_model=BaseResponse)
async def get_shipments_summary(
    days: int = Query(30, ge=1, le=365)
):
    """
    Get shipment summary statistics
    
    Returns:
    - Total shipments
    - Average delay
    - On-time percentage
    - Material breakdown
    - Route breakdown
    """
    try:
        if engine is None:
            return BaseResponse(
                status="warning",
                timestamp=datetime.utcnow(),
                message="Database not available, using mock data",
                data=_get_mock_summary()
            )
        
        try:
            with engine.connect() as conn:
                start_date = datetime.now() - timedelta(days=days)
                
                # Get summary stats
                query = text("""
                    SELECT
                        COUNT(*) as total_shipments,
                        AVG(delay_days) as avg_delay,
                        AVG(cost_per_tonne) as avg_cost,
                        AVG(risk_score) as avg_risk,
                        SUM(CASE WHEN status = 'on-time' THEN 1 ELSE 0 END)::float / COUNT(*) * 100 as on_time_percentage,
                        SUM(tonnage) as total_tonnage
                    FROM historical_shipments
                    WHERE date >= :start_date
                """)
                
                result = conn.execute(query, {'start_date': start_date})
                summary = dict(result.fetchone()._mapping)
                
                # Get material breakdown
                material_query = text("""
                    SELECT material, COUNT(*) as count, AVG(delay_days) as avg_delay
                    FROM historical_shipments
                    WHERE date >= :start_date
                    GROUP BY material
                    ORDER BY count DESC
                """)
                
                material_result = conn.execute(material_query, {'start_date': start_date})
                materials = [dict(row._mapping) for row in material_result.fetchall()]
                
                # Get route breakdown
                route_query = text("""
                    SELECT route, COUNT(*) as count, AVG(delay_days) as avg_delay
                    FROM historical_shipments
                    WHERE date >= :start_date
                    GROUP BY route
                    ORDER BY count DESC
                """)
                
                route_result = conn.execute(route_query, {'start_date': start_date})
                routes = [dict(row._mapping) for row in route_result.fetchall()]
                
                return BaseResponse(
                    status="success",
                    timestamp=datetime.utcnow(),
                    message="Shipment summary statistics",
                    data={
                        'summary': summary,
                        'materials': materials,
                        'routes': routes
                    }
                )
        except Exception as db_error:
            app_logger.warning(f"Database query failed: {db_error}, using mock data")
            return BaseResponse(
                status="warning",
                timestamp=datetime.utcnow(),
                message="Database unavailable, using mock data",
                data=_get_mock_summary()
            )
    
    except Exception as e:
        app_logger.error(f"Error in get_shipments_summary: {e}")
        return BaseResponse(
            status="warning",
            timestamp=datetime.utcnow(),
            message="Using mock data due to error",
            data=_get_mock_summary()
        )


# ============================================================================
# HISTORICAL DECISIONS ENDPOINTS
# ============================================================================

@router.get("/decisions", response_model=BaseResponse)
async def get_decisions(
    scenario: Optional[str] = Query(None),
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(100, ge=1, le=1000)
):
    """
    Get historical decision data
    
    Query Parameters:
    - scenario: Filter by scenario (optional)
    - days: Number of days to look back (default: 30)
    - limit: Maximum records to return (default: 100, max: 1000)
    """
    try:
        if engine is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        with engine.connect() as conn:
            query = "SELECT * FROM historical_decisions WHERE 1=1"
            params = {}
            
            # Add date filter
            start_date = datetime.now() - timedelta(days=days)
            query += " AND date >= :start_date"
            params['start_date'] = start_date
            
            # Add optional filters
            if scenario:
                query += " AND scenario = :scenario"
                params['scenario'] = scenario
            
            # Order and limit
            query += " ORDER BY date DESC LIMIT :limit"
            params['limit'] = limit
            
            result = conn.execute(text(query), params)
            rows = result.fetchall()
            
            data = [dict(row._mapping) for row in rows]
            
            return BaseResponse(
                status="success",
                timestamp=datetime.utcnow(),
                message=f"Retrieved {len(data)} decision records",
                data=data
            )
    
    except Exception as e:
        app_logger.error(f"Error fetching decisions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# HISTORICAL DISPATCHES ENDPOINTS
# ============================================================================

@router.get("/dispatches", response_model=BaseResponse)
async def get_dispatches(
    route: Optional[str] = Query(None),
    material: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(100, ge=1, le=1000)
):
    """
    Get historical dispatch data
    
    Query Parameters:
    - route: Filter by route (optional)
    - material: Filter by material (optional)
    - status: Filter by status (optional)
    - days: Number of days to look back (default: 30)
    - limit: Maximum records to return (default: 100, max: 1000)
    """
    try:
        if engine is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        with engine.connect() as conn:
            query = "SELECT * FROM historical_dispatches WHERE 1=1"
            params = {}
            
            # Add date filter
            start_date = datetime.now() - timedelta(days=days)
            query += " AND date >= :start_date"
            params['start_date'] = start_date
            
            # Add optional filters
            if route:
                query += " AND route = :route"
                params['route'] = route
            
            if material:
                query += " AND material = :material"
                params['material'] = material
            
            if status:
                query += " AND status = :status"
                params['status'] = status
            
            # Order and limit
            query += " ORDER BY date DESC LIMIT :limit"
            params['limit'] = limit
            
            result = conn.execute(text(query), params)
            rows = result.fetchall()
            
            data = [dict(row._mapping) for row in rows]
            
            return BaseResponse(
                status="success",
                timestamp=datetime.utcnow(),
                message=f"Retrieved {len(data)} dispatch records",
                data=data
            )
    
    except Exception as e:
        app_logger.error(f"Error fetching dispatches: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dispatches/summary", response_model=BaseResponse)
async def get_dispatches_summary(
    days: int = Query(30, ge=1, le=365)
):
    """
    Get dispatch summary statistics
    
    Returns:
    - Total dispatches
    - Average quality score
    - Average satisfaction
    - Status breakdown
    - Route performance
    """
    try:
        if engine is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        with engine.connect() as conn:
            start_date = datetime.now() - timedelta(days=days)
            
            # Get summary stats
            query = text("""
                SELECT
                    COUNT(*) as total_dispatches,
                    AVG(quality_score) as avg_quality,
                    AVG(satisfaction_score) as avg_satisfaction,
                    AVG(delay_days) as avg_delay,
                    AVG(total_cost) as avg_cost,
                    SUM(tonnage) as total_tonnage
                FROM historical_dispatches
                WHERE date >= :start_date
            """)
            
            result = conn.execute(query, {'start_date': start_date})
            summary = dict(result.fetchone()._mapping)
            
            # Get status breakdown
            status_query = text("""
                SELECT status, COUNT(*) as count
                FROM historical_dispatches
                WHERE date >= :start_date
                GROUP BY status
                ORDER BY count DESC
            """)
            
            status_result = conn.execute(status_query, {'start_date': start_date})
            statuses = [dict(row._mapping) for row in status_result.fetchall()]
            
            # Get route performance
            route_query = text("""
                SELECT route, COUNT(*) as count, AVG(quality_score) as avg_quality,
                       AVG(satisfaction_score) as avg_satisfaction
                FROM historical_dispatches
                WHERE date >= :start_date
                GROUP BY route
                ORDER BY count DESC
            """)
            
            route_result = conn.execute(route_query, {'start_date': start_date})
            routes = [dict(row._mapping) for row in route_result.fetchall()]
            
            return BaseResponse(
                status="success",
                timestamp=datetime.utcnow(),
                message="Dispatch summary statistics",
                data={
                    'summary': summary,
                    'statuses': statuses,
                    'routes': routes
                }
            )
    
    except Exception as e:
        app_logger.error(f"Error fetching dispatch summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

@router.get("/analytics/materials", response_model=BaseResponse)
async def get_material_analytics(
    days: int = Query(30, ge=1, le=365)
):
    """
    Get material-wise analytics
    
    Returns:
    - Material performance
    - Delay statistics
    - Cost analysis
    - Quality metrics
    """
    try:
        if engine is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        with engine.connect() as conn:
            start_date = datetime.now() - timedelta(days=days)
            
            query = text("""
                SELECT
                    material,
                    COUNT(*) as total_shipments,
                    AVG(delay_days) as avg_delay,
                    AVG(cost_per_tonne) as avg_cost,
                    AVG(risk_score) as avg_risk,
                    SUM(tonnage) as total_tonnage,
                    thickness,
                    width,
                    length
                FROM historical_shipments
                WHERE date >= :start_date
                GROUP BY material, thickness, width, length
                ORDER BY total_shipments DESC
            """)
            
            result = conn.execute(query, {'start_date': start_date})
            data = [dict(row._mapping) for row in result.fetchall()]
            
            return BaseResponse(
                status="success",
                timestamp=datetime.utcnow(),
                message="Material analytics",
                data=data
            )
    
    except Exception as e:
        app_logger.error(f"Error fetching material analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/routes", response_model=BaseResponse)
async def get_route_analytics(
    days: int = Query(30, ge=1, le=365)
):
    """
    Get route-wise analytics
    
    Returns:
    - Route performance
    - Delay patterns
    - Cost efficiency
    - Risk assessment
    """
    try:
        if engine is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        with engine.connect() as conn:
            start_date = datetime.now() - timedelta(days=days)
            
            # Shipment analytics
            shipment_query = text("""
                SELECT
                    route,
                    COUNT(*) as total_shipments,
                    AVG(delay_days) as avg_delay,
                    AVG(cost_per_tonne) as avg_cost,
                    AVG(risk_score) as avg_risk,
                    SUM(tonnage) as total_tonnage
                FROM historical_shipments
                WHERE date >= :start_date
                GROUP BY route
                ORDER BY total_shipments DESC
            """)
            
            shipment_result = conn.execute(shipment_query, {'start_date': start_date})
            shipments = [dict(row._mapping) for row in shipment_result.fetchall()]
            
            # Dispatch analytics
            dispatch_query = text("""
                SELECT
                    route,
                    COUNT(*) as total_dispatches,
                    AVG(quality_score) as avg_quality,
                    AVG(satisfaction_score) as avg_satisfaction,
                    AVG(delay_days) as avg_delay
                FROM historical_dispatches
                WHERE date >= :start_date
                GROUP BY route
                ORDER BY total_dispatches DESC
            """)
            
            dispatch_result = conn.execute(dispatch_query, {'start_date': start_date})
            dispatches = [dict(row._mapping) for row in dispatch_result.fetchall()]
            
            return BaseResponse(
                status="success",
                timestamp=datetime.utcnow(),
                message="Route analytics",
                data={
                    'shipments': shipments,
                    'dispatches': dispatches
                }
            )
    
    except Exception as e:
        app_logger.error(f"Error fetching route analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# MOCK DATA FUNCTIONS (Fallback when database is unavailable)
# ============================================================================

def _get_mock_shipments(route: Optional[str] = None, material: Optional[str] = None, limit: int = 100):
    """Generate mock shipment data"""
    import random
    
    routes = ['bokaro-dhanbad', 'bokaro-hatia', 'bokaro-kolkata', 'bokaro-patna', 
              'bokaro-ranchi', 'bokaro-durgapur', 'bokaro-haldia']
    materials = ['cr_coils', 'hr_coils', 'plates', 'sheets']
    statuses = ['delivered', 'delayed', 'on-time', 'cancelled']
    
    data = []
    start_date = datetime.now() - timedelta(days=30)
    
    for i in range(min(limit, 100)):
        date = start_date + timedelta(days=i)
        r = route if route else random.choice(routes)
        m = material if material else random.choice(materials)
        
        data.append({
            'id': i + 1,
            'date': date.isoformat(),
            'route': r,
            'material': m,
            'tonnage': random.randint(10, 100),
            'planned_days': random.randint(3, 10),
            'actual_days': random.randint(3, 12),
            'delay_days': random.randint(0, 5),
            'cost': random.randint(5000, 15000),
            'cost_per_tonne': random.randint(200, 500),
            'weather': random.choice(['clear', 'rainy', 'foggy', 'stormy']),
            'traffic_level': random.choice(['low', 'medium', 'high', 'very-high']),
            'risk_score': random.randint(10, 80),
            'status': random.choice(statuses),
            'accuracy': random.randint(80, 100),
        })
    
    return data


def _get_mock_summary():
    """Generate mock summary statistics"""
    import random
    return {
        'summary': {
            'total_shipments': random.randint(400, 600),
            'avg_delay': round(random.uniform(0.5, 3.0), 2),
            'avg_cost': random.randint(300, 450),
            'avg_risk': random.randint(20, 50),
            'on_time_percentage': random.randint(70, 95),
            'total_tonnage': random.randint(10000, 20000),
        },
        'materials': [
            {'material': 'cr_coils', 'count': random.randint(80, 150), 'avg_delay': round(random.uniform(0.5, 2.0), 2)},
            {'material': 'hr_coils', 'count': random.randint(80, 150), 'avg_delay': round(random.uniform(0.5, 2.0), 2)},
            {'material': 'plates', 'count': random.randint(80, 150), 'avg_delay': round(random.uniform(0.5, 2.0), 2)},
            {'material': 'sheets', 'count': random.randint(80, 150), 'avg_delay': round(random.uniform(0.5, 2.0), 2)},
        ],
        'routes': [
            {'route': 'bokaro-dhanbad', 'count': random.randint(50, 100), 'avg_delay': round(random.uniform(0.5, 2.0), 2)},
            {'route': 'bokaro-hatia', 'count': random.randint(50, 100), 'avg_delay': round(random.uniform(0.5, 2.0), 2)},
            {'route': 'bokaro-kolkata', 'count': random.randint(50, 100), 'avg_delay': round(random.uniform(0.5, 2.0), 2)},
            {'route': 'bokaro-patna', 'count': random.randint(50, 100), 'avg_delay': round(random.uniform(0.5, 2.0), 2)},
        ]
    }


# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get("/health", response_model=BaseResponse)
async def database_health():
    """
    Check database health and connectivity
    """
    try:
        if engine is None:
            return BaseResponse(
                status="warning",
                timestamp=datetime.utcnow(),
                message="Database engine not initialized, using mock data",
                data={"connected": False, "mode": "mock"}
            )
        
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
                
                try:
                    # Try to count records
                    shipment_count = conn.execute(text("SELECT COUNT(*) FROM historical_shipments")).scalar() or 0
                    decision_count = conn.execute(text("SELECT COUNT(*) FROM historical_decisions")).scalar() or 0
                    dispatch_count = conn.execute(text("SELECT COUNT(*) FROM historical_dispatches")).scalar() or 0
                except:
                    # Tables don't exist yet
                    shipment_count = 0
                    decision_count = 0
                    dispatch_count = 0
                
                return BaseResponse(
                    status="success",
                    timestamp=datetime.utcnow(),
                    message="Database is healthy" if (shipment_count + decision_count + dispatch_count) > 0 else "Database connected but no data yet",
                    data={
                        "connected": True,
                        "mode": "database",
                        "records": {
                            "shipments": shipment_count,
                            "decisions": decision_count,
                            "dispatches": dispatch_count,
                            "total": shipment_count + decision_count + dispatch_count
                        }
                    }
                )
        except Exception as db_error:
            app_logger.warning(f"Database connection failed: {db_error}, will use mock data")
            return BaseResponse(
                status="warning",
                timestamp=datetime.utcnow(),
                message="Database unavailable, using mock data",
                data={"connected": False, "mode": "mock", "error": str(db_error)}
            )
    
    except Exception as e:
        app_logger.error(f"Database health check error: {e}")
        return BaseResponse(
            status="warning",
            timestamp=datetime.utcnow(),
            message="Using mock data mode",
            data={"connected": False, "mode": "mock"}
        )
