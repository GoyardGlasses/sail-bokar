"""
Rake Formation API Router
Feature 2: Real-time database integration
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from datetime import datetime, timedelta
from sqlalchemy import select, and_
import logging

from app.db import engine
from app.schemas import BaseResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/rake-formation", tags=["rake-formation"])

# ============================================================================
# MODELS (Database tables)
# ============================================================================

from sqlalchemy import Column, String, Float, Integer, JSON, DateTime, Boolean
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Order(Base):
    __tablename__ = "orders"
    
    orderId = Column(String, primary_key=True)
    materialId = Column(String)
    materialName = Column(String)
    quantity = Column(Float)
    destination = Column(String)
    priority = Column(String)  # low, medium, high, urgent
    requiredDate = Column(DateTime)
    slaHours = Column(Integer)
    cost = Column(Float)
    status = Column(String, default="pending")
    createdAt = Column(DateTime, default=datetime.utcnow)

class Material(Base):
    __tablename__ = "materials"
    
    materialId = Column(String, primary_key=True)
    stockyardId = Column(String)
    quantity = Column(Float)
    quality = Column(String)
    age = Column(Integer)
    costPerTonne = Column(Float)
    lastUpdated = Column(DateTime, default=datetime.utcnow)

class Rake(Base):
    __tablename__ = "rakes"
    
    rakeId = Column(String, primary_key=True)
    capacity = Column(Float)
    currentLoad = Column(Float, default=0)
    location = Column(String)
    availableDate = Column(DateTime)
    costPerKm = Column(Float)
    status = Column(String, default="available")
    lastUpdated = Column(DateTime, default=datetime.utcnow)

class RakePlan(Base):
    __tablename__ = "rake_plans"
    
    planId = Column(String, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    algorithm = Column(String)
    rakes = Column(JSON)  # Serialized rake data
    totalCost = Column(Float)
    totalUtilization = Column(Float)
    slaCompliance = Column(Float)
    status = Column(String, default="draft")
    createdAt = Column(DateTime, default=datetime.utcnow)

# ============================================================================
# ENDPOINTS: Get Real-time Data
# ============================================================================

@router.get("/orders", response_model=BaseResponse)
async def get_orders(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get pending orders from database"""
    try:
        if engine is None:
            return BaseResponse(
                status="warning",
                timestamp=datetime.utcnow(),
                message="Database not available",
                data=[]
            )
        
        with engine.connect() as conn:
            query = select(Order)
            
            # Filter by status
            if status:
                query = query.where(Order.status == status)
            else:
                query = query.where(Order.status == "pending")
            
            # Filter by priority
            if priority:
                query = query.where(Order.priority == priority)
            
            # Filter by date range
            start_date = datetime.utcnow() - timedelta(days=days)
            query = query.where(Order.createdAt >= start_date)
            
            # Limit results
            query = query.limit(limit)
            
            result = conn.execute(query)
            orders = [dict(row._mapping) for row in result]
            
            return BaseResponse(
                status="success",
                timestamp=datetime.utcnow(),
                message=f"Retrieved {len(orders)} orders",
                data=orders
            )
    except Exception as e:
        logger.error(f"Error fetching orders: {e}")
        return BaseResponse(
            status="error",
            timestamp=datetime.utcnow(),
            message=f"Error fetching orders: {str(e)}",
            data=[]
        )

