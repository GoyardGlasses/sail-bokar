"""
ML Utilities Module
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.

Shared utilities for ML training and inference:
- config.py - Global configuration and constants
- loaders.py - Data loading utilities
- preprocess.py - Data preprocessing utilities
- feature_engineering.py - Feature engineering utilities
"""

from .config import (
    MODEL_PATHS,
    DATA_FILES,
    MATERIALS,
    DESTINATIONS,
    LOADING_POINTS,
    LIGHTGBM_PARAMS,
    XGBOOST_PARAMS,
    ISOLATION_FOREST_PARAMS,
)

from .loaders import (
    load_csv,
    load_multiple_tables,
    load_demand_data,
    load_rake_availability_data,
    load_delay_data,
    load_throughput_data,
    load_cost_data,
    load_anomaly_data,
    load_mode_classifier_data,
    check_data_files_exist,
)

from .preprocess import (
    handle_missing_forward_fill,
    handle_missing_backward_fill,
    handle_missing_median,
    handle_missing_zero,
    remove_outliers_iqr,
    cap_outliers_percentile,
    scale_standard,
    scale_minmax,
    encode_categorical_onehot,
    encode_categorical_label,
    apply_moving_average,
    validate_numeric_range,
    validate_no_nulls,
)

from .feature_engineering import (
    build_lag_features,
    build_rolling_features,
    add_calendar_features,
    add_seasonality_factor,
    add_congestion_features,
    add_cost_differential_feature,
    add_growth_rate_features,
    add_ratio_features,
    add_interaction_features,
    select_features,
)

__version__ = "1.0.0"
__author__ = "SAIL Bokaro AI Team"

__all__ = [
    # Config
    'MODEL_PATHS',
    'DATA_FILES',
    'MATERIALS',
    'DESTINATIONS',
    'LOADING_POINTS',
    'LIGHTGBM_PARAMS',
    'XGBOOST_PARAMS',
    'ISOLATION_FOREST_PARAMS',
    
    # Loaders
    'load_csv',
    'load_multiple_tables',
    'load_demand_data',
    'load_rake_availability_data',
    'load_delay_data',
    'load_throughput_data',
    'load_cost_data',
    'load_anomaly_data',
    'load_mode_classifier_data',
    'check_data_files_exist',
    
    # Preprocess
    'handle_missing_forward_fill',
    'handle_missing_backward_fill',
    'handle_missing_median',
    'handle_missing_zero',
    'remove_outliers_iqr',
    'cap_outliers_percentile',
    'scale_standard',
    'scale_minmax',
    'encode_categorical_onehot',
    'encode_categorical_label',
    'apply_moving_average',
    'validate_numeric_range',
    'validate_no_nulls',
    
    # Feature Engineering
    'build_lag_features',
    'build_rolling_features',
    'add_calendar_features',
    'add_seasonality_factor',
    'add_congestion_features',
    'add_cost_differential_feature',
    'add_growth_rate_features',
    'add_ratio_features',
    'add_interaction_features',
    'select_features',
]

print(f"ML Utilities Module v{__version__} loaded")
