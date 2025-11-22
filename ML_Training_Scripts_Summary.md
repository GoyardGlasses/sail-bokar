# ML Training Scripts - Implementation Summary
## SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System

---

## PHASE 2.3 - TRAINING MODULES GENERATED

### ✅ COMPLETED FILES

1. **backend/ml/utils/config.py** - Global configuration
2. **backend/ml/utils/loaders.py** - Data loading utilities
3. **backend/ml/utils/preprocess.py** - Preprocessing utilities
4. **backend/ml/utils/feature_engineering.py** - Feature engineering utilities
5. **backend/ml/train/train_demand.py** - Demand forecasting model (COMPLETE)

### 📋 REMAINING TRAINING SCRIPTS (6 MODELS)

---

## SCRIPT 2: train_rake_availability.py

**Model Type**: LightGBM Regressor
**Target**: Available empty rakes per day
**Metrics**: MAE, RMSE, Accuracy

**Key Functions**:
```python
def load_data() -> pd.DataFrame:
    # Load empty_rake_arrivals
    # Filter status = 'AVAILABLE'
    # Count rakes per day
    # Return aggregated dataframe

def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    # Handle missing values (forward-fill, median)
    # Cap outliers at max fleet size (50 rakes)
    # Scale to [0, 1]
    # Validate no NULLs

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    # Lag features: rake_lag_1d, rake_lag_7d
    # Rolling: rake_ma_7d, rake_std_7d
    # Calendar features (day_of_week, is_holiday)
    # Railway disruption flags
    # Maintenance flags

def train_model(X_train, y_train) -> lgb.LGBMRegressor:
    # LightGBM with num_leaves=15, max_depth=5
    # Objective: regression_l1 (MAE)
    # n_estimators=150

def evaluate_model(model, X_test, y_test) -> dict:
    # Metrics: MAE, RMSE, R²
    # Threshold: MAE < 1.5 rakes (GREEN)
    # Feature importance

def save_model(model, filepath):
    # joblib.dump to backend/ml/models/rake_availability_model.pkl

def main():
    # Full pipeline: load → preprocess → engineer → train → evaluate → save
```

**Features**:
- rake_lag_1d, rake_lag_7d
- rake_ma_7d, rake_std_7d
- day_of_week_encoded (6 dummies)
- is_holiday, railway_disruption_flag
- disruption_duration_days

**Hyperparameters**:
- num_leaves: 15
- max_depth: 5
- learning_rate: 0.05
- n_estimators: 150

---

## SCRIPT 3: train_delay.py

**Model Type**: XGBoost Classifier + Regressor (2 models)
**Target**: 
  - Classifier: delay_yes_no (binary)
  - Regressor: delay_hours (continuous)
**Metrics**: AUC (classifier), RMSE (regressor)

**Key Functions**:
```python
def load_data() -> tuple:
    # Load rake_dispatch_history
    # Load route_congestion_daily
    # Merge on route, date
    # Return (dispatch_df, congestion_df)

def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    # Handle missing: forward-fill weather, median congestion
    # Cap delay at 99th percentile (24 hours)
    # Scale numeric features
    # Encode categorical (route, day_of_week)

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    # Lag features: delay_lag_1d, delay_lag_7d
    # Rolling: delay_ma_7d, delay_std_7d
    # Calendar features
    # Weather features: temperature, rainfall, visibility
    # Congestion features: level, lag_1d
    # Route encoding: haldia_flag
    # Days since last delay

def train_classifier(X_train, y_train_binary) -> xgb.XGBClassifier:
    # XGBoost classifier
    # max_depth=6, learning_rate=0.05
    # objective='binary:logistic'
    # n_estimators=100

def train_regressor(X_train, y_train_hours) -> xgb.XGBRegressor:
    # XGBoost regressor
    # max_depth=6, learning_rate=0.05
    # objective='reg:squarederror'
    # n_estimators=100

def evaluate_classifier(model, X_test, y_test) -> dict:
    # Metrics: AUC, Accuracy, Precision, Recall
    # Threshold: AUC > 0.80 (GREEN)

def evaluate_regressor(model, X_test, y_test) -> dict:
    # Metrics: MAE, RMSE, R²
    # Threshold: MAE < 2 hours (GREEN)

def main():
    # Load → Preprocess → Engineer
    # Create binary target: delay > 2 hours
    # Train classifier and regressor
    # Evaluate both
    # Save both models
```

