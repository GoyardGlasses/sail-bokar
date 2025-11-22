# Frontend Integration Guide
## SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System

---

## 🎯 Quick Start for Frontend

### Base URL
```
http://localhost:8000
```

### API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 📋 Key Endpoints for Frontend

### 1. Health Check
```bash
GET /meta/health
```

**Response**:
```json
{
  "status": "healthy",
  "models_loaded": 7,
  "models_failed": 0,
  "version": "1.0.0"
}
```

### 2. Optimization (Main Endpoint)
```bash
POST /optimize/dispatch
Content-Type: application/json
```

**Request** (see `docs/api_examples/optimize_sample.json`):
```json
{
  "orders": [
    {
      "order_id": "ORD001",
      "material_type": "HR_Coils",
      "quantity_tonnes": 1000,
      "destination": "Kolkata",
      "priority": "HIGH"
    }
  ],
  "available_rakes": 5,
  "available_trucks": 20,
  "inventory": {"HR_Coils": 5000}
}
```

**Response**:
```json
{
  "status": "success",
  "timestamp": "2025-11-22T01:13:00",
  "data": {
    "rakes": [
      {
        "rake_id": "RAKE_001",
        "destination": "Kolkata",
        "tonnes": 1000,
        "wagons": 58,
        "estimated_cost": 500000,
        "estimated_delay_hours": 2.0
      }
    ],
    "trucks": [...],
    "summary": {
      "total_cost": 632000,
      "total_tonnage": 1022,
      "total_rakes": 1,
      "total_trucks": 1
    },
    "solver_status": "OPTIMAL",
    "solver_time_seconds": 5.2
  }
}
```

### 3. Demand Forecasting
```bash
POST /predict/demand
Content-Type: application/json
```

**Request**:
```json
{
  "material_type": "HR_Coils",
  "destination": "Kolkata",
  "quantity_tonnes": 500,
  "priority": "HIGH"
}
```

### 4. Rake Availability
```bash
POST /predict/rake-availability
Content-Type: application/json
```

**Request**:
```json
{
  "date": "2025-11-22",
  "destination": "Kolkata",
  "material_type": "HR_Coils"
}
```

### 5. Delay Prediction
```bash
POST /predict/delay
Content-Type: application/json
```

**Request**:
```json
{
  "route": "Kolkata-Bokaro",
  "tonnes_dispatched": 1000,
  "material_type": "HR_Coils",
  "weather_condition": "Clear"
}
```

### 6. Throughput Prediction
```bash
POST /predict/throughput
Content-Type: application/json
```

**Request**:
```json
{
  "loading_point": "LP1",
  "material_type": "HR_Coils",
  "equipment_operational_count": 5,
  "shift": "Morning"
}
```

### 7. Cost Prediction
```bash
POST /predict/cost
Content-Type: application/json
```

**Request**:
```json
{
  "route": "Kolkata-Bokaro",
  "tonnes_dispatched": 1000,
  "delay_hours": 2.5,
  "material_type": "HR_Coils"
}
```

### 8. Mode Classification
```bash
POST /predict/mode
Content-Type: application/json
```

**Request**:
```json
{
  "quantity_tonnes": 500,
  "distance_km": 250,
  "priority": "HIGH",
  "destination": "Kolkata",
  "material_type": "HR_Coils"
}
```

### 9. Metrics
```bash
GET /meta/metrics
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "timestamp": "2025-11-22T01:13:00",
    "uptime_seconds": 3600,
    "requests": {
      "/optimize/dispatch": {
        "count": 42,
        "avg_latency_ms": 1250,
        "p99_latency_ms": 2500
      }
    },
    "optimizer": {
      "total_runs": 42,
      "successes": 40,
      "failures": 2,
      "success_rate": 95.24
    }
  }
}
```

---

## 🔐 Admin Endpoints

### Reload Models
```bash
POST /meta/reload-models
X-API-Token: sail-bokaro-admin-token-secret
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "reload_results": {
      "demand": true,
      "rake_availability": true,
      ...
    },
    "registry_status": {...}
  }
}
```

---

## 📊 Domain Constants

### Materials
- HR_Coils
- CR_Coils
- Plates
- Wire_Rods
- TMT_Bars
- Pig_Iron
- Billets

### Destinations
- Kolkata
- Patna
- Ranchi
- Durgapur
- Haldia

### Loading Points
- LP1
- LP2
- LP3

### Priorities
- HIGH
- MEDIUM
- LOW

### Transport Modes
- RAIL
- ROAD

---

## 🚀 Frontend Integration Checklist

- [ ] Health check endpoint working
- [ ] Optimization endpoint callable
- [ ] Demand forecast working
- [ ] Rake availability working
- [ ] Delay prediction working
- [ ] Throughput prediction working
- [ ] Cost prediction working
- [ ] Mode classification working
- [ ] Metrics endpoint accessible
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Response parsing correct

---

## 🔄 Typical Frontend Flow

1. **Load Page**
   - Call `/meta/health` to check API availability
   - Display health status

2. **User Enters Orders**
   - Collect order details (material, quantity, destination, priority)
   - Collect available resources (rakes, trucks, inventory)

3. **Submit Optimization**
   - POST to `/optimize/dispatch`
   - Show loading spinner
   - Parse response

4. **Display Results**
   - Show rake allocation
   - Show truck allocation
   - Show cost summary
   - Show KPIs (utilization, completion time)

5. **Optional: Get Predictions**
   - Call individual prediction endpoints for insights
   - Display in dashboard

---

## 📱 Electron Integration

### Backend Process
```javascript
const { spawn } = require('child_process');

const backendProcess = spawn('python', [
  '-m', 'uvicorn',
  'app.main:app',
  '--host', 'localhost',
  '--port', '8000'
]);
```

### API Calls
```javascript
const response = await fetch('http://localhost:8000/optimize/dispatch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(optimizationRequest)
});
```

---

## ⚠️ Error Handling

### Common Status Codes
- **200**: Success
- **400**: Bad request
- **422**: Validation error
- **500**: Server error
- **503**: Service unavailable (models not loaded)

### Error Response Format
```json
{
  "status": "error",
  "timestamp": "2025-11-22T01:13:00",
  "message": "Error description",
  "error_code": 500
}
```

---

## 🔗 CORS Configuration

The API accepts requests from:
- `http://localhost:3000` (React dev)
- `http://localhost:5173` (Vite dev)
- `http://localhost:8080` (Alternative)

For Electron, add to CORS_ORIGINS in config.

---

## 📚 Sample Payloads

See `docs/api_examples/` for complete sample payloads:
- `optimize_sample.json` - Optimization request
- `forecast_sample.json` - Forecast requests

---

**Ready for Frontend Integration!**

