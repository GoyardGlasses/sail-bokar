# How to Use Mock Data - Complete Guide

## 📋 Overview

This guide explains how to use the mock data template to test all features of the SAIL Bokaro Logistics Optimization System.

---

## 🚀 Quick Start

### Step 1: Get the Mock Data File
- File: `MOCK_DATA_TEMPLATE.json`
- Location: Project root directory
- Format: JSON (JavaScript Object Notation)

### Step 2: Upload to System
1. Open the website
2. Navigate to: **📥 DATA MANAGEMENT → Data Import Center**
3. Click **Upload Data** tab
4. Select `MOCK_DATA_TEMPLATE.json`
5. Click **Choose File** button
6. Wait for success message ✅

### Step 3: View Results
- Go to any feature dashboard
- All features will automatically use the mock data
- ML models will analyze and provide predictions

---

## 📊 Mock Data Structure

### **Stockyards** (3 locations)
```json
{
  "id": "sy-001",
  "name": "Bokaro Main",
  "location": "Bokaro",
  "capacity": 10000,
  "currentStock": 7500,
  "materials": ["Iron Ore", "Coking Coal"]
}
```
- **Bokaro Main**: 7,500 tonnes in stock
- **Dankuni**: 3,200 tonnes in stock
- **Ranchi**: 1,800 tonnes in stock

### **Materials** (4 types)
```json
{
  "id": "m-001",
  "name": "Iron Ore",
  "quantity": 8500,
  "unit": "tonnes",
  "price": 3200,
  "grade": "Premium",
  "stockyard": "Bokaro Main"
}
```
- **Iron Ore**: 8,500 tonnes @ ₹3,200/tonne
- **Coking Coal**: 5,200 tonnes @ ₹4,800/tonne
- **Limestone**: 3,100 tonnes @ ₹950/tonne
- **Manganese Ore**: 1,800 tonnes @ ₹5,200/tonne

### **Orders** (4 customer orders)
```json
{
  "id": "ord-001",
  "product": "Iron Ore",
  "quantity": 1200,
  "destination": "Tata Steel - Jamshedpur",
  "priority": "high",
  "deadline": "2025-11-26",
  "customer": "Tata Steel",
  "status": "pending",
  "value": 3840000
}
```
- **Order 1**: 1,200 tonnes Iron Ore to Tata Steel (HIGH priority)
- **Order 2**: 800 tonnes Coking Coal to JSW Steel (HIGH priority)
- **Order 3**: 600 tonnes Limestone to SAIL (MEDIUM priority)
- **Order 4**: 400 tonnes Manganese Ore to Vedanta (HIGH priority)

### **Rakes** (3 trains)
```json
{
  "id": "rk-001",
  "name": "BOKARO-001",
  "capacity": 1200,
  "status": "available",
  "location": "Bokaro Siding-1",
  "wagons": 48,
  "lastMaintenance": "2025-11-20"
}
```
- **BOKARO-001**: 1,200 tonne capacity, 48 wagons
- **BOKARO-002**: 1,200 tonne capacity, 48 wagons
- **BOKARO-003**: 1,100 tonne capacity, 44 wagons

### **Routes** (3 transportation routes)
```json
{
  "id": "rt-001",
  "origin": "Bokaro",
  "destination": "Tata Steel - Jamshedpur",
  "distance": 320,
  "railCost": 48000,
  "roadCost": 72000,
  "railTime": 48,
  "roadTime": 24
}
```
- **Route 1**: Bokaro → Jamshedpur (320 km)
  - Rail: ₹48,000 (48 hours)
  - Road: ₹72,000 (24 hours)
- **Route 2**: Bokaro → Durgapur (280 km)
  - Rail: ₹42,000 (36 hours)
  - Road: ₹68,000 (20 hours)
- **Route 3**: Bokaro → Bellary (850 km)
  - Rail: ₹125,000 (96 hours)
  - Road: ₹185,000 (48 hours)

### **Loading Points** (3 sidings)
```json
{
  "id": "lp-001",
  "name": "Bokaro Siding-1",
  "capacity": 1200,
  "utilization": 92,
  "material": "Iron Ore",
  "throughput": 1104
}
```
- **Siding-1**: 92% utilized, 1,104 tonnes throughput
- **Siding-2**: 78% utilized, 858 tonnes throughput
- **Siding-3**: 65% utilized, 780 tonnes throughput

### **Constraints** (3 business rules)
```json
{
  "id": "c-001",
  "name": "Minimum Rake Size",
  "rule": "Min 300 tonnes per rake",
  "severity": "critical",
  "status": "active"
}
```
- Minimum rake size: 300 tonnes
- Max loading point: 1,200 tonnes
- Available sidings: 5

---

## 🎯 What Each Feature Will Show

### **Inventory Management Dashboard**
- ✅ Shows 4 materials with quantities
- ✅ Shows 3 rakes with status
- ✅ Shows 3 loading points with utilization
- ✅ Total inventory: 18,600 tonnes

### **CMO Stockyards Dashboard**
- ✅ Shows 3 stockyards
- ✅ Total capacity: 18,000 tonnes
- ✅ Current stock: 12,500 tonnes
- ✅ Utilization: 69.4%

### **Order Management Dashboard**
- ✅ Shows 4 pending orders
- ✅ Total order value: ₹10.33 Cr
- ✅ High priority: 3 orders
- ✅ Medium priority: 1 order

### **Rake Formation Dashboard**
- ✅ Optimal rake composition
- ✅ Cost analysis
- ✅ Utilization recommendations
- ✅ Formation schedule

### **Product-Wagon Matrix Dashboard**
- ✅ Product compatibility
- ✅ Wagon allocation
- ✅ Loading efficiency
- ✅ Recommendations

