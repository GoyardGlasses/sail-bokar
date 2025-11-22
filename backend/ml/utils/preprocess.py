"""
Data preprocessing utilities.
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder
from typing import Tuple, List, Dict
import logging

logger = logging.getLogger(__name__)

# ============================================================================
# MISSING VALUE HANDLING
# ============================================================================

def handle_missing_forward_fill(df: pd.DataFrame, columns: List[str], max_fill: int = 3) -> pd.DataFrame:
    """
    Forward-fill missing values with optional max fill limit.
    
    Args:
        df: Input dataframe
        columns: Columns to fill
        max_fill: Maximum consecutive fills
    
    Returns:
        pd.DataFrame: Dataframe with filled values
    """
    df_filled = df.copy()
    
    for col in columns:
        if col in df_filled.columns:
            df_filled[col] = df_filled[col].fillna(method='ffill', limit=max_fill)
    
    logger.info(f"✅ Forward-filled {len(columns)} columns with max_fill={max_fill}")
    return df_filled


def handle_missing_backward_fill(df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
    """Backward-fill missing values."""
    df_filled = df.copy()
    
    for col in columns:
        if col in df_filled.columns:
            df_filled[col] = df_filled[col].fillna(method='bfill')
    
    logger.info(f"✅ Backward-filled {len(columns)} columns")
    return df_filled


def handle_missing_median(df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
    """Fill missing values with median."""
    df_filled = df.copy()
    
    for col in columns:
        if col in df_filled.columns:
            median_val = df_filled[col].median()
            df_filled[col] = df_filled[col].fillna(median_val)
    
    logger.info(f"✅ Filled {len(columns)} columns with median")
    return df_filled


def handle_missing_zero(df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
    """Fill missing values with zero."""
    df_filled = df.copy()
    
    for col in columns:
        if col in df_filled.columns:
            df_filled[col] = df_filled[col].fillna(0)
    
    logger.info(f"✅ Filled {len(columns)} columns with zero")
    return df_filled


# ============================================================================
# OUTLIER HANDLING
# ============================================================================

def remove_outliers_iqr(df: pd.DataFrame, columns: List[str], multiplier: float = 1.5) -> pd.DataFrame:
    """
    Remove outliers using IQR method.
    
    Args:
        df: Input dataframe
        columns: Columns to check
        multiplier: IQR multiplier (default 1.5 for standard outliers)
    
    Returns:
        pd.DataFrame: Dataframe with outliers removed
    """
    df_clean = df.copy()
    
    for col in columns:
        if col in df_clean.columns:
            Q1 = df_clean[col].quantile(0.25)
            Q3 = df_clean[col].quantile(0.75)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - multiplier * IQR
            upper_bound = Q3 + multiplier * IQR
            
            before = len(df_clean)
            df_clean = df_clean[(df_clean[col] >= lower_bound) & (df_clean[col] <= upper_bound)]
            after = len(df_clean)
            
            logger.info(f"  {col}: Removed {before - after} outliers")
    
    logger.info(f"✅ Removed outliers from {len(columns)} columns")
    return df_clean


def cap_outliers_percentile(df: pd.DataFrame, columns: List[str], lower: float = 0.01, upper: float = 0.99) -> pd.DataFrame:
    """
    Cap outliers at percentile values.
    
    Args:
        df: Input dataframe
        columns: Columns to cap
        lower: Lower percentile (default 1%)
        upper: Upper percentile (default 99%)
    
    Returns:
        pd.DataFrame: Dataframe with capped values
    """
    df_capped = df.copy()
    
    for col in columns:
        if col in df_capped.columns:
            lower_val = df_capped[col].quantile(lower)
            upper_val = df_capped[col].quantile(upper)
            df_capped[col] = df_capped[col].clip(lower=lower_val, upper=upper_val)
    
    logger.info(f"✅ Capped outliers in {len(columns)} columns at {lower*100:.0f}% and {upper*100:.0f}%")
    return df_capped


# ============================================================================
# SCALING & NORMALIZATION
# ============================================================================

def scale_standard(df: pd.DataFrame, columns: List[str], scaler: StandardScaler = None) -> Tuple[pd.DataFrame, StandardScaler]:
    """
    StandardScaler (mean=0, std=1).
    
    Args:
        df: Input dataframe
        columns: Columns to scale
        scaler: Pre-fitted scaler (for test data)
    
    Returns:
        Tuple[pd.DataFrame, StandardScaler]: Scaled dataframe and fitted scaler
    """
    df_scaled = df.copy()
    
    if scaler is None:
        scaler = StandardScaler()
        df_scaled[columns] = scaler.fit_transform(df[columns])
    else:
        df_scaled[columns] = scaler.transform(df[columns])
    
    logger.info(f"✅ StandardScaled {len(columns)} columns")
    return df_scaled, scaler


def scale_minmax(df: pd.DataFrame, columns: List[str], scaler: MinMaxScaler = None) -> Tuple[pd.DataFrame, MinMaxScaler]:
    """
    MinMaxScaler (0 to 1).
    
    Args:
        df: Input dataframe
        columns: Columns to scale
        scaler: Pre-fitted scaler (for test data)
    
    Returns:
        Tuple[pd.DataFrame, MinMaxScaler]: Scaled dataframe and fitted scaler
    """
    df_scaled = df.copy()
    
    if scaler is None:
        scaler = MinMaxScaler()
        df_scaled[columns] = scaler.fit_transform(df[columns])
    else:
        df_scaled[columns] = scaler.transform(df[columns])
    
    logger.info(f"✅ MinMaxScaled {len(columns)} columns")
    return df_scaled, scaler


# ============================================================================
# CATEGORICAL ENCODING
# ============================================================================

def encode_categorical_onehot(df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
    """
    One-hot encode categorical columns.
    
    Args:
        df: Input dataframe
        columns: Columns to encode
    
    Returns:
        pd.DataFrame: Dataframe with one-hot encoded columns
    """
    df_encoded = pd.get_dummies(df, columns=columns, drop_first=False)
    
    logger.info(f"✅ One-hot encoded {len(columns)} categorical columns")
    return df_encoded


def encode_categorical_label(df: pd.DataFrame, columns: List[str], encoders: Dict[str, LabelEncoder] = None) -> Tuple[pd.DataFrame, Dict[str, LabelEncoder]]:
    """
    Label encode categorical columns.
    
    Args:
        df: Input dataframe
        columns: Columns to encode
        encoders: Pre-fitted encoders (for test data)
    
    Returns:
        Tuple[pd.DataFrame, Dict]: Encoded dataframe and fitted encoders
    """
    df_encoded = df.copy()
    
    if encoders is None:
        encoders = {}
        for col in columns:
            if col in df_encoded.columns:
                le = LabelEncoder()
                df_encoded[col] = le.fit_transform(df_encoded[col].astype(str))
                encoders[col] = le
    else:
        for col in columns:
            if col in df_encoded.columns:
                df_encoded[col] = encoders[col].transform(df_encoded[col].astype(str))
    
    logger.info(f"✅ Label encoded {len(columns)} categorical columns")
    return df_encoded, encoders


# ============================================================================
# SMOOTHING & FILTERING
# ============================================================================

def apply_moving_average(df: pd.DataFrame, columns: List[str], window: int = 3) -> pd.DataFrame:
    """
    Apply moving average smoothing.
    
    Args:
        df: Input dataframe (must be sorted by date)
        columns: Columns to smooth
        window: Window size
    
    Returns:
        pd.DataFrame: Smoothed dataframe
    """
    df_smooth = df.copy()
    
    for col in columns:
        if col in df_smooth.columns:
            df_smooth[col] = df_smooth[col].rolling(window=window, center=True).mean()
    
    logger.info(f"✅ Applied moving average (window={window}) to {len(columns)} columns")
    return df_smooth


# ============================================================================
# VALIDATION
# ============================================================================

def validate_numeric_range(df: pd.DataFrame, column: str, min_val: float = None, max_val: float = None) -> bool:
    """
    Validate that numeric column is within range.
    
    Args:
        df: Input dataframe
        column: Column to validate
        min_val: Minimum allowed value
        max_val: Maximum allowed value
    
    Returns:
        bool: True if valid, False otherwise
    """
    if column not in df.columns:
        logger.warning(f"⚠️ Column {column} not found")
        return False
    
    violations = 0
    
    if min_val is not None:
        violations += (df[column] < min_val).sum()
    
    if max_val is not None:
        violations += (df[column] > max_val).sum()
    
    if violations > 0:
        logger.warning(f"⚠️ {column}: {violations} values outside range [{min_val}, {max_val}]")
        return False
    
    logger.info(f"✅ {column}: All values within range [{min_val}, {max_val}]")
    return True


def validate_no_nulls(df: pd.DataFrame, columns: List[str]) -> bool:
    """
    Validate that columns have no NULL values.
    
    Args:
        df: Input dataframe
        columns: Columns to validate
    
    Returns:
        bool: True if no NULLs, False otherwise
    """
    nulls = df[columns].isnull().sum()
    
    if nulls.sum() > 0:
        logger.warning(f"⚠️ Found NULL values:\n{nulls[nulls > 0]}")
        return False
    
    logger.info(f"✅ No NULL values in {len(columns)} columns")
    return True


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    print("Preprocessing utilities loaded")
