from __future__ import annotations

"""Synthetic data generation helpers for rake template ML experiments.

These utilities are intentionally simple and are meant for offline
experimentation, not for production use.
"""

from typing import Iterable, List, Tuple, Dict

import numpy as np
import pandas as pd

from .config import DEFAULT_TEMPLATES
from .models import Product, RakeTemplate
from .scenario2_plan import choose_best_rake


PRODUCT_TYPES = ["HR_COIL", "CR_SHEET", "PLATE", "WIRE_ROD"]
DESTINATIONS = ["HALDIA", "KOLKATA", "RANCHI", "DHANBAD"]


def random_product(product_id: int, rng: np.random.Generator) -> Product:
    p_type = rng.choice(PRODUCT_TYPES)
    # Rough weight distribution in tonnes
    weight_t = float(rng.uniform(2.0, 28.0))

    # Simple size heuristics (not physically exact)
    length_m = float(rng.uniform(2.0, 6.0))
    width_m = float(rng.uniform(1.0, 2.8))
    height_m = float(rng.uniform(0.5, 2.5))

    priority = int(rng.integers(1, 4))  # 1–3
    dest = str(rng.choice(DESTINATIONS))

    return Product(
        id=f"P{product_id}",
        type=p_type,
        weight_t=weight_t,
        length_m=length_m,
        width_m=width_m,
        height_m=height_m,
        priority=priority,
        destination=dest,
    )


def random_product_set(
    min_items: int = 10,
    max_items: int = 80,
    rng: np.random.Generator | None = None,
) -> List[Product]:
    rng = rng or np.random.default_rng()
    n = int(rng.integers(min_items, max_items + 1))
    return [random_product(i + 1, rng) for i in range(n)]


def generate_training_row(
    templates: Iterable[RakeTemplate] | None = None,
    rng: np.random.Generator | None = None,
) -> Tuple[Dict[str, float], str]:
    """Create one synthetic sample and label = best rake template ID.

    Features are simple aggregates over the product set (totals, means,
    percentiles). The label is the template that produced the best plan
    according to :func:`choose_best_rake`.
    """

    rng = rng or np.random.default_rng()
    products = random_product_set(rng=rng)

    if templates is None:
        templates = DEFAULT_TEMPLATES.values()

    plan, template = choose_best_rake(products, candidate_templates=list(templates))

    weights = np.array([p.weight_t for p in products], dtype=float)
    priorities = np.array([p.priority for p in products], dtype=float)

    features: Dict[str, float] = {
        "n_products": float(len(products)),
        "total_weight_t": float(weights.sum()),
        "avg_weight_t": float(weights.mean()),
        "max_weight_t": float(weights.max()),
        "p75_weight_t": float(np.percentile(weights, 75)),
        "p25_weight_t": float(np.percentile(weights, 25)),
        "avg_priority": float(priorities.mean()),
        "max_priority": float(priorities.max()),
    }

    return features, template.id


def generate_training_dataset(
    n_samples: int = 200,
    templates: Iterable[RakeTemplate] | None = None,
    random_state: int | None = 0,
) -> pd.DataFrame:
    """Generate a pandas DataFrame for ML training.

    The resulting frame has numeric feature columns and a
    ``label_template_id`` column.
    """

    rng = np.random.default_rng(random_state)
    rows: List[Dict[str, float]] = []
    labels: List[str] = []

    for _ in range(n_samples):
        feats, label = generate_training_row(templates=templates, rng=rng)
        rows.append(feats)
        labels.append(label)

    df = pd.DataFrame(rows)
    df["label_template_id"] = labels
    return df
