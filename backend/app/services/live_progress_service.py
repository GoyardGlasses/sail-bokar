"""
Live Optimizer Progress Service - Phase 1 Feature 5
Real-time progress tracking for optimization tasks
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from enum import Enum
import logging
import random

logger = logging.getLogger(__name__)

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"

class ProgressStage(str, Enum):
    INITIALIZATION = "initialization"
    DATA_VALIDATION = "data_validation"
    PREDICTIONS = "predictions"
    OPTIMIZATION = "optimization"
    RISK_ASSESSMENT = "risk_assessment"
    PLAN_GENERATION = "plan_generation"
    COMPLETION = "completion"

class ProgressUpdate:
    """Progress update for a task"""
    def __init__(self, task_id: str, stage: ProgressStage, progress: int, message: str):
        self.id = f"PROG-{int(datetime.now().timestamp() * 1000)}"
        self.task_id = task_id
        self.stage = stage
        self.progress = progress  # 0-100
        self.message = message
        self.timestamp = datetime.now()
        self.duration_seconds = 0
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'task_id': self.task_id,
            'stage': self.stage,
            'progress': self.progress,
            'message': self.message,
            'timestamp': self.timestamp.isoformat(),
            'duration_seconds': self.duration_seconds
        }

class OptimizationTask:
    """Optimization task with progress tracking"""
    def __init__(self, task_id: str, plan_id: str, orders_count: int):
        self.task_id = task_id
        self.plan_id = plan_id
        self.orders_count = orders_count
        self.status = TaskStatus.PENDING
        self.overall_progress = 0
        self.current_stage = ProgressStage.INITIALIZATION
        self.updates = []
        self.start_time = None
        self.end_time = None
        self.estimated_completion = None
    
    def start(self):
        """Start the task"""
        self.status = TaskStatus.RUNNING
        self.start_time = datetime.now()
        self.estimated_completion = self.start_time + timedelta(seconds=30)
    
    def add_update(self, stage: ProgressStage, progress: int, message: str):
        """Add progress update"""
        update = ProgressUpdate(self.task_id, stage, progress, message)
        self.updates.append(update)
        self.current_stage = stage
        self.overall_progress = progress
    
    def complete(self):
        """Mark task as completed"""
        self.status = TaskStatus.COMPLETED
        self.end_time = datetime.now()
        self.overall_progress = 100
    
    def fail(self, error: str):
        """Mark task as failed"""
        self.status = TaskStatus.FAILED
        self.end_time = datetime.now()
        self.add_update(self.current_stage, self.overall_progress, f"Error: {error}")
    
    def get_duration(self) -> int:
        """Get task duration in seconds"""
        if self.start_time is None:
            return 0
        end = self.end_time or datetime.now()
        return int((end - self.start_time).total_seconds())
    
    def to_dict(self) -> Dict:
        return {
            'task_id': self.task_id,
            'plan_id': self.plan_id,
            'orders_count': self.orders_count,
            'status': self.status,
            'overall_progress': self.overall_progress,
            'current_stage': self.current_stage,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'estimated_completion': self.estimated_completion.isoformat() if self.estimated_completion else None,
            'duration_seconds': self.get_duration(),
            'updates': [u.to_dict() for u in self.updates[-10:]]  # Last 10 updates
        }

class LiveProgressService:
    """Service for live optimization progress tracking"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.tasks = {}
        self.completed_tasks = []
    
    def create_task(self, plan_id: str, orders_count: int) -> OptimizationTask:
        """Create a new optimization task"""
        try:
            task_id = f"TASK-{int(datetime.now().timestamp())}"
            task = OptimizationTask(task_id, plan_id, orders_count)
            self.tasks[task_id] = task
            
            self.logger.info(f"✓ Created task {task_id} for plan {plan_id}")
            
            return task
        
        except Exception as e:
            self.logger.error(f"Error creating task: {e}")
            raise
    
    def start_task(self, task_id: str):
        """Start a task"""
        try:
            task = self.tasks.get(task_id)
            if not task:
                raise ValueError(f"Task {task_id} not found")
            
            task.start()
            self.logger.info(f"✓ Started task {task_id}")
        
        except Exception as e:
            self.logger.error(f"Error starting task: {e}")
            raise
    
    def update_progress(self, task_id: str, stage: ProgressStage, progress: int, message: str):
        """Update task progress"""
        try:
            task = self.tasks.get(task_id)
            if not task:
                raise ValueError(f"Task {task_id} not found")
            
            task.add_update(stage, progress, message)
            self.logger.info(f"✓ Updated task {task_id}: {stage} ({progress}%)")
        
        except Exception as e:
            self.logger.error(f"Error updating progress: {e}")
            raise
    
    def complete_task(self, task_id: str):
        """Complete a task"""
        try:
            task = self.tasks.get(task_id)
            if not task:
                raise ValueError(f"Task {task_id} not found")
            
            task.complete()
            self.completed_tasks.append(task)
            del self.tasks[task_id]
            
            self.logger.info(f"✓ Completed task {task_id}")
        
        except Exception as e:
            self.logger.error(f"Error completing task: {e}")
            raise
    
    def fail_task(self, task_id: str, error: str):
        """Fail a task"""
        try:
            task = self.tasks.get(task_id)
            if not task:
                raise ValueError(f"Task {task_id} not found")
            
            task.fail(error)
            self.completed_tasks.append(task)
            del self.tasks[task_id]
            
            self.logger.info(f"✗ Failed task {task_id}: {error}")
        
        except Exception as e:
            self.logger.error(f"Error failing task: {e}")
            raise
    
    def get_task(self, task_id: str) -> Optional[Dict]:
        """Get task details"""
        task = self.tasks.get(task_id)
        if task:
            return task.to_dict()
        
        # Check completed tasks
        completed = next((t for t in self.completed_tasks if t.task_id == task_id), None)
        if completed:
            return completed.to_dict()
        
        return None
    
    def get_active_tasks(self) -> List[Dict]:
        """Get all active tasks"""
        return [task.to_dict() for task in self.tasks.values()]
    
    def get_completed_tasks(self, limit: int = 50) -> List[Dict]:
        """Get completed tasks"""
        return [task.to_dict() for task in self.completed_tasks[-limit:]]
    
    def simulate_optimization_progress(self, plan_id: str, orders_count: int) -> OptimizationTask:
        """Simulate an optimization task with progress updates"""
        try:
            # Create task
            task = self.create_task(plan_id, orders_count)
            task.start()
            
            # Simulate stages
            stages = [
                (ProgressStage.INITIALIZATION, 10, "Initializing optimization engine..."),
                (ProgressStage.DATA_VALIDATION, 20, "Validating input data..."),
                (ProgressStage.DATA_VALIDATION, 30, "Checking stock levels..."),
                (ProgressStage.PREDICTIONS, 40, "Running demand forecast..."),
                (ProgressStage.PREDICTIONS, 50, "Running delay forecast..."),
                (ProgressStage.PREDICTIONS, 60, "Running cost forecast..."),
                (ProgressStage.OPTIMIZATION, 70, "Generating allocation plan..."),
                (ProgressStage.OPTIMIZATION, 80, "Optimizing rake formation..."),
                (ProgressStage.RISK_ASSESSMENT, 85, "Assessing plan risk..."),
                (ProgressStage.PLAN_GENERATION, 95, "Finalizing plan..."),
                (ProgressStage.COMPLETION, 100, "Optimization complete!"),
            ]
            
            for stage, progress, message in stages:
                task.add_update(stage, progress, message)
            
            task.complete()
            self.completed_tasks.append(task)
            del self.tasks[task.task_id]
            
            self.logger.info(f"✓ Simulated optimization task {task.task_id}")
            
            return task
        
        except Exception as e:
            self.logger.error(f"Error simulating optimization: {e}")
            raise
    
    def get_status(self) -> Dict:
        """Get live progress service status"""
        return {
            'status': 'running',
            'active_tasks': len(self.tasks),
            'completed_tasks': len(self.completed_tasks),
            'total_tasks': len(self.tasks) + len(self.completed_tasks),
            'timestamp': datetime.now().isoformat()
        }
    
    def get_statistics(self) -> Dict:
        """Get progress statistics"""
        try:
            all_tasks = list(self.tasks.values()) + self.completed_tasks
            
            if not all_tasks:
                return {
                    'total_tasks': 0,
                    'avg_duration': 0,
                    'success_rate': 0,
                    'active_tasks': 0
                }
            
            completed = [t for t in all_tasks if t.status == TaskStatus.COMPLETED]
            failed = [t for t in all_tasks if t.status == TaskStatus.FAILED]
            
            avg_duration = sum(t.get_duration() for t in completed) / len(completed) if completed else 0
            success_rate = len(completed) / len(all_tasks) if all_tasks else 0
            
            return {
                'total_tasks': len(all_tasks),
                'completed_tasks': len(completed),
                'failed_tasks': len(failed),
                'active_tasks': len(self.tasks),
                'avg_duration_seconds': int(avg_duration),
                'success_rate': success_rate,
                'timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            self.logger.error(f"Error getting statistics: {e}")
            raise