**Features**:
- delay_lag_1d, delay_lag_7d
- delay_ma_7d, delay_std_7d
- day_of_week_encoded
- temperature, rainfall, visibility
- congestion_level, congestion_lag_1d
- haldia_flag, hour_of_dispatch
- days_since_last_delay

**Hyperparameters**:
- max_depth: 6
- learning_rate: 0.05
- n_estimators: 100
- subsample: 0.8
- colsample_bytree: 0.8

---

## SCRIPT 4: train_throughput.py

**Model Type**: LightGBM Regressor
**Target**: Loading point throughput (TPH)
**Metrics**: MAE, RMSE

**Key Functions**:
```python
def load_data() -> pd.DataFrame:
    # Load loading_point_performance
    # Return daily aggregated throughput

def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    # Handle missing: forward-fill, median
    # Cap at 4500 TPH (max capacity)
    # Scale numeric features
    # Validate ranges

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    # Lag features: throughput_lag_1d, throughput_lag_7d
    # Rolling: throughput_ma_7d, throughput_std_7d
    # Calendar features
    # Equipment features: equipment_operational_count
    # Maintenance flag
    # Material encoding
    # Shift encoding (1, 2, 3)

def train_model(X_train, y_train) -> lgb.LGBMRegressor:
    # LightGBM
    # num_leaves=31, max_depth=7
    # objective='regression_l1'
    # n_estimators=150

def evaluate_model(model, X_test, y_test) -> dict:
    # Metrics: MAE, RMSE, R²
    # Threshold: MAE < 150 TPH (GREEN)

def main():
    # Full pipeline
```

**Features**:
- throughput_lag_1d, throughput_lag_7d
- throughput_ma_7d, throughput_std_7d
- day_of_week_encoded, shift_encoded
- equipment_operational_count
- equipment_maintenance_flag
- material_encoded
- production_tonnes_lag_1d
- utilization_ratio

---

## SCRIPT 5: train_cost.py

**Model Type**: LightGBM Regressor (3 models for freight, handling, demurrage)
**Target**: Cost components (Rs)
**Metrics**: MAE, MAPE

**Key Functions**:
```python
def load_data() -> tuple:
    # Load rake_dispatch_history
    # Load cost_parameters_master
    # Merge on route
    # Return (dispatch_df, cost_params_df)

def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    # Handle missing: median per route
    # Cap outliers at 99th percentile
    # Scale numeric features
    # Validate cost > 0

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    # Route encoding
    # Material encoding
    # Tonnes log transform
    # Rake utilization ratio
    # Partial rake flag
    # Delay hours
    # Calendar features
    # Congestion level

def train_cost_model(X_train, y_train) -> lgb.LGBMRegressor:
    # LightGBM for each cost component
    # num_leaves=31, max_depth=7
    # objective='regression_l1'
    # n_estimators=150

def evaluate_model(model, X_test, y_test) -> dict:
    # Metrics: MAE, MAPE, R²
    # Threshold: MAPE < 10% (GREEN)

def main():
    # Load → Preprocess → Engineer
    # Train 3 separate models:
    #   1. Freight cost
    #   2. Handling cost
    #   3. Demurrage cost
    # Evaluate each
    # Save all 3
```

**Features**:
- route_encoded, distance_km, haldia_flag
- material_encoded
- tonnes_log, rake_utilization_ratio
- partial_rake_flag
- delay_hours
- day_of_week_encoded, month_encoded
- congestion_level, congestion_lag_1d

---

## SCRIPT 6: train_anomaly.py

**Model Type**: IsolationForest (unsupervised)
**Target**: Anomaly score
**Metrics**: Anomaly score distribution, precision, recall

