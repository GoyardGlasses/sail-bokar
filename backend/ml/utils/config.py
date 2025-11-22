"""
Global configuration for ML training pipeline.
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.
"""

import os
from pathlib import Path

# ============================================================================
# PROJECT PATHS
# ============================================================================

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
ML_DIR = BACKEND_DIR / "ml"
SYNTHETIC_DIR = ML_DIR / "synthetic"
TRAIN_DIR = ML_DIR / "train"
MODELS_DIR = ML_DIR / "models"
UTILS_DIR = ML_DIR / "utils"

# Synthetic data paths
SYNTHETIC_RAW_DIR = SYNTHETIC_DIR / "raw"
SYNTHETIC_PROCESSED_DIR = SYNTHETIC_DIR / "processed"

# Create directories if they don't exist
MODELS_DIR.mkdir(parents=True, exist_ok=True)
SYNTHETIC_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================================
# DATA FILE PATHS
# ============================================================================

DATA_FILES = {
    'material_production': SYNTHETIC_RAW_DIR / 'material_production_daily.csv',
    'inventory_bsl': SYNTHETIC_RAW_DIR / 'inventory_bsl.csv',
    'customer_orders': SYNTHETIC_RAW_DIR / 'customer_orders.csv',
    'cmo_stockyard': SYNTHETIC_RAW_DIR / 'cmo_stockyard_inventory.csv',
    'empty_rakes': SYNTHETIC_RAW_DIR / 'empty_rake_arrivals.csv',
    'rake_dispatch': SYNTHETIC_RAW_DIR / 'rake_dispatch_history.csv',
    'loading_point': SYNTHETIC_RAW_DIR / 'loading_point_performance.csv',
    'route_congestion': SYNTHETIC_RAW_DIR / 'route_congestion_daily.csv',
    'road_transport': SYNTHETIC_RAW_DIR / 'road_transport_daily.csv',
    'cost_parameters': SYNTHETIC_RAW_DIR / 'cost_parameters_master.csv',
}

# ============================================================================
# MODEL SAVE PATHS
# ============================================================================

MODEL_PATHS = {
    'demand': MODELS_DIR / 'demand_model.pkl',
    'rake_availability': MODELS_DIR / 'rake_availability_model.pkl',
    'delay_classifier': MODELS_DIR / 'delay_classifier.pkl',
    'delay_regressor': MODELS_DIR / 'delay_regressor.pkl',
    'throughput': MODELS_DIR / 'throughput_model.pkl',
    'cost': MODELS_DIR / 'cost_model.pkl',
    'anomaly': MODELS_DIR / 'anomaly_model.pkl',
    'mode_classifier': MODELS_DIR / 'mode_classifier.pkl',
}

# ============================================================================
# DOMAIN CONSTANTS (FROM PHASE 0)
# ============================================================================

# Materials
MATERIALS = ['HR_Coils', 'CR_Coils', 'Plates', 'Wire_Rods', 'TMT_Bars', 'Pig_Iron', 'Billets']
MATERIAL_DISTRIBUTION = [0.25, 0.20, 0.15, 0.15, 0.15, 0.05, 0.05]

# Destinations / Stockyards
DESTINATIONS = ['Kolkata', 'Patna', 'Ranchi', 'Durgapur', 'Haldia']
DESTINATION_DISTRIBUTION = [0.35, 0.25, 0.20, 0.12, 0.08]

# Loading Points
LOADING_POINTS = ['LP1', 'LP2', 'LP3']

# Priorities
PRIORITIES = ['HIGH', 'MEDIUM', 'LOW']
PRIORITY_DISTRIBUTION = [0.20, 0.50, 0.30]

# Transport Modes
TRANSPORT_MODES = ['RAIL', 'ROAD']

# ============================================================================
# OPERATIONAL CONSTRAINTS (FROM PHASE 0)
# ============================================================================

# Rake specifications
MIN_RAKE_SIZE_WAGONS = 58
MAX_RAKE_SIZE_WAGONS = 59
WAGON_CAPACITY_TONNES = 63  # BOXN wagon
PARTIAL_RAKE_PENALTY_PERCENT = 20

# Loading points
LP_THROUGHPUT_RANGE = (300, 600)  # TPH
LP_CAPACITY_TONNES_PER_SHIFT = 1500

