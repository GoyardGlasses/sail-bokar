# ML Feature Engineering & Modeling Blueprint - SIH25208 SAIL Bokaro
## PART 2A: MODELS 4-5

---

## MODEL 4: LOADING POINT THROUGHPUT PREDICTION

### A. Problem Statement
Predict loading throughput (TPH) at a loading point on a given date.
**Target**: `throughput_tph` (continuous, positive)

### B. Input Tables
- `loading_history`: date, loading_point, material_type, tonnes_loaded, hours_taken, shift
- `equipment_status`: date, loading_point, equipment_id, status (operational/maintenance)
- `calendar`: date, day_of_week, is_holiday
- `production_schedule`: date, material_type, production_tonnes
- `weather_data`: date, temperature, rainfall

### C. Derived Features
- Lags: throughput_lag_1d, throughput_lag_7d
- Rolling: throughput_ma_7d, throughput_std_7d
- Temporal: day_of_week_encoded, shift_encoded, is_holiday
- Equipment: equipment_operational_count, maintenance_flag
- Material: material_encoded
- Weather: temperature, rainfall_mm
- System: production_tonnes_lag_1d, utilization_ratio

### D. Data Quality
- Missing: Forward-fill (max 2d), impute equipment_count with median per LP
- Outliers: Cap at 4500 TPH (max physical capacity)
- Smoothing: 2-day MA
- Scaling: StandardScaler per loading point
- Encoding: One-hot for day_of_week, material, shift, loading_point
- Validation: throughput > 0, equipment_count ≥ 0, hours_taken > 0

### E. Baseline Models
1. **Loading point-specific mean**: Simple
2. **Linear regression**: Baseline supervised

### F. Production Model
**Primary**: LightGBM with lag + equipment features
- num_leaves=31, max_depth=7, learning_rate=0.05
**Secondary**: Prophet (if data sparse)

### G. Loss Function
- Primary: MAE
- Secondary: RMSE
- LightGBM: regression_l1

### H. Cross-Validation
- Time-series split: Train 1–250, Val 251–280, Test 281–310
- Embargo: 3 days
- Backtesting: 4 folds, 60 days each

### I. Hyperparameter Ranges
| num_leaves | [15, 31, 63] |
| max_depth | [5, 7, 9] |
| learning_rate | [0.01, 0.05, 0.1] |
| min_data_in_leaf | [10, 20, 50] |

### J. Evaluation Metrics
| MAE | < 150 TPH | ✅ Green |
| MAE | 150–250 TPH | ⚠️ Yellow |
| MAE | > 250 TPH | ❌ Red |
| RMSE | < 200 TPH | ✅ Green |

### K. Explainability
- SHAP values per prediction
- Feature importance (top 8)
- Partial dependence for equipment_count, material

### L. Inference Contract
**Input**:
```json
{
  "loading_point": "LP1",
  "date": "2024-02-01",
  "material_type": "HR_Coils",
  "shift": 1,
  "equipment_operational": 4
}
```

**Output**:
```json
{
  "predicted_throughput_tph": 3350,
  "lower_bound_95": 3100,
  "upper_bound_95": 3600,
  "confidence": 0.87,
  "model_version": "v1.0",
  "generated_at": "2024-02-01T10:30:00Z"
}
```

### M. Retraining Policy
- Weekly (Mondays)
- On-demand if MAE > 300 TPH (last 7 days)
- Cadence: Weekly, 1-year rolling window

### N. Synthetic Data Augmentation
**Ranges**: Base throughput 3000–4000 TPH, Equipment 3–4, Shift 1–3

### O. Implementation Checklist
| `backend/ml/throughput/load_data.py` | `load_throughput_data()` |
| `backend/ml/throughput/features.py` | `create_lag_features()` |
| `backend/ml/throughput/preprocess.py` | `clean_throughput_data()` |
| `backend/ml/throughput/train.py` | `train_throughput_model()` |
| `backend/ml/throughput/evaluate.py` | `evaluate_model()` |
| `backend/ml/throughput/inference.py` | `predict_throughput()` |
| `backend/ml/throughput/synthetic.py` | `generate_synthetic_throughput()` |

### P. Compute/Time Estimate
- Data: 1 year × 3 LPs = ~1,095 rows
- Training: ~15 seconds
- CV: ~1.5 minutes
- Inference: ~8ms per prediction

### Q. Edge Cases & Failure Modes
1. **Equipment breakdown**: Use reduced throughput model
2. **New material**: Use global mean, transition gradually
3. **Insufficient data** (< 6 months): Use LP-agnostic model

### R. Optimizer Integration
- `predicted_throughput[lp][date]` → Constraint: `loading_time = tonnes_loaded / predicted_throughput`
- Used in: Time window constraints
- Impacts: Rake loading schedule, siding capacity

