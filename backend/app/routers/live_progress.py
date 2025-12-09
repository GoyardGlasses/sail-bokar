"""
Live Progress API Router - Phase 1 Feature 5
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from app.services.live_progress_service import LiveProgressService, ProgressStage

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/live-progress", tags=["live-progress"])

progress_service = LiveProgressService()

@router.post("/tasks")
async def create_task(plan_id: str, orders_count: int):
    """Create a new optimization task"""
    try:
        task = progress_service.create_task(plan_id, orders_count)
        progress_service.start_task(task.task_id)
        return task.to_dict()
    except Exception as e:
        logger.error(f"Create task error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tasks/{task_id}/simulate")
async def simulate_task(task_id: str, plan_id: str, orders_count: int):
    """Simulate an optimization task"""
    try:
        task = progress_service.simulate_optimization_progress(plan_id, orders_count)
        return task.to_dict()
    except Exception as e:
        logger.error(f"Simulate task error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks/{task_id}")
async def get_task(task_id: str):
    """Get task details"""
    try:
        task = progress_service.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get task error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks")
async def get_active_tasks():
    """Get all active tasks"""
    try:
        tasks = progress_service.get_active_tasks()
        return {
            'total': len(tasks),
            'tasks': tasks,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get active tasks error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks/completed")
async def get_completed_tasks(limit: int = 50):
    """Get completed tasks"""
    try:
        tasks = progress_service.get_completed_tasks(limit)
        return {
            'total': len(tasks),
            'tasks': tasks,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get completed tasks error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tasks/{task_id}/update")
async def update_task_progress(task_id: str, stage: str, progress: int, message: str):
    """Update task progress"""
    try:
        stage_enum = ProgressStage(stage)
        progress_service.update_progress(task_id, stage_enum, progress, message)
        task = progress_service.get_task(task_id)
        return task
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid stage: {stage}")
    except Exception as e:
        logger.error(f"Update progress error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tasks/{task_id}/complete")
async def complete_task(task_id: str):
    """Complete a task"""
    try:
        progress_service.complete_task(task_id)
        return {
            'status': 'success',
            'task_id': task_id,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Complete task error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tasks/{task_id}/fail")
async def fail_task(task_id: str, error: str):
    """Fail a task"""
    try:
        progress_service.fail_task(task_id, error)
        return {
            'status': 'failed',
            'task_id': task_id,
            'error': error,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Fail task error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status():
    """Get live progress service status"""
    try:
        status = progress_service.get_status()
        return status
    except Exception as e:
        logger.error(f"Status check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/statistics")
async def get_statistics():
    """Get progress statistics"""
    try:
        stats = progress_service.get_statistics()
        return stats
    except Exception as e:
        logger.error(f"Get statistics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check"""
    return {
        'status': 'healthy',
        'service': 'live_progress',
        'timestamp': datetime.now().isoformat()
    }
