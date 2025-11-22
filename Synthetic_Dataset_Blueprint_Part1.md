# Synthetic Dataset Generation System - SIH25208 SAIL Bokaro
## PART 1: TABLES 1-7 + FILE STRUCTURE

[Content from previous response - Tables 1-7 complete with all fields, formulas, correlations, edge cases, and samples]

---

## 2. FILE STRUCTURE & IMPLEMENTATION ARCHITECTURE

```
backend/ml/synthetic/
├── __init__.py
├── config.py                          # Global config: date ranges, ranges, parameters
├── utils.py                           # Shared utilities: noise, seasonality, correlations
├── generators/
│   ├── __init__.py
│   ├── base_generator.py              # Abstract base class
│   ├── material_production.py          # TABLE 1
│   ├── inventory_bsl.py                # TABLE 2
│   ├── customer_orders.py              # TABLE 3
│   ├── cmo_stockyard.py                # TABLE 4
│   ├── empty_rake_arrivals.py          # TABLE 5
│   ├── rake_dispatch_history.py        # TABLE 6
│   ├── loading_point_performance.py    # TABLE 7
│   ├── route_congestion.py             # TABLE 8
│   ├── road_transport.py               # TABLE 9
│   └── cost_parameters.py              # TABLE 10
├── run_all.py                         # Master orchestrator
├── raw/                               # Output folder for raw CSV files
├── processed/                         # Output folder for processed/cleaned files
└── samples/                           # Sample data for testing
```

---

## 3. GENERATOR FUNCTION SIGNATURES

### config.py
```python
# Date range
START_DATE = datetime(2023, 1, 1)
END_DATE = datetime(2023, 12, 31)
DATE_RANGE = pd.date_range(START_DATE, END_DATE, freq='D')

# Materials
MATERIALS = ['HR_Coils', 'CR_Coils', 'Plates', 'Wire_Rods', 'TMT_Bars', 'Pig_Iron', 'Billets']
MATERIAL_DIST = [0.25, 0.20, 0.15, 0.15, 0.15, 0.05, 0.05]

# Destinations
DESTINATIONS = ['Kolkata', 'Patna', 'Ranchi', 'Durgapur', 'Haldia']
DESTINATION_DIST = [0.35, 0.25, 0.20, 0.12, 0.08]

# Loading points
LOADING_POINTS = ['LP1', 'LP2', 'LP3']

# Ranges
PRODUCTION_RANGE = (500, 1500)
INVENTORY_RANGE = (500, 3000)
ORDER_SIZE_RANGE = (50, 400)
DELAY_RANGE = {
    'Kolkata': (1, 3),
    'Patna': (1, 3),
    'Ranchi': (1, 2),
    'Durgapur': (1, 2),
    'Haldia': (3, 8)
}
THROUGHPUT_RANGE = (300, 600)
TRUCK_CAPACITY_RANGE = (18, 25)

# Seasonality factors
SEASONALITY = {
    'Jan': 1.20, 'Feb': 1.20, 'Mar': 1.20,
    'Apr': 1.10, 'May': 1.10, 'Jun': 0.75,
    'Jul': 0.75, 'Aug': 0.75, 'Sep': 0.75,
    'Oct': 1.15, 'Nov': 1.15, 'Dec': 1.15
}
```

### utils.py
```python
def add_gaussian_noise(value, std_percent=0.08):
    """Add Gaussian noise to value"""
    noise = np.random.normal(0, value * std_percent)
    return value + noise

def get_seasonal_factor(date, base_range):
    """Get seasonal multiplier for date"""
    month = date.month
    return SEASONALITY[calendar.month_abbr[month]]

def get_day_of_week_factor(date):
    """Get day-of-week multiplier"""
    dow = date.dayofweek  # 0=Mon, 6=Sun
    factors = [1.0, 1.0, 1.0, 1.0, 1.0, 0.9, 0.7]
    return factors[dow]

def get_weather_factor(date, is_monsoon=False):
    """Get weather impact factor"""
    if is_monsoon:
        return 0.85
    return 1.0

def clip_value(value, min_val, max_val):
    """Clip value to range"""
    return np.clip(value, min_val, max_val)

def inject_edge_case(data, edge_case_type, probability=0.05):
    """Randomly inject edge cases into data"""
    if np.random.random() < probability:
        # Apply edge case logic
        pass
    return data
```