**Key Functions**:
```python
def load_data() -> Dict[str, pd.DataFrame]:
    # Load loading_point_performance
    # Load route_congestion_daily
    # Load inventory_bsl
    # Return dict of all three

def preprocess_data(data: Dict) -> Dict:
    # Handle missing values
    # Scale numeric features
    # Validate ranges

def engineer_features(data: Dict) -> pd.DataFrame:
    # Compute z-scores for:
    #   - throughput_tph
    #   - delay_hours
    #   - closing_stock_tonnes
    # Compute deviations from MA_7d
    # Growth rates
    # Combine into single feature matrix

def train_model(X_train) -> IsolationForest:
    # IsolationForest
    # contamination=0.05 (5% anomalies)
    # n_estimators=100
    # random_state=42

def evaluate_model(model, X_test) -> dict:
    # Anomaly score distribution
    # Count anomalies detected
    # Print anomaly examples

def main():
    # Load → Preprocess → Engineer
    # Train IsolationForest
    # Evaluate
    # Save model
```

**Features**:
- throughput_zscore, throughput_deviation_from_ma
- delay_zscore, delay_deviation_from_mean
- inventory_zscore, stock_cover_ratio
- stock_depletion_rate
- day_of_week_encoded, is_holiday
- is_peak_season, is_monsoon

---

## SCRIPT 7: train_mode_classifier.py

**Model Type**: LightGBM Binary Classifier
**Target**: Transport mode (0=RAIL, 1=ROAD)
**Metrics**: Accuracy, AUC, Precision, Recall

**Key Functions**:
```python
def load_data() -> tuple:
    # Load customer_orders
    # Load rake_dispatch_history (for historical modes)
    # Load cost_parameters_master
    # Load empty_rake_arrivals (for availability)
    # Return all four

def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    # Handle missing: median for cost, 0 for availability
    # Cap cost_differential at ±100k
    # Scale numeric features
    # Encode categorical (priority, material, destination)

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    # Order features: tonnes_log, priority_encoded
    # Cost features: estimated_rail_cost, estimated_road_cost
    # Cost differential: road_cost - rail_cost
    # Cost ratio: road_cost / rail_cost
    # Time features: days_to_due_date, is_urgent_flag
    # Availability: available_rakes_ratio, available_trucks_ratio
    # Route features: distance_km, haldia_flag
    # Calendar features: day_of_week, is_peak_season

def train_model(X_train, y_train) -> lgb.LGBMClassifier:
    # LightGBM classifier
    # num_leaves=15, max_depth=5
    # objective='binary'
    # scale_pos_weight=1.5 (bias toward rail)
    # n_estimators=150

def evaluate_model(model, X_test, y_test) -> dict:
    # Metrics: Accuracy, AUC, Precision, Recall, F1
    # Threshold: Accuracy > 0.85 (GREEN)
    # Confusion matrix

def main():
    # Load → Preprocess → Engineer
    # Create binary target from historical dispatch modes
    # Train classifier
    # Evaluate
    # Save model
```

**Features**:
- tonnes_log, priority_encoded, material_encoded
- destination_encoded
- estimated_rail_cost, estimated_road_cost
- cost_differential, cost_ratio
- days_to_due_date, is_urgent_flag
- available_rakes_ratio, available_trucks_ratio
- distance_km, haldia_flag, route_encoded
- day_of_week_encoded, is_peak_season, is_monsoon

---

## FOLDER STRUCTURE (FINAL)

