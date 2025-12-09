"""
Auto-Alerts API Router - Phase 1 Feature 2
Endpoints for alert detection and mitigation
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from app.services.auto_alerts_service import AutoAlertsService, AlertSeverity

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auto-alerts", tags=["auto-alerts"])

# Initialize service
auto_alerts = AutoAlertsService()

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class AlertResponse(BaseModel):
    id: str
    type: str
    severity: str
    message: str
    plan_id: str
    affected_orders: List[str]
    data: Dict[str, Any]
    created_at: str
    status: str
    mitigations: List[Dict]

class MitigationResponse(BaseModel):
    id: str
    strategy: str
    description: str
    cost_impact: float
    time_impact: float
    effectiveness: float
    status: str

class AlertsAnalysisResponse(BaseModel):
    plan_id: str
    total_alerts: int
    critical_alerts: int
    high_alerts: int
    medium_alerts: int
    low_alerts: int
    alerts: List[AlertResponse]
    timestamp: str

class AutoAlertsStatus(BaseModel):
    status: str
    total_alerts: int
    active_alerts: int
    mitigated_alerts: int
    mitigations_applied: int
    timestamp: str

# ============================================================================
# ALERT ANALYSIS ENDPOINTS
# ============================================================================

@router.post("/analyze")
async def analyze_plan(plan: Dict[str, Any], background_tasks: BackgroundTasks):
    """
    Analyze plan and detect alerts
    Returns list of alerts with suggested mitigations
    """
    try:
        logger.info(f"Analyzing plan {plan.get('id')} for alerts...")
        
        # Analyze plan
        alerts = auto_alerts.analyze_plan(plan)
        
        # Count by severity
        critical = len([a for a in alerts if a.severity == "critical"])
        high = len([a for a in alerts if a.severity == "high"])
        medium = len([a for a in alerts if a.severity == "medium"])
        low = len([a for a in alerts if a.severity == "low"])
        
        return {
            "status": "success",
            "plan_id": plan.get('id'),
            "total_alerts": len(alerts),
            "critical_alerts": critical,
            "high_alerts": high,
            "medium_alerts": medium,
            "low_alerts": low,
            "alerts": [a.to_dict() for a in alerts],
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze/trigger")
async def analyze_trigger(background_tasks: BackgroundTasks):
    """
    Trigger analysis with mock plan data
    Useful for testing and demo
    """
    try:
        # Mock plan
        plan = {
            'id': f'PLAN-{int(datetime.now().timestamp())}',
            'orders': 5,
            'total_tonnage': 2150,
            'rakes_needed': 3,
            'allocations': [
                {'order_id': 'ORD-001', 'destination': 'Bokaro-Kolkata', 'tonnage': 500},
                {'order_id': 'ORD-002', 'destination': 'Bokaro-Dhanbad', 'tonnage': 300},
                {'order_id': 'ORD-003', 'destination': 'Bokaro-Kolkata', 'tonnage': 400},
                {'order_id': 'ORD-004', 'destination': 'Bokaro-Haldia', 'tonnage': 600},
                {'order_id': 'ORD-005', 'destination': 'Bokaro-Ranchi', 'tonnage': 350},
            ],
            'predictions': {
                'demand_forecast': {'total_demand': 5500, 'confidence': 0.85},
                'delay_forecast': {
                    'avg_delay_probability': 0.35,
                    'delays': [{'estimated_delay_hours': 4}]
                },
                'cost_forecast': {'avg_cost_per_tonne': 65, 'confidence': 0.88},
                'risk_factors': ['Low stock: coal (500T)', 'High urgency orders: 3']
            }
        }
        
        # Analyze
        alerts = auto_alerts.analyze_plan(plan)
        
        # Count by severity
        critical = len([a for a in alerts if a.severity == "critical"])
        high = len([a for a in alerts if a.severity == "high"])
        medium = len([a for a in alerts if a.severity == "medium"])
        low = len([a for a in alerts if a.severity == "low"])
        
        return {
            "status": "success",
            "plan_id": plan['id'],
            "total_alerts": len(alerts),
            "critical_alerts": critical,
            "high_alerts": high,
            "medium_alerts": medium,
            "low_alerts": low,
            "alerts": [a.to_dict() for a in alerts],
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Trigger analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ALERT MANAGEMENT ENDPOINTS
# ============================================================================

@router.get("/alerts")
async def get_alerts(plan_id: Optional[str] = None, severity: Optional[str] = None):
    """Get alerts, optionally filtered by plan or severity"""
    try:
        severity_enum = AlertSeverity(severity) if severity else None
        alerts = auto_alerts.get_alerts(plan_id=plan_id, severity=severity_enum)
        
        return {
            "total_alerts": len(alerts),
            "alerts": alerts,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Get alerts error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts/{alert_id}")
async def get_alert(alert_id: str):
    """Get specific alert details"""
    try:
        alerts = auto_alerts.get_alerts()
        alert = next((a for a in alerts if a['id'] == alert_id), None)
        
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        return alert
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get alert error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/alerts/{alert_id}/mitigations/{mitigation_id}/apply")
async def apply_mitigation(alert_id: str, mitigation_id: str):
    """Apply a mitigation strategy to an alert"""
    try:
        result = auto_alerts.apply_mitigation(alert_id, mitigation_id)
        return result
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Apply mitigation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status():
    """Get auto-alerts service status"""
    try:
        status = auto_alerts.get_status()
        return AutoAlertsStatus(**status)
    
    except Exception as e:
        logger.error(f"Status check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check for auto-alerts service"""
    return {
        "status": "healthy",
        "service": "auto_alerts",
        "timestamp": datetime.now().isoformat()
    }

