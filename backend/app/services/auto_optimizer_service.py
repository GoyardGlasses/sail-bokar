"""
Auto-Optimization Service - Phase 1
Automatically generates and publishes daily optimization plans
Triggers on-demand when data changes
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
import json
from enum import Enum

logger = logging.getLogger(__name__)

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class AutoOptimizerService:
    """Service for automatic optimization and plan generation"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.plans_history = []
        self.last_optimization_time = None
        self.optimization_count = 0
        
    def run_optimization(self, orders: List[Dict], stock: Dict, rakes: List[Dict]) -> Dict:
        """
        Run full optimization pipeline
        Returns optimized plan with risk assessment
        """
        try:
            self.logger.info("Starting optimization pipeline...")
            
            # Step 1: Fetch and validate data
            validated_orders = self._validate_orders(orders)
            validated_stock = self._validate_stock(stock)
            validated_rakes = self._validate_rakes(rakes)
            
            # Step 2: Run predictions
            predictions = self._run_predictions(validated_orders, validated_stock)
            
            # Step 3: Generate optimization plan
            plan = self._generate_plan(validated_orders, validated_stock, validated_rakes, predictions)
            
            # Step 4: Assess risk
            risk_assessment = self._assess_risk(plan)
            plan['risk_assessment'] = risk_assessment
            
            # Step 5: Add metadata
            plan['id'] = f"PLAN-{int(datetime.now().timestamp())}"
            plan['created_at'] = datetime.now().isoformat()
            plan['status'] = 'pending_approval' if risk_assessment['risk_level'] == RiskLevel.HIGH else 'ready_to_publish'
            plan['auto_publish_eligible'] = risk_assessment['risk_score'] < 0.15
            
            self.last_optimization_time = datetime.now()
            self.optimization_count += 1
            self.plans_history.append(plan)
            
            self.logger.info(f"✓ Optimization complete. Plan ID: {plan['id']}, Risk: {risk_assessment['risk_level']}")
            
            return plan
            
        except Exception as e:
            self.logger.error(f"Optimization failed: {e}")
            raise
    
    def _validate_orders(self, orders: List[Dict]) -> List[Dict]:
        """Validate and clean order data"""
        validated = []
        for order in orders:
            if all(k in order for k in ['id', 'tonnage', 'destination', 'material']):
                validated.append(order)
        return validated
    
    def _validate_stock(self, stock: Dict) -> Dict:
        """Validate and clean stock data"""
        return {k: v for k, v in stock.items() if v >= 0}
    
    def _validate_rakes(self, rakes: List[Dict]) -> List[Dict]:
        """Validate and clean rake data"""
        validated = []
        for rake in rakes:
            if all(k in rake for k in ['id', 'capacity', 'status']):
                validated.append(rake)
        return validated
    
    def _run_predictions(self, orders: List[Dict], stock: Dict) -> Dict:
        """Run ML predictions for demand, delays, costs"""
        predictions = {
            'demand_forecast': self._predict_demand(orders),
            'delay_forecast': self._predict_delays(orders),
            'cost_forecast': self._predict_costs(orders),
            'risk_factors': self._identify_risk_factors(orders, stock)
        }
        return predictions
    
    def _predict_demand(self, orders: List[Dict]) -> Dict:
        """Predict demand for next period"""
        total_tonnage = sum(o.get('tonnage', 0) for o in orders)
        return {
            'total_demand': total_tonnage,
            'by_material': self._group_by_material(orders),
            'confidence': 0.85
        }
    
    def _predict_delays(self, orders: List[Dict]) -> Dict:
        """Predict potential delays"""
        delays = []
        for order in orders:
            delay_risk = 0.1 if order.get('destination') in ['Bokaro-Dhanbad'] else 0.05
            delays.append({
                'order_id': order.get('id'),
                'delay_probability': delay_risk,
                'estimated_delay_hours': 4 if delay_risk > 0.08 else 0
            })
        return {'delays': delays, 'avg_delay_probability': sum(d['delay_probability'] for d in delays) / len(delays) if delays else 0}
    
    def _predict_costs(self, orders: List[Dict]) -> Dict:
        """Predict costs for orders"""
        total_cost = 0
        for order in orders:
            tonnage = order.get('tonnage', 0)
            distance = 250  # Average distance
            cost = tonnage * 50 + distance * 5
            total_cost += cost
        return {
            'total_cost': total_cost,
            'avg_cost_per_tonne': total_cost / sum(o.get('tonnage', 1) for o in orders) if orders else 0,
            'confidence': 0.88
        }
    
    def _identify_risk_factors(self, orders: List[Dict], stock: Dict) -> List[str]:
        """Identify potential risk factors"""
        risks = []
        
        # Check stock levels
        for material, qty in stock.items():
            if qty < 100:
                risks.append(f"Low stock: {material} ({qty}T)")
        
        # Check order urgency
        urgent_orders = [o for o in orders if o.get('urgency', 0) > 0.7]
        if len(urgent_orders) > 5:
            risks.append(f"High urgency orders: {len(urgent_orders)}")
        
        return risks
    
    def _group_by_material(self, orders: List[Dict]) -> Dict:
        """Group orders by material"""
        grouped = {}
        for order in orders:
            material = order.get('material', 'unknown')
            tonnage = order.get('tonnage', 0)
            grouped[material] = grouped.get(material, 0) + tonnage
        return grouped
    
    def _generate_plan(self, orders: List[Dict], stock: Dict, rakes: List[Dict], predictions: Dict) -> Dict:
        """Generate optimization plan"""
        
        # Allocate rakes to orders
        allocations = self._allocate_rakes(orders, rakes)
        
        # Create plan
        plan = {
            'orders': len(orders),
            'total_tonnage': sum(o.get('tonnage', 0) for o in orders),
            'rakes_needed': len(allocations),
            'allocations': allocations,
            'predictions': predictions,
            'estimated_cost_savings': self._calculate_savings(orders),
            'estimated_time_savings': self._calculate_time_savings(orders),
            'recommendations': self._generate_recommendations(orders, stock, predictions)
        }
        
        return plan
    
    def _allocate_rakes(self, orders: List[Dict], rakes: List[Dict]) -> List[Dict]:
        """Allocate rakes to orders"""
        allocations = []
        rake_idx = 0
        
        for order in orders:
            if rake_idx < len(rakes):
                allocation = {
                    'order_id': order.get('id'),
                    'rake_id': rakes[rake_idx].get('id'),
                    'tonnage': order.get('tonnage'),
                    'destination': order.get('destination'),
                    'material': order.get('material'),
                    'estimated_cost': order.get('tonnage', 0) * 50 + 250 * 5,
                    'estimated_time_hours': 8
                }
                allocations.append(allocation)
                rake_idx = (rake_idx + 1) % len(rakes)
        
        return allocations
    
    def _calculate_savings(self, orders: List[Dict]) -> float:
        """Calculate estimated cost savings"""
        base_cost = sum(o.get('tonnage', 0) * 60 for o in orders)  # Base cost without optimization
        optimized_cost = sum(o.get('tonnage', 0) * 50 for o in orders)  # Optimized cost
        return base_cost - optimized_cost
    
    def _calculate_time_savings(self, orders: List[Dict]) -> float:
        """Calculate estimated time savings"""
        return len(orders) * 0.5  # 30 min per order
    
    def _generate_recommendations(self, orders: List[Dict], stock: Dict, predictions: Dict) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        # Demand-based recommendations
        demand = predictions.get('demand_forecast', {})
        if demand.get('total_demand', 0) > 5000:
            recommendations.append("High demand detected - consider increasing rake allocation")
        
        # Risk-based recommendations
        risks = predictions.get('risk_factors', [])
        if risks:
            recommendations.append(f"Address {len(risks)} risk factors before execution")
        
        # Cost-based recommendations
        cost = predictions.get('cost_forecast', {})
        if cost.get('avg_cost_per_tonne', 0) > 55:
            recommendations.append("Consider alternative routes to reduce costs")
        
        return recommendations
    
    def _assess_risk(self, plan: Dict) -> Dict:
        """Assess risk level of plan"""
        risk_score = 0.0
        risk_factors = []
        
        # Factor 1: Allocation coverage (0-0.3)
        allocations = plan.get('allocations', [])
        orders = plan.get('orders', 0)
        coverage = len(allocations) / orders if orders > 0 else 1.0
        if coverage < 0.8:
            risk_score += 0.2
            risk_factors.append("Low allocation coverage")
        
        # Factor 2: Predictions confidence (0-0.2)
        predictions = plan.get('predictions', {})
        demand_confidence = predictions.get('demand_forecast', {}).get('confidence', 0.8)
        if demand_confidence < 0.75:
            risk_score += 0.15
            risk_factors.append("Low prediction confidence")
        
        # Factor 3: Risk factors identified (0-0.3)
        identified_risks = predictions.get('risk_factors', [])
        if len(identified_risks) > 3:
            risk_score += 0.2
            risk_factors.append(f"Multiple risk factors: {len(identified_risks)}")
        
        # Factor 4: Cost variance (0-0.2)
        cost_forecast = predictions.get('cost_forecast', {})
        if cost_forecast.get('avg_cost_per_tonne', 0) > 60:
            risk_score += 0.1
            risk_factors.append("High cost variance")
        
        # Determine risk level
        if risk_score < 0.15:
            risk_level = RiskLevel.LOW
        elif risk_score < 0.35:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.HIGH
        
        return {
            'risk_score': min(1.0, risk_score),
            'risk_level': risk_level,
            'risk_factors': risk_factors,
            'auto_publish_eligible': risk_score < 0.15
        }
    
    def auto_publish_plan(self, plan: Dict) -> Dict:
        """Auto-publish low-risk plan"""
        if not plan.get('auto_publish_eligible', False):
            raise ValueError("Plan not eligible for auto-publish")
        
        plan['status'] = 'auto_published'
        plan['published_at'] = datetime.now().isoformat()
        plan['published_by'] = 'auto_optimizer'
        
        self.logger.info(f"✓ Auto-published plan {plan['id']}")
        return plan
    
    def get_status(self) -> Dict:
        """Get auto-optimizer status"""
        return {
            'status': 'running',
            'last_optimization': self.last_optimization_time.isoformat() if self.last_optimization_time else None,
            'optimization_count': self.optimization_count,
            'next_scheduled_run': (datetime.now() + timedelta(days=1)).replace(hour=2, minute=0, second=0).isoformat(),
            'plans_generated': len(self.plans_history),
            'auto_published_plans': len([p for p in self.plans_history if p.get('status') == 'auto_published'])
        }
    
    def get_history(self, limit: int = 10) -> List[Dict]:
        """Get optimization history"""
        return self.plans_history[-limit:]
