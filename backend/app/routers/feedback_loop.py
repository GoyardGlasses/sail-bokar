"""
Feedback Loop & Retraining API Router - Phase 2 Feature 3
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from app.services.feedback_loop_service import FeedbackLoopService, FeedbackType

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/feedback", tags=["feedback"])

feedback_service = FeedbackLoopService()

@router.post("/submit")
async def submit_feedback(feedback_type: str, reference_id: str, actual_value: Any,
                         predicted_value: Any, score: float, notes: str = ""):
    """Submit feedback on prediction"""
    try:
        feedback_enum = FeedbackType(feedback_type)
        feedback = feedback_service.submit_feedback(
            feedback_enum, reference_id, actual_value, predicted_value, score, notes
        )
        return feedback.to_dict()
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid feedback type: {feedback_type}")
    except Exception as e:
        logger.error(f"Submit feedback error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/feedback")
async def get_feedback(feedback_type: Optional[str] = None, limit: int = 100):
    """Get feedback history"""
    try:
        feedback_enum = FeedbackType(feedback_type) if feedback_type else None
        feedback = feedback_service.get_feedback(feedback_enum, limit)
        return {
            'total': len(feedback),
            'feedback': feedback,
            'timestamp': datetime.now().isoformat()
        }
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid feedback type: {feedback_type}")
    except Exception as e:
        logger.error(f"Get feedback error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models/performance")
async def get_model_performance(model_name: Optional[str] = None):
    """Get model performance metrics"""
    try:
        performance = feedback_service.get_model_performance(model_name)
        return {
            'total_models': len(performance),
            'models': performance,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get performance error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/retrain")
async def trigger_retraining(model_name: str, reason: str):
    """Trigger model retraining"""
    try:
        job = feedback_service.trigger_retraining(model_name, reason)
        return job.to_dict()
    except Exception as e:
        logger.error(f"Trigger retraining error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/retraining-jobs")
async def get_retraining_jobs(limit: int = 50):
    """Get retraining jobs"""
    try:
        jobs = feedback_service.get_retraining_jobs(limit)
        return {
            'total': len(jobs),
            'jobs': jobs,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get retraining jobs error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/drift-detection")
async def get_drift_detection():
    """Get data drift detection results"""
    try:
        drift = feedback_service.get_drift_detection()
        return drift
    except Exception as e:
        logger.error(f"Drift detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status():
    """Get feedback loop service status"""
    try:
        status = feedback_service.get_status()
        return status
    except Exception as e:
        logger.error(f"Status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check"""
    return {
        'status': 'healthy',
        'service': 'feedback_loop',
        'timestamp': datetime.now().isoformat()
    }
