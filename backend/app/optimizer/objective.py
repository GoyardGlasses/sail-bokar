"""
OR-Tools objective function builder.
"""

from ortools.sat.python import cp_model
from typing import Dict, List, Any
from .utils import (
    calculate_rail_cost, calculate_road_cost,
    calculate_partial_rake_penalty, calculate_delay_penalty,
    calculate_multi_destination_penalty
)

def build_objective_function(
    model: cp_model.CpModel,
    rake_vars: Dict[str, Any],
    truck_vars: Dict[str, Any],
    order_vars: Dict[str, Any],
    cost_params: Dict[str, Any],
    ml_predictions: Dict[str, Any]
) -> None:
    """
    Build the objective function to minimize total cost.
    
    Args:
        model: CP-SAT model
        rake_vars: Dictionary of rake variables
        truck_vars: Dictionary of truck variables
        order_vars: Dictionary of order variables
        cost_params: Cost parameters (rates, etc.)
        ml_predictions: ML predictions (delays, costs, etc.)
    """
    total_cost = 0
    
    # ========================================================================
    # RAIL COSTS
    # ========================================================================
    
    for rake_id, vars_dict in rake_vars.items():
        assigned = vars_dict.get('assigned', 1)
        wagons = vars_dict['wagons']
        tonnes = vars_dict['tonnes']
        route = vars_dict.get('route', 'Kolkata')
        
        # Freight cost
        freight_rate = cost_params.get('freight_rate_per_tonne', 500)
        freight_cost = tonnes * freight_rate
        
        # Demurrage cost
        demurrage_hours = ml_predictions.get('demurrage_hours', 0)
        demurrage_rate = cost_params.get('demurrage_rate_per_wagon_per_hour', 100)
        demurrage_cost = wagons * demurrage_hours * demurrage_rate
        
        # Delay penalty
        predicted_delay = ml_predictions.get(f'delay_{rake_id}', 2.0)
        delay_penalty = calculate_delay_penalty(predicted_delay, penalty_per_hour=1000)
        
        # Haldia surcharge
        haldia_surcharge = 0
        if 'Haldia' in route:
            haldia_surcharge = int((freight_cost + demurrage_cost) * 0.10)
        
        # Partial rake penalty
        partial_penalty = calculate_partial_rake_penalty(wagons, min_wagons=58, penalty_percent=0.20)
        
        # Total rail cost for this rake
        rake_cost = int(freight_cost + demurrage_cost + delay_penalty + haldia_surcharge + partial_penalty)
        total_cost += assigned * rake_cost
    
    # ========================================================================
    # ROAD COSTS
    # ========================================================================
    
    for truck_id, vars_dict in truck_vars.items():
        assigned = vars_dict.get('assigned', 1)
        tonnes = vars_dict['tonnes']
        destination = vars_dict.get('destination', 'Kolkata')
        
        # Distance-based cost
        distance_km = cost_params.get(f'distance_{destination}', 200)
        truck_cost_rate = cost_params.get('truck_cost_per_km_per_tonne', 30)
        truck_cost = tonnes * distance_km * truck_cost_rate
        
        # Delay penalty for road
        predicted_delay = ml_predictions.get(f'delay_{truck_id}', 1.5)
        delay_penalty = calculate_delay_penalty(predicted_delay, penalty_per_hour=500)
        
        # Total road cost for this truck
        truck_total_cost = int(truck_cost + delay_penalty)
        total_cost += assigned * truck_total_cost
    
    # ========================================================================
    # MULTI-DESTINATION PENALTY
    # ========================================================================
    
    multi_dest_count = 0
    for rake_id, vars_dict in rake_vars.items():
        destinations = vars_dict.get('destinations', [])
        if len(destinations) > 1:
            multi_dest_count += 1
    
    if multi_dest_count > 0:
        multi_dest_penalty = calculate_multi_destination_penalty(
            multi_dest_count,
            penalty_per_extra_dest=5000
        )
        total_cost += int(multi_dest_penalty)
    
    # ========================================================================
    # SET OBJECTIVE
    # ========================================================================
    
    model.Minimize(total_cost)

def build_weighted_objective(
    model: cp_model.CpModel,
    rake_vars: Dict[str, Any],
    truck_vars: Dict[str, Any],
    weights: Dict[str, float] = None
) -> None:
    """
    Build a weighted objective function (for multi-objective optimization).
    
    Args:
        model: CP-SAT model
        rake_vars: Dictionary of rake variables
        truck_vars: Dictionary of truck variables
        weights: Weights for different objectives (cost, time, utilization)
    """
    if weights is None:
        weights = {
            'cost': 0.7,
            'time': 0.2,
            'utilization': 0.1
        }
    
    total_objective = 0
    
    # Cost objective
    cost_objective = 0
    for rake_id, vars_dict in rake_vars.items():
        cost = vars_dict.get('cost', 0)
        cost_objective += cost
    
    for truck_id, vars_dict in truck_vars.items():
        cost = vars_dict.get('cost', 0)
        cost_objective += cost
    
    # Time objective (minimize total loading time)
    time_objective = 0
    for rake_id, vars_dict in rake_vars.items():
        loading_time = vars_dict.get('loading_time', 0)
        time_objective += loading_time
    
    # Utilization objective (maximize utilization)
    utilization_objective = 0
    for rake_id, vars_dict in rake_vars.items():
        tonnes = vars_dict.get('tonnes', 0)
        capacity = vars_dict.get('wagons', 58) * 63
        if capacity > 0:
            utilization = tonnes / capacity
            utilization_objective -= utilization  # Negative because we want to maximize
    
    # Combine objectives
    total_objective = (
        weights['cost'] * cost_objective +
        weights['time'] * time_objective +
        weights['utilization'] * utilization_objective
    )
    
    model.Minimize(int(total_objective))
