"""
Auto-Alerts & Mitigation Service - Phase 1 Feature 2
Detects issues in plans and suggests automatic mitigations
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class AlertSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class AlertType(str, Enum):
    STOCK_LOW = "stock_low"
    DELAY_RISK = "delay_risk"
    COST_OVERRUN = "cost_overrun"
    CAPACITY_EXCEEDED = "capacity_exceeded"
    QUALITY_RISK = "quality_risk"
    SCHEDULE_CONFLICT = "schedule_conflict"
    SUPPLIER_ISSUE = "supplier_issue"
    WEATHER_RISK = "weather_risk"
    VEHICLE_UNAVAILABLE = "vehicle_unavailable"
    ROUTE_BLOCKED = "route_blocked"

class MitigationStrategy(str, Enum):
    INCREASE_STOCK = "increase_stock"
    CHANGE_ROUTE = "change_route"
    SPLIT_SHIPMENT = "split_shipment"
    EXPEDITE_DELIVERY = "expedite_delivery"
    REDUCE_LOAD = "reduce_load"
    CHANGE_VEHICLE = "change_vehicle"
    ADJUST_SCHEDULE = "adjust_schedule"
    FIND_ALTERNATIVE = "find_alternative"
    INCREASE_BUFFER = "increase_buffer"
    ESCALATE = "escalate"

class Alert:
    """Alert object"""
    def __init__(self, alert_type: AlertType, severity: AlertSeverity, message: str, 
                 plan_id: str, affected_orders: List[str], data: Dict = None):
        self.id = f"ALERT-{int(datetime.now().timestamp() * 1000)}"
        self.type = alert_type
        self.severity = severity
        self.message = message
        self.plan_id = plan_id
        self.affected_orders = affected_orders
        self.data = data or {}
        self.created_at = datetime.now()
        self.status = "active"
        self.mitigations = []
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'type': self.type,
            'severity': self.severity,
            'message': self.message,
            'plan_id': self.plan_id,
            'affected_orders': self.affected_orders,
            'data': self.data,
            'created_at': self.created_at.isoformat(),
            'status': self.status,
            'mitigations': self.mitigations
        }

class Mitigation:
    """Mitigation strategy"""
    def __init__(self, strategy: MitigationStrategy, description: str, 
                 cost_impact: float = 0, time_impact: float = 0, 
                 effectiveness: float = 0.8):
        self.id = f"MIT-{int(datetime.now().timestamp() * 1000)}"
        self.strategy = strategy
        self.description = description
        self.cost_impact = cost_impact  # ₹ impact
        self.time_impact = time_impact  # hours impact
        self.effectiveness = effectiveness  # 0-1
        self.status = "suggested"
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'strategy': self.strategy,
            'description': self.description,
            'cost_impact': self.cost_impact,
            'time_impact': self.time_impact,
            'effectiveness': self.effectiveness,
            'status': self.status
        }

class AutoAlertsService:
    """Service for automatic alerts and mitigation"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.alerts_history = []
        self.mitigations_history = []
        self.alert_count = 0
        self.mitigations_applied = 0
    
    def analyze_plan(self, plan: Dict) -> List[Alert]:
        """
        Analyze plan and detect issues
        Returns list of alerts
        """
        alerts = []
        
        try:
            # Check 1: Stock levels
            stock_alerts = self._check_stock_levels(plan)
            alerts.extend(stock_alerts)
            
            # Check 2: Delay risks
            delay_alerts = self._check_delay_risks(plan)
            alerts.extend(delay_alerts)
            
            # Check 3: Cost overruns
            cost_alerts = self._check_cost_overruns(plan)
            alerts.extend(cost_alerts)
            
            # Check 4: Capacity issues
            capacity_alerts = self._check_capacity_issues(plan)
            alerts.extend(capacity_alerts)
            
            # Check 5: Quality risks
            quality_alerts = self._check_quality_risks(plan)
            alerts.extend(quality_alerts)
            
            # Check 6: Schedule conflicts
            schedule_alerts = self._check_schedule_conflicts(plan)
            alerts.extend(schedule_alerts)
            
            # Check 7: Weather risks
            weather_alerts = self._check_weather_risks(plan)
            alerts.extend(weather_alerts)
            
            # Check 8: Vehicle availability
            vehicle_alerts = self._check_vehicle_availability(plan)
            alerts.extend(vehicle_alerts)
            
            # Store alerts
            for alert in alerts:
                self.alerts_history.append(alert)
                self.alert_count += 1
            
            self.logger.info(f"✓ Analyzed plan {plan.get('id')}. Found {len(alerts)} alerts")
            
            return alerts
        
        except Exception as e:
            self.logger.error(f"Error analyzing plan: {e}")
            raise
    
    def _check_stock_levels(self, plan: Dict) -> List[Alert]:
        """Check if stock levels are sufficient"""
        alerts = []
        predictions = plan.get('predictions', {})
        demand = predictions.get('demand_forecast', {})
        
        # Check if demand is high
        if demand.get('total_demand', 0) > 5000:
            alert = Alert(
                alert_type=AlertType.STOCK_LOW,
                severity=AlertSeverity.HIGH,
                message=f"High demand detected ({demand.get('total_demand')}T). Stock levels may be insufficient.",
                plan_id=plan.get('id'),
                affected_orders=self._get_affected_orders(plan),
                data={'demand': demand.get('total_demand'), 'threshold': 5000}
            )
            alert.mitigations = self._suggest_mitigations_for_stock(plan)
            alerts.append(alert)
        
        return alerts
    
    def _check_delay_risks(self, plan: Dict) -> List[Alert]:
        """Check for delay risks"""
        alerts = []
        predictions = plan.get('predictions', {})
        delay_forecast = predictions.get('delay_forecast', {})
        
        # Check if delay probability is high
        avg_delay_prob = delay_forecast.get('avg_delay_probability', 0)
        if avg_delay_prob > 0.3:
            alert = Alert(
                alert_type=AlertType.DELAY_RISK,
                severity=AlertSeverity.HIGH,
                message=f"High delay risk detected ({avg_delay_prob*100:.0f}% probability). Average delay: {delay_forecast.get('delays', [{}])[0].get('estimated_delay_hours', 0)}h",
                plan_id=plan.get('id'),
                affected_orders=self._get_affected_orders(plan),
                data={'delay_probability': avg_delay_prob, 'threshold': 0.3}
            )
            alert.mitigations = self._suggest_mitigations_for_delay(plan)
            alerts.append(alert)
        
        return alerts
    
    def _check_cost_overruns(self, plan: Dict) -> List[Alert]:
        """Check for cost overruns"""
        alerts = []
        predictions = plan.get('predictions', {})
        cost_forecast = predictions.get('cost_forecast', {})
        
        # Check if cost per tonne is high
        avg_cost = cost_forecast.get('avg_cost_per_tonne', 0)
        if avg_cost > 60:
            alert = Alert(
                alert_type=AlertType.COST_OVERRUN,
                severity=AlertSeverity.MEDIUM,
                message=f"Cost overrun detected. Average cost: ₹{avg_cost:.0f}/tonne (threshold: ₹60/tonne)",
                plan_id=plan.get('id'),
                affected_orders=self._get_affected_orders(plan),
                data={'avg_cost': avg_cost, 'threshold': 60}
            )
            alert.mitigations = self._suggest_mitigations_for_cost(plan)
            alerts.append(alert)
        
        return alerts
    
    def _check_capacity_issues(self, plan: Dict) -> List[Alert]:
        """Check for capacity issues"""
        alerts = []
        
        allocations = plan.get('allocations', [])
        total_tonnage = plan.get('total_tonnage', 0)
        rakes_needed = plan.get('rakes_needed', 0)
        
        # Check if rakes are sufficient
        if rakes_needed > 3:
            alert = Alert(
                alert_type=AlertType.CAPACITY_EXCEEDED,
                severity=AlertSeverity.MEDIUM,
                message=f"High capacity requirement. {rakes_needed} rakes needed for {total_tonnage}T",
                plan_id=plan.get('id'),
                affected_orders=self._get_affected_orders(plan),
                data={'rakes_needed': rakes_needed, 'tonnage': total_tonnage}
            )
            alert.mitigations = self._suggest_mitigations_for_capacity(plan)
            alerts.append(alert)
        
        return alerts
    
    def _check_quality_risks(self, plan: Dict) -> List[Alert]:
        """Check for quality risks"""
        alerts = []
        predictions = plan.get('predictions', {})
        
        # Check if there are quality concerns
        risk_factors = predictions.get('risk_factors', [])
        if len(risk_factors) > 2:
            alert = Alert(
                alert_type=AlertType.QUALITY_RISK,
                severity=AlertSeverity.MEDIUM,
                message=f"Quality risks identified: {', '.join(risk_factors[:2])}",
                plan_id=plan.get('id'),
                affected_orders=self._get_affected_orders(plan),
                data={'risk_factors': risk_factors}
            )
            alert.mitigations = self._suggest_mitigations_for_quality(plan)
            alerts.append(alert)
        
        return alerts
    
    def _check_schedule_conflicts(self, plan: Dict) -> List[Alert]:
        """Check for schedule conflicts"""
        alerts = []
        
        allocations = plan.get('allocations', [])
        
        # Check if multiple orders have same destination
        destinations = {}
        for alloc in allocations:
            dest = alloc.get('destination')
            if dest:
                destinations[dest] = destinations.get(dest, 0) + 1
        
        for dest, count in destinations.items():
            if count > 2:
                alert = Alert(
                    alert_type=AlertType.SCHEDULE_CONFLICT,
                    severity=AlertSeverity.LOW,
                    message=f"Multiple orders to {dest} ({count} orders). Consider consolidation.",
                    plan_id=plan.get('id'),
                    affected_orders=self._get_affected_orders(plan),
                    data={'destination': dest, 'order_count': count}
                )
                alert.mitigations = self._suggest_mitigations_for_schedule(plan)
                alerts.append(alert)
        
        return alerts
    
    def _check_weather_risks(self, plan: Dict) -> List[Alert]:
        """Check for weather risks"""
        alerts = []
        
        # Simulate weather check
        weather_risk = 0.15  # 15% chance of weather issues
        
        if weather_risk > 0.1:
            alert = Alert(
                alert_type=AlertType.WEATHER_RISK,
                severity=AlertSeverity.MEDIUM,
                message=f"Weather risk detected ({weather_risk*100:.0f}% probability). Monsoon season approaching.",
                plan_id=plan.get('id'),
                affected_orders=self._get_affected_orders(plan),
                data={'weather_risk': weather_risk}
            )
            alert.mitigations = self._suggest_mitigations_for_weather(plan)
            alerts.append(alert)
        
        return alerts
    
    def _check_vehicle_availability(self, plan: Dict) -> List[Alert]:
        """Check for vehicle availability issues"""
        alerts = []
        
        allocations = plan.get('allocations', [])
        
        # Check if vehicles are available
        if len(allocations) > 5:
            alert = Alert(
                alert_type=AlertType.VEHICLE_UNAVAILABLE,
                severity=AlertSeverity.LOW,
                message=f"High vehicle requirement. {len(allocations)} vehicles needed.",
                plan_id=plan.get('id'),
                affected_orders=self._get_affected_orders(plan),
                data={'vehicles_needed': len(allocations)}
            )
            alert.mitigations = self._suggest_mitigations_for_vehicles(plan)
            alerts.append(alert)
        
        return alerts
    
    def _get_affected_orders(self, plan: Dict) -> List[str]:
        """Get list of affected order IDs"""
        allocations = plan.get('allocations', [])
        return [alloc.get('order_id') for alloc in allocations[:3]]
    
    def _suggest_mitigations_for_stock(self, plan: Dict) -> List[Dict]:
        """Suggest mitigations for stock issues"""
        mitigations = []
        
        mit1 = Mitigation(
            strategy=MitigationStrategy.INCREASE_STOCK,
            description="Increase stock procurement from suppliers",
            cost_impact=50000,
            time_impact=2,
            effectiveness=0.9
        )
        mitigations.append(mit1.to_dict())
        
        mit2 = Mitigation(
            strategy=MitigationStrategy.SPLIT_SHIPMENT,
            description="Split shipment into multiple smaller rakes",
            cost_impact=25000,
            time_impact=1,
            effectiveness=0.7
        )
        mitigations.append(mit2.to_dict())
        
        return mitigations
    
    def _suggest_mitigations_for_delay(self, plan: Dict) -> List[Dict]:
        """Suggest mitigations for delay risks"""
        mitigations = []
        
        mit1 = Mitigation(
            strategy=MitigationStrategy.EXPEDITE_DELIVERY,
            description="Use express route for faster delivery",
            cost_impact=75000,
            time_impact=-4,
            effectiveness=0.95
        )
        mitigations.append(mit1.to_dict())
        
        mit2 = Mitigation(
            strategy=MitigationStrategy.CHANGE_ROUTE,
            description="Switch to alternative route with better conditions",
            cost_impact=-25000,
            time_impact=-2,
            effectiveness=0.8
        )
        mitigations.append(mit2.to_dict())
        
        return mitigations
    
    def _suggest_mitigations_for_cost(self, plan: Dict) -> List[Dict]:
        """Suggest mitigations for cost overruns"""
        mitigations = []
        
        mit1 = Mitigation(
            strategy=MitigationStrategy.CHANGE_ROUTE,
            description="Use cheaper route to reduce costs",
            cost_impact=-37500,
            time_impact=2,
            effectiveness=0.85
        )
        mitigations.append(mit1.to_dict())
        
        mit2 = Mitigation(
            strategy=MitigationStrategy.REDUCE_LOAD,
            description="Reduce load per vehicle to optimize costs",
            cost_impact=-25000,
            time_impact=1,
            effectiveness=0.7
        )
        mitigations.append(mit2.to_dict())
        
        return mitigations
    
    def _suggest_mitigations_for_capacity(self, plan: Dict) -> List[Dict]:
        """Suggest mitigations for capacity issues"""
        mitigations = []
        
        mit1 = Mitigation(
            strategy=MitigationStrategy.SPLIT_SHIPMENT,
            description="Split into multiple shipments to reduce per-shipment load",
            cost_impact=50000,
            time_impact=1,
            effectiveness=0.9
        )
        mitigations.append(mit1.to_dict())
        
        mit2 = Mitigation(
            strategy=MitigationStrategy.CHANGE_VEHICLE,
            description="Use larger capacity vehicles",
            cost_impact=25000,
            time_impact=0,
            effectiveness=0.8
        )
        mitigations.append(mit2.to_dict())
        
        return mitigations
    
    def _suggest_mitigations_for_quality(self, plan: Dict) -> List[Dict]:
        """Suggest mitigations for quality risks"""
        mitigations = []
        
        mit1 = Mitigation(
            strategy=MitigationStrategy.INCREASE_BUFFER,
            description="Add quality buffer/inspection checkpoints",
            cost_impact=15000,
            time_impact=0.5,
            effectiveness=0.85
        )
        mitigations.append(mit1.to_dict())
        
        return mitigations
    
    def _suggest_mitigations_for_schedule(self, plan: Dict) -> List[Dict]:
        """Suggest mitigations for schedule conflicts"""
        mitigations = []
        
        mit1 = Mitigation(
            strategy=MitigationStrategy.ADJUST_SCHEDULE,
            description="Consolidate orders and adjust delivery schedule",
            cost_impact=-25000,
            time_impact=1,
            effectiveness=0.9
        )
        mitigations.append(mit1.to_dict())
        
        return mitigations
    
    def _suggest_mitigations_for_weather(self, plan: Dict) -> List[Dict]:
        """Suggest mitigations for weather risks"""
        mitigations = []
        
        mit1 = Mitigation(
            strategy=MitigationStrategy.INCREASE_BUFFER,
            description="Add weather buffer time to schedule",
            cost_impact=0,
            time_impact=2,
            effectiveness=0.8
        )
        mitigations.append(mit1.to_dict())
        
        mit2 = Mitigation(
            strategy=MitigationStrategy.CHANGE_ROUTE,
            description="Use weather-resistant route",
            cost_impact=50000,
            time_impact=-1,
            effectiveness=0.9
        )
        mitigations.append(mit2.to_dict())
        
        return mitigations
    
    def _suggest_mitigations_for_vehicles(self, plan: Dict) -> List[Dict]:
        """Suggest mitigations for vehicle availability"""
        mitigations = []
        
        mit1 = Mitigation(
            strategy=MitigationStrategy.FIND_ALTERNATIVE,
            description="Arrange alternative vehicles from partner fleet",
            cost_impact=30000,
            time_impact=0,
            effectiveness=0.85
        )
        mitigations.append(mit1.to_dict())
        
        return mitigations
    
    def apply_mitigation(self, alert_id: str, mitigation_id: str) -> Dict:
        """Apply a mitigation strategy"""
        try:
            # Find alert and mitigation
            alert = next((a for a in self.alerts_history if a.id == alert_id), None)
            if not alert:
                raise ValueError(f"Alert {alert_id} not found")
            
            mitigation_data = next((m for m in alert.mitigations if m['id'] == mitigation_id), None)
            if not mitigation_data:
                raise ValueError(f"Mitigation {mitigation_id} not found")
            
            # Apply mitigation
            mitigation_data['status'] = 'applied'
            alert.status = 'mitigated'
            self.mitigations_applied += 1
            
            self.logger.info(f"✓ Applied mitigation {mitigation_id} to alert {alert_id}")
            
            return {
                'status': 'success',
                'alert_id': alert_id,
                'mitigation_id': mitigation_id,
                'applied_at': datetime.now().isoformat()
            }
        
        except Exception as e:
            self.logger.error(f"Error applying mitigation: {e}")
            raise
    
    def get_alerts(self, plan_id: str = None, severity: AlertSeverity = None) -> List[Dict]:
        """Get alerts, optionally filtered by plan or severity"""
        alerts = self.alerts_history
        
        if plan_id:
            alerts = [a for a in alerts if a.plan_id == plan_id]
        
        if severity:
            alerts = [a for a in alerts if a.severity == severity]
        
        return [a.to_dict() for a in alerts]
    
    def get_status(self) -> Dict:
        """Get alerts service status"""
        active_alerts = len([a for a in self.alerts_history if a.status == 'active'])
        mitigated_alerts = len([a for a in self.alerts_history if a.status == 'mitigated'])
        
        return {
            'status': 'running',
            'total_alerts': len(self.alerts_history),
            'active_alerts': active_alerts,
            'mitigated_alerts': mitigated_alerts,
            'mitigations_applied': self.mitigations_applied,
            'timestamp': datetime.now().isoformat()
        }
