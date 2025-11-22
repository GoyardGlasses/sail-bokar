# ML Feature Engineering & Modeling Blueprint - SIH25208 SAIL Bokaro
## PART 2B: MODELS 6-7 + INTEGRATION

---

## MODEL 6: ANOMALY DETECTION

### A. Problem Statement
Detect anomalies in system metrics (demand, throughput, delay, inventory).
**Target**: `is_anomaly` (binary: 0/1)

### B. Input Tables
- `demand_history`: date, material_type, destination, total_demand_tonnes
- `loading_history`: date, loading_point, tonnes_loaded, hours_taken
- `dispatch_history`: date, route, delay_hours
- `inventory_levels`: date, material_type, quantity_tonnes
- `calendar`: date, day_of_week, is_holiday

### C. Derived Features
- Demand: demand_zscore, demand_deviation_from_ma_7d, demand_growth_rate
- Throughput: throughput_zscore, throughput_deviation_from_ma_7d
- Delay: delay_zscore, delay_deviation_from_route_mean
- Inventory: inventory_zscore, stock_cover_ratio, stock_depletion_rate
- Temporal: day_of_week_encoded, is_holiday, is_peak_season
- Composite: multi_metric_anomaly_score

### D. Data Quality
- Missing: Impute with 0 (no anomaly)
- Outliers: Part of anomaly detection, do not remove
- Scaling: StandardScaler per metric
- Encoding: One-hot for metric_type
- Validation: zscore in [-10, 10], deviation ≥ 0

### E. Baseline Models
1. **Isolation Forest** (unsupervised):
   - Why: No labels needed, fast, effective
   - Pros: Robust, interpretable
   - Cons: May miss complex patterns

2. **Statistical** (3σ rule):
   - Why: Simple, interpretable
   - Pros: Fast
   - Cons: Limited to univariate

### F. Production Model
**Primary**: Isolation Forest (unsupervised)
- contamination=0.05 (5% anomalies expected)
- n_estimators=100

**Secondary (if labeled data available)**: LightGBM classifier
- num_leaves=15, max_depth=5, learning_rate=0.05

**Ensemble**: Isolation Forest + Statistical + LightGBM (majority vote)

### G. Loss Function
- Primary: F1-score (balance precision/recall)
- Secondary: Precision (minimize false alarms)
- LightGBM: binary_logloss

### H. Cross-Validation
- Stratified K-fold: 5 folds (for supervised fallback)
- Unsupervised: No CV needed, use contamination parameter

### I. Hyperparameter Ranges
| contamination | [0.03, 0.05, 0.10] |
| n_estimators | [50, 100, 200] |
| max_samples | [256, 512, auto] |

### J. Evaluation Metrics
| Precision | > 0.80 | ✅ Green |
| Recall | > 0.70 | ✅ Green |
| F1 | > 0.75 | ✅ Green |

Dashboard: Anomaly count, precision, recall, false alarm rate

### K. Explainability
- SHAP values for LightGBM fallback
- Feature importance (top 5 anomaly drivers)
- Anomaly type classification (demand spike, delay, throughput drop, etc.)

### L. Inference Contract
**Input**:
```json
{
  "date": "2024-02-01",
  "metrics": {
    "demand_HR_Kolkata": 450,
    "throughput_LP1": 3400,
    "delay_Haldia": 5.2,
    "inventory_HR": 5000
  }
}
```

**Output**:
```json
{
  "is_anomaly": true,
  "anomaly_score": 0.78,
  "anomaly_type": "demand_spike",
  "affected_metrics": ["demand_HR_Kolkata"],
  "severity": "high",
  "recommendation": "Check order data for bulk orders",
  "model_version": "v1.0",
  "generated_at": "2024-02-01T10:30:00Z"
}
```

### M. Retraining Policy
- Monthly (1st of month)
- On-demand if false alarm rate > 20%
- Cadence: Monthly, 2-year rolling window

### N. Synthetic Data Augmentation
**Ranges**: Normal demand 200–1500 tonnes/day, Anomaly demand 2000–3000 tonnes/day, Anomaly frequency ~5%

