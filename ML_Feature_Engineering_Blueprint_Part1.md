# ML Feature Engineering & Modeling Blueprint - SIH25208 SAIL Bokaro
## PART 1: MODELS 1-3

---

## MODEL 1: DEMAND FORECASTING

### A. Problem Statement
Predict daily demand (tonnes) per material per destination for next 1–30 days.
**Target**: `daily_demand_tonnes` (continuous, non-negative)

### B. Input Tables
- `orders`: order_id, material_type, quantity_tonnes, destination, order_date, due_date, priority
- `demand_history`: date, material_type, destination, total_demand_tonnes
- `calendar`: date, day_of_week, month, quarter, is_holiday, is_season_peak
- `congestion_reports`: date, route, congestion_level
- `production_schedule`: date, material_type, production_tonnes

### C. Derived Features
- Lags: demand_lag_1d, demand_lag_7d, demand_lag_30d
- Rolling stats: demand_ma_7d, demand_ma_30d, demand_std_7d
- Growth: demand_growth_7d
- Temporal: day_of_week_encoded (6 dummies), month_encoded (11 dummies), is_peak_season, is_monsoon, is_holiday
- Proxies: congestion_level_lag_1d, production_tonnes_lag_1d, stock_ratio
- Categorical: destination_encoded, material_encoded, priority_high_pct

**Example (3 rows)**:
| date | material | destination | demand_lag_1d | demand_ma_7d | is_peak_season | demand_target |
|------|----------|-------------|---------------|--------------|-----------------|---------------|
| 2024-01-15 | HR_Coils | Kolkata | 450 | 420 | 1 | 480 |
| 2024-01-16 | CR_Coils | Patna | 320 | 310 | 1 | 340 |
| 2024-01-17 | Plates | Haldia | 280 | 290 | 1 | 310 |

### D. Data Quality
- Missing: Forward-fill (max 3d), then backward-fill
- Outliers: Cap at 99th percentile per material-destination
- Smoothing: 3-day MA before lag features
- Scaling: StandardScaler per material
- Encoding: One-hot for day_of_week, month, destination, material
- Validation: demand ≥ 0, no NaN lags, contiguous dates

### E. Baseline Models
1. **Prophet**: Handles seasonality, holidays, trend
2. **ETS**: Simple, fast, proven

### F. Production Model
**Primary**: LightGBM with lag features
- num_leaves=31, max_depth=7, learning_rate=0.05
**Secondary**: Prophet (if data < 1 year)
**Ensemble**: Average Prophet + LightGBM

### G. Loss Function
- Primary: MAPE = mean(|actual - pred| / |actual|) × 100
- Secondary: RMSE
- LightGBM: regression_l1

### H. Cross-Validation
- Time-series split: Train 1–300, Val 301–330, Test 331–360
- Embargo: 7 days
- Backtesting: 4 folds, 90 days each, expanding window

### I. Hyperparameter Ranges
| Parameter | Range |
|-----------|-------|
| num_leaves | [15, 31, 63] |
| max_depth | [5, 7, 9] |
| learning_rate | [0.01, 0.05, 0.1] |
| min_data_in_leaf | [10, 20, 50] |
| lambda_l1 | [0, 0.1, 1.0] |
| lambda_l2 | [0, 0.1, 1.0] |

### J. Evaluation Metrics
| Metric | Threshold | Badge |
|--------|-----------|-------|
| MAPE | < 15% | ✅ Green |
| MAPE | 15–20% | ⚠️ Yellow |
| MAPE | > 20% | ❌ Red |
| RMSE | < 50 tonnes | ✅ Green |
| R² | > 0.80 | ✅ Green |

Dashboard: MAPE by material, by destination, forecast bias, PI coverage

### K. Explainability
- SHAP values per prediction
- LightGBM feature importance (gain-based)
- Partial dependence plots for top 5 features

### L. Inference Contract
**Input**:
```json
{
  "date": "2024-02-01",
  "material_type": "HR_Coils",
  "destination": "Kolkata",
  "horizon_days": 7,
  "include_confidence_interval": true
}
```

