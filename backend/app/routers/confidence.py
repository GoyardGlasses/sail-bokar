"""
Confidence Indicators API Router - Phase 1 Feature 3
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from app.services.confidence_service import ConfidenceService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/confidence", tags=["confidence"])

confidence_service = ConfidenceService()

class ConfidenceResponse(BaseModel):
    plan_id: str
    overall_confidence: float
    overall_level: str
    indicators: List[Dict]
    recommendations: List[str]
    timestamp: str

@router.post("/analyze")
async def analyze_confidence(plan: Dict[str, Any]):
    """Analyze confidence of plan predictions"""
    try:
        result = confidence_service.analyze_plan_confidence(plan)
        return result
    except Exception as e:
        logger.error(f"Confidence analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze/trigger")
async def analyze_trigger():
    """Trigger confidence analysis with mock data"""
    try:
        plan = {
            'id': f'PLAN-{int(datetime.now().timestamp())}',
            'predictions': {
                'demand_forecast': {'total_demand': 5500, 'confidence': 0.82},
                'delay_forecast': {
                    'confidence': 0.75,
                    'avg_delay_probability': 0.35,
                    'delays': [{'estimated_delay_hours': 4}]
                },
                'cost_forecast': {'avg_cost_per_tonne': 65, 'confidence': 0.88}
            }
        }
        
        result = confidence_service.analyze_plan_confidence(plan)
        return result
    except Exception as e:
        logger.error(f"Trigger analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/indicators")
async def get_indicators(limit: int = 100):
    """Get all confidence indicators"""
    try:
        indicators = confidence_service.get_all_indicators(limit)
        return {
            'total': len(indicators),
            'indicators': indicators,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get indicators error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trend/{prediction_type}")
async def get_trend(prediction_type: str, days: int = 7):
    """Get confidence trend for a prediction type"""
    try:
        trend = confidence_service.get_confidence_trend(prediction_type, days)
        return trend
    except Exception as e:
        logger.error(f"Get trend error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status():
    """Get confidence service status"""
    try:
        status = confidence_service.get_status()
        return status
    except Exception as e:
        logger.error(f"Status check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check"""
    return {
        'status': 'healthy',
        'service': 'confidence',
        'timestamp': datetime.now().isoformat()
    }
