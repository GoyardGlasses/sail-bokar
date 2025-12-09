# 📍 PAGES TO ML MODELS MAPPING

## Complete Guide: Which ML Model Powers Each Page

---

## 🎯 PREDICTION PAGES (5 Models)

### **1. Cost Page** → `cost_prediction` + `cost_optimization`
**File:** `frontend/src/pages/CostPage.jsx` (or `CostPageWithML.jsx`)

**What It Shows:**
- Predicted shipping cost per shipment
- Total predicted cost for all orders
- Cost breakdown (rail vs road)
- Potential cost savings
- Optimization strategy
- Confidence score

**ML Model Inputs:**
- Routes (distance, costs)
- Materials (tonnage, type)
- Orders (quantity, value)
- Rakes (capacity, availability)

**Example Output:**
```
Cost Prediction: ₹45,000 per shipment
Total Cost: ₹180,000
Confidence: 85%

Cost Optimization:
- Potential Savings: ₹43,200
- Strategy: Use rail for long distances
- Confidence: 85%
```

**Implementation:**
```javascript
import { useMLPredictions } from '../context/MLPredictionsContext'

export default function CostPage() {
  const { getPrediction, dataImported } = useMLPredictions()
  
  if (!dataImported) return <div>Import data first</div>
  
  const costPred = getPrediction('cost_prediction')
  const optPred = getPrediction('cost_optimization')
  
  return (
    <div>
      <h2>Cost: ₹{costPred.predicted_cost_per_shipment}</h2>
      <h2>Savings: ₹{optPred.potential_savings_per_shipment}</h2>
    </div>
  )
}
```

---

### **2. Delay Page** → `delay_prediction`
**File:** `frontend/src/pages/DelayPage.jsx`

**What It Shows:**
- Predicted delay in hours
- Delay factors (route, utilization, orders)
- Confidence score
- Risk assessment

**ML Model Inputs:**
- Routes (distance, type)
- Materials (type, quantity)
- Orders (count, priority)
- Rakes (utilization)
- Stockyards (utilization)

**Example Output:**
```
Predicted Delay: 3.45 hours
Confidence: 82%

Factors:
- Route Distance: 320 km
- Utilization: 75.5%
- Pending Orders: 4
```

**Implementation:**
```javascript
const { getPrediction, dataImported } = useMLPredictions()

if (!dataImported) return <div>Import data first</div>

const delayPred = getPrediction('delay_prediction')

return (
  <div>
    <h2>Delay: {delayPred.predicted_delay_hours} hours</h2>
    <p>Confidence: {delayPred.confidence * 100}%</p>
  </div>
)
```

---

### **3. Forecast/Demand Page** → `demand_forecasting`
**File:** `frontend/src/pages/ForecastPage.jsx`

**What It Shows:**
- Total demand value
- Average order value
- High-priority demand count
- Demand trend (increasing/stable/decreasing)
- Confidence score

**ML Model Inputs:**
- Orders (all orders, priorities)
- Historical patterns
- Seasonality data

**Example Output:**
```
Total Demand: ₹10,330,000
Average Order: ₹2,582,500
High-Priority Orders: 3
Trend: Increasing
Confidence: 78%
```

---

### **4. Quality Page** → `quality_prediction`
**File:** `frontend/src/pages/QualityControlPage.jsx` (new)

**What It Shows:**
- Predicted quality score (0-100%)
- Quality rating (Excellent/Good/Fair)
- Quality factors
- Confidence score

**ML Model Inputs:**
- Routes
- Materials
- Weather conditions
- Vehicle conditions
- Utilization

**Example Output:**
```
Quality Score: 77.35%
Rating: Good
Confidence: 80%

Factors:
- Utilization: 75.5%
- Available Capacity: 2,500 tonnes
```

---

### **5. Fuel/Throughput Page** → `fuel_consumption`
**File:** `frontend/src/pages/ThroughputPage.jsx`

**What It Shows:**
- Predicted fuel consumption (liters)
- Fuel cost (₹)
- Metrics (distance, routes)
- Confidence score

**ML Model Inputs:**
- Routes (distance, type)
- Rakes (capacity, type)
- Materials (tonnage)

**Example Output:**
```
Fuel Consumption: 465 liters
Fuel Cost: ₹46,500
Confidence: 88%

Metrics:
- Total Distance: 930 km
- Avg Route Distance: 310 km
```

---

## 🎯 OPTIMIZATION PAGES (5 Models)

### **6. Route Optimization Page** → `route_optimization`
**File:** `frontend/src/pages/OptimizePage.jsx` or new page

**What It Shows:**
- Recommended route ID
- Origin and destination
- Recommended transport (Rail/Road)
- Cost savings
- Time saved
- Confidence score

**ML Model Inputs:**
- Routes (all routes with costs/times)
- Orders (destinations)
- Constraints

