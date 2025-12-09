# 🔗 DATABASE INTEGRATION GUIDE

## ✅ WHAT'S BEEN CONNECTED

### Backend Database Router
**File**: `backend/app/routers/database.py` (450+ lines)

**Endpoints Created**:
```
GET  /api/database/shipments              - Get historical shipment data
GET  /api/database/shipments/summary      - Get shipment analytics
GET  /api/database/decisions              - Get historical decision data
GET  /api/database/dispatches             - Get historical dispatch data
GET  /api/database/dispatches/summary     - Get dispatch analytics
GET  /api/database/analytics/materials    - Material-wise analytics
GET  /api/database/analytics/routes       - Route-wise analytics
GET  /api/database/health                 - Database health check
```

### Frontend Integration
**Files Created**:
1. `frontend/src/hooks/useDatabase.js` - React hook for database access
2. `frontend/src/components/DatabaseStatus.jsx` - Database status indicator
3. `frontend/src/pages/DatabaseDashboard.jsx` - Full dashboard with charts

**Files Updated**:
1. `frontend/src/App.jsx` - Added DatabaseDashboard route
2. `frontend/src/components/Layout/Sidebar.jsx` - Added menu item

### Backend Integration
**Files Updated**:
1. `backend/app/main.py` - Added database router import and inclusion

---

## 🚀 HOW TO USE

### 1. Start PostgreSQL
```bash
docker-compose up -d postgres
```

### 2. Initialize Database
```bash
cd backend
python ml/init_database.py
```

### 3. Start Backend
```bash
python -m uvicorn app.main:app --reload
```

### 4. Start Frontend
```bash
cd frontend
npm run dev
```

### 5. Access Database Dashboard
Navigate to: **http://localhost:5173/database-dashboard**

---

## 📊 FRONTEND USAGE

### Using the useDatabase Hook

```javascript
import useDatabase from '../hooks/useDatabase'

export default function MyComponent() {
  const { getShipments, getShipmentsSummary, loading, error } = useDatabase()

  useEffect(() => {
    const fetchData = async () => {
      // Get shipments with filters
      const shipments = await getShipments({
        route: 'bokaro-dhanbad',
        material: 'cr_coils',
        days: 30,
        limit: 100
      })

      // Get summary statistics
      const summary = await getShipmentsSummary(30)
    }
    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    // Your component JSX
  )
}
```

### Available Functions

**Shipments**:
```javascript
const { getShipments, getShipmentsSummary } = useDatabase()

// Get shipments
const data = await getShipments({
  route: 'bokaro-dhanbad',    // optional
  material: 'cr_coils',        // optional
  days: 30,                    // default: 30
  limit: 100                   // default: 100
})

// Get summary
const summary = await getShipmentsSummary(30)
```

**Decisions**:
```javascript
const { getDecisions } = useDatabase()

const data = await getDecisions({
  scenario: 'High Demand Surge',  // optional
  days: 30,
  limit: 100
})
```

**Dispatches**:
```javascript
const { getDispatches, getDispatchesSummary } = useDatabase()

const data = await getDispatches({
  route: 'bokaro-dhanbad',     // optional
  material: 'cr_coils',         // optional
  status: 'delivered',          // optional
  days: 30,
  limit: 100
})

const summary = await getDispatchesSummary(30)
```

**Analytics**:
```javascript
const { getMaterialAnalytics, getRouteAnalytics } = useDatabase()

const materials = await getMaterialAnalytics(30)
const routes = await getRouteAnalytics(30)
```

**Health Check**:
```javascript
const { checkDatabaseHealth } = useDatabase()

const health = await checkDatabaseHealth()
// Returns: { connected: true, records: { shipments: 500, ... } }
```

---

## 📈 DATABASE DASHBOARD

### Features
- ✅ Real-time database statistics
- ✅ Material performance charts
- ✅ Route performance analysis
- ✅ Material distribution pie chart
- ✅ Dispatch status breakdown
- ✅ Detailed data tables
- ✅ Time range filtering (7, 30, 90, 365 days)
- ✅ Dark mode support

### Accessing the Dashboard
1. Click "Database Dashboard" in sidebar under "🚀 ADVANCED FEATURES"
2. Or navigate to: `http://localhost:5173/database-dashboard`

### What You'll See
- **Stats Cards**: Total shipments, average delay, total tonnage, on-time percentage
- **Charts**: Material performance, route performance, material distribution, dispatch status
- **Tables**: Detailed material and route statistics

---

## 🔌 API ENDPOINTS

### Shipments
```bash
# Get shipments
curl "http://localhost:8000/api/database/shipments?route=bokaro-dhanbad&days=30&limit=100"

# Get summary
curl "http://localhost:8000/api/database/shipments/summary?days=30"
```

### Decisions
```bash
# Get decisions
curl "http://localhost:8000/api/database/decisions?scenario=High%20Demand%20Surge&days=30"
```

