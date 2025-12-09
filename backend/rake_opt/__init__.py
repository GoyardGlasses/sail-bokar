"""Small library for railway rake loading optimization.

Provides:
- Core data models (products, wagons, rake templates, plans)
- Scenario 1: fixed-rake loading optimization using OR-Tools
- Scenario 2: rake template selection built on Scenario 1, with optional ML shortcut
"""

from .models import Product, Wagon, Slot, RakeTemplate, LoadAssignment, RakePlan
from .scenario1_opt import optimize_loading
from .scenario2_plan import choose_best_rake

__all__ = [
    "Product",
    "Wagon",
    "Slot",
    "RakeTemplate",
    "LoadAssignment",
    "RakePlan",
    "optimize_loading",
    "choose_best_rake",
]