**Example Output:**
```
Recommended Route: rt-001
Transport: Rail
Cost Savings: ₹24,000
Time Saved: 24 hours
Confidence: 90%
```

---

### **7. Cost Optimization Page** → `cost_optimization`
**File:** `frontend/src/pages/CostAnalysisDashboard.jsx`

**What It Shows:**
- Potential savings per shipment
- Total potential savings
- Optimization strategy
- Confidence score

**ML Model Inputs:**
- All shipment parameters
- Historical decisions
- Cost data

**Example Output:**
```
Savings Per Shipment: ₹10,800
Total Savings: ₹43,200
Strategy: Use rail for long distances, road for short
Confidence: 85%
```

---

### **8. Time Optimization Page** → `time_optimization`
**File:** `frontend/src/pages/OptimizeResult.jsx` or new page

**What It Shows:**
- Fastest route
- Fastest transport mode
- Time saved (hours)
- Confidence score

**ML Model Inputs:**
- Routes (times)
- Materials
- Urgency levels

**Example Output:**
```
Fastest Route: rt-001
Transport: Road
Time Saved: 24 hours
Confidence: 88%
```

---

### **9. Vehicle Allocation Page** → `vehicle_allocation`
**File:** `frontend/src/pages/RakePlanner.jsx` or new page

**What It Shows:**
- Available rakes count
- Available capacity (tonnes)
- Total demand (tonnes)
- Capacity utilization %
- Recommendation (sufficient/need more)
- Confidence score

**ML Model Inputs:**
- Rakes (all rakes, status, capacity)
- Orders (total quantity)

**Example Output:**
```
Available Rakes: 3
Available Capacity: 3,500 tonnes
Total Demand: 3,000 tonnes
Utilization: 85.71%
Recommendation: Sufficient capacity
Confidence: 92%
```

---

### **10. Material Recommendation Page** → `material_recommendation`
**File:** `frontend/src/pages/MaterialAvailabilityDashboard.jsx`

**What It Shows:**
- Recommended material name
- Price per unit
- Available quantity
- Grade
- Confidence score

**ML Model Inputs:**
- Materials (all materials)
- Routes
- Constraints
- Requirements

**Example Output:**
```
Recommended Material: Manganese Ore
Price: ₹5,200/unit
Available: 1,800 tonnes
Grade: High-Grade
Confidence: 80%
```

---

## 🎯 RISK & DECISION PAGES (4 Models)

### **11. Risk Management Page** → `risk_assessment`
**File:** `frontend/src/pages/RiskManagementPage.jsx`

**What It Shows:**
- Risk score (0-100%)
- Risk level (High/Medium/Low)
- Risk factors
- Confidence score

**ML Model Inputs:**
- Routes
- Materials
- Weather
- Drivers
- Vehicles
- Historical incidents

**Example Output:**
```
Risk Score: 45.65%
Risk Level: Medium
Confidence: 85%

Factors:
- Utilization: 75.5%
- Capacity Usage: 75.5%
```

---

### **12. Decision Support Page** → `decision_support`
**File:** `frontend/src/pages/DecisionSupportDashboard.jsx`

**What It Shows:**
- AI recommendation
- Action items (list)
- Confidence score

**ML Model Inputs:**
- Current scenario
- Constraints
- Objectives
- Historical decisions

**Example Output:**
```
Recommendation: Prioritize high-priority orders

Action Items:
1. Process 3 high-priority orders first
2. Utilize 3 available rakes
3. Optimize routes for cost savings

Confidence: 82%
```

---

### **13. Anomaly Detection Page** → `anomaly_detection`
**File:** `frontend/src/pages/MonitoringDashboard.jsx` or new page

**What It Shows:**
- Anomalies detected count
- List of anomalies
- Severity level
- Confidence score

**ML Model Inputs:**
- Real-time dispatch data
- Historical patterns

**Example Output:**
```
Anomalies Detected: 0
Severity: Low
Confidence: 88%

Status: Operations normal
```

---

### **14. Supplier Management Page** → `supplier_performance`
**File:** `frontend/src/pages/SupplierManagementPage.jsx`

**What It Shows:**
- Total suppliers count
- Average material grade
- Performance score (0-100)
- Confidence score

**ML Model Inputs:**
- Materials (suppliers)
- Historical performance
- Delays
- Quality metrics

**Example Output:**
```
Total Suppliers: 3
Avg Grade: Premium
Performance Score: 85/100
Confidence: 80%
```

---

## 🎯 ADVANCED PAGES (3 Models)

### **15. Scenario Analysis Page** → `scenario_analysis`
**File:** `frontend/src/pages/ScenarioAnalysisPage.jsx` or `ScenarioAnalysisDashboard.jsx`

**What It Shows:**
- Best case scenario (description, probability, cost)
- Worst case scenario (description, probability, cost)
- Expected case scenario (description, probability, cost)
- Confidence score

