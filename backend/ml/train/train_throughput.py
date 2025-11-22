"""
Loading Point Throughput Prediction Model Training
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.

Model: LightGBM Regressor
Target: Throughput (TPH) at loading points
Metrics: MAE, RMSE, R²
"""

import sys
import logging
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import lightgbm as lgb
import joblib

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.config import (
    MODEL_PATHS, LIGHTGBM_PARAMS, SEASONALITY_FACTORS, MONSOON_MONTHS,
    LOADING_POINTS, EVAL_THRESHOLDS, RANDOM_SEED
)
from utils.loaders import load_throughput_data, load_csv
from utils.preprocess import (
    handle_missing_forward_fill, handle_missing_backward_fill,
    handle_missing_median, cap_outliers_percentile, validate_no_nulls
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
    """Load and aggregate throughput data."""
    logger.info("=" * 80)
    logger.info("LOADING POINT THROUGHPUT PREDICTION MODEL - DATA LOADING")
    logger.info("=" * 80)
    
    # Load loading point performance
    lp = load_csv('loading_point')
    lp['date'] = pd.to_datetime(lp['date'])
    
    # Load route congestion for external features
    congestion = load_csv('route_congestion')
    congestion['date'] = pd.to_datetime(congestion['date'])
    
    # Aggregate congestion across routes
    congestion_agg = congestion.groupby('date')['congestion_level'].mean().reset_index(name='avg_congestion')
    
    # Merge congestion
    data = lp.merge(congestion_agg, on='date', how='left')
    
    # Sort by date and loading point
    data = data.sort_values(['loading_point_id', 'date']).reset_index(drop=True)
    
    logger.info(f"✅ Loaded throughput data: {len(data)} rows")
    return data


def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    """Preprocess throughput data."""
    logger.info("\n" + "=" * 80)
    logger.info("LOADING POINT THROUGHPUT PREDICTION MODEL - PREPROCESSING")
    logger.info("=" * 80)
    
    df_clean = df.copy()
    df_clean['date'] = pd.to_datetime(df_clean['date'])
    
    # Handle missing values
    numeric_cols = ['tonnes_loaded', 'hours_operated', 'equipment_operational_count', 'avg_congestion']
    df_clean = handle_missing_forward_fill(df_clean, numeric_cols, max_fill=3)
    df_clean = handle_missing_backward_fill(df_clean, numeric_cols)
    df_clean = handle_missing_median(df_clean, numeric_cols)
    
    # Cap outliers (max throughput ~4500 TPH)
    df_clean = cap_outliers_percentile(df_clean, ['tonnes_loaded', 'hours_operated'], lower=0.01, upper=0.99)
    
    # Validate
    validate_no_nulls(df_clean, ['date', 'loading_point_id', 'tonnes_loaded'])
    
    logger.info(f"✅ Preprocessed data: {len(df_clean)} rows")
    return df_clean


# ============================================================================
# FEATURE ENGINEERING
# ============================================================================

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Build features for throughput model."""
    logger.info("\n" + "=" * 80)
    logger.info("LOADING POINT THROUGHPUT PREDICTION MODEL - FEATURE ENGINEERING")
    logger.info("=" * 80)
    
    df_features = df.copy()
    
    # Calculate throughput (TPH)
    df_features['throughput_tph'] = df_features['tonnes_loaded'] / (df_features['hours_operated'] + 1e-6)
    df_features['throughput_tph'] = df_features['throughput_tph'].clip(0, 4500)
    
    # Group by loading point for lag features
    for lp in df_features['loading_point_id'].unique():
        mask = df_features['loading_point_id'] == lp
        
        # Lag features
        df_features.loc[mask, 'throughput_lag_1d'] = df_features.loc[mask, 'throughput_tph'].shift(1)
        df_features.loc[mask, 'throughput_lag_7d'] = df_features.loc[mask, 'throughput_tph'].shift(7)
        
        # Rolling statistics
        df_features.loc[mask, 'throughput_ma_7d'] = df_features.loc[mask, 'throughput_tph'].rolling(7).mean()
        df_features.loc[mask, 'throughput_ma_30d'] = df_features.loc[mask, 'throughput_tph'].rolling(30).mean()
        df_features.loc[mask, 'throughput_std_7d'] = df_features.loc[mask, 'throughput_tph'].rolling(7).std()
    
    # Calendar features
    df_features = add_calendar_features(df_features, 'date')
    
    # Seasonality factor
    df_features = add_seasonality_factor(df_features, 'date')
    
    # Congestion features
    df_features = add_congestion_features(df_features, 'avg_congestion')
    
    # Equipment utilization
    df_features['equipment_utilization'] = df_features['equipment_operational_count'] / 3.0  # 3 equipment max
    
    # Loading point encoding
    lp_map = {lp: i for i, lp in enumerate(df_features['loading_point_id'].unique())}
    df_features['lp_encoded'] = df_features['loading_point_id'].map(lp_map)
    
    # Congestion lag
    df_features['congestion_lag_1d'] = df_features['avg_congestion'].shift(1)
    
    # Drop rows with NaN from lag/rolling features
    df_features = df_features.dropna(subset=['throughput_lag_1d', 'throughput_ma_7d'])
    
    logger.info(f"✅ Engineered features: {len(df_features)} rows, {len(df_features.columns)} columns")
    return df_features


# ============================================================================
# MODEL TRAINING
# ============================================================================

def train_model(X_train: pd.DataFrame, y_train: pd.Series) -> lgb.LGBMRegressor:
    """Train LightGBM throughput model."""
    logger.info("\n" + "=" * 80)
    logger.info("LOADING POINT THROUGHPUT PREDICTION MODEL - TRAINING")
    logger.info("=" * 80)
    
    model = lgb.LGBMRegressor(
        **LIGHTGBM_PARAMS,
        objective='regression_l1',  # MAE
        n_estimators=150,
        random_state=RANDOM_SEED,
    )
    
    logger.info(f"Training on {len(X_train)} samples...")
    model.fit(X_train, y_train)
    
    logger.info(f"✅ Model trained")
    return model


# ============================================================================
# MODEL EVALUATION
# ============================================================================

def evaluate_model(model: lgb.LGBMRegressor, X_test: pd.DataFrame, y_test: pd.Series) -> dict:
    """Evaluate throughput model."""
    logger.info("\n" + "=" * 80)
    logger.info("LOADING POINT THROUGHPUT PREDICTION MODEL - EVALUATION")
    logger.info("=" * 80)
    
    y_pred = model.predict(X_test)
    
    # Metrics
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    mape = np.mean(np.abs((y_test - y_pred) / (y_test + 1e-6))) * 100
    
    metrics = {
        'mae': mae,
        'rmse': rmse,
        'r2': r2,
        'mape': mape,
    }
    
    # Print results
    logger.info(f"\nMetrics:")
    logger.info(f"  MAE: {mae:.2f} TPH")
    logger.info(f"  RMSE: {rmse:.2f} TPH")
    logger.info(f"  MAPE: {mape:.2f}%")
    logger.info(f"  R²: {r2:.4f}")
    
    # Thresholds
    mae_threshold_green = EVAL_THRESHOLDS['throughput_mae_green']
    mae_threshold_yellow = EVAL_THRESHOLDS['throughput_mae_yellow']
    
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
    
    logger.info(f"\nTop 10 Features:")
    for idx, row in feature_importance.head(10).iterrows():
        logger.info(f"  {row['feature']}: {row['importance']:.4f}")
    
    return metrics


# ============================================================================
# MODEL SAVING
# ============================================================================

def save_model(model: lgb.LGBMRegressor, filepath: Path) -> None:
    """Save trained model."""
    logger.info("\n" + "=" * 80)
    logger.info("LOADING POINT THROUGHPUT PREDICTION MODEL - SAVING")
    logger.info("=" * 80)
    
    joblib.dump(model, filepath)
    logger.info(f"✅ Model saved to {filepath}")


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Main training pipeline."""
    logger.info("\n" + "=" * 80)
    logger.info("LOADING POINT THROUGHPUT PREDICTION MODEL - FULL PIPELINE")
    logger.info("=" * 80)
    
    # Load data
    df = load_data()
    
    # Preprocess
    df_clean = preprocess_data(df)
    
    # Feature engineering
    df_features = engineer_features(df_clean)
    
    # Select features
    feature_cols = [col for col in df_features.columns 
                   if col not in ['date', 'loading_point_id', 'tonnes_loaded', 'hours_operated', 
                                 'equipment_operational_count', 'avg_congestion', 'throughput_tph']]
    
    X = df_features[feature_cols]
    y = df_features['throughput_tph']
    
    logger.info(f"\nFeatures: {len(feature_cols)}")
    logger.info(f"Samples: {len(X)}")
    
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
    save_model(model, MODEL_PATHS['throughput'])
    
    logger.info("\n" + "=" * 80)
    logger.info("✅ LOADING POINT THROUGHPUT PREDICTION MODEL - COMPLETE")
    logger.info("=" * 80)


if __name__ == '__main__':
    main()