# ============================================================================
# STATISTICS ENDPOINTS
# ============================================================================

@router.get("/stats")
async def get_stats():
    """Get auto-alerts statistics"""
    try:
        status = auto_alerts.get_status()
        alerts = auto_alerts.get_alerts()
        
        # Count by severity
        critical = len([a for a in alerts if a['severity'] == 'critical'])
        high = len([a for a in alerts if a['severity'] == 'high'])
        medium = len([a for a in alerts if a['severity'] == 'medium'])
        low = len([a for a in alerts if a['severity'] == 'low'])
        info = len([a for a in alerts if a['severity'] == 'info'])
        
        # Count by type
        by_type = {}
        for alert in alerts:
            alert_type = alert['type']
            by_type[alert_type] = by_type.get(alert_type, 0) + 1
        
        return {
            "total_alerts": status['total_alerts'],
            "active_alerts": status['active_alerts'],
            "mitigated_alerts": status['mitigated_alerts'],
            "mitigations_applied": status['mitigations_applied'],
            "by_severity": {
                "critical": critical,
                "high": high,
                "medium": medium,
                "low": low,
                "info": info
            },
            "by_type": by_type,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts/by-plan/{plan_id}")
async def get_alerts_by_plan(plan_id: str):
    """Get all alerts for a specific plan"""
    try:
        alerts = auto_alerts.get_alerts(plan_id=plan_id)
        
        # Count by severity
        critical = len([a for a in alerts if a['severity'] == 'critical'])
        high = len([a for a in alerts if a['severity'] == 'high'])
        medium = len([a for a in alerts if a['severity'] == 'medium'])
        low = len([a for a in alerts if a['severity'] == 'low'])
        
        return {
            "plan_id": plan_id,
            "total_alerts": len(alerts),
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low,
            "alerts": alerts,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Get plan alerts error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts/by-severity/{severity}")
async def get_alerts_by_severity(severity: str):
    """Get all alerts of a specific severity"""
    try:
        severity_enum = AlertSeverity(severity)
        alerts = auto_alerts.get_alerts(severity=severity_enum)
        
        return {
            "severity": severity,
            "total_alerts": len(alerts),
            "alerts": alerts,
            "timestamp": datetime.now().isoformat()
        }
    
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid severity: {severity}")
    except Exception as e:
        logger.error(f"Get severity alerts error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# MITIGATION RECOMMENDATIONS ENDPOINTS
# ============================================================================

@router.get("/recommendations/{alert_id}")
async def get_recommendations(alert_id: str):
    """Get mitigation recommendations for an alert"""
    try:
        alerts = auto_alerts.get_alerts()
        alert = next((a for a in alerts if a['id'] == alert_id), None)
        
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        mitigations = alert.get('mitigations', [])
        
        # Sort by effectiveness
        mitigations_sorted = sorted(mitigations, key=lambda x: x['effectiveness'], reverse=True)
        
        return {
            "alert_id": alert_id,
            "alert_type": alert['type'],
            "total_recommendations": len(mitigations_sorted),
            "recommendations": mitigations_sorted,
            "timestamp": datetime.now().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get recommendations error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommendations/{alert_id}/apply-best")
async def apply_best_mitigation(alert_id: str):
    """Apply the best mitigation strategy for an alert"""
    try:
        alerts = auto_alerts.get_alerts()
        alert = next((a for a in alerts if a['id'] == alert_id), None)
        
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        mitigations = alert.get('mitigations', [])
        if not mitigations:
            raise HTTPException(status_code=400, detail="No mitigations available")
        
        # Get best mitigation (highest effectiveness)
        best_mitigation = max(mitigations, key=lambda x: x['effectiveness'])
        
        # Apply it
        result = auto_alerts.apply_mitigation(alert_id, best_mitigation['id'])
        
        return {
            "status": "success",
            "alert_id": alert_id,
            "mitigation_applied": best_mitigation,
            "result": result
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Apply best mitigation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
