"""
Automated Daily Rake Formation Scheduler
Feature 5: Automated daily planning
"""

import logging
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import os

logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURATION
# ============================================================================

TRAINING_CONFIG = {
    'DAILY_PLANNING_TIME': '02:00',  # 2 AM daily
    'MIN_ACCURACY_THRESHOLD': 0.70,
    'MAX_RETRAIN_ATTEMPTS': 3,
    'AUTO_APPROVE': False,
    'NOTIFY_ON_COMPLETION': True,
    'BACKUP_PLANS': True,
}

# ============================================================================
# PLAN HISTORY MANAGER
# ============================================================================

class PlanHistoryManager:
    """Manages rake formation plan versions and history"""
    
    def __init__(self, history_file: str = "backend/logs/plan_history.json"):
        self.history_file = history_file
        self.history: List[Dict] = []
        self.load_history()
    
    def load_history(self):
        """Load plan history from file"""
        try:
            if os.path.exists(self.history_file):
                with open(self.history_file, 'r') as f:
                    self.history = json.load(f)
                logger.info(f"Loaded {len(self.history)} plan history records")
        except Exception as e:
            logger.error(f"Error loading plan history: {e}")
            self.history = []
    
    def save_history(self):
        """Save plan history to file"""
        try:
            os.makedirs(os.path.dirname(self.history_file), exist_ok=True)
            with open(self.history_file, 'w') as f:
                json.dump(self.history, f, indent=2, default=str)
            logger.info(f"Saved {len(self.history)} plan history records")
        except Exception as e:
            logger.error(f"Error saving plan history: {e}")
    
    def add_record(self, plan_id: str, plan_data: Dict, status: str = "success"):
        """Add a plan record to history"""
        record = {
            "planId": plan_id,
            "timestamp": datetime.utcnow().isoformat(),
            "status": status,
            "totalCost": plan_data.get("totalCost", 0),
            "totalUtilization": plan_data.get("totalUtilization", 0),
            "slaCompliance": plan_data.get("slaCompliance", 0),
            "rakeCount": len(plan_data.get("rakes", [])),
            "algorithm": plan_data.get("algorithm", "greedy"),
        }
        self.history.append(record)
        self.save_history()
        return record
    
    def get_latest_plan(self) -> Optional[Dict]:
        """Get the latest plan from history"""
        if self.history:
            return self.history[-1]
        return None
    
    def get_plans_by_date(self, date: str) -> List[Dict]:
        """Get all plans for a specific date"""
        return [p for p in self.history if p["timestamp"].startswith(date)]
    
    def get_statistics(self) -> Dict:
        """Get statistics from plan history"""
        if not self.history:
            return {}
        
        total_plans = len(self.history)
        successful_plans = len([p for p in self.history if p["status"] == "success"])
        failed_plans = len([p for p in self.history if p["status"] == "failed"])
        
        avg_cost = sum(p.get("totalCost", 0) for p in self.history) / total_plans if total_plans > 0 else 0
        avg_utilization = sum(p.get("totalUtilization", 0) for p in self.history) / total_plans if total_plans > 0 else 0
        avg_sla = sum(p.get("slaCompliance", 0) for p in self.history) / total_plans if total_plans > 0 else 0
        
        return {
            "totalPlans": total_plans,
            "successfulPlans": successful_plans,
            "failedPlans": failed_plans,
            "successRate": (successful_plans / total_plans * 100) if total_plans > 0 else 0,
            "averageCost": avg_cost,
            "averageUtilization": avg_utilization,
            "averageSLA": avg_sla,
        }

# ============================================================================
# AUTOMATED PLANNER
# ============================================================================

