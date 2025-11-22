# SAIL Bokaro Steel Plant Logistics Optimization System

## 🚀 Complete System Overview

A modern, full-stack logistics optimization platform for SAIL Bokaro Steel Plant featuring AI-powered forecasting, real-time optimization, and an intuitive web interface.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [System Architecture](#system-architecture)
3. [Features](#features)
4. [Installation](#installation)
5. [Running the Application](#running-the-application)
6. [Available Pages](#available-pages)
7. [API Documentation](#api-documentation)
8. [Frontend Components](#frontend-components)
9. [Configuration](#configuration)
10. [Troubleshooting](#troubleshooting)
11. [Development](#development)
12. [Deployment](#deployment)

---

## 🎯 Quick Start

### Prerequisites
- Node.js v16+ (for frontend)
- Python 3.8+ (for backend)
- npm or yarn

### Start Both Servers (2 Terminals)

**Terminal 1 - Backend:**
```bash
cd c:\Users\Admin\CascadeProjects\backend
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd c:\Users\Admin\CascadeProjects\frontend
npm run dev
```

### Access Application
- **Frontend**: http://localhost:5173
- **API Docs**: http://127.0.0.1:8000/api/docs
- **Health Check**: http://127.0.0.1:8000/meta/health

---

## 🏗️ System Architecture

### Frontend Stack
```
React 18.2.0
├── Vite (Build Tool)
├── Tailwind CSS (Styling)
├── React Router v6 (Navigation)
├── Recharts (Charts & Graphs)
├── Lucide React (Icons)
├── Axios (HTTP Client)
└── Zustand (State Management)
```

### Backend Stack
```
FastAPI
├── Python 3.8+
├── Uvicorn (ASGI Server)
├── SQLAlchemy (ORM)
├── Pydantic (Data Validation)
├── LightGBM (ML Models)
├── XGBoost (ML Models)
├── Prophet (Time Series)
└── Web3.py (Blockchain)
```

### Database
- **Default**: CSV Mode (for development)
- **Optional**: PostgreSQL (for production)

---

## ✨ Features

### Core Features
- ✅ **Demand Forecasting** - AI-powered demand prediction
- ✅ **Delay Prediction** - Predict transportation delays
- ✅ **Throughput Analysis** - Loading point throughput optimization
- ✅ **Cost Optimization** - Minimize transportation costs
- ✅ **Dispatch Optimization** - Optimal route planning
- ✅ **Real-time Metrics** - Live system monitoring

### Advanced Features
- ✅ **AI Forecasting** - Advanced ML predictions
- ✅ **Blockchain Integration** - Immutable transaction logs
- ✅ **3D Visualization** - Interactive 3D data visualization
- ✅ **Scenario Analysis** - What-if analysis
- ✅ **Multi-objective Optimization** - Pareto-optimal solutions

### UI Features
- ✅ **Modern Responsive Design** - Works on all devices
- ✅ **Dark/Light Theme** - Theme switching
- ✅ **Interactive Charts** - Recharts visualizations
- ✅ **Data Tables** - Sortable, filterable tables
- ✅ **Real-time Updates** - Live data refresh
- ✅ **Error Handling** - Graceful error management

---

## 📦 Installation

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -c "import fastapi; print(fastapi.__version__)"
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Verify installation
npm list react react-dom vite
```

---

## ▶️ Running the Application

### Development Mode

**Start Backend:**
```bash
cd backend
uvicorn app.main:app --reload
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

Expected output:
```
➜  Local:   http://localhost:5173/
```

### Access the Application
1. Open browser to http://localhost:5173
2. You should see the SAIL Bokaro dashboard
3. Use sidebar to navigate to different pages

---

## 📄 Available Pages

### Dashboard Pages
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Main landing page with KPIs |
| Modern Dashboard | `/dashboard` | Modern UI with charts and analytics |
| Operations Hub | `/operations-hub` | Yard operations and AI assistant |
| Rake Planner | `/rake-planner` | Optimization parameters and planning |

### Analysis Pages
| Page | Route | Description |
|------|-------|-------------|
| Demand Forecast | `/forecast` | Demand prediction analysis |
| Delay Prediction | `/delay` | Delay forecasting |
| Throughput | `/throughput` | Loading point throughput analysis |
| Cost Analysis | `/cost` | Cost prediction and optimization |
| Optimization | `/optimize` | Dispatch optimization |

### Advanced Features
| Page | Route | Description |
|------|-------|-------------|
| AI Forecast | `/ai-forecast` | Advanced AI-powered forecasting |
| Blockchain | `/blockchain` | Blockchain integration |
| Advanced Optimization | `/advanced-optimization` | Multi-objective optimization |
| 3D Visualization | `/visualization-3d` | 3D data visualization |
| Scenario Analysis | `/scenario-analysis` | What-if scenario analysis |
| ML Models | `/models` | Model information and management |
| Admin | `/admin` | Administrative controls |

---

## 🔌 API Documentation

### Interactive API Docs
- **Swagger UI**: http://127.0.0.1:8000/api/docs
- **ReDoc**: http://127.0.0.1:8000/api/redoc

### Health & Metadata Endpoints

```
GET /meta/health
GET /meta/models
GET /meta/config
GET /meta/metrics
POST /meta/reload-models
```

### Forecasting Endpoints

```
POST /predict/demand
POST /predict/rake-availability
```

### Prediction Endpoints

```
POST /predict/delay
POST /predict/throughput
POST /predict/cost
POST /predict/mode
```

### Optimization Endpoints

```
POST /optimize/dispatch
```

### Example API Call

```bash
curl -X GET http://127.0.0.1:8000/meta/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-22T14:15:00",
  "models_loaded": 7,
  "models_failed": 0,
  "version": "1.0.0"
}
```

---

## 🎨 Frontend Components

### Layout Components
- **ModernLayout** - Main layout with sidebar and top nav
- **Sidebar** - Navigation sidebar
- **Navbar** - Top navigation bar

### UI Components
- **MetricCard** - KPI cards with trends
- **ChartCard** - Chart container
- **DataTable** - Sortable data table
- **Spinner** - Loading indicator
- **Badge** - Status badges
- **Button** - Action buttons

### Page Components
- **ModernDashboard** - Dashboard with charts
- **OperationsHub** - Operations interface
- **RakePlanner** - Optimization planner
- **ForecastPage** - Forecasting interface
- **DelayPage** - Delay prediction
- **ThroughputPage** - Throughput analysis
- **CostPage** - Cost analysis
- **OptimizePage** - Optimization interface

---

## ⚙️ Configuration

### Frontend Configuration

**Environment Variables** (`.env`):
```
VITE_API_URL=http://127.0.0.1:8000
```

**Tailwind Configuration** (`tailwind.config.js`):
- Custom color schemes
- Responsive breakpoints
- Custom spacing and sizing

**Vite Configuration** (`vite.config.js`):
- Port: 5173
- Build output: `dist/`
- Source maps disabled for production

### Backend Configuration

**Main Settings** (`app/config.py`):
```python
# Server
HOST = "0.0.0.0"
PORT = 8000
DEBUG = False

# CORS
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    # ... more ports
]

# Database
USE_CSV_MODE = True  # or False for PostgreSQL
DATABASE_URL = "postgresql://user:password@localhost:5432/sihdb"

# Models
MODELS_DIR = "backend/ml/models"
```

---

## 🐛 Troubleshooting

### Common Issues

**White Screen on Frontend**
1. Check browser console (F12)
2. Verify backend is running
3. Check `.env` file configuration
4. Clear browser cache

**Backend Won't Start**
1. Verify Python 3.8+ installed
2. Install dependencies: `pip install -r requirements.txt`
3. Check if port 8000 is in use
4. Use correct command: `uvicorn app.main:app --reload`

**CORS Errors**
1. Check `CORS_ORIGINS` in `app/config.py`
2. Verify frontend URL is included
3. Restart backend after config changes

**Models Not Loading**
1. Check `backend/ml/models` directory
2. Verify model files exist
3. Check backend logs for errors
4. Use `/meta/models` endpoint to check status

For detailed troubleshooting, see `TROUBLESHOOTING.md`

---

## 👨‍💻 Development

### Frontend Development

**Hot Reload**
- Changes to `src/` files auto-reload
- No need to restart server

**Available Scripts**
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run format   # Format with Prettier
```

**File Structure**
```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── api/           # API client
│   ├── store/         # State management
│   ├── utils/         # Utilities
│   ├── App.jsx        # Main app
│   └── main.jsx       # Entry point
├── index.html         # HTML template
├── vite.config.js     # Vite config
├── tailwind.config.js # Tailwind config
└── package.json       # Dependencies
```

### Backend Development

**Auto Reload**
- Changes to `app/` files auto-reload
- Use `--reload` flag with uvicorn

**File Structure**
```
backend/
├── app/
│   ├── routers/       # API routes
│   ├── services/      # Business logic
│   ├── schemas.py     # Data models
│   ├── config.py      # Configuration
│   ├── main.py        # FastAPI app
│   └── utils/         # Utilities
├── ml/
│   ├── models/        # Trained models
│   └── synthetic/     # Synthetic data
├── requirements.txt   # Dependencies
└── README.md         # Backend docs
```

---

## 🚀 Deployment

### Frontend Deployment

**Build for Production**
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

**Deploy to Netlify/Vercel**
1. Push code to GitHub
2. Connect repository to Netlify/Vercel
3. Set build command: `npm run build`
4. Set publish directory: `dist`

### Backend Deployment

**Using Gunicorn**
```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
```

**Using Docker**
```bash
docker build -t sail-bokaro-backend .
docker run -p 8000:8000 sail-bokaro-backend
```

**Environment Variables for Production**
```
DEBUG=False
HOST=0.0.0.0
PORT=8000
DATABASE_URL=postgresql://user:password@host:5432/db
ADMIN_TOKEN=your-secret-token
```

---

## 📊 System Status

### Current Status
- ✅ Backend: Running on http://127.0.0.1:8000
- ✅ Frontend: Running on http://localhost:5173
- ✅ All endpoints operational
- ✅ Models loaded and ready
- ✅ CORS configured
- ✅ Error handling in place

### Health Check
```bash
curl http://127.0.0.1:8000/meta/health
```

---

## 📚 Documentation

- **Setup & Run**: See `SETUP_AND_RUN.md`
- **System Status**: See `SYSTEM_STATUS.md`
- **Troubleshooting**: See `TROUBLESHOOTING.md`
- **UI Components**: See `UI_COMPONENT_GUIDE.md`
- **Implementation**: See `MODERN_UI_IMPLEMENTATION.md`

---

## 🔐 Security Notes

- **Admin Token**: Change `ADMIN_TOKEN` in production
- **CORS**: Restrict `CORS_ORIGINS` in production
- **Database**: Use environment variables for credentials
- **API Keys**: Never commit secrets to version control
- **HTTPS**: Use HTTPS in production

---

## 📞 Support

### Getting Help

1. **Check Documentation**
   - README files in project root
   - API docs at http://127.0.0.1:8000/api/docs

2. **Check Logs**
   - Backend: Terminal output
   - Frontend: Browser console (F12)

3. **Common Issues**
   - See `TROUBLESHOOTING.md`
   - Check `SYSTEM_STATUS.md`

4. **Test Endpoints**
   - Use Swagger UI at http://127.0.0.1:8000/api/docs
   - Use curl for command line testing

---

## 📝 License

SAIL Bokaro Steel Plant Logistics Optimization System
SIH25208 - Smart India Hackathon 2025

---

## ✅ System Ready

The SAIL Bokaro Logistics Optimization System is fully operational and ready for use.

**Start using it now:**
1. Ensure both servers are running
2. Open http://localhost:5173 in your browser
3. Navigate using the sidebar menu
4. Explore the various features and analytics

**Questions?** Check the documentation files or review the troubleshooting guide.

---

**Last Updated**: November 22, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