**Output**:
```json
{
  "forecast": [
    {
      "date": "2024-02-01",
      "predicted_demand_tonnes": 450.5,
      "lower_bound_95": 420.0,
      "upper_bound_95": 481.0,
      "confidence": 0.92
    }
  ],
  "model_version": "v1.2",
  "generated_at": "2024-02-01T10:30:00Z"
}
```

### M. Retraining Policy
- Weekly (Mondays)
- On-demand if MAPE > 25% (last 7 days)
- After spike > 2σ
- Logs: timestamp, actual, predicted, residual, features, model_version
- Cadence: Weekly, 1-year rolling window

### N. Synthetic Data Augmentation
**Ranges** (PHASE 0):
- Materials: HR_Coils, CR_Coils, Plates, Wire_Rods, TMT_Bars, Pig_Iron, Billets
- Destinations: Kolkata, Patna, Ranchi, Durgapur, Haldia
- Demand: 200–1500 tonnes/day per material-destination
- Seasonality: +30% Oct–Mar, -20% Jun–Sep
- Congestion: 1–5, Haldia avg 4, others avg 2

**Generation**:
```python
for material in materials:
    base_demand = random(200, 1500)
    for destination in destinations:
        for date in date_range:
            seasonal_factor = 1.3 if peak_season else 0.8
            noise = normal(0, base_demand * 0.1)
            demand[date] = base_demand * seasonal_factor + noise
            demand[date] = 0.7 * demand[date-1] + 0.3 * demand[date]
```

### O. Implementation Checklist
| File | Function | Purpose |
|------|----------|---------|
| `backend/ml/demand/load_data.py` | `load_demand_data(start_date, end_date)` | Load from schema |
| `backend/ml/demand/features.py` | `create_lag_features()`, `create_temporal_features()` | Feature engineering |
| `backend/ml/demand/preprocess.py` | `clean_demand()`, `scale_features()` | Data cleaning |
| `backend/ml/demand/train.py` | `train_demand_model()`, `cross_validate()` | Training |
| `backend/ml/demand/evaluate.py` | `evaluate_model()`, `compute_metrics()` | Evaluation |
| `backend/ml/demand/inference.py` | `predict_demand(material, destination, horizon)` | Inference |
| `backend/ml/demand/synthetic.py` | `generate_synthetic_demand()` | Synthetic data |

### P. Compute/Time Estimate
- Data: 1 year × 7 materials × 5 destinations = ~12,775 rows
- Training: ~30 seconds (LightGBM CPU)
- CV: ~2 minutes (4 folds)
- Inference: ~10ms per prediction
- Total: ~5 minutes

### Q. Edge Cases & Failure Modes
1. **New material/destination**: Use global mean, transition gradually
2. **Demand spike**: Flag as anomaly, exclude from training, separate bulk model
3. **Insufficient data** (< 90 days): Use Prophet with weak priors, increase LightGBM regularization
4. **Extreme seasonality**: Use Prophet custom seasonality or seasonal decomposition + ARIMA

### R. Optimizer Integration
- `demand_forecast[material][destination][date]` → Constraint: `sum(tonnes_dispatched) ≥ demand_forecast * 0.9`
- Confidence interval → Soft constraint penalty if unmet

---

## MODEL 2: RAKE AVAILABILITY FORECASTING

### A. Problem Statement
Predict number of empty rakes available at Bokaro for next 1–14 days.
**Target**: `available_empty_rakes` (integer, non-negative)

### B. Input Tables
- `rake_movements`: rake_id, date, status (loaded/empty/maintenance), location
- `dispatch_history`: date, rakes_dispatched, rakes_returned
- `railway_notices`: date, route, disruption_type, duration_days
- `calendar`: date, day_of_week, is_holiday
- `maintenance_schedule`: date, rakes_in_maintenance

### C. Derived Features
- Lags: rakes_lag_1d, rakes_lag_7d
- Rolling: rakes_ma_7d
- Flow: rakes_dispatched_lag_1d, rakes_returned_lag_1d, net_rake_flow_7d
- Temporal: day_of_week_encoded, is_holiday
- Disruption: railway_disruption_flag, disruption_duration_days
- System: rakes_in_maintenance_lag_1d, capacity_utilization_ratio

**Example (3 rows)**:
| date | rakes_lag_1d | rakes_ma_7d | rakes_dispatched_lag_1d | railway_disruption | available_rakes_target |
|------|--------------|-------------|------------------------|-------------------|----------------------|
| 2024-01-15 | 12 | 11.5 | 3 | 0 | 13 |
| 2024-01-16 | 13 | 12.0 | 2 | 1 | 12 |
| 2024-01-17 | 12 | 12.2 | 4 | 0 | 11 |

### D. Data Quality
- Missing: Forward-fill (max 2d), impute disruption with 0
- Outliers: Cap at max fleet size (e.g., 50)
- Smoothing: 2-day MA
- Scaling: MinMaxScaler (0–1)
- Encoding: One-hot for day_of_week
- Validation: rakes ≥ 0 and ≤ max_fleet_size, no date gaps

### E. Baseline Models
1. **ETS**: Simple, captures trend
2. **ARIMA**: Handles auto-regressive patterns

### F. Production Model
**Primary**: LightGBM with lag features
- num_leaves=15, max_depth=5, learning_rate=0.05
**Secondary**: Prophet (if sparse data)

### G. Loss Function
- Primary: MAE = mean(|actual - pred|)
- LightGBM: regression_l1

### H. Cross-Validation
- Time-series split: Train 1–200, Val 201–230, Test 231–260
- Embargo: 3 days
- Backtesting: 3 folds, 60 days each

### I. Hyperparameter Ranges
| Parameter | Range |
|-----------|-------|
| num_leaves | [7, 15, 31] |
| max_depth | [3, 5, 7] |
| learning_rate | [0.01, 0.05] |
| min_data_in_leaf | [5, 10, 20] |

### J. Evaluation Metrics
| Metric | Threshold | Badge |
|--------|-----------|-------|
| MAE | < 1.5 rakes | ✅ Green |
| MAE | 1.5–2.5 rakes | ⚠️ Yellow |
| MAE | > 2.5 rakes | ❌ Red |
| RMSE | < 2 rakes | ✅ Green |

Dashboard: MAE, forecast bias, PI coverage

### K. Explainability
- SHAP values per prediction
- Feature importance (top 5)
- Partial dependence for disruption flag

### L. Inference Contract
**Input**:
```json
{
  "date": "2024-02-01",
  "horizon_days": 7,
  "include_confidence_interval": true
}
```

**Output**:
```json
{
  "forecast": [
    {
      "date": "2024-02-01",
      "predicted_available_rakes": 12,
      "lower_bound_95": 10,
      "upper_bound_95": 14,
      "confidence": 0.88
    }
  ],
  "model_version": "v1.0",
  "generated_at": "2024-02-01T10:30:00Z"
}
```

### M. Retraining Policy
- Weekly (Mondays)
- On-demand if MAE > 3 rakes (last 7 days)
- Cadence: Weekly, 1-year rolling window

### N. Synthetic Data Augmentation
**Ranges** (PHASE 0):
- Fleet size: 30–50 rakes
- Daily dispatch: 2–6 rakes
- Daily return: 2–6 rakes
- Disruption frequency: ~15% of days
- Disruption duration: 1–7 days

**Generation**:
```python
available_rakes = 40
for date in date_range:
    dispatched = random(2, 6)
    returned = random(2, 6)
    available_rakes += returned - dispatched
    available_rakes = clip(available_rakes, 0, 50)
    if random() < 0.15:
        available_rakes -= random(1, 3)
```

