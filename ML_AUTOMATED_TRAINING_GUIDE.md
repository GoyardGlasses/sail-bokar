# ML Automated Training Scheduler - Complete Guide

## Overview

The ML Automated Training Scheduler automatically trains all 17 ML models daily and monitors their performance. Models can retrain themselves if accuracy drops below thresholds.

---

## ✅ What Was Implemented

### 1. **Automated Daily Training**
- **Time**: 2:00 AM daily (configurable)
- **Frequency**: Every 24 hours
- **Models**: All 17 ML models trained together
- **Duration**: ~5-10 minutes per training cycle

### 2. **Performance Monitoring**
- **Hourly Checks**: Performance monitored every hour
- **Accuracy Threshold**: 70% minimum (configurable)
- **Auto-Retraining**: Triggers if accuracy drops
- **Max Retries**: 3 attempts before alert

### 3. **Model Versioning**
- **Version History**: All model versions tracked
- **Backup System**: Previous models backed up automatically
- **Rollback Capability**: Can revert to previous versions
- **Timestamp Tracking**: Every training timestamped

### 4. **Training History**
- **Complete Logs**: All training events recorded
- **Statistics**: Success rates, accuracy trends
- **Error Tracking**: Failed trainings logged
- **Duration Metrics**: Training time tracked

---

## 📁 Files Created

### 1. **backend/ml/automated_training_scheduler.py** (450+ lines)
Core scheduler implementation with:
- `TrainingHistoryManager` - Manages training history and versions
- `AutomatedModelTrainer` - Handles model training
- `TrainingScheduler` - Manages scheduling
- API functions for external access

### 2. **backend/app/main.py** (Updated)
Added:
- Scheduler import and initialization
- 3 new API endpoints
- Startup event to launch scheduler
- Error handling for scheduler

### 3. **backend/requirements.txt** (Updated)
Added:
- `schedule==1.2.0` - Job scheduling library

---

## 🚀 How It Works

### Daily Training Flow

```
2:00 AM Daily
    ↓
Scheduler triggers training job
    ↓
Load training data from database
    ↓
Train all 17 models
    ↓
Calculate accuracy metrics
    ↓
Save models with version info
    ↓
Backup previous models
    ↓
Record training history
    ↓
Log results and statistics
```

### Performance Monitoring Flow

```
Every Hour
    ↓
Check latest model accuracy
    ↓
Compare with threshold (70%)
    ↓
If accuracy < 70%:
    ├─ Log warning
    ├─ Trigger immediate retraining
    └─ Retry up to 3 times
    ↓
If accuracy ≥ 70%:
    └─ Continue normal operation
```

---

## 📊 17 ML Models Trained Daily

### GROUP 1: PREDICTION MODELS (5)
1. **Delay Prediction** - Predicts shipment delays
2. **Cost Prediction** - Predicts shipping costs
3. **Demand Forecasting** - Predicts future demand
4. **Quality Prediction** - Predicts delivery quality
5. **Fuel Consumption** - Predicts fuel usage

### GROUP 2: OPTIMIZATION MODELS (5)
6. **Route Optimization** - Finds best route
7. **Cost Optimization** - Minimizes costs
8. **Time Optimization** - Minimizes delivery time
9. **Vehicle Allocation** - Assigns best vehicle
10. **Material Recommendation** - Recommends best material

### GROUP 3: RISK & DECISION MODELS (4)
11. **Risk Assessment** - Calculates shipment risk
12. **Decision Support** - Recommends decisions
13. **Anomaly Detection** - Detects unusual patterns
14. **Supplier Performance** - Rates suppliers

### GROUP 4: ADVANCED MODELS (3)
15. **Scenario Analysis** - Simulates outcomes
16. **Predictive Maintenance** - Predicts maintenance needs
17. **Customer Satisfaction** - Predicts satisfaction

---

## 🔌 API Endpoints

### 1. **GET /ml/training/status**
Get current training scheduler status

**Response:**
```json
{
  "status": "success",
  "data": {
    "scheduler_active": true,
    "training_time": "02:00",
    "trainer_status": {
      "is_training": false,
      "last_training_time": "2025-11-30T02:00:15.123456",
      "stats": {
        "total_trainings": 45,
        "successful_trainings": 44,
        "success_rate": 97.78,
        "total_models_trained": 765,
        "avg_accuracy": 0.8542,
        "last_training": "2025-11-30T02:00:15.123456"
      }
    },
    "next_run": "2025-12-01 02:00:00"
  }
}
```

### 2. **POST /ml/training/trigger**
Manually trigger model training immediately

**Response:**
```json
{
  "status": "success",
  "data": {
    "status": "success",
    "timestamp": "2025-11-30T15:45:30.123456",
    "duration_seconds": 285.5,
    "models_trained": 17,
    "successful_models": 17,
    "failed_models": 0,
    "avg_accuracy": 0.8642,
    "model_details": {
      "prediction_models": {...},
      "optimization_models": {...},
      "risk_decision_models": {...},
      "advanced_models": {...}
    }
  }
}
```

### 3. **GET /ml/training/history**
Get complete training history and statistics

**Response:**
```json
{
  "status": "success",
  "data": {
    "history": {
      "trainings": [
        {
          "timestamp": "2025-11-30T02:00:15.123456",
          "status": "success",
          "models_trained": 17,
          "successful_models": 17,
          "failed_models": 0,
          "avg_accuracy": 0.8542,
          "duration_seconds": 285.5,
          "errors": []
        },
        ...
      ],
      "model_versions": {
        "delay_prediction": [...],
        "cost_prediction": [...],
        ...
      }
    },
    "stats": {
      "total_trainings": 45,
      "successful_trainings": 44,
      "success_rate": 97.78,
      "total_models_trained": 765,
      "avg_accuracy": 0.8542,
      "last_training": "2025-11-30T02:00:15.123456"
    }
  }
}
```

---

## 📋 Configuration

Edit `backend/ml/automated_training_scheduler.py` to customize:

```python
TRAINING_CONFIG = {
    'DAILY_TRAINING_TIME': '02:00',           # Training time (HH:MM)
    'PERFORMANCE_CHECK_INTERVAL': 3600,       # Check every hour (seconds)
    'MIN_ACCURACY_THRESHOLD': 0.70,           # Retrain if < 70%
    'MAX_RETRAIN_ATTEMPTS': 3,                # Max retry attempts
    'MODEL_VERSIONING': True,                 # Track versions
    'BACKUP_MODELS': True,                    # Backup before training
    'MODELS_DIR': Path('backend/ml/models'),  # Models directory
    'LOGS_DIR': Path('backend/ml/logs'),      # Logs directory
    'HISTORY_FILE': Path('backend/ml/logs/training_history.json'),
}
```

---

## 📈 Training History & Statistics

### What Gets Tracked

1. **Training Records**
   - Timestamp of training
   - Success/failure status
   - Number of models trained
   - Accuracy metrics
   - Duration in seconds
   - Any errors encountered

2. **Model Versions**
   - Version timestamp
   - Model accuracy
   - Performance metrics
   - Training parameters
   - Data statistics

3. **Statistics**
   - Total trainings completed
   - Success rate percentage
   - Average accuracy across all models
   - Trend analysis
   - Performance history

### Files Generated

```
backend/ml/logs/
├── training_scheduler.log          # Detailed training logs
├── training_history.json           # Complete training history
└── backup_YYYYMMDD_HHMMSS/        # Model backups
    ├── delay_prediction.pkl
    ├── cost_prediction.pkl
    ├── demand_forecasting.pkl
    └── ... (all 17 models)
```

---

## 🔍 Monitoring & Alerts

### Automatic Alerts Triggered When:

1. **Training Fails**
   - Error logged with details
   - Retry scheduled
   - Alert sent if all retries fail

2. **Accuracy Drops**
   - Below 70% threshold
   - Immediate retraining triggered
   - Alert logged with reason

3. **Performance Degradation**
   - Accuracy trend declining
   - Logged for analysis
   - May trigger manual review

4. **Training Delays**
   - Training takes longer than expected
   - Logged for optimization
   - May indicate data issues

---

## 🛠️ Usage Examples

### Check Training Status
```bash
curl http://localhost:8000/ml/training/status
```

### Manually Trigger Training
```bash
curl -X POST http://localhost:8000/ml/training/trigger
```

### Get Training History
```bash
curl http://localhost:8000/ml/training/history
```

### View Training Logs
```bash
tail -f backend/ml/logs/training_scheduler.log
```

---

## 🚀 Starting the Application

The scheduler automatically starts when the FastAPI app starts:

```bash
cd backend
python -m uvicorn app.main:app --reload
```

**Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Starting SAIL Bokaro Logistics Optimization System v1.0.0
✓ ML Training Scheduler started successfully
✓ Scheduled daily training at 02:00
✓ Scheduled hourly performance checks
🚀 Training scheduler started
✓ Scheduler running in background thread
```

---

## 📊 Real-Time Dashboard Integration

### Frontend Components to Display:

1. **Training Status Card**
   - Current status (training/idle)
   - Last training time
   - Next scheduled training
   - Success rate percentage

2. **Model Accuracy Chart**
   - Accuracy trend over time
   - Per-model accuracy
   - Threshold line (70%)
   - Alert indicators

3. **Training History Table**
   - Training timestamp
   - Duration
   - Models trained
   - Success/failure
   - Accuracy metrics

4. **Manual Training Button**
   - Trigger immediate training
   - Show training progress
   - Display results

---

## ⚠️ Troubleshooting

### Issue: Scheduler not starting
**Solution**: Check `backend/ml/logs/training_scheduler.log` for errors

### Issue: Models not training
**Solution**: Verify database connection and training data availability

### Issue: High accuracy variance
**Solution**: Check data quality and feature engineering

### Issue: Training takes too long
**Solution**: Reduce dataset size or optimize model parameters

---

## 🔐 Security Considerations

1. **Model Backups**: Encrypted and versioned
2. **Training Logs**: Sensitive data masked
3. **History Files**: Access controlled
4. **API Endpoints**: Can be protected with authentication
5. **Model Files**: Stored securely with checksums

---

## 📈 Performance Metrics

### Expected Training Times
- **Single Model**: 10-30 seconds
- **All 17 Models**: 3-5 minutes
- **Backup Process**: 1-2 minutes
- **Total Cycle**: 5-10 minutes

### Expected Accuracy
- **Prediction Models**: 80-90%
- **Optimization Models**: 75-85%
- **Risk Models**: 70-80%
- **Advanced Models**: 65-75%

### Storage Requirements
- **Per Model**: 5-50 MB
- **All 17 Models**: 100-500 MB
- **Backups (30 days)**: 3-15 GB
- **Training Logs**: 100-500 MB

---

## 🎯 Next Steps

1. ✅ **Automated Daily Training** - IMPLEMENTED
2. ✅ **Performance Monitoring** - IMPLEMENTED
3. ✅ **Model Versioning** - IMPLEMENTED
4. ✅ **Training History** - IMPLEMENTED
5. ⏳ **Frontend Dashboard** - TODO
6. ⏳ **Email Alerts** - TODO
7. ⏳ **Advanced Analytics** - TODO
8. ⏳ **A/B Testing Framework** - TODO

---

## 📞 Support

For issues or questions:
1. Check logs: `backend/ml/logs/training_scheduler.log`
2. Review history: `backend/ml/logs/training_history.json`
3. Test endpoints: Use curl or Postman
4. Check API docs: `http://localhost:8000/api/docs`

---

## 🎓 Learning Resources

- **Scheduler Library**: https://schedule.readthedocs.io/
- **FastAPI Events**: https://fastapi.tiangolo.com/advanced/events/
- **Model Training**: See `backend/ml/train_all_models.py`
- **Data Pipeline**: See `backend/ml/data_pipeline.py`

---

**Status**: ✅ FULLY IMPLEMENTED & READY TO USE

**Last Updated**: Nov 30, 2025
**Version**: 1.0.0
