# Synthetic Dataset Generation System - SIH25208 SAIL Bokaro
## PART 2: TABLES 8-10 + COMPLETE INTEGRATION

---

## TABLE 8: route_congestion_daily

**Purpose**: Daily congestion levels on routes (proxy for delays and traffic).

**Fields & Generation Rules**:

| Field | Type | Range/Formula | Notes |
|-------|------|---------------|-------|
| date | DATE | 2023-01-01 to 2023-12-31 | Contiguous daily |
| route | VARCHAR | Bokaro→Kolkata, Bokaro→Patna, etc. | 5 routes |
| congestion_level | FLOAT | 0.2–0.8 | 0–1 scale, higher = congested |
| weather_condition | VARCHAR | Clear, Rainy, Foggy, Stormy | Categorical |
| temperature_celsius | FLOAT | 15–40 | Seasonal variation |
| rainfall_mm | FLOAT | 0–50 | Monsoon months higher |
| visibility_km | FLOAT | 1–20 | Lower in monsoon/fog |
| traffic_incidents | INT | 0–5 | Incident count |
| average_speed_kmh | FLOAT | 40–80 | Speed |
| estimated_transit_hours | FLOAT | distance / speed | Transit time |
| railway_disruption_flag | BOOLEAN | 0, 1 | Railway closure |
| disruption_duration_hours | FLOAT | 0–48 | If disruption = 1 |
| timestamp | DATETIME | 12:00:00 | Daily snapshot |

**Generation Formula**:
```
base_congestion = {
    Bokaro→Kolkata: random(0.3, 0.6),
    Bokaro→Patna: random(0.2, 0.5),
    Bokaro→Ranchi: random(0.2, 0.4),
    Bokaro→Durgapur: random(0.2, 0.4),
    Bokaro→Haldia: random(0.5, 0.8)  # Haldia highest
}

seasonal_factor = {
    Jan-Mar: +0.1,   # Peak season
    Apr-Jun: +0.05,
    Jul-Sep: -0.15,  # Monsoon
    Oct-Dec: +0.1
}

day_factor = {
    Mon-Wed: +0.1,   # Weekday
    Thu-Fri: +0.05,
    Sat-Sun: -0.15   # Weekend
}

weather = choice([Clear, Rainy, Foggy, Stormy], p=[0.6, 0.2, 0.1, 0.1])
weather_factor = {Clear: 0, Rainy: +0.1, Foggy: +0.15, Stormy: +0.25}

congestion = base_congestion + seasonal_factor + day_factor + weather_factor
congestion = clip(congestion, 0.1, 0.95)

# Weather data
temperature = random(15, 40)
if month in [Jun, Jul, Aug, Sep]:
    rainfall = random(5, 50)
    visibility = random(1, 10)
else:
    rainfall = random(0, 5)
    visibility = random(10, 20)

# Railway disruption (5% probability)
railway_disruption = random() < 0.05
if railway_disruption:
    disruption_duration = random(6, 48)
else:
    disruption_duration = 0

# Speed and transit
distance = {Kolkata: 200, Patna: 150, Ranchi: 100, Durgapur: 120, Haldia: 250}
average_speed = 60 - congestion * 40
estimated_transit = distance / average_speed
```

**Correlations**:
- Haldia: Consistently high (0.5–0.8)
- Monsoon: +15% congestion
- Weekdays: +10% congestion
- Weather: Fog/Storm → +15–25% congestion
- Congestion → Delay (strong)

**Edge Cases** (2% of data):
- Extreme congestion: > 0.9 (0.5%)
- Zero visibility: < 1 km (1%)
- Railway closure: disruption > 24 hours (0.5%)

**Sample (3 rows)**:
| date | route | congestion_level | weather_condition | temperature_celsius | rainfall_mm | visibility_km | railway_disruption_flag | estimated_transit_hours |
|------|-------|------------------|-------------------|----------------------|-------------|---------------|------------------------|-------------------------|
| 2023-01-15 | Bokaro→Kolkata | 0.45 | Clear | 28 | 0 | 15 | 0 | 3.3 |
| 2023-01-15 | Bokaro→Haldia | 0.72 | Clear | 26 | 0 | 18 | 0 | 3.5 |
| 2023-01-15 | Bokaro→Patna | 0.28 | Clear | 30 | 0 | 20 | 0 | 2.5 |

---

## TABLE 9: road_transport_daily

**Purpose**: Daily road transport operations (trucks) for urgent/small orders.

**Fields & Generation Rules**:

