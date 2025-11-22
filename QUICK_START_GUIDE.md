# QUICK START GUIDE - ML Training Pipeline
## SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System

---

## 🚀 QUICK START (5 MINUTES)

### 1. Install Dependencies
```bash
pip install pandas numpy scikit-learn lightgbm xgboost joblib
```

### 2. Generate Synthetic Data (if not already done)
```bash
python backend/ml/synthetic/run_all.py
```

### 3. Train All Models
```bash
python backend/ml/train/train_all.py
```

### 4. Check Output
```bash
ls -lh backend/ml/models/
# Should show 8 .pkl files
```

---

## 📚 DETAILED GUIDE

### Step 1: Verify File Structure
```
backend/ml/
├── utils/
│   ├── config.py
│   ├── loaders.py
│   ├── preprocess.py
│   └── feature_engineering.py
├── train/
│   ├── train_demand.py
│   ├── train_rake_availability.py
│   ├── train_delay.py
│   ├── train_throughput.py
│   ├── train_cost.py
│   ├── train_anomaly.py
│   ├── train_mode_classifier.py
│   └── train_all.py
├── models/
│   └── (will be created)
└── synthetic/
    └── raw/
        ├── material_production_daily.csv
        ├── inventory_bsl.csv
        ├── customer_orders.csv
        ├── cmo_stockyard_inventory.csv
        ├── empty_rake_arrivals.csv
        ├── rake_dispatch_history.csv
        ├── loading_point_performance.csv
        ├── route_congestion_daily.csv
        ├── road_transport_daily.csv
        └── cost_parameters_master.csv
```

### Step 2: Train Individual Models
```bash
# Train demand forecasting
python backend/ml/train/train_demand.py

# Train rake availability
python backend/ml/train/train_rake_availability.py

# Train delay prediction (2 models)
python backend/ml/train/train_delay.py

# Train throughput prediction
python backend/ml/train/train_throughput.py

# Train cost prediction
python backend/ml/train/train_cost.py

# Train anomaly detection
python backend/ml/train/train_anomaly.py

# Train mode classifier
python backend/ml/train/train_mode_classifier.py
```

### Step 3: Verify Models
```bash
# Check if models were created
python -c "
import joblib
from pathlib import Path

models_dir = Path('backend/ml/models')
for model_file in models_dir.glob('*.pkl'):
    model = joblib.load(model_file)
    print(f'✅ {model_file.name}: {type(model).__name__}')
"
```

---

## 📊 EXPECTED OUTPUT

### Console Output Example
```
================================================================================
  DEMAND FORECASTING MODEL - FULL PIPELINE
================================================================================
...
Metrics:
  MAPE: 0.1234
  RMSE: 125.45 tonnes
  MAE: 98.32 tonnes
  R²: 0.8765
  ✅ MAPE 0.1234 < 0.15 (GREEN)

Top 10 Features:
  demand_lag_7d: 0.2345
  demand_ma_30d: 0.1876
  seasonality_factor: 0.1543
  ...

✅ Model saved to backend/ml/models/demand_model.pkl
================================================================================
✅ DEMAND FORECASTING MODEL - COMPLETE
================================================================================
```

### Model Files Created
```
backend/ml/models/
├── demand_model.pkl                 (LightGBM Regressor)
├── rake_availability_model.pkl      (LightGBM Regressor)
├── delay_classifier.pkl             (XGBoost Classifier)
├── delay_regressor.pkl              (XGBoost Regressor)
├── throughput_model.pkl             (LightGBM Regressor)
├── cost_model.pkl                   (LightGBM Regressor)
├── anomaly_model.pkl                (IsolationForest + Scaler)
└── mode_classifier.pkl              (LightGBM Classifier)
```

---

## 🔍 TROUBLESHOOTING

### Issue: "FileNotFoundError: Data file not found"
**Solution**: Ensure synthetic data is generated
```bash
python backend/ml/synthetic/run_all.py
```

### Issue: "ModuleNotFoundError: No module named 'lightgbm'"
**Solution**: Install dependencies
```bash
pip install lightgbm xgboost scikit-learn
```

### Issue: "Model performance is poor (MAPE > 20%)"
**Solution**: Check data quality
```python
# In your training script, add:
import pandas as pd
df = pd.read_csv('backend/ml/synthetic/raw/material_production_daily.csv')
print(df.describe())
print(df.isnull().sum())
```

### Issue: "Train/test split is empty"
**Solution**: Ensure sufficient data rows
```python
# Check data size
df = pd.read_csv('backend/ml/synthetic/raw/customer_orders.csv')
print(f"Total rows: {len(df)}")
# Should be > 1000 rows
```

---

## 📈 MONITORING METRICS

### Green Status (✅)
- Demand MAPE < 15%
- Rake MAE < 1.5 rakes
- Delay AUC > 0.80
- Throughput MAE < 150 TPH
- Cost MAPE < 10%
- Mode Accuracy > 85%

### Yellow Status (⚠️)
- Demand MAPE 15-20%
- Rake MAE 1.5-2.5 rakes
- Throughput MAE 150-250 TPH
- Cost MAPE 10-15%

### Red Status (❌)
- Any metric worse than yellow threshold

---

## 🔧 CONFIGURATION

Edit `backend/ml/utils/config.py` to customize:

```python
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
    'rake_mae_green': 1.5,
    # ...
}

# Training parameters
TRAIN_RATIO = 0.70
CV_FOLDS = 4
```

---

## 📝 LOGGING

All scripts log to console. To save logs to file:

```bash
# Train and save logs
python backend/ml/train/train_demand.py 2>&1 | tee demand_training.log

# Train all and save logs
python backend/ml/train/train_all.py 2>&1 | tee all_training.log
```

---

## 🎯 NEXT STEPS

After training completes:

1. **Verify Models**: Check that all 8 .pkl files exist
2. **Review Metrics**: Ensure all metrics are GREEN
3. **Test Inference**: Load models and make predictions
4. **Deploy**: Move to PHASE 3 - Inference API

---

## 📞 SUPPORT

### Documentation Files
- `backend/ml/train/README.md` - Complete training guide
- `ML_Training_Scripts_Summary.md` - Detailed model specs
- `PHASE_2_3_FINAL_SUMMARY.md` - Completion report

### Code Files
- `backend/ml/utils/config.py` - Configuration
- `backend/ml/utils/loaders.py` - Data loading
- `backend/ml/utils/preprocess.py` - Preprocessing
- `backend/ml/utils/feature_engineering.py` - Features

### Training Scripts
- `backend/ml/train/train_*.py` - Individual models
- `backend/ml/train/train_all.py` - All models

---

## ✅ CHECKLIST

- [ ] Dependencies installed
- [ ] Synthetic data generated
- [ ] File structure verified
- [ ] train_all.py executed
- [ ] All 8 model files created
- [ ] Metrics reviewed (all GREEN)
- [ ] Logs saved
- [ ] Ready for inference layer

---

## 🎉 SUCCESS CRITERIA

✅ All 7 models trained successfully  
✅ 8 model files saved to backend/ml/models/  
✅ All evaluation metrics meet thresholds  
✅ Feature importance tracked  
✅ Logs captured for audit trail  

---

**Ready to proceed to PHASE 3 - Inference API!**

