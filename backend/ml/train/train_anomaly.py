"""
Anomaly Detection Model Training
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.

Model: IsolationForest (unsupervised)
Target: Anomaly score
Metrics: Anomaly score distribution, precision, recall
"""

import sys
import logging
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.config import (
    MODEL_PATHS, ISOLATION_FOREST_PARAMS, SEASONALITY_FACTORS, MONSOON_MONTHS,
    EVAL_THRESHOLDS, RANDOM_SEED
)
from utils.loaders import load_anomaly_data, load_csv
from utils.preprocess import (
    handle_missing_forward_fill, handle_missing_backward_fill,
    handle_missing_median, cap_outliers_percentile, scale_standard, validate_no_nulls
)
from utils.feature_engineering import (
    build_lag_features, build_rolling_features, add_calendar_features,
    add_seasonality_factor, select_features
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# DATA LOADING & PREPROCESSING
# ============================================================================

def load_data() -> pd.DataFrame:
    """Load and merge anomaly detection data."""
    logger.info("=" * 80)
    logger.info("ANOMALY DETECTION MODEL - DATA LOADING")
    logger.info("=" * 80)
    
    # Load all three data sources
    data_dict = load_anomaly_data()
    lp = data_dict['loading_point']
    congestion = data_dict['congestion']
    inventory = data_dict['inventory']
    
    # Aggregate loading point data by date
    lp_agg = lp.groupby('date').agg({
        'tonnes_loaded': 'sum',
        'hours_operated': 'mean',
        'equipment_operational_count': 'mean'
    }).reset_index()
    lp_agg['throughput_tph'] = lp_agg['tonnes_loaded'] / (lp_agg['hours_operated'] + 1e-6)
    
    # Aggregate congestion by date
    congestion_agg = congestion.groupby('date').agg({
        'congestion_level': 'mean',
        'delay_hours': 'mean'
    }).reset_index()
    
    # Aggregate inventory by date
    inventory_agg = inventory.groupby('date')['closing_stock_tonnes'].sum().reset_index()
    
    # Merge all three
    data = lp_agg.merge(congestion_agg, on='date', how='left')
    data = data.merge(inventory_agg, on='date', how='left')
    
    # Sort by date
    data = data.sort_values('date').reset_index(drop=True)
    
    logger.info(f"✅ Loaded anomaly data: {len(data)} rows")
    return data


def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    """Preprocess anomaly data."""
    logger.info("\n" + "=" * 80)
    logger.info("ANOMALY DETECTION MODEL - PREPROCESSING")
    logger.info("=" * 80)
    
    df_clean = df.copy()
    df_clean['date'] = pd.to_datetime(df_clean['date'])
    
    # Handle missing values
    numeric_cols = ['tonnes_loaded', 'hours_operated', 'equipment_operational_count',
                   'throughput_tph', 'congestion_level', 'delay_hours', 'closing_stock_tonnes']
    df_clean = handle_missing_forward_fill(df_clean, numeric_cols, max_fill=3)
    df_clean = handle_missing_backward_fill(df_clean, numeric_cols)
    df_clean = handle_missing_median(df_clean, numeric_cols)
    
    # Cap outliers
    df_clean = cap_outliers_percentile(df_clean, numeric_cols, lower=0.01, upper=0.99)
    
    # Validate
    validate_no_nulls(df_clean, ['date', 'throughput_tph'])
    
    logger.info(f"✅ Preprocessed data: {len(df_clean)} rows")
    return df_clean


# ============================================================================
# FEATURE ENGINEERING
# ============================================================================

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Build features for anomaly detection."""
    logger.info("\n" + "=" * 80)
    logger.info("ANOMALY DETECTION MODEL - FEATURE ENGINEERING")
    logger.info("=" * 80)
    
    df_features = df.copy()
    
    # Z-scores for key metrics
    df_features['throughput_zscore'] = (df_features['throughput_tph'] - df_features['throughput_tph'].mean()) / (df_features['throughput_tph'].std() + 1e-6)
    df_features['delay_zscore'] = (df_features['delay_hours'] - df_features['delay_hours'].mean()) / (df_features['delay_hours'].std() + 1e-6)
    df_features['stock_zscore'] = (df_features['closing_stock_tonnes'] - df_features['closing_stock_tonnes'].mean()) / (df_features['closing_stock_tonnes'].std() + 1e-6)
    
    # Deviations from moving average
    df_features['throughput_ma_7d'] = df_features['throughput_tph'].rolling(7).mean()
    df_features['throughput_deviation'] = df_features['throughput_tph'] - df_features['throughput_ma_7d']
    
    df_features['delay_ma_7d'] = df_features['delay_hours'].rolling(7).mean()
    df_features['delay_deviation'] = df_features['delay_hours'] - df_features['delay_ma_7d']
    
    df_features['stock_ma_7d'] = df_features['closing_stock_tonnes'].rolling(7).mean()
    df_features['stock_deviation'] = df_features['closing_stock_tonnes'] - df_features['stock_ma_7d']
    
    # Growth rates
    df_features['throughput_growth_7d'] = df_features['throughput_tph'].pct_change(7)
    df_features['stock_growth_7d'] = df_features['closing_stock_tonnes'].pct_change(7)
    
    # Stock cover ratio (days of stock)
    daily_demand = df_features['tonnes_loaded'].rolling(7).mean()
    df_features['stock_cover_days'] = df_features['closing_stock_tonnes'] / (daily_demand + 1e-6)
    
    # Congestion spike
    df_features['congestion_ma_7d'] = df_features['congestion_level'].rolling(7).mean()
    df_features['congestion_spike'] = df_features['congestion_level'] - df_features['congestion_ma_7d']
    
    # Calendar features
    df_features = add_calendar_features(df_features, 'date')
    
    # Seasonality factor
    df_features = add_seasonality_factor(df_features, 'date')
    
    # Drop rows with NaN from rolling features
    df_features = df_features.dropna(subset=['throughput_deviation', 'delay_deviation', 'stock_deviation'])
    
    logger.info(f"✅ Engineered features: {len(df_features)} rows, {len(df_features.columns)} columns")
    return df_features


# ============================================================================
# MODEL TRAINING
# ============================================================================

def train_model(X_train: pd.DataFrame) -> tuple:
    """Train IsolationForest anomaly detection model."""
    logger.info("\n" + "=" * 80)
    logger.info("ANOMALY DETECTION MODEL - TRAINING")
    logger.info("=" * 80)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    
    # Train IsolationForest
    model = IsolationForest(
        **ISOLATION_FOREST_PARAMS,
        random_state=RANDOM_SEED,
    )
    
    logger.info(f"Training on {len(X_train)} samples...")
    model.fit(X_train_scaled)
    
    logger.info(f"✅ Model trained")
    return model, scaler


# ============================================================================
# MODEL EVALUATION
# ============================================================================

def evaluate_model(model: IsolationForest, scaler: StandardScaler, X_test: pd.DataFrame) -> dict:
    """Evaluate anomaly detection model."""
    logger.info("\n" + "=" * 80)
    logger.info("ANOMALY DETECTION MODEL - EVALUATION")
    logger.info("=" * 80)
    
    # Scale test data
    X_test_scaled = scaler.transform(X_test)
    
    # Get anomaly scores
    anomaly_scores = model.score_samples(X_test_scaled)
    predictions = model.predict(X_test_scaled)  # -1 for anomalies, 1 for normal
    
    # Convert to binary (0=normal, 1=anomaly)
    anomaly_binary = (predictions == -1).astype(int)
    
    # Statistics
    n_anomalies = anomaly_binary.sum()
    n_normal = (anomaly_binary == 0).sum()
    anomaly_rate = n_anomalies / len(anomaly_binary) * 100
    
    metrics = {
        'n_anomalies': n_anomalies,
        'n_normal': n_normal,
        'anomaly_rate': anomaly_rate,
        'mean_anomaly_score': anomaly_scores.mean(),
        'std_anomaly_score': anomaly_scores.std(),
        'min_anomaly_score': anomaly_scores.min(),
        'max_anomaly_score': anomaly_scores.max(),
    }
    
    # Print results
    logger.info(f"\nMetrics:")
    logger.info(f"  Total samples: {len(anomaly_binary)}")
    logger.info(f"  Anomalies detected: {n_anomalies} ({anomaly_rate:.2f}%)")
    logger.info(f"  Normal samples: {n_normal} ({100-anomaly_rate:.2f}%)")
    logger.info(f"\nAnomaly Score Distribution:")
    logger.info(f"  Mean: {anomaly_scores.mean():.4f}")
    logger.info(f"  Std Dev: {anomaly_scores.std():.4f}")
    logger.info(f"  Min: {anomaly_scores.min():.4f}")
    logger.info(f"  Max: {anomaly_scores.max():.4f}")
    logger.info(f"  Median: {np.median(anomaly_scores):.4f}")
    
    # Percentiles
    logger.info(f"\nPercentiles:")
    for p in [5, 25, 50, 75, 95]:
        logger.info(f"  {p}th: {np.percentile(anomaly_scores, p):.4f}")
    
    # Top anomalies
    top_anomaly_indices = np.argsort(anomaly_scores)[:10]
    logger.info(f"\nTop 10 Anomalies (lowest scores):")
    for i, idx in enumerate(top_anomaly_indices, 1):
        logger.info(f"  {i}. Index {idx}: Score {anomaly_scores[idx]:.4f}")
    
    return metrics


# ============================================================================
# MODEL SAVING
# ============================================================================

def save_model(model: IsolationForest, scaler: StandardScaler, filepath: Path) -> None:
    """Save trained model and scaler."""
    logger.info("\n" + "=" * 80)
    logger.info("ANOMALY DETECTION MODEL - SAVING")
    logger.info("=" * 80)
    
    # Save model and scaler as tuple
    model_package = {'model': model, 'scaler': scaler}
    joblib.dump(model_package, filepath)
    logger.info(f"✅ Model and scaler saved to {filepath}")


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Main training pipeline."""
    logger.info("\n" + "=" * 80)
    logger.info("ANOMALY DETECTION MODEL - FULL PIPELINE")
    logger.info("=" * 80)
    
    # Load data
    df = load_data()
    
    # Preprocess
    df_clean = preprocess_data(df)
    
    # Feature engineering
    df_features = engineer_features(df_clean)
    
    # Select features (numeric only)
    feature_cols = [col for col in df_features.columns 
                   if df_features[col].dtype in ['float64', 'int64']]
    
    X = df_features[feature_cols]
    
    # Remove rows with NaN
    X = X.dropna()
    
    logger.info(f"\nFeatures: {len(feature_cols)}")
    logger.info(f"Samples: {len(X)}")
    
    # Time-series split (no data leakage)
    split_idx = int(len(X) * 0.80)
    X_train = X.iloc[:split_idx]
    X_test = X.iloc[split_idx:]
    
    logger.info(f"Train: {len(X_train)}, Test: {len(X_test)}")
    
    # Train model
    model, scaler = train_model(X_train)
    
    # Evaluate
    metrics = evaluate_model(model, scaler, X_test)
    
    # Save model
    save_model(model, scaler, MODEL_PATHS['anomaly'])
    
    logger.info("\n" + "=" * 80)
    logger.info("✅ ANOMALY DETECTION MODEL - COMPLETE")
    logger.info("=" * 80)


if __name__ == '__main__':
    main()
