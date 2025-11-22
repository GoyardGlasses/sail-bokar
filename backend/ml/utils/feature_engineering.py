"""
Feature engineering utilities for ML models.
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.
"""

import pandas as pd
import numpy as np
from typing import List, Tuple
import logging

from .config import LAG_WINDOWS, ROLLING_WINDOWS, SEASONALITY_FACTORS, MONSOON_MONTHS

logger = logging.getLogger(__name__)

# ============================================================================
# LAG FEATURES
# ============================================================================

def build_lag_features(df: pd.DataFrame, target_col: str, windows: List[int] = None, group_by: str = None) -> pd.DataFrame:
    """
    Build lag features for time-series data.
    
    Args:
        df: Input dataframe (must be sorted by date)
        target_col: Column to lag
        windows: Lag windows in days (default from config)
        group_by: Column to group by before lagging (e.g., 'material_type')
    
    Returns:
        pd.DataFrame: Dataframe with lag features
    """
    if windows is None:
        windows = LAG_WINDOWS
    
    df_lags = df.copy()
    
    if group_by:
        for window in windows:
            df_lags[f'{target_col}_lag_{window}d'] = df_lags.groupby(group_by)[target_col].shift(window)
    else:
        for window in windows:
            df_lags[f'{target_col}_lag_{window}d'] = df_lags[target_col].shift(window)
    
    logger.info(f"✅ Built {len(windows)} lag features for {target_col}")
    return df_lags


# ============================================================================
# ROLLING STATISTICS
# ============================================================================

def build_rolling_features(df: pd.DataFrame, target_col: str, windows: List[int] = None, group_by: str = None) -> pd.DataFrame:
    """
    Build rolling statistics (mean, std, min, max).
    
    Args:
        df: Input dataframe (must be sorted by date)
        target_col: Column to compute rolling stats
        windows: Rolling windows in days (default from config)
        group_by: Column to group by before rolling
    
    Returns:
        pd.DataFrame: Dataframe with rolling features
    """
    if windows is None:
        windows = ROLLING_WINDOWS
    
    df_rolling = df.copy()
    
    for window in windows:
        if group_by:
            df_rolling[f'{target_col}_ma_{window}d'] = df_rolling.groupby(group_by)[target_col].transform(lambda x: x.rolling(window).mean())
            df_rolling[f'{target_col}_std_{window}d'] = df_rolling.groupby(group_by)[target_col].transform(lambda x: x.rolling(window).std())
            df_rolling[f'{target_col}_min_{window}d'] = df_rolling.groupby(group_by)[target_col].transform(lambda x: x.rolling(window).min())
            df_rolling[f'{target_col}_max_{window}d'] = df_rolling.groupby(group_by)[target_col].transform(lambda x: x.rolling(window).max())
        else:
            df_rolling[f'{target_col}_ma_{window}d'] = df_rolling[target_col].rolling(window).mean()
            df_rolling[f'{target_col}_std_{window}d'] = df_rolling[target_col].rolling(window).std()
            df_rolling[f'{target_col}_min_{window}d'] = df_rolling[target_col].rolling(window).min()
            df_rolling[f'{target_col}_max_{window}d'] = df_rolling[target_col].rolling(window).max()
    
    logger.info(f"✅ Built rolling statistics for {target_col} with {len(windows)} windows")
    return df_rolling


# ============================================================================
# CALENDAR FEATURES
# ============================================================================

