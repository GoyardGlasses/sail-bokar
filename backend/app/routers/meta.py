"""
Metadata and health check endpoints.
"""

from fastapi import APIRouter, status, HTTPException, Header
from datetime import datetime
from typing import Optional
from ..schemas import HealthCheckResponse, MetadataResponse, BaseResponse
from ..models_loader import models_loader
from ..config import settings
from ..utils import app_logger
from ..utils.metrics import metrics_collector
from ..utils.model_registry import model_registry

router = APIRouter(prefix="/meta", tags=["Metadata"])

@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """
    Check API health and model availability.
    """
    loaded_models = models_loader.get_loaded_models()
    models_loaded = sum(1 for v in loaded_models.values() if v)
    models_failed = len(loaded_models) - models_loaded
    
    return HealthCheckResponse(
        status="healthy" if models_failed == 0 else "degraded",
        timestamp=datetime.utcnow(),
        models_loaded=models_loaded,
        models_failed=models_failed,
        version=settings.APP_VERSION
    )

@router.get("/models", response_model=MetadataResponse)
async def get_models_info():
    """
    Get information about all trained models.
    """
    loaded_models = models_loader.get_loaded_models()
    load_errors = models_loader.get_load_errors()
    
    models_info = {
        "demand": {
            "name": "Demand Forecasting",
            "type": "LightGBM Regressor",
            "status": "loaded" if loaded_models['demand'] else "failed",
            "file_path": str(settings.DEMAND_MODEL_PATH),
            "error": load_errors.get('demand'),
        },
        "rake_availability": {
            "name": "Rake Availability Forecasting",
            "type": "LightGBM Regressor",
            "status": "loaded" if loaded_models['rake_availability'] else "failed",
            "file_path": str(settings.RAKE_AVAILABILITY_MODEL_PATH),
            "error": load_errors.get('rake_availability'),
        },
        "delay_classifier": {
            "name": "Delay Prediction (Classifier)",
            "type": "XGBoost Classifier",
            "status": "loaded" if loaded_models['delay_classifier'] else "failed",
            "file_path": str(settings.DELAY_CLASSIFIER_MODEL_PATH),
            "error": load_errors.get('delay_classifier'),
        },
        "delay_regressor": {
            "name": "Delay Prediction (Regressor)",
            "type": "XGBoost Regressor",
            "status": "loaded" if loaded_models['delay_regressor'] else "failed",
            "file_path": str(settings.DELAY_REGRESSOR_MODEL_PATH),
            "error": load_errors.get('delay_regressor'),
        },
        "throughput": {
            "name": "Loading Point Throughput",
            "type": "LightGBM Regressor",
            "status": "loaded" if loaded_models['throughput'] else "failed",
            "file_path": str(settings.THROUGHPUT_MODEL_PATH),
            "error": load_errors.get('throughput'),
        },
        "cost": {
            "name": "Cost Prediction",
            "type": "LightGBM Regressor",
            "status": "loaded" if loaded_models['cost'] else "failed",
            "file_path": str(settings.COST_MODEL_PATH),
            "error": load_errors.get('cost'),
        },
        "mode_classifier": {
            "name": "Transport Mode Classifier",
            "type": "LightGBM Binary Classifier",
            "status": "loaded" if loaded_models['mode_classifier'] else "failed",
            "file_path": str(settings.MODE_CLASSIFIER_MODEL_PATH),
            "error": load_errors.get('mode_classifier'),
        },
    }
    
    return MetadataResponse(
        status="success",
        timestamp=datetime.utcnow(),
        data=models_info
    )

@router.get("/config", response_model=MetadataResponse)
async def get_config():
    """
    Get API configuration (non-sensitive).
    """
    config_info = {
        "app_name": settings.APP_NAME,
        "app_version": settings.APP_VERSION,
        "host": settings.HOST,
        "port": settings.PORT,
        "debug": settings.DEBUG,
        "materials": settings.MATERIALS,
        "destinations": settings.DESTINATIONS,
        "loading_points": settings.LOADING_POINTS,
        "transport_modes": settings.TRANSPORT_MODES,
        "priorities": settings.PRIORITIES,
    }
    
    return MetadataResponse(
        status="success",
        timestamp=datetime.utcnow(),
        data=config_info
    )

@router.get("/metrics", response_model=MetadataResponse)
async def get_metrics():
    """
    Get system metrics (Prometheus-compatible).
    """
    metrics = metrics_collector.get_metrics()
    
    return MetadataResponse(
        status="success",
        timestamp=datetime.utcnow(),
        data=metrics
    )

@router.get("/metrics/prometheus")
async def get_prometheus_metrics():
    """
    Get metrics in Prometheus text format.
    """
    return metrics_collector.get_prometheus_metrics()

@router.post("/reload-models", response_model=MetadataResponse)
async def reload_models(x_api_token: Optional[str] = Header(None)):
    """
    Reload all ML models (admin endpoint).
    
    Requires: X-API-Token header matching ADMIN_TOKEN env var
    """
    admin_token = settings.ADMIN_TOKEN
    
    if not admin_token or x_api_token != admin_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing admin token"
        )
    
    try:
        app_logger.info("Admin: Reloading models...")
        
        model_paths = {
            'demand': settings.DEMAND_MODEL_PATH,
            'rake_availability': settings.RAKE_AVAILABILITY_MODEL_PATH,
            'delay_classifier': settings.DELAY_CLASSIFIER_MODEL_PATH,
            'delay_regressor': settings.DELAY_REGRESSOR_MODEL_PATH,
            'throughput': settings.THROUGHPUT_MODEL_PATH,
            'cost': settings.COST_MODEL_PATH,
            'mode_classifier': settings.MODE_CLASSIFIER_MODEL_PATH,
        }
        
        results = model_registry.reload_models(model_paths)
        
        return MetadataResponse(
            status="success",
            timestamp=datetime.utcnow(),
            data={
                'reload_results': results,
                'registry_status': model_registry.get_status()
            }
        )
    except Exception as e:
        app_logger.error(f"Model reload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model reload failed: {str(e)}"
        )
