# Local Development Setup Guide

This guide will help you run the entire SAIL Bokaro project locally (frontend + backend) to test everything before deployment.

---

## Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.10+ (for backend)
- **Git** (already installed)
- **PostgreSQL** (optional, for database - can use CSV mode without it)

---

## Step 1: Setup Backend (FastAPI)

### 1.1 Navigate to backend directory
```bash
cd backend
```

### 1.2 Create Python virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 1.3 Install dependencies
```bash
pip install -r requirements.txt
```

### 1.4 Create .env file for backend
Create `backend/.env`:
```
APP_NAME=SAIL Bokaro
APP_VERSION=1.0.0
DEBUG=true
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
LOG_LEVEL=INFO
API_TIMEOUT=30
SECRET_TOKEN=sail-bokaro-admin-token-secret
USE_CSV_MODE=true
```

**Note**: `USE_CSV_MODE=true` means the backend will work WITHOUT a database (uses CSV files instead).

### 1.5 Run the backend
```bash
# From backend directory
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**Test the backend:**
- Open browser: http://localhost:8000
- API Docs: http://localhost:8000/api/docs
- Health check: http://localhost:8000/meta/health

---

## Step 2: Setup Frontend (React + Vite)

### 2.1 Open a NEW terminal window (keep backend running)

### 2.2 Navigate to frontend directory
```bash
cd frontend
```

### 2.3 Create .env file for frontend
Create `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
VITE_DEMO_MODE=false
VITE_ADMIN_TOKEN=sail-bokaro-admin-token-secret
```

### 2.4 Install dependencies
```bash
npm install
```

### 2.5 Run the frontend dev server
```bash
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Open in browser:**
- Frontend: http://localhost:5173

---

## Step 3: Test the Integration

### 3.1 Frontend should connect to Backend

1. Open http://localhost:5173 in your browser
2. You should see the SAIL Bokaro dashboard
3. Try clicking on different pages (Forecast, Delay, etc.)
4. Check the browser console (F12) for any errors
5. Check the backend terminal for API requests

### 3.2 Test API endpoints

**From frontend:**
- Go to any prediction page (Forecast, Delay, etc.)
- Fill in the form and submit
- You should see results from the backend

**From terminal (curl):**
```bash
# Test health check
curl http://localhost:8000/meta/health

# Test demand forecast
curl -X POST http://localhost:8000/predict/demand \
  -H "Content-Type: application/json" \
  -d '{
    "material_type": "HR_Coils",
    "destination": "Kolkata",
    "quantity_tonnes": 500,
    "priority": "HIGH"
  }'
```

---

## Step 4: Troubleshooting

### Backend won't start

**Error: "Port 8000 already in use"**
```bash
# Kill the process using port 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

**Error: "Module not found"**
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend won't start

**Error: "Port 5173 already in use"**
```bash
# Kill the process or use a different port
npm run dev -- --port 5174
```

**Error: "Cannot find module"**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Frontend can't connect to backend

**Check:**
1. Backend is running on http://localhost:8000
2. `VITE_API_URL` in `frontend/.env` is set to `http://localhost:8000`
3. Browser console (F12) for CORS errors
4. Backend CORS_ORIGINS includes `http://localhost:5173`

**Fix CORS if needed:**
Edit `backend/.env`:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
```

---

## Step 5: Development Workflow

### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### Terminal 3 - Git (optional)
```bash
cd .
git status
git add .
git commit -m "Your message"
git push
```

---

## Step 6: Common Development Tasks

### Update backend dependencies
```bash
cd backend
pip install -r requirements.txt --upgrade
```

### Update frontend dependencies
```bash
cd frontend
npm update
```

### Run frontend linter
```bash
cd frontend
npm run lint
```

### Build frontend for production
```bash
cd frontend
npm run build
# Output will be in frontend/dist/
```

### Build backend with Docker (optional)
```bash
docker build -t sail-bokaro-backend -f backend/Dockerfile .
docker run -p 8000:8000 sail-bokaro-backend
```

---

## Step 7: Before Deployment

Once everything works locally:

1. **Test all pages** in the frontend
2. **Test all API endpoints** using the API docs (http://localhost:8000/api/docs)
3. **Check browser console** for errors (F12)
4. **Check backend logs** for warnings
5. **Commit all changes** to GitHub
6. **Then deploy to Vercel + Render**

---

## Quick Start Commands (Copy & Paste)

### Windows
```bash
# Terminal 1 - Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### macOS/Linux
```bash
# Terminal 1 - Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

---

## Environment Variables Summary

### Backend (`backend/.env`)
```
APP_NAME=SAIL Bokaro
APP_VERSION=1.0.0
DEBUG=true
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
LOG_LEVEL=INFO
API_TIMEOUT=30
SECRET_TOKEN=sail-bokaro-admin-token-secret
USE_CSV_MODE=true
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:8000
VITE_DEMO_MODE=false
VITE_ADMIN_TOKEN=sail-bokaro-admin-token-secret
```

---

## Next Steps

Once local testing is complete and working:

1. **Deploy Frontend to Vercel** (already configured)
2. **Deploy Backend to Render** (already configured)
3. **Update VITE_API_URL** in Vercel to point to Render backend
4. **Test production deployment**

---

**Last Updated**: November 23, 2025  
**Version**: 1.0.0
