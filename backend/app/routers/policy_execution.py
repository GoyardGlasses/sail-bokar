"""
Policy-Based Execution API Router - Phase 2 Feature 2
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from app.services.policy_execution_service import PolicyExecutionService, PolicyType

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/policies", tags=["policies"])

policy_service = PolicyExecutionService()

@router.post("/evaluate")
async def evaluate_policies(data: Dict[str, Any]):
    """Evaluate all policies against data"""
    try:
        executions = policy_service.evaluate_policies(data)
        return {
            'status': 'success',
            'policies_evaluated': len(policy_service.policies),
            'policies_executed': len(executions),
            'executions': [e.to_dict() for e in executions],
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Evaluate error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create")
async def create_policy(policy_type: str, name: str, conditions: List[Dict], action: str):
    """Create a new policy"""
    try:
        policy_enum = PolicyType(policy_type)
        policy = policy_service.create_policy(policy_enum, name, conditions, action)
        return policy.to_dict()
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid policy type: {policy_type}")
    except Exception as e:
        logger.error(f"Create policy error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/policies")
async def get_policies(policy_type: Optional[str] = None):
    """Get all policies"""
    try:
        policy_enum = PolicyType(policy_type) if policy_type else None
        policies = policy_service.get_policies(policy_enum)
        return {
            'total': len(policies),
            'policies': policies,
            'timestamp': datetime.now().isoformat()
        }
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid policy type: {policy_type}")
    except Exception as e:
        logger.error(f"Get policies error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/policies/{policy_id}")
async def get_policy(policy_id: str):
    """Get specific policy"""
    try:
        policy = policy_service.policies.get(policy_id)
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")
        return policy.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get policy error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/policies/{policy_id}")
async def update_policy(policy_id: str, enabled: Optional[bool] = None):
    """Update policy"""
    try:
        policy = policy_service.update_policy(policy_id, enabled)
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")
        return policy.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update policy error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/executions")
async def get_executions(policy_id: Optional[str] = None, limit: int = 100):
    """Get policy executions"""
    try:
        executions = policy_service.get_executions(policy_id, limit)
        return {
            'total': len(executions),
            'executions': executions,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get executions error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status():
    """Get policy service status"""
    try:
        status = policy_service.get_status()
        return status
    except Exception as e:
        logger.error(f"Status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check"""
    return {
        'status': 'healthy',
        'service': 'policy_execution',
        'timestamp': datetime.now().isoformat()
    }