### base_generator.py
```python
class BaseGenerator:
    def __init__(self, config):
        self.config = config
        self.data = []
    
    def generate(self, date_range):
        """Generate data for date range"""
        raise NotImplementedError
    
    def validate(self):
        """Validate generated data"""
        raise NotImplementedError
    
    def to_csv(self, filepath):
        """Export to CSV"""
        df = pd.DataFrame(self.data)
        df.to_csv(filepath, index=False)
    
    def get_dataframe(self):
        """Return as DataFrame"""
        return pd.DataFrame(self.data)
```

### material_production.py
```python
class MaterialProductionGenerator(BaseGenerator):
    def generate(self, date_range):
        """
        Generate material_production_daily table
        
        Returns:
            list of dicts with fields:
            - date, material_type, production_line, tonnes_produced, quality_grade, timestamp
        """
        pass
    
    def validate(self):
        """Validate: tonnes > 0, quality in [A,B,C], etc."""
        pass
```

### inventory_bsl.py
```python
class InventoryBSLGenerator(BaseGenerator):
    def __init__(self, config, production_data):
        super().__init__(config)
        self.production_data = production_data  # Dependency
    
    def generate(self, date_range):
        """
        Generate inventory_bsl table
        
        Depends on: material_production_daily
        
        Returns:
            list of dicts with fields:
            - date, material_type, opening_stock, production, dispatched, closing_stock, etc.
        """
        pass
    
    def validate(self):
        """Validate: closing = opening + production - dispatched"""
        pass
```

### customer_orders.py
```python
class CustomerOrdersGenerator(BaseGenerator):
    def generate(self, date_range):
        """
        Generate customer_orders table
        
        Returns:
            list of dicts with fields:
            - order_id, order_date, material_type, quantity_tonnes, destination, priority, due_date, etc.
        """
        pass
    
    def validate(self):
        """Validate: quantity > 0, due_date >= order_date, etc."""
        pass
```

### cmo_stockyard.py
```python
class CMOStockyardGenerator(BaseGenerator):
    def __init__(self, config, dispatch_data):
        super().__init__(config)
        self.dispatch_data = dispatch_data  # Dependency
    
    def generate(self, date_range):
        """
        Generate cmo_stockyard_inventory table
        
        Depends on: rake_dispatch_history
        
        Returns:
            list of dicts with fields:
            - date, stockyard, material_type, opening_stock, inbound, outbound, closing_stock, etc.
        """
        pass
    
    def validate(self):
        """Validate: closing = opening + inbound - outbound"""
        pass
```

### empty_rake_arrivals.py
```python
class EmptyRakeArrivalsGenerator(BaseGenerator):
    def generate(self, date_range):
        """
        Generate empty_rake_arrivals table
        
        Uses Poisson process for arrivals
        
        Returns:
            list of dicts with fields:
            - date, rake_id, arrival_time, rake_type, wagons_count, capacity_tonnes, etc.
        """
        pass
    
    def validate(self):
        """Validate: wagons in [58, 59], capacity = wagons * 63, etc."""
        pass
```

