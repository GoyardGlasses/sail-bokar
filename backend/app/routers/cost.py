"""
Cost prediction endpoints.
"""

from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from ..schemas import CostPredictionRequest, CostPredictionResponse
from ..models_loader import predict_cost, models_loader
from ..utils import app_logger

router = APIRouter(prefix="/predict", tags=["Cost Prediction"])

@router.post("/cost", response_model=CostPredictionResponse)
async def predict_dispatch_cost(request: CostPredictionRequest):
    """
    Predict dispatch cost (freight + handling + demurrage).
    
    - **route**: Route name
    - **tonnes_dispatched**: Tonnes being dispatched
    - **delay_hours**: Estimated delay hours
    - **material_type**: Material type
    """
    try:
        if not models_loader.is_model_loaded('cost'):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Cost model not available"
            )
        
        result = predict_cost(
            request.route,
            request.tonnes_dispatched,
            request.delay_hours,
            request.material_type
        )
        
        return CostPredictionResponse(
            status="success",
            timestamp=datetime.utcnow(),
            data=result
        )
    except Exception as e:
        app_logger.error(f"Cost prediction error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )
