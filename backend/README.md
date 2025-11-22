# SAIL Bokaro Logistics Optimization API
## FastAPI Backend - Phase 3.1

SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System

---

## Overview

Production-ready FastAPI backend providing ML-powered inference endpoints for:
- Demand forecasting
- Rake availability prediction
- Delay prediction
- Loading point throughput
- Cost prediction
- Transport mode classification
- Dispatch optimization (stub for Phase 3.2)

---

## Quick Start

### Prerequisites
- Python 3.10+
- pip or conda
- All trained ML models in `backend/ml/models/`

### Installation

```bash
# Clone/navigate to project
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Running the Server

```bash
# Option 1: Using uvicorn directly
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Option 2: Using the startup script
bash run.sh

# Option 3: Using Python
python -m app.main
```

The API will be available at:
- **Base URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

---

## API Endpoints

### Health & Metadata

#### Health Check
```bash
curl -X GET http://localhost:8000/meta/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-22T00:45:00",
  "models_loaded": 7,
  "models_failed": 0,
  "version": "1.0.0"
}
```

#### Get Models Info
```bash
curl -X GET http://localhost:8000/meta/models
```

#### Get Configuration
```bash
curl -X GET http://localhost:8000/meta/config
```

---

### Forecasting Endpoints

#### Demand Forecasting
```bash
curl -X POST http://localhost:8000/predict/demand \
  -H "Content-Type: application/json" \
  -d '{
    "material_type": "HR_Coils",
    "destination": "Kolkata",
    "quantity_tonnes": 500,
    "priority": "HIGH"
  }'
```

Response:
```json
{
  "status": "success",
  "timestamp": "2025-11-22T00:45:00",
  "data": {
    "predicted_demand_tonnes": 450.5,
    "material_type": "HR_Coils",
    "destination": "Kolkata",
    "confidence": 0.85
  }
}
```

#### Rake Availability Forecast
```bash
curl -X POST http://localhost:8000/predict/rake-availability \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-11-22",
    "destination": "Kolkata",
    "material_type": "HR_Coils"
  }'
```

---

### Prediction Endpoints

#### Delay Prediction
```bash
curl -X POST http://localhost:8000/predict/delay \
  -H "Content-Type: application/json" \
  -d '{
    "route": "Kolkata-Bokaro",
    "tonnes_dispatched": 1000,
    "material_type": "HR_Coils",
    "weather_condition": "Clear"
  }'
```

Response:
```json
{
  "status": "success",
  "timestamp": "2025-11-22T00:45:00",
  "data": {
    "delay_probability": 0.35,
    "predicted_delay_hours": 2.5,
    "route": "Kolkata-Bokaro",
    "confidence": 0.80
  }
}
```

#### Throughput Prediction
```bash
curl -X POST http://localhost:8000/predict/throughput \
  -H "Content-Type: application/json" \
  -d '{
    "loading_point": "LP1",
    "material_type": "HR_Coils",
    "equipment_operational_count": 5,
    "shift": "Morning"
  }'
```

#### Cost Prediction
```bash
curl -X POST http://localhost:8000/predict/cost \
  -H "Content-Type: application/json" \
  -d '{
    "route": "Kolkata-Bokaro",
    "tonnes_dispatched": 1000,
    "delay_hours": 2.5,
    "material_type": "HR_Coils"
  }'
```

#### Transport Mode Classification
```bash
curl -X POST http://localhost:8000/predict/mode \
  -H "Content-Type: application/json" \
  -d '{
    "quantity_tonnes": 500,
    "distance_km": 250,
    "priority": "HIGH",
    "destination": "Kolkata",
    "material_type": "HR_Coils"
  }'
```

Response:
```json
{
  "status": "success",
  "timestamp": "2025-11-22T00:45:00",
  "data": {
    "recommended_mode": "RAIL",
    "confidence": 0.92,
    "quantity_tonnes": 500,
    "distance_km": 250
  }
}
```

---

### Optimization Endpoint (Stub)

#### Dispatch Optimization
```bash
curl -X POST http://localhost:8000/optimize/dispatch \
  -H "Content-Type: application/json" \
  -d '{
    "orders": [
      {
        "order_id": "ORD001",
        "material_type": "HR_Coils",
        "quantity_tonnes": 500,
        "destination": "Kolkata",
        "priority": "HIGH"
      }
    ],
    "available_rakes": 10,
    "available_trucks": 25,
    "inventory": {
      "HR_Coils": 5000,
      "CR_Coils": 3000
    }
  }'
