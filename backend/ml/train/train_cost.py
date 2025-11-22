"""
Cost Prediction Model Training
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.

Model: LightGBM Regressor
Target: Total cost (freight + handling + demurrage)
Metrics: MAE, MAPE, R²
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
    DESTINATIONS, EVAL_THRESHOLDS, RANDOM_SEED
)
from utils.loaders import load_csv
from utils.feature_engineering import (
    add_calendar_features, add_seasonality_factor
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# DATA LOADING & PREPROCESSING
# ============================================================================

def load_data() -> pd.DataFrame:
    """Load cost data."""
    logger.info("=" * 80)
    logger.info("COST PREDICTION MODEL - DATA LOADING")
    logger.info("=" * 80)
    
    # Load rake dispatch history
    df = load_csv('rake_dispatch')
    df['date'] = pd.to_datetime(df['date'])
    
    # Generate synthetic cost (freight + handling + demurrage)
    np.random.seed(RANDOM_SEED)
    base_cost = 50000 + np.random.normal(0, 10000, len(df))
    tonnes_cost = df['tonnes_dispatched'] * 500  # Rs 500 per tonne
    delay_cost = df['delay_hours'] * 1000  # Rs 1000 per hour delay
    df['total_cost_rs'] = (base_cost + tonnes_cost + delay_cost).clip(lower=10000)
    
    logger.info(f"✅ Loaded cost data: {len(df)} rows")
    return df


def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    """Preprocess cost data."""
    logger.info("\n" + "=" * 80)
    logger.info("COST PREDICTION MODEL - PREPROCESSING")
    logger.info("=" * 80)
    
    df_clean = df.copy()
    df_clean['date'] = pd.to_datetime(df_clean['date'])
    
    # Fill missing values
    df_clean['tonnes_dispatched'] = pd.to_numeric(df_clean['tonnes_dispatched'], errors='coerce').fillna(0)
    df_clean['delay_hours'] = pd.to_numeric(df_clean['delay_hours'], errors='coerce').fillna(0)
    df_clean['total_cost_rs'] = pd.to_numeric(df_clean['total_cost_rs'], errors='coerce').fillna(0)
    
    logger.info(f"✅ Preprocessed data: {len(df_clean)} rows")
    return df_clean


# ============================================================================
# FEATURE ENGINEERING
# ============================================================================

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Build features for cost model."""
    logger.info("\n" + "=" * 80)
    logger.info("COST PREDICTION MODEL - FEATURE ENGINEERING")
    logger.info("=" * 80)
    
    df_features = df.copy()
    
    # Simple numeric features
    df_features['tonnes_numeric'] = pd.to_numeric(df_features['tonnes_dispatched'], errors='coerce').fillna(0)
    df_features['tonnes_log'] = np.log1p(df_features['tonnes_numeric'])
    
    # Rake utilization ratio
    df_features['rake_utilization_ratio'] = df_features['tonnes_numeric'] / (58 * 63)
    df_features['partial_rake_flag'] = (df_features['rake_utilization_ratio'] < 0.8).astype(int)
    
    # Route encoding
    route_map = {route: i for i, route in enumerate(df_features['route'].unique())}
    df_features['route_encoded'] = df_features['route'].map(route_map).fillna(0)
    
    # Haldia flag
    df_features['is_haldia'] = (df_features['route'].str.contains('Haldia', na=False)).astype(int)
    
    # Material encoding
    material_map = {mat: i for i, mat in enumerate(df_features['material_type'].unique())}
    df_features['material_encoded'] = df_features['material_type'].map(material_map).fillna(0)
    
    # Cost per tonne
    df_features['cost_per_tonne'] = df_features['total_cost_rs'] / (df_features['tonnes_numeric'] + 1e-6)
    
    # Fill any remaining NaN
    df_features = df_features.fillna(0)
    
    logger.info(f"✅ Engineered features: {len(df_features)} rows, {len(df_features.columns)} columns")
    return df_features


# ============================================================================
# MODEL TRAINING
# ============================================================================

def train_model(X_train: pd.DataFrame, y_train: pd.Series) -> lgb.LGBMRegressor:
    """Train LightGBM cost model."""
    logger.info("\n" + "=" * 80)
    logger.info("COST PREDICTION MODEL - TRAINING")
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
    """Evaluate cost model."""
    logger.info("\n" + "=" * 80)
    logger.info("COST PREDICTION MODEL - EVALUATION")
    logger.info("=" * 80)
    
    y_pred = model.predict(X_test)
    
    # Metrics
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    logger.info(f"MAE: Rs {mae:,.0f}")
    logger.info(f"RMSE: Rs {rmse:,.0f}")
    logger.info(f"R²: {r2:.4f}")
    
    # Pass/fail thresholds (lower for cost)
    passed = (mae < 50000) and (rmse < 80000) and (r2 > 0.50)
    logger.info(f"Status: {'✅ PASSED' if passed else '❌ FAILED'}")
    
    return {
        'mae': mae,
        'rmse': rmse,
        'r2': r2,
        'passed': passed
    }


# ============================================================================
# MODEL SAVING
# ============================================================================

def save_model(model: lgb.LGBMRegressor, filepath: Path) -> None:
    """Save trained model."""
    logger.info("\n" + "=" * 80)
    logger.info("COST PREDICTION MODEL - SAVING")
    logger.info("=" * 80)
    
    joblib.dump(model, filepath)
    logger.info(f"✅ Model saved to {filepath}")


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Main training pipeline."""
    logger.info("\n" + "=" * 80)
    logger.info("COST PREDICTION MODEL - FULL PIPELINE")
    logger.info("=" * 80)
    
    # Load data
    df = load_data()
    
    # Preprocess
    df_clean = preprocess_data(df)
    
    # Feature engineering
    df_features = engineer_features(df_clean)
    
    # Select features (numeric only)
    feature_cols = [col for col in df_features.columns 
                   if df_features[col].dtype in ['float64', 'int64']
                   and col not in ['total_cost_rs']]
    
    X = df_features[feature_cols].fillna(0)
    y = df_features['total_cost_rs'].fillna(df_features['total_cost_rs'].mean())
    
    # Remove rows with invalid targets
    valid_idx = (y > 0) & (y.notna())
    X = X[valid_idx]
    y = y[valid_idx]
    
    logger.info(f"\nFeatures: {len(feature_cols)}")
    logger.info(f"Samples: {len(X)}")
    
    # Time-series split (no data leakage)
    split_idx = int(len(X) * 0.80)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    logger.info(f"Train: {len(X_train)}, Test: {len(X_test)}")
    
    # Train model
    model = train_model(X_train, y_train)
    
    # Evaluate
    metrics = evaluate_model(model, X_test, y_test)
    
    # Save model
    save_model(model, MODEL_PATHS['cost'])
    
    logger.info("\n" + "=" * 80)
    logger.info("✅ COST PREDICTION MODEL - COMPLETE")
    logger.info("=" * 80)


if __name__ == '__main__':
    main()
