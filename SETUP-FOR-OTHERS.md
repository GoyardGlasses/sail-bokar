# SAIL Bokaro - Setup Guide for Others

## Quick Start (Recommended)

### Step 1: Prerequisites
Make sure you have these installed:
- **Node.js** v16 or higher - [Download](https://nodejs.org/)
- **Python** 3.8 or higher - [Download](https://www.python.org/)

### Step 2: Clone the Repository
```bash
git clone https://github.com/GoyardGlasses/sail-bokar.git
cd sail-bokar
```

### Step 3: Run the Unified Launcher
Simply **double-click** `START-UNIFIED.bat`

That's it! The launcher will:
1. ✅ Kill any existing processes
2. ✅ Check prerequisites
3. ✅ Install frontend dependencies
4. ✅ Install backend dependencies
5. ✅ Start the backend server
6. ✅ Start the frontend server
7. ✅ Open the application in your browser

## What to Expect

### First Run
- The launcher will take 2-3 minutes to install dependencies
- You'll see two terminal windows open (Backend and Frontend)
- The browser will automatically open to `http://localhost:5173`

### Subsequent Runs
- Much faster (30-60 seconds) since dependencies are already installed
- Just double-click `START-UNIFIED.bat` again

## Troubleshooting

### White Screen Issue
1. Wait 10-15 seconds for the backend to fully initialize
2. Refresh the browser (F5)
3. Check the browser console (F12) for errors

### Backend Shows as Offline
1. Check that both terminal windows are open
2. Verify the backend terminal shows "Application startup complete"
3. Visit http://127.0.0.1:8000/meta/health in your browser
4. If it shows JSON, the backend is working

### Port Already in Use
1. Close the launcher
2. Run `taskkill /IM node.exe /F` and `taskkill /IM python.exe /F` in Command Prompt
3. Try again

### Dependencies Won't Install
```bash
# Clear npm cache
npm cache clean --force

# Try installing again
cd frontend
npm install
cd ../backend
pip install -r requirements.txt
```

## Manual Setup (If Launcher Doesn't Work)

### Terminal 1 - Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```

Then open: http://localhost:5173

## Access Points

| Component | URL |
|-----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://127.0.0.1:8000 |
| API Documentation | http://127.0.0.1:8000/api/docs |
| Health Check | http://127.0.0.1:8000/meta/health |

## Features Available

Once the application loads, you can access:
- **Dashboard** - Overview of logistics metrics
- **Demand Forecast** - Predict future demand
- **Delay Prediction** - Identify potential delays
- **Throughput Analysis** - Optimize capacity
- **Cost Analysis** - Reduce logistics costs
- **Transport Optimization** - Recommend transport modes
- **ML Models** - View all trained models
- **3D Visualization** - Visual analytics
- **Advanced Features** - AI forecasting, blockchain, scenario analysis

## System Requirements

- **OS**: Windows 10/11, Linux, or macOS
- **RAM**: 2GB minimum
- **Disk Space**: 500MB
- **Browser**: Chrome, Firefox, Safari, or Edge (latest)

## Still Having Issues?

1. Check the terminal windows for error messages
2. Ensure both Node.js and Python are properly installed
3. Try running the diagnostic script: `DIAGNOSE-SYSTEM.bat`
4. Review the browser console (F12) for JavaScript errors

## Need Help?

- Check `README.md` for more information
- Review `QUICK-START.txt` for quick reference
- Check `COMPLETE-AUDIT-REPORT.md` for system details

---

**Version**: 2.0  
**Last Updated**: November 2025  
**Status**: Production Ready ✅
