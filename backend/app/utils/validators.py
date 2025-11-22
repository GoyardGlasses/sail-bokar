"""
Input validation utilities.
"""

from typing import List, Optional
from datetime import datetime

def validate_date_format(date_str: str) -> bool:
    """Validate date string format (YYYY-MM-DD)."""
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return True
    except ValueError:
        return False

def validate_positive_number(value: float) -> bool:
    """Validate that a number is positive."""
    return isinstance(value, (int, float)) and value > 0

def validate_in_list(value: str, allowed_values: List[str]) -> bool:
    """Validate that value is in allowed list."""
    return value in allowed_values

def validate_range(value: float, min_val: float, max_val: float) -> bool:
    """Validate that value is within range."""
    return min_val <= value <= max_val

def validate_tonnes(tonnes: float) -> bool:
    """Validate tonnes value (positive and reasonable)."""
    return validate_positive_number(tonnes) and tonnes <= 10000

def validate_delay_hours(hours: float) -> bool:
    """Validate delay hours (non-negative and reasonable)."""
    return isinstance(hours, (int, float)) and 0 <= hours <= 168

def validate_distance_km(distance: float) -> bool:
    """Validate distance in km."""
    return validate_positive_number(distance) and distance <= 5000
