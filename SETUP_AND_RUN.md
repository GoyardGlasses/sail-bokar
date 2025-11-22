# SAIL Bokaro Logistics Optimization System - Setup & Run Guide

## System Overview

This is a full-stack application with:
- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts
- **Backend**: FastAPI + Python ML Models
- **Features**: Demand forecasting, delay prediction, throughput analysis, cost optimization, and dispatch optimization

---

## Prerequisites

- **Node.js** (v16+) - for frontend
- **Python** (v3.8+) - for backend
- **npm** or **yarn** - for package management

---

## Quick Start (Both Servers)

### 1. Start Backend Server

Open a terminal and navigate to the backend directory:

```bash
cd c:\Users\Admin\CascadeProjects\backend
uvicorn app.main:app --reload
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

### 2. Start Frontend Server

Open another terminal and navigate to the frontend directory:

```bash
cd c:\Users\Admin\CascadeProjects\frontend
npm run dev
```

Expected output:
```
➜  Local:   http://localhost:5173/
```

### 3. Access the Application

Open your browser and go to:
- **Main Dashboard**: http://localhost:5173
- **API Documentation**: http://127.0.0.1:8000/api/docs
- **API Health Check**: http://127.0.0.1:8000/meta/health

---

## Available Pages

### Core Pages
- **Dashboard** (`/`) - Main landing page with KPIs and metrics
- **Modern Dashboard** (`/dashboard`) - Modern UI with charts and analytics
- **Operations Hub** (`/operations-hub`) - Yard operations and AI assistant
- **Rake Planner** (`/rake-planner`) - Optimization parameters and planning

### Analysis Pages
- **Demand Forecast** (`/forecast`) - Demand prediction analysis
- **Delay Prediction** (`/delay`) - Delay forecasting
- **Throughput** (`/throughput`) - Loading point throughput analysis
- **Cost Analysis** (`/cost`) - Cost prediction and optimization
- **Optimization** (`/optimize`) - Dispatch optimization

### Advanced Features
- **AI Forecast** (`/ai-forecast`) - Advanced AI-powered forecasting
- **Blockchain** (`/blockchain`) - Blockchain integration
- **Advanced Optimization** (`/advanced-optimization`) - Multi-objective optimization
- **3D Visualization** (`/visualization-3d`) - 3D data visualization
- **Scenario Analysis** (`/scenario-analysis`) - What-if scenario analysis
- **ML Models** (`/models`) - Model information and management
- **Admin** (`/admin`) - Administrative controls

---

## Backend API Endpoints

### Health & Metadata
- `GET /meta/health` - API health status
- `GET /meta/models` - Model information
- `GET /meta/config` - API configuration
- `GET /meta/metrics` - System metrics

### Forecasting
- `POST /predict/demand` - Demand forecasting
- `POST /predict/rake-availability` - Rake availability forecasting

### Predictions
- `POST /predict/delay` - Delay prediction
- `POST /predict/throughput` - Throughput prediction
- `POST /predict/cost` - Cost prediction
- `POST /predict/mode` - Transport mode prediction

### Optimization
- `POST /optimize/dispatch` - Dispatch optimization

### API Documentation
- Interactive API docs: http://127.0.0.1:8000/api/docs
- ReDoc documentation: http://127.0.0.1:8000/api/redoc

---

## Frontend Configuration

### Environment Variables

The frontend uses environment variables defined in `.env`:

```
VITE_API_URL=http://127.0.0.1:8000
```

This tells the frontend where to find the backend API.

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

---

## Backend Configuration

### Environment Setup

The backend loads configuration from `app/config.py`. Key settings:

- **API Port**: 8000
- **Debug Mode**: False
- **CORS Origins**: Configured for localhost:5173, 5174, 5175, 5176, 5177
- **Models Directory**: `backend/ml/models`

### Database Configuration

By default, the system uses CSV mode. To use PostgreSQL:

```python
# In app/config.py
USE_CSV_MODE: bool = False
DATABASE_URL: str = "postgresql://user:password@localhost:5432/sihdb"
```

---

## Troubleshooting

### Issue: White Screen on Frontend

**Solution**:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed API requests
4. Verify backend is running at http://127.0.0.1:8000
5. Verify `.env` file has correct `VITE_API_URL`

### Issue: Backend Won't Start

**Solution**:
1. Ensure Python 3.8+ is installed
2. Install dependencies: `pip install -r requirements.txt`
3. Check if port 8000 is already in use
4. Try: `python -m uvicorn app.main:app --reload`

### Issue: CORS Errors

**Solution**:
1. Verify frontend URL is in `CORS_ORIGINS` in `app/config.py`
2. Restart backend server after config changes
3. Clear browser cache and reload

### Issue: Models Not Loading

**Solution**:
1. Check `backend/ml/models` directory exists
2. Verify model files are present
3. Check backend logs for specific model load errors
4. Visit http://127.0.0.1:8000/meta/models for model status

### Issue: Port Already in Use

**Solution**:
```bash
# Find process using port 5173 (frontend)
netstat -ano | findstr :5173

# Find process using port 8000 (backend)
netstat -ano | findstr :8000

# Kill process by PID
taskkill /PID <PID> /F
```

---

## Development Workflow

### Making Changes

1. **Frontend Changes**:
   - Edit files in `frontend/src/`
   - Vite will hot-reload automatically
   - No need to restart the server

2. **Backend Changes**:
   - Edit files in `backend/app/`
   - Uvicorn will auto-reload with `--reload` flag
   - Check backend logs for errors

### Testing API Endpoints

Use the interactive API docs at: http://127.0.0.1:8000/api/docs

Or use curl:
```bash
curl http://127.0.0.1:8000/meta/health
```

---

## Production Deployment

### Frontend Build

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### Backend Deployment

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

For production, use a production ASGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
```

---

## Key Features

### Modern UI Components
- Responsive sidebar navigation
- Top navigation bar with search and notifications
- Metric cards with trend indicators
- Interactive charts using Recharts
- Data tables with sorting and filtering
- Dark/light theme support

### Backend Features
- ML-powered predictions
- Optimization algorithms
- Real-time metrics collection
- Comprehensive error handling
- CORS support for cross-origin requests
- Prometheus-compatible metrics

### Data Integration
- Mock data for development
- CSV-based data storage
- PostgreSQL database support
- RESTful API endpoints

---

## Support & Documentation

- **API Docs**: http://127.0.0.1:8000/api/docs
- **Component Guide**: See `UI_COMPONENT_GUIDE.md`
- **Implementation Details**: See `MODERN_UI_IMPLEMENTATION.md`

---

## System Status

Both servers should be running:
- ✅ Backend: http://127.0.0.1:8000
- ✅ Frontend: http://localhost:5173

The application is fully functional with:
- ✅ Modern responsive UI
- ✅ Backend API integration
- ✅ Real-time data updates
- ✅ Interactive charts and tables
- ✅ Full navigation and routing
- ✅ Error handling and fallbacks
