# 🔧 Fix White Screen Issue

## Problem
The Electron application shows a white/blank screen instead of the dashboard.

## Root Causes

1. **Frontend dev server not started** - Electron tries to load http://localhost:5173 but the server isn't running
2. **Timing issue** - Electron launches before the dev server is ready
3. **Port conflict** - Port 5173 is already in use by another application
4. **Backend not responding** - API calls fail silently

---

## Solutions

### Solution 1: Use the Simple Launcher (Recommended)

**Double-click**: `START-APP.bat`

This launcher:
- ✅ Checks prerequisites
- ✅ Installs dependencies
- ✅ Starts backend
- ✅ Starts frontend dev server
- ✅ Waits for dev server to be ready
- ✅ Launches Electron
- ✅ All in one window

**Why this works**: It uses `npm run electron-dev` which properly orchestrates the startup sequence.

---

### Solution 2: Manual Launch (For Debugging)

**Terminal 1 - Start Backend:**
```bash
cd c:\Users\Admin\CascadeProjects\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Wait for: `Application startup complete`

**Terminal 2 - Start Frontend Dev Server:**
```bash
cd c:\Users\Admin\CascadeProjects\frontend
npm run dev
```

Wait for: `Local: http://localhost:5173/`

**Terminal 3 - Start Electron:**
```bash
cd c:\Users\Admin\CascadeProjects\frontend
npm run electron-dev
```

Wait for: Electron window to open with dashboard

---

### Solution 3: Check Port Availability

If port 5173 is in use:

```bash
netstat -ano | findstr :5173
```

Kill the process:
```bash
taskkill /PID <PID> /F
```

Then restart the application.

---

### Solution 4: Clear Cache and Rebuild

```bash
cd c:\Users\Admin\CascadeProjects\frontend

REM Clear node modules and cache
rmdir /s /q node_modules
del package-lock.json

REM Reinstall
npm install --legacy-peer-deps

REM Start
npm run electron-dev
```

---

## Verification Steps

### Step 1: Check Backend
Open in browser: http://127.0.0.1:8000/meta/health

Should show:
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### Step 2: Check Frontend Dev Server
Open in browser: http://localhost:5173

Should show the dashboard with:
- Sidebar menu
- Top navigation
- KPI cards
- Charts

### Step 3: Check Electron
- Should open automatically
- Should show same dashboard as browser
- Should have DevTools open (Ctrl+I)

---

## Debugging

### Check Browser Console (Ctrl+I)

Look for errors like:
- `Failed to fetch from http://127.0.0.1:8000` - Backend not running
- `Cannot GET /` - Frontend dev server not running
- `CORS error` - API configuration issue

### Check Network Tab

- Should see requests to `http://127.0.0.1:8000/meta/health`
- Should see requests to `http://127.0.0.1:8000/meta/metrics`
- All should return 200 status

### Check Terminal Output

**Backend Terminal**:
- Should show `Application startup complete`
- Should show API requests being processed

**Frontend Terminal**:
- Should show `Local: http://localhost:5173/`
- Should show `ready in XXXms`

**Electron Terminal**:
- Should show Electron starting
- Should show no errors

---

## Common Issues & Fixes

### Issue: "Cannot find module 'electron'"
**Fix**: Run `npm install` in frontend directory

### Issue: "Port 5173 is already in use"
**Fix**: Kill existing process or use different port

### Issue: "Python not found"
**Fix**: Install Python from https://www.python.org/

### Issue: "Node.js not found"
**Fix**: Install Node.js from https://nodejs.org/

### Issue: "Backend connection refused"
**Fix**: Make sure backend is running on port 8000

### Issue: "White screen with no errors"
**Fix**: 
1. Press Ctrl+R to reload
2. Check if dev server is running
3. Check if backend is running
4. Clear cache and restart

---

## Quick Fixes

### Reload Application
Press: `Ctrl+R`

### Open Developer Tools
Press: `Ctrl+I`

### Clear Cache
Press: `Ctrl+Shift+Delete`

### Close Application
Press: `Ctrl+Q`

---

## Recommended Approach

1. **Use START-APP.bat** - Simplest and most reliable
2. **Wait 10-15 seconds** - Let everything start
3. **Check DevTools** - Press Ctrl+I to see any errors
4. **Check Network** - Verify API calls are working
5. **Reload if needed** - Press Ctrl+R

---

## If All Else Fails

### Complete Reset

```bash
cd c:\Users\Admin\CascadeProjects

REM Kill any running processes
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul

REM Clear frontend
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install --legacy-peer-deps
cd ..

REM Clear backend
cd backend
pip install -r requirements.txt --force-reinstall
cd ..

REM Start fresh
cd frontend
npm run electron-dev
```

---

## Still Having Issues?

1. **Check documentation**: See TROUBLESHOOTING.md
2. **Check logs**: Look at terminal output
3. **Check network**: Open http://127.0.0.1:8000/api/docs
4. **Check browser**: Try http://localhost:5173 in browser
5. **Check ports**: Verify 8000 and 5173 are available

---

## Success Indicators

✅ **Backend Running**
- Terminal shows "Application startup complete"
- http://127.0.0.1:8000/meta/health returns 200

✅ **Frontend Running**
- Terminal shows "Local: http://localhost:5173/"
- Browser shows dashboard

✅ **Electron Running**
- Window opens automatically
- Shows dashboard with sidebar
- DevTools shows no errors
- Network requests succeed

---

## Next Steps

1. **Use START-APP.bat** to launch
2. **Wait 10-15 seconds** for startup
3. **Check DevTools** (Ctrl+I) for errors
4. **Reload** (Ctrl+R) if needed
5. **Enjoy** the application!

---

**Status**: ✅ Fixed
**Last Updated**: November 22, 2025
