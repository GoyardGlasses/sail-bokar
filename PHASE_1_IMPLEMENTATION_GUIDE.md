# 🚀 PHASE 1 IMPLEMENTATION GUIDE (SIH Demo Ready)

**Duration**: 10-12 days
**Effort**: 80 hours
**Impact**: Makes system look autonomous and smart

---

## 📋 PHASE 1 FEATURES (Priority Order)

### 1. AUTO-OPTIMIZATION SCHEDULER (2 days)
**What**: System auto-generates daily plan + triggers on data change
**Where**: Backend + UI

#### 1.1 Backend Implementation
**File**: `backend/app/services/auto_optimizer_service.py` (NEW)

```python
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import logging

class AutoOptimizerService:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.logger = logging.getLogger(__name__)
    
    def start(self):
        """Start auto-optimization scheduler"""
        # Schedule nightly optimization at 2:00 AM
        self.scheduler.add_job(
            self.run_nightly_optimization,
            'cron',
            hour=2,
            minute=0,
            id='nightly_optimization'
        )
        self.scheduler.start()
        self.logger.info("Auto-optimizer scheduler started")
    
    def run_nightly_optimization(self):
        """Run optimization nightly"""
        try:
            # 1. Fetch latest data
            orders = self.fetch_pending_orders()
            stock = self.fetch_stock_levels()
            rakes = self.fetch_available_rakes()
            
            # 2. Run predictions
            predictions = self.run_predictions(orders, stock, rakes)
            
            # 3. Run optimizer
            plan = self.run_optimizer(orders, stock, rakes, predictions)
            
            # 4. Assess risk
            risk_score = self.assess_risk(plan)
            
            # 5. Auto-publish if low-risk
            if risk_score < 0.15:  # Low risk threshold
                self.auto_publish_plan(plan)
                self.logger.info(f"Auto-published plan {plan['id']} (risk: {risk_score})")
            else:
                self.notify_planners(plan, risk_score)
                self.logger.info(f"Plan {plan['id']} requires approval (risk: {risk_score})")
        
        except Exception as e:
            self.logger.error(f"Nightly optimization failed: {e}")
            self.send_alert("Nightly optimization failed", str(e))
    
    def trigger_on_data_change(self, data_type: str):
        """Trigger optimization when data changes"""
        # Check if change is significant
        if self.is_significant_change(data_type):
            self.run_nightly_optimization()
    
    def auto_publish_plan(self, plan):
        """Auto-publish low-risk plan"""
        plan['status'] = 'auto_published'
        plan['auto_published_at'] = datetime.now()
        self.save_plan(plan)
        self.notify_stakeholders(plan)
```

**API Endpoint**: `backend/app/routers/auto_optimizer.py` (NEW)

```python
from fastapi import APIRouter, BackgroundTasks
from datetime import datetime

router = APIRouter(prefix="/api/auto-optimizer", tags=["auto-optimizer"])

@router.get("/status")
async def get_status():
    """Get auto-optimizer status"""
    return {
        "status": "running",
        "next_run": "2024-12-03 02:00:00",
        "last_run": "2024-12-02 02:00:00",
        "last_plan_id": "PLAN-1733145600",
        "last_plan_status": "auto_published"
    }

@router.post("/trigger")
async def trigger_optimization(background_tasks: BackgroundTasks):
    """Manually trigger optimization"""
    background_tasks.add_task(run_optimization_task)
    return {"status": "optimization_started", "estimated_time": "3s"}

@router.get("/history")
async def get_history(limit: int = 10):
    """Get optimization history"""
    return [
        {
            "date": "2024-12-02 02:00:00",
            "plan_id": "PLAN-1733145600",
            "status": "auto_published",
            "cost": 2100000,
            "risk": 0.12
        },
        # ... more history
    ]
```

#### 1.2 Frontend Implementation
**File**: `frontend/src/features/autoOptimizer/AutoOptimizerPanel.jsx` (NEW)

```jsx
import React, { useState, useEffect } from 'react'
import { Play, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function AutoOptimizerPanel() {
  const [status, setStatus] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    const res = await fetch('/api/auto-optimizer/status')
    const data = await res.json()
    setStatus(data)
  }

  const triggerOptimization = async () => {
    setIsRunning(true)
    setProgress(0)
    
    const res = await fetch('/api/auto-optimizer/trigger', { method: 'POST' })
    const data = await res.json()
    
    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 300))
      setProgress(i)
    }
    
    setIsRunning(false)
    fetchStatus()
  }

  return (
    <div className="card space-y-4">
      <h3 className="font-bold text-slate-900 dark:text-slate-50">
        Auto-Optimization Scheduler
      </h3>
      
      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded">
          <p className="text-xs text-slate-600 dark:text-slate-400">Status</p>
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            {status?.status === 'running' ? '🟢 Running' : '🔴 Stopped'}
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded">
          <p className="text-xs text-slate-600 dark:text-slate-400">Next Run</p>
          <p className="font-semibold text-slate-900 dark:text-slate-50 text-sm">
            {status?.next_run}
          </p>
        </div>
      </div>

      {/* Trigger Button */}
      <button
        onClick={triggerOptimization}
        disabled={isRunning}
        className="btn btn-primary w-full flex items-center justify-center gap-2"
      >
        <Play size={18} />
        {isRunning ? 'Optimizing...' : 'Trigger Now'}
      </button>

      {/* Progress Bar */}
      {isRunning && (
        <div className="space-y-2">
          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
            Optimizer running... {progress}% (ETA 3s)
          </p>
        </div>
      )}

      {/* Last Plan */}
      {status?.last_plan_id && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Last Plan</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-50">
                {status.last_plan_id}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {status.last_plan_status === 'auto_published' ? (
                  <span className="text-green-600">✓ Auto-published</span>
                ) : (
                  <span className="text-yellow-600">⚠ Awaiting approval</span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900 dark:text-slate-50">
                ₹{(status.last_plan_cost / 100000).toFixed(1)}L
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Risk: {(status.last_plan_risk * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

### 2. AUTO-ALERTS & MITIGATION (3 days)
**What**: System generates alerts + provides "Apply" buttons for auto-actions
**Where**: Backend (rules engine) + UI (alert inbox)

#### 2.1 Backend Rules Engine
**File**: `backend/app/services/rules_engine.py` (NEW)

```python
class RulesEngine:
    def __init__(self):
        self.rules = [
            {
                "id": "high_demurrage_risk",
                "condition": "demurrage_risk > 0.3",
                "action": "convert_to_truck",
                "description": "High demurrage risk detected"
            },
            {
                "id": "insufficient_rakes",
                "condition": "available_rakes < pending_orders * 0.5",
                "action": "suggest_road_transport",
                "description": "Insufficient rakes available"
            },
            {
                "id": "inventory_low",
                "condition": "stock_level < min_threshold",
                "action": "notify_procurement",
                "description": "Stock level below minimum"
            }
        ]
    
    def evaluate_alerts(self, context):
        """Evaluate rules and generate alerts"""
        alerts = []
        for rule in self.rules:
            if self.evaluate_condition(rule['condition'], context):
                alert = {
                    "id": rule['id'],
                    "description": rule['description'],
                    "action": rule['action'],
                    "severity": self.calculate_severity(rule, context),
                    "suggested_action": self.get_action_description(rule['action']),
                    "can_auto_apply": self.can_auto_apply(rule, context)
                }
                alerts.append(alert)
        return alerts
    
    def apply_action(self, alert_id, action):
        """Apply recommended action"""
        if action == "convert_to_truck":
            return self.convert_orders_to_truck()
        elif action == "suggest_road_transport":
            return self.suggest_road_transport()
        elif action == "notify_procurement":
            return self.notify_procurement()
```

#### 2.2 Frontend Alert Inbox
**File**: `frontend/src/features/alerts/AlertInbox.jsx` (NEW)

```jsx
import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Zap } from 'lucide-react'