### Dispatches
```bash
# Get dispatches
curl "http://localhost:8000/api/database/dispatches?route=bokaro-dhanbad&status=delivered&days=30"

# Get summary
curl "http://localhost:8000/api/database/dispatches/summary?days=30"
```

### Analytics
```bash
# Material analytics
curl "http://localhost:8000/api/database/analytics/materials?days=30"

# Route analytics
curl "http://localhost:8000/api/database/analytics/routes?days=30"
```

### Health
```bash
# Check database health
curl "http://localhost:8000/api/database/health"
```

---

## 📊 DATA STRUCTURE

### Shipment Record
```json
{
  "id": 1,
  "date": "2023-01-01",
  "route": "bokaro-dhanbad",
  "material": "cr_coils",
  "tonnage": 45.5,
  "planned_days": 5,
  "actual_days": 6,
  "delay_days": 1,
  "cost": 9100,
  "cost_per_tonne": 200,
  "weather": "clear",
  "traffic_level": "medium",
  "risk_score": 25.5,
  "status": "on-time",
  "accuracy": 92,
  "thickness": "0.5-3.0mm",
  "width": "600-1500mm",
  "length": "coil",
  "density": 7.85
}
```

### Decision Record
```json
{
  "id": 1,
  "date": "2023-01-01",
  "scenario": "High Demand Surge",
  "route": "bokaro-dhanbad",
  "material": "cr_coils",
  "tonnage": 50,
  "severity": "high",
  "outcome": "Success",
  "cost_impact": -500,
  "time_impact": -1,
  "satisfaction_impact": 15,
  "complexity": 0.75,
  "risk_mitigated": 0.85
}
```

### Dispatch Record
```json
{
  "id": 1,
  "order_id": "ORD-1000",
  "customer_id": "CUST-001",
  "customer_name": "Tata Steel",
  "date": "2023-01-01",
  "dispatch_time": "08:00",
  "route": "bokaro-dhanbad",
  "material": "cr_coils",
  "tonnage": 50,
  "vehicle": "Truck-001",
  "driver": "Driver Rajesh",
  "status": "delivered",
  "dispatch_type": "standard",
  "distance": 85,
  "quality_score": 95,
  "satisfaction_score": 5,
  "total_cost": 10000
}
```

---

## 🔍 FILTERING OPTIONS

### Routes Available
- bokaro-dhanbad
- bokaro-hatia
- bokaro-kolkata
- bokaro-patna
- bokaro-ranchi
- bokaro-durgapur
- bokaro-haldia

### Materials Available
- cr_coils
- hr_coils
- plates
- sheets

### Dispatch Statuses
- delivered
- in-transit
- delayed
- diverted
- completed

### Scenarios
- High Demand Surge
- Route Blockage
- Material Shortage
- Weather Crisis
- Cost Spike
- Capacity Crunch
- Quality Issue
- Supplier Delay

---

## 🛠️ TROUBLESHOOTING

### Issue: "Database not available" error
**Solution**: Make sure PostgreSQL is running
```bash
docker-compose up -d postgres
```

### Issue: "Connection refused"
**Solution**: Initialize the database
```bash
cd backend
python ml/init_database.py
```

### Issue: No data showing in dashboard
**Solution**: Check database health
```bash
curl http://localhost:8000/api/database/health
```

### Issue: API returns 500 error
**Solution**: Check backend logs
```bash
# View logs
tail -f backend/ml/logs/training_scheduler.log
```

---

## 📈 NEXT STEPS

### Integrate Database into Existing Pages
You can now replace mock data in any page with real database data:

```javascript
// Before (mock data)
const [data, setData] = useState(mockData)

// After (real data)
const { getShipments } = useDatabase()
useEffect(() => {
  const fetchData = async () => {
    const realData = await getShipments()
    setData(realData)
  }
  fetchData()
}, [])
```

### Pages Ready for Integration
- Historical Data Page
- Historical Decisions Page
- Historical Dispatch Page
- Forecast Page
- Delay Prediction Page
- Cost Analysis Page
- All Analytics Pages

---

## ✅ VERIFICATION CHECKLIST

- [ ] PostgreSQL running (`docker-compose up -d postgres`)
- [ ] Database initialized (`python ml/init_database.py`)
- [ ] Backend running (`python -m uvicorn app.main:app --reload`)
- [ ] Frontend running (`npm run dev`)
- [ ] Database Dashboard accessible (`http://localhost:5173/database-dashboard`)
- [ ] Data displaying in charts and tables
- [ ] No console errors in browser
- [ ] API health check passing (`curl http://localhost:8000/api/database/health`)

---

## 📞 SUPPORT

For issues or questions:
1. Check `SETUP_DATABASE.md` for database setup help
2. Check `SETUP_INSTRUCTIONS.md` for complete setup guide
3. View API docs at `http://localhost:8000/api/docs`
4. Check backend logs in `backend/ml/logs/`

---

**Status**: ✅ FULLY INTEGRATED & READY TO USE
**Last Updated**: Nov 30, 2025
**Integration Level**: Complete - All endpoints connected
