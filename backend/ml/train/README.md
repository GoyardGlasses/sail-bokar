# ML Training Module - SIH25208 SAIL Bokaro

Complete training pipeline for 7 ML models for the SAIL Bokaro Steel Plant Logistics Optimization System.

---

## 📋 Models

| # | Model | Type | Target | Metrics |
|---|-------|------|--------|---------|
| 1 | Demand Forecasting | LightGBM Regressor | Daily demand (tonnes) | MAPE, RMSE, R² |
| 2 | Rake Availability | LightGBM Regressor | Available rakes/day | MAE, RMSE |
| 3 | Delay Prediction | XGBoost Classifier + Regressor | Delay hours | AUC, RMSE |
| 4 | Throughput Prediction | LightGBM Regressor | Loading point TPH | MAE, RMSE |
| 5 | Cost Prediction | LightGBM Regressor | Cost components (Rs) | MAE, MAPE |
| 6 | Anomaly Detection | IsolationForest | Anomaly score | Precision, Recall |
| 7 | Mode Classifier | LightGBM Classifier | Transport mode (Rail/Road) | Accuracy, AUC |

---

## 🚀 Quick Start

### Prerequisites
```bash
pip install pandas numpy scikit-learn lightgbm xgboost joblib
```

### Train Single Model
```bash
# Train demand forecasting model
python backend/ml/train/train_demand.py

# Train rake availability model
python backend/ml/train/train_rake_availability.py

# ... etc for other models
```

### Train All Models
```bash
# Train all 7 models sequentially
python backend/ml/train/train_all.py
```

### Output
- Trained models saved to `backend/ml/models/`
- Logs printed to console
- Metrics and feature importance displayed

---

## 📁 File Structure

```
backend/ml/
├── train/
│   ├── __init__.py
│   ├── train_demand.py              ✅ COMPLETE
│   ├── train_rake_availability.py   📋 TO GENERATE
│   ├── train_delay.py               📋 TO GENERATE
│   ├── train_throughput.py          📋 TO GENERATE
│   ├── train_cost.py                📋 TO GENERATE
│   ├── train_anomaly.py             📋 TO GENERATE
│   ├── train_mode_classifier.py     📋 TO GENERATE
│   ├── train_all.py                 ✅ ORCHESTRATOR
│   └── README.md                    (this file)
│
├── utils/
│   ├── __init__.py
│   ├── config.py                    ✅ Global config
│   ├── loaders.py                   ✅ Data loaders
│   ├── preprocess.py                ✅ Preprocessing
│   └── feature_engineering.py       ✅ Feature engineering
│
├── models/
│   ├── demand_model.pkl
│   ├── rake_availability_model.pkl
│   ├── delay_classifier.pkl
│   ├── delay_regressor.pkl
│   ├── throughput_model.pkl
│   ├── cost_model.pkl
│   ├── anomaly_model.pkl
│   └── mode_classifier.pkl
│
└── synthetic/
    ├── raw/                         (input data)
    └── processed/                   (processed data)
```

---

## 🔧 Configuration

Global configuration in `utils/config.py`:

```python
# Data paths
DATA_FILES = {
    'material_production': '...',
    'customer_orders': '...',
    # ... etc
}

# Model hyperparameters
LIGHTGBM_PARAMS = {
    'num_leaves': 31,
    'max_depth': 7,
    'learning_rate': 0.05,
    # ...
}

# Evaluation thresholds
EVAL_THRESHOLDS = {
    'demand_mape_green': 0.15,
    'delay_auc_green': 0.80,
    # ...
}
```

---

## 📊 Training Pipeline

Each training script follows this structure:

### 1. Load Data
```python
def load_data() -> pd.DataFrame:
    # Load from synthetic datasets
    # Aggregate/join as needed
    # Return dataframe
```

### 2. Preprocess
```python
def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    # Handle missing values
    # Remove/cap outliers
    # Scale numeric features
    # Encode categorical features
    # Validate data quality
```

### 3. Feature Engineering
```python
def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    # Build lag features
    # Build rolling statistics
    # Add calendar features
    # Add domain-specific features
    # Return feature matrix
```

### 4. Train Model
```python
def train_model(X_train, y_train) -> Model:
    # Initialize model with hyperparameters
    # Fit on training data
    # Return trained model
```

### 5. Evaluate
```python
def evaluate_model(model, X_test, y_test) -> dict:
    # Make predictions
    # Compute metrics
    # Compare to thresholds
    # Print feature importance
    # Return metrics dict
```

### 6. Save
```python
def save_model(model, filepath):
    # Serialize model to .pkl
    # Save to backend/ml/models/
```

---

## 📈 Evaluation Metrics

### Demand Forecasting
- **MAPE**: Mean Absolute Percentage Error
  - GREEN: < 15%
  - YELLOW: 15-20%
  - RED: > 20%
- **RMSE**: Root Mean Squared Error
- **R²**: Coefficient of determination