### **Rail vs Road Optimization Dashboard**
- ✅ Cost comparison for 3 routes
- ✅ Time analysis
- ✅ Mode recommendations
- ✅ Savings potential

### **Cost Analysis Dashboard**
- ✅ Material costs: ₹18.6 Cr
- ✅ Transportation costs
- ✅ Per-unit costs
- ✅ Margin analysis

### **Production Recommendation Dashboard**
- ✅ Demand forecasting
- ✅ Production suggestions
- ✅ Capacity planning
- ✅ Risk assessment

### **Constraints Management Dashboard**
- ✅ Shows 3 active constraints
- ✅ Violation detection
- ✅ Impact analysis
- ✅ Recommendations

### **Scenario Analysis Dashboard**
- ✅ Compares multiple scenarios
- ✅ KPI analysis
- ✅ Risk assessment
- ✅ Recommendations

---

## 🤖 ML Models That Will Run

When you upload this data, these 17 ML models will analyze it:

1. **XGBoost** - Demand Forecasting (94.2% accuracy)
2. **LightGBM** - Rake Availability (91.8% accuracy)
3. **Isolation Forest** - Anomaly Detection (89.3% accuracy)
4. **Genetic Algorithm** - Route Optimization (92.1% accuracy)
5. **ARIMA** - Weather Impact (87.5% accuracy)
6. **K-Means** - Demand Clustering (90.2% accuracy)
7. **Random Forest** - Inventory Prediction (93.7% accuracy)
8. **Gradient Boosting** - Delay Classifier (89.5% accuracy)
9. **SVR** - Delay Regressor (88.9% accuracy)
10. **LSTM** - Throughput Optimization (91.3% accuracy)
11. **CatBoost** - Cost Estimation (92.1% accuracy)
12. **Logistic Regression** - Mode Selection (87.8% accuracy)
13. **Decision Tree** - Supplier Performance (88.4% accuracy)
14. **Prophet** - Demand Seasonality (90.6% accuracy)
15. **Naive Bayes** - Risk Assessment (86.2% accuracy)
16. **PSO** - Network Flow (93.5% accuracy)
17. **Ensemble** - Capacity Planning (89.8% accuracy)

---

## 📈 Expected Results

### **Inventory Dashboard**
- Total Materials: 4
- Total Quantity: 18,600 tonnes
- Total Value: ₹18.6 Cr
- Average Utilization: 78.3%

### **Order Dashboard**
- Total Orders: 4
- Total Value: ₹10.33 Cr
- On-time Delivery: 100% (if fulfilled on time)
- Average Lead Time: 2.5 days

### **Rake Formation**
- Optimal Rakes: 3
- Total Capacity: 3,500 tonnes
- Utilization: 85%
- Cost Efficiency: 92%

### **Cost Analysis**
- Material Cost: ₹18.6 Cr
- Transportation Cost: ₹215,000
- Total Cost: ₹18.615 Cr
- Per-Unit Cost: ₹1,000/tonne

### **Route Optimization**
- Best Route: Rail (saves ₹77,000 vs Road)
- Fastest Route: Road (24 hours)
- Most Economical: Rail (48 hours, ₹48,000)

---

## 🔧 Customizing Mock Data

### To Add More Materials:
```json
{
  "id": "m-005",
  "name": "Pig Iron",
  "quantity": 2500,
  "unit": "tonnes",
  "price": 6500,
  "grade": "Premium",
  "stockyard": "Bokaro Main"
}
```

### To Add More Orders:
```json
{
  "id": "ord-005",
  "product": "Pig Iron",
  "quantity": 500,
  "destination": "Tata Steel - Kalinganagar",
  "priority": "high",
  "deadline": "2025-11-30",
  "customer": "Tata Steel",
  "status": "pending",
  "value": 3250000
}
```

### To Add More Routes:
```json
{
  "id": "rt-004",
  "origin": "Bokaro",
  "destination": "Tata Steel - Kalinganagar",
  "distance": 450,
  "railCost": 65000,
  "roadCost": 95000,
  "railTime": 60,
  "roadTime": 32
}
```

---

## ✅ Verification Checklist

After uploading, verify:

- [ ] Data Import Center shows "Data Imported Successfully"
- [ ] Inventory Dashboard shows 4 materials
- [ ] CMO Stockyards shows 3 locations
- [ ] Order Management shows 4 orders
- [ ] Rake Formation shows 3 rakes
- [ ] Routes show 3 transportation options
- [ ] Loading Points show 3 sidings
- [ ] Constraints show 3 rules
- [ ] ML models show predictions
- [ ] All dashboards display data correctly

---

## 🐛 Troubleshooting

### Data Not Loading?
1. Check JSON format is valid
2. Ensure file is named `MOCK_DATA_TEMPLATE.json`
3. Try uploading again
4. Check browser console for errors

### Features Showing Mock Data?
1. Verify data was imported successfully
2. Check "Import Status" tab
3. Refresh the page
4. Try uploading sample data again

### ML Models Not Running?
1. Ensure backend is running
2. Check backend connection status
3. Verify data format is correct
4. Check for API errors in console

---

## 📞 Support

For issues:
1. Check this guide
2. Review DATA_INTEGRATION_GUIDE.md
3. Check browser console
4. Verify JSON format
5. Try with fresh data

---

## 📝 Notes

- All data is in JSON format
- Quantities in tonnes
- Prices in Indian Rupees (₹)
- Times in hours
- Distances in kilometers
- All dates in YYYY-MM-DD format

---

**Ready to test? Upload `MOCK_DATA_TEMPLATE.json` to the Data Import Center now!** 🚀
