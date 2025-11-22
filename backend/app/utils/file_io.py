"""
File I/O utilities for CSV uploads and data processing.
"""

import pandas as pd
from pathlib import Path
from typing import Optional, Dict, List
import tempfile

def read_csv_file(file_path: Path) -> Optional[pd.DataFrame]:
    """
    Read CSV file safely.
    
    Args:
        file_path: Path to CSV file
    
    Returns:
        DataFrame or None if error
    """
    try:
        df = pd.read_csv(file_path)
        return df
    except Exception as e:
        raise ValueError(f"Error reading CSV: {str(e)}")

def validate_csv_columns(df: pd.DataFrame, required_columns: List[str]) -> bool:
    """
    Validate that DataFrame has required columns.
    
    Args:
        df: DataFrame to validate
        required_columns: List of required column names
    
    Returns:
        True if all columns present
    """
    missing = set(required_columns) - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {missing}")
    return True

def save_temp_csv(df: pd.DataFrame) -> Path:
    """
    Save DataFrame to temporary CSV file.
    
    Args:
        df: DataFrame to save
    
    Returns:
        Path to temporary file
    """
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
        df.to_csv(f.name, index=False)
        return Path(f.name)

def get_file_info(file_path: Path) -> Dict:
    """Get file information."""
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    
    return {
        'name': file_path.name,
        'size_bytes': file_path.stat().st_size,
        'path': str(file_path),
    }
