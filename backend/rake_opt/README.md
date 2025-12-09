# rake_opt – Rake Loading Optimisation Library

Small, self-contained Python package for railway rake loading optimisation for a steel plant.

## Modules

- `models.py` – Pydantic models for `Product`, `Slot`, `Wagon`, `RakeTemplate`, `LoadAssignment`, `RakePlan`.
- `config.py` – Predefined rake templates (BOXN/BOXNHL/BRN/BOST) and helper to instantiate them.
- `scenario1_opt.py` – Scenario 1: fixed-rake optimiser using OR-Tools CP-SAT.
- `scenario2_plan.py` – Scenario 2: rake template selection that calls Scenario 1.
- `synthetic_data.py` – Synthetic demand generator + labelled data for ML.
- `ml_selector.py` – Scikit-learn wrapper to train/predict best rake template.

## Quick start

```python
from rake_opt import Product, optimize_loading, choose_best_rake
from rake_opt.config import DEFAULT_TEMPLATES

products = [
    Product(id="P1", type="HR_COIL", weight_t=20.0, length_m=5.0, width_m=2.0, height_m=1.5, priority=3),
    # ...
]

# Scenario 1 – fixed rake
boxn_rake = DEFAULT_TEMPLATES["BOXNHL_RAKE_58"]
plan = optimize_loading(products, boxn_rake)

# Scenario 2 – let the engine pick the best template
best_plan, best_template = choose_best_rake(products)
```

## Tests

From the backend root:

```bash
pytest rake_opt/tests
```

This uses only OR-Tools, scikit-learn, numpy, pandas, and pytest as declared in `requirements.txt`.