### O. Implementation Checklist
| File | Function | Purpose |
|------|----------|---------|
| `backend/ml/rake_availability/load_data.py` | `load_rake_data()` | Load |
| `backend/ml/rake_availability/features.py` | `create_lag_features()` | Features |
| `backend/ml/rake_availability/preprocess.py` | `clean_rake_data()`, `scale_features()` | Preprocess |
| `backend/ml/rake_availability/train.py` | `train_rake_model()` | Train |
| `backend/ml/rake_availability/evaluate.py` | `evaluate_model()` | Evaluate |
| `backend/ml/rake_availability/inference.py` | `predict_available_rakes()` | Inference |
| `backend/ml/rake_availability/synthetic.py` | `generate_synthetic_rakes()` | Synthetic |

### P. Compute/Time Estimate
- Data: 1 year = ~365 rows
- Training: ~10 seconds
- CV: ~1 minute
- Inference: ~5ms per prediction
- Total: ~2 minutes

### Q. Edge Cases & Failure Modes
1. **Extreme disruption** (all rakes stuck): Use historical minimum, alert planner
2. **Fleet expansion**: Retrain immediately, use transfer learning
3. **Insufficient data** (< 6 months): Use simple MA baseline, transition to ML

### R. Optimizer Integration
- `predicted_available_rakes[date]` → Constraint: `sum(rakes_assigned) ≤ predicted_available_rakes`
- Confidence interval → Soft constraint penalty if violated

---

## MODEL 3: ROUTE DELAY PREDICTION

### A. Problem Statement
Predict delay (hours) for a rake on a specific route on a given date.
**Target**: `delay_hours` (continuous, non-negative)

### B. Input Tables
- `dispatch_history`: dispatch_id, route, scheduled_date, actual_arrival_date, delay_hours
- `weather_data`: date, route, temperature, rainfall, visibility
- `congestion_reports`: date, route, congestion_level (1–5)
- `railway_notices`: date, route, disruption_type, duration_days
- `calendar`: date, day_of_week, is_holiday
- `rake_movements`: rake_id, route, date, status

### C. Derived Features
- Lags: delay_lag_1d, delay_lag_7d
- Rolling: delay_ma_7d, delay_std_7d
- Temporal: day_of_week_encoded, is_holiday, hour_of_dispatch
- Weather: temperature, rainfall_mm, visibility_km
- Congestion: congestion_level, congestion_lag_1d
- Disruption: railway_disruption_flag, disruption_duration_days
- Route: route_encoded, haldia_flag
- Recovery: days_since_last_delay

**Example (3 rows)**:
| date | route | delay_lag_1d | congestion_level | temperature | haldia_flag | rainfall_mm | delay_hours_target |
|------|-------|--------------|------------------|-------------|-------------|-------------|-------------------|
| 2024-01-15 | Bokaro→Kolkata | 2.5 | 2 | 28 | 0 | 0 | 3.2 |
| 2024-01-16 | Bokaro→Haldia | 5.0 | 4 | 26 | 1 | 5 | 6.8 |
| 2024-01-17 | Bokaro→Patna | 1.5 | 1 | 30 | 0 | 0 | 1.2 |

### D. Data Quality
- Missing: Forward-fill (max 2d), impute weather with seasonal median, congestion with route median
- Outliers: Cap at 99th percentile per route (e.g., 24h)
- Smoothing: 2-day MA
- Scaling: StandardScaler for delay, temp, rainfall; MinMaxScaler for congestion
- Encoding: One-hot for day_of_week, route
- Validation: delay ≥ 0, temp in [-10, 50]°C, rainfall ≥ 0, congestion in [1, 5]

### E. Baseline Models
1. **Route-specific mean**: Simple, interpretable
2. **Linear regression**: Baseline supervised

### F. Production Model
**Primary**: XGBoost with weather + congestion
- max_depth=6, learning_rate=0.05, n_estimators=100
**Secondary**: LightGBM (faster)
**Ensemble**: Average XGBoost + LightGBM

### G. Loss Function
- Primary: MAE = mean(|actual - pred|)
- Secondary: Quantile loss (0.9 quantile, penalize underprediction)
- XGBoost: reg:absoluteerror or custom quantile

### H. Cross-Validation
- Time-series split: Train 1–300, Val 301–330, Test 331–360
- Embargo: 7 days
- Backtesting: 4 folds, 90 days each
- Stratification: All routes in each fold

