# SAIL Bokaro - Integration & QA Checklist
## SIH25208 - Smart India Hackathon 2025

**Date**: 2025-11-22  
**Version**: 1.0.0  
**Status**: Ready for Testing

---

## 📋 PRE-TESTING SETUP

### Environment Setup
- [ ] PostgreSQL 14+ installed
- [ ] TimescaleDB extension enabled
- [ ] Python 3.10+ installed
- [ ] Node.js 16+ installed
- [ ] Docker installed (for containerized testing)
- [ ] All dependencies installed
  - [ ] Backend: `pip install -r backend/requirements.txt`
  - [ ] Frontend: `cd frontend && npm install`
  - [ ] Electron: `cd electron && npm install`

### Database Setup
- [ ] Database created: `sihdb`
- [ ] Schema loaded: `psql -U postgres -d sihdb -f backend/db/schema.sql`
- [ ] Sample data loaded: `python scripts/csv_to_postgres.py`
- [ ] Materialized views created
- [ ] Database connection verified: `python -c "from backend.app.db import test_connection; test_connection()"`

### Configuration
- [ ] `.env` file created with correct values
- [ ] `DATABASE_URL` set correctly
- [ ] `ADMIN_TOKEN` configured
- [ ] `LOG_LEVEL` set to INFO
- [ ] Logs directory created: `mkdir -p logs/optimize_runs`

---

## 🧪 BACKEND TESTING

### 1. Server Startup
- [ ] Backend starts without errors
  ```bash
  python -m uvicorn backend.app.main:app --port 8000
  ```
- [ ] No import errors
- [ ] No model loading errors
- [ ] Database connection established
- [ ] All 7 ML models loaded

### 2. Health Endpoints

#### /meta/health
- [ ] Returns HTTP 200
- [ ] Response contains `status: "healthy"`
- [ ] Response contains `timestamp`
- [ ] Response contains `version`
- [ ] Response contains `database: "connected"`
- [ ] Response contains `models_loaded: 7`

#### /meta/metrics
- [ ] Returns HTTP 200 with admin token
- [ ] Returns HTTP 401 without admin token
- [ ] Response contains `uptime`
- [ ] Response contains `optimizer_runs`
- [ ] Response contains `success_rate`
- [ ] Response contains `avg_optimization_time_seconds`

#### /meta/config
- [ ] Returns HTTP 200
- [ ] Response contains all 7 materials
- [ ] Response contains all 5 destinations
- [ ] Response contains all 3 loading points
- [ ] Response contains transport modes: RAIL, ROAD
- [ ] Response contains priorities: HIGH, MEDIUM, LOW

#### /meta/models
- [ ] Returns HTTP 200
- [ ] Response contains 7 models
- [ ] All models have `loaded: true`
- [ ] All models have performance metrics
- [ ] Total models count is 7

### 3. Prediction Endpoints

#### /predict/demand
- [ ] Returns HTTP 200
- [ ] Response contains `forecast` array
- [ ] Forecast has `date` and `predicted_demand`
- [ ] Confidence intervals present
- [ ] Model version included

#### /predict/delay
- [ ] Returns HTTP 200
- [ ] Response contains `predicted_delay_hours`
- [ ] Response contains `confidence` score
- [ ] Response contains `factors` breakdown
- [ ] Delay is numeric and > 0

#### /predict/rake-availability
- [ ] Returns HTTP 200
- [ ] Response contains `forecast` array
- [ ] Forecast has `date` and `predicted_available_rakes`
- [ ] Confidence score present

#### /predict/cost
- [ ] Returns HTTP 200
- [ ] Response contains `estimated_cost`
- [ ] Response contains `cost_per_tonne`
- [ ] Response contains `breakdown`
- [ ] Cost is numeric and > 0

#### /predict/throughput
- [ ] Returns HTTP 200
- [ ] Response contains `forecast` array
- [ ] Forecast has `predicted_throughput`
- [ ] Utilization percent included

#### /classify/transport-mode
- [ ] Returns HTTP 200
- [ ] Response contains `recommended_mode` (RAIL or ROAD)
- [ ] Response contains `confidence` score
- [ ] Response contains `alternatives`
- [ ] Reasoning provided

