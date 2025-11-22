"""
Transport mode classification endpoints.
"""

from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from ..schemas import ModeClassificationRequest, ModeClassificationResponse
from ..models_loader import predict_transport_mode, models_loader
from ..utils import app_logger

router = APIRouter(prefix="/predict", tags=["Mode Classification"])

@router.post("/mode", response_model=ModeClassificationResponse)
async def classify_transport_mode(request: ModeClassificationRequest):
    """
    Classify optimal transport mode (RAIL vs ROAD).
    
    - **quantity_tonnes**: Quantity in tonnes
    - **distance_km**: Distance in km
    - **priority**: Priority level (HIGH, MEDIUM, LOW)
    - **destination**: Destination
    - **material_type**: Material type
    """
    try:
        if not models_loader.is_model_loaded('mode_classifier'):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Mode classifier model not available"
            )
        
        result = predict_transport_mode(
            request.quantity_tonnes,
            request.distance_km,
            request.priority,
            request.destination,
            request.material_type
        )
        
        return ModeClassificationResponse(
            status="success",
            timestamp=datetime.utcnow(),
            data=result
        )
    except Exception as e:
        app_logger.error(f"Mode classification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )
