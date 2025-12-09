"""
Live Data Streaming Service - Phase 2 Feature 1
Real-time data ingestion and streaming
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Callable
from enum import Enum
import logging
import json
import asyncio
from collections import deque

logger = logging.getLogger(__name__)

class DataSourceType(str, Enum):
    SHIPMENT = "shipment"
    VEHICLE = "vehicle"
    ROUTE = "route"
    WAREHOUSE = "warehouse"
    ORDER = "order"
    ALERT = "alert"

class DataEvent:
    """Data event object"""
    def __init__(self, source_type: DataSourceType, event_type: str, data: Dict):
        self.id = f"EVENT-{int(datetime.now().timestamp() * 1000)}"
        self.source_type = source_type
        self.event_type = event_type
        self.data = data
        self.timestamp = datetime.now()
        self.processed = False
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'source_type': self.source_type,
            'event_type': self.event_type,
            'data': self.data,
            'timestamp': self.timestamp.isoformat(),
            'processed': self.processed
        }

class DataStream:
    """Data stream for a specific source"""
    def __init__(self, source_type: DataSourceType, max_events: int = 1000):
        self.source_type = source_type
        self.events = deque(maxlen=max_events)
        self.subscribers = []
        self.created_at = datetime.now()
    
    def add_event(self, event: DataEvent):
        """Add event to stream"""
        self.events.append(event)
        self._notify_subscribers(event)
    
    def subscribe(self, callback: Callable):
        """Subscribe to stream events"""
        self.subscribers.append(callback)
    
    def _notify_subscribers(self, event: DataEvent):
        """Notify all subscribers"""
        for callback in self.subscribers:
            try:
                callback(event)
            except Exception as e:
                logger.error(f"Error notifying subscriber: {e}")
    
    def get_events(self, limit: int = 100) -> List[Dict]:
        """Get recent events"""
        return [e.to_dict() for e in list(self.events)[-limit:]]

class LiveDataService:
    """Service for live data streaming"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.streams = {}
        self.event_history = deque(maxlen=10000)
        self.stats = {
            'total_events': 0,
            'events_by_type': {},
            'last_event': None
        }
        self._initialize_streams()
    
    def _initialize_streams(self):
        """Initialize data streams"""
        for source_type in DataSourceType:
            self.streams[source_type.value] = DataStream(source_type)
    
    def ingest_event(self, source_type: str, event_type: str, data: Dict) -> DataEvent:
        """Ingest a new data event"""
        try:
            source_enum = DataSourceType(source_type)
            event = DataEvent(source_enum, event_type, data)
            
            # Add to stream
            stream = self.streams.get(source_type)
            if stream:
                stream.add_event(event)
            
            # Update history
            self.event_history.append(event)
            
            # Update stats
            self.stats['total_events'] += 1
            self.stats['events_by_type'][event_type] = self.stats['events_by_type'].get(event_type, 0) + 1
            self.stats['last_event'] = event.timestamp.isoformat()
            
            self.logger.info(f"✓ Ingested event: {source_type}/{event_type}")
            
            return event
        
        except Exception as e:
            self.logger.error(f"Error ingesting event: {e}")
            raise
    
    def ingest_shipment_update(self, shipment_id: str, status: str, location: str, 
                               delay_hours: float = 0) -> DataEvent:
        """Ingest shipment update"""
        data = {
            'shipment_id': shipment_id,
            'status': status,
            'location': location,
            'delay_hours': delay_hours,
            'updated_at': datetime.now().isoformat()
        }
        return self.ingest_event('shipment', 'status_update', data)
    
    def ingest_vehicle_telemetry(self, vehicle_id: str, lat: float, lon: float,
                                  speed: float, fuel: float) -> DataEvent:
        """Ingest vehicle telemetry"""
        data = {
            'vehicle_id': vehicle_id,
            'latitude': lat,
            'longitude': lon,
            'speed_kmh': speed,
            'fuel_percent': fuel,
            'timestamp': datetime.now().isoformat()
        }
        return self.ingest_event('vehicle', 'telemetry', data)
    
    def ingest_order_created(self, order_id: str, tonnage: float, destination: str,
                             urgency: float) -> DataEvent:
        """Ingest new order"""
        data = {
            'order_id': order_id,
            'tonnage': tonnage,
            'destination': destination,
            'urgency': urgency,
            'created_at': datetime.now().isoformat()
        }
        return self.ingest_event('order', 'created', data)
    
    def ingest_alert(self, alert_id: str, alert_type: str, severity: str,
                     message: str) -> DataEvent:
        """Ingest alert"""
        data = {
            'alert_id': alert_id,
            'alert_type': alert_type,
            'severity': severity,
            'message': message,
            'timestamp': datetime.now().isoformat()
        }
        return self.ingest_event('alert', 'triggered', data)
    
    def get_stream(self, source_type: str) -> Optional[DataStream]:
        """Get stream for source type"""
        return self.streams.get(source_type)
    
    def get_events(self, source_type: Optional[str] = None, limit: int = 100) -> List[Dict]:
        """Get events, optionally filtered by source type"""
        if source_type:
            stream = self.streams.get(source_type)
            if stream:
                return stream.get_events(limit)
            return []
        
        # Return all events
        return [e.to_dict() for e in list(self.event_history)[-limit:]]
    
    def get_status(self) -> Dict:
        """Get live data service status"""
        return {
            'status': 'running',
            'total_events': self.stats['total_events'],
            'streams_active': len(self.streams),
            'last_event': self.stats['last_event'],
            'events_by_type': self.stats['events_by_type'],
            'timestamp': datetime.now().isoformat()
        }
    
    def simulate_live_data(self) -> List[DataEvent]:
        """Simulate live data ingestion"""
        try:
            events = []
            
            # Simulate shipment updates
            shipment_event = self.ingest_shipment_update(
                shipment_id=f"SHIP-{int(datetime.now().timestamp())}",
                status="in_transit",
                location="Bokaro-Kolkata Route",
                delay_hours=0.5
            )
            events.append(shipment_event)
            
            # Simulate vehicle telemetry
            vehicle_event = self.ingest_vehicle_telemetry(
                vehicle_id=f"VEH-{int(datetime.now().timestamp())}",
                lat=23.1815,
                lon=85.2871,
                speed=65.5,
                fuel=75.0
            )
            events.append(vehicle_event)
            
            # Simulate new order
            order_event = self.ingest_order_created(
                order_id=f"ORD-{int(datetime.now().timestamp())}",
                tonnage=500,
                destination="Kolkata",
                urgency=0.7
            )
            events.append(order_event)
            
            # Simulate alert
            alert_event = self.ingest_alert(
                alert_id=f"ALERT-{int(datetime.now().timestamp())}",
                alert_type="delay_risk",
                severity="medium",
                message="Potential delay detected on route"
            )
            events.append(alert_event)
            
            self.logger.info(f"✓ Simulated {len(events)} live data events")
            
            return events
        
        except Exception as e:
            self.logger.error(f"Error simulating live data: {e}")
            raise
