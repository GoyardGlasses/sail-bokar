# Data Integration Guide - Complete Feature Integration

## Overview
All features now automatically use imported data when available. The system follows this priority:
1. **Imported Data** (from Data Import Center) - Highest priority
2. **Stored Data** (localStorage from manual edits) - Medium priority
3. **Mock Data** (default fallback) - Lowest priority

## How It Works

### 1. Data Import Flow
```
User uploads JSON
    ↓
Data Import Center validates
    ↓
Saves to localStorage as 'imported_data'
    ↓
All features detect and use it automatically
    ↓
Features provide analysis based on uploaded data
```

### 2. Features Integrated

#### ✅ Inventory Management Dashboard
- **Uses**: materials, rakes, loadingPoints, sidings
- **Shows**: Total inventory, material details, rake status, loading point utilization
- **Updates**: Real-time as data changes

#### ✅ CMO Stockyards Dashboard
- **Uses**: stockyards data
- **Shows**: Stockyard locations, capacity, utilization, demand
- **Updates**: Automatically with imported data

#### ✅ Order Management Dashboard
- **Uses**: orders data
- **Shows**: Customer orders, priority, status, deadlines
- **Updates**: Real-time order tracking

#### ✅ Rake Formation Dashboard
- **Uses**: materials, rakes, orders, routes
- **Shows**: Optimal rake composition, cost analysis, utilization
- **Updates**: Recalculates with new data

#### ✅ Product-Wagon Matrix Dashboard
- **Uses**: materials, compatibility matrix
- **Shows**: Product-wagon compatibility, loading recommendations
- **Updates**: Dynamic matching

#### ✅ Rail vs Road Optimization Dashboard
- **Uses**: routes, orders, materials
- **Shows**: Cost comparison, time analysis, recommendations
- **Updates**: Optimizes based on imported routes

#### ✅ Cost Analysis Dashboard
- **Uses**: orders, materials, routes
- **Shows**: Detailed cost breakdown, per-unit costs, margins
- **Updates**: Real-time cost calculations

#### ✅ Production Recommendation Dashboard
- **Uses**: orders, materials, constraints
- **Shows**: Production recommendations, demand forecasting
- **Updates**: Based on order patterns

#### ✅ Constraints Management Dashboard
- **Uses**: constraints, materials, rakes
- **Shows**: Active constraints, violations, impact analysis
- **Updates**: Real-time constraint checking

#### ✅ Scenario Analysis Dashboard
- **Uses**: All data (materials, orders, rakes, routes)
- **Shows**: Multiple scenario comparisons, KPI analysis
- **Updates**: Compares scenarios with imported data

## Implementation Pattern

### For Each Feature
```typescript
import { useImportedData } from '../../../hooks/useImportedData'

export default function FeatureDashboard() {
  const { data: importedData, isLoaded } = useImportedData()
  
  // Use imported data if available, fallback to mock
  useEffect(() => {
    if (!isLoaded) return
    
    if (importedData?.materials) {
      setMaterials(importedData.materials)
    } else {
      setMaterials(mockData.materials)
    }
  }, [isLoaded, importedData])
  
  // Rest of component...
}
```

## Sample Data Structure

```json
{
  "stockyards": [
    {
      "id": "sy-001",
      "name": "Bokaro Main",
      "location": "Bokaro",
      "capacity": 10000,
      "currentStock": 7500,
      "materials": ["Iron Ore", "Coking Coal"]
    }
  ],
  "materials": [
    {
      "id": "m-001",
      "name": "Iron Ore",
      "quantity": 8500,
      "unit": "tonnes",
      "price": 3200,
      "grade": "Premium",
      "stockyard": "Bokaro Main"
    }
  ],
  "orders": [
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
  ],
  "rakes": [
    {
      "id": "rk-001",
      "name": "BOKARO-001",
      "capacity": 1200,
      "status": "available",
      "location": "Bokaro Siding-1",
      "wagons": 48,
      "lastMaintenance": "2025-11-20"
    }
  ],
  "routes": [
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
  ],
  "loadingPoints": [
    {
      "id": "lp-001",
      "name": "Bokaro Siding-1",
      "capacity": 1200,
      "utilization": 92,
      "material": "Iron Ore",
      "throughput": 1104
    }
  ],
  "constraints": [
    {
      "id": "c-001",
      "name": "Minimum Rake Size",
      "rule": "Min 300 tonnes per rake",
      "severity": "critical",
      "status": "active"
    }
  ]
}
```

## Usage Workflow

### Step 1: Prepare Your Data
- Create JSON file with structure above
- Ensure all required fields are present
- Validate JSON format

### Step 2: Upload Data
1. Navigate to **📥 DATA MANAGEMENT → Data Import Center**
2. Click **Upload Data** tab
3. Select your JSON file
4. System validates and imports

### Step 3: View Results
- Navigate to any feature dashboard
- Data automatically loads from imported source
- All calculations and analysis use your data
- Real-time updates as you modify

### Step 4: Export Results
- Each feature shows analysis results
- Download reports from Reporting dashboard
- Export data for further analysis

## Data Validation

### Required Fields
- **stockyards**: id, name, location, capacity
- **materials**: id, name, quantity, unit, price
- **orders**: id, product, quantity, destination, priority
- **rakes**: id, name, capacity, status, location
- **routes**: id, origin, destination, distance
- **loadingPoints**: id, name, capacity, utilization
- **constraints**: id, name, rule, severity

### Optional Fields
- Any additional fields are preserved and available
- Features use only required fields for core functionality
- Extra fields can be used for custom analysis

## Troubleshooting

### Data Not Loading
1. Check JSON format validity
2. Verify all required fields present
3. Check browser console for errors
4. Try uploading sample data first

### Features Showing Mock Data
1. Ensure data was imported successfully
2. Check "Import Status" tab in Data Import Center
3. Verify data structure matches template
4. Try refreshing the page

### Calculations Incorrect
1. Verify numeric fields are numbers, not strings
2. Check for missing required fields
3. Ensure data relationships are correct
4. Review data in Import Status tab

## Performance Notes

- All data stored in localStorage (~5-10MB limit)
- Calculations happen client-side (instant)
- No network calls needed after import
- Works offline after import

## Future Enhancements

- [ ] Backend database integration
- [ ] Real-time data sync
- [ ] Advanced filtering and search
- [ ] Custom report generation
- [ ] Data export to multiple formats
- [ ] Collaborative data sharing
- [ ] Version control for data

## Support

For issues or questions:
1. Check this guide first
2. Review sample data template
3. Verify JSON structure
4. Check browser console for errors
5. Try with sample data provided

---

**Last Updated**: November 24, 2025
**Status**: Production Ready
**All Features**: Integrated & Tested
