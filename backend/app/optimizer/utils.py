"""
Optimizer utility functions - time slots, cost calculations, etc.
"""

from datetime import datetime, timedelta
from typing import List, Tuple, Dict, Any
import math

# ============================================================================
# TIME SLOT UTILITIES
# ============================================================================

SLOT_DURATION_MINUTES = 15  # 15-minute time slots
SLOTS_PER_DAY = 24 * 60 // SLOT_DURATION_MINUTES  # 96 slots per day

def datetime_to_slot(dt: datetime) -> int:
    """Convert datetime to time slot number (0-95 for a day)."""
    minutes_since_midnight = dt.hour * 60 + dt.minute
    slot = minutes_since_midnight // SLOT_DURATION_MINUTES
    return min(slot, SLOTS_PER_DAY - 1)

def slot_to_datetime(slot: int, base_date: datetime = None) -> datetime:
    """Convert time slot to datetime."""
    if base_date is None:
        base_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    minutes = slot * SLOT_DURATION_MINUTES
    return base_date + timedelta(minutes=minutes)

def calculate_loading_time_slots(
    tonnes: float,
    throughput_tph: float,
    slot_duration_minutes: int = SLOT_DURATION_MINUTES
) -> int:
    """
    Calculate loading time in time slots.
    
    Args:
        tonnes: Tonnes to load
        throughput_tph: Throughput in tonnes per hour
        slot_duration_minutes: Duration of each slot in minutes
    
    Returns:
        Number of slots required
    """
    if throughput_tph <= 0:
        return 1
    
    loading_hours = tonnes / throughput_tph
    loading_minutes = loading_hours * 60
    slots = math.ceil(loading_minutes / slot_duration_minutes)
    return max(1, slots)

# ============================================================================
# COST CALCULATION UTILITIES
# ============================================================================

def calculate_rail_cost(
    tonnes: float,
    wagons: int,
    route: str,
    freight_rate_per_tonne: float = 500,
    demurrage_hours: float = 0,
    demurrage_rate_per_wagon_per_hour: float = 100,
) -> float:
    """
    Calculate rail dispatch cost.
    
    Args:
        tonnes: Tonnes dispatched
        wagons: Number of wagons
        route: Route name
        freight_rate_per_tonne: Freight rate per tonne
        demurrage_hours: Demurrage hours
        demurrage_rate_per_wagon_per_hour: Demurrage rate
    
    Returns:
        Total cost in Rs
    """
    # Freight cost
    freight_cost = tonnes * freight_rate_per_tonne
    
    # Demurrage cost
    demurrage_cost = wagons * demurrage_hours * demurrage_rate_per_wagon_per_hour
    
    # Haldia route surcharge (10%)
    haldia_surcharge = 0
    if 'Haldia' in route:
        haldia_surcharge = (freight_cost + demurrage_cost) * 0.10
    
    total_cost = freight_cost + demurrage_cost + haldia_surcharge
    return total_cost

def calculate_road_cost(
    tonnes: float,
    distance_km: float,
    truck_cost_per_km_per_tonne: float = 30,
) -> float:
    """
    Calculate road transport cost.
    
    Args:
        tonnes: Tonnes transported
        distance_km: Distance in km
        truck_cost_per_km_per_tonne: Cost per km per tonne
    
    Returns:
        Total cost in Rs
    """
    cost = tonnes * distance_km * truck_cost_per_km_per_tonne
    return cost

def calculate_partial_rake_penalty(
    wagons: int,
    min_wagons: int = 58,
    penalty_percent: float = 0.20
) -> float:
    """
    Calculate penalty for partial rakes.
    
    Args:
        wagons: Number of wagons used
        min_wagons: Minimum wagons for full rake
        penalty_percent: Penalty as percentage of freight cost
    
    Returns:
        Penalty amount
    """
    if wagons >= min_wagons:
        return 0.0
    
    # Penalty: 20% of estimated cost for partial rake
    estimated_cost = wagons * 63 * 500  # wagons * capacity * rate
    penalty = estimated_cost * penalty_percent
    return penalty

def calculate_delay_penalty(
    delay_hours: float,
    penalty_per_hour: float = 1000,
) -> float:
    """
    Calculate delay penalty cost.
    
    Args:
        delay_hours: Delay in hours
        penalty_per_hour: Penalty per hour
    
    Returns:
        Penalty cost in Rs
    """
    return delay_hours * penalty_per_hour

def calculate_multi_destination_penalty(
    num_destinations: int,
    penalty_per_extra_dest: float = 5000,
) -> float:
    """
    Calculate penalty for multi-destination rakes.
    
    Args:
        num_destinations: Number of destinations
        penalty_per_extra_dest: Penalty per extra destination
    
    Returns:
        Penalty cost in Rs
    """
    if num_destinations <= 1:
        return 0.0
    
    return (num_destinations - 1) * penalty_per_extra_dest

# ============================================================================
# VALIDATION UTILITIES
# ============================================================================

def validate_rake_capacity(wagons: int, tonnes: float) -> bool:
    """Validate that tonnes fit in wagons."""
    capacity = wagons * 63.0  # 63 tonnes per wagon
    return tonnes <= capacity

def validate_truck_capacity(tonnes: float, truck_capacity: float = 22.0) -> bool:
    """Validate that tonnes fit in one truck."""
    return tonnes <= truck_capacity

def validate_time_slot_overlap(
    start_slot1: int,
    end_slot1: int,
    start_slot2: int,
    end_slot2: int
) -> bool:
    """Check if two time slots overlap."""
    return not (end_slot1 < start_slot2 or end_slot2 < start_slot1)

# ============================================================================
# DISTANCE CALCULATION (SIMPLIFIED)
# ============================================================================

ROUTE_DISTANCES = {
    'Kolkata': 250,
    'Patna': 300,
    'Ranchi': 150,
    'Durgapur': 100,
    'Haldia': 280,
}

def get_distance_to_destination(destination: str) -> float:
    """Get distance from Bokaro to destination."""
    return ROUTE_DISTANCES.get(destination, 200)

# ============================================================================
# MONSOON ADJUSTMENT
# ============================================================================

MONSOON_MONTHS = [6, 7, 8, 9]  # June to September
MONSOON_THROUGHPUT_REDUCTION = 0.25  # 25% reduction

def adjust_throughput_for_monsoon(
    throughput_tph: float,
    date: datetime
) -> float:
    """Adjust throughput for monsoon season."""
    if date.month in MONSOON_MONTHS:
        return throughput_tph * (1 - MONSOON_THROUGHPUT_REDUCTION)
    return throughput_tph