**ML Model Inputs:**
- All parameters
- Constraints
- Historical data

**Example Output:**
```
Best Case (65% probability):
- All orders fulfilled on time
- Cost: ₹9,297,000

Worst Case (15% probability):
- Delays in 30% of orders
- Cost: ₹12,396,000

Expected Case (20% probability):
- Normal operations with minor delays
- Cost: ₹10,330,000

Confidence: 78%
```

---

### **16. Predictive Maintenance Page** → `predictive_maintenance`
**File:** `frontend/src/pages/PredictiveMaintenancePage.jsx` (new)

**What It Shows:**
- Rakes needing maintenance count
- Maintenance list (top 5)
- Estimated downtime (hours)
- Confidence score

**ML Model Inputs:**
- Vehicle usage
- Age, mileage
- Incidents
- Historical data

**Example Output:**
```
Rakes Needing Maintenance: 0
Maintenance List: (empty)
Estimated Downtime: 0 hours
Confidence: 85%

Status: All rakes operational
```

---

### **17. Customer Satisfaction Page** → `customer_satisfaction`
**File:** `frontend/src/pages/CustomerIntelligencePage.jsx` (new)

**What It Shows:**
- Predicted satisfaction score (0-100)
- Satisfaction rating (Excellent/Good/Fair)
- Improvement areas (list)
- Confidence score

**ML Model Inputs:**
- Delivery performance
- Quality metrics
- Cost
- Communication

**Example Output:**
```
Satisfaction Score: 80.49%
Rating: Excellent
Confidence: 82%

Improvement Areas:
1. Reduce delivery delays
2. Improve communication
3. Optimize route planning
```

---

## 📊 QUICK REFERENCE TABLE

| # | Page | ML Model | Shows |
|---|------|----------|-------|
| 1 | Cost | cost_prediction | Predicted cost, breakdown |
| 2 | Cost | cost_optimization | Savings, strategy |
| 3 | Delay | delay_prediction | Hours delay, factors |
| 4 | Forecast | demand_forecasting | Demand value, trend |
| 5 | Quality | quality_prediction | Quality score, rating |
| 6 | Throughput | fuel_consumption | Fuel liters, cost |
| 7 | Optimize | route_optimization | Best route, savings |
| 8 | Cost Analysis | cost_optimization | Savings, strategy |
| 9 | Time | time_optimization | Time saved, transport |
| 10 | Rake Planner | vehicle_allocation | Available rakes, capacity |
| 11 | Materials | material_recommendation | Best material, price |
| 12 | Risk | risk_assessment | Risk score, level |
| 13 | Decision | decision_support | Recommendations, actions |
| 14 | Monitoring | anomaly_detection | Anomalies, severity |
| 15 | Supplier | supplier_performance | Score, grade, count |
| 16 | Scenario | scenario_analysis | Best/worst/expected cases |
| 17 | Maintenance | predictive_maintenance | Maintenance needs, time |
| 18 | Satisfaction | customer_satisfaction | Score, rating, improvements |

---

## 🚀 Implementation Priority

### **Phase 1: Core Pages (High Priority)**
1. Cost Page (cost_prediction + cost_optimization)
2. Delay Page (delay_prediction)
3. Forecast Page (demand_forecasting)
4. Optimization Page (route_optimization)
5. Risk Page (risk_assessment)

### **Phase 2: Secondary Pages (Medium Priority)**
6. Quality Page (quality_prediction)
7. Throughput Page (fuel_consumption)
8. Time Optimization (time_optimization)
9. Vehicle Allocation (vehicle_allocation)
10. Material Recommendation (material_recommendation)

### **Phase 3: Advanced Pages (Lower Priority)**
11. Decision Support (decision_support)
12. Anomaly Detection (anomaly_detection)
13. Supplier Management (supplier_performance)
14. Scenario Analysis (scenario_analysis)
15. Predictive Maintenance (predictive_maintenance)
16. Customer Satisfaction (customer_satisfaction)

---

## 💻 Template for Adding ML to Any Page

```javascript
import { useMLPredictions } from '../context/MLPredictionsContext'

export default function MyPage() {
  const { getPrediction, dataImported } = useMLPredictions()

  if (!dataImported) {
    return (
      <div className="alert">
        Please import data from Data Import Center first
      </div>
    )
  }

  // Get your model prediction
  const prediction = getPrediction('model_name')

  if (!prediction) {
    return <div>Loading predictions...</div>
  }

  return (
    <div>
      <h1>My Page</h1>
      <p>Prediction: {prediction.result}</p>
      <p>Confidence: {prediction.confidence * 100}%</p>
      {/* Display other prediction details */}
    </div>
  )
}
```

---

## ✅ COMPLETE MAPPING DONE

All 17 ML models mapped to pages. Each page now knows:
- Which ML model to use
- What data to display
- How to format output
- Where to get predictions

**Ready to implement!** 🎉
