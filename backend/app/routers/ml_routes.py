"""
ML Routes - Connect ML infrastructure to website
Safe integration without breaking existing functionality
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import Dict, List, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ml", tags=["ml"])

# ============================================================================
# DEPENDENCY INJECTION
# ============================================================================

def get_db():
    """Get database session"""
    from app.db import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============================================================================
# PREDICTION ENDPOINTS
# ============================================================================

@router.post("/predict/delay")
async def predict_delay(
    input_data: Dict,
    db: Session = Depends(get_db)
):
    """Predict shipment delay"""
    try:
        from ml.model_serving import ModelServer
        from ml.model_training import ModelTrainer
        
        trainer = ModelTrainer(db)
        server = ModelServer(db, trainer)
        result = server.predict_delay(input_data)
        
        return {
            "status": "success",
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error predicting delay: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.post("/predict/cost")
async def predict_cost(
    input_data: Dict,
    db: Session = Depends(get_db)
):
    """Predict shipping cost"""
    try:
        from ml.model_serving import ModelServer
        from ml.model_training import ModelTrainer
        
        trainer = ModelTrainer(db)
        server = ModelServer(db, trainer)
        result = server.predict_cost(input_data)
        
        return {
            "status": "success",
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error predicting cost: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.post("/predict/quality")
async def predict_quality(
    input_data: Dict,
    db: Session = Depends(get_db)
):
    """Predict delivery quality"""
    try:
        from ml.model_serving import ModelServer
        from ml.model_training import ModelTrainer
        
        trainer = ModelTrainer(db)
        server = ModelServer(db, trainer)
        result = server.predict_quality(input_data)
        
        return {
            "status": "success",
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error predicting quality: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.post("/predict/fuel")
async def predict_fuel(
    input_data: Dict,
    db: Session = Depends(get_db)
):
    """Predict fuel consumption"""
    try:
        from ml.model_serving import ModelServer
        from ml.model_training import ModelTrainer
        
        trainer = ModelTrainer(db)
        server = ModelServer(db, trainer)
        result = server.predict_fuel(input_data)
        
        return {
            "status": "success",
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error predicting fuel: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.post("/predict/demand")
async def predict_demand(
    input_data: Dict,
    db: Session = Depends(get_db)
):
    """Predict demand"""
    try:
        from ml.model_serving import ModelServer
        from ml.model_training import ModelTrainer
        
        trainer = ModelTrainer(db)
        server = ModelServer(db, trainer)
        result = server.predict_demand(input_data)
        
        return {
            "status": "success",
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error predicting demand: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

# ============================================================================
# OPTIMIZATION ENDPOINTS
# ============================================================================

@router.post("/optimize/route")
async def optimize_route(
    input_data: Dict,
    db: Session = Depends(get_db)
):
    """Optimize route"""
    try:
        from ml.model_serving import ModelServer
        from ml.model_training import ModelTrainer
        
        trainer = ModelTrainer(db)
        server = ModelServer(db, trainer)
        result = server.optimize_route(input_data)
        
        return {
            "status": "success",
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error optimizing route: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.post("/optimize/cost")
async def optimize_cost(
    input_data: Dict,
    db: Session = Depends(get_db)
):
    """Optimize cost"""
    try:
        from ml.model_serving import ModelServer
        from ml.model_training import ModelTrainer
        
        trainer = ModelTrainer(db)
        server = ModelServer(db, trainer)
        result = server.optimize_cost(input_data)
        
        return {
            "status": "success",
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error optimizing cost: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.post("/optimize/time")
async def optimize_time(
    input_data: Dict,
    db: Session = Depends(get_db)
):
    """Optimize time"""
    try:
        from ml.model_serving import ModelServer
        from ml.model_training import ModelTrainer
        
        trainer = ModelTrainer(db)
        server = ModelServer(db, trainer)
        result = server.optimize_time(input_data)
        
        return {
            "status": "success",
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error optimizing time: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.post("/optimize/vehicle")
async def allocate_vehicle(
    input_data: Dict,
    db: Session = Depends(get_db)
):
    """Allocate vehicle"""
    try:
        from ml.model_serving import ModelServer
        from ml.model_training import ModelTrainer
        
        trainer = ModelTrainer(db)
        server = ModelServer(db, trainer)
        result = server.allocate_vehicle(input_data)
        
        return {
            "status": "success",
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error allocating vehicle: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.post("/optimize/material")
async def recommend_material(
    input_data: Dict,
    db: Session = Depends(get_db)
):
    """Recommend material"""
    try:
        from ml.model_serving import ModelServer
        from ml.model_training import ModelTrainer
        
        trainer = ModelTrainer(db)
        server = ModelServer(db, trainer)
        result = server.recommend_material(input_data)
        
        return {
            "status": "success",
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error recommending material: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

# ============================================================================
# RISK & DECISION ENDPOINTS
# ============================================================================

@router.post("/risk/assess")
async def assess_risk(
    input_data: Dict,
    db: Session = Depends(get_db)
):
    """Assess risk"""
    try:
        from ml.model_serving import ModelServer
        from ml.model_training import ModelTrainer
        
        trainer = ModelTrainer(db)
        server = ModelServer(db, trainer)
        result = server.assess_risk(input_data)
        
        return {
            "status": "success",
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error assessing risk: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.post("/decision/support")
async def support_decision(
    input_data: Dict,
    db: Session = Depends(get_db)
):
    """Support decision"""
    try:
        from ml.model_serving import ModelServer
        from ml.model_training import ModelTrainer
        
        trainer = ModelTrainer(db)
        server = ModelServer(db, trainer)
        result = server.support_decision(input_data)
        
        return {
            "status": "success",
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error supporting decision: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.post("/anomaly/detect")
async def detect_anomaly(
    input_data: Dict,
    db: Session = Depends(get_db)
):
    """Detect anomaly"""
    try:
        from ml.model_serving import ModelServer
        from ml.model_training import ModelTrainer
        
        trainer = ModelTrainer(db)
        server = ModelServer(db, trainer)
        result = server.detect_anomaly(input_data)
        
        return {
            "status": "success",
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error detecting anomaly: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

# ============================================================================
# DATA PIPELINE ENDPOINTS
# ============================================================================

@router.post("/data/collect-dispatch")
async def collect_dispatch(
    dispatch_info: Dict,
    db: Session = Depends(get_db)
):
    """Collect dispatch data"""
    try:
        from ml.data_pipeline import DataPipeline
        
        pipeline = DataPipeline(db)
        
        # Validate
        valid, errors = pipeline.validate_dispatch_data(dispatch_info)
        if not valid:
            return {
                "status": "error",
                "message": "Validation failed",
                "errors": errors
            }
        
        # Collect
        success = pipeline.collect_dispatch_data(dispatch_info)
        
        return {
            "status": "success" if success else "error",
            "message": "Dispatch data collected" if success else "Failed to collect data"
        }
    except Exception as e:
        logger.error(f"Error collecting dispatch: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

@router.post("/data/submit-feedback")
async def submit_feedback(
    feedback_data: Dict,
    db: Session = Depends(get_db)
):
    """Submit feedback"""
    try:
        from ml.feedback_monitoring import FeedbackLoop
        
        feedback = FeedbackLoop(db)
        success = feedback.submit_feedback(
            feedback_data.get('prediction_id'),
            feedback_data.get('actual_outcome'),
            feedback_data.get('feedback_type', 'correct')
        )
        
        return {
            "status": "success" if success else "error",
            "message": "Feedback submitted" if success else "Failed to submit feedback"
        }
    except Exception as e:
        logger.error(f"Error submitting feedback: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

# ============================================================================
# MONITORING ENDPOINTS
# ============================================================================

@router.get("/monitoring/dashboard")
async def get_monitoring_dashboard(db: Session = Depends(get_db)):
    """Get monitoring dashboard"""
    try:
        from ml.feedback_monitoring import ModelMonitor
        
        monitor = ModelMonitor(db)
        dashboard = monitor.get_monitoring_dashboard()
        
        return {
            "status": "success",
            "data": dashboard,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting dashboard: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

@router.get("/monitoring/alerts")
async def get_alerts(
    model_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get alerts"""
    try:
        from ml.feedback_monitoring import ModelMonitor
        
        monitor = ModelMonitor(db)
        alerts = monitor.get_model_alerts(model_name)
        
        return {
            "status": "success",
            "data": alerts,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting alerts: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

@router.post("/monitoring/resolve-alert/{alert_id}")
async def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db)
):
    """Resolve alert"""
    try:
        from ml.feedback_monitoring import ModelMonitor
        
        monitor = ModelMonitor(db)
        success = monitor.resolve_alert(alert_id)
        
        return {
            "status": "success" if success else "error",
            "message": "Alert resolved" if success else "Failed to resolve alert"
        }
    except Exception as e:
        logger.error(f"Error resolving alert: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

# ============================================================================
# MODEL STATUS ENDPOINTS
# ============================================================================

@router.get("/models/status")
async def get_model_status(
    model_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get model status"""
    try:
        from ml.model_serving import ModelServer
        from ml.model_training import ModelTrainer
        
        trainer = ModelTrainer(db)
        server = ModelServer(db, trainer)
        status = server.get_model_status(model_name)
        
        return {
            "status": "success",
            "data": status,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting model status: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get("/health")
async def health_check():
    """Health check for ML infrastructure"""
    return {
        "status": "healthy",
        "service": "ML Infrastructure",
        "timestamp": datetime.utcnow().isoformat()
    }