| Field | Type | Range/Formula | Notes |
|-------|------|---------------|-------|
| date | DATE | 2023-01-01 to 2023-12-31 | Contiguous daily |
| truck_id | VARCHAR | TRUCK_NNNN | Unique truck identifier |
| truck_capacity_tonnes | FLOAT | 18–25 | Truck capacity |
| destination | VARCHAR | Kolkata, Patna, Ranchi, Durgapur, Haldia | 5 destinations |
| tonnes_transported | FLOAT | 5–25 | Actual load |
| utilization_percent | FLOAT | tonnes / capacity × 100 | Utilization |
| freight_cost_rs | FLOAT | tonnes × rate | Cost |
| delivery_time_hours | FLOAT | 12–48 | Delivery time |
| truck_status | VARCHAR | AVAILABLE, IN_TRANSIT, MAINTENANCE | Status |
| fuel_cost_rs | FLOAT | distance × fuel_rate | Fuel cost |
| total_cost_rs | FLOAT | freight + fuel | Total |
| timestamp | DATETIME | Random 08:00–17:00 | Dispatch time |

**Generation Formula**:
```
trucks_per_day = random(2, 8)  # 2–8 trucks/day

for truck_num in range(trucks_per_day):
    truck_id = choice(TRUCK_001 to TRUCK_050)
    capacity = random(18, 25)
    
    # Utilization (70–95% typical)
    utilization = random(0.70, 0.95)
    tonnes = capacity * utilization
    
    # Destination distribution (same as rail)
    destination = choice(destinations, p=[0.35, 0.25, 0.20, 0.12, 0.08])
    
    # Cost calculation
    distance = {Kolkata: 200, Patna: 150, Ranchi: 100, Durgapur: 120, Haldia: 250}
    freight_rate = 100  # Rs/tonne for road (higher than rail)
    fuel_rate = 50  # Rs/km
    
    freight_cost = tonnes * freight_rate
    fuel_cost = distance[destination] * fuel_rate
    total_cost = freight_cost + fuel_cost
    
    # Delivery time (faster than rail)
    base_delivery = distance[destination] / 40  # 40 km/h avg
    delivery_time = base_delivery + random(0, 4)
    
    # Status distribution
    status = choice([AVAILABLE, IN_TRANSIT, MAINTENANCE], p=[0.70, 0.25, 0.05])
```

**Correlations**:
- Higher utilization → Higher freight cost
- Longer distance → Higher fuel cost
- Peak season: More trucks dispatched
- Monsoon: Fewer trucks (prefer rail)

**Edge Cases** (2% of data):
- Truck breakdown: status = MAINTENANCE (1%)
- Zero capacity: tonnes = 0 (0.5%)
- Extreme utilization: > 100% (0.5%)

**Sample (3 rows)**:
| date | truck_id | truck_capacity_tonnes | destination | tonnes_transported | utilization_percent | freight_cost_rs | delivery_time_hours | total_cost_rs |
|------|----------|----------------------|-------------|-------------------|-------------------|-----------------|-------------------|---------------|
| 2023-01-15 | TRUCK_0001 | 20 | Kolkata | 18 | 0.90 | 1800 | 6.5 | 12800 |
| 2023-01-15 | TRUCK_0002 | 22 | Haldia | 20 | 0.91 | 2000 | 8.2 | 15500 |
| 2023-01-15 | TRUCK_0003 | 18 | Patna | 15 | 0.83 | 1500 | 4.8 | 9000 |

---

## TABLE 10: cost_parameters_master

**Purpose**: Static cost parameters (rates, thresholds) for optimization.

**Fields & Generation Rules**:

| Field | Type | Range/Formula | Notes |
|-------|------|---------------|-------|
| route | VARCHAR | Bokaro→Kolkata, etc. | 5 routes |
| distance_km | FLOAT | 100–250 | Route distance |
| rail_freight_rate_rs_per_tonne | FLOAT | 50–80 | Rail rate |
| road_freight_rate_rs_per_tonne | FLOAT | 80–150 | Road rate (higher) |
| demurrage_rate_rs_per_wagon_per_hour | FLOAT | 150–250 | Demurrage penalty |
| handling_cost_rs_per_tonne | FLOAT | 5–10 | Loading/unloading |
| min_rake_size_wagons | INT | 58 | Minimum rake |
| partial_rake_penalty_percent | FLOAT | 20 | +20% cost for partial |
| fuel_rate_rs_per_km | FLOAT | 50 | Fuel cost |
| truck_availability_percent | FLOAT | 70–90 | Truck availability |
| rail_lead_time_hours | FLOAT | 18–30 | Rail transit time |
| road_lead_time_hours | FLOAT | 12–24 | Road transit time |
| timestamp | DATETIME | 2023-01-01 00:00:00 | Static, one row per route |

