"""
Road-vs-Rail Mode Classifier Model Training
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.

Model: LightGBM Binary Classifier
Target: Transport mode (0=ROAD, 1=RAIL)
Metrics: Accuracy, AUC, Precision, Recall
"""

import sys
import logging
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import (
    accuracy_score, roc_auc_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)
import lightgbm as lgb
import joblib

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.config import (
    MODEL_PATHS, LIGHTGBM_PARAMS, SEASONALITY_FACTORS, MONSOON_MONTHS,
    MATERIALS, DESTINATIONS, PRIORITIES, EVAL_THRESHOLDS, RANDOM_SEED
)
from utils.loaders import load_mode_classifier_data, load_csv
from utils.preprocess import (
    handle_missing_forward_fill, handle_missing_backward_fill,
    handle_missing_median, cap_outliers_percentile, validate_no_nulls
)
from utils.feature_engineering import (
    build_lag_features, build_rolling_features, add_calendar_features,
    add_seasonality_factor, add_cost_differential_feature, select_features
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# DATA LOADING & PREPROCESSING
# ============================================================================

def load_data() -> pd.DataFrame:
    """Load and merge mode classifier data."""
    logger.info("=" * 80)
    logger.info("ROAD-VS-RAIL MODE CLASSIFIER - DATA LOADING")
    logger.info("=" * 80)
    
    # Load all data sources
    orders, dispatch, costs, rakes = load_mode_classifier_data()
    
    # Create target: mode from dispatch history
    # Aggregate dispatch by date and route to get mode distribution
    dispatch_agg = dispatch.groupby(['date', 'route']).agg({
        'tonnes_dispatched': 'sum',
    }).reset_index()
    
    # Assume rail if dispatch exists (simplified logic)
    dispatch_agg['transport_mode'] = 1  # 1 = RAIL
    
    # Merge orders with dispatch to get mode labels
    orders_with_mode = orders.merge(
        dispatch_agg[['date', 'route', 'transport_mode']],
        left_on=['order_date', 'destination'],
        right_on=['date', 'route'],
        how='left'
    )
    
    # Fill missing modes with road (0)
    orders_with_mode['transport_mode'] = orders_with_mode['transport_mode'].fillna(0).astype(int)
    
    # Merge with cost parameters
    orders_with_mode = orders_with_mode.merge(
        costs[['route', 'distance_km', 'rail_freight_rate_rs_per_tonne', 'road_freight_rate_rs_per_tonne']],
        left_on='destination',
        right_on='route',
        how='left'
    )
    
    # Calculate estimated costs
    orders_with_mode['estimated_rail_cost'] = (
        orders_with_mode['quantity_tonnes'] * orders_with_mode['rail_freight_rate_rs_per_tonne']
    )
    orders_with_mode['estimated_road_cost'] = (
        orders_with_mode['quantity_tonnes'] * orders_with_mode['road_freight_rate_rs_per_tonne']
    )
    
    # Merge with rake availability
    rakes_agg = rakes.groupby('date').size().reset_index(name='available_rakes')
    orders_with_mode = orders_with_mode.merge(
        rakes_agg,
        left_on='order_date',
        right_on='date',
        how='left'
    )
    
    # Sort by date
    orders_with_mode = orders_with_mode.sort_values('order_date').reset_index(drop=True)
    
    logger.info(f"✅ Loaded mode classifier data: {len(orders_with_mode)} rows")
    return orders_with_mode


def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    """Preprocess mode classifier data."""
    logger.info("\n" + "=" * 80)
    logger.info("ROAD-VS-RAIL MODE CLASSIFIER - PREPROCESSING")
    logger.info("=" * 80)
    
    df_clean = df.copy()
    df_clean['order_date'] = pd.to_datetime(df_clean['order_date'])
    
    # Handle missing values
    numeric_cols = ['quantity_tonnes', 'distance_km', 'estimated_rail_cost', 
                   'estimated_road_cost', 'available_rakes']
    df_clean = handle_missing_forward_fill(df_clean, numeric_cols, max_fill=3)
    df_clean = handle_missing_backward_fill(df_clean, numeric_cols)
    df_clean = handle_missing_median(df_clean, numeric_cols)
    
    # Handle categorical missing
    df_clean['priority'] = df_clean['priority'].fillna('MEDIUM')
    df_clean['material_type'] = df_clean['material_type'].fillna('HR_Coils')
    
    # Cap outliers
    df_clean = cap_outliers_percentile(df_clean, ['quantity_tonnes', 'distance_km'], 
                                       lower=0.01, upper=0.99)
    
    # Validate
    validate_no_nulls(df_clean, ['order_date', 'transport_mode'])
    
    logger.info(f"✅ Preprocessed data: {len(df_clean)} rows")
    return df_clean


# ============================================================================
# FEATURE ENGINEERING
# ============================================================================

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Build features for mode classifier."""
    logger.info("\n" + "=" * 80)
    logger.info("ROAD-VS-RAIL MODE CLASSIFIER - FEATURE ENGINEERING")
    logger.info("=" * 80)
    
    df_features = df.copy()
    
    # Order features
    df_features['quantity_log'] = np.log1p(df_features['quantity_tonnes'])
    
    # Priority encoding
    priority_map = {'HIGH': 2, 'MEDIUM': 1, 'LOW': 0}
    df_features['priority_encoded'] = df_features['priority'].map(priority_map)
    
    # Material encoding
    material_map = {mat: i for i, mat in enumerate(MATERIALS)}
    df_features['material_encoded'] = df_features['material_type'].map(material_map)
    
    # Destination encoding
    dest_map = {dest: i for i, dest in enumerate(DESTINATIONS)}
    df_features['destination_encoded'] = df_features['destination'].map(dest_map)
    
    # Cost features
    df_features['cost_differential'] = df_features['estimated_road_cost'] - df_features['estimated_rail_cost']
    df_features['cost_ratio'] = df_features['estimated_road_cost'] / (df_features['estimated_rail_cost'] + 1e-6)
    
    # Time features
    df_features['order_date'] = pd.to_datetime(df_features['order_date'])
    df_features['days_to_due_date'] = (pd.to_datetime(df_features['due_date']) - df_features['order_date']).dt.days
    df_features['is_urgent_flag'] = (df_features['days_to_due_date'] < 3).astype(int)
    
    # Availability features
    total_trucks = 50  # Assumed fleet size
    df_features['available_trucks_ratio'] = total_trucks / (total_trucks + 1e-6)
    df_features['available_rakes_ratio'] = df_features['available_rakes'] / 50.0  # Max 50 rakes
    
    # Route features
    df_features['is_haldia'] = (df_features['destination'].str.contains('Haldia')).astype(int)
    
    # Calendar features
    df_features = add_calendar_features(df_features, 'order_date')
    
    # Seasonality factor
    df_features = add_seasonality_factor(df_features, 'order_date')
    
    logger.info(f"✅ Engineered features: {len(df_features)} rows, {len(df_features.columns)} columns")
    return df_features


# ============================================================================
# MODEL TRAINING
# ============================================================================

def train_model(X_train: pd.DataFrame, y_train: pd.Series) -> lgb.LGBMClassifier:
    """Train LightGBM mode classifier."""
    logger.info("\n" + "=" * 80)
    logger.info("ROAD-VS-RAIL MODE CLASSIFIER - TRAINING")
    logger.info("=" * 80)
    
    model = lgb.LGBMClassifier(
        num_leaves=15,
        max_depth=5,
        learning_rate=0.05,
        min_data_in_leaf=20,
        lambda_l1=0.1,
        lambda_l2=0.1,
        objective='binary',
        scale_pos_weight=1.5,  # Bias toward rail (class 1)
        n_estimators=150,
        random_state=RANDOM_SEED,
        verbose=-1,
    )
    
    logger.info(f"Training on {len(X_train)} samples...")
    model.fit(X_train, y_train)
    
    logger.info(f"✅ Model trained")
    return model


# ============================================================================
# MODEL EVALUATION
# ============================================================================

def evaluate_model(model: lgb.LGBMClassifier, X_test: pd.DataFrame, y_test: pd.Series) -> dict:
    """Evaluate mode classifier."""
    logger.info("\n" + "=" * 80)
    logger.info("ROAD-VS-RAIL MODE CLASSIFIER - EVALUATION")
    logger.info("=" * 80)
    
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    # Metrics
    accuracy = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_pred_proba)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    metrics = {
        'accuracy': accuracy,
        'auc': auc,
        'precision': precision,
        'recall': recall,
        'f1': f1,
    }
    
    # Print results
    logger.info(f"\nMetrics:")
    logger.info(f"  Accuracy: {accuracy:.4f}")
    logger.info(f"  AUC: {auc:.4f}")
    logger.info(f"  Precision: {precision:.4f}")
    logger.info(f"  Recall: {recall:.4f}")
    logger.info(f"  F1-Score: {f1:.4f}")
    
    # Thresholds
    accuracy_threshold_green = EVAL_THRESHOLDS['mode_accuracy_green']
    auc_threshold_green = EVAL_THRESHOLDS['mode_auc_green']
    
    if accuracy > accuracy_threshold_green:
        logger.info(f"  ✅ Accuracy {accuracy:.4f} > {accuracy_threshold_green} (GREEN)")
    else:
        logger.info(f"  ⚠️ Accuracy {accuracy:.4f} <= {accuracy_threshold_green} (YELLOW/RED)")
    
    if auc > auc_threshold_green:
        logger.info(f"  ✅ AUC {auc:.4f} > {auc_threshold_green} (GREEN)")
    else:
        logger.info(f"  ⚠️ AUC {auc:.4f} <= {auc_threshold_green} (YELLOW/RED)")
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    logger.info(f"\nConfusion Matrix:")
    logger.info(f"  TN (Road): {cm[0,0]}, FP: {cm[0,1]}")
    logger.info(f"  FN: {cm[1,0]}, TP (Rail): {cm[1,1]}")
    
    # Class distribution
    logger.info(f"\nClass Distribution:")
    logger.info(f"  Road (0): {(y_test == 0).sum()} ({(y_test == 0).sum()/len(y_test)*100:.1f}%)")
    logger.info(f"  Rail (1): {(y_test == 1).sum()} ({(y_test == 1).sum()/len(y_test)*100:.1f}%)")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': X_test.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    logger.info(f"\nTop 10 Features:")
    for idx, row in feature_importance.head(10).iterrows():
        logger.info(f"  {row['feature']}: {row['importance']:.4f}")
    
    return metrics


# ============================================================================
# MODEL SAVING
# ============================================================================

def save_model(model: lgb.LGBMClassifier, filepath: Path) -> None:
    """Save trained model."""
    logger.info("\n" + "=" * 80)
    logger.info("ROAD-VS-RAIL MODE CLASSIFIER - SAVING")
    logger.info("=" * 80)
    
    joblib.dump(model, filepath)
    logger.info(f"✅ Model saved to {filepath}")


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Main training pipeline."""
    logger.info("\n" + "=" * 80)
    logger.info("ROAD-VS-RAIL MODE CLASSIFIER - FULL PIPELINE")
    logger.info("=" * 80)
    
    # Load data
    df = load_data()
    
    # Preprocess
    df_clean = preprocess_data(df)
    
    # Feature engineering
    df_features = engineer_features(df_clean)
    
    # Select features (numeric only)
    feature_cols = [col for col in df_features.columns 
                   if col not in ['order_date', 'due_date', 'destination', 'material_type', 'priority',
                                 'quantity_tonnes', 'distance_km', 'estimated_rail_cost', 'estimated_road_cost',
                                 'available_rakes', 'transport_mode', 'route', 'date']
                   and df_features[col].dtype in ['float64', 'int64']]
    
    X = df_features[feature_cols]
    y = df_features['transport_mode']
    
    logger.info(f"\nFeatures: {len(feature_cols)}")
    logger.info(f"Samples: {len(X)}")
    logger.info(f"Class distribution: {y.value_counts().to_dict()}")
    
    # Time-series split (no data leakage)
    split_idx = int(len(X) * 0.80)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    logger.info(f"Train: {len(X_train)}, Test: {len(X_test)}")
    
    # Train model
    model = train_model(X_train, y_train)
    
    # Evaluate
    metrics = evaluate_model(model, X_test, y_test)
    
    # Save model
    save_model(model, MODEL_PATHS['mode_classifier'])
    
    logger.info("\n" + "=" * 80)
    logger.info("✅ ROAD-VS-RAIL MODE CLASSIFIER - COMPLETE")
    logger.info("=" * 80)


if __name__ == '__main__':
    main()