### O. Implementation Checklist
| `backend/ml/anomaly/load_data.py` | `load_anomaly_data()` |
| `backend/ml/anomaly/features.py` | `create_anomaly_features()` |
| `backend/ml/anomaly/preprocess.py` | `clean_anomaly_data()` |
| `backend/ml/anomaly/train.py` | `train_anomaly_model()` |
| `backend/ml/anomaly/evaluate.py` | `evaluate_model()` |
| `backend/ml/anomaly/inference.py` | `detect_anomalies()` |
| `backend/ml/anomaly/synthetic.py` | `generate_synthetic_anomalies()` |

### P. Compute/Time Estimate
- Data: 1 year × 35 metrics = ~12,775 rows
- Training: ~5 seconds (Isolation Forest)
- Inference: ~2ms per prediction
- Total: ~1 minute

### Q. Edge Cases & Failure Modes
1. **Seasonal anomalies**: Adjust contamination per season
2. **Gradual drift**: Use rolling window for retraining
3. **Multiple simultaneous anomalies**: Use composite score

### R. Optimizer Integration
- `is_anomaly[date]` → Alert: Trigger manual review before optimization
- Used in: Pre-optimization validation
- Impact: May delay optimization or adjust constraints

---

## MODEL 7: ROAD-VS-RAIL MODE CLASSIFIER

### A. Problem Statement
Classify whether an order should be dispatched by rail or road.
**Target**: `transport_mode` (binary: 0=rail, 1=road)

### B. Input Tables
- `orders`: order_id, material_type, quantity_tonnes, destination, priority, due_date
- `dispatch_history`: dispatch_id, order_id, transport_mode, cost, delivery_time
- `cost_parameters`: route, rail_rate, road_rate, rail_lead_time, road_lead_time
- `truck_availability`: date, available_trucks, avg_capacity
- `rake_availability`: date, available_rakes
- `calendar`: date, day_of_week, is_holiday

### C. Derived Features
- Order: tonnes_log, priority_encoded, material_encoded, destination_encoded
- Cost: estimated_rail_cost, estimated_road_cost, cost_differential (road - rail)
- Time: days_to_due_date, is_urgent_flag
- Availability: available_rakes_ratio, available_trucks_ratio
- Route: distance_km, haldia_flag, route_encoded
- Temporal: day_of_week_encoded, is_peak_season, is_monsoon
- Composite: cost_efficiency_ratio, time_efficiency_ratio

### D. Data Quality
- Missing: Impute cost_differential with 0 (neutral)
- Outliers: Cap cost_differential at ±100k
- Scaling: StandardScaler for cost, tonnes, days_to_due
- Encoding: One-hot for priority, material, destination
- Validation: tonnes > 0, days_to_due ≥ 0, cost_differential in [-100k, 100k]

### E. Baseline Models
1. **Rule-based**:
   - If tonnes > 3000 and available_rakes > 0: rail
   - Else if priority == HIGH and days_to_due < 3: road
   - Else: rail

2. **Logistic Regression**: Simple supervised

### F. Production Model
**Primary**: LightGBM classifier
- num_leaves=15, max_depth=5, learning_rate=0.05
- scale_pos_weight=1.5 (bias toward rail, fewer road dispatches)

**Secondary**: XGBoost (if non-linear patterns strong)

**Ensemble**: LightGBM + Logistic Regression (weighted average)

### G. Loss Function
- Primary: Binary cross-entropy (log loss)
- Secondary: F1-score (balance precision/recall)
- LightGBM: binary_logloss

### H. Cross-Validation
- Stratified K-fold: 5 folds (ensure rail/road balance)
- Backtesting: 4 folds, 90 days each

### I. Hyperparameter Ranges
| num_leaves | [7, 15, 31] |
| max_depth | [3, 5, 7] |
| learning_rate | [0.01, 0.05, 0.1] |
| scale_pos_weight | [1.0, 1.5, 2.0] |

### J. Evaluation Metrics
| Accuracy | > 0.85 | ✅ Green |
| Precision (road) | > 0.75 | ✅ Green |
| Recall (road) | > 0.70 | ✅ Green |
| AUC-ROC | > 0.90 | ✅ Green |

Dashboard: Accuracy, precision, recall, AUC, confusion matrix

### K. Explainability
- SHAP values per prediction
- Feature importance (top 8)
- Partial dependence for cost_differential, tonnes, priority

