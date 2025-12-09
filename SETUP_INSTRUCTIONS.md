# 🚀 COMPLETE DATABASE & WEBSITE SETUP GUIDE

## ⚡ FASTEST WAY (5 minutes with Docker)

### Prerequisites
- Docker installed ([Download](https://www.docker.com/products/docker-desktop))
- Git installed

### Step 1: Start PostgreSQL Database
```bash
# Navigate to project root
cd c:\Users\Admin\CascadeProjects

# Start PostgreSQL with Docker
docker-compose up -d postgres

# Wait for it to be ready (check logs)
docker-compose logs postgres
```

**Expected Output:**
```
postgres | database system is ready to accept connections
```

### Step 2: Initialize Database Tables & Data
```bash
# Navigate to backend
cd backend

# Install dependencies (if not done)
pip install -r requirements.txt

# Initialize database
python ml/init_database.py
```

**Expected Output:**
```
================================================================================
INITIALIZING SAIL BOKARO DATABASE
================================================================================
✓ Connected to PostgreSQL
✓ All tables created successfully
✓ Seeded 500 historical shipment records
✓ Seeded 300 historical decision records
✓ Seeded 400+ historical dispatch records

================================================================================
✓ DATABASE INITIALIZATION COMPLETE!
================================================================================
```

### Step 3: Start Backend Server
```bash
# From backend directory
python -m uvicorn app.main:app --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
✓ ML Training Scheduler started successfully
✓ Scheduled daily training at 02:00
```

### Step 4: Start Frontend (New Terminal)
```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 5: Access Website
Open browser and go to: **http://localhost:5173**

---

## ✅ VERIFY EVERYTHING IS WORKING

### Check 1: Database Connection
```bash
cd backend
python -c "from app.db import test_connection; print('✓ Database OK' if test_connection() else '✗ Database Failed')"
```

### Check 2: Backend API
```bash
curl http://localhost:8000/api
```

Expected response:
```json
{
  "status": "success",
  "message": "SAIL Bokaro Logistics Optimization API",
  "data": {...}
}
```

### Check 3: Training Status
```bash
curl http://localhost:8000/ml/training/status
```

Expected response:
```json
{
  "status": "success",
  "data": {
    "scheduler_active": true,
    "training_time": "02:00",
    ...
  }
}
```

### Check 4: Frontend Loading
Visit http://localhost:5173 and verify:
- ✅ Dashboard loads
- ✅ All pages accessible
- ✅ No console errors
- ✅ Data displays correctly

---

## 🗄️ DATABASE DETAILS

### Connection String
```
postgresql://postgres:postgres@localhost:5432/sihdb
```

### Tables Created
1. **historical_shipments** (500 records)
   - Route, Material, Tonnage, Delay, Cost
   - Material Specs: Thickness, Width, Length, Density

2. **historical_decisions** (300 records)
   - Scenario, Decisions, Outcome
   - Impact Metrics: Cost, Time, Satisfaction

3. **historical_dispatches** (400+ records)
   - Order, Customer, Vehicle, Driver
   - Quality Metrics, Fuel, Satisfaction

### Total Data
- **1200+ records** ready for ML training
- **Real-world scenarios** with flat surface materials
- **Complete material specifications** (CR Coils, HR Coils, Plates, Sheets)

---

## 🔌 WEBSITE INTEGRATION

### Frontend → Backend Connection
```javascript
// frontend/src/api/client.js
const API_BASE = 'http://localhost:8000'

// All API calls automatically use the database
```

### Backend → Database Connection
```python
# backend/app/db.py
DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/sihdb'

# Automatic connection pooling and error handling
```

### Data Flow
```
Website (React)
    ↓
Backend API (FastAPI)
    ↓
PostgreSQL Database
    ↓
ML Models (Training & Predictions)
```

---

## 🛠️ TROUBLESHOOTING

### Problem: "Connection refused" on port 5432
**Solution:**
```bash
# Check if Docker container is running
docker ps | grep postgres

# If not running, start it
docker-compose up -d postgres

# Check logs
docker-compose logs postgres
```

### Problem: "Database does not exist"
**Solution:**
```bash
# Initialize database
cd backend
python ml/init_database.py
```

### Problem: "Tables not found"
**Solution:**
```bash
# Check tables
psql -U postgres -d sihdb -c "\dt"

# If empty, reinitialize
python ml/init_database.py
```

### Problem: Frontend can't reach backend
**Solution:**
```bash
# Check backend is running
curl http://localhost:8000/api

# Check CORS settings in backend/app/main.py
# Verify frontend URL is in CORS_ORIGINS
```

### Problem: "ModuleNotFoundError" in backend
**Solution:**
```bash
# Install requirements
cd backend
pip install -r requirements.txt
```

---

## 📊 WHAT'S INCLUDED

### ✅ Database
- PostgreSQL 15 with TimescaleDB
- 3 main tables with 1200+ records
- Proper indexing for performance
- Connection pooling

### ✅ Backend
- FastAPI with async support
- 17 ML models (auto-training daily)
- Database integration
- API endpoints for all features
- Error handling & logging

### ✅ Frontend
- React with Vite
- All pages connected to database
- Real-time updates
- Material specifications displayed
- Responsive design

### ✅ ML Training
- Automated daily training at 2:00 AM
- Performance monitoring (hourly)
- Model versioning & backups
- Training history & statistics
- Auto-retraining if accuracy drops

---

## 🎯 NEXT STEPS

1. ✅ **Database Ready** - PostgreSQL with 1200+ records
2. ✅ **Backend Connected** - FastAPI with database integration
3. ✅ **Frontend Connected** - React with API calls
4. ✅ **ML Training Active** - Daily automated training
5. ⏳ **Optional Enhancements**:
   - Real-time notifications
   - Mobile app
   - Advanced analytics
   - User roles & permissions

---

## 📞 QUICK COMMANDS

```bash
# Start everything
docker-compose up -d postgres
cd backend && python ml/init_database.py
python -m uvicorn app.main:app --reload

# In new terminal
cd frontend && npm run dev

# Check status
curl http://localhost:8000/ml/training/status

# View logs
docker-compose logs postgres
tail -f backend/ml/logs/training_scheduler.log

# Stop everything
docker-compose down
```

---

## 🎓 LEARNING RESOURCES

- **Database**: See `SETUP_DATABASE.md`
- **ML Training**: See `ML_AUTOMATED_TRAINING_GUIDE.md`
- **Material Data**: See `BOKARO_FLAT_MATERIALS_GUIDE.md`
- **API Docs**: http://localhost:8000/api/docs

---

**Status**: ✅ COMPLETE & READY TO USE
**Last Updated**: Nov 30, 2025
**Time to Setup**: ~5 minutes with Docker
