"""
Data loaders for synthetic datasets.
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Union
import logging

from .config import DATA_FILES, SYNTHETIC_RAW_DIR, SYNTHETIC_PROCESSED_DIR

logger = logging.getLogger(__name__)

# ============================================================================
# SINGLE TABLE LOADERS
# ============================================================================

def load_csv(table_name: str, processed: bool = False) -> pd.DataFrame:
    """
    Load a single CSV file from synthetic data.
    
    Args:
        table_name: Key from DATA_FILES (e.g., 'material_production', 'customer_orders')
        processed: If True, load from processed dir; else from raw dir
    
    Returns:
        pd.DataFrame: Loaded data
    
    Raises:
        FileNotFoundError: If file doesn't exist
        ValueError: If table_name not in DATA_FILES
    """
    if table_name not in DATA_FILES:
        raise ValueError(f"Unknown table: {table_name}. Available: {list(DATA_FILES.keys())}")
    
    filepath = DATA_FILES[table_name]
    
    if not filepath.exists():
        raise FileNotFoundError(f"Data file not found: {filepath}")
    
    logger.info(f"Loading {table_name} from {filepath}")
    df = pd.read_csv(filepath)
    logger.info(f"✅ Loaded {len(df)} rows, {len(df.columns)} columns from {table_name}")
    
    return df


def load_multiple_tables(table_names: List[str]) -> Dict[str, pd.DataFrame]:
    """
    Load multiple CSV files.
    
    Args:
        table_names: List of table names to load
    
    Returns:
        Dict[str, pd.DataFrame]: Dictionary of loaded dataframes
    """
    data = {}
    for table_name in table_names:
        data[table_name] = load_csv(table_name)
    
    logger.info(f"✅ Loaded {len(data)} tables")
    return data


# ============================================================================
# SPECIALIZED LOADERS FOR ML MODELS
# ============================================================================

def load_demand_data() -> pd.DataFrame:
    """Load and aggregate customer orders for demand forecasting."""
    orders = load_csv('customer_orders')
    
    # Aggregate by date, material, destination
    demand = orders.groupby(['order_date', 'material_type', 'destination'])['quantity_tonnes'].sum().reset_index()
    demand.rename(columns={'order_date': 'date', 'quantity_tonnes': 'demand_tonnes'}, inplace=True)
    
    logger.info(f"✅ Aggregated demand data: {len(demand)} rows")
    return demand


def load_rake_availability_data() -> pd.DataFrame:
    """Load empty rake arrivals for rake availability forecasting."""
    rakes = load_csv('empty_rakes')
    
    # Convert arrival_time to date
    rakes['date'] = pd.to_datetime(rakes['date'])
    
    # Count available rakes per day
    availability = rakes[rakes['status'] == 'AVAILABLE'].groupby('date').size().reset_index(name='available_rakes')
    
    logger.info(f"✅ Aggregated rake availability: {len(availability)} rows")
    return availability


def load_delay_data() -> pd.DataFrame:
    """Load dispatch history for delay prediction."""
    dispatch = load_csv('rake_dispatch')
    
    # Convert dates
    dispatch['date'] = pd.to_datetime(dispatch['date'])
    
    logger.info(f"✅ Loaded delay data: {len(dispatch)} rows")
    return dispatch


def load_throughput_data() -> pd.DataFrame:
    """Load loading point performance for throughput prediction."""
    lp = load_csv('loading_point')
    
    # Convert date
    lp['date'] = pd.to_datetime(lp['date'])
    
    logger.info(f"✅ Loaded throughput data: {len(lp)} rows")
    return lp


def load_cost_data() -> tuple:
    """Load dispatch history and cost parameters for cost prediction."""
    dispatch = load_csv('rake_dispatch')
    costs = load_csv('cost_parameters')
    
    dispatch['date'] = pd.to_datetime(dispatch['date'])
    
    logger.info(f"✅ Loaded cost data: {len(dispatch)} dispatch rows, {len(costs)} cost parameter rows")
    return dispatch, costs


def load_anomaly_data() -> Dict[str, pd.DataFrame]:
    """Load data for anomaly detection."""
    lp = load_csv('loading_point')
    congestion = load_csv('route_congestion')
    inventory = load_csv('inventory_bsl')
    
    lp['date'] = pd.to_datetime(lp['date'])
    congestion['date'] = pd.to_datetime(congestion['date'])
    inventory['date'] = pd.to_datetime(inventory['date'])
    
    logger.info(f"✅ Loaded anomaly data")
    return {'loading_point': lp, 'congestion': congestion, 'inventory': inventory}


def load_mode_classifier_data() -> tuple:
    """Load data for road-vs-rail mode classifier."""
    orders = load_csv('customer_orders')
    dispatch = load_csv('rake_dispatch')
    costs = load_csv('cost_parameters')
    rakes = load_csv('empty_rakes')
    
    orders['order_date'] = pd.to_datetime(orders['order_date'])
    dispatch['date'] = pd.to_datetime(dispatch['date'])
    rakes['date'] = pd.to_datetime(rakes['date'])
    
    logger.info(f"✅ Loaded mode classifier data")
    return orders, dispatch, costs, rakes


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def list_available_tables() -> List[str]:
    """List all available data tables."""
    return list(DATA_FILES.keys())


def check_data_files_exist() -> bool:
    """Check if all required data files exist."""
    missing = []
    for table_name, filepath in DATA_FILES.items():
        if not filepath.exists():
            missing.append(table_name)
    
    if missing:
        logger.warning(f"⚠️ Missing data files: {missing}")
        return False
    
    logger.info(f"✅ All {len(DATA_FILES)} data files exist")
    return True


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    
    # Test loaders
    print("Testing data loaders...")
    print(f"Available tables: {list_available_tables()}")
    print(f"Files exist: {check_data_files_exist()}")