export default function AlertInbox() {
  const [alerts, setAlerts] = useState([])
  const [applying, setApplying] = useState(null)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    const res = await fetch('/api/alerts')
    const data = await res.json()
    setAlerts(data)
  }

  const applyAction = async (alertId) => {
    setApplying(alertId)
    const res = await fetch(`/api/alerts/${alertId}/apply`, { method: 'POST' })
    const result = await res.json()
    
    // Show success
    alert(`Action applied! ${result.message}`)
    
    // Refresh
    setApplying(null)
    fetchAlerts()
  }

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-slate-900 dark:text-slate-50">
        Alerts & Recommendations
      </h3>
      
      {alerts.length === 0 ? (
        <div className="card text-center py-6">
          <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
          <p className="text-slate-600 dark:text-slate-400">No alerts</p>
        </div>
      ) : (
        alerts.map(alert => (
          <div key={alert.id} className="card border-l-4 border-yellow-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-slate-50">
                  {alert.description}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {alert.suggested_action}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                alert.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {alert.severity}
              </span>
            </div>
            
            {alert.can_auto_apply && (
              <button
                onClick={() => applyAction(alert.id)}
                disabled={applying === alert.id}
                className="mt-3 btn btn-sm btn-primary flex items-center gap-2"
              >
                <Zap size={16} />
                {applying === alert.id ? 'Applying...' : 'Apply Mitigation'}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  )
}
```

---

### 3. CONFIDENCE INDICATORS (2 days)
**What**: Show prediction confidence + fallback strategy
**Where**: Predictions + Dashboard

#### 3.1 Add Confidence to Predictions
**File**: `backend/app/routers/predictions.py` (MODIFY)

```python
@router.post("/predict/demand")
async def predict_demand(request: DemandRequest):
    """Predict demand with confidence"""
    prediction = model.predict(request.data)
    confidence = model.get_confidence(request.data)
    
    return {
        "demand": prediction,
        "confidence": confidence,  # 0.0-1.0
        "range": {
            "low": prediction * (1 - 0.1 * (1 - confidence)),
            "high": prediction * (1 + 0.1 * (1 - confidence))
        },
        "fallback": "Use historical average" if confidence < 0.7 else None
    }
```

#### 3.2 Display on Dashboard
**File**: `frontend/src/pages/Dashboard.jsx` (MODIFY)

```jsx
// Add confidence badge to KPI cards
<div className="card">
  <p className="text-sm text-slate-600 dark:text-slate-400">Demand Forecast</p>
  <div className="flex items-end justify-between">
    <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
      2,500T
    </p>
    <span className={`px-2 py-1 rounded text-xs font-semibold ${
      confidence > 0.85 ? 'bg-green-100 text-green-700' :
      confidence > 0.70 ? 'bg-yellow-100 text-yellow-700' :
      'bg-red-100 text-red-700'
    }`}>
      {(confidence * 100).toFixed(0)}% confidence
    </span>
  </div>
  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
    Range: 2,350T - 2,650T
  </p>
</div>
```

---

### 4. AUTO-REPORT & EMAIL (2 days)
**What**: Auto-generate daily dispatch report + email to stakeholders
**Where**: Backend scheduler + Email service

#### 4.1 Report Generator
**File**: `backend/app/services/report_generator.py` (NEW)

```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from datetime import datetime
import smtplib

class ReportGenerator:
    def generate_daily_report(self, plan):
        """Generate PDF report"""
        filename = f"dispatch_report_{datetime.now().strftime('%Y%m%d')}.pdf"
        
        c = canvas.Canvas(filename, pagesize=letter)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, 750, "Daily Dispatch Plan")
        
        c.setFont("Helvetica", 10)
        y = 720
        
        # Plan summary
        c.drawString(50, y, f"Plan ID: {plan['id']}")
        y -= 20
        c.drawString(50, y, f"Date: {datetime.now().strftime('%Y-%m-%d')}")
        y -= 20
        c.drawString(50, y, f"Total Cost: ₹{plan['total_cost']:,.0f}")
        y -= 20
        c.drawString(50, y, f"Risk Score: {plan['risk_score']:.2%}")
        y -= 40
        
        # Rakes table
        c.setFont("Helvetica-Bold", 11)
        c.drawString(50, y, "Rakes")
        y -= 20
        
        c.setFont("Helvetica", 9)
        for rake in plan['rakes']:
            c.drawString(50, y, f"  {rake['id']}: {rake['load']}T → {rake['destination']}")
            y -= 15
        
        c.save()
        return filename
    
    def send_email_report(self, recipients, filename):
        """Send report via email"""
        msg = f"""
        Daily Dispatch Plan Report
        
        Please find attached the daily dispatch plan.
        
        Generated: {datetime.now()}
        """
        
        # Send email (use your email service)
        # smtplib.send(recipients, msg, filename)
```

#### 4.2 Scheduler Integration
**File**: `backend/app/main.py` (MODIFY)

```python
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()

@app.on_event("startup")
async def startup_event():
    # Start auto-report scheduler
    scheduler.add_job(
        send_daily_report,
        'cron',
        hour=6,  # 6 AM
        minute=0
    )
    scheduler.start()

async def send_daily_report():
    """Send daily report"""
    plan = get_latest_plan()
    report_file = generate_daily_report(plan)
    send_email_report(['stakeholders@company.com'], report_file)
```

---

### 5. LIVE OPTIMIZER PROGRESS (1 day)
**What**: Show "Optimizer running..." with progress bar
**Where**: Frontend + Backend WebSocket

#### 5.1 Backend Progress Tracking
**File**: `backend/app/services/optimizer_service.py` (MODIFY)

```python
from fastapi import WebSocket

class OptimizerService:
    def run_optimizer_with_progress(self, input_data, websocket: WebSocket):
        """Run optimizer and stream progress"""
        solver = RakeFormationOptimizer()
        
        # Start optimization
        for iteration in range(100):
            # Run solver step
            result = solver.solve_step(input_data)
            
            # Send progress update
            progress = {
                "iteration": iteration,
                "best_cost": result['cost'],
                "progress_percent": (iteration / 100) * 100,
                "estimated_time": f"{(100 - iteration) * 0.03:.1f}s"
            }
            
            websocket.send_json(progress)
        
        return result
```

#### 5.2 Frontend Progress Display
**File**: `frontend/src/features/optimizer/OptimizerProgress.jsx` (NEW)

```jsx
import React, { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'

export default function OptimizerProgress({ isRunning, progress }) {
  return (
    <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="text-blue-600 animate-pulse" size={20} />
        <p className="font-semibold text-slate-900 dark:text-slate-50">
          Optimizer running...
        </p>
      </div>
      
      <div className="space-y-2">
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${progress.progress_percent}%` }}
          />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-slate-600 dark:text-slate-400">Progress</p>
            <p className="font-bold text-slate-900 dark:text-slate-50">
              {progress.progress_percent.toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400">Best Cost</p>
            <p className="font-bold text-slate-900 dark:text-slate-50">
              ₹{(progress.best_cost / 100000).toFixed(1)}L
            </p>
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400">ETA</p>
            <p className="font-bold text-slate-900 dark:text-slate-50">
              {progress.estimated_time}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Week 1
- [ ] Day 1-2: Auto-Optimization Scheduler
  - [ ] Backend scheduler setup
  - [ ] API endpoints
  - [ ] Database schema for plan history
  
- [ ] Day 3-5: Auto-Alerts & Mitigation
  - [ ] Rules engine
  - [ ] Alert generation
  - [ ] Action handlers
  - [ ] Frontend alert inbox

### Week 2
- [ ] Day 6-7: Confidence Indicators
  - [ ] Add confidence to models
  - [ ] Dashboard display
  - [ ] Fallback strategy UI

- [ ] Day 8-9: Auto-Report & Email
  - [ ] Report generator
  - [ ] Email service
  - [ ] Scheduler integration

- [ ] Day 10: Live Optimizer Progress
  - [ ] WebSocket setup
  - [ ] Progress tracking
  - [ ] Frontend display

---

## 🎬 DEMO FLOW (After Phase 1)

```
1. Open Dashboard
   → Show auto-refreshing KPIs with confidence badges
   → Point to auto-alert: "3 orders at risk"

2. Click "Apply Mitigation"
   → System auto-converts to trucks
   → Show cost delta: "Saves ₹50K"

3. Click "Generate Plan"
   → Show progress bar: "Optimizer running... 45% (ETA 2s)"
   → Watch best cost improve in real-time

4. Plan completes
   → Show confidence: "92% confidence"
   → Click "Explain" → Show dynamic explanation

5. Simulate scenario
   → "Remove 2 rakes"
   → System auto-re-optimizes in 2s
   → Show delta: "Cost +₹100K, Utilization -5%"

6. Show email
   → "Daily dispatch report sent to stakeholders@company.com"
   → Open PDF report

[Total time: ~60 seconds, looks SMART and AUTONOMOUS]
```

---

## ✅ SUCCESS CRITERIA

After Phase 1, your system should:
- ✅ Auto-optimize nightly + on-demand
- ✅ Generate alerts with "Apply" buttons
- ✅ Show confidence on predictions
- ✅ Auto-generate & email reports
- ✅ Show live optimizer progress
- ✅ Look autonomous and intelligent

**Result**: Judges see a system that acts without user input ✨