### Rake Availability
- **MAE**: Mean Absolute Error
  - GREEN: < 1.5 rakes
  - YELLOW: 1.5-2.5 rakes
  - RED: > 2.5 rakes

### Delay Prediction
- **Classifier AUC**: Area Under ROC Curve
  - GREEN: > 0.80
- **Regressor RMSE**: Root Mean Squared Error
  - GREEN: < 3.5 hours

### Throughput Prediction
- **MAE**: Mean Absolute Error
  - GREEN: < 150 TPH
  - YELLOW: 150-250 TPH

### Cost Prediction
- **MAPE**: Mean Absolute Percentage Error
  - GREEN: < 10%
  - YELLOW: 10-15%

### Anomaly Detection
- **Precision**: True positives / (True positives + False positives)
  - GREEN: > 0.80
- **Recall**: True positives / (True positives + False negatives)
  - GREEN: > 0.70

### Mode Classifier
- **Accuracy**: Correct predictions / Total predictions
  - GREEN: > 0.85
- **AUC**: Area Under ROC Curve
  - GREEN: > 0.90

---

## 🔍 Feature Engineering

### Lag Features
```python
# 1-day, 7-day, 30-day lags
demand_lag_1d, demand_lag_7d, demand_lag_30d
```

### Rolling Statistics
```python
# 7-day and 30-day windows
demand_ma_7d, demand_ma_30d, demand_std_7d
```

### Calendar Features
```python
# Day of week, month, quarter, seasonality
day_of_week, month, is_peak_season, is_monsoon
```

### Domain Features
```python
# Congestion, delays, throughput, cost
congestion_level, delay_hours, throughput_tph, cost_differential
```

---

## 🛠️ Utilities

### Data Loaders (`utils/loaders.py`)
```python
load_csv(table_name)
load_demand_data()
load_rake_availability_data()
load_delay_data()
load_throughput_data()
load_cost_data()
load_anomaly_data()
load_mode_classifier_data()
```

### Preprocessing (`utils/preprocess.py`)
```python
handle_missing_forward_fill()
handle_missing_backward_fill()
cap_outliers_percentile()
scale_standard()
scale_minmax()
encode_categorical_onehot()
encode_categorical_label()
validate_no_nulls()
```

### Feature Engineering (`utils/feature_engineering.py`)
```python
build_lag_features()
build_rolling_features()
add_calendar_features()
add_seasonality_factor()
add_congestion_features()
add_cost_differential_feature()
add_growth_rate_features()
add_ratio_features()
add_interaction_features()
select_features()
```

---

## 📝 Logging

All scripts use Python's `logging` module:

```
INFO - Data loading
INFO - Preprocessing
INFO - Feature engineering
INFO - Model training
INFO - Evaluation metrics
INFO - Model saved
```

Enable debug logging:
```python
logging.basicConfig(level=logging.DEBUG)
```

---

## ⚠️ Important Notes

1. **Time-Series Aware**: All train/test splits preserve temporal order (no data leakage)
2. **Synthetic Data**: Models train on synthetic data from `backend/ml/synthetic/raw/`
3. **Feature Scaling**: Numeric features are scaled per model requirements
4. **Categorical Encoding**: Categorical features are one-hot or label encoded
5. **Model Serialization**: Models saved as `.pkl` files using joblib
6. **Reproducibility**: Random seed set to 42 for consistency

---

## 🔄 Retraining Policy

- **Demand**: Weekly (Mondays)
- **Rake Availability**: Weekly (Mondays)
- **Delay**: Weekly (Mondays)
- **Throughput**: Weekly (Mondays)
- **Cost**: Monthly (1st of month)
- **Anomaly**: Monthly (1st of month)
- **Mode Classifier**: Weekly (Mondays)

Trigger immediate retraining if:
- Model performance degrades > 10%
- Data distribution shift detected
- New data volume > 20% of training set

---

## 🚨 Troubleshooting

### Missing Data Files
```
FileNotFoundError: Data file not found
→ Ensure synthetic data generated in backend/ml/synthetic/raw/
```

### Model Training Fails
```
Check logs for specific error
→ Verify data quality and feature engineering
→ Check hyperparameters in config.py
```

### Low Model Performance
```
MAPE > 20%, AUC < 0.70, etc.
→ Review feature engineering
→ Check for data quality issues
→ Adjust hyperparameters
→ Increase training data
```

---

## 📞 Support

For issues or questions:
1. Check logs for error messages
2. Review feature engineering logic
3. Validate data quality
4. Consult PHASE 2.1 ML blueprint
5. Consult PHASE 2.2 synthetic data spec

---

## ✅ Checklist

- [ ] Synthetic data generated
- [ ] Config.py paths verified
- [ ] All utilities working
- [ ] train_demand.py runs successfully
- [ ] All 7 models trained
- [ ] Models saved to backend/ml/models/
- [ ] Metrics meet thresholds
- [ ] Ready for inference layer

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-15  
**Status**: ✅ READY FOR IMPLEMENTATION