def add_calendar_features(df: pd.DataFrame, date_col: str = 'date') -> pd.DataFrame:
    """
    Add calendar-based features.
    
    Args:
        df: Input dataframe
        date_col: Name of date column
    
    Returns:
        pd.DataFrame: Dataframe with calendar features
    """
    df_cal = df.copy()
    
    if date_col not in df_cal.columns:
        logger.warning(f"⚠️ Date column '{date_col}' not found")
        return df_cal
    
    df_cal[date_col] = pd.to_datetime(df_cal[date_col])
    
    # Basic calendar features
    df_cal['day_of_week'] = df_cal[date_col].dt.dayofweek  # 0=Mon, 6=Sun
    df_cal['day_of_month'] = df_cal[date_col].dt.day
    df_cal['month'] = df_cal[date_col].dt.month
    df_cal['quarter'] = df_cal[date_col].dt.quarter
    df_cal['week_of_year'] = df_cal[date_col].dt.isocalendar().week
    df_cal['is_month_start'] = df_cal[date_col].dt.is_month_start.astype(int)
    df_cal['is_month_end'] = df_cal[date_col].dt.is_month_end.astype(int)
    df_cal['is_quarter_start'] = df_cal[date_col].dt.is_quarter_start.astype(int)
    df_cal['is_quarter_end'] = df_cal[date_col].dt.is_quarter_end.astype(int)
    
    # Domain-specific calendar features
    df_cal['is_peak_season'] = df_cal['month'].isin([10, 11, 12, 1, 2, 3]).astype(int)
    df_cal['is_monsoon'] = df_cal['month'].isin(MONSOON_MONTHS).astype(int)
    
    # One-hot encode day of week
    dow_dummies = pd.get_dummies(df_cal['day_of_week'], prefix='dow', drop_first=False)
    df_cal = pd.concat([df_cal, dow_dummies], axis=1)
    
    # One-hot encode month
    month_dummies = pd.get_dummies(df_cal['month'], prefix='month', drop_first=False)
    df_cal = pd.concat([df_cal, month_dummies], axis=1)
    
    logger.info(f"✅ Added calendar features")
    return df_cal


# ============================================================================
# SEASONALITY FEATURES
# ============================================================================

def add_seasonality_factor(df: pd.DataFrame, date_col: str = 'date') -> pd.DataFrame:
    """
    Add seasonality multiplier based on month.
    
    Args:
        df: Input dataframe
        date_col: Name of date column
    
    Returns:
        pd.DataFrame: Dataframe with seasonality factor
    """
    df_season = df.copy()
    
    if date_col not in df_season.columns:
        logger.warning(f"⚠️ Date column '{date_col}' not found")
        return df_season
    
    df_season[date_col] = pd.to_datetime(df_season[date_col])
    df_season['seasonality_factor'] = df_season[date_col].dt.month.map(SEASONALITY_FACTORS)
    
    logger.info(f"✅ Added seasonality factor")
    return df_season


# ============================================================================
# CONGESTION FEATURES
# ============================================================================

def add_congestion_features(df: pd.DataFrame, congestion_col: str = 'congestion_level') -> pd.DataFrame:
    """
    Add congestion-derived features.
    
    Args:
        df: Input dataframe
        congestion_col: Name of congestion column
    
    Returns:
        pd.DataFrame: Dataframe with congestion features
    """
    df_cong = df.copy()
    
    if congestion_col not in df_cong.columns:
        logger.warning(f"⚠️ Congestion column '{congestion_col}' not found")
        return df_cong
    
    # Congestion categories
    df_cong['congestion_category'] = pd.cut(df_cong[congestion_col], 
                                             bins=[0, 0.3, 0.6, 1.0],
                                             labels=['low', 'medium', 'high'])
    
    # Congestion flags
    df_cong['is_high_congestion'] = (df_cong[congestion_col] > 0.6).astype(int)
    df_cong['is_extreme_congestion'] = (df_cong[congestion_col] > 0.8).astype(int)
    
    logger.info(f"✅ Added congestion features")
    return df_cong


# ============================================================================
# COST DIFFERENTIAL FEATURE
# ============================================================================

