"""
Real-Time Delay Updates Service - Phase 3 Feature 3
Real-time shipment tracking and delay prediction
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from enum import Enum
import logging
import random

logger = logging.getLogger(__name__)

class ShipmentStatus(str, Enum):
    PENDING = "pending"
    DISPATCHED = "dispatched"
    IN_TRANSIT = "in_transit"
    DELAYED = "delayed"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class DelayAlert:
    """Delay alert object"""
    def __init__(self, shipment_id: str, predicted_delay_hours: float, 
                 confidence: float, reason: str):
        self.id = f"DELAY-{int(datetime.now().timestamp() * 1000)}"
        self.shipment_id = shipment_id
        self.predicted_delay_hours = predicted_delay_hours
        self.confidence = confidence
        self.reason = reason
        self.created_at = datetime.now()
        self.status = "active"
        self.mitigations = []
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'shipment_id': self.shipment_id,
            'predicted_delay_hours': self.predicted_delay_hours,
            'confidence': self.confidence,
            'reason': self.reason,
            'created_at': self.created_at.isoformat(),
            'status': self.status,
            'mitigations': self.mitigations
        }

class ShipmentTracking:
    """Shipment tracking object"""
    def __init__(self, shipment_id: str, origin: str, destination: str,
                 expected_delivery: datetime, tonnage: float):
        self.id = shipment_id
        self.origin = origin
        self.destination = destination
        self.expected_delivery = expected_delivery
        self.actual_delivery = None
        self.tonnage = tonnage
        self.status = ShipmentStatus.PENDING
        self.current_location = origin
        self.current_lat = 23.1815
        self.current_lon = 85.2871
        self.created_at = datetime.now()
        self.last_update = datetime.now()
        self.delay_alerts = []
    
    def update_location(self, lat: float, lon: float, location_name: str):
        """Update shipment location"""
        self.current_lat = lat
        self.current_lon = lon
        self.current_location = location_name
        self.last_update = datetime.now()
    
    def check_delay(self) -> Optional[DelayAlert]:
        """Check if shipment is delayed"""
        if self.status == ShipmentStatus.DELIVERED:
            return None
        
        current_time = datetime.now()
        time_remaining = (self.expected_delivery - current_time).total_seconds() / 3600
        
        if time_remaining < 0:
            # Already delayed
            delay_hours = abs(time_remaining)
            alert = DelayAlert(
                self.id,
                delay_hours,
                0.95,
                "Shipment is already delayed"
            )
            self.delay_alerts.append(alert)
            self.status = ShipmentStatus.DELAYED
            return alert
        elif time_remaining < 12:
            # Potential delay
            delay_probability = 1 - (time_remaining / 12)
            if delay_probability > 0.5:
                predicted_delay = random.uniform(2, 8)
                alert = DelayAlert(
                    self.id,
                    predicted_delay,
                    delay_probability,
                    "High risk of delay detected"
                )
                self.delay_alerts.append(alert)
                return alert
        
        return None
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'origin': self.origin,
            'destination': self.destination,
            'expected_delivery': self.expected_delivery.isoformat(),
            'actual_delivery': self.actual_delivery.isoformat() if self.actual_delivery else None,
            'tonnage': self.tonnage,
            'status': self.status,
            'current_location': self.current_location,
            'current_lat': self.current_lat,
            'current_lon': self.current_lon,
            'created_at': self.created_at.isoformat(),
            'last_update': self.last_update.isoformat(),
            'delay_alerts': [a.to_dict() for a in self.delay_alerts]
        }

class RealtimeDelayService:
    """Service for real-time delay updates"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.shipments = {}
        self.delay_alerts = []
        self.alert_history = []
        self._initialize_shipments()
    
    def _initialize_shipments(self):
        """Initialize with sample shipments"""
        routes = [
            ('Bokaro', 'Kolkata', 23.1815, 85.2871),
            ('Bokaro', 'Dhanbad', 23.7957, 86.4304),
            ('Bokaro', 'Patna', 25.5941, 85.1376),
        ]
        
        for i, (origin, dest, lat, lon) in enumerate(routes):
            shipment_id = f"SHIP-{2024001 + i}"
            expected_delivery = datetime.now() + timedelta(days=random.randint(3, 7))
            
            tracking = ShipmentTracking(
                shipment_id,
                origin,
                dest,
                expected_delivery,
                random.uniform(100, 500)
            )
            tracking.status = ShipmentStatus.IN_TRANSIT
            tracking.current_lat = lat + random.uniform(-0.5, 0.5)
            tracking.current_lon = lon + random.uniform(-0.5, 0.5)
            
            self.shipments[shipment_id] = tracking
    
    def track_shipment(self, shipment_id: str, lat: float, lon: float,
                      location_name: str) -> Dict:
        """Track shipment location"""
        try:
            if shipment_id not in self.shipments:
                raise ValueError(f"Shipment {shipment_id} not found")
            
            shipment = self.shipments[shipment_id]
            shipment.update_location(lat, lon, location_name)
            
            # Check for delays
            delay_alert = shipment.check_delay()
            if delay_alert:
                self.delay_alerts.append(delay_alert)
                self.alert_history.append(delay_alert)
            
            self.logger.info(f"✓ Updated location for {shipment_id}: {location_name}")
            
            return shipment.to_dict()
        
        except Exception as e:
            self.logger.error(f"Error tracking shipment: {e}")
            raise
    
    def mark_delivered(self, shipment_id: str) -> Dict:
        """Mark shipment as delivered"""
        try:
            if shipment_id not in self.shipments:
                raise ValueError(f"Shipment {shipment_id} not found")
            
            shipment = self.shipments[shipment_id]
            shipment.status = ShipmentStatus.DELIVERED
            shipment.actual_delivery = datetime.now()
            
            self.logger.info(f"✓ Marked {shipment_id} as delivered")
            
            return shipment.to_dict()
        
        except Exception as e:
            self.logger.error(f"Error marking delivered: {e}")
            raise
    
    def get_shipment(self, shipment_id: str) -> Optional[Dict]:
        """Get shipment details"""
        shipment = self.shipments.get(shipment_id)
        if shipment:
            return shipment.to_dict()
        return None
    
    def get_all_shipments(self, status: Optional[str] = None, limit: int = 100) -> List[Dict]:
        """Get all shipments"""
        shipments = list(self.shipments.values())
        
        if status:
            shipments = [s for s in shipments if s.status == status]
        
        return [s.to_dict() for s in shipments[-limit:]]
    
    def get_delayed_shipments(self) -> List[Dict]:
        """Get all delayed shipments"""
        delayed = [s for s in self.shipments.values() if s.status == ShipmentStatus.DELAYED]
        return [s.to_dict() for s in delayed]
    
    def get_delay_alerts(self, limit: int = 100) -> List[Dict]:
        """Get delay alerts"""
        return [a.to_dict() for a in self.alert_history[-limit:]]
    
    def get_status(self) -> Dict:
        """Get realtime delay service status"""
        total_shipments = len(self.shipments)
        delayed_count = len([s for s in self.shipments.values() if s.status == ShipmentStatus.DELAYED])
        delivered_count = len([s for s in self.shipments.values() if s.status == ShipmentStatus.DELIVERED])
        
        return {
            'status': 'running',
            'total_shipments': total_shipments,
            'in_transit': total_shipments - delayed_count - delivered_count,
            'delayed_shipments': delayed_count,
            'delivered_shipments': delivered_count,
            'total_alerts': len(self.alert_history),
            'timestamp': datetime.now().isoformat()
        }
