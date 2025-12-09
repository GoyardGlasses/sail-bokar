# Database Setup Guide - SAIL Bokaro Logistics System

## 🚀 Quick Start (Recommended - Docker)

### Step 1: Start PostgreSQL with Docker
```bash
docker run --name bokaro-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=sihdb \
  -p 5432:5432 \
  -d postgres:15
```

### Step 2: Initialize Database
```bash
cd backend
python ml/init_database.py
```

### Step 3: Start the Application
```bash
python -m uvicorn app.main:app --reload
```

---

## 📋 Alternative: Manual PostgreSQL Setup

### Windows:
1. **Install PostgreSQL**
   - Download from https://www.postgresql.org/download/windows/
   - During installation, set password to `postgres`
   - Remember the port (default: 5432)

2. **Create Database**
   ```bash
   psql -U postgres -c "CREATE DATABASE sihdb;"
   ```

3. **Initialize Tables**
   ```bash
   cd backend
   python ml/init_database.py
   ```

### macOS:
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb sihdb

# Initialize
cd backend
python ml/init_database.py
```

### Linux (Ubuntu/Debian):
```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb sihdb

# Initialize
cd backend
python ml/init_database.py
```

---

## ✅ Verify Database Setup

### Check Connection
```bash
cd backend
python -c "from app.db import test_connection; print(test_connection())"
```

### Expected Output
```
✓ Database connection test passed
```

### Check Tables
```bash
psql -U postgres -d sihdb -c "\dt"
```

### Expected Output
```
                    List of relations
 Schema |           Name            | Type  |  Owner
--------+---------------------------+-------+----------
 public | historical_decisions      | table | postgres
 public | historical_dispatches     | table | postgres
 public | historical_shipments      | table | postgres
(3 rows)
```

---

## 📊 Database Schema

### 1. historical_shipments (500 records)
- Route, Material, Tonnage
- Planned vs Actual Days
- Cost, Risk Score
- Material Specs (Thickness, Width, Length, Density)

### 2. historical_decisions (300 records)
- Scenario, Route, Material
- Decision Outcome
- Cost/Time/Satisfaction Impact
- Material Specs

### 3. historical_dispatches (400+ records)
- Order ID, Customer
- Vehicle, Driver
- Status, Dispatch Type
- Quality Metrics
- Material Specs

---

## 🔌 Connection Details

**Database**: PostgreSQL 15
**Host**: localhost
**Port**: 5432
**Database**: sihdb
**User**: postgres
**Password**: postgres

**Connection String**:
```
postgresql://postgres:postgres@localhost:5432/sihdb
```

---

## 🌐 Website Integration

### Frontend API Configuration
File: `frontend/src/api/client.js`

```javascript
const API_BASE = 'http://localhost:8000'

// All API calls automatically use the database
```

### Backend Database Usage
File: `backend/app/db.py`

```python
from app.db import get_db, test_connection

# Get database session
db = get_db()

# Test connection
if test_connection():
    print("Database ready!")
```

---

## 🚨 Troubleshooting

### Issue: "Connection refused"
**Solution**: Make sure PostgreSQL is running
```bash
# Check if running
psql -U postgres -c "SELECT 1"

# If not running, start it
# Docker: docker start bokaro-postgres
# macOS: brew services start postgresql@15
# Linux: sudo systemctl start postgresql
```

### Issue: "Database does not exist"
**Solution**: Create the database
```bash
psql -U postgres -c "CREATE DATABASE sihdb;"
```

### Issue: "Tables not found"
**Solution**: Initialize the database
```bash
cd backend
python ml/init_database.py
```

### Issue: "Authentication failed"
**Solution**: Check credentials in `backend/app/db.py`
```python
DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/sihdb'
                           ↑         ↑
                        user    password
```

---

## 📈 Data Statistics

After initialization, you'll have:

| Table | Records | Purpose |
|-------|---------|---------|
| historical_shipments | 500 | ML training data |
| historical_decisions | 300 | Decision learning |
| historical_dispatches | 400+ | Dispatch history |
| **TOTAL** | **1200+** | Complete dataset |

---

## 🔄 Backup & Restore

### Backup Database
```bash
pg_dump -U postgres sihdb > backup.sql
```

### Restore Database
```bash
psql -U postgres sihdb < backup.sql
```

---

## 🎯 Next Steps

1. ✅ Start PostgreSQL (Docker or local)
2. ✅ Run `python ml/init_database.py`
3. ✅ Verify with `python -c "from app.db import test_connection; print(test_connection())"`
4. ✅ Start backend: `python -m uvicorn app.main:app --reload`
5. ✅ Start frontend: `npm run dev`
6. ✅ Access website: http://localhost:5173

---

## 📞 Support

If you encounter issues:
1. Check PostgreSQL is running
2. Verify credentials in `backend/app/db.py`
3. Check logs in `backend/ml/logs/`
4. Run initialization script again

---

**Status**: ✅ Ready for Production
**Last Updated**: Nov 30, 2025
**Version**: 1.0
