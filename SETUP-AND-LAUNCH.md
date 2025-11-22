# SAIL BOKARO - COMPLETE SETUP AND LAUNCH GUIDE

## 🎯 Quick Start (2 Minutes)

### Step 1: Verify Your System
Double-click: `DIAGNOSE-SYSTEM.bat`

This will check if everything is installed correctly.

### Step 2: Launch the Website
Double-click: `RUN-WEBSITE.bat`

That's it! The website will open automatically in your browser.

---

## 📋 System Requirements

Before you start, make sure you have:

1. **Node.js** (v16 or higher)
   - Download: https://nodejs.org/
   - Verify: Open Command Prompt and run `node --version`

2. **Python** (v3.8 or higher)
   - Download: https://www.python.org/
   - Verify: Open Command Prompt and run `python --version`

3. **Windows 10/11**

---

## 🚀 Launch Options

### Option 1: Automatic Launch (Recommended)
```bash
Double-click: RUN-WEBSITE.bat
```
- Installs dependencies automatically
- Starts backend server
- Starts frontend dev server
- Opens browser to http://localhost:5173

### Option 2: Manual Launch
```bash
# Terminal 1: Start Backend
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

Then open your browser to: `http://localhost:5173`

### Option 3: Full System Rebuild
If something goes wrong, run:
```bash
Double-click: LAUNCH-WEBSITE-FULL.bat
```
This will clean everything and rebuild from scratch.

---

## 🔍 Troubleshooting

### White Screen on Startup
**Solution:** Wait 10-15 seconds. The dev server needs time to start.

### Port Already in Use
**Solution:** The system will automatically find the next available port. Check the terminal for the actual URL.

### Backend Not Connecting
**Solution:** 
1. Make sure the backend is running on port 8000
2. Check that the frontend `.env` file has: `VITE_API_URL=http://127.0.0.1:8000`
3. Check browser console (F12) for CORS errors

### Dependencies Not Installing
**Solution:**
```bash
# For frontend
cd frontend
npm install

# For backend
cd backend
pip install -r requirements.txt
```

### Still Having Issues?
1. Run `DIAGNOSE-SYSTEM.bat` to identify the problem
2. Check that Node.js and Python are installed correctly
3. Try `LAUNCH-WEBSITE-FULL.bat` to do a full rebuild

---

## 📁 Project Structure

```
c:\Users\Admin\CascadeProjects\
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── main.jsx            # React entry point
│   │   ├── App.jsx             # Main app component
│   │   ├── pages/              # Page components
│   │   ├── components/         # Reusable components
│   │   ├── api/                # API client and endpoints
│   │   ├── store/              # Zustand state management
│   │   └── index.css           # Tailwind CSS
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── .env                    # Environment variables
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI app
│   │   ├── config.py          # Configuration
│   │   ├── routers/           # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── models_loader.py   # ML models
│   │   └── schemas.py         # Data schemas
│   ├── requirements.txt        # Python dependencies
│   ├── ml/                    # ML models directory
│   └── .env                   # Environment variables
├── RUN-WEBSITE.bat            # ⭐ MAIN LAUNCHER
├── DIAGNOSE-SYSTEM.bat        # System diagnostic
├── LAUNCH-WEBSITE-FULL.bat    # Full rebuild launcher
└── SETUP-AND-LAUNCH.md        # This file
```

---

## 🌐 Access Points

### Frontend (Website)
- **URL:** `http://localhost:5173`
- **Access:** Open in any web browser
- **Backend:** Automatically connects to `http://127.0.0.1:8000`

### Backend API
- **URL:** `http://127.0.0.1:8000`
- **Docs:** `http://127.0.0.1:8000/api/docs` (Swagger UI)
- **Health Check:** `http://127.0.0.1:8000/meta/health`

---

## 🎯 Features Available

### Dashboard
- Main overview with KPIs
- Real-time metrics
- System health status

### ML Models Integration
- **Demand Forecasting** - Predict future demand
- **Delay Prediction** - Identify potential delays
- **Throughput Analysis** - Monitor system throughput
- **Cost Analysis** - Track operational costs
- **Transport Mode** - Recommend optimal transport mode

### Advanced Features
- **AI Forecast** - AI-powered forecasting
- **Blockchain** - Blockchain integration
- **Advanced Optimization** - Complex optimization scenarios
- **3D Visualization** - 3D data visualization
- **Scenario Analysis** - What-if analysis

---

## 🔧 Configuration

### Frontend (.env)
```
VITE_API_URL=http://127.0.0.1:8000
```

### Backend (.env)
```
APP_NAME=SAIL Bokaro Logistics Optimizer
APP_VERSION=1.0.0
HOST=127.0.0.1
PORT=8000
DEBUG=False
```

---

## 📊 Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Zustand** - State management
- **React Router** - Routing
- **Axios** - HTTP client

### Backend
- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **LightGBM** - ML models
- **Scikit-learn** - ML utilities
- **Pandas** - Data processing
- **NumPy** - Numerical computing

---

## 🛑 Stopping the System

### Using RUN-WEBSITE.bat
- Close the terminal window
- The backend will stop automatically

### Manual Stop
- Press `Ctrl+C` in the terminal running the dev server
- Press `Ctrl+C` in the terminal running the backend

---

## ✨ What's Included

✅ Modern, responsive UI with dark theme
✅ Real-time data visualization with Recharts
✅ FastAPI backend with multiple endpoints
✅ ML model integration for predictions
✅ Unified UI for web and desktop
✅ Dark theme support
✅ Responsive design for all screen sizes
✅ Automatic error handling and retry logic
✅ Comprehensive API documentation
✅ 16+ pages with different features

---

## 📞 Support

If you encounter any issues:

1. **Run the diagnostic:**
   ```bash
   Double-click: DIAGNOSE-SYSTEM.bat
   ```

2. **Check the logs:**
   - Frontend logs: Browser console (F12)
   - Backend logs: Terminal output

3. **Verify prerequisites:**
   - Node.js: `node --version`
   - Python: `python --version`

4. **Try a full rebuild:**
   ```bash
   Double-click: LAUNCH-WEBSITE-FULL.bat
   ```

---

## 🎉 You're Ready!

Your SAIL Bokaro website is fully configured and ready to use.

**To get started:**
1. Double-click `RUN-WEBSITE.bat`
2. Wait for the browser to open
3. Explore the features!

**Happy optimizing! 🚀**