### L. Inference Contract
**Input**:
```json
{
  "order_id": "ORD001",
  "material_type": "HR_Coils",
  "tonnes": 3654,
  "destination": "Kolkata",
  "priority": "HIGH",
  "days_to_due_date": 7,
  "available_rakes": 12,
  "available_trucks": 8,
  "estimated_rail_cost": 182700,
  "estimated_road_cost": 232700
}
```

**Output**:
```json
{
  "recommended_mode": "rail",
  "mode_probability": 0.92,
  "cost_differential": 50000,
  "reasoning": "Rail is 50k cheaper and rakes available",
  "alternative_mode": "road",
  "alternative_probability": 0.08,
  "model_version": "v1.0",
  "generated_at": "2024-02-01T10:30:00Z"
}
```

### M. Retraining Policy
- Weekly (Mondays)
- On-demand if accuracy < 80% (last 30 days)
- Cadence: Weekly, 1-year rolling window

### N. Synthetic Data Augmentation
**Ranges**: Tonnes 500–4000, Priority HIGH/MEDIUM/LOW, Days to due 1–30, Rail cost Rs. 50–80/tonne, Road cost Rs. 80–150/tonne

### O. Implementation Checklist
| `backend/ml/mode_selector/load_data.py` | `load_mode_data()` |
| `backend/ml/mode_selector/features.py` | `create_mode_features()` |
| `backend/ml/mode_selector/preprocess.py` | `clean_mode_data()` |
| `backend/ml/mode_selector/train.py` | `train_mode_model()` |
| `backend/ml/mode_selector/evaluate.py` | `evaluate_model()` |
| `backend/ml/mode_selector/inference.py` | `predict_transport_mode()` |
| `backend/ml/mode_selector/synthetic.py` | `generate_synthetic_modes()` |

### P. Compute/Time Estimate
- Data: 1 year × 5 destinations = ~1,825 rows
- Training: ~10 seconds
- CV: ~1 minute
- Inference: ~5ms per prediction
- Total: ~2 minutes

### Q. Edge Cases & Failure Modes
1. **No rakes available**: Force road mode
2. **No trucks available**: Force rail mode
3. **Insufficient data** (< 6 months): Use rule-based fallback

### R. Optimizer Integration
- `recommended_mode[order]` → Decision: Assign to rail or road dispatch list
- Used in: Dispatch plan generation
- Impact: Determines which optimizer constraint set to apply

---

## ML-TO-OPTIMIZER INTEGRATION TABLE

| ML Model Output | Optimizer Input | Constraint/Objective | Field Name |
|-----------------|-----------------|----------------------|------------|
| Demand Forecast | Demand constraint | `sum(tonnes) ≥ demand * 0.9` | `demand_forecast_tonnes` |
| Rake Availability | Rake constraint | `sum(rakes_assigned) ≤ available_rakes` | `available_rakes_forecast` |
| Delay Prediction | Demurrage cost | `demurrage = delay * rate * wagons` | `predicted_delay_hours` |
| Throughput Forecast | Loading time | `loading_time = tonnes / throughput` | `predicted_throughput_tph` |
| Cost Prediction | Objective function | `minimize(total_cost)` | `predicted_cost_components` |
| Anomaly Detection | Pre-optimization alert | Alert if anomaly detected | `is_anomaly_flag` |
| Mode Classifier | Dispatch mode | Route to rail or road list | `recommended_transport_mode` |

---

## SUMMARY

**Total Models**: 7
**Total Features**: ~120 derived features across all models
**Total Training Time**: ~2 minutes (all models, synthetic data)
**Total Inference Time**: ~75ms (all models per dispatch)
**Data Requirements**: 1 year historical + synthetic augmentation
**Retraining Cadence**: Weekly (demand, delay, rake, throughput, mode), Monthly (cost, anomaly)
**Production Readiness**: All models use proven algorithms (LightGBM, XGBoost, Prophet, IsolationForest)

---

## NEXT STEPS

1. **Create synthetic dataset** using ranges and generation rules from Section N of each model
2. **Implement feature engineering pipelines** using functions from Section O
3. **Train baseline models** and establish performance baselines
4. **Integrate with FastAPI backend** using inference contracts from Section L
5. **Deploy models to production** with monitoring from Section M
6. **Connect to optimizer** using integration table above

**All blueprints are ready for code generation in Windsurf.**

