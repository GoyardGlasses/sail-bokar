"""
Delay prediction endpoints.
"""

from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from ..schemas import DelayPredictionRequest, DelayPredictionResponse
from ..models_loader import predict_delay, models_loader
from ..utils import app_logger

router = APIRouter(prefix="/predict", tags=["Delay Prediction"])

@router.post("/delay", response_model=DelayPredictionResponse)
async def predict_route_delay(request: DelayPredictionRequest):
    """
    Predict delay for a dispatch route.
    
    - **route**: Route name (e.g., Kolkata-Bokaro)
    - **tonnes_dispatched**: Tonnes being dispatched
    - **material_type**: Material type
    - **weather_condition**: Current weather condition (optional)
    """
    try:
        if not models_loader.is_model_loaded('delay_classifier') or not models_loader.is_model_loaded('delay_regressor'):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Delay models not available"
            )
        
        result = predict_delay(
            request.route,
            request.tonnes_dispatched,
            request.material_type,
            request.weather_condition
        )
        
        return DelayPredictionResponse(
            status="success",
            timestamp=datetime.utcnow(),
            data=result
        )
    except Exception as e:
        app_logger.error(f"Delay prediction error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )
