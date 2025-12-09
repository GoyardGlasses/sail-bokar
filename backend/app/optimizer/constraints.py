"""
OR-Tools constraint definitions.
"""

from ortools.sat.python import cp_model
from typing import Dict, List, Any
from .utils import validate_rake_capacity, validate_truck_capacity

def add_rake_size_constraints(
    model: cp_model.CpModel,
    rake_vars: Dict[str, Any],
    min_wagons: int = 58,
    max_wagons: int = 59
) -> None:
    """
    Add rake size constraints (58-59 wagons).
    
    Args:
        model: CP-SAT model
        rake_vars: Dictionary of rake variables
        min_wagons: Minimum wagons per rake
        max_wagons: Maximum wagons per rake
    """
    for rake_id, vars_dict in rake_vars.items():
        wagons = vars_dict['wagons']
        model.Add(wagons >= min_wagons)
        model.Add(wagons <= max_wagons)

def add_rake_availability_constraint(
    model: cp_model.CpModel,
    rake_assignment_vars: Dict[str, Any],
    available_rakes: int
) -> None:
    """
    Add constraint on available rakes.
    
    Args:
        model: CP-SAT model
        rake_assignment_vars: Dictionary of rake assignment variables
        available_rakes: Number of available rakes
    """
    assigned_rakes = [var for var in rake_assignment_vars.values()]
    model.Add(sum(assigned_rakes) <= available_rakes)

def add_siding_capacity_constraints(
    model: cp_model.CpModel,
    rake_vars: Dict[str, Any],
    max_simultaneous_rakes: int = 2
) -> None:
    """
    Add siding capacity constraints (max 2 simultaneous loads per LP).
    
    Args:
        model: CP-SAT model
        rake_vars: Dictionary of rake variables
        max_simultaneous_rakes: Max rakes loading simultaneously at one LP
    """
    # Group rakes by loading point and time slot
    lp_time_rakes = {}
    
    for rake_id, vars_dict in rake_vars.items():
        lp = vars_dict.get('lp')
        start_slot = vars_dict.get('start_slot')
        end_slot = vars_dict.get('end_slot')
        
        if lp and start_slot and end_slot:
            # For simplicity, assume each rake occupies its time slot
            key = (lp, start_slot)
            if key not in lp_time_rakes:
                lp_time_rakes[key] = []
            lp_time_rakes[key].append(vars_dict.get('assigned', 1))
    
    # Add capacity constraint for each LP-time combination
    for (lp, slot), rakes in lp_time_rakes.items():
        if rakes:
            model.Add(sum(rakes) <= max_simultaneous_rakes)

def add_rake_capacity_constraints(
    model: cp_model.CpModel,
    rake_vars: Dict[str, Any]
) -> None:
    """
    Add rake capacity constraints (tonnes = wagons * 63).
    
    Args:
        model: CP-SAT model
        rake_vars: Dictionary of rake variables
    """
    for rake_id, vars_dict in rake_vars.items():
        wagons = vars_dict['wagons']
        tonnes = vars_dict['tonnes']
        
        # tonnes <= wagons * 63
        model.Add(tonnes <= wagons * 63)

def add_truck_capacity_constraints(
    model: cp_model.CpModel,
    truck_vars: Dict[str, Any],
    truck_capacity: float = 22.0
) -> None:
    """
    Add truck capacity constraints.
    
    Args:
        model: CP-SAT model
        truck_vars: Dictionary of truck variables
        truck_capacity: Truck capacity in tonnes
    """
    for truck_id, vars_dict in truck_vars.items():
        tonnes = vars_dict['tonnes']
        # tonnes <= truck_capacity
        model.Add(tonnes <= int(truck_capacity))

def add_order_assignment_constraints(
    model: cp_model.CpModel,
    order_vars: Dict[str, Any],
    rake_vars: Dict[str, Any],
    truck_vars: Dict[str, Any]
) -> None:
    """
    Add constraints ensuring each order is assigned to exactly one transport mode.
    
    Args:
        model: CP-SAT model
        order_vars: Dictionary of order variables
        rake_vars: Dictionary of rake variables
        truck_vars: Dictionary of truck variables
    """
    for order_id, vars_dict in order_vars.items():
        rail_var = vars_dict.get('rail_assigned')
        road_var = vars_dict.get('road_assigned')
        
        if rail_var and road_var:
            # Each order assigned to either rail or road (but not both)
            model.Add(rail_var + road_var == 1)

def add_loading_time_constraints(
    model: cp_model.CpModel,
    rake_vars: Dict[str, Any],
    throughput_tph: float = 400.0,
    slot_duration_minutes: int = 15
) -> None:
    """
    Add loading time constraints.
    
    Args:
        model: CP-SAT model
        rake_vars: Dictionary of rake variables
        throughput_tph: Throughput in tonnes per hour
        slot_duration_minutes: Duration of each time slot
    """
    # Use a linear capacity-per-slot approximation so that the constraint is
    # compatible with CP-SAT (no division by IntVar).
    if throughput_tph <= 0:
        return

    capacity_per_slot = int(throughput_tph * slot_duration_minutes / 60) or 1

    for rake_id, vars_dict in rake_vars.items():
        tonnes = vars_dict['tonnes']
        start_slot = vars_dict.get('start_slot')
        end_slot = vars_dict.get('end_slot')

        if start_slot is not None and end_slot is not None:
            # Calculate minimum loading time in slots (capacity-based)
            # tonnes <= capacity_per_slot * (end_slot - start_slot + 1)
            slots_expr = end_slot - start_slot + 1
            model.Add(tonnes <= slots_expr * capacity_per_slot)

def add_multi_destination_constraints(
    model: cp_model.CpModel,
    order_vars: Dict[str, Any],
    available_rakes: int,
    max_destinations_per_rake: int = 1
) -> None:
    """
    Add constraints for multi-destination rakes.
    
    Args:
        model: CP-SAT model
        rake_vars: Dictionary of rake variables
        available_rakes: Number of available rakes
        multi_dest_threshold: Threshold for allowing multi-destination
    """
    if available_rakes <= 0 or max_destinations_per_rake <= 0:
        return

    dest_used_vars = {}

    for order_id, vars_dict in order_vars.items():
        destination = vars_dict.get('destination')
        rail_var = vars_dict.get('rail_assigned')

        if destination is None or rail_var is None:
            continue

        dest_key = str(destination)
        if dest_key not in dest_used_vars:
            dest_used_vars[dest_key] = model.NewBoolVariable(f'dest_{dest_key}_rail_used')

        dest_used_var = dest_used_vars[dest_key]

        model.Add(rail_var <= dest_used_var)

    for dest_key, dest_used_var in dest_used_vars.items():
        rail_vars_for_dest = [
            vars_dict.get('rail_assigned')
            for vars_dict in order_vars.values()
            if str(vars_dict.get('destination')) == dest_key and vars_dict.get('rail_assigned') is not None
        ]

        if rail_vars_for_dest:
            model.Add(sum(rail_vars_for_dest) >= dest_used_var)

    if dest_used_vars:
        model.Add(sum(dest_used_vars.values()) <= available_rakes * max_destinations_per_rake)

def add_safety_stock_constraints(
    model: cp_model.CpModel,
    material_vars: Dict[str, Any],
    inventory: Dict[str, float],
    safety_stock_percent: float = 0.10
) -> None:
    """
    Add safety stock constraints.
    
    Args:
        model: CP-SAT model
        material_vars: Dictionary of material variables
        inventory: Current inventory by material
        safety_stock_percent: Safety stock as percentage of inventory
    """
    for material, current_stock in inventory.items():
        safety_stock = current_stock * safety_stock_percent
        
        if material in material_vars:
            dispatched = material_vars[material].get('dispatched', 0)
            # dispatched <= current_stock - safety_stock
            model.Add(dispatched <= int(current_stock - safety_stock))
