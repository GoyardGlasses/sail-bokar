"""
Forecast prediction endpoints.
"""

from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from ..schemas import (
    DemandForecastRequest, DemandForecastResponse,
    RakeAvailabilityRequest, RakeAvailabilityResponse,
    BaseResponse
)
from ..models_loader import predict_demand, predict_rake_availability, models_loader
from ..utils import app_logger

router = APIRouter(prefix="/predict", tags=["Forecasting"])

@router.post("/demand", response_model=DemandForecastResponse)
async def forecast_demand(request: DemandForecastRequest):
    """
    Predict demand for a material-destination pair.
    
    - **material_type**: Type of material (HR_Coils, CR_Coils, etc.)
    - **destination**: Destination (Kolkata, Patna, etc.)
    - **quantity_tonnes**: Quantity in tonnes
    - **priority**: Priority level (HIGH, MEDIUM, LOW)
    """
    try:
        if not models_loader.is_model_loaded('demand'):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Demand model not available"
            )
        
        result = predict_demand(
            request.material_type,
            request.destination,
            request.quantity_tonnes,
            request.priority
        )
        
        return DemandForecastResponse(
            status="success",
            timestamp=datetime.utcnow(),
            data=result
        )
    except Exception as e:
        app_logger.error(f"Demand forecast error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )

@router.post("/rake-availability", response_model=RakeAvailabilityResponse)
async def forecast_rake_availability(request: RakeAvailabilityRequest):
    """
    Predict rake availability for a given date and destination.
    
    - **date**: Date in YYYY-MM-DD format
    - **destination**: Destination
    - **material_type**: Material type
    """
    try:
        if not models_loader.is_model_loaded('rake_availability'):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Rake availability model not available"
            )
        
        result = predict_rake_availability(
            request.date,
            request.destination,
            request.material_type
        )
        
        return RakeAvailabilityResponse(
            status="success",
            timestamp=datetime.utcnow(),
            data=result
        )
    except Exception as e:
        app_logger.error(f"Rake availability forecast error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )
