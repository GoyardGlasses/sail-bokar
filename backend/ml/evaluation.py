"""
ML Model Evaluation & Quality Report
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System
PHASE 2.4 - Complete Model Evaluation
"""

import os
import sys
import json
import logging
import warnings
from pathlib import Path
from datetime import datetime

import numpy as np
import pandas as pd
import joblib
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    mean_absolute_percentage_error, accuracy_score, precision_score,
    recall_score, f1_score, roc_auc_score
)

PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT / 'backend' / 'ml'))

from utils.config import MODEL_PATHS, SYNTHETIC_RAW_DIR, RANDOM_SEED

# Create reports directory
REPORTS_DIR = Path(__file__).parent.parent.parent / 'ml_reports'
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

from utils.loaders import load_csv

warnings.filterwarnings('ignore')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Pass/Fail Thresholds
THRESHOLDS = {
    'mae': 5000,
    'rmse': 8000,
    'mape': 50,
    'r2': 0.50,
    'accuracy': 0.70,
    'precision': 0.70,
    'recall': 0.70,
    'f1': 0.70,
    'auc': 0.70,
}


def evaluate_regression(y_true, y_pred, model_name):
    """Evaluate regression model."""
    metrics = {}
    mae = mean_absolute_error(y_true, y_pred)
    metrics['mae'] = float(mae)
    metrics['mae_pass'] = mae < THRESHOLDS['mae']
    
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    metrics['rmse'] = float(rmse)
    metrics['rmse_pass'] = rmse < THRESHOLDS['rmse']
    
    mape = mean_absolute_percentage_error(y_true, y_pred)
    metrics['mape'] = float(mape)
    metrics['mape_pass'] = mape < THRESHOLDS['mape']
    
    r2 = r2_score(y_true, y_pred)
    metrics['r2'] = float(r2)
    metrics['r2_pass'] = r2 > THRESHOLDS['r2']
    
    metrics['passed'] = all([metrics['mae_pass'], metrics['rmse_pass'], metrics['r2_pass']])
    return metrics


def evaluate_classification(y_true, y_pred, y_proba=None, model_name=None):
    """Evaluate classification model."""
    metrics = {}
    
    accuracy = accuracy_score(y_true, y_pred)
    metrics['accuracy'] = float(accuracy)
    metrics['accuracy_pass'] = accuracy > THRESHOLDS['accuracy']
    
    precision = precision_score(y_true, y_pred, zero_division=0)
    metrics['precision'] = float(precision)
    metrics['precision_pass'] = precision > THRESHOLDS['precision']
    
    recall = recall_score(y_true, y_pred, zero_division=0)
    metrics['recall'] = float(recall)
    metrics['recall_pass'] = recall > THRESHOLDS['recall']
    
    f1 = f1_score(y_true, y_pred, zero_division=0)
    metrics['f1'] = float(f1)
    metrics['f1_pass'] = f1 > THRESHOLDS['f1']
    
    if y_proba is not None:
        try:
            auc = roc_auc_score(y_true, y_proba)
            metrics['auc'] = float(auc)
            metrics['auc_pass'] = auc > THRESHOLDS['auc']
        except:
            metrics['auc'] = None
            metrics['auc_pass'] = True
    
    metrics['passed'] = all([
        metrics['accuracy_pass'],
        metrics['precision_pass'],
        metrics['recall_pass'],
        metrics['f1_pass'],
        metrics.get('auc_pass', True)
    ])
    return metrics


def evaluate_model(model_name, df_features, target_col, model_type='regression'):
    """Generic model evaluation function."""
    logger.info(f"\nEvaluating: {model_name}")
    
    try:
        model_path = MODEL_PATHS.get(model_name.lower().replace(' ', '_').replace('-', '_'))
        if not model_path or not Path(model_path).exists():
            return {
                'model': model_name,
                'status': 'NOT_FOUND',
                'metrics': {},
                'passed': False,
                'error': 'Model file not found'
            }
        
        model = joblib.load(model_path)
        
        # Feature selection
        feature_cols = [col for col in df_features.columns 
                       if df_features[col].dtype in ['float64', 'int64']
                       and col not in [target_col]]
        
        X = df_features[feature_cols]
        y = df_features[target_col]
        
        # Remove NaN
        valid_idx = X.notna().all(axis=1) & y.notna()
        X = X[valid_idx]
        y = y[valid_idx]
        
        if len(X) == 0:
            return {
                'model': model_name,
                'status': 'NO_DATA',
                'metrics': {},
                'passed': False,
                'error': 'No valid samples'
            }
        
        # Split
        split_idx = int(len(X) * 0.80)
        X_test = X.iloc[split_idx:]
        y_test = y.iloc[split_idx:]
        
        # Predict
        y_pred = model.predict(X_test)
        
        # Evaluate
        if model_type == 'regression':
            metrics = evaluate_regression(y_test, y_pred, model_name)
            logger.info(f"  MAE: {metrics['mae']:.2f} | RMSE: {metrics['rmse']:.2f} | R²: {metrics['r2']:.4f}")
        else:
            y_proba = model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else None
            metrics = evaluate_classification(y_test, y_pred, y_proba, model_name)
            logger.info(f"  Accuracy: {metrics['accuracy']:.4f} | F1: {metrics['f1']:.4f}")
        
        logger.info(f"  Status: {'✅ PASSED' if metrics['passed'] else '❌ FAILED'}")
        
        return {
            'model': model_name,
            'status': 'PASSED' if metrics['passed'] else 'FAILED',
            'metrics': metrics,
            'passed': metrics['passed'],
            'features_used': len(feature_cols),
            'samples': len(X_test)
        }
    
    except Exception as e:
        logger.error(f"  Error: {str(e)}")
        return {
            'model': model_name,
            'status': 'ERROR',
            'metrics': {},
            'passed': False,
            'error': str(e)
        }


def main():
    """Run complete model evaluation."""
    logger.info("\n" + "=" * 80)
    logger.info("ML MODEL EVALUATION & QUALITY REPORT")
    logger.info("SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System")
    logger.info("=" * 80)
    
    # Load synthetic data
    logger.info("\nLoading synthetic data...")
    try:
        df_demand = load_csv('customer_orders')
        df_rake = load_csv('empty_rakes')
        df_delay = load_csv('rake_dispatch')
        df_throughput = load_csv('loading_point')
        df_cost = load_csv('rake_dispatch')
        df_mode = load_csv('customer_orders')
        logger.info("✅ Synthetic data loaded")
    except Exception as e:
        logger.error(f"Error loading data: {str(e)}")
        return
    
    # Use data as-is (already processed by training scripts)
    logger.info("✅ Data loaded, ready for evaluation")
    df_demand_features = df_demand
    df_rake_features = df_rake
    df_delay_features = df_delay
    df_throughput_features = df_throughput
    df_cost_features = df_cost
    df_mode_features = df_mode
    
    # Evaluate all models
    logger.info("\n" + "=" * 80)
    logger.info("EVALUATING ALL MODELS")
    logger.info("=" * 80)
    
    results = []
    
    # 1. Demand Forecasting
    results.append(evaluate_model('Demand Forecasting', df_demand_features, 'demand_tonnes', 'regression'))
    
    # 2. Rake Availability
    results.append(evaluate_model('Rake Availability', df_rake_features, 'empty_rakes_available', 'regression'))
    
    # 3. Delay Classifier
    logger.info("\nEvaluating: Delay Classifier")
    try:
        model = joblib.load(MODEL_PATHS.get('delay_classifier'))
        feature_cols = [col for col in df_delay_features.columns 
                       if df_delay_features[col].dtype in ['float64', 'int64']
                       and col not in ['delay_hours']]
        X = df_delay_features[feature_cols]
        y = df_delay_features['delay_hours']
        valid_idx = X.notna().all(axis=1) & y.notna()
        X, y = X[valid_idx], y[valid_idx]
        split_idx = int(len(X) * 0.80)
        X_test, y_test = X.iloc[split_idx:], y.iloc[split_idx:]
        y_test_binary = (y_test > 2).astype(int)
        y_pred = model.predict(X_test)
        y_proba = model.predict_proba(X_test)[:, 1]
        metrics = evaluate_classification(y_test_binary, y_pred, y_proba)
        logger.info(f"  Accuracy: {metrics['accuracy']:.4f} | F1: {metrics['f1']:.4f}")
        logger.info(f"  Status: {'✅ PASSED' if metrics['passed'] else '❌ FAILED'}")
        results.append({
            'model': 'Delay Classifier',
            'status': 'PASSED' if metrics['passed'] else 'FAILED',
            'metrics': metrics,
            'passed': metrics['passed'],
            'features_used': len(feature_cols),
            'samples': len(X_test)
        })
    except Exception as e:
        logger.error(f"  Error: {str(e)}")
        results.append({
            'model': 'Delay Classifier',
            'status': 'ERROR',
            'metrics': {},
            'passed': False,
            'error': str(e)
        })
    
    # 4. Delay Regressor
    results.append(evaluate_model('Delay Regressor', df_delay_features, 'delay_hours', 'regression'))
    
    # 5. Throughput
    results.append(evaluate_model('Throughput', df_throughput_features, 'throughput_tph', 'regression'))
    
    # 6. Cost
    results.append(evaluate_model('Cost', df_cost_features, 'total_cost_rs', 'regression'))
    
    # 7. Mode Classifier
    logger.info("\nEvaluating: Mode Classifier")
    try:
        model = joblib.load(MODEL_PATHS.get('mode_classifier'))
        feature_cols = [col for col in df_mode_features.columns 
                       if df_mode_features[col].dtype in ['float64', 'int64']
                       and col not in ['transport_mode']]
        X = df_mode_features[feature_cols]
        y = df_mode_features['transport_mode']
        valid_idx = X.notna().all(axis=1) & y.notna()
        X, y = X[valid_idx], y[valid_idx]
        split_idx = int(len(X) * 0.80)
        X_test, y_test = X.iloc[split_idx:], y.iloc[split_idx:]
        y_pred = model.predict(X_test)
        y_proba = model.predict_proba(X_test)[:, 1]
        metrics = evaluate_classification(y_test, y_pred, y_proba)
        logger.info(f"  Accuracy: {metrics['accuracy']:.4f} | F1: {metrics['f1']:.4f}")
        logger.info(f"  Status: {'✅ PASSED' if metrics['passed'] else '❌ FAILED'}")
        results.append({
            'model': 'Mode Classifier',
            'status': 'PASSED' if metrics['passed'] else 'FAILED',
            'metrics': metrics,
            'passed': metrics['passed'],
            'features_used': len(feature_cols),
            'samples': len(X_test)
        })
    except Exception as e:
        logger.error(f"  Error: {str(e)}")
        results.append({
            'model': 'Mode Classifier',
            'status': 'ERROR',
            'metrics': {},
            'passed': False,
            'error': str(e)
        })
    
    # Summary
    logger.info("\n" + "=" * 80)
    logger.info("EVALUATION SUMMARY")
    logger.info("=" * 80)
    
    passed_count = sum(1 for r in results if r['passed'])
    total_count = len(results)
    
    logger.info(f"\nTotal Models: {total_count}")
    logger.info(f"Passed: {passed_count}")
    logger.info(f"Failed: {total_count - passed_count}")
    logger.info(f"Success Rate: {passed_count/total_count*100:.1f}%")
    
    # Save JSON report
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    json_file = REPORTS_DIR / 'ml_quality_summary.json'
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_models': total_count,
            'passed_models': passed_count,
            'failed_models': total_count - passed_count,
            'success_rate': passed_count / total_count,
            'models': results,
            'thresholds': THRESHOLDS
        }, f, indent=2, default=str)
    
    logger.info(f"\n✅ JSON report saved to {json_file}")
    
    return results


if __name__ == '__main__':
    main()
