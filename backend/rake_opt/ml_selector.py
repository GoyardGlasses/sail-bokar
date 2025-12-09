from __future__ import annotations

"""ML model to suggest a good rake template before exact optimisation.

This module defines a small wrapper around a scikit-learn classifier
trained on features derived from a list of products. It does not persist
models to disk; that can be wired in by the caller using joblib or
similar.
"""

from dataclasses import dataclass
from typing import List, Sequence

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

from .models import Product


FEATURE_COLUMNS = [
    "n_products",
    "total_weight_t",
    "avg_weight_t",
    "max_weight_t",
    "p75_weight_t",
    "p25_weight_t",
    "avg_priority",
    "max_priority",
]


def build_feature_row(products: Sequence[Product]) -> np.ndarray:
    if not products:
        return np.zeros(len(FEATURE_COLUMNS), dtype=float)

    weights = np.array([p.weight_t for p in products], dtype=float)
    priorities = np.array([p.priority for p in products], dtype=float)

    feats = [
        float(len(products)),
        float(weights.sum()),
        float(weights.mean()),
        float(weights.max()),
        float(np.percentile(weights, 75)),
        float(np.percentile(weights, 25)),
        float(priorities.mean()),
        float(priorities.max()),
    ]
    return np.asarray(feats, dtype=float)


@dataclass
class TemplateSelectorModel:
    model: RandomForestClassifier

    def predict_template_id(self, products: Sequence[Product]) -> str:
        """Return the most likely best rake template ID for this product set."""

        X = build_feature_row(products)[None, :]
        pred = self.model.predict(X)
        return str(pred[0])


def train_template_selector(df: pd.DataFrame) -> TemplateSelectorModel:
    """Train a RandomForest classifier from a labelled dataset.

    ``df`` is expected to contain the numeric feature columns listed in
    :data:`FEATURE_COLUMNS` and a ``label_template_id`` column.
    """

    missing = [c for c in FEATURE_COLUMNS + ["label_template_id"] if c not in df.columns]
    if missing:
        raise ValueError(f"Training DataFrame is missing columns: {missing}")

    X = df[FEATURE_COLUMNS].to_numpy(dtype=float)
    y = df["label_template_id"].astype(str).to_numpy()

    clf = RandomForestClassifier(n_estimators=100, random_state=0)
    clf.fit(X, y)

    return TemplateSelectorModel(model=clf)