### 4. Optimization Endpoint

#### /optimize/dispatch - Basic Test
- [ ] Returns HTTP 200
- [ ] Response contains `rakes` array
- [ ] Response contains `trucks` array
- [ ] Response contains `summary` object
- [ ] Response contains `cost_breakdown`
- [ ] Response contains `predicted_delays`

#### /optimize/dispatch - Response Structure
- [ ] `rakes[]` has: rake_id, destination, wagons, tonnes_allocated, estimated_cost, estimated_delay_hours, loading_slots
- [ ] `trucks[]` has: truck_id, destination, tonnes_loaded, estimated_cost, estimated_delay_hours
- [ ] `summary` has: total_cost, total_tonnes, total_rakes_used, total_trucks_used, fulfillment_rate, optimization_time_seconds, solver_status
- [ ] `cost_breakdown` has: rail_cost, road_cost, total
- [ ] `predicted_delays` has: average_hours, max_hours

#### /optimize/dispatch - High Priority Orders
- [ ] High priority orders are fulfilled first
- [ ] High priority orders get better slots
- [ ] Response structure is valid

#### /optimize/dispatch - No Rakes Available
- [ ] Returns HTTP 200
- [ ] Uses trucks instead of rakes
- [ ] Response structure is valid
- [ ] Cost is calculated correctly

#### /optimize/dispatch - Insufficient Inventory
- [ ] Returns HTTP 200 or 400
- [ ] Partial fulfillment or error message
- [ ] Response structure is valid

#### /optimize/dispatch - Stress Test (200 Orders)
- [ ] Completes within 5 minutes
- [ ] Returns HTTP 200
- [ ] Response structure is valid
- [ ] All orders processed
- [ ] No memory leaks

### 5. Error Handling

#### Invalid Payloads
- [ ] Missing required fields → HTTP 422
- [ ] Invalid data types → HTTP 422
- [ ] Empty orders → HTTP 422
- [ ] Error message is descriptive

#### Timeout Scenarios
- [ ] Optimization timeout → HTTP 408 or 504
- [ ] Database timeout → HTTP 503
- [ ] Model loading timeout → HTTP 503
- [ ] Graceful fallback implemented

#### Missing Model Files
- [ ] Missing model → HTTP 503
- [ ] Error message indicates which model
- [ ] System continues to run
- [ ] Other endpoints still work

### 6. Logging

#### Log Files Created
- [ ] `logs/backend.log` exists
- [ ] `logs/optimize_runs/` directory exists
- [ ] Optimization logs created: `logs/optimize_runs/YYYY-MM-DD_HH-MM-SS.json`
- [ ] Log files contain valid JSON

#### Log Content
- [ ] Timestamp present
- [ ] Request parameters logged
- [ ] Response summary logged
- [ ] Execution time logged
- [ ] Any errors logged

---

## 🎨 FRONTEND TESTING

### 1. Application Startup
- [ ] Frontend starts without errors
  ```bash
  cd frontend && npm run dev
  ```
- [ ] Vite dev server running on port 5173
- [ ] No console errors
- [ ] No build warnings

### 2. Page Navigation
- [ ] Dashboard page loads
- [ ] Optimize page loads
- [ ] Results page loads
- [ ] Admin page loads
- [ ] ML Models page loads
- [ ] Navigation sidebar works
- [ ] Active link highlighting works

### 3. Dashboard Page
- [ ] 4 KPI cards display
- [ ] KPI values are numeric
- [ ] Trend indicators show
- [ ] Backend health indicator shows
- [ ] System health section displays
- [ ] Recent optimizations list shows

### 4. Optimize Page
- [ ] Form loads
- [ ] Input fields accept values
- [ ] "Run Optimization" button works
- [ ] Loading spinner shows during optimization
- [ ] Results page navigates on success
- [ ] Error message shows on failure

### 5. Results Page
- [ ] Summary cards display
- [ ] Rake allocation table shows
- [ ] Truck allocation table shows
- [ ] Export button works
- [ ] "New Optimization" button returns to form