# Delays (hours)
DELAY_RANGES = {
    'Kolkata': (1, 3),
    'Patna': (1, 3),
    'Ranchi': (1, 2),
    'Durgapur': (1, 2),
    'Haldia': (3, 8),
}

# Haldia special case (high delay probability)
HALDIA_DELAY_PROBABILITY = 0.45  # 35-60% from PHASE 0

# Demurrage rates
DEMURRAGE_RATE_MIN = 150  # Rs per wagon per hour
DEMURRAGE_RATE_MAX = 250

# Freight rates (Rs per tonne)
RAIL_FREIGHT_RATE_MIN = 50
RAIL_FREIGHT_RATE_MAX = 80
ROAD_FREIGHT_RATE_MIN = 80
ROAD_FREIGHT_RATE_MAX = 150

# Truck specifications
TRUCK_CAPACITY_MIN = 18
TRUCK_CAPACITY_MAX = 25

# ============================================================================
# SEASONALITY & WEATHER (FROM PHASE 0)
# ============================================================================

# Seasonal factors
SEASONALITY_FACTORS = {
    1: 1.20,   # Jan - Peak
    2: 1.20,   # Feb - Peak
    3: 1.20,   # Mar - Peak
    4: 1.10,   # Apr
    5: 1.10,   # May
    6: 0.75,   # Jun - Monsoon
    7: 0.75,   # Jul - Monsoon
    8: 0.75,   # Aug - Monsoon
    9: 0.75,   # Sep - Monsoon
    10: 1.15,  # Oct - Peak
    11: 1.15,  # Nov - Peak
    12: 1.15,  # Dec - Peak
}

# Monsoon months
MONSOON_MONTHS = [6, 7, 8, 9]

# Peak season months (construction)
PEAK_SEASON_MONTHS = [10, 11, 12, 1, 2, 3]

# ============================================================================
# TRAINING PARAMETERS
# ============================================================================

# Train/test split
TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

# Time series embargo (days)
EMBARGO_DAYS = 7

# Cross-validation
CV_FOLDS = 4

# ============================================================================
# MODEL HYPERPARAMETERS (FROM PHASE 2.1)
# ============================================================================

# LightGBM defaults
LIGHTGBM_PARAMS = {
    'num_leaves': 31,
    'max_depth': 7,
    'learning_rate': 0.05,
    'min_data_in_leaf': 20,
    'lambda_l1': 0.1,
    'lambda_l2': 0.1,
    'verbose': -1,
}

# XGBoost defaults
XGBOOST_PARAMS = {
    'max_depth': 6,
    'learning_rate': 0.05,
    'n_estimators': 100,
    'subsample': 0.8,
    'colsample_bytree': 0.8,
    'verbosity': 0,
}

# IsolationForest defaults
ISOLATION_FOREST_PARAMS = {
    'contamination': 0.05,
    'n_estimators': 100,
    'random_state': 42,
}

# ============================================================================
# EVALUATION THRESHOLDS (FROM PHASE 2.1)
# ============================================================================

EVAL_THRESHOLDS = {
    'demand_mape_green': 0.15,
    'demand_mape_yellow': 0.20,
    'rake_mae_green': 1.5,
    'rake_mae_yellow': 2.5,
    'delay_mae_green': 2.0,
    'delay_mae_yellow': 3.0,
    'delay_auc_green': 0.80,
    'throughput_mae_green': 150,
    'throughput_mae_yellow': 250,
    'cost_mape_green': 0.10,
    'cost_mape_yellow': 0.15,
    'anomaly_precision_green': 0.80,
    'anomaly_recall_green': 0.70,
    'mode_accuracy_green': 0.85,
    'mode_auc_green': 0.90,
}

# ============================================================================
# LOGGING & DEBUGGING
# ============================================================================

LOG_LEVEL = 'INFO'
RANDOM_SEED = 42

# ============================================================================
# FEATURE ENGINEERING CONSTANTS
# ============================================================================

# Lag windows (days)
LAG_WINDOWS = [1, 7, 30]

# Rolling windows (days)
ROLLING_WINDOWS = [7, 30]

# Quantiles for anomaly detection
ANOMALY_QUANTILES = [0.05, 0.95]

print("Config loaded successfully")
