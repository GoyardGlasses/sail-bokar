"""
OR-Tools CP-SAT Solver for rake formation and dispatch optimization.
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.
"""

import json
import time
import random
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from ortools.sat.python import cp_model
import logging

from .constraints import (
    add_rake_size_constraints,
    add_rake_availability_constraint,
    add_siding_capacity_constraints,
    add_rake_capacity_constraints,
    add_truck_capacity_constraints,
    add_order_assignment_constraints,
)
from .objective import build_objective_function
from .utils import (
    calculate_loading_time_slots,
    calculate_rail_cost,
    calculate_road_cost,
    get_distance_to_destination,
    adjust_throughput_for_monsoon,
    SLOTS_PER_DAY,
)

logger = logging.getLogger(__name__)

class RakeFormationOptimizer:
    """CP-SAT based optimizer for rake formation and dispatch."""
    
    def __init__(self, time_limit_seconds: int = 20, random_seed: int = 42):
        """
        Initialize optimizer.
        
        Args:
            time_limit_seconds: Solver time limit
            random_seed: Random seed for reproducibility
        """
        self.time_limit_seconds = time_limit_seconds
        self.random_seed = random_seed
        self.last_solution = None
        self.solver_status = None
    
    def solve(self, input_json: Dict[str, Any]) -> Dict[str, Any]:
        """
        Solve the rake formation and dispatch problem.
        
        Args:
            input_json: Input JSON with orders, inventory, available resources
        
        Returns:
            Optimized dispatch plan
        """
        start_time = time.time()
        
        try:
            # Extract input data
            orders = input_json.get('orders', [])
            available_rakes = input_json.get('available_rakes', 5)
            available_trucks = input_json.get('available_trucks', 20)
            inventory = input_json.get('inventory', {})
            ml_predictions = input_json.get('ml_predictions', {})
            cost_params = input_json.get('cost_parameters', {})
            
            if not orders:
                return self._empty_plan()
            
            # Create CP-SAT model
            model = cp_model.CpModel()
            
            # Build decision variables
            rake_vars, truck_vars, order_vars = self._build_variables(
                model, orders, available_rakes, available_trucks
            )
            
            # Add constraints
            self._add_constraints(
                model, rake_vars, truck_vars, order_vars, available_rakes
            )
            
            # Build objective
            build_objective_function(
                model, rake_vars, truck_vars, order_vars, cost_params, ml_predictions
            )
            
            # Solve
            solver = cp_model.CpSolver()
            solver.parameters.max_time_in_seconds = self.time_limit_seconds
            solver.parameters.random_seed = self.random_seed
            
            status = solver.Solve(model)
            elapsed = time.time() - start_time
            
            # Extract solution
            if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
                solution = self._extract_solution(
                    solver, rake_vars, truck_vars, order_vars, orders, ml_predictions
                )
                solution['solver_status'] = 'OPTIMAL' if status == cp_model.OPTIMAL else 'FEASIBLE'
                solution['solver_time_seconds'] = elapsed
                solution['objective_value'] = solver.ObjectiveValue()
                return solution
            else:
                logger.warning(f"Solver status: {status}. Running greedy fallback.")
                return self._greedy_fallback(orders, available_rakes, available_trucks, ml_predictions)
        
        except Exception as e:
            logger.error(f"Solver error: {str(e)}. Running greedy fallback.")
            return self._greedy_fallback(
                input_json.get('orders', []),
                input_json.get('available_rakes', 5),
                input_json.get('available_trucks', 20),
                input_json.get('ml_predictions', {})
            )
    
    def _build_variables(
        self,
        model: cp_model.CpModel,
        orders: List[Dict],
        available_rakes: int,
        available_trucks: int
    ) -> Tuple[Dict, Dict, Dict]:
        """Build decision variables."""
        rake_vars = {}
        truck_vars = {}
        order_vars = {}
        
        # Rake variables
        for i in range(available_rakes):
            rake_id = f"RAKE_{i+1:03d}"
            rake_vars[rake_id] = {
                'assigned': model.NewBoolVariable(f'{rake_id}_assigned'),
                'wagons': model.NewIntVar(58, 59, f'{rake_id}_wagons'),
                'tonnes': model.NewIntVar(0, 3717, f'{rake_id}_tonnes'),  # 59 * 63
                'start_slot': model.NewIntVar(0, SLOTS_PER_DAY - 1, f'{rake_id}_start'),
                'end_slot': model.NewIntVar(0, SLOTS_PER_DAY - 1, f'{rake_id}_end'),
                'route': 'Kolkata',
                'destinations': [],
                'cost': 0,
            }
        
        # Truck variables
        for i in range(available_trucks):
            truck_id = f"TRUCK_{i+1:03d}"
            truck_vars[truck_id] = {
                'assigned': model.NewBoolVariable(f'{truck_id}_assigned'),
                'tonnes': model.NewIntVar(0, 22, f'{truck_id}_tonnes'),
                'destination': 'Kolkata',
                'cost': 0,
            }
        
        # Order variables
        for order in orders:
            order_id = order.get('order_id', f'ORD_{len(order_vars)+1}')
            order_vars[order_id] = {
                'rail_assigned': model.NewBoolVariable(f'{order_id}_rail'),
                'road_assigned': model.NewBoolVariable(f'{order_id}_road'),
                'quantity': order.get('quantity_tonnes', 0),
                'priority': order.get('priority', 'MEDIUM'),
                'destination': order.get('destination', 'Kolkata'),
            }
        
        return rake_vars, truck_vars, order_vars
    
    def _add_constraints(
        self,
        model: cp_model.CpModel,
        rake_vars: Dict,
        truck_vars: Dict,
        order_vars: Dict,
        available_rakes: int
    ) -> None:
        """Add all constraints to the model."""
        add_rake_size_constraints(model, rake_vars)
        add_rake_availability_constraint(model, {k: v['assigned'] for k, v in rake_vars.items()}, available_rakes)
        add_siding_capacity_constraints(model, rake_vars)
        add_rake_capacity_constraints(model, rake_vars)
        add_truck_capacity_constraints(model, truck_vars)
        add_order_assignment_constraints(model, order_vars, rake_vars, truck_vars)
    
    def _extract_solution(
        self,
        solver: cp_model.CpSolver,
        rake_vars: Dict,
        truck_vars: Dict,
        order_vars: Dict,
        orders: List[Dict],
        ml_predictions: Dict
    ) -> Dict[str, Any]:
        """Extract solution from solver."""
        rakes = []
        trucks = []
        total_cost = 0
        total_tonnage = 0
        
        # Extract rake solutions
        for rake_id, vars_dict in rake_vars.items():
            if solver.Value(vars_dict['assigned']):
                wagons = solver.Value(vars_dict['wagons'])
                tonnes = solver.Value(vars_dict['tonnes'])
                
                if tonnes > 0:
                    delay = ml_predictions.get(f'delay_{rake_id}', 2.0)
                    cost = calculate_rail_cost(tonnes, wagons, 'Kolkata', delay_hours=delay)
                    
                    rakes.append({
                        'rake_id': rake_id,
                        'destination': 'Kolkata',
                        'material_type': 'Mixed',
                        'tonnes': tonnes,
                        'wagons': wagons,
                        'estimated_cost': cost,
                        'estimated_delay_hours': delay,
                    })
                    total_cost += cost
                    total_tonnage += tonnes
        
        # Extract truck solutions
        for truck_id, vars_dict in truck_vars.items():
            if solver.Value(vars_dict['assigned']):
                tonnes = solver.Value(vars_dict['tonnes'])
                
                if tonnes > 0:
                    delay = ml_predictions.get(f'delay_{truck_id}', 1.5)
                    cost = calculate_road_cost(tonnes, 200, truck_cost_per_km_per_tonne=30)
                    
                    trucks.append({
                        'truck_id': truck_id,
                        'destination': 'Kolkata',
                        'material_type': 'Mixed',
                        'tonnes': tonnes,
                        'estimated_cost': cost,
                        'estimated_delay_hours': delay,
                    })
                    total_cost += cost
                    total_tonnage += tonnes
        
        summary = {
            'total_cost': total_cost,
            'total_tonnage': total_tonnage,
            'rail_vs_road_ratio': len(rakes) / max(1, len(trucks)),
            'total_rakes': len(rakes),
            'total_trucks': len(trucks),
            'estimated_completion_days': (total_tonnage / 1000) * 0.5,
        }
        
        return {
            'rakes': rakes,
            'trucks': trucks,
            'summary': summary,
        }
    
    def _greedy_fallback(
        self,
        orders: List[Dict],
        available_rakes: int,
        available_trucks: int,
        ml_predictions: Dict
    ) -> Dict[str, Any]:
        """Greedy fallback algorithm when solver times out."""
        logger.info("Running greedy fallback algorithm...")
        
        # Sort orders by priority and due date
        sorted_orders = sorted(
            orders,
            key=lambda x: (
                {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}.get(x.get('priority', 'MEDIUM'), 1),
                x.get('due_date', '9999-12-31')
            )
        )
        
        rakes = []
        trucks = []
        total_cost = 0
        total_tonnage = 0
        rake_idx = 0
        truck_idx = 0
        
        for order in sorted_orders:
            tonnes = order.get('quantity_tonnes', 0)
            
            # Try to assign to rake
            if rake_idx < available_rakes and tonnes >= 500:
                wagons = 58 if tonnes <= 3654 else 59
                delay = ml_predictions.get(f'delay_RAKE_{rake_idx+1:03d}', 2.0)
                cost = calculate_rail_cost(tonnes, wagons, 'Kolkata', delay_hours=delay)
                
                rakes.append({
                    'rake_id': f'RAKE_{rake_idx+1:03d}',
                    'destination': order.get('destination', 'Kolkata'),
                    'material_type': order.get('material_type', 'Mixed'),
                    'tonnes': tonnes,
                    'wagons': wagons,
                    'estimated_cost': cost,
                    'estimated_delay_hours': delay,
                })
                total_cost += cost
                total_tonnage += tonnes
                rake_idx += 1
            elif truck_idx < available_trucks:
                truck_tonnes = min(tonnes, 22)
                delay = ml_predictions.get(f'delay_TRUCK_{truck_idx+1:03d}', 1.5)
                cost = calculate_road_cost(truck_tonnes, 200, truck_cost_per_km_per_tonne=30)
                
                trucks.append({
                    'truck_id': f'TRUCK_{truck_idx+1:03d}',
                    'destination': order.get('destination', 'Kolkata'),
                    'material_type': order.get('material_type', 'Mixed'),
                    'tonnes': truck_tonnes,
                    'estimated_cost': cost,
                    'estimated_delay_hours': delay,
                })
                total_cost += cost
                total_tonnage += truck_tonnes
                truck_idx += 1
        
        summary = {
            'total_cost': total_cost,
            'total_tonnage': total_tonnage,
            'rail_vs_road_ratio': len(rakes) / max(1, len(trucks)),
            'total_rakes': len(rakes),
            'total_trucks': len(trucks),
            'estimated_completion_days': (total_tonnage / 1000) * 0.5,
        }
        
        return {
            'rakes': rakes,
            'trucks': trucks,
            'summary': summary,
            'solver_status': 'GREEDY_FALLBACK',
            'solver_time_seconds': 0,
            'objective_value': total_cost,
        }
    
    def _empty_plan(self) -> Dict[str, Any]:
        """Return empty plan when no orders."""
        return {
            'rakes': [],
            'trucks': [],
            'summary': {
                'total_cost': 0,
                'total_tonnage': 0,
                'rail_vs_road_ratio': 0,
                'total_rakes': 0,
                'total_trucks': 0,
                'estimated_completion_days': 0,
            },
            'solver_status': 'EMPTY_INPUT',
            'solver_time_seconds': 0,
            'objective_value': 0,
        }
