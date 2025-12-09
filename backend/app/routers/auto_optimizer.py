"""
Auto-Optimizer API Router - Phase 1
Endpoints for automatic optimization and plan generation
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from app.services.auto_optimizer_service import AutoOptimizerService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auto-optimizer", tags=["auto-optimizer"])

# Initialize service
auto_optimizer = AutoOptimizerService()

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class Order(BaseModel):
    id: str
    tonnage: float
    destination: str
    material: str
    urgency: float = 0.5
    created_at: Optional[str] = None

class OptimizationRequest(BaseModel):
    orders: List[Order]
    stock: Dict[str, float]
    rakes: List[Dict[str, Any]]

class OptimizationResponse(BaseModel):
    plan_id: str
    status: str
    risk_level: str
    risk_score: float
    auto_publish_eligible: bool
    orders: int
    total_tonnage: float
    rakes_needed: int
    estimated_cost_savings: float
    estimated_time_savings: float
    recommendations: List[str]
    created_at: str

class AutoOptimizerStatus(BaseModel):
    status: str
    last_optimization: Optional[str]
    optimization_count: int
    next_scheduled_run: str
    plans_generated: int
    auto_published_plans: int

# ============================================================================
# OPTIMIZATION ENDPOINTS
# ============================================================================

@router.post("/optimize", response_model=OptimizationResponse)
async def run_optimization(request: OptimizationRequest, background_tasks: BackgroundTasks):
    """
    Run optimization immediately
    Returns plan with risk assessment and auto-publish eligibility
    """
    try:
        logger.info(f"Running optimization for {len(request.orders)} orders")
        
        # Run optimization
        plan = auto_optimizer.run_optimization(
            orders=[o.dict() for o in request.orders],
            stock=request.stock,
            rakes=request.rakes
        )
        
        # Auto-publish if eligible
        if plan.get('auto_publish_eligible', False):
            background_tasks.add_task(auto_optimizer.auto_publish_plan, plan)
            logger.info(f"Plan {plan['id']} scheduled for auto-publish")
        
        return OptimizationResponse(
            plan_id=plan['id'],
            status=plan['status'],
            risk_level=plan['risk_assessment']['risk_level'],
            risk_score=plan['risk_assessment']['risk_score'],
            auto_publish_eligible=plan['auto_publish_eligible'],
            orders=plan['orders'],
            total_tonnage=plan['total_tonnage'],
            rakes_needed=plan['rakes_needed'],
            estimated_cost_savings=plan['estimated_cost_savings'],
            estimated_time_savings=plan['estimated_time_savings'],
            recommendations=plan['recommendations'],
            created_at=plan['created_at']
        )
    
    except Exception as e:
        logger.error(f"Optimization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimize/trigger")
async def trigger_optimization(background_tasks: BackgroundTasks):
    """
    Trigger optimization with mock data
    Useful for testing and demo
    """
    try:
        # Mock data
        orders = [
            Order(id="ORD-001", tonnage=500, destination="Bokaro-Kolkata", material="iron_ore", urgency=0.6),
            Order(id="ORD-002", tonnage=300, destination="Bokaro-Dhanbad", material="coal", urgency=0.4),
            Order(id="ORD-003", tonnage=400, destination="Bokaro-Patna", material="limestone", urgency=0.5),
            Order(id="ORD-004", tonnage=600, destination="Bokaro-Haldia", material="iron_ore", urgency=0.7),
            Order(id="ORD-005", tonnage=350, destination="Bokaro-Ranchi", material="coal", urgency=0.3),
        ]
        
        stock = {
            "iron_ore": 2000,
            "coal": 1500,
            "limestone": 1200
        }
        
        rakes = [
            {"id": "RAKE-001", "capacity": 500, "status": "available"},
            {"id": "RAKE-002", "capacity": 500, "status": "available"},
            {"id": "RAKE-003", "capacity": 500, "status": "available"},
        ]
        
        request = OptimizationRequest(orders=orders, stock=stock, rakes=rakes)
        
        # Run optimization
        plan = auto_optimizer.run_optimization(
            orders=[o.dict() for o in request.orders],
            stock=request.stock,
            rakes=request.rakes
        )
        
        # Auto-publish if eligible
        if plan.get('auto_publish_eligible', False):
            background_tasks.add_task(auto_optimizer.auto_publish_plan, plan)
        
        return {
            "status": "success",
            "plan_id": plan['id'],
            "plan_status": plan['status'],
            "risk_level": plan['risk_assessment']['risk_level'],
            "auto_publish_eligible": plan['auto_publish_eligible'],
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Trigger optimization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status", response_model=AutoOptimizerStatus)
async def get_status():
    """Get auto-optimizer status"""
    try:
        status = auto_optimizer.get_status()
        return AutoOptimizerStatus(**status)
    except Exception as e:
        logger.error(f"Status check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_history(limit: int = 10):
    """Get optimization history"""
    try:
        history = auto_optimizer.get_history(limit=limit)
        return {
            "total_plans": len(history),
            "plans": history,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"History error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check for auto-optimizer"""
    return {
        "status": "healthy",
        "service": "auto_optimizer",
        "timestamp": datetime.now().isoformat()
    }

# ============================================================================
# PLAN MANAGEMENT ENDPOINTS
# ============================================================================

@router.post("/plans/{plan_id}/publish")
async def publish_plan(plan_id: str):
    """Manually publish a plan"""
    try:
        history = auto_optimizer.get_history(limit=100)
        plan = next((p for p in history if p['id'] == plan_id), None)
        
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        
        if plan.get('status') == 'auto_published':
            raise HTTPException(status_code=400, detail="Plan already published")
        
        plan['status'] = 'published'
        plan['published_at'] = datetime.now().isoformat()
        plan['published_by'] = 'manual'
        
        return {
            "status": "success",
            "plan_id": plan_id,
            "plan_status": plan['status'],
            "published_at": plan['published_at']
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Publish error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plans/{plan_id}")
async def get_plan(plan_id: str):
    """Get plan details"""
    try:
        history = auto_optimizer.get_history(limit=100)
        plan = next((p for p in history if p['id'] == plan_id), None)
        
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        
        return plan
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get plan error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plans")
async def list_plans(limit: int = 20):
    """List all plans"""
    try:
        history = auto_optimizer.get_history(limit=limit)
        return {
            "total_plans": len(history),
            "plans": history,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"List plans error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_stats():
    """Get auto-optimizer statistics"""
    try:
        status = auto_optimizer.get_status()
        history = auto_optimizer.get_history(limit=100)
        
        auto_published = len([p for p in history if p.get('status') == 'auto_published'])
        manual_published = len([p for p in history if p.get('status') == 'published'])
        pending = len([p for p in history if p.get('status') == 'pending_approval'])
        
        return {
            "total_optimizations": status['optimization_count'],
            "total_plans": len(history),
            "auto_published_plans": auto_published,
            "manual_published_plans": manual_published,
            "pending_approval": pending,
            "auto_publish_rate": auto_published / len(history) if history else 0,
            "avg_cost_savings": sum(p.get('estimated_cost_savings', 0) for p in history) / len(history) if history else 0,
            "avg_time_savings": sum(p.get('estimated_time_savings', 0) for p in history) / len(history) if history else 0,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
