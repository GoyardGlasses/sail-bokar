# SAIL Bokaro Logistics Optimization System - Complete Startup Guide

## Quick Start (5 Minutes)

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Step 1: Install Backend Dependencies
```bash
cd C:\Users\Admin\CascadeProjects\backend
pip install -r requirements.txt
```

### Step 2: Start Backend Server
```bash
cd C:\Users\Admin\CascadeProjects\backend
python -m uvicorn app.main:app --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

### Step 3: Start Frontend (in new terminal)
```bash
cd C:\Users\Admin\CascadeProjects\frontend
npm install  # Only needed first time
npm run dev
```

**Expected Output:**
```
VITE v5.0.0  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### Step 4: Access the Application
- **Web Interface**: http://localhost:5173
- **API Documentation**: http://127.0.0.1:8000/docs
- **API Redoc**: http://127.0.0.1:8000/redoc

---

## Complete Setup Instructions

### Backend Setup

#### 1. Navigate to Backend Directory
```bash
cd C:\Users\Admin\CascadeProjects\backend
```

#### 2. Create Virtual Environment (Optional but Recommended)
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

This installs:
- **FastAPI**: Web framework
- **Uvicorn**: ASGI server
- **Prophet**: Time series forecasting
- **pymoo**: Multi-objective optimization
- **web3**: Blockchain integration
- **SQLAlchemy**: Database ORM
- **Redis**: Caching
- **WebSockets**: Real-time communication
- And 15+ other dependencies

#### 4. Verify Installation
```bash
python -c "import fastapi; import prophet; import pymoo; print('✓ All dependencies installed')"
```

#### 5. Start Backend
```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Options:**
- `--reload`: Auto-reload on code changes
- `--host 127.0.0.1`: Bind to localhost
- `--port 8000`: Use port 8000
- `--workers 4`: Use 4 worker processes (production)

---

### Frontend Setup

#### 1. Navigate to Frontend Directory
```bash
cd C:\Users\Admin\CascadeProjects\frontend
```

#### 2. Install Dependencies
```bash
npm install
```

This installs:
- **React 18**: UI framework
- **Vite**: Build tool
- **Recharts**: Charts and graphs
- **Lucide React**: Icons
- **Axios**: HTTP client
- **TailwindCSS**: Styling
- And more...

#### 3. Start Development Server
```bash
npm run dev
```

#### 4. Build for Production
```bash
npm run build
```

Output will be in `dist/` directory.

---

## Feature Access Guide

### 1. AI Demand Forecasting
**URL**: http://localhost:5173/ai-forecast

**Features**:
- Select material (HR_Coils, CR_Coils, etc.)
- Set forecast period (7-365 days)
- View predictions with confidence intervals
- Check accuracy metrics (MAE, RMSE, MAPE)

**API Endpoint**: `POST /forecast/demand/predict`

---

### 2. Blockchain Supply Chain
**URL**: http://localhost:5173/blockchain

**Features**:
- Create shipment records
- Track shipment status
- Mine blocks
- View blockchain statistics
- Verify shipment authenticity

**API Endpoint**: `POST /blockchain/shipment/create`

---

### 3. Advanced Optimization
**URL**: http://localhost:5173/advanced-optimization

**Features**:
- Add orders to optimize
- Run multi-objective optimization (NSGA2)
- View Pareto front solutions
- Compare optimization algorithms

**API Endpoint**: `POST /optimize/routes/multi-objective`

---

### 4. 3D Visualization
**URL**: http://localhost:5173/visualization-3d

**Features**:
- 3D warehouse visualization
- Supply chain network map
- Demand heatmaps
- Real-time shipment tracking

**API Endpoint**: `GET /visualization/warehouse/3d/{warehouse_id}`

---

## Testing the System

### Test 1: Backend Health Check
```bash
curl http://127.0.0.1:8000/
```

**Expected Response**:
```json
{
  "status": "success",
  "message": "Welcome to SAIL Bokaro Logistics Optimizer v1.0.0",
  "data": {
    "api_docs": "/api/docs",
    "health": "/meta/health",
    "models": "/meta/models"
  }
}
```

### Test 2: AI Forecasting
```bash
curl -X POST http://127.0.0.1:8000/forecast/demand/predict \
  -H "Content-Type: application/json" \
  -d '{"material": "HR_Coils", "periods": 30}'
```

### Test 3: Blockchain
```bash
curl -X POST http://127.0.0.1:8000/blockchain/shipment/create \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "BOKARO",
    "destination": "Kolkata",
    "material": "HR_Coils",
    "quantity": 500
  }'