@router.get("/materials", response_model=BaseResponse)
async def get_materials(
    stockyardId: Optional[str] = Query(None),
    materialId: Optional[str] = Query(None),
    minQuantity: float = Query(0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get material availability from stockyards"""
    try:
        if engine is None:
            return BaseResponse(
                status="warning",
                timestamp=datetime.utcnow(),
                message="Database not available",
                data=[]
            )
        
        with engine.connect() as conn:
            query = select(Material).where(Material.quantity > minQuantity)
            
            if stockyardId:
                query = query.where(Material.stockyardId == stockyardId)
            
            if materialId:
                query = query.where(Material.materialId == materialId)
            
            query = query.limit(limit)
            
            result = conn.execute(query)
            materials = [dict(row._mapping) for row in result]
            
            return BaseResponse(
                status="success",
                timestamp=datetime.utcnow(),
                message=f"Retrieved {len(materials)} materials",
                data=materials
            )
    except Exception as e:
        logger.error(f"Error fetching materials: {e}")
        return BaseResponse(
            status="error",
            timestamp=datetime.utcnow(),
            message=f"Error fetching materials: {str(e)}",
            data=[]
        )

@router.get("/rakes", response_model=BaseResponse)
async def get_rakes(
    status: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    minCapacity: float = Query(0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get available rakes"""
    try:
        if engine is None:
            return BaseResponse(
                status="warning",
                timestamp=datetime.utcnow(),
                message="Database not available",
                data=[]
            )
        
        with engine.connect() as conn:
            query = select(Rake).where(Rake.capacity >= minCapacity)
            
            if status:
                query = query.where(Rake.status == status)
            else:
                query = query.where(Rake.status == "available")
            
            if location:
                query = query.where(Rake.location == location)
            
            query = query.limit(limit)
            
            result = conn.execute(query)
            rakes = [dict(row._mapping) for row in result]
            
            return BaseResponse(
                status="success",
                timestamp=datetime.utcnow(),
                message=f"Retrieved {len(rakes)} rakes",
                data=rakes
            )
    except Exception as e:
        logger.error(f"Error fetching rakes: {e}")
        return BaseResponse(
            status="error",
            timestamp=datetime.utcnow(),
            message=f"Error fetching rakes: {str(e)}",
            data=[]
        )

# ============================================================================
# ENDPOINTS: Save Plans
# ============================================================================

@router.post("/plans", response_model=BaseResponse)
async def save_plan(plan: dict):
    """Save generated rake formation plan"""
    try:
        if engine is None:
            return BaseResponse(
                status="warning",
                timestamp=datetime.utcnow(),
                message="Database not available",
                data={}
            )
        
        with engine.begin() as conn:
            new_plan = RakePlan(
                planId=plan.get("planId", f"PLAN-{datetime.utcnow().timestamp()}"),
                timestamp=datetime.utcnow(),
                algorithm=plan.get("algorithm", "greedy"),
                rakes=plan.get("rakes", []),
                totalCost=plan.get("totalCost", 0),
                totalUtilization=plan.get("totalUtilization", 0),
                slaCompliance=plan.get("slaCompliance", 0),
                status="draft"
            )
            
            conn.execute(
                RakePlan.__table__.insert(),
                [{
                    "planId": new_plan.planId,
                    "timestamp": new_plan.timestamp,
                    "algorithm": new_plan.algorithm,
                    "rakes": new_plan.rakes,
                    "totalCost": new_plan.totalCost,
                    "totalUtilization": new_plan.totalUtilization,
                    "slaCompliance": new_plan.slaCompliance,
                    "status": new_plan.status
                }]
            )
            
            return BaseResponse(
                status="success",
                timestamp=datetime.utcnow(),
                message=f"Plan {new_plan.planId} saved successfully",
                data={"planId": new_plan.planId}
            )
    except Exception as e:
        logger.error(f"Error saving plan: {e}")
        return BaseResponse(
            status="error",
            timestamp=datetime.utcnow(),
            message=f"Error saving plan: {str(e)}",
            data={}
        )

@router.get("/plans", response_model=BaseResponse)
async def get_plans(
    status: Optional[str] = Query(None),
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get saved rake formation plans"""
    try:
        if engine is None:
            return BaseResponse(
                status="warning",
                timestamp=datetime.utcnow(),
                message="Database not available",
                data=[]
            )
        
        with engine.connect() as conn:
            query = select(RakePlan)
            
            if status:
                query = query.where(RakePlan.status == status)
            
            start_date = datetime.utcnow() - timedelta(days=days)
            query = query.where(RakePlan.createdAt >= start_date)
            
            query = query.limit(limit)
            
            result = conn.execute(query)
            plans = [dict(row._mapping) for row in result]
            
            return BaseResponse(
                status="success",
                timestamp=datetime.utcnow(),
                message=f"Retrieved {len(plans)} plans",
                data=plans
            )
    except Exception as e:
        logger.error(f"Error fetching plans: {e}")
        return BaseResponse(
            status="error",
            timestamp=datetime.utcnow(),
            message=f"Error fetching plans: {str(e)}",
            data=[]
        )

# ============================================================================
# ENDPOINTS: Health Check
# ============================================================================

@router.get("/health", response_model=BaseResponse)
async def health_check():
    """Check rake formation system health"""
    try:
        if engine is None:
            return BaseResponse(
                status="warning",
                timestamp=datetime.utcnow(),
                message="Database not initialized",
                data={"connected": False, "mode": "mock"}
            )
        
        with engine.connect() as conn:
            # Try to count records
            try:
                orders_count = conn.execute(select(Order)).rowcount or 0
                materials_count = conn.execute(select(Material)).rowcount or 0
                rakes_count = conn.execute(select(Rake)).rowcount or 0
                plans_count = conn.execute(select(RakePlan)).rowcount or 0
            except:
                orders_count = 0
                materials_count = 0
                rakes_count = 0
                plans_count = 0
            
            return BaseResponse(
                status="success",
                timestamp=datetime.utcnow(),
                message="Rake formation system healthy",
                data={
                    "connected": True,
                    "mode": "database",
                    "records": {
                        "orders": orders_count,
                        "materials": materials_count,
                        "rakes": rakes_count,
                        "plans": plans_count,
                        "total": orders_count + materials_count + rakes_count + plans_count
                    }
                }
            )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return BaseResponse(
            status="warning",
            timestamp=datetime.utcnow(),
            message="Database unavailable, using mock data",
            data={"connected": False, "mode": "mock", "error": str(e)}
        )
