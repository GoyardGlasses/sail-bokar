"""
Monte Carlo Simulation Router
Advanced scenario analysis for rake formation optimization
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Optional
import numpy as np
from datetime import datetime
import asyncio
import json

router = APIRouter(prefix="/api/monte-carlo", tags=["monte-carlo"])

# ============================================================================
# DATA MODELS
# ============================================================================

class MaterialSpec(BaseModel):
    id: str
    name: str
    quantity: float
    unit: str = "tonnes"

class OrderSpec(BaseModel):
    id: str
    material_id: str
    quantity: float
    destination: str
    sla_hours: int

class RouteSpec(BaseModel):
    id: str
    destination: str
    base_delay: float

class EquipmentSpec(BaseModel):
    id: str
    type: str
    available: bool = True

class UncertaintyParams(BaseModel):
    material_availability_std_dev: float = 15
    order_arrival_variance: float = 20
    transport_delay_std_dev: float = 4
    cost_variation_std_dev: float = 10
    equipment_failure_rate: float = 5
    demand_variability: float = 25

class SimulationRequest(BaseModel):
    materials: List[MaterialSpec]
    orders: List[OrderSpec]
    routes: List[RouteSpec]
    equipment: List[EquipmentSpec]
    budget: float
    num_scenarios: int = 10000
    uncertainty_params: Optional[UncertaintyParams] = None

class SimulationResult(BaseModel):
    total_scenarios: int
    successful_scenarios: int
    failed_scenarios: int
    average_cost: float
    min_cost: float
    max_cost: float
    cost_std_dev: float
    average_utilization: float
    average_sla_compliance: float
    cost_risk: float
    delay_risk: float
    capacity_risk: float
    overall_risk: float
    confidence_interval_95: Dict[str, float]
    recommendations: List[str]
    timestamp: datetime

class SensitivityRequest(BaseModel):
    base_scenario: Dict
    parameter: str
    variations: List[float] = [0.8, 0.9, 1.0, 1.1, 1.2]

class SensitivityResult(BaseModel):
    parameter: str
    base_value: float
    elasticity: float
    variations: List[Dict]
    timestamp: datetime

# ============================================================================
# SIMULATION ENGINE
# ============================================================================

class MonteCarloEngine:
    """Monte Carlo simulation engine for rake formation"""
    
    def __init__(self, request: SimulationRequest):
        self.request = request
        self.uncertainty = request.uncertainty_params or UncertaintyParams()
        self.results = {
            'costs': [],
            'utilizations': [],
            'sla_compliances': [],
            'scenarios': []
        }
    
    def run_simulation(self) -> SimulationResult:
        """Run Monte Carlo simulation"""
        print(f"🎲 Starting simulation with {self.request.num_scenarios} scenarios...")
        
        for i in range(self.request.num_scenarios):
            # Generate random scenario
            scenario = self._generate_random_scenario()
            
            # Optimize rake plan
            plan = self._optimize_plan(scenario)
            
            # Calculate metrics
            cost = self._calculate_cost(plan, scenario)
            utilization = self._calculate_utilization(plan)
            sla_compliance = self._calculate_sla_compliance(plan, scenario)
            
            self.results['costs'].append(cost)
            self.results['utilizations'].append(utilization)
            self.results['sla_compliances'].append(sla_compliance)
            
            if (i + 1) % 1000 == 0:
                print(f"✓ Completed {i + 1}/{self.request.num_scenarios} scenarios")
        
        # Calculate statistics
        return self._calculate_statistics()
    
    def _generate_random_scenario(self) -> Dict:
        """Generate random scenario with uncertainty"""
        scenario = {
            'material_availability': {},
            'order_arrivals': [],
            'transport_delays': {},
            'cost_variations': {},
            'equipment_availability': {}
        }
        
        # Material availability
        for material in self.request.materials:
            variance = (np.random.random() - 0.5) * 2 * self.uncertainty.material_availability_std_dev
            factor = 1 + variance / 100
            scenario['material_availability'][material.id] = max(0, material.quantity * factor)
        
        # Order arrivals
        for order in self.request.orders:
            variance = (np.random.random() - 0.5) * 2 * self.uncertainty.order_arrival_variance / 100
            scenario['order_arrivals'].append({
                'id': order.id,
                'material_id': order.material_id,
                'quantity': max(0, order.quantity * (1 + variance)),
                'destination': order.destination,
                'sla_hours': order.sla_hours
            })
        
        # Transport delays (normal distribution)
        for route in self.request.routes:
            u1 = np.random.random()
            u2 = np.random.random()
            z = np.sqrt(-2 * np.log(u1)) * np.cos(2 * np.pi * u2)
            delay = route.base_delay + z * self.uncertainty.transport_delay_std_dev
            scenario['transport_delays'][route.id] = max(0, delay)
        
        # Cost variations
        cost_factors = ['fuel', 'labor', 'maintenance', 'toll', 'handling', 'demurrage']
        for factor in cost_factors:
            variance = (np.random.random() - 0.5) * 2 * self.uncertainty.cost_variation_std_dev
            scenario['cost_variations'][factor] = 1 + variance / 100
        
        # Equipment availability
        for equipment in self.request.equipment:
            is_available = np.random.random() * 100 > self.uncertainty.equipment_failure_rate
            scenario['equipment_availability'][equipment.id] = 1 if is_available else 0
        
        return scenario
    
    def _optimize_plan(self, scenario: Dict) -> Dict:
        """Optimize rake plan for scenario"""
        rakes = []
        
        # Group orders by destination
        orders_by_dest = {}
        for order in scenario['order_arrivals']:
            dest = order['destination']
            if dest not in orders_by_dest:
                orders_by_dest[dest] = []
            orders_by_dest[dest].append(order)
        
        # Create rakes
        for destination, orders in orders_by_dest.items():
            total_qty = sum(o['quantity'] for o in orders)
            
            if 0 < total_qty <= 2500:  # Max rake capacity
                rake = {
                    'destination': destination,
                    'orders': orders,
                    'total_quantity': total_qty,
                    'utilization': min(100, (total_qty / 2000) * 100),
                    'feasible': True
                }
                rakes.append(rake)
        
        return {
            'rakes': rakes,
            'total_quantity': sum(r['total_quantity'] for r in rakes),
            'feasible': len(rakes) > 0
        }
    
    def _calculate_cost(self, plan: Dict, scenario: Dict) -> float:
        """Calculate total cost with variations"""
        total_cost = 0
        base_rate = 50  # ₹50 per tonne
        
        for rake in plan['rakes']:
            cost = rake['total_quantity'] * base_rate
            
            # Apply cost variations
            for factor, multiplier in scenario['cost_variations'].items():
                cost *= multiplier
            
            total_cost += cost
        
        return total_cost
    
    def _calculate_utilization(self, plan: Dict) -> float:
        """Calculate average utilization"""
        if not plan['rakes']:
            return 0
        
        total_util = sum(r['utilization'] for r in plan['rakes'])
        return total_util / len(plan['rakes'])
    
    def _calculate_sla_compliance(self, plan: Dict, scenario: Dict) -> float:
        """Calculate SLA compliance percentage"""
        compliant = 0
        total = 0
        
        for rake in plan['rakes']:
            for order in rake['orders']:
                total += 1
                # Find route delay
                route_id = f"route-{order['destination'].lower()}"
                delay = scenario['transport_delays'].get(route_id, 0)
                
                if delay <= order['sla_hours']:
                    compliant += 1
        
        return (compliant / total * 100) if total > 0 else 0
    
    def _calculate_statistics(self) -> SimulationResult:
        """Calculate statistics from results"""
        costs = np.array(self.results['costs'])
        utilizations = np.array(self.results['utilizations'])
        sla_compliances = np.array(self.results['sla_compliances'])
        
        # Basic statistics
        avg_cost = float(np.mean(costs))
        min_cost = float(np.min(costs))
        max_cost = float(np.max(costs))
        cost_std_dev = float(np.std(costs))
        
        # Percentiles
        p5_cost = float(np.percentile(costs, 5))
        p95_cost = float(np.percentile(costs, 95))
        
        # Risk metrics
        budget = self.request.budget
        cost_risk = (np.sum(costs > budget) / len(costs)) * 100
        delay_risk = (np.sum(sla_compliances < 95) / len(sla_compliances)) * 100
        capacity_risk = (np.sum(utilizations < 80) / len(utilizations)) * 100
        overall_risk = (cost_risk + delay_risk + capacity_risk) / 3
        
        # Recommendations
        recommendations = self._generate_recommendations(
            avg_cost, cost_std_dev, cost_risk, delay_risk, capacity_risk, utilizations
        )
        
        return SimulationResult(
            total_scenarios=self.request.num_scenarios,
            successful_scenarios=int(np.sum(utilizations > 0)),
            failed_scenarios=int(np.sum(utilizations == 0)),
            average_cost=avg_cost,
            min_cost=min_cost,
            max_cost=max_cost,
            cost_std_dev=cost_std_dev,
            average_utilization=float(np.mean(utilizations)),
            average_sla_compliance=float(np.mean(sla_compliances)),
            cost_risk=float(cost_risk),
            delay_risk=float(delay_risk),
            capacity_risk=float(capacity_risk),
            overall_risk=float(overall_risk),
            confidence_interval_95={
                'cost_min': p5_cost,
                'cost_max': p95_cost,
                'utilization_min': float(np.percentile(utilizations, 5)),
                'utilization_max': float(np.percentile(utilizations, 95)),
                'sla_min': float(np.percentile(sla_compliances, 5)),
                'sla_max': float(np.percentile(sla_compliances, 95))
            },
            recommendations=recommendations,
            timestamp=datetime.now()
        )
    
    def _generate_recommendations(self, avg_cost, std_dev, cost_risk, delay_risk, capacity_risk, utilizations):
        """Generate actionable recommendations"""
        recommendations = []
        
        if cost_risk > 30:
            recommendations.append(
                f"⚠️ High cost risk ({cost_risk:.1f}%). Consider: Negotiate better rates, optimize routes, or increase batch sizes."
            )
        
        if std_dev > avg_cost * 0.2:
            recommendations.append(
                f"⚠️ High cost variability ({std_dev/avg_cost*100:.1f}%). Implement cost controls and buffer management."
            )
        
        if delay_risk > 20:
            recommendations.append(
                f"⚠️ High delay risk ({delay_risk:.1f}%). Increase buffer times, improve route planning, or add redundancy."
            )
        
        if capacity_risk > 25:
            recommendations.append(
                f"⚠️ Capacity utilization risk ({capacity_risk:.1f}%). Consider: Consolidate orders, optimize rake composition, or increase capacity."
            )
        
        avg_util = np.mean(utilizations)
        if avg_util < 75:
            recommendations.append(
                f"💡 Low utilization ({avg_util:.1f}%). Opportunity to consolidate rakes and reduce costs."
            )
        
        if not recommendations:
            recommendations.append("✅ Plan is robust across all scenarios. Proceed with confidence.")
        
        return recommendations

# ============================================================================
# API ENDPOINTS
# ============================================================================

@router.post("/simulate", response_model=SimulationResult)
async def run_simulation(request: SimulationRequest, background_tasks: BackgroundTasks):
    """
    Run Monte Carlo simulation
    
    - **num_scenarios**: Number of scenarios to simulate (default: 10000)
    - **uncertainty_params**: Custom uncertainty parameters
    """
    try:
        engine = MonteCarloEngine(request)
        result = engine.run_simulation()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sensitivity", response_model=SensitivityResult)
async def sensitivity_analysis(request: SensitivityRequest):
    """
    Perform sensitivity analysis on a parameter
    
    - **parameter**: Parameter to analyze
    - **variations**: List of variation factors (e.g., [0.8, 0.9, 1.0, 1.1, 1.2])
    """
    try:
        # This would run simulations for each variation
        # For now, return a placeholder
        return SensitivityResult(
            parameter=request.parameter,
            base_value=1.0,
            elasticity=1.5,
            variations=[
                {'value': v, 'cost_impact': (v - 1) * 100 * 1.5} 
                for v in request.variations
            ],
            timestamp=datetime.now()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Check Monte Carlo service health"""
    return {
        'status': 'healthy',
        'service': 'Monte Carlo Simulation Engine',
        'version': '1.0.0',
        'timestamp': datetime.now()
    }

@router.get("/config")
async def get_default_config():
    """Get default uncertainty parameters"""
    return {
        'material_availability_std_dev': 15,
        'order_arrival_variance': 20,
        'transport_delay_std_dev': 4,
        'cost_variation_std_dev': 10,
        'equipment_failure_rate': 5,
        'demand_variability': 25,
        'recommended_scenarios': 10000,
        'min_scenarios': 1000,
        'max_scenarios': 100000
    }