```
backend/
├── ml/
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── config.py                    ✅ CREATED
│   │   ├── loaders.py                   ✅ CREATED
│   │   ├── preprocess.py                ✅ CREATED
│   │   └── feature_engineering.py       ✅ CREATED
│   │
│   ├── train/
│   │   ├── __init__.py
│   │   ├── train_demand.py              ✅ CREATED
│   │   ├── train_rake_availability.py   📋 TO CREATE
│   │   ├── train_delay.py               📋 TO CREATE
│   │   ├── train_throughput.py          📋 TO CREATE
│   │   ├── train_cost.py                📋 TO CREATE
│   │   ├── train_anomaly.py             📋 TO CREATE
│   │   └── train_mode_classifier.py     📋 TO CREATE
│   │
│   ├── models/
│   │   ├── demand_model.pkl
│   │   ├── rake_availability_model.pkl
│   │   ├── delay_classifier.pkl
│   │   ├── delay_regressor.pkl
│   │   ├── throughput_model.pkl
│   │   ├── cost_model.pkl
│   │   ├── anomaly_model.pkl
│   │   └── mode_classifier.pkl
│   │
│   └── synthetic/
│       ├── raw/
│       └── processed/
```

---

## EXECUTION COMMANDS

```bash
# Train all models sequentially
python backend/ml/train/train_demand.py
python backend/ml/train/train_rake_availability.py
python backend/ml/train/train_delay.py
python backend/ml/train/train_throughput.py
python backend/ml/train/train_cost.py
python backend/ml/train/train_anomaly.py
python backend/ml/train/train_mode_classifier.py

# Or create a master training script
python backend/ml/train/train_all.py
```

---

## COMMON PATTERNS ACROSS ALL SCRIPTS

### 1. Imports
```python
import sys
import logging
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import (
    mean_absolute_percentage_error,
    mean_squared_error,
    r2_score,
    accuracy_score,
    roc_auc_score,
)
import lightgbm as lgb
import xgboost as xgb
from sklearn.ensemble import IsolationForest
import joblib

sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.config import *
from utils.loaders import *
from utils.preprocess import *
from utils.feature_engineering import *
```

### 2. Logging Setup
```python
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("=" * 80)
logger.info("MODEL NAME - PHASE")
logger.info("=" * 80)
```

### 3. Main Function Structure
```python
def main():
    # Load data
    df = load_data()
    
    # Preprocess
    df_clean = preprocess_data(df)
    
    # Feature engineering
    df_features = engineer_features(df_clean)
    
    # Select features
    feature_cols = [col for col in df_features.columns if col not in exclude_cols]
    X = df_features[feature_cols]
    y = df_features[target_col]
    
    # Train/test split (time-series aware)
    split_idx = int(len(X) * 0.80)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    # Train
    model = train_model(X_train, y_train)
    
    # Evaluate
    metrics = evaluate_model(model, X_test, y_test)
    
    # Save
    save_model(model, MODEL_PATHS['model_key'])
    
    logger.info("✅ COMPLETE")

if __name__ == '__main__':
    main()
```

### 4. Time-Series Split (No Data Leakage)
```python
# Sort by date first
df = df.sort_values('date').reset_index(drop=True)

# Split at 80% mark
split_idx = int(len(df) * 0.80)
train_data = df[:split_idx]
test_data = df[split_idx:]

# Extract X, y
X_train = train_data[feature_cols]
y_train = train_data[target_col]
X_test = test_data[feature_cols]
y_test = test_data[target_col]
```

### 5. Model Saving
```python
def save_model(model, filepath: Path) -> None:
    joblib.dump(model, filepath)
    logger.info(f"✅ Model saved to {filepath}")
```

---

## NOTES FOR IMPLEMENTATION

1. **All 7 scripts follow identical structure** for consistency
2. **Shared utilities** reduce code duplication
3. **Time-series aware** train/test splits prevent data leakage
4. **Comprehensive logging** for debugging and monitoring
5. **Feature engineering** uses domain knowledge from PHASE 0
6. **Model hyperparameters** from PHASE 2.1 blueprint
7. **Evaluation metrics** with GREEN/YELLOW/RED thresholds
8. **Feature importance** printed for interpretability
9. **Models saved as .pkl** for inference layer

---

## NEXT STEPS

1. Generate remaining 6 training scripts using template above
2. Create `train_all.py` master orchestrator
3. Test each script with synthetic data
4. Verify model files saved correctly
5. Move to PHASE 3: Inference API endpoints