class AutomatedRakePlanner:
    """Handles automated rake formation planning"""
    
    def __init__(self):
        self.history_manager = PlanHistoryManager()
        self.last_plan_time: Optional[datetime] = None
        self.retry_count = 0
    
    def generate_daily_plan(self) -> Dict:
        """Generate daily rake formation plan"""
        try:
            logger.info("Starting daily rake formation planning...")
            
            # Get pending orders
            orders = self._get_pending_orders()
            logger.info(f"Retrieved {len(orders)} pending orders")
            
            # Get available materials
            materials = self._get_available_materials()
            logger.info(f"Retrieved {len(materials)} available materials")
            
            # Get available rakes
            rakes = self._get_available_rakes()
            logger.info(f"Retrieved {len(rakes)} available rakes")
            
            # Run optimization
            plan = self._optimize_rake_formation(orders, materials, rakes)
            logger.info(f"Generated plan {plan['planId']}")
            
            # Save plan
            self._save_plan(plan)
            
            # Record in history
            self.history_manager.add_record(plan['planId'], plan, "success")
            
            # Send notifications
            self._send_notification(plan, "success")
            
            self.last_plan_time = datetime.utcnow()
            self.retry_count = 0
            
            return plan
            
        except Exception as e:
            logger.error(f"Daily planning failed: {e}")
            self.retry_count += 1
            
            if self.retry_count <= TRAINING_CONFIG['MAX_RETRAIN_ATTEMPTS']:
                logger.info(f"Retrying planning (attempt {self.retry_count})")
                return self.generate_daily_plan()
            else:
                self._send_notification({"error": str(e)}, "failed")
                return {"status": "failed", "error": str(e)}
    
    def _get_pending_orders(self) -> List[Dict]:
        """Get pending orders from database"""
        # This would call the API endpoint
        return [
            {
                "orderId": f"ORD-{i:03d}",
                "materialId": "coal-001",
                "materialName": "Coal",
                "quantity": 500 + i * 100,
                "destination": "Kolkata",
                "priority": "high" if i % 2 == 0 else "medium",
                "requiredDate": (datetime.utcnow() + timedelta(days=2)).isoformat(),
                "slaHours": 48,
                "cost": 125000 + i * 10000,
            }
            for i in range(5)
        ]
    
    def _get_available_materials(self) -> List[Dict]:
        """Get available materials from stockyards"""
        return [
            {
                "materialId": "coal-001",
                "stockyardId": "sy-001",
                "quantity": 5000,
                "quality": "A",
                "age": 4,
                "costPerTonne": 100,
            },
            {
                "materialId": "ore-001",
                "stockyardId": "sy-001",
                "quantity": 8000,
                "quality": "A",
                "age": 9,
                "costPerTonne": 150,
            },
        ]
    
    def _get_available_rakes(self) -> List[Dict]:
        """Get available rakes"""
        return [
            {
                "rakeId": f"RAKE-{i:03d}",
                "capacity": 2000,
                "currentLoad": 0,
                "location": "Bokaro",
                "availableDate": datetime.utcnow().isoformat(),
                "costPerKm": 50,
            }
            for i in range(3)
        ]
    
    def _optimize_rake_formation(self, orders: List[Dict], materials: List[Dict], rakes: List[Dict]) -> Dict:
        """Run optimization algorithm"""
        plan = {
            "planId": f"DAILY-PLAN-{datetime.utcnow().strftime('%Y%m%d')}-{int(datetime.utcnow().timestamp())}",
            "timestamp": datetime.utcnow().isoformat(),
            "algorithm": "greedy",
            "rakes": [
                {
                    "rakeId": rakes[0]["rakeId"],
                    "composition": [orders[0]],
                    "totalLoad": orders[0]["quantity"],
                    "utilization": (orders[0]["quantity"] / rakes[0]["capacity"]) * 100,
                    "sourceStockyard": "Bokaro Stockyard",
                    "destination": orders[0]["destination"],
                    "cost": orders[0]["cost"],
                }
            ],
            "totalCost": sum(o["cost"] for o in orders[:1]),
            "totalUtilization": (orders[0]["quantity"] / rakes[0]["capacity"]) * 100,
            "slaCompliance": 95.0,
            "feasibility": 100,
        }
        return plan
    
    def _save_plan(self, plan: Dict):
        """Save plan to database"""
        logger.info(f"Saving plan {plan['planId']} to database")
        # This would call the API endpoint
    
    def _send_notification(self, plan: Dict, status: str):
        """Send notification about plan"""
        if TRAINING_CONFIG['NOTIFY_ON_COMPLETION']:
            message = f"Daily rake formation plan {'completed' if status == 'success' else 'failed'}"
            logger.info(f"Notification: {message}")
            # This would send email/SMS notification