---

## MODEL 5: COST PREDICTION

### A. Problem Statement
Predict total cost components (freight, handling, demurrage) for a dispatch.
**Target Variables**: `freight_cost`, `handling_cost`, `demurrage_cost` (continuous, non-negative)

### B. Input Tables
- `dispatch_history`: dispatch_id, route, material_type, tonnes, rake_size, delay_hours, cost_components
- `cost_parameters`: route, base_freight_rate, handling_rate, demurrage_rate
- `calendar`: date, day_of_week, is_holiday
- `weather_data`: date, temperature, rainfall
- `congestion_reports`: date, route, congestion_level

### C. Derived Features
- Route: route_encoded, distance_km, haldia_flag
- Material: material_encoded, material_density
- Dispatch: tonnes_log, rake_utilization_ratio, partial_rake_flag
- Temporal: day_of_week_encoded, is_holiday, month_encoded
- Delay: delay_hours, delay_probability_from_model
- Weather: temperature, rainfall_mm
- Congestion: congestion_level, congestion_lag_1d

### D. Data Quality
- Missing: Impute cost with route median
- Outliers: Cap at 99th percentile per route
- Scaling: StandardScaler per cost component
- Encoding: One-hot for route, material
- Validation: cost ≥ 0, tonnes > 0, delay_hours ≥ 0

### E. Baseline Models
1. **Rule-based**: cost = tonnes × rate_per_tonne + delay_penalty
2. **Linear regression**: Simple supervised

### F. Production Model
**Primary**: LightGBM (separate model per cost component)
- num_leaves=31, max_depth=7, learning_rate=0.05
**Alternative**: XGBoost for non-linear interactions

### G. Loss Function
- Primary: MAE
- Secondary: RMSE
- LightGBM: regression_l1

### H. Cross-Validation
- Time-series split: Train 1–300, Val 301–330, Test 331–360
- Embargo: 7 days
- Backtesting: 4 folds, 90 days each

### I. Hyperparameter Ranges
| num_leaves | [15, 31, 63] |
| max_depth | [5, 7, 9] |
| learning_rate | [0.01, 0.05, 0.1] |
| min_data_in_leaf | [10, 20, 50] |

### J. Evaluation Metrics
| MAPE | < 10% | ✅ Green |
| MAPE | 10–15% | ⚠️ Yellow |
| MAPE | > 15% | ❌ Red |
| RMSE | < 5% of mean | ✅ Green |

### K. Explainability
- SHAP values per cost component
- Feature importance (top 8)
- Partial dependence for tonnes, delay, route

### L. Inference Contract
**Input**:
```json
{
  "route": "Bokaro→Haldia",
  "material_type": "HR_Coils",
  "tonnes": 3654,
  "delay_hours": 5.0,
  "rake_size": 59
}
```

**Output**:
```json
{
  "freight_cost": 189000,
  "handling_cost": 18300,
  "demurrage_cost": 22500,
  "total_cost": 229800,
  "cost_per_tonne": 62.9,
  "model_version": "v1.0",
  "generated_at": "2024-02-01T10:30:00Z"
}
```

### M. Retraining Policy
- Monthly (1st of month)
- On-demand if MAPE > 20% (last 30 days)
- Cadence: Monthly, 2-year rolling window

### N. Synthetic Data Augmentation
**Ranges**: Freight rate Rs. 50–80/tonne, Handling Rs. 5–10/tonne, Demurrage Rs. 150–250/wagon/hour

### O. Implementation Checklist
| `backend/ml/cost/load_data.py` | `load_cost_data()` |
| `backend/ml/cost/features.py` | `create_cost_features()` |
| `backend/ml/cost/preprocess.py` | `clean_cost_data()` |
| `backend/ml/cost/train.py` | `train_cost_model()` |
| `backend/ml/cost/evaluate.py` | `evaluate_model()` |
| `backend/ml/cost/inference.py` | `predict_cost()` |
| `backend/ml/cost/synthetic.py` | `generate_synthetic_costs()` |

### P. Compute/Time Estimate
- Data: 1 year × 5 routes = ~1,825 rows
- Training: ~20 seconds (3 models)
- CV: ~2 minutes
- Inference: ~20ms per prediction

### Q. Edge Cases & Failure Modes
1. **New route**: Use global mean cost, transition gradually
2. **Rate change**: Retrain immediately on new data
3. **Extreme delay**: Cap demurrage at 2x normal

### R. Optimizer Integration
- `predicted_cost[route][tonnes][delay]` → Objective: `minimize(total_cost)`
- Used in: Objective function (primary optimization goal)
- Components: Freight + Handling + Demurrage