### rake_dispatch_history.py
```python
class RakeDispatchHistoryGenerator(BaseGenerator):
    def __init__(self, config, rakes_data, throughput_data, congestion_data):
        super().__init__(config)
        self.rakes_data = rakes_data              # Dependency
        self.throughput_data = throughput_data    # Dependency
        self.congestion_data = congestion_data    # Dependency
    
    def generate(self, date_range):
        """
        Generate rake_dispatch_history table
        
        Depends on: empty_rake_arrivals, loading_point_performance, route_congestion_daily
        
        Returns:
            list of dicts with fields:
            - dispatch_id, date, rake_id, material_type, tonnes_loaded, delay_hours, cost, etc.
        """
        pass
    
    def validate(self):
        """Validate: tonnes > 0, delay >= 0, cost > 0, etc."""
        pass
```

### loading_point_performance.py
```python
class LoadingPointPerformanceGenerator(BaseGenerator):
    def generate(self, date_range):
        """
        Generate loading_point_performance table
        
        Returns:
            list of dicts with fields:
            - date, loading_point, shift, equipment_operational, tonnes_loaded, throughput_tph, etc.
        """
        pass
    
    def validate(self):
        """Validate: throughput = tonnes / hours, equipment in [2, 4], etc."""
        pass
```

### route_congestion.py
```python
class RouteCongestionGenerator(BaseGenerator):
    def generate(self, date_range):
        """
        Generate route_congestion_daily table
        
        Returns:
            list of dicts with fields:
            - date, route, congestion_level, weather_condition, temperature, rainfall, etc.
        """
        pass
    
    def validate(self):
        """Validate: congestion in [0, 1], temperature in [-10, 50], etc."""
        pass
```

### road_transport.py
```python
class RoadTransportGenerator(BaseGenerator):
    def generate(self, date_range):
        """
        Generate road_transport_daily table
        
        Returns:
            list of dicts with fields:
            - date, truck_id, truck_capacity, destination, tonnes_transported, cost, etc.
        """
        pass
    
    def validate(self):
        """Validate: tonnes <= capacity, cost > 0, etc."""
        pass
```

### cost_parameters.py
```python
class CostParametersGenerator(BaseGenerator):
    def generate(self):
        """
        Generate cost_parameters_master table (static, not time-series)
        
        Returns:
            list of dicts with fields:
            - route, rail_freight_rate, road_freight_rate, demurrage_rate, etc.
        """
        pass
    
    def validate(self):
        """Validate: rates > 0, etc."""
        pass
```

### run_all.py
```python
class SyntheticDataOrchestrator:
    def __init__(self, config):
        self.config = config
        self.generators = {}
    
    def run(self, output_dir='backend/ml/synthetic/raw/'):
        """
        Execute all generators in dependency order
        
        Order:
        1. material_production_daily
        2. inventory_bsl (depends on 1)
        3. customer_orders
        4. empty_rake_arrivals
        5. loading_point_performance
        6. route_congestion_daily
        7. rake_dispatch_history (depends on 4, 5, 6)
        8. cmo_stockyard_inventory (depends on 7)
        9. road_transport_daily
        10. cost_parameters_master
        """
        
        # Step 1: Generate independent tables
        self.generators['production'] = MaterialProductionGenerator(self.config)
        prod_data = self.generators['production'].generate(self.config.DATE_RANGE)
        self.generators['production'].to_csv(f'{output_dir}/material_production_daily.csv')
        
        # Step 2: Generate dependent tables
        self.generators['inventory'] = InventoryBSLGenerator(self.config, prod_data)
        inv_data = self.generators['inventory'].generate(self.config.DATE_RANGE)
        self.generators['inventory'].to_csv(f'{output_dir}/inventory_bsl.csv')
        
        # ... continue for all tables
        
        print(f"✅ All synthetic data generated to {output_dir}")
    
    def validate_all(self):
        """Validate all generated data"""
        for name, gen in self.generators.items():
            gen.validate()
            print(f"✅ {name} validated")
    
    def get_summary(self):
        """Print summary statistics"""
        for name, gen in self.generators.items():
            df = gen.get_dataframe()
            print(f"\n{name}:")
            print(f"  Rows: {len(df)}")
            print(f"  Columns: {list(df.columns)}")
            print(f"  Memory: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
```