### 6. Admin Page
- [ ] Fetch Metrics button works
- [ ] Metrics display correctly
- [ ] Reload Models button works
- [ ] Success message shows
- [ ] Error handling works

### 7. Responsive Design
- [ ] Layout works on 1024x768
- [ ] Layout works on 1920x1080
- [ ] Sidebar collapses on small screens
- [ ] Tables are scrollable
- [ ] No horizontal scroll on desktop

### 8. Styling & UX
- [ ] Theme colors correct (steel/industrial palette)
- [ ] Animations smooth
- [ ] Buttons have hover effects
- [ ] Forms have proper spacing
- [ ] Cards have shadows
- [ ] Text is readable

---

## 🖥️ ELECTRON TESTING

### 1. Application Launch
- [ ] Electron app launches
- [ ] Window opens with correct size
- [ ] No console errors
- [ ] Backend starts automatically
- [ ] Frontend loads in window

### 2. Backend Integration
- [ ] Backend process spawns
- [ ] Health check waits for backend
- [ ] Backend health indicator shows green
- [ ] Backend logs appear in console
- [ ] Backend process kills on app exit

### 3. Single Instance Lock
- [ ] Only one instance can run
- [ ] Second launch focuses existing window
- [ ] No duplicate processes

### 4. IPC Communication
- [ ] `window.api.getBackendStatus()` works
- [ ] `window.api.restartBackend()` works
- [ ] `window.api.getAppInfo()` works
- [ ] `window.api.openLogs()` works

### 5. Error Handling
- [ ] Backend startup failure shows dialog
- [ ] Backend health check timeout shows dialog
- [ ] Missing backend binary shows error
- [ ] Graceful fallback to demo mode

### 6. Packaged App (if available)
- [ ] Installer runs without errors
- [ ] App installs to correct location
- [ ] App launches from Start Menu / Applications
- [ ] Uninstaller removes app cleanly
- [ ] Portable version runs without installation

---

## 🗄️ DATABASE TESTING

### 1. Connection
- [ ] PostgreSQL running
- [ ] TimescaleDB extension enabled
- [ ] Database `sihdb` exists
- [ ] Connection pool working
- [ ] Connection timeout handled

### 2. Tables
- [ ] All 8 tables exist
- [ ] All tables have data
- [ ] Primary keys enforced
- [ ] Foreign keys enforced
- [ ] Indexes created

### 3. Hypertables
- [ ] `rake_arrivals` is hypertable
- [ ] `lp_throughput` is hypertable
- [ ] Time-series queries work
- [ ] Chunks created automatically

### 4. Materialized Views
- [ ] `mv_latest_inventory` exists
- [ ] `mv_daily_forecast_summary` exists
- [ ] `mv_lp_daily_stats` exists
- [ ] Views can be refreshed
- [ ] Views return correct data

### 5. Query Performance
- [ ] Latest inventory query: < 10ms
- [ ] Orders by destination: < 50ms
- [ ] LP throughput (24h): < 100ms
- [ ] Rake arrivals (7d): < 150ms

---

## 🤖 ML MODELS TESTING

### 1. Model Files
- [ ] demand_model.pkl exists
- [ ] rake_availability_model.pkl exists
- [ ] delay_classifier.pkl exists
- [ ] delay_regressor.pkl exists
- [ ] throughput_model.pkl exists
- [ ] cost_model.pkl exists
- [ ] mode_classifier.pkl exists

### 2. Model Loading
- [ ] All 7 models load on startup
- [ ] No loading errors
- [ ] Models accessible via ML service
- [ ] Model metadata available
- [ ] Performance metrics available

### 3. Model Predictions
- [ ] Demand model makes predictions
- [ ] Delay model makes predictions
- [ ] Rake availability model makes predictions
- [ ] Throughput model makes predictions
- [ ] Cost model makes predictions
- [ ] Mode classifier makes predictions
- [ ] All predictions are numeric

### 4. Model Performance
- [ ] Demand MAE < 500
- [ ] Rake availability MAE < 1.5
- [ ] Delay accuracy > 0.70
- [ ] Throughput MAE < 150
- [ ] Cost MAE < 50000
- [ ] Mode accuracy > 0.85