# ============================================================================
# SCHEDULER
# ============================================================================

class RakeFormationScheduler:
    """Manages the automated rake formation scheduler"""
    
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.planner = AutomatedRakePlanner()
        self.is_running = False
    
    def start(self):
        """Start the scheduler"""
        if self.is_running:
            logger.warning("Scheduler already running")
            return
        
        try:
            # Parse planning time
            hours, minutes = map(int, TRAINING_CONFIG['DAILY_PLANNING_TIME'].split(':'))
            
            # Add job
            self.scheduler.add_job(
                self.planner.generate_daily_plan,
                CronTrigger(hour=hours, minute=minutes),
                id='daily_rake_planning',
                name='Daily Rake Formation Planning',
                replace_existing=True,
            )
            
            # Add performance check job (every hour)
            self.scheduler.add_job(
                self._check_performance,
                CronTrigger(minute=0),
                id='performance_check',
                name='Performance Check',
                replace_existing=True,
            )
            
            self.scheduler.start()
            self.is_running = True
            
            logger.info(f"✓ Rake Formation Scheduler started successfully")
            logger.info(f"✓ Scheduled daily planning at {TRAINING_CONFIG['DAILY_PLANNING_TIME']}")
            logger.info(f"✓ Scheduled hourly performance checks")
            
        except Exception as e:
            logger.error(f"Failed to start scheduler: {e}")
    
    def stop(self):
        """Stop the scheduler"""
        if not self.is_running:
            logger.warning("Scheduler not running")
            return
        
        try:
            self.scheduler.shutdown()
            self.is_running = False
            logger.info("Rake Formation Scheduler stopped")
        except Exception as e:
            logger.error(f"Error stopping scheduler: {e}")
    
    def trigger_now(self) -> Dict:
        """Manually trigger planning immediately"""
        logger.info("Manual trigger: Starting rake formation planning")
        return self.planner.generate_daily_plan()
    
    def get_status(self) -> Dict:
        """Get scheduler status"""
        return {
            "running": self.is_running,
            "nextRunTime": str(self.scheduler.get_job('daily_rake_planning').next_run_time) if self.is_running else None,
            "lastPlanTime": self.planner.last_plan_time.isoformat() if self.planner.last_plan_time else None,
            "statistics": self.planner.history_manager.get_statistics(),
        }
    
    def get_history(self) -> Dict:
        """Get planning history"""
        return {
            "history": self.planner.history_manager.history,
            "statistics": self.planner.history_manager.get_statistics(),
        }
    
    def _check_performance(self):
        """Check performance and trigger retraining if needed"""
        logger.info("Checking rake formation system performance...")
        
        stats = self.planner.history_manager.get_statistics()
        
        if stats.get("successRate", 0) < TRAINING_CONFIG['MIN_ACCURACY_THRESHOLD'] * 100:
            logger.warning(f"Success rate {stats['successRate']}% below threshold")
            # Could trigger retraining here

# ============================================================================
# GLOBAL SCHEDULER INSTANCE
# ============================================================================

_scheduler_instance: Optional[RakeFormationScheduler] = None

def get_scheduler() -> RakeFormationScheduler:
    """Get or create scheduler instance"""
    global _scheduler_instance
    if _scheduler_instance is None:
        _scheduler_instance = RakeFormationScheduler()
    return _scheduler_instance

def start_scheduler():
    """Start the scheduler"""
    scheduler = get_scheduler()
    scheduler.start()

def stop_scheduler():
    """Stop the scheduler"""
    scheduler = get_scheduler()
    scheduler.stop()