def add_cost_differential_feature(df: pd.DataFrame, rail_cost_col: str, road_cost_col: str) -> pd.DataFrame:
    """
    Add cost differential feature (road - rail) for mode classifier.
    
    Args:
        df: Input dataframe
        rail_cost_col: Name of rail cost column
        road_cost_col: Name of road cost column
    
    Returns:
        pd.DataFrame: Dataframe with cost differential
    """
    df_cost = df.copy()
    
    if rail_cost_col not in df_cost.columns or road_cost_col not in df_cost.columns:
        logger.warning(f"⚠️ Cost columns not found")
        return df_cost
    
    df_cost['cost_differential'] = df_cost[road_cost_col] - df_cost[rail_cost_col]
    df_cost['cost_ratio'] = df_cost[road_cost_col] / (df_cost[rail_cost_col] + 1e-6)
    
    logger.info(f"✅ Added cost differential features")
    return df_cost


# ============================================================================
# GROWTH RATE FEATURES
# ============================================================================

def add_growth_rate_features(df: pd.DataFrame, target_col: str, window: int = 7, group_by: str = None) -> pd.DataFrame:
    """
    Add growth rate features (% change over window).
    
    Args:
        df: Input dataframe
        target_col: Column to compute growth rate
        window: Window size in days
        group_by: Column to group by
    
    Returns:
        pd.DataFrame: Dataframe with growth rate features
    """
    df_growth = df.copy()
    
    if group_by:
        df_growth[f'{target_col}_growth_{window}d'] = df_growth.groupby(group_by)[target_col].pct_change(window)
    else:
        df_growth[f'{target_col}_growth_{window}d'] = df_growth[target_col].pct_change(window)
    
    logger.info(f"✅ Added growth rate feature for {target_col} (window={window}d)")
    return df_growth


# ============================================================================
# RATIO FEATURES
# ============================================================================

def add_ratio_features(df: pd.DataFrame, numerator_col: str, denominator_col: str, feature_name: str) -> pd.DataFrame:
    """
    Add ratio feature (numerator / denominator).
    
    Args:
        df: Input dataframe
        numerator_col: Numerator column
        denominator_col: Denominator column
        feature_name: Name for new feature
    
    Returns:
        pd.DataFrame: Dataframe with ratio feature
    """
    df_ratio = df.copy()
    
    if numerator_col not in df_ratio.columns or denominator_col not in df_ratio.columns:
        logger.warning(f"⚠️ Columns not found")
        return df_ratio
    
    df_ratio[feature_name] = df_ratio[numerator_col] / (df_ratio[denominator_col] + 1e-6)
    
    logger.info(f"✅ Added ratio feature: {feature_name}")
    return df_ratio


# ============================================================================
# INTERACTION FEATURES
# ============================================================================

def add_interaction_features(df: pd.DataFrame, col1: str, col2: str, feature_name: str = None) -> pd.DataFrame:
    """
    Add interaction feature (col1 * col2).
    
    Args:
        df: Input dataframe
        col1: First column
        col2: Second column
        feature_name: Name for new feature (default: col1_x_col2)
    
    Returns:
        pd.DataFrame: Dataframe with interaction feature
    """
    df_inter = df.copy()
    
    if col1 not in df_inter.columns or col2 not in df_inter.columns:
        logger.warning(f"⚠️ Columns not found")
        return df_inter
    
    if feature_name is None:
        feature_name = f'{col1}_x_{col2}'
    
    df_inter[feature_name] = df_inter[col1] * df_inter[col2]
    
    logger.info(f"✅ Added interaction feature: {feature_name}")
    return df_inter


# ============================================================================
# FEATURE SELECTION
# ============================================================================

def select_features(df: pd.DataFrame, exclude_cols: List[str] = None) -> List[str]:
    """
    Select numeric feature columns (exclude IDs, dates, targets).
    
    Args:
        df: Input dataframe
        exclude_cols: Columns to exclude
    
    Returns:
        List[str]: List of feature column names
    """
    if exclude_cols is None:
        exclude_cols = ['id', 'date', 'timestamp', 'target', 'label']
    
    features = [col for col in df.columns 
                if df[col].dtype in ['float64', 'int64'] 
                and col not in exclude_cols]
    
    logger.info(f"✅ Selected {len(features)} numeric features")
    return features


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    print("Feature engineering utilities loaded")
