# Troubleshooting Guide

## Common Issues & Solutions

---

## 1. White Screen on Frontend

### Symptoms
- Browser shows blank white page
- No content visible
- Sidebar/navigation missing

### Solutions

**Step 1: Check Browser Console**
1. Press `F12` to open DevTools
2. Go to "Console" tab
3. Look for red error messages
4. Note any error details

**Step 2: Verify Backend is Running**
```bash
# In a new terminal, check if backend is responding
curl http://127.0.0.1:8000/meta/health
```
- If you get a response, backend is working
- If connection refused, backend is not running

**Step 3: Check Network Requests**
1. In DevTools, go to "Network" tab
2. Reload the page
3. Look for failed requests (red text)
4. Check if API calls are going to correct URL

**Step 4: Verify Environment Variables**
1. Check `frontend/.env` file exists
2. Verify it contains: `VITE_API_URL=http://127.0.0.1:8000`
3. Restart frontend server: `npm run dev`

**Step 5: Clear Cache**
1. Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
2. Clear browsing data
3. Reload the page

---

## 2. Backend Won't Start

### Symptoms
- `Error loading ASGI app. Could not import module "main"`
- `ModuleNotFoundError`
- Port already in use

### Solutions

**Issue: Module Not Found**
```bash
# Make sure you're in the backend directory
cd c:\Users\Admin\CascadeProjects\backend

# Try the correct command
uvicorn app.main:app --reload
```

**Issue: Port Already in Use**
```bash
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Then start the server again
uvicorn app.main:app --reload
```

**Issue: Dependencies Not Installed**
```bash
cd backend
pip install -r requirements.txt
```

**Issue: Python Version**
```bash
# Check Python version (need 3.8+)
python --version

# If wrong version, use specific Python path
C:\Users\Admin\AppData\Local\Programs\Python\Python312\python.exe -m uvicorn app.main:app --reload
```

---

## 3. Frontend Won't Start

### Symptoms
- `npm: command not found`
- `Port already in use`
- `Module not found`

### Solutions

**Issue: npm Not Found**
```bash
# Check if Node.js is installed
node --version
npm --version

# If not installed, download from nodejs.org
```

**Issue: Port Already in Use**
```bash
# Find what's using port 5173
netstat -ano | findstr :5173

# Kill the process
taskkill /PID <PID> /F

# Start frontend again
npm run dev
```

**Issue: Dependencies Not Installed**
```bash
cd frontend
npm install
npm run dev
```

---

## 4. CORS Errors

### Symptoms
- Console error: `Access to XMLHttpRequest blocked by CORS policy`
- API requests fail with 403 error
- Network tab shows CORS error

### Solutions

**Step 1: Check CORS Configuration**
1. Open `backend/app/config.py`
2. Find `CORS_ORIGINS` list
3. Verify your frontend URL is included
4. Example: `"http://localhost:5173"`

**Step 2: Add Missing Port**
If frontend is on port 5174 or 5175:
```python
CORS_ORIGINS: list = [
    "http://localhost:5173",
    "http://localhost:5174",  # Add this if needed
    "http://localhost:5175",  # Add this if needed
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",  # Add this if needed
]
```

**Step 3: Restart Backend**
```bash
# Stop the backend (Ctrl+C)
# Then restart it
uvicorn app.main:app --reload
```

**Step 4: Clear Browser Cache**
1. Press `Ctrl+Shift+Delete`
2. Clear all data
3. Reload the page

---

## 5. API Endpoints Not Responding

### Symptoms
- Network requests timeout
- API returns 500 error
- Endpoints return empty response

### Solutions

**Step 1: Test Health Endpoint**
```bash
curl http://127.0.0.1:8000/meta/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-22T14:15:00",
  "models_loaded": 7,
  "models_failed": 0,
  "version": "1.0.0"
}
```

**Step 2: Check Backend Logs**
1. Look at the terminal running the backend
2. Check for error messages
3. Look for stack traces

**Step 3: Verify API URL**
1. Check `frontend/.env`
2. Verify `VITE_API_URL=http://127.0.0.1:8000`
3. No trailing slash

**Step 4: Test API Directly**
1. Open http://127.0.0.1:8000/api/docs
2. Try endpoints in the Swagger UI
3. See if they work

---

## 6. Models Not Loading

### Symptoms
- Backend logs show "models_failed: X"
- Predictions return errors
- `/meta/models` shows "failed" status

### Solutions

**Step 1: Check Model Files**
```bash
# Navigate to models directory
cd backend/ml/models

# List files
dir

# Should see files like:
# - demand_model.pkl
# - throughput_model.pkl
# - etc.
```

**Step 2: Check Backend Logs**
1. Look for error messages about model loading
2. Check file paths in logs
3. Verify files exist and are readable

**Step 3: Reload Models**
1. Open http://127.0.0.1:8000/api/docs
2. Find `/meta/reload-models` endpoint
3. Click "Try it out"
4. Add header: `X-API-Token: sail-bokaro-admin-token-secret`
5. Click "Execute"

**Step 4: Check Model Paths**
1. Open `backend/app/config.py`
2. Verify model paths are correct
3. Example: `MODELS_DIR / "demand_model.pkl"`
4. Ensure files exist at those paths

---

