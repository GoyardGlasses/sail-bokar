"""
OR-Tools objective function builder.
"""

from ortools.sat.python import cp_model
from typing import Dict, List, Any
from datetime import datetime
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
    # SLA / LATE DELIVERY PENALTIES (DUE-DATE AWARE)
    # ========================================================================

    planning_dt_str = cost_params.get('planning_datetime') or cost_params.get('planning_date')
    planning_dt: datetime
    if planning_dt_str:
        try:
            planning_dt = datetime.fromisoformat(planning_dt_str)
        except Exception:
            planning_dt = datetime.now()
    else:
        planning_dt = datetime.now()

    sla_penalty_per_tonne_hour = cost_params.get('sla_penalty_per_tonne_hour', 100)
    tight_window_hours = cost_params.get('sla_tight_window_hours', 24)

    priority_weights = {
        'HIGH': cost_params.get('sla_priority_weight_high', 2.0),
        'MEDIUM': cost_params.get('sla_priority_weight_medium', 1.0),
        'LOW': cost_params.get('sla_priority_weight_low', 0.5),
    }

    for order_id, vars_dict in order_vars.items():
        due_date_str = vars_dict.get('due_date')
        if not due_date_str:
            continue

        try:
            due_dt = datetime.fromisoformat(due_date_str)
        except Exception:
            continue

        hours_to_due = (due_dt - planning_dt).total_seconds() / 3600.0
        quantity = float(vars_dict.get('quantity', 0) or 0)
        if quantity <= 0:
            continue

        priority = str(vars_dict.get('priority', 'MEDIUM')).upper()
        priority_weight = priority_weights.get(priority, priority_weights['MEDIUM'])

        # Orders far from due date have no SLA pressure
        if hours_to_due >= tight_window_hours:
            continue
        elif hours_to_due >= 0:
            # Approaching due date: the closer we are, the higher the risk
            lateness_risk_hours = tight_window_hours - hours_to_due
        else:
            # Already past due: treat as maximum tightness plus overdue amount
            lateness_risk_hours = tight_window_hours - hours_to_due

        base_penalty = lateness_risk_hours * quantity * sla_penalty_per_tonne_hour * priority_weight
        sla_penalty = int(max(0, base_penalty))

        if sla_penalty <= 0:
            continue

        rail_var = vars_dict.get('rail_assigned')
        road_var = vars_dict.get('road_assigned')

        assign_vars = []
        if rail_var is not None:
            assign_vars.append(rail_var)
        if road_var is not None:
            assign_vars.append(road_var)

        if assign_vars:
            total_cost += sum(assign_vars) * sla_penalty

    # Mode choice alignment (ML-recommended rail vs road)
    mode_penalty_per_tonne = cost_params.get('mode_mismatch_penalty_per_tonne', 50)

    if mode_penalty_per_tonne > 0:
        for order_id, vars_dict in order_vars.items():
            idx = vars_dict.get('index')
            if idx is None:
                continue

            recommended_mode = str(ml_predictions.get(f'mode_order_{idx}', '')).upper()
            if not recommended_mode:
                continue

            quantity = float(vars_dict.get('quantity', 0) or 0)
            if quantity <= 0:
                continue

            rail_var = vars_dict.get('rail_assigned')
            road_var = vars_dict.get('road_assigned')

            if recommended_mode == 'RAIL' and road_var is not None:
                penalty = int(quantity * mode_penalty_per_tonne)
                if penalty > 0:
                    total_cost += road_var * penalty
            elif recommended_mode == 'ROAD' and rail_var is not None:
                penalty = int(quantity * mode_penalty_per_tonne)
                if penalty > 0:
                    total_cost += rail_var * penalty
    
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
