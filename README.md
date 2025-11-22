# SAIL Bokaro - Logistics Optimization System

A comprehensive logistics optimization platform combining React frontend, FastAPI backend, and advanced machine learning models for demand forecasting, delay prediction, cost analysis, and transport optimization.

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16 or higher
- **Python** 3.8 or higher
- **npm** (comes with Node.js)
- **Windows 10/11** (or Linux/macOS with bash)

### Automatic Launch (Windows)
Simply double-click one of the launch scripts:
- **`RUN-WEBSITE.bat`** - Recommended for quick start
- **`LAUNCH-WEBSITE-FULL.bat`** - Full rebuild with dependency installation
- **`DIAGNOSE-SYSTEM.bat`** - Run diagnostics first

### Manual Launch

**Terminal 1 - Backend:**
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Then open your browser to: **http://localhost:5173**

## 📋 Features

### Core Optimization Features
- **Demand Forecasting** - Predict future logistics demand using LightGBM
- **Delay Prediction** - Identify potential delays in transport operations
- **Throughput Analysis** - Optimize transport capacity utilization
- **Cost Analysis** - Analyze and reduce logistics costs
- **Transport Mode Classification** - Recommend optimal transport modes
- **Dispatch Optimization** - Optimize dispatch scheduling and routing

### Advanced Features
- **AI Forecasting** - Advanced ML-based forecasting
- **Blockchain Integration** - Immutable transaction logging
- **Advanced Optimization** - Complex multi-objective optimization
- **3D Visualization** - Visual analytics and 3D charts
- **Scenario Analysis** - What-if analysis and planning
- **Operations Hub** - Centralized operations management
- **Rake Planner** - Railway rake scheduling and planning
- **Admin Panel** - System administration and monitoring

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 + Vite 5
- **Styling**: Tailwind CSS 3.3
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend
- **Framework**: FastAPI
- **Server**: Uvicorn ASGI
- **ML Models**: LightGBM, Scikit-learn
- **Data Processing**: Pandas, NumPy
- **Validation**: Pydantic
- **CORS**: Enabled for frontend

### Machine Learning Models
- Demand Forecasting Model
- Delay Prediction Model
- Throughput Prediction Model
- Cost Prediction Model
- Transport Mode Classifier
- Rake Availability Predictor
- Anomaly Detection Model

## 📁 Project Structure

```
SAIL-Bokaro/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── api/             # API integration
│   │   ├── store/           # Zustand stores
│   │   └── utils/           # Utility functions
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── main.py          # FastAPI app entry
│   │   ├── config.py        # Configuration
│   │   ├── models_loader.py # ML models
│   │   └── routers/         # API endpoints
│   ├── ml/
│   │   ├── models/          # Trained ML models
│   │   ├── train/           # Training scripts
│   │   └── utils/           # ML utilities
│   ├── requirements.txt
│   └── .env                 # Environment variables
├── docs/                     # Documentation
├── scripts/                  # Utility scripts
└── README.md                # This file
```

## 🔧 Configuration

### Frontend Environment Variables
Create `frontend/.env`:
```env
VITE_API_URL=http://127.0.0.1:8000
```

### Backend Environment Variables
Create `backend/.env`:
```env
# App Settings
APP_NAME=SAIL Bokaro
APP_VERSION=1.0.0
DEBUG=true

# Server Settings
SERVER_HOST=127.0.0.1
SERVER_PORT=8000

# CORS Settings
CORS_ORIGINS=http://localhost:5173,http://localhost:5179,http://127.0.0.1:5173

# ML Settings
MODELS_PATH=./ml/models
LOGS_PATH=./logs

# API Settings
API_TIMEOUT=30

# Security
SECRET_TOKEN=your-secret-token-here
```

## 🌐 Access Points

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend | http://localhost:5173 | Web application |
| Backend API | http://127.0.0.1:8000 | API endpoints |
| API Docs | http://127.0.0.1:8000/api/docs | Interactive API documentation |
| Health Check | http://127.0.0.1:8000/meta/health | Backend health status |

## 🧪 API Endpoints

### Health & Metadata
- `GET /meta/health` - Backend health check
- `GET /meta/models` - List all ML models

