"""
Synthetic Data Generator for SAIL Bokaro ML Training
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.

Generates 6-12 months of realistic logistics data for all 10 schema tables.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURATION
# ============================================================================

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

OUTPUT_DIR = Path(__file__).parent / "raw"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

START_DATE = datetime(2023, 1, 1)
END_DATE = datetime(2023, 12, 31)
DATE_RANGE = pd.date_range(START_DATE, END_DATE, freq='D')

MATERIALS = ['HR_Coils', 'CR_Coils', 'Plates', 'Wire_Rods', 'TMT_Bars', 'Pig_Iron', 'Billets']
DESTINATIONS = ['Kolkata', 'Patna', 'Ranchi', 'Durgapur', 'Haldia']
LOADING_POINTS = ['LP1', 'LP2', 'LP3']
PRIORITIES = ['HIGH', 'MEDIUM', 'LOW']
STOCKYARDS = ['SY1', 'SY2', 'SY3', 'SY4', 'SY5']

# ============================================================================
# TABLE 1: MATERIAL PRODUCTION DAILY
# ============================================================================

def generate_material_production_daily():
    """Generate daily material production data."""
    logger.info("Generating material_production_daily...")
    
    rows = []
    for date in DATE_RANGE:
        for material in MATERIALS:
            for line in range(1, 5):  # 4 production lines
                # Seasonal variation
                month = date.month
                if month in [6, 7, 8, 9]:  # Monsoon
                    base_production = np.random.uniform(2000, 4000)
                else:
                    base_production = np.random.uniform(3000, 7000)
                
                # Add noise
                production = base_production + np.random.normal(0, 500)
                production = max(0, production)
                
                rows.append({
                    'date': date,
                    'material_type': material,
                    'production_line': f'Line_{line}',
                    'tonnes_produced': production,
                    'equipment_status': np.random.choice(['OPERATIONAL', 'MAINTENANCE'], p=[0.95, 0.05]),
                })
    
    df = pd.DataFrame(rows)
    df.to_csv(OUTPUT_DIR / 'material_production_daily.csv', index=False)
    logger.info(f"✅ Generated {len(df)} rows")
    return df


# ============================================================================
# TABLE 2: INVENTORY BSL
# ============================================================================

def generate_inventory_bsl(production_df):
    """Generate inventory data."""
    logger.info("Generating inventory_bsl...")
    
    rows = []
    inventory_state = {mat: 5000 for mat in MATERIALS}
    
    for date in DATE_RANGE:
        daily_production = production_df[production_df['date'] == date].groupby('material_type')['tonnes_produced'].sum()
        
        for material in MATERIALS:
            prod = daily_production.get(material, 0)
            dispatch = np.random.uniform(1000, 3000)
            
            inventory_state[material] = max(0, inventory_state[material] + prod - dispatch)
            
            rows.append({
                'date': date,
                'material_type': material,
                'opening_stock_tonnes': inventory_state[material],
                'production_tonnes': prod,
                'dispatched_tonnes': dispatch,
                'closing_stock_tonnes': inventory_state[material],
            })
    
    df = pd.DataFrame(rows)
    df.to_csv(OUTPUT_DIR / 'inventory_bsl.csv', index=False)
    logger.info(f"✅ Generated {len(df)} rows")
    return df


# ============================================================================
# TABLE 3: CUSTOMER ORDERS
# ============================================================================

def generate_customer_orders():
    """Generate customer orders."""
    logger.info("Generating customer_orders...")
    
    rows = []
    order_id = 1
    
    for date in DATE_RANGE:
        # 5-15 orders per day
        n_orders = np.random.randint(5, 16)
        
        for _ in range(n_orders):
            rows.append({
                'order_id': f'ORD_{order_id:06d}',
                'order_date': date,
                'due_date': date + timedelta(days=np.random.randint(3, 15)),
                'material_type': np.random.choice(MATERIALS),
                'destination': np.random.choice(DESTINATIONS),
                'quantity_tonnes': np.random.uniform(50, 500),
                'priority': np.random.choice(PRIORITIES, p=[0.20, 0.50, 0.30]),
            })
            order_id += 1
    
    df = pd.DataFrame(rows)
    df.to_csv(OUTPUT_DIR / 'customer_orders.csv', index=False)
    logger.info(f"✅ Generated {len(df)} rows")
    return df


# ============================================================================
# TABLE 4: CMO STOCKYARD INVENTORY
# ============================================================================

def generate_cmo_stockyard_inventory():
    """Generate stockyard inventory."""
    logger.info("Generating cmo_stockyard_inventory...")
    
    rows = []
    stockyard_state = {sy: {mat: 1000 for mat in MATERIALS} for sy in STOCKYARDS}
    
    for date in DATE_RANGE:
        for stockyard in STOCKYARDS:
            for material in MATERIALS:
                inbound = np.random.uniform(100, 500)
                outbound = np.random.uniform(50, 300)
                
                stockyard_state[stockyard][material] = max(0, stockyard_state[stockyard][material] + inbound - outbound)
                
                rows.append({
                    'date': date,
                    'stockyard_id': stockyard,
                    'material_type': material,
                    'inbound_tonnes': inbound,
                    'outbound_tonnes': outbound,
                    'closing_stock_tonnes': stockyard_state[stockyard][material],
                })
    
    df = pd.DataFrame(rows)
    df.to_csv(OUTPUT_DIR / 'cmo_stockyard_inventory.csv', index=False)
    logger.info(f"✅ Generated {len(df)} rows")
    return df


# ============================================================================
# TABLE 5: EMPTY RAKE ARRIVALS
# ============================================================================

def generate_empty_rake_arrivals():
    """Generate empty rake arrivals."""
    logger.info("Generating empty_rake_arrivals...")
    
    rows = []
    rake_id = 1
    
    for date in DATE_RANGE:
        # Poisson process: ~4 rakes per day
        n_rakes = np.random.poisson(4)
        
        for _ in range(n_rakes):
            rows.append({
                'date': date,
                'rake_id': f'RAKE_{rake_id:05d}',
                'arrival_time': f"{np.random.randint(0, 24):02d}:{np.random.randint(0, 60):02d}",
                'wagons_count': np.random.choice([58, 59]),  # Min rake size 58
                'status': np.random.choice(['AVAILABLE', 'UNDER_LOADING', 'MAINTENANCE'], p=[0.70, 0.25, 0.05]),
                'cycle_time_hours': np.random.uniform(18, 48),
            })
            rake_id += 1
    
    df = pd.DataFrame(rows)
    df.to_csv(OUTPUT_DIR / 'empty_rake_arrivals.csv', index=False)
    logger.info(f"✅ Generated {len(df)} rows")
    return df


# ============================================================================
# TABLE 6: RAKE DISPATCH HISTORY
# ============================================================================

def generate_rake_dispatch_history():
    """Generate rake dispatch history."""
    logger.info("Generating rake_dispatch_history...")
    
    rows = []
    dispatch_id = 1
    
    for date in DATE_RANGE:
        # ~3 dispatches per day
        n_dispatches = np.random.randint(2, 5)
        
        for _ in range(n_dispatches):
            route = np.random.choice(DESTINATIONS)
            
            # Haldia has higher delays
            if route == 'Haldia':
                delay = np.random.uniform(3, 8) if np.random.random() < 0.45 else 0
            else:
                delay = np.random.uniform(1, 3) if np.random.random() < 0.15 else 0
            
            rows.append({
                'date': date,
                'dispatch_id': f'DISP_{dispatch_id:06d}',
                'rake_id': f'RAKE_{np.random.randint(1, 500):05d}',
                'route': route,
                'material_type': np.random.choice(MATERIALS),
                'tonnes_dispatched': np.random.uniform(2000, 3654),  # 58 wagons × 63 tonnes
                'delay_hours': delay,
                'status': np.random.choice(['DISPATCHED', 'IN_TRANSIT', 'DELIVERED']),
            })
            dispatch_id += 1
    
    df = pd.DataFrame(rows)
    df.to_csv(OUTPUT_DIR / 'rake_dispatch_history.csv', index=False)
    logger.info(f"✅ Generated {len(df)} rows")
    return df


# ============================================================================
# TABLE 7: LOADING POINT PERFORMANCE
# ============================================================================

def generate_loading_point_performance():
    """Generate loading point performance."""
    logger.info("Generating loading_point_performance...")
    
    rows = []
    
    for date in DATE_RANGE:
        for lp in LOADING_POINTS:
            for shift in [1, 2, 3]:
                rows.append({
                    'date': date,
                    'loading_point_id': lp,
                    'shift': shift,
                    'tonnes_loaded': np.random.uniform(400, 1500),
                    'hours_operated': np.random.uniform(6, 8),
                    'equipment_operational_count': np.random.randint(2, 4),
                    'equipment_maintenance_flag': np.random.choice([0, 1], p=[0.95, 0.05]),
                })
    
    df = pd.DataFrame(rows)
    df.to_csv(OUTPUT_DIR / 'loading_point_performance.csv', index=False)
    logger.info(f"✅ Generated {len(df)} rows")
    return df


# ============================================================================
# TABLE 8: ROUTE CONGESTION DAILY
# ============================================================================

def generate_route_congestion_daily():
    """Generate route congestion data."""
    logger.info("Generating route_congestion_daily...")
    
    rows = []
    
    for date in DATE_RANGE:
        for route in DESTINATIONS:
            month = date.month
            
            # Base congestion by route
            if route == 'Haldia':
                base_congestion = np.random.uniform(0.5, 0.8)
            else:
                base_congestion = np.random.uniform(0.2, 0.5)
            
            # Monsoon increases congestion
            if month in [6, 7, 8, 9]:
                base_congestion += 0.15
            
            congestion = np.clip(base_congestion, 0.1, 0.95)
            
            rows.append({
                'date': date,
                'route': route,
                'congestion_level': congestion,
                'weather_condition': np.random.choice(['Clear', 'Rainy', 'Foggy', 'Stormy'], p=[0.6, 0.2, 0.1, 0.1]),
                'temperature_celsius': np.random.uniform(15, 40),
                'rainfall_mm': np.random.uniform(0, 50) if month in [6, 7, 8, 9] else np.random.uniform(0, 5),
                'visibility_km': np.random.uniform(1, 20),
                'traffic_incidents': np.random.poisson(1),
                'average_speed_kmh': np.random.uniform(40, 80),
                'railway_disruption_flag': 1 if np.random.random() < 0.05 else 0,
            })
    
    df = pd.DataFrame(rows)
    df.to_csv(OUTPUT_DIR / 'route_congestion_daily.csv', index=False)
    logger.info(f"✅ Generated {len(df)} rows")
    return df


# ============================================================================
# TABLE 9: ROAD TRANSPORT DAILY
# ============================================================================

def generate_road_transport_daily():
    """Generate road transport operations."""
    logger.info("Generating road_transport_daily...")
    
    rows = []
    truck_id = 1
    
    for date in DATE_RANGE:
        # 2-8 trucks per day
        n_trucks = np.random.randint(2, 9)
        
        for _ in range(n_trucks):
            rows.append({
                'date': date,
                'truck_id': f'TRUCK_{truck_id:04d}',
                'truck_capacity_tonnes': np.random.uniform(18, 25),
                'destination': np.random.choice(DESTINATIONS),
                'tonnes_transported': np.random.uniform(5, 25),
                'utilization_percent': np.random.uniform(70, 95),
                'freight_cost_rs': np.random.uniform(5000, 25000),
                'delivery_time_hours': np.random.uniform(12, 48),
                'truck_status': np.random.choice(['AVAILABLE', 'IN_TRANSIT', 'MAINTENANCE'], p=[0.70, 0.25, 0.05]),
            })
            truck_id += 1
    
    df = pd.DataFrame(rows)
    df.to_csv(OUTPUT_DIR / 'road_transport_daily.csv', index=False)
    logger.info(f"✅ Generated {len(df)} rows")
    return df


# ============================================================================
# TABLE 10: COST PARAMETERS MASTER
# ============================================================================

def generate_cost_parameters_master():
    """Generate cost parameters (static)."""
    logger.info("Generating cost_parameters_master...")
    
    rows = []
    distances = {
        'Kolkata': 200,
        'Patna': 150,
        'Ranchi': 100,
        'Durgapur': 120,
        'Haldia': 250,
    }
    
    for route in DESTINATIONS:
        distance = distances[route]
        rail_rate = 80 - (distance / 250) * 30
        road_rate = rail_rate + np.random.uniform(30, 70)
        
        rows.append({
            'route': route,
            'distance_km': distance,
            'rail_freight_rate_rs_per_tonne': rail_rate,
            'road_freight_rate_rs_per_tonne': road_rate,
            'demurrage_rate_rs_per_wagon_per_hour': 200 if route == 'Haldia' else 150,
            'handling_cost_rs_per_tonne': np.random.uniform(5, 10),
            'min_rake_size_wagons': 58,
            'partial_rake_penalty_percent': 20,
            'fuel_rate_rs_per_km': 50,
            'truck_availability_percent': np.random.uniform(0.70, 0.90),
        })
    
    df = pd.DataFrame(rows)
    df.to_csv(OUTPUT_DIR / 'cost_parameters_master.csv', index=False)
    logger.info(f"✅ Generated {len(df)} rows")
    return df


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Generate all synthetic data."""
    logger.info("=" * 80)
    logger.info("SYNTHETIC DATA GENERATION - START")
    logger.info("=" * 80)
    
    # Generate in dependency order
    production_df = generate_material_production_daily()
    generate_inventory_bsl(production_df)
    generate_customer_orders()
    generate_cmo_stockyard_inventory()
    generate_empty_rake_arrivals()
    generate_rake_dispatch_history()
    generate_loading_point_performance()
    generate_route_congestion_daily()
    generate_road_transport_daily()
    generate_cost_parameters_master()
    
    logger.info("=" * 80)
    logger.info("✅ SYNTHETIC DATA GENERATION - COMPLETE")
    logger.info(f"All files saved to: {OUTPUT_DIR}")
    logger.info("=" * 80)


if __name__ == '__main__':
    main()