### I. Hyperparameter Ranges
| Parameter | Range |
|-----------|-------|
| max_depth | [4, 6, 8] |
| learning_rate | [0.01, 0.05, 0.1] |
| n_estimators | [50, 100, 200] |
| subsample | [0.7, 0.8, 0.9] |
| colsample_bytree | [0.7, 0.8, 0.9] |

### J. Evaluation Metrics
| Metric | Threshold | Badge |
|--------|-----------|-------|
| MAE | < 2 hours | ✅ Green |
| MAE | 2–3 hours | ⚠️ Yellow |
| MAE | > 3 hours | ❌ Red |
| RMSE | < 3.5 hours | ✅ Green |

Dashboard: MAE by route, Haldia accuracy, bias, calibration plot

### K. Explainability
- SHAP values per prediction
- Feature importance (top 10)
- Partial dependence for congestion, weather, haldia_flag

### L. Inference Contract
**Input**:
```json
{
  "route": "Bokaro→Haldia",
  "date": "2024-02-01",
  "congestion_level": 4,
  "temperature": 28,
  "rainfall_mm": 2,
  "include_confidence_interval": true
}
```

**Output**:
```json
{
  "predicted_delay_hours": 5.2,
  "lower_bound_95": 3.5,
  "upper_bound_95": 7.0,
  "confidence": 0.85,
  "model_version": "v1.1",
  "generated_at": "2024-02-01T10:30:00Z"
}
```

### M. Retraining Policy
- Weekly (Mondays)
- On-demand if MAE > 4 hours (last 7 days)
- Cadence: Weekly, 1-year rolling window

### N. Synthetic Data Augmentation
**Ranges** (PHASE 0):
- Routes: Bokaro→Kolkata, Bokaro→Patna, Bokaro→Ranchi, Bokaro→Durgapur, Bokaro→Haldia
- Delay base: 1–3 hours (normal), 5–8 hours (Haldia)
- Haldia delay probability: 35–60%
- Temperature: 15–40°C
- Rainfall: 0–50mm
- Congestion: 1–5, Haldia avg 4

**Generation**:
```python
for route in routes:
    base_delay = 5 if 'Haldia' in route else 2
    for date in date_range:
        congestion = random(1, 5)
        rainfall = random(0, 50) if monsoon else random(0, 5)
        weather_factor = 1 + rainfall / 100
        delay = base_delay * weather_factor + congestion * 0.5 + noise
        delay = clip(delay, 0, 24)
```

### O. Implementation Checklist
| File | Function | Purpose |
|------|----------|---------|
| `backend/ml/delay/load_data.py` | `load_delay_data()` | Load |
| `backend/ml/delay/features.py` | `create_lag_features()`, `create_weather_features()` | Features |
| `backend/ml/delay/preprocess.py` | `clean_delay_data()`, `scale_features()` | Preprocess |
| `backend/ml/delay/train.py` | `train_delay_model()` | Train |
| `backend/ml/delay/evaluate.py` | `evaluate_model()` | Evaluate |
| `backend/ml/delay/inference.py` | `predict_delay(route, date, weather, congestion)` | Inference |
| `backend/ml/delay/synthetic.py` | `generate_synthetic_delays()` | Synthetic |

### P. Compute/Time Estimate
- Data: 1 year × 5 routes = ~1,825 rows
- Training: ~20 seconds (XGBoost CPU)
- CV: ~2 minutes
- Inference: ~15ms per prediction
- Total: ~3 minutes

### Q. Edge Cases & Failure Modes
1. **New route**: Use global mean delay, transition gradually
2. **Extreme weather** (flood, cyclone): Flag as anomaly, use historical max
3. **Railway closure**: Use disruption_duration to estimate delay
4. **Insufficient data** (< 6 months per route): Use route-agnostic model, transition

### R. Optimizer Integration
- `predicted_delay[route][date]` → Constraint: `demurrage_cost += delay * demurrage_rate * wagons`
- Used in: Objective function (cost minimization)
- Confidence interval → Soft constraint penalty if actual delay exceeds upper bound

