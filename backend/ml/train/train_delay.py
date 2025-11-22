"""
Route Delay Prediction Model Training
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.

Models: 
- XGBoost Classifier (delay yes/no)
- XGBoost Regressor (delay hours)

Metrics: AUC (classifier), RMSE (regressor)
"""

import sys
import logging
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import (
    mean_squared_error, roc_auc_score, accuracy_score,
    confusion_matrix, classification_report, r2_score, mean_absolute_error
)
import xgboost as xgb
import joblib

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.config import (
    MODEL_PATHS, XGBOOST_PARAMS, SEASONALITY_FACTORS, MONSOON_MONTHS,
    EVAL_THRESHOLDS, RANDOM_SEED, DESTINATIONS
)
from utils.loaders import load_delay_data, load_csv
from utils.preprocess import (
    handle_missing_forward_fill, handle_missing_backward_fill,
    handle_missing_median, cap_outliers_percentile, 
    encode_categorical_label, validate_no_nulls
)
from utils.feature_engineering import (
    build_lag_features, build_rolling_features, add_calendar_features,
    add_seasonality_factor, add_congestion_features, select_features
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# DATA LOADING & PREPROCESSING
# ============================================================================

def load_data() -> pd.DataFrame:
    """Load and merge delay data with congestion."""
    logger.info("=" * 80)
    logger.info("ROUTE DELAY PREDICTION MODEL - DATA LOADING")
    logger.info("=" * 80)
    
    # Load dispatch history
    dispatch = load_csv('rake_dispatch')
    dispatch['date'] = pd.to_datetime(dispatch['date'])
    
    # Load route congestion
    congestion = load_csv('route_congestion')
    congestion['date'] = pd.to_datetime(congestion['date'])
    
    # Merge on route and date
    data = dispatch.merge(
        congestion[['date', 'route', 'congestion_level', 'weather_condition', 
                   'temperature_celsius', 'rainfall_mm', 'visibility_km']],
        on=['date', 'route'],
        how='left'
    )
    
    # Sort by date
    data = data.sort_values('date').reset_index(drop=True)
    
    logger.info(f"✅ Loaded delay data: {len(data)} rows")
    return data


def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    """Preprocess delay data."""
    logger.info("\n" + "=" * 80)
    logger.info("ROUTE DELAY PREDICTION MODEL - PREPROCESSING")
    logger.info("=" * 80)
    
    df_clean = df.copy()
    df_clean['date'] = pd.to_datetime(df_clean['date'])
    
    # Handle missing values
    numeric_cols = ['delay_hours', 'congestion_level', 'temperature_celsius', 'rainfall_mm', 'visibility_km']
    df_clean = handle_missing_forward_fill(df_clean, numeric_cols, max_fill=3)
    df_clean = handle_missing_backward_fill(df_clean, numeric_cols)
    df_clean = handle_missing_median(df_clean, numeric_cols)
    
    # Handle categorical missing
    df_clean['weather_condition'] = df_clean['weather_condition'].fillna('Clear')
    
    # Cap outliers
    df_clean = cap_outliers_percentile(df_clean, ['delay_hours'], lower=0.01, upper=0.99)
    
    # Validate
    validate_no_nulls(df_clean, ['date', 'route', 'delay_hours'])
    
    logger.info(f"✅ Preprocessed data: {len(df_clean)} rows")
    return df_clean


# ============================================================================
# FEATURE ENGINEERING
# ============================================================================

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Build features for delay model."""
    logger.info("\n" + "=" * 80)
    logger.info("ROUTE DELAY PREDICTION MODEL - FEATURE ENGINEERING")
    logger.info("=" * 80)
    
    df_features = df.copy()
    
    # Group by route for lag features
    for route in df_features['route'].unique():
        mask = df_features['route'] == route
        
        # Lag features
        df_features.loc[mask, 'delay_lag_1d'] = df_features.loc[mask, 'delay_hours'].shift(1)
        df_features.loc[mask, 'delay_lag_7d'] = df_features.loc[mask, 'delay_hours'].shift(7)
        
        # Rolling statistics
        df_features.loc[mask, 'delay_ma_7d'] = df_features.loc[mask, 'delay_hours'].rolling(7).mean()
        df_features.loc[mask, 'delay_std_7d'] = df_features.loc[mask, 'delay_hours'].rolling(7).std()
    
    # Calendar features
    df_features = add_calendar_features(df_features, 'date')
    
    # Seasonality factor
    df_features = add_seasonality_factor(df_features, 'date')
    
    # Congestion features
    df_features = add_congestion_features(df_features, 'congestion_level')
    
    # Weather encoding
    weather_map = {'Clear': 0, 'Rainy': 1, 'Foggy': 2, 'Stormy': 3}
    df_features['weather_encoded'] = df_features['weather_condition'].map(weather_map)
    
    # Route encoding
    route_map = {route: i for i, route in enumerate(df_features['route'].unique())}
    df_features['route_encoded'] = df_features['route'].map(route_map)
    
    # Haldia flag (high delay probability)
    df_features['is_haldia'] = (df_features['route'].str.contains('Haldia')).astype(int)
    
    # Congestion lag
    df_features['congestion_lag_1d'] = df_features['congestion_level'].shift(1)
    
    # Drop rows with NaN from lag/rolling features
    df_features = df_features.dropna(subset=['delay_lag_1d', 'delay_ma_7d'])
    
    logger.info(f"✅ Engineered features: {len(df_features)} rows, {len(df_features.columns)} columns")
    return df_features


# ============================================================================
# MODEL TRAINING - CLASSIFIER
# ============================================================================

def train_classifier(X_train: pd.DataFrame, y_train_binary: pd.Series) -> xgb.XGBClassifier:
    """Train XGBoost delay classifier."""
    logger.info("\n" + "=" * 80)
    logger.info("ROUTE DELAY PREDICTION - CLASSIFIER TRAINING")
    logger.info("=" * 80)
    
    model = xgb.XGBClassifier(
        max_depth=6,
        learning_rate=0.05,
        n_estimators=100,
        subsample=0.8,
        colsample_bytree=0.8,
        objective='binary:logistic',
        random_state=RANDOM_SEED,
        verbosity=0,
    )
    
    logger.info(f"Training classifier on {len(X_train)} samples...")
    model.fit(X_train, y_train_binary)
    
    logger.info(f"✅ Classifier trained")
    return model


# ============================================================================
# MODEL TRAINING - REGRESSOR
# ============================================================================

def train_regressor(X_train: pd.DataFrame, y_train_hours: pd.Series) -> xgb.XGBRegressor:
    """Train XGBoost delay regressor."""
    logger.info("\n" + "=" * 80)
    logger.info("ROUTE DELAY PREDICTION - REGRESSOR TRAINING")
    logger.info("=" * 80)
    
    model = xgb.XGBRegressor(
        max_depth=6,
        learning_rate=0.05,
        n_estimators=100,
        subsample=0.8,
        colsample_bytree=0.8,
        objective='reg:squarederror',
        random_state=RANDOM_SEED,
        verbosity=0,
    )
    
    logger.info(f"Training regressor on {len(X_train)} samples...")
    model.fit(X_train, y_train_hours)
    
    logger.info(f"✅ Regressor trained")
    return model


# ============================================================================
# MODEL EVALUATION - CLASSIFIER
# ============================================================================

def evaluate_classifier(model: xgb.XGBClassifier, X_test: pd.DataFrame, y_test_binary: pd.Series) -> dict:
    """Evaluate delay classifier."""
    logger.info("\n" + "=" * 80)
    logger.info("ROUTE DELAY PREDICTION - CLASSIFIER EVALUATION")
    logger.info("=" * 80)
    
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    # Metrics
    accuracy = accuracy_score(y_test_binary, y_pred)
    auc = roc_auc_score(y_test_binary, y_pred_proba)
    
    metrics = {
        'accuracy': accuracy,
        'auc': auc,
    }
    
    # Print results
    logger.info(f"\nClassifier Metrics:")
    logger.info(f"  Accuracy: {accuracy:.4f}")
    logger.info(f"  AUC: {auc:.4f}")
    
    # Threshold
    auc_threshold_green = EVAL_THRESHOLDS['delay_auc_green']
    
    if auc > auc_threshold_green:
        logger.info(f"  ✅ AUC {auc:.4f} > {auc_threshold_green} (GREEN)")
    else:
        logger.info(f"  ⚠️ AUC {auc:.4f} <= {auc_threshold_green} (YELLOW/RED)")
    
    # Confusion matrix
    cm = confusion_matrix(y_test_binary, y_pred)
    logger.info(f"\nConfusion Matrix:")
    logger.info(f"  TN: {cm[0,0]}, FP: {cm[0,1]}")
    logger.info(f"  FN: {cm[1,0]}, TP: {cm[1,1]}")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': X_test.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    logger.info(f"\nTop 10 Features (Classifier):")
    for idx, row in feature_importance.head(10).iterrows():
        logger.info(f"  {row['feature']}: {row['importance']:.4f}")
    
    return metrics


# ============================================================================
# MODEL EVALUATION - REGRESSOR
# ============================================================================

def evaluate_regressor(model: xgb.XGBRegressor, X_test: pd.DataFrame, y_test_hours: pd.Series) -> dict:
    """Evaluate delay regressor."""
    logger.info("\n" + "=" * 80)
    logger.info("ROUTE DELAY PREDICTION - REGRESSOR EVALUATION")
    logger.info("=" * 80)
    
    y_pred = model.predict(X_test)
    
    # Metrics
    mae = mean_absolute_error(y_test_hours, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test_hours, y_pred))
    r2 = r2_score(y_test_hours, y_pred)
    
    metrics = {
        'mae': mae,
        'rmse': rmse,
        'r2': r2,
    }
    
    # Print results
    logger.info(f"\nRegressor Metrics:")
    logger.info(f"  MAE: {mae:.2f} hours")
    logger.info(f"  RMSE: {rmse:.2f} hours")
    logger.info(f"  R²: {r2:.4f}")
    
    # Threshold
    mae_threshold_green = EVAL_THRESHOLDS['delay_mae_green']
    mae_threshold_yellow = EVAL_THRESHOLDS['delay_mae_yellow']
    
    if mae < mae_threshold_green:
        logger.info(f"  ✅ MAE {mae:.2f} < {mae_threshold_green} (GREEN)")
    elif mae < mae_threshold_yellow:
        logger.info(f"  ⚠️ MAE {mae:.2f} < {mae_threshold_yellow} (YELLOW)")
    else:
        logger.info(f"  ❌ MAE {mae:.2f} >= {mae_threshold_yellow} (RED)")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': X_test.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    logger.info(f"\nTop 10 Features (Regressor):")
    for idx, row in feature_importance.head(10).iterrows():
        logger.info(f"  {row['feature']}: {row['importance']:.4f}")
    
    return metrics


# ============================================================================
# MODEL SAVING
# ============================================================================

def save_models(classifier: xgb.XGBClassifier, regressor: xgb.XGBRegressor) -> None:
    """Save both trained models."""
    logger.info("\n" + "=" * 80)
    logger.info("ROUTE DELAY PREDICTION - SAVING MODELS")
    logger.info("=" * 80)
    
    joblib.dump(classifier, MODEL_PATHS['delay_classifier'])
    logger.info(f"✅ Classifier saved to {MODEL_PATHS['delay_classifier']}")
    
    joblib.dump(regressor, MODEL_PATHS['delay_regressor'])
    logger.info(f"✅ Regressor saved to {MODEL_PATHS['delay_regressor']}")


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Main training pipeline."""
    logger.info("\n" + "=" * 80)
    logger.info("ROUTE DELAY PREDICTION MODEL - FULL PIPELINE")
    logger.info("=" * 80)
    
    # Load data
    df = load_data()
    
    # Preprocess
    df_clean = preprocess_data(df)
    
    # Feature engineering
    df_features = engineer_features(df_clean)
    
    # Select features (numeric only)
    feature_cols = [col for col in df_features.columns 
                   if col not in ['date', 'route', 'delay_hours', 'weather_condition', 
                                 'congestion_level', 'temperature_celsius', 'rainfall_mm', 'visibility_km']
                   and df_features[col].dtype in ['float64', 'int64']]
    
    X = df_features[feature_cols]
    y = df_features['delay_hours']
    
    # Create binary target (delay > 2 hours)
    y_binary = (y > 2).astype(int)
    
    logger.info(f"\nFeatures: {len(feature_cols)}")
    logger.info(f"Samples: {len(X)}")
    logger.info(f"Delay distribution: {y_binary.value_counts().to_dict()}")
    
    # Time-series split (no data leakage)
    split_idx = int(len(X) * 0.80)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    y_train_binary, y_test_binary = y_binary[:split_idx], y_binary[split_idx:]
    
    logger.info(f"Train: {len(X_train)}, Test: {len(X_test)}")
    
    # Train classifier
    classifier = train_classifier(X_train, y_train_binary)
    
    # Train regressor
    regressor = train_regressor(X_train, y_train)
    
    # Evaluate classifier
    classifier_metrics = evaluate_classifier(classifier, X_test, y_test_binary)
    
    # Evaluate regressor
    regressor_metrics = evaluate_regressor(regressor, X_test, y_test)
    
    # Save models
    save_models(classifier, regressor)
    
    logger.info("\n" + "=" * 80)
    logger.info("✅ ROUTE DELAY PREDICTION MODEL - COMPLETE")
    logger.info("=" * 80)


if __name__ == '__main__':
    main()