## 7. Database Connection Issues

### Symptoms
- Database connection error
- Cannot save/load data
- CSV files not found

### Solutions

**If Using CSV Mode (Default)**
```bash
# Check CSV files exist
cd backend/ml/synthetic/raw

# Should see CSV files
dir
```

**If Using PostgreSQL**
```bash
# Verify PostgreSQL is running
# Check connection string in app/config.py
DATABASE_URL: str = "postgresql://user:password@localhost:5432/sihdb"

# Test connection
psql -U postgres -h localhost -d sihdb
```

**Switch to CSV Mode**
1. Open `backend/app/config.py`
2. Set: `USE_CSV_MODE: bool = True`
3. Restart backend

---

## 8. Slow Performance

### Symptoms
- Pages load slowly
- Charts take time to render
- API responses are slow

### Solutions

**Step 1: Check Network**
1. Open DevTools Network tab
2. Check response times
3. Look for slow requests

**Step 2: Check System Resources**
```bash
# Check CPU and memory usage
tasklist /v

# Look for python.exe and node.exe
```

**Step 3: Optimize**
- Close unnecessary applications
- Reduce number of charts on page
- Use pagination for large datasets
- Clear browser cache

**Step 4: Check Backend Logs**
- Look for slow queries
- Check for errors
- Monitor memory usage

---

## 9. Navigation Not Working

### Symptoms
- Clicking menu items doesn't change page
- URL changes but content doesn't update
- Blank pages when navigating

### Solutions

**Step 1: Check Routes**
1. Open `frontend/src/App.jsx`
2. Verify all routes are defined
3. Check path names match menu items

**Step 2: Check Components**
1. Verify page components exist
2. Check imports are correct
3. Look for typos in component names

**Step 3: Check Console**
1. Press F12
2. Go to Console tab
3. Look for import errors
4. Check for undefined components

**Step 4: Restart Frontend**
```bash
# Stop frontend (Ctrl+C)
npm run dev
```

---

## 10. Charts Not Displaying

### Symptoms
- Chart containers are empty
- No data visible in charts
- Chart errors in console

### Solutions

**Step 1: Check Data**
1. Open DevTools Network tab
2. Check API response for chart data
3. Verify data format is correct

**Step 2: Check Chart Component**
1. Verify Recharts is installed: `npm list recharts`
2. Check chart component syntax
3. Verify data prop is passed correctly

**Step 3: Check Console**
1. Press F12
2. Look for Recharts errors
3. Check for data format issues

**Step 4: Use Mock Data**
1. Charts should fall back to mock data
2. If not, check error handling
3. Verify fallback data is defined

---

## 11. Styling Issues

### Symptoms
- Tailwind CSS not applied
- Colors look wrong
- Layout is broken

### Solutions

**Step 1: Rebuild Tailwind**
```bash
cd frontend
npm run dev
```

**Step 2: Clear Cache**
1. Press `Ctrl+Shift+Delete`
2. Clear all data
3. Reload page

**Step 3: Check Tailwind Config**
1. Verify `tailwind.config.js` exists
2. Check content paths are correct
3. Verify custom colors are defined

**Step 4: Restart Frontend**
```bash
# Stop frontend (Ctrl+C)
npm run dev
```

---

## 12. Authentication Issues

### Symptoms
- Cannot access admin endpoints
- Token errors
- 403 Forbidden errors

### Solutions

**Step 1: Check Admin Token**
1. Open `backend/app/config.py`
2. Find `ADMIN_TOKEN`
3. Default: `"sail-bokaro-admin-token-secret"`

**Step 2: Add Token to Request**
```bash
curl -H "X-API-Token: sail-bokaro-admin-token-secret" \
  http://127.0.0.1:8000/meta/reload-models
```

**Step 3: Check Token in Code**
1. Verify token is sent in headers
2. Check header name: `X-API-Token`
3. Verify token value matches config

---

## Quick Diagnostic Checklist

- [ ] Backend running? `curl http://127.0.0.1:8000/meta/health`
- [ ] Frontend running? Open http://localhost:5173
- [ ] CORS configured? Check `app/config.py`
- [ ] Environment variables set? Check `frontend/.env`
- [ ] Models loaded? Check `/meta/models` endpoint
- [ ] No console errors? Press F12 and check
- [ ] Network requests working? Check Network tab
- [ ] Ports not in use? Check with netstat
- [ ] Dependencies installed? Run pip/npm install
- [ ] Cache cleared? Ctrl+Shift+Delete

---

## Getting Help

If you're still having issues:

1. **Check the logs**
   - Backend: Terminal output
   - Frontend: Browser console (F12)

2. **Test endpoints directly**
   - Use http://127.0.0.1:8000/api/docs
   - Try the Swagger UI

3. **Restart everything**
   - Stop both servers
   - Clear cache
   - Start fresh

4. **Check documentation**
   - See `SETUP_AND_RUN.md`
   - See `SYSTEM_STATUS.md`

---

## Still Not Working?

Try this complete reset:

```bash
# Stop both servers (Ctrl+C)

# Clear frontend cache
cd frontend
rm -rf node_modules
npm install

# Clear backend cache
cd ../backend
pip install -r requirements.txt --force-reinstall

# Start fresh
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

Then access: http://localhost:5173