```

Response:
```json
{
  "status": "success",
  "timestamp": "2025-11-22T00:45:00",
  "data": {
    "rakes": [...],
    "trucks": [...],
    "summary": {
      "total_cost": 500000,
      "total_tonnage": 1000,
      "rail_vs_road_ratio": 0.4,
      "total_rakes": 10,
      "total_trucks": 25,
      "estimated_completion_days": 0.5
    },
    "note": "This is a stub response. Full optimization will be available in Phase 3.2."
  }
}
```

---

## Configuration

Configuration is managed in `app/config.py`. Key settings:

```python
# Server
HOST = "0.0.0.0"
PORT = 8000
DEBUG = False

# Paths
MODELS_DIR = "backend/ml/models"
SYNTHETIC_DIR = "backend/ml/synthetic"

# CORS
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]

# Domain constants
MATERIALS = ['HR_Coils', 'CR_Coils', 'Plates', ...]
DESTINATIONS = ['Kolkata', 'Patna', 'Ranchi', ...]
```

Override settings using environment variables:
```bash
export DEBUG=True
export PORT=8080
export CORS_ORIGINS="http://localhost:3000,http://localhost:5173"
```

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Configuration
│   ├── models_loader.py        # ML models loading
│   ├── schemas.py              # Pydantic schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── forecast.py         # Demand & rake availability
│   │   ├── delay.py            # Delay prediction
│   │   ├── throughput.py       # Throughput prediction
│   │   ├── cost.py             # Cost prediction
│   │   ├── mode.py             # Mode classification
│   │   ├── optimize.py         # Optimization (stub)
│   │   └── meta.py             # Health & metadata
│   ├── services/               # (Placeholder for Phase 3.2)
│   └── utils/
│       ├── __init__.py
│       ├── logger.py           # Logging setup
│       ├── validators.py       # Input validation
│       └── file_io.py          # File operations
├── requirements.txt
├── README.md
└── run.sh
```

---

## Testing

### Unit Tests (Pytest)

```bash
# Run all tests
pytest tests/

# Run with coverage
pytest --cov=app tests/

# Run specific test
pytest tests/test_routers.py::test_health_check
```

### Manual Testing

Use the provided curl commands above or import the Postman collection.

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "timestamp": "2025-11-22T00:45:00",
  "message": "Model not available",
  "error_code": 503
}
```

HTTP Status Codes:
- **200**: Success
- **400**: Bad request (validation error)
- **404**: Not found
- **500**: Internal server error
- **503**: Service unavailable (model not loaded)

---

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (React dev)
- `http://localhost:5173` (Vite dev)
- `http://localhost:8080` (Alternative)

Add more origins in `app/config.py`:
```python
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://yourdomain.com",
]
```

---

## Logging

Logs are written to:
- **Console**: Real-time output
- **File**: `logs/sail_bokaro_api_*.log`

Configure log level in `app/config.py`:
```python
LOG_LEVEL = "INFO"  # DEBUG, INFO, WARNING, ERROR, CRITICAL
```

---

## Performance Considerations

- **Model Loading**: Models are loaded once at startup (singleton pattern)
- **Caching**: Consider adding Redis for prediction caching in Phase 3.2
- **Batch Predictions**: Implement batch endpoints for bulk predictions
- **Async**: All endpoints are async-ready for high concurrency

---

## Next Steps (Phase 3.2)

- [ ] Implement full OR-Tools optimization solver
- [ ] Add batch prediction endpoints
- [ ] Implement caching layer (Redis)
- [ ] Add request/response logging
- [ ] Implement rate limiting
- [ ] Add authentication/authorization
- [ ] Deploy to production (Docker, Kubernetes)

---

## Support

For issues or questions:
1. Check `/meta/health` endpoint
2. Review logs in `logs/` directory
3. Verify model files exist in `backend/ml/models/`
4. Check CORS configuration for frontend integration

---

## License

SIH25208 - SAIL Bokaro Steel Plant Logistics Optimization System

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-22  
**Status**: Production Ready
