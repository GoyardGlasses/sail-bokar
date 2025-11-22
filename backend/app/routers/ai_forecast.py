"""
AI-powered demand forecasting endpoints.
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from ..services.demand_forecast_service import demand_forecast_service
from ..utils import app_logger

router = APIRouter(prefix="/forecast", tags=["AI Forecasting"])


class ForecastRequest(BaseModel):
    """Request for demand forecast."""
    material: str
    periods: Optional[int] = 30


class TrainForecastRequest(BaseModel):
    """Request to train forecast model."""
    material: str
    historical_data: Optional[List[dict]] = None


@router.post("/demand/train")
async def train_demand_forecast(request: TrainForecastRequest):
    """
    Train AI demand forecasting model for a material.
    
    - **material**: Material type (HR_Coils, CR_Coils, etc.)
    - **historical_data**: Optional historical demand data
    """
    try:
        result = demand_forecast_service.train_forecast_model(
            material=request.material,
            historical_data=None  # Will use synthetic data if not provided
        )
        
        return {
            'status': 'success',
            'data': result,
            'timestamp': datetime.utcnow().isoformat()
        }
    except Exception as e:
        app_logger.error(f"Forecast training error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Training failed: {str(e)}"
        )


@router.post("/demand/predict")
async def predict_demand(request: ForecastRequest):
    """
    Generate AI-powered demand forecast for a material.
    
    Uses Prophet time series forecasting with:
    - Yearly seasonality
    - Weekly seasonality
    - Trend analysis
    - Confidence intervals
    
    - **material**: Material type
    - **periods**: Number of days to forecast (default: 30)
    """
    try:
        if not request.material:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Material is required"
            )
        
        result = demand_forecast_service.forecast_demand(
            material=request.material,
            periods=request.periods
        )
        
        return {
            'status': 'success',
            'data': result,
            'timestamp': datetime.utcnow().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"Demand prediction error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.get("/demand/{material}/accuracy")
async def get_forecast_accuracy(material: str):
    """
    Get accuracy metrics for a material's forecast model.
    
    Returns:
    - MAE (Mean Absolute Error)
    - RMSE (Root Mean Squared Error)
    - MAPE (Mean Absolute Percentage Error)
    - Performance thresholds
    """
    try:
        metrics = demand_forecast_service.get_forecast_accuracy_metrics(material)
        
        return {
            'status': 'success',
            'data': metrics,
            'timestamp': datetime.utcnow().isoformat()
        }
    except Exception as e:
        app_logger.error(f"Accuracy metrics error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve accuracy metrics: {str(e)}"
        )


@router.get("/demand/all-materials")
async def forecast_all_materials(periods: Optional[int] = 30):
    """
    Generate forecasts for all materials.
    
    - **periods**: Number of days to forecast
    """
    try:
        materials = ['HR_Coils', 'CR_Coils', 'Plates', 'Wire_Rods', 'TMT_Bars', 'Pig_Iron', 'Billets']
        
        forecasts = []
        for material in materials:
            forecast = demand_forecast_service.forecast_demand(material, periods)
            forecasts.append(forecast)
        
        return {
            'status': 'success',
            'data': {
                'total_materials': len(materials),
                'forecasts': forecasts
            },
            'timestamp': datetime.utcnow().isoformat()
        }
    except Exception as e:
        app_logger.error(f"Multi-material forecast error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Forecast generation failed: {str(e)}"
        )


@router.get("/demand/comparison")
async def get_forecast_comparison():
    """
    Get comparison of different forecasting methods.
    """
    try:
        comparison = {
            'methods': [
                {
                    'name': 'Prophet (Facebook)',
                    'description': 'Time series forecasting with seasonality',
                    'advantages': ['Handles seasonality', 'Robust to missing data', 'Confidence intervals'],
                    'accuracy': 'High',
                    'computation_time': 'Fast'
                },
                {
                    'name': 'ARIMA',
                    'description': 'AutoRegressive Integrated Moving Average',
                    'advantages': ['Statistical foundation', 'Good for stationary data'],
                    'accuracy': 'Medium',
                    'computation_time': 'Medium'
                },
                {
                    'name': 'LSTM Neural Network',
                    'description': 'Deep learning time series model',
                    'advantages': ['Captures complex patterns', 'Non-linear relationships'],
                    'accuracy': 'Very High',
                    'computation_time': 'Slow'
                },
                {
                    'name': 'Exponential Smoothing',
                    'description': 'Simple smoothing technique',
                    'advantages': ['Fast', 'Simple', 'Good baseline'],
                    'accuracy': 'Low-Medium',
                    'computation_time': 'Very Fast'
                }
            ],
            'recommendation': 'Use Prophet for balanced accuracy and speed'
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