### Predictions
- `POST /forecast/demand` - Demand forecasting
- `POST /delay/predict` - Delay prediction
- `POST /throughput/predict` - Throughput analysis
- `POST /cost/predict` - Cost analysis
- `POST /mode/classify` - Transport mode classification
- `POST /optimize/dispatch` - Dispatch optimization

### Advanced
- `POST /ai-forecast/predict` - AI forecasting
- `POST /advanced-optimization/solve` - Advanced optimization
- `POST /scenario-analysis/run` - Scenario analysis

## 📊 ML Models

All models are pre-trained and located in `backend/ml/models/`:

| Model | Type | Input Features | Output |
|-------|------|-----------------|--------|
| Demand Forecaster | LightGBM | Historical demand, seasonality | Demand forecast |
| Delay Predictor | LightGBM | Route, time, weather | Delay probability |
| Throughput Model | LightGBM | Capacity, demand | Throughput |
| Cost Predictor | LightGBM | Distance, weight, mode | Cost estimate |
| Mode Classifier | LightGBM | Origin, destination, weight | Transport mode |
| Rake Availability | LightGBM | Schedule, maintenance | Availability |

## 🚨 Troubleshooting

### White Screen Issue
1. **Kill existing processes**: Use `taskkill /IM node.exe /F` and `taskkill /IM python.exe /F`
2. **Clear browser cache**: Ctrl+Shift+Delete in your browser
3. **Check backend**: Visit http://127.0.0.1:8000/meta/health
4. **Check console**: Open browser DevTools (F12) for errors
5. **Verify ports**: Ensure 8000 and 5173 are available

### Backend Connection Issues
1. Verify backend is running: `http://127.0.0.1:8000/meta/health`
2. Check `.env` files exist in both `frontend/` and `backend/`
3. Verify `VITE_API_URL` in `frontend/.env` matches backend URL
4. Check firewall settings

### Port Already in Use
- Frontend will automatically try ports 5173-5179
- Backend requires port 8000
- Use `netstat -ano | findstr :8000` to find process using port 8000

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
npm install

# For backend
pip install --upgrade pip
pip install -r requirements.txt
```

## 📖 Documentation

- **QUICK-START.txt** - Quick reference guide
- **SETUP-AND-LAUNCH.md** - Detailed setup instructions
- **COMPLETE-AUDIT-REPORT.md** - Full system audit
- **docs/** - Additional documentation

## 🔐 Security Notes

- Change `SECRET_TOKEN` in `backend/.env` for production
- Use environment variables for sensitive data
- Never commit `.env` files (already in `.gitignore`)
- Enable HTTPS in production
- Restrict CORS origins in production

## 📦 Deployment

### Docker
```bash
docker-compose up
```

### Production Deployment
1. Set `DEBUG=false` in `backend/.env`
2. Use production ASGI server (Gunicorn + Uvicorn)
3. Configure proper CORS origins
4. Use environment variables for secrets
5. Enable HTTPS/SSL
6. Set up proper logging and monitoring

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit pull request

## 📝 License

This project is proprietary. All rights reserved.

## 👥 Support

For issues or questions:
1. Check the troubleshooting section
2. Review documentation in `docs/`
3. Check browser console for errors (F12)
4. Review backend logs in `backend/logs/`

## 🎯 System Requirements

| Component | Requirement |
|-----------|-------------|
| OS | Windows 10/11, Linux, macOS |
| Node.js | v16 or higher |
| Python | 3.8 or higher |
| RAM | 2GB minimum |
| Disk Space | 500MB |
| Browser | Chrome, Firefox, Safari, Edge (latest) |

## 📈 Performance

- Frontend: ~2-3 seconds initial load
- Backend: <100ms response time for predictions
- ML Models: <500ms inference time
- Database: PostgreSQL optional for production

## 🔄 Updates

To update the system:
```bash
# Pull latest changes
git pull origin main

# Update frontend dependencies
cd frontend && npm install

# Update backend dependencies
cd backend && pip install -r requirements.txt
```

## 📞 Contact

For more information about SAIL Bokaro Logistics Optimization System, contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Status**: Production Ready ✅
