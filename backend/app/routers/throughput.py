"""
Throughput prediction endpoints.
"""

from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from ..schemas import ThroughputPredictionRequest, ThroughputPredictionResponse
from ..models_loader import predict_throughput, models_loader
from ..utils import app_logger

router = APIRouter(prefix="/predict", tags=["Throughput Prediction"])

@router.post("/throughput", response_model=ThroughputPredictionResponse)
async def predict_loading_point_throughput(request: ThroughputPredictionRequest):
    """
    Predict loading point throughput (TPH).
    
    - **loading_point**: Loading point ID (LP1, LP2, LP3)
    - **material_type**: Material type
    - **equipment_operational_count**: Number of operational equipment
    - **shift**: Shift (Morning, Afternoon, Night)
    """
    try:
        if not models_loader.is_model_loaded('throughput'):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Throughput model not available"
            )
        
        result = predict_throughput(
            request.loading_point,
            request.material_type,
            request.equipment_operational_count,
            request.shift
        )
        
        return ThroughputPredictionResponse(
            status="success",
            timestamp=datetime.utcnow(),
            data=result
        )
    except Exception as e:
        app_logger.error(f"Throughput prediction error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )
