"""
Real-Time Delay Updates API Router - Phase 3 Feature 3
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from app.services.realtime_delay_service import RealtimeDelayService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/tracking", tags=["tracking"])

delay_service = RealtimeDelayService()

@router.post("/track")
async def track_shipment(shipment_id: str, lat: float, lon: float, location_name: str):
    """Track shipment location"""
    try:
        result = delay_service.track_shipment(shipment_id, lat, lon, location_name)
        return result
    except Exception as e:
        logger.error(f"Track error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/delivered/{shipment_id}")
async def mark_delivered(shipment_id: str):
    """Mark shipment as delivered"""
    try:
        result = delay_service.mark_delivered(shipment_id)
        return result
    except Exception as e:
        logger.error(f"Delivered error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/shipment/{shipment_id}")
async def get_shipment(shipment_id: str):
    """Get shipment details"""
    try:
        shipment = delay_service.get_shipment(shipment_id)
        if not shipment:
            raise HTTPException(status_code=404, detail="Shipment not found")
        return shipment
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get shipment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/shipments")
async def get_all_shipments(status: Optional[str] = None, limit: int = 100):
    """Get all shipments"""
    try:
        shipments = delay_service.get_all_shipments(status, limit)
        return {
            'total': len(shipments),
            'shipments': shipments,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get shipments error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/delayed")
async def get_delayed_shipments():
    """Get delayed shipments"""
    try:
        shipments = delay_service.get_delayed_shipments()
        return {
            'total': len(shipments),
            'shipments': shipments,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get delayed error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts")
async def get_delay_alerts(limit: int = 100):
    """Get delay alerts"""
    try:
        alerts = delay_service.get_delay_alerts(limit)
        return {
            'total': len(alerts),
            'alerts': alerts,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get alerts error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status():
    """Get realtime delay service status"""
    try:
        status = delay_service.get_status()
        return status
    except Exception as e:
        logger.error(f"Status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check"""
    return {
        'status': 'healthy',
        'service': 'realtime_delay',
        'timestamp': datetime.now().isoformat()
    }