### 5. Model Reload
- [ ] Models can be reloaded without restart
- [ ] Reload completes successfully
- [ ] No service interruption
- [ ] Predictions work after reload

---

## 🔄 INTEGRATION TESTS

### 1. Full Workflow
- [ ] Health check passes
- [ ] Demand forecast works
- [ ] Optimization runs
- [ ] Results display
- [ ] Export works

### 2. Multiple Optimizations
- [ ] Run optimization 3 times
- [ ] All complete successfully
- [ ] No memory leaks
- [ ] Logs created for each

### 3. Concurrent Requests
- [ ] Multiple forecast requests work
- [ ] Multiple optimization requests work
- [ ] No race conditions
- [ ] Responses are consistent

### 4. Demo Mode
- [ ] App works without database
- [ ] Sample data loads
- [ ] Optimization works offline
- [ ] Results display correctly

### 5. Fallback Scenarios
- [ ] Database down → use CSV mode
- [ ] Model missing → return 503
- [ ] Backend timeout → show error
- [ ] Invalid input → return 422

---

## 📊 PERFORMANCE TESTING

### 1. Startup Time
- [ ] Backend startup: < 10 seconds
- [ ] Frontend startup: < 5 seconds
- [ ] Electron startup: < 15 seconds
- [ ] Database connection: < 2 seconds

### 2. Optimization Time
- [ ] Small problem (10 orders): < 5 seconds
- [ ] Medium problem (50 orders): < 15 seconds
- [ ] Large problem (200 orders): < 120 seconds

### 3. Memory Usage
- [ ] Backend: < 500MB
- [ ] Frontend: < 300MB
- [ ] Electron: < 800MB
- [ ] No memory leaks after 1 hour

### 4. CPU Usage
- [ ] Idle: < 5%
- [ ] During optimization: < 50%
- [ ] Peak: < 80%

---

## 🔐 SECURITY TESTING

### 1. Authentication
- [ ] Admin endpoints require token
- [ ] Invalid token rejected
- [ ] Missing token rejected
- [ ] Token validation works

### 2. Input Validation
- [ ] SQL injection attempts blocked
- [ ] Invalid JSON rejected
- [ ] Oversized payloads rejected
- [ ] Type validation works

### 3. CORS
- [ ] Frontend can access backend
- [ ] Unauthorized origins blocked
- [ ] Preflight requests handled

### 4. Secrets
- [ ] No secrets in logs
- [ ] No secrets in responses
- [ ] No secrets in frontend code
- [ ] Environment variables used

---

## 📝 DOCUMENTATION TESTING

### 1. README Files
- [ ] README.md is complete
- [ ] Setup instructions work
- [ ] Example commands work
- [ ] Links are valid

### 2. API Documentation
- [ ] All endpoints documented
- [ ] Request/response examples provided
- [ ] Error codes documented
- [ ] Authentication documented

### 3. Database Documentation
- [ ] Schema documented
- [ ] Table relationships documented
- [ ] Query examples provided
- [ ] Performance tips included

### 4. Deployment Guide
- [ ] Docker instructions work
- [ ] Local setup instructions work
- [ ] Troubleshooting guide helpful
- [ ] System requirements clear

---

## ✅ FINAL VERIFICATION

### Before Submission
- [ ] All tests passed
- [ ] No critical bugs
- [ ] No console errors
- [ ] No database errors
- [ ] All logs clean
- [ ] Documentation complete
- [ ] Code is clean
- [ ] No hardcoded secrets
- [ ] Performance acceptable
- [ ] Security verified

### Submission Readiness
- [ ] All deliverables present
- [ ] Installers tested
- [ ] Demo script works
- [ ] Submission checklist complete
- [ ] README files updated
- [ ] Release notes prepared
- [ ] Support information provided

---

## 🎯 SIGN-OFF

**QA Lead**: ___________________  
**Date**: ___________________  
**Status**: ✅ READY FOR SUBMISSION

---

**PHASE 5.1 — QA & INTEGRATION COMPLETE**

