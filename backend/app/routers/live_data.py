"""
Live Data Streaming API Router - Phase 2 Feature 1
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from app.services.live_data_service import LiveDataService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/live-data", tags=["live-data"])

live_data_service = LiveDataService()

@router.post("/ingest")
async def ingest_event(source_type: str, event_type: str, data: Dict[str, Any]):
    """Ingest a data event"""
    try:
        event = live_data_service.ingest_event(source_type, event_type, data)
        return event.to_dict()
    except Exception as e:
        logger.error(f"Ingest error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest/shipment")
async def ingest_shipment(shipment_id: str, status: str, location: str, delay_hours: float = 0):
    """Ingest shipment update"""
    try:
        event = live_data_service.ingest_shipment_update(shipment_id, status, location, delay_hours)
        return event.to_dict()
    except Exception as e:
        logger.error(f"Ingest shipment error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest/vehicle")
async def ingest_vehicle(vehicle_id: str, lat: float, lon: float, speed: float, fuel: float):
    """Ingest vehicle telemetry"""
    try:
        event = live_data_service.ingest_vehicle_telemetry(vehicle_id, lat, lon, speed, fuel)
        return event.to_dict()
    except Exception as e:
        logger.error(f"Ingest vehicle error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest/order")
async def ingest_order(order_id: str, tonnage: float, destination: str, urgency: float):
    """Ingest new order"""
    try:
        event = live_data_service.ingest_order_created(order_id, tonnage, destination, urgency)
        return event.to_dict()
    except Exception as e:
        logger.error(f"Ingest order error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest/alert")
async def ingest_alert(alert_id: str, alert_type: str, severity: str, message: str):
    """Ingest alert"""
    try:
        event = live_data_service.ingest_alert(alert_id, alert_type, severity, message)
        return event.to_dict()
    except Exception as e:
        logger.error(f"Ingest alert error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/simulate")
async def simulate_live_data():
    """Simulate live data ingestion"""
    try:
        events = live_data_service.simulate_live_data()
        return {
            'status': 'success',
            'events_ingested': len(events),
            'events': [e.to_dict() for e in events],
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Simulate error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events")
async def get_events(source_type: Optional[str] = None, limit: int = 100):
    """Get events"""
    try:
        events = live_data_service.get_events(source_type, limit)
        return {
            'total': len(events),
            'events': events,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get events error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stream/{source_type}")
async def get_stream(source_type: str, limit: int = 100):
    """Get stream for source type"""
    try:
        stream = live_data_service.get_stream(source_type)
        if not stream:
            raise HTTPException(status_code=404, detail="Stream not found")
        
        events = stream.get_events(limit)
        return {
            'source_type': source_type,
            'total': len(events),
            'events': events,
            'timestamp': datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get stream error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status():
    """Get live data service status"""
    try:
        status = live_data_service.get_status()
        return status
    except Exception as e:
        logger.error(f"Status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check"""
    return {
        'status': 'healthy',
        'service': 'live_data',
        'timestamp': datetime.now().isoformat()
    }
