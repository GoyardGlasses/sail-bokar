"""
Advanced multi-objective optimization endpoints.
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

from ..services.advanced_optimization_service import advanced_optimization_service
from ..utils import app_logger

router = APIRouter(prefix="/optimize", tags=["Advanced Optimization"])


class Order(BaseModel):
    """Order definition."""
    id: str
    material: str
    destination: str
    quantity: float
    distance: Optional[float] = 500
    priority: Optional[str] = "MEDIUM"


class OptimizeRoutesRequest(BaseModel):
    """Request for route optimization."""
    orders: List[Order]
    constraints: Optional[Dict[str, Any]] = None


class Node(BaseModel):
    """Network node."""
    id: str
    name: str
    capacity: float
    location: str


class Edge(BaseModel):
    """Network edge."""
    from_node: str
    to_node: str
    distance: float
    cost: Optional[float] = None


class OptimizeNetworkRequest(BaseModel):
    """Request for network optimization."""
    nodes: List[Node]
    edges: List[Edge]


@router.post("/routes/multi-objective")
async def optimize_routes_multi_objective(request: OptimizeRoutesRequest):
    """
    Perform multi-objective route optimization using NSGA2.
    
    Optimizes for:
    - Minimum transportation cost
    - Minimum delivery time
    - Maximum efficiency
    
    Returns Pareto front of non-dominated solutions.
    """
    try:
        if not request.orders:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one order is required"
            )
        
        orders = [o.dict() for o in request.orders]
        constraints = request.constraints or {}
        
        result = advanced_optimization_service.optimize_routes(orders, constraints)
        
        return {
            'status': 'success',
            'data': result,
            'timestamp': datetime.utcnow().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Route optimization error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Optimization failed: {str(e)}"
        )


@router.post("/network/design")
async def optimize_network_design(request: OptimizeNetworkRequest):
    """
    Optimize supply chain network design.
    
    Analyzes network topology and provides recommendations for:
    - Node consolidation
    - Hub location optimization
    - Distance reduction
    """
    try:
        if not request.nodes or not request.edges:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nodes and edges are required"
            )
        
        nodes = [n.dict() for n in request.nodes]
        edges = [e.dict() for e in request.edges]
        
        result = advanced_optimization_service.optimize_network(nodes, edges)
        
        return {
            'status': 'success',
            'data': result,
            'timestamp': datetime.utcnow().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Network optimization error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Network optimization failed: {str(e)}"
        )


@router.get("/routes/comparison")
async def get_optimization_comparison():
    """
    Get comparison of different optimization approaches.
    """
    try:
        comparison = {
            'methods': [
                {
                    'name': 'NSGA2 Multi-Objective',
                    'description': 'Evolutionary algorithm for Pareto optimization',
                    'advantages': ['Multiple objectives', 'Scalable', 'Non-dominated solutions'],
                    'computation_time': 'Medium'
                },
                {
                    'name': 'Greedy Heuristic',
                    'description': 'Fast greedy approach',
                    'advantages': ['Fast', 'Simple', 'Good for small instances'],
                    'computation_time': 'Fast'
                },
                {
                    'name': 'Dynamic Programming',
                    'description': 'Optimal for specific problem structures',
                    'advantages': ['Optimal solutions', 'Deterministic'],
                    'computation_time': 'Slow'
                }
            ],
            'recommendation': 'Use NSGA2 for balanced cost-time-efficiency optimization'
        }
        
        return {
            'status': 'success',
            'data': comparison,
            'timestamp': datetime.utcnow().isoformat()
        }
    except Exception as e:
        app_logger.error(f"Comparison error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate comparison: {str(e)}"
        )