---

## 4. DEPENDENCY GRAPH

```
material_production_daily
    ↓
inventory_bsl
    ↓
(independent) customer_orders
(independent) empty_rake_arrivals
(independent) loading_point_performance
(independent) route_congestion_daily
    ↓
rake_dispatch_history (depends on rakes, throughput, congestion)
    ↓
cmo_stockyard_inventory (depends on dispatch)
    ↓
(independent) road_transport_daily
(independent) cost_parameters_master
```

---

## 5. ML MODEL DATA CONSUMPTION

| ML Model | Input Tables | Fields Used | Aggregation |
|----------|--------------|-------------|-------------|
| Demand Forecasting | customer_orders | order_date, material_type, destination, quantity_tonnes | Daily sum by material-destination |
| Rake Availability | empty_rake_arrivals | date, wagons_count, status | Daily count by status |
| Delay Prediction | route_congestion_daily, rake_dispatch_history | congestion_level, delay_hours, weather | Daily by route |
| Throughput | loading_point_performance | tonnes_loaded, hours_taken, equipment | Daily by LP |
| Cost Prediction | rake_dispatch_history, cost_parameters_master | tonnes, delay, freight_rate, demurrage_rate | Per dispatch |
| Anomaly Detection | loading_point_performance, route_congestion_daily, inventory_bsl | throughput_tph, delay_hours, closing_stock | Daily metrics |
| Mode Classifier | customer_orders, rake_dispatch_history, cost_parameters_master | quantity, priority, cost_rail, cost_road | Per order |

---

## 6. EDGE CASES & ANOMALY INJECTION

**Inject into 2–5% of data**:

1. **Production**: Line breakdown (0 tonnes for 1–3 days)
2. **Inventory**: Stock mismatch (closing ≠ opening + production - dispatched)
3. **Orders**: Duplicate orders, past-due orders, cancelled orders
4. **Rakes**: Zero arrivals (1–2 days), duplicate rake_id
5. **Dispatch**: Partial rake (< 58 wagons), extreme delay (> 12 hours)
6. **Loading Point**: Equipment failure (0 throughput), extreme downtime
7. **Congestion**: Extreme congestion (> 0.9), zero visibility
8. **Road Transport**: Truck breakdown, zero capacity
9. **Inventory**: Stock-out (closing < safety_stock), overflow

---

## 7. EXECUTION FLOW

```bash
# Run synthetic data generation
python backend/ml/synthetic/run_all.py

# Output:
# ✅ material_production_daily.csv (365 rows)
# ✅ inventory_bsl.csv (2,555 rows = 365 days × 7 materials)
# ✅ customer_orders.csv (~5,000 rows)
# ✅ empty_rake_arrivals.csv (~1,460 rows = 4 rakes/day avg)
# ✅ rake_dispatch_history.csv (~1,095 rows = 3 dispatches/day avg)
# ✅ loading_point_performance.csv (1,095 rows = 365 days × 3 shifts)
# ✅ route_congestion_daily.csv (1,825 rows = 365 days × 5 routes)
# ✅ cmo_stockyard_inventory.csv (12,775 rows = 365 days × 5 stockyards × 7 materials)
# ✅ road_transport_daily.csv (~730 rows = 2 transports/day avg)
# ✅ cost_parameters_master.csv (5 rows = 5 routes)

# Total: ~28,000 rows, ~50 MB
```

---

## 8. VALIDATION RULES

**Per-table validation**:
- No NULL in primary keys
- Foreign key references exist
- Numeric ranges within bounds
- Temporal consistency (dates contiguous, no future dates)
- Derived fields match formulas
- No duplicates in unique columns

**Cross-table validation**:
- Dispatch rake_id exists in empty_rake_arrivals
- Dispatch material_type exists in materials list
- Order destination exists in destinations list
- Stockyard inbound matches dispatch outbound (same day or +1 day lag)

