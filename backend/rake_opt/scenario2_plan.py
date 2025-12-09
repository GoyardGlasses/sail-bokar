from __future__ import annotations

from typing import Iterable, List, Optional, Tuple

from .config import DEFAULT_TEMPLATES
from .models import Product, RakeTemplate, RakePlan
from .scenario1_opt import optimize_loading


def choose_best_rake(
    products: List[Product],
    candidate_templates: Optional[Iterable[RakeTemplate]] = None,
    allow_unassigned: bool = True,
) -> Tuple[RakePlan, RakeTemplate]:
    """Select the best rake template and loading plan for a given product set.

    This function currently performs a small search over candidate rake
    templates by calling :func:`optimize_loading` for each.

    Later, an ML model from ``ml_selector.py`` can be plugged in to narrow the
    set of templates to evaluate.
    """

    if candidate_templates is None:
        candidate_templates = DEFAULT_TEMPLATES.values()

    best_plan: Optional[RakePlan] = None
    best_template: Optional[RakeTemplate] = None
    best_score: float = float("-inf")

    for template in candidate_templates:
        try:
            plan = optimize_loading(products, template, allow_unassigned=allow_unassigned)
        except Exception:
            # Skip infeasible templates
            continue

        # Score: primarily total loaded tonnes, secondarily utilisation.
        score = plan.total_loaded_t * 100.0 + plan.utilization_pct

        if score > best_score:
            best_score = score
            best_plan = plan
            best_template = template

    if best_plan is None or best_template is None:
        raise RuntimeError("No feasible rake template found for the given products")

    return best_plan, best_template
