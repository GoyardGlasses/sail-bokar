# Quick Reference Guide

## 🚀 Start Application (30 seconds)

### Terminal 1 - Backend
```bash
cd c:\Users\Admin\CascadeProjects\backend
uvicorn app.main:app --reload
```

### Terminal 2 - Frontend
```bash
cd c:\Users\Admin\CascadeProjects\frontend
npm run dev
```

### Open Browser
```
http://localhost:5173
```

---

## 📍 Key URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Main application |
| Backend API | http://127.0.0.1:8000 | API server |
| API Docs | http://127.0.0.1:8000/api/docs | Interactive API testing |
| Health Check | http://127.0.0.1:8000/meta/health | System status |
| ReDoc | http://127.0.0.1:8000/api/redoc | API documentation |

---

## 🔧 Common Commands

### Backend
```bash
# Start server
cd backend
uvicorn app.main:app --reload

# Install dependencies
pip install -r requirements.txt

# Check health
curl http://127.0.0.1:8000/meta/health
```

### Frontend
```bash
# Start dev server
cd frontend
npm run dev

# Build for production
npm run build

# Install dependencies
npm install
```

---

## 📄 Navigation Menu

| Menu Item | Route | Purpose |
|-----------|-------|---------|
| Dashboard | `/` | Main KPI dashboard |
| Modern Dashboard | `/dashboard` | Modern UI with charts |
| Operations Hub | `/operations-hub` | Yard operations |
| Rake Planner | `/rake-planner` | Optimization planning |
| Demand Forecast | `/forecast` | Demand prediction |
| Delay Prediction | `/delay` | Delay analysis |
| Throughput | `/throughput` | Throughput analysis |
| Cost Analysis | `/cost` | Cost optimization |
| Optimization | `/optimize` | Dispatch optimization |
| AI Forecast | `/ai-forecast` | Advanced forecasting |
| Blockchain | `/blockchain` | Blockchain features |
| Advanced Opt | `/advanced-optimization` | Multi-objective optimization |
| 3D Visualization | `/visualization-3d` | 3D visualization |
| Scenario Analysis | `/scenario-analysis` | What-if analysis |
| ML Models | `/models` | Model management |
| Admin | `/admin` | Admin controls |

---

## 🔌 API Endpoints

### Health & Status
```
GET /meta/health              # System health
GET /meta/models              # Model status
GET /meta/config              # Configuration
GET /meta/metrics             # System metrics
POST /meta/reload-models      # Reload models (admin)
```

### Predictions
```
POST /predict/demand          # Demand forecast
POST /predict/rake-availability # Rake availability
POST /predict/delay           # Delay prediction
POST /predict/throughput      # Throughput prediction
POST /predict/cost            # Cost prediction
POST /predict/mode            # Transport mode
```

### Optimization
```
POST /optimize/dispatch       # Dispatch optimization
```

---

## 🐛 Quick Troubleshooting

### White Screen
1. Press F12 (DevTools)
2. Check Console for errors
3. Verify backend is running
4. Check `.env` file

### Backend Won't Start
```bash
# Check port is free
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID <PID> /F

# Try again
uvicorn app.main:app --reload
```

### Frontend Won't Start
```bash
# Check port is free
netstat -ano | findstr :5173

# Kill process if needed
taskkill /PID <PID> /F

# Install dependencies
npm install

# Try again
npm run dev
```

### CORS Error
1. Check `backend/app/config.py`
2. Verify frontend URL in `CORS_ORIGINS`
3. Restart backend
4. Clear browser cache

---

## 📁 Project Structure

```
c:\Users\Admin\CascadeProjects\
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI app
│   │   ├── config.py          # Configuration
│   │   ├── routers/           # API routes
│   │   ├── services/          # Business logic
│   │   └── schemas.py         # Data models
│   ├── ml/
│   │   ├── models/            # ML models
│   │   └── synthetic/         # Synthetic data
│   └── requirements.txt        # Dependencies
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── api/               # API client
│   │   ├── App.jsx            # Main app
│   │   └── main.jsx           # Entry point
│   ├── index.html             # HTML template
│   ├── vite.config.js         # Vite config
│   ├── tailwind.config.js     # Tailwind config
│   ├── .env                   # Environment variables
│   └── package.json           # Dependencies
│
├── electron/                   # Electron app (optional)
├── docs/                       # Documentation
└── README files               # This documentation
```

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `backend/app/main.py` | FastAPI application |
| `backend/app/config.py` | Backend configuration |
| `frontend/src/App.jsx` | React app routes |
| `frontend/.env` | Frontend environment |
| `frontend/vite.config.js` | Vite configuration |
| `frontend/tailwind.config.js` | Tailwind configuration |