```

### Test 4: Advanced Optimization
```bash
curl -X POST http://127.0.0.1:8000/optimize/routes/multi-objective \
  -H "Content-Type: application/json" \
  -d '{
    "orders": [
      {
        "id": "1",
        "material": "HR_Coils",
        "destination": "Kolkata",
        "quantity": 500,
        "distance": 250
      }
    ]
  }'
```

---

## Troubleshooting

### Issue: Backend won't start
**Solution**:
```bash
# Check Python version
python --version  # Should be 3.8+

# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process using port 8000
taskkill /PID <PID> /F

# Try different port
python -m uvicorn app.main:app --port 8001
```

### Issue: Frontend won't start
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -r node_modules package-lock.json
npm install

# Try different port
npm run dev -- --port 3000
```

### Issue: Dependencies installation fails
**Solution**:
```bash
# For Python
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir

# For Node
npm install --legacy-peer-deps
```

### Issue: CORS errors
**Solution**: Backend already has CORS enabled for:
- http://localhost:3000
- http://localhost:5173
- http://127.0.0.1:3000
- http://127.0.0.1:5173

If you need to add more origins, edit `backend/app/config.py`:
```python
CORS_ORIGINS: list = [
    "http://localhost:3000",
    "http://localhost:5173",
    # Add more origins here
]
```

---

## Production Deployment

### Backend Deployment
```bash
# Using Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app.main:app

# Using Docker
docker build -t sail-bokaro-backend .
docker run -p 8000:8000 sail-bokaro-backend
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy dist/ folder to:
# - Netlify
# - Vercel
# - AWS S3 + CloudFront
# - GitHub Pages
# - Your own server
```

---

## Performance Optimization

### Backend
```bash
# Use multiple workers
python -m uvicorn app.main:app --workers 4

# Enable caching
# Redis is configured in config.py

# Database optimization
# Use connection pooling (SQLAlchemy)
```

### Frontend
```bash
# Build optimization
npm run build

# Enable compression
# Gzip enabled in production

# Code splitting
# Vite automatically handles this
```

---

## Monitoring & Logging

### Backend Logs
```bash
# View logs
tail -f logs/app.log

# Enable debug logging
export LOG_LEVEL=DEBUG
python -m uvicorn app.main:app --reload
```

### Frontend Logs
```bash
# Browser console
F12 -> Console tab

# Network requests
F12 -> Network tab

# Application state
F12 -> Application tab
```

---

## API Documentation

### Interactive API Docs
- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

### API Endpoints Summary

#### Forecasting
- `POST /forecast/demand/predict` - Predict demand
- `POST /forecast/demand/train` - Train model
- `GET /forecast/demand/{material}/accuracy` - Get accuracy

#### Blockchain
- `POST /blockchain/shipment/create` - Create shipment
- `PUT /blockchain/shipment/{id}/status` - Update status
- `GET /blockchain/shipment/{id}/history` - Get history
- `POST /blockchain/block/mine` - Mine block
- `GET /blockchain/stats` - Get stats

#### Optimization
- `POST /optimize/routes/multi-objective` - Optimize routes
- `POST /optimize/network/design` - Optimize network
- `GET /optimize/routes/comparison` - Compare methods

#### Visualization
- `GET /visualization/warehouse/3d/{id}` - Warehouse 3D
- `GET /visualization/network/3d` - Network 3D
- `GET /visualization/heatmap/demand` - Demand heatmap
- `GET /visualization/shipment-tracking/3d` - Tracking

---

## Next Steps

1. **Explore the Dashboard**: http://localhost:5173
2. **Check API Docs**: http://127.0.0.1:8000/docs
3. **Try Each Feature**: Visit all pages and test functionality
4. **Read Advanced Guide**: See `ADVANCED_FEATURES_GUIDE.md`
5. **Customize**: Modify code to fit your needs

---

## Support

- **Documentation**: See markdown files in project root
- **API Docs**: http://127.0.0.1:8000/docs
- **Code**: Check service files in `backend/app/services/`
- **Frontend**: Check pages in `frontend/src/pages/`

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  - Dashboard, Forecasting, Blockchain, Optimization     │
│  - 3D Visualization, Charts, Real-time Updates          │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/WebSocket
┌────────────────────▼────────────────────────────────────┐
│                  Backend (FastAPI)                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Services:                                        │   │
│  │ - Demand Forecasting (Prophet)                  │   │
│  │ - Blockchain Tracking (SHA256)                  │   │
│  │ - Advanced Optimization (NSGA2)                 │   │
│  │ - 3D Visualization Data                         │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
    ┌───▼──┐   ┌────▼─────┐  ┌──▼────┐
    │ ML   │   │ Database │  │ Redis │
    │Models│   │(Optional)│  │Cache  │
    └──────┘   └──────────┘  └───────┘
```

---

## License

SAIL Bokaro Logistics Optimization System - SIH25208

**Created**: November 2025
**Version**: 1.0.0
