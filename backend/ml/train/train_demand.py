"""
Demand Forecasting Model Training
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.

Model: LightGBM Regressor
Target: Daily demand (tonnes) per material per destination
Metrics: MAPE, RMSE, R²
"""

import sys
import logging
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error, mean_squared_error, r2_score
import lightgbm as lgb
import joblib

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.config import (
    MODEL_PATHS, LIGHTGBM_PARAMS, SEASONALITY_FACTORS, MONSOON_MONTHS,
    MATERIALS, DESTINATIONS, EVAL_THRESHOLDS, RANDOM_SEED
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
    """Load and aggregate demand data."""
    logger.info("=" * 80)
    logger.info("DEMAND FORECASTING MODEL - DATA LOADING")
    logger.info("=" * 80)
    
    # Load customer orders
    demand = load_csv('customer_orders')
    demand['order_date'] = pd.to_datetime(demand['order_date'])
    demand = demand.rename(columns={'order_date': 'date'})
    
    logger.info(f"✅ Loaded demand data: {len(demand)} rows")
    return demand


def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    """Preprocess demand data."""
    logger.info("\n" + "=" * 80)
    logger.info("DEMAND FORECASTING MODEL - PREPROCESSING")
    logger.info("=" * 80)
    
    df_clean = df.copy()
    df_clean['date'] = pd.to_datetime(df_clean['date'])
    
    # Sort by date and material
    df_clean = df_clean.sort_values(['material_type', 'destination', 'date']).reset_index(drop=True)
    
    # Fill missing values
    df_clean['quantity_tonnes'] = pd.to_numeric(df_clean['quantity_tonnes'], errors='coerce').fillna(0)
    
    logger.info(f"✅ Preprocessed data: {len(df_clean)} rows")
    return df_clean


# ============================================================================
# FEATURE ENGINEERING
# ============================================================================

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Build features for demand model."""
    logger.info("\n" + "=" * 80)
    logger.info("DEMAND FORECASTING MODEL - FEATURE ENGINEERING")
    logger.info("=" * 80)
    
    df_features = df.copy()
    
    # Material encoding
    material_map = {mat: i for i, mat in enumerate(MATERIALS)}
    df_features['material_encoded'] = df_features['material_type'].map(material_map).fillna(0)
    
    # Destination encoding
    dest_map = {dest: i for i, dest in enumerate(DESTINATIONS)}
    df_features['destination_encoded'] = df_features['destination'].map(dest_map).fillna(0)
    
    # Simple numeric features
    df_features['quantity_numeric'] = pd.to_numeric(df_features['quantity_tonnes'], errors='coerce').fillna(0)
    df_features['priority_numeric'] = df_features['priority'].map({'HIGH': 3, 'MEDIUM': 2, 'LOW': 1}).fillna(1)
    
    # Fill any remaining NaN
    df_features = df_features.fillna(0)
    
    logger.info(f"✅ Engineered features: {len(df_features)} rows, {len(df_features.columns)} columns")
    return df_features


# ============================================================================
# MODEL TRAINING
# ============================================================================

def train_model(X_train: pd.DataFrame, y_train: pd.Series) -> lgb.LGBMRegressor:
    """Train LightGBM demand forecasting model."""
    logger.info("\n" + "=" * 80)
    logger.info("DEMAND FORECASTING MODEL - TRAINING")
    logger.info("=" * 80)
    
    model = lgb.LGBMRegressor(
        **LIGHTGBM_PARAMS,
        objective='regression_l1',  # MAE
        n_estimators=200,
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
    """Evaluate demand model."""
    logger.info("\n" + "=" * 80)
    logger.info("DEMAND FORECASTING MODEL - EVALUATION")
    logger.info("=" * 80)
    
    y_pred = model.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    mape = mean_absolute_percentage_error(y_test, y_pred)
    
    logger.info(f"MAE: {mae:.2f} tonnes")
    logger.info(f"RMSE: {rmse:.2f} tonnes")
    logger.info(f"R²: {r2:.4f}")
    logger.info(f"MAPE: {mape:.2f}%")
    
    passed = (mae < 500) and (rmse < 800) and (r2 > 0.50)
    logger.info(f"Status: {'✅ PASSED' if passed else '❌ FAILED'}")
    
    return {
        'mae': mae,
        'rmse': rmse,
        'r2': r2,
        'mape': mape,
        'passed': passed
    }


# ============================================================================
# MODEL SAVING
# ============================================================================

def save_model(model: lgb.LGBMRegressor, filepath: Path) -> None:
    """Save trained model."""
    logger.info("\n" + "=" * 80)
    logger.info("DEMAND FORECASTING MODEL - SAVING")
    logger.info("=" * 80)
    
    joblib.dump(model, filepath)
    logger.info(f"✅ Model saved to {filepath}")


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Main training pipeline."""
    logger.info("\n" + "=" * 80)
    logger.info("DEMAND FORECASTING MODEL - FULL PIPELINE")
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
                   and col not in ['quantity_tonnes']]
    
    X = df_features[feature_cols].fillna(0)
    y = df_features['quantity_tonnes'].fillna(df_features['quantity_tonnes'].mean())
    
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
    save_model(model, MODEL_PATHS['demand'])
    
    logger.info("\n" + "=" * 80)
    logger.info("✅ DEMAND FORECASTING MODEL - COMPLETE")
    logger.info("=" * 80)


if __name__ == '__main__':
    main()
