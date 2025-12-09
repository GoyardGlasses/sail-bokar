"""
Model Registry API Router - Phase 3 Feature 2
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from app.services.model_registry_service import ModelRegistryService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/models", tags=["models"])

registry_service = ModelRegistryService()

@router.post("/register")
async def register_model(model_name: str, version: str, accuracy: float, status: str = "development"):
    """Register a new model version"""
    try:
        model = registry_service.register_model(model_name, version, accuracy, status)
        return model.to_dict()
    except Exception as e:
        logger.error(f"Register error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/promote/{model_name}/{version}")
async def promote_to_production(model_name: str, version: str):
    """Promote model to production"""
    try:
        result = registry_service.promote_to_production(model_name, version)
        return result
    except Exception as e:
        logger.error(f"Promote error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/versions/{model_name}")
async def get_model_versions(model_name: str):
    """Get all versions of a model"""
    try:
        versions = registry_service.get_model_versions(model_name)
        return {
            'model_name': model_name,
            'total_versions': len(versions),
            'versions': versions,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get versions error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/production")
async def get_production_models():
    """Get all production models"""
    try:
        models = registry_service.get_production_models()
        return {
            'total_models': len(models),
            'models': models,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get production error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ab-test")
async def create_ab_test(model_name: str, version_a: str, version_b: str, traffic_split: float = 0.5):
    """Create A/B test"""
    try:
        ab_test = registry_service.create_ab_test(model_name, version_a, version_b, traffic_split)
        return ab_test.to_dict()
    except Exception as e:
        logger.error(f"AB test error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ab-tests")
async def get_ab_tests(status: Optional[str] = None, limit: int = 50):
    """Get A/B tests"""
    try:
        tests = registry_service.get_ab_tests(status, limit)
        return {
            'total': len(tests),
            'tests': tests,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get AB tests error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status():
    """Get model registry status"""
    try:
        status = registry_service.get_status()
        return status
    except Exception as e:
        logger.error(f"Status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check"""
    return {
        'status': 'healthy',
        'service': 'model_registry',
        'timestamp': datetime.now().isoformat()
    }