---

## 📊 System Requirements

### Minimum
- Node.js 16+
- Python 3.8+
- 2GB RAM
- 500MB disk space

### Recommended
- Node.js 18+
- Python 3.10+
- 4GB RAM
- 1GB disk space

---

## 🎯 Features at a Glance

✅ Modern responsive UI
✅ Real-time data updates
✅ Interactive charts & graphs
✅ ML-powered predictions
✅ Optimization algorithms
✅ Dark/light theme
✅ Error handling
✅ API documentation
✅ Admin controls
✅ Blockchain integration

---

## 📞 Quick Help

### Check if servers are running
```bash
# Backend
curl http://127.0.0.1:8000/meta/health

# Frontend
Open http://localhost:5173 in browser
```

### View logs
- Backend: Check terminal output
- Frontend: Press F12 → Console tab

### Restart everything
```bash
# Stop both servers (Ctrl+C in each terminal)
# Then restart:

# Terminal 1
cd backend && uvicorn app.main:app --reload

# Terminal 2
cd frontend && npm run dev
```

### Clear cache
1. Press Ctrl+Shift+Delete
2. Select "All time"
3. Check all boxes
4. Click "Clear data"
5. Reload page

---

## 📚 Documentation Files

- `README_COMPLETE.md` - Full documentation
- `SETUP_AND_RUN.md` - Detailed setup guide
- `SYSTEM_STATUS.md` - Current system status
- `TROUBLESHOOTING.md` - Problem solving guide
- `UI_COMPONENT_GUIDE.md` - Component reference
- `MODERN_UI_IMPLEMENTATION.md` - UI implementation details
- `QUICK_REFERENCE.md` - This file

---

## ✅ Verification Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173
- [ ] Can access http://127.0.0.1:8000/api/docs
- [ ] No errors in browser console
- [ ] No errors in backend terminal
- [ ] Navigation menu working
- [ ] Charts displaying
- [ ] API calls successful

---

## 🎓 Learning Resources

### Frontend
- React: https://react.dev
- Tailwind: https://tailwindcss.com
- Recharts: https://recharts.org
- Vite: https://vitejs.dev

### Backend
- FastAPI: https://fastapi.tiangolo.com
- Pydantic: https://docs.pydantic.dev
- SQLAlchemy: https://www.sqlalchemy.org

---

## 💡 Tips & Tricks

1. **Hot Reload**: Changes auto-reload in dev mode
2. **API Testing**: Use Swagger UI at `/api/docs`
3. **DevTools**: Press F12 to debug frontend
4. **Terminal Logs**: Check backend terminal for errors
5. **Clear Cache**: Ctrl+Shift+Delete if things look wrong
6. **Port Issues**: Use `netstat -ano | findstr :PORT`
7. **Kill Process**: `taskkill /PID <PID> /F`

---

## 🚀 Next Steps

1. **Explore the UI**: Navigate through all pages
2. **Test APIs**: Use Swagger UI to test endpoints
3. **Check Data**: View charts and tables
4. **Read Docs**: Review documentation files
5. **Customize**: Modify colors, text, layout
6. **Integrate**: Connect to real data sources
7. **Deploy**: Prepare for production

---

## 📞 Support Resources

- **API Docs**: http://127.0.0.1:8000/api/docs
- **Troubleshooting**: See `TROUBLESHOOTING.md`
- **Setup Guide**: See `SETUP_AND_RUN.md`
- **System Status**: See `SYSTEM_STATUS.md`

---

**System Status**: ✅ Ready to Use
**Last Updated**: November 22, 2025
**Version**: 1.0.0
