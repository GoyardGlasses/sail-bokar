"""
Optimization endpoints - OR-Tools solver integration.
"""

from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from typing import Dict, Any
from ..schemas import OptimizationRequest, OptimizationResponse
from ..services import optimize_service
from ..utils import app_logger

router = APIRouter(prefix="/optimize", tags=["Optimization"])

@router.post("/dispatch", response_model=OptimizationResponse)
async def optimize_dispatch(request: OptimizationRequest):
    """
    Optimize dispatch plan using OR-Tools CP-SAT solver.
    
    This endpoint:
    1. Calls ML inference functions to get predictions
    2. Builds optimizer input with ML outputs
    3. Runs OR-Tools solver (with greedy fallback)
    4. Returns optimized dispatch plan
    
    - **orders**: List of customer orders
    - **available_rakes**: Number of available rakes
    - **available_trucks**: Number of available trucks
    - **inventory**: Current inventory by material
    """
    try:
        # Convert request to dict
        request_dict = request.dict()
        
        app_logger.info(f"Optimization request: {len(request_dict.get('orders', []))} orders")
        
        # Build optimizer input with ML predictions
        optimizer_input = optimize_service.build_optimizer_input(request_dict)
        
        # Run optimizer
        solution = optimize_service.run_optimizer(optimizer_input)
        
        # Format response
        return OptimizationResponse(
            status="success",
            timestamp=datetime.utcnow(),
            data={
                "rakes": solution.get('rakes', []),
                "trucks": solution.get('trucks', []),
                "summary": solution.get('summary', {}),
                "solver_status": solution.get('solver_status', 'UNKNOWN'),
                "solver_time_seconds": solution.get('solver_time_seconds', 0),
                "objective_value": solution.get('objective_value', 0),
            }
        )
    except Exception as e:
        app_logger.error(f"Optimization error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Optimization failed: {str(e)}"
        )
