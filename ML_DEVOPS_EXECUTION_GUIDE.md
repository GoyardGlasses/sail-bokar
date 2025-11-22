# ML DevOps Pipeline - Execution Guide
## SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System

**Status**: Ready to Execute  
**Date**: 2024-01-15

---

## 🚀 QUICK START (Copy & Paste Commands)

### Option 1: Run Full Pipeline (Recommended)
```bash
cd C:\Users\Admin\CascadeProjects
python backend/ml/ml_devops_pipeline.py
```

This will:
1. ✅ Generate synthetic data (10 tables)
2. ✅ Train all 7 ML models
3. ✅ Evaluate performance
4. ✅ Generate report

---

### Option 2: Run Step-by-Step

#### Step 1: Generate Synthetic Data
```bash
cd C:\Users\Admin\CascadeProjects
python backend/ml/synthetic/generate_synthetic_data.py
```

**Expected Output**:
```
Generating material_production_daily...
✅ Generated 10220 rows
Generating inventory_bsl...
✅ Generated 2555 rows
Generating customer_orders...
✅ Generated 5847 rows
...
✅ SYNTHETIC DATA GENERATION - COMPLETE
All files saved to: backend/ml/synthetic/raw
```

#### Step 2: Train Individual Models
```bash
# Model 1: Demand Forecasting
python backend/ml/train/train_demand.py

# Model 2: Rake Availability
python backend/ml/train/train_rake_availability.py

# Model 3: Route Delay Prediction
python backend/ml/train/train_delay.py

# Model 4: Throughput Prediction
python backend/ml/train/train_throughput.py

# Model 5: Cost Prediction
python backend/ml/train/train_cost.py

# Model 6: Anomaly Detection
python backend/ml/train/train_anomaly.py

# Model 7: Mode Classifier
python backend/ml/train/train_mode_classifier.py
```

#### Step 3: Train All Models at Once
```bash
python backend/ml/train/train_all.py
```

#### Step 4: Check Generated Models
```bash
# Windows
dir backend\ml\models\

# Linux/Mac
ls -lh backend/ml/models/
```

**Expected Output**:
```
demand_model.pkl
rake_availability_model.pkl
delay_classifier.pkl
delay_regressor.pkl
throughput_model.pkl
cost_model.pkl
anomaly_model.pkl
mode_classifier.pkl
```

---

## 📊 EXPECTED PERFORMANCE METRICS

### Thresholds
- **MAE**: < 5000
- **RMSE**: < 8000
- **Accuracy**: > 70%
- **F1-Score**: > 0.70
- **AUC**: > 0.70

### Model-Specific Expectations

| Model | Type | Key Metric | Target |
|-------|------|-----------|--------|
| Demand Forecasting | Regressor | MAPE | < 15% |
| Rake Availability | Regressor | MAE | < 1.5 rakes |
| Route Delay | Classifier | AUC | > 0.80 |
| Throughput | Regressor | MAE | < 150 TPH |
| Cost Prediction | Regressor | MAPE | < 10% |
| Anomaly Detection | Unsupervised | Anomaly Rate | 5% |
| Mode Classifier | Classifier | Accuracy | > 85% |

---

## 📁 FILE STRUCTURE

```
C:\Users\Admin\CascadeProjects\
├── backend/ml/
│   ├── synthetic/
│   │   ├── __init__.py
│   │   ├── generate_synthetic_data.py
│   │   └── raw/
│   │       ├── material_production_daily.csv
│   │       ├── inventory_bsl.csv
│   │       ├── customer_orders.csv
│   │       ├── cmo_stockyard_inventory.csv
│   │       ├── empty_rake_arrivals.csv
│   │       ├── rake_dispatch_history.csv
│   │       ├── loading_point_performance.csv
│   │       ├── route_congestion_daily.csv
│   │       ├── road_transport_daily.csv
│   │       └── cost_parameters_master.csv
│   │
│   ├── train/
│   │   ├── train_demand.py
│   │   ├── train_rake_availability.py
│   │   ├── train_delay.py
│   │   ├── train_throughput.py
│   │   ├── train_cost.py
│   │   ├── train_anomaly.py
│   │   ├── train_mode_classifier.py
│   │   └── train_all.py
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
│   └── utils/
│       ├── config.py
│       ├── loaders.py
│       ├── preprocess.py
│       └── feature_engineering.py
│
├── ml_devops_pipeline.py
├── ml_reports/
│   ├── ml_evaluation_20240115_120000.json
│   └── ml_evaluation_20240115_120000.md
│
└── ML_DEVOPS_EXECUTION_GUIDE.md (this file)
```

---

## 🔍 MONITORING EXECUTION

### Real-Time Logs
The pipeline prints detailed logs to console:
```
2024-01-15 12:00:00 - root - INFO - ================================================================================
2024-01-15 12:00:00 - root - INFO - STEP 1: GENERATING SYNTHETIC DATA
2024-01-15 12:00:00 - root - INFO - ================================================================================
2024-01-15 12:00:05 - root - INFO - Generating material_production_daily...
2024-01-15 12:00:05 - root - INFO - ✅ Generated 10220 rows
...
```

### Save Logs to File
```bash
# Windows
python backend/ml/ml_devops_pipeline.py > ml_pipeline.log 2>&1

# Linux/Mac
python backend/ml/ml_devops_pipeline.py | tee ml_pipeline.log
```

---

## 📈 EVALUATION REPORT

After execution, check the report:

```bash
# View JSON report
type ml_reports\ml_evaluation_*.json

# View Markdown report
type ml_reports\ml_evaluation_*.md
```

**Report Contents**:
- Total models trained
- Models passed
- Models needing optimization
- Detailed metrics for each model
- Failure reasons (if any)

---

## ⚠️ TROUBLESHOOTING

### Issue: "ModuleNotFoundError: No module named 'lightgbm'"
**Solution**:
```bash
pip install lightgbm xgboost scikit-learn pandas numpy joblib
```

### Issue: "FileNotFoundError: Data file not found"
**Solution**: Ensure synthetic data is generated first
```bash
python backend/ml/synthetic/generate_synthetic_data.py
```

### Issue: "Permission denied" (Linux/Mac)
**Solution**: Make scripts executable
```bash
chmod +x backend/ml/ml_devops_pipeline.py
chmod +x backend/ml/synthetic/generate_synthetic_data.py
```

### Issue: "Models not found in backend/ml/models/"
**Solution**: Check if training completed successfully
```bash
# Check for errors in logs
python backend/ml/train/train_demand.py

# Verify synthetic data exists
ls backend/ml/synthetic/raw/
```

---

## 🎯 SUCCESS CRITERIA

✅ All 7 models trained successfully  
✅ 8 model files saved to backend/ml/models/  
✅ All evaluation metrics meet thresholds  
✅ Report generated in ml_reports/  
✅ No errors in logs  

---

## 📊 SAMPLE OUTPUT

### Console Output
```
================================================================================
STEP 1: GENERATING SYNTHETIC DATA
================================================================================
Generating material_production_daily...
✅ Generated 10220 rows
Generating inventory_bsl...
✅ Generated 2555 rows
...
✅ SYNTHETIC DATA GENERATION - COMPLETE

================================================================================
STEP 2: TRAINING ALL MODELS
================================================================================
Training train_demand.py...
✅ train_demand.py trained successfully

Training train_rake_availability.py...
✅ train_rake_availability.py trained successfully

...

================================================================================
STEP 3: EVALUATING MODELS
================================================================================

demand:
  Status: ✅ PASSED
  MAE: 125.45
  RMSE: 234.56
  R2: 0.8765

rake_availability:
  Status: ✅ PASSED
  MAE: 1.23
  RMSE: 1.89
  R2: 0.9012

...

================================================================================
FINAL SUMMARY
================================================================================
Total Models: 7
Passed: 7
Need Optimization: 0

✅ Report saved to ml_reports/ml_evaluation_20240115_120000.json
✅ Markdown report saved to ml_reports/ml_evaluation_20240115_120000.md
```

### JSON Report
```json
{
  "timestamp": "2024-01-15T12:00:00",
  "total_models": 7,
  "passed_models": 7,
  "failed_models": 0,
  "models": {
    "demand": {
      "status": "✅ PASSED",
      "metrics": {
        "mae": 125.45,
        "rmse": 234.56,
        "r2": 0.8765
      },
      "passed": true,
      "failures": []
    },
    ...
  }
}
```

---

## 🔄 NEXT STEPS

After successful execution:

1. ✅ Review ml_reports/ for detailed metrics
2. ✅ Verify all 8 model files in backend/ml/models/
3. ✅ Check that all metrics meet thresholds
4. ✅ Proceed to PHASE 3 - Inference API

---

## 📞 SUPPORT

### Documentation
- `backend/ml/train/README.md` - Training guide
- `ML_Training_Scripts_Summary.md` - Model specifications
- `PHASE_2_3_FINAL_SUMMARY.md` - Completion report

### Code Files
- `backend/ml/ml_devops_pipeline.py` - Main pipeline
- `backend/ml/synthetic/generate_synthetic_data.py` - Data generation
- `backend/ml/train/train_*.py` - Individual training scripts

---

**Ready to execute! Copy and paste the commands above to get started.**