**Generation Formula**:
```
routes = [Kolkata, Patna, Ranchi, Durgapur, Haldia]

for route in routes:
    distance = {
        Kolkata: 200,
        Patna: 150,
        Ranchi: 100,
        Durgapur: 120,
        Haldia: 250
    }[route]
    
    # Rates (inversely correlated with distance for rail)
    rail_rate = 80 - (distance / 250) * 30  # Longer = cheaper
    road_rate = rail_rate + random(30, 70)  # Road always more expensive
    
    # Demurrage (higher for congested routes)
    if route == 'Haldia':
        demurrage_rate = random(200, 250)
    else:
        demurrage_rate = random(150, 200)
    
    # Other parameters
    handling_cost = random(5, 10)
    fuel_rate = 50
    truck_availability = random(0.70, 0.90)
    rail_lead_time = distance / 8 + random(2, 4)  # ~8 km/h avg
    road_lead_time = distance / 40 + random(1, 3)  # ~40 km/h avg
```

**Correlations**:
- Longer distance → Lower rail rate, higher road rate
- Haldia → Higher demurrage (congestion)
- Rail cheaper than road for long distances
- Road faster than rail

**Sample (5 rows)**:
| route | distance_km | rail_freight_rate_rs_per_tonne | road_freight_rate_rs_per_tonne | demurrage_rate_rs_per_wagon_per_hour | handling_cost_rs_per_tonne | min_rake_size_wagons | partial_rake_penalty_percent | truck_availability_percent |
|-------|-------------|--------------------------------|--------------------------------|--------------------------------------|---------------------------|----------------------|------------------------------|---------------------------|
| Bokaro→Kolkata | 200 | 60 | 110 | 180 | 7 | 58 | 20 | 0.80 |
| Bokaro→Patna | 150 | 65 | 115 | 170 | 6 | 58 | 20 | 0.85 |
| Bokaro→Ranchi | 100 | 72 | 125 | 160 | 5 | 58 | 20 | 0.88 |
| Bokaro→Durgapur | 120 | 70 | 120 | 165 | 6 | 58 | 20 | 0.82 |
| Bokaro→Haldia | 250 | 50 | 100 | 220 | 8 | 58 | 20 | 0.75 |

---

## COMPLETE DEPENDENCY GRAPH

```
START
  ├─ material_production_daily (independent)
  │   └─ inventory_bsl (depends on production)
  │
  ├─ customer_orders (independent)
  │
  ├─ empty_rake_arrivals (independent)
  │
  ├─ loading_point_performance (independent)
  │
  ├─ route_congestion_daily (independent)
  │
  ├─ cost_parameters_master (independent, static)
  │
  └─ PARALLEL GENERATION (after above):
      ├─ rake_dispatch_history (depends on rakes, throughput, congestion)
      │   └─ cmo_stockyard_inventory (depends on dispatch)
      │
      └─ road_transport_daily (independent)

END
```

---

## ML MODEL DATA CONSUMPTION MATRIX

| ML Model | Input Tables | Key Fields | Aggregation | Output Used By Optimizer |
|----------|--------------|-----------|-------------|--------------------------|
| **Demand Forecasting** | customer_orders | order_date, material, destination, quantity | Daily sum per material-destination | demand_forecast_tonnes |
| **Rake Availability** | empty_rake_arrivals | date, status | Daily count AVAILABLE | available_rakes_forecast |
| **Delay Prediction** | route_congestion_daily, rake_dispatch_history | congestion_level, delay_hours, weather | Daily per route | predicted_delay_hours |
| **Throughput** | loading_point_performance | tonnes_loaded, hours, equipment | Daily per LP | predicted_throughput_tph |
| **Cost Prediction** | rake_dispatch_history, cost_parameters_master | tonnes, delay, rates | Per dispatch | predicted_cost_components |
| **Anomaly Detection** | loading_point_performance, route_congestion_daily, inventory_bsl | throughput, delay, stock | Daily metrics | is_anomaly_flag |
| **Mode Classifier** | customer_orders, cost_parameters_master, rake_availability | quantity, priority, cost_rail, cost_road | Per order | recommended_transport_mode |

---

## SYNTHETIC DATA GENERATION WORKFLOW

### Phase 1: Independent Tables (Parallel)
```
1. material_production_daily
   - 365 rows (1 per day)
   - 7 materials × 4 lines = 28 rows/day
   - Total: ~2,555 rows

2. customer_orders
   - ~15–25 orders/day (peak), 2–8 (off-peak)
   - Total: ~5,000–6,000 rows

3. empty_rake_arrivals
   - Poisson(4 rakes/day)
   - Total: ~1,460 rows

4. loading_point_performance
   - 3 LPs × 3 shifts × 365 days
   - Total: 3,285 rows

5. route_congestion_daily
   - 5 routes × 365 days
   - Total: 1,825 rows

6. cost_parameters_master
   - 5 routes (static)
   - Total: 5 rows
```

### Phase 2: Dependent Tables (Sequential)
```
7. inventory_bsl (depends on production)
   - 7 materials × 365 days
   - Total: 2,555 rows

8. rake_dispatch_history (depends on rakes, throughput, congestion)
   - ~3 dispatches/day
   - Total: ~1,095 rows

9. cmo_stockyard_inventory (depends on dispatch)
   - 5 stockyards × 7 materials × 365 days
   - Total: 12,775 rows

10. road_transport_daily (independent)
    - ~2–8 trucks/day
    - Total: ~1,460 rows
```

### Total Dataset Size
- **Total Rows**: ~28,000–30,000
- **Total Columns**: ~120
- **Estimated Size**: 40–60 MB (CSV format)
- **Generation Time**: ~2–5 minutes (Python)

---

## VALIDATION CHECKLIST

**Per-Table Validation**:
- [ ] No NULL in primary keys
- [ ] Numeric ranges within bounds
- [ ] Categorical values in allowed set
- [ ] Dates contiguous, no future dates
- [ ] Derived fields match formulas
- [ ] No duplicates in unique columns

**Cross-Table Validation**:
- [ ] Dispatch rake_id exists in empty_rake_arrivals
- [ ] Dispatch material_type in MATERIALS list
- [ ] Order destination in DESTINATIONS list
- [ ] Stockyard inbound ≈ dispatch outbound (±1 day lag)
- [ ] Inventory closing = opening + production - dispatched
- [ ] Cost = freight + demurrage (no negative values)

**Data Quality Checks**:
- [ ] 2–5% edge cases injected
- [ ] Seasonality patterns visible
- [ ] Correlations maintained
- [ ] No data leakage between train/test
- [ ] Realistic distributions

---

## QUICK START GUIDE

```bash
# 1. Install dependencies
pip install pandas numpy scipy scikit-learn

# 2. Generate synthetic data
python backend/ml/synthetic/run_all.py

# 3. Validate data
python backend/ml/synthetic/run_all.py --validate

# 4. Generate summary statistics
python backend/ml/synthetic/run_all.py --summary

# 5. Output files
ls -lh backend/ml/synthetic/raw/
# material_production_daily.csv
# inventory_bsl.csv
# customer_orders.csv
# cmo_stockyard_inventory.csv
# empty_rake_arrivals.csv
# rake_dispatch_history.csv
# loading_point_performance.csv
# route_congestion_daily.csv
# road_transport_daily.csv
# cost_parameters_master.csv
```

---

## INTEGRATION WITH ML TRAINING

**For each ML model**:

1. **Load synthetic data**:
   ```python
   df = pd.read_csv('backend/ml/synthetic/raw/[table_name].csv')
   ```

2. **Feature engineering**:
   - Apply transformations from PHASE 2.1 blueprint
   - Create lag features, rolling stats, encodings

3. **Train/test split**:
   - Time-series split (no data leakage)
   - Train: 70%, Val: 15%, Test: 15%

4. **Model training**:
   - Use hyperparameters from PHASE 2.1
   - Cross-validation with embargo periods

5. **Model evaluation**:
   - Compute metrics from PHASE 2.1
   - Generate dashboard KPIs

6. **Model deployment**:
   - Save model to `backend/ml/models/[model_name].pkl`
   - Update model registry

---

## NOTES FOR IMPLEMENTATION

- **Reproducibility**: Set random seed for consistent data generation
- **Scalability**: Can generate 2–5 years of data by extending DATE_RANGE
- **Realism**: All ranges and correlations grounded in PHASE 0 domain knowledge
- **Flexibility**: Modify config.py to adjust ranges, seasonality, edge case rates
- **Monitoring**: Capture generation logs for debugging and auditing

