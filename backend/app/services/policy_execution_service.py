"""
Policy-Based Auto-Execution Service - Phase 2 Feature 2
Automatic execution based on policies
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Callable
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class PolicyType(str, Enum):
    AUTO_PUBLISH = "auto_publish"
    AUTO_ALERT = "auto_alert"
    AUTO_MITIGATE = "auto_mitigate"
    AUTO_ESCALATE = "auto_escalate"
    AUTO_EXECUTE = "auto_execute"

class PolicyCondition:
    """Policy condition"""
    def __init__(self, field: str, operator: str, value: Any):
        self.field = field
        self.operator = operator  # ==, !=, >, <, >=, <=, in, contains
        self.value = value
    
    def evaluate(self, data: Dict) -> bool:
        """Evaluate condition against data"""
        field_value = data.get(self.field)
        
        if self.operator == "==":
            return field_value == self.value
        elif self.operator == "!=":
            return field_value != self.value
        elif self.operator == ">":
            return field_value > self.value
        elif self.operator == "<":
            return field_value < self.value
        elif self.operator == ">=":
            return field_value >= self.value
        elif self.operator == "<=":
            return field_value <= self.value
        elif self.operator == "in":
            return field_value in self.value
        elif self.operator == "contains":
            return self.value in str(field_value)
        
        return False

class Policy:
    """Policy object"""
    def __init__(self, policy_id: str, policy_type: PolicyType, name: str,
                 conditions: List[PolicyCondition], action: str, enabled: bool = True):
        self.id = policy_id
        self.type = policy_type
        self.name = name
        self.conditions = conditions
        self.action = action
        self.enabled = enabled
        self.created_at = datetime.now()
        self.execution_count = 0
        self.last_execution = None
    
    def evaluate(self, data: Dict) -> bool:
        """Evaluate if all conditions are met"""
        if not self.enabled:
            return False
        
        return all(condition.evaluate(data) for condition in self.conditions)
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'type': self.type,
            'name': self.name,
            'conditions': [
                {'field': c.field, 'operator': c.operator, 'value': c.value}
                for c in self.conditions
            ],
            'action': self.action,
            'enabled': self.enabled,
            'created_at': self.created_at.isoformat(),
            'execution_count': self.execution_count,
            'last_execution': self.last_execution.isoformat() if self.last_execution else None
        }

class PolicyExecution:
    """Policy execution record"""
    def __init__(self, policy_id: str, data: Dict, result: str):
        self.id = f"EXEC-{int(datetime.now().timestamp() * 1000)}"
        self.policy_id = policy_id
        self.data = data
        self.result = result
        self.timestamp = datetime.now()
        self.status = "completed"
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'policy_id': self.policy_id,
            'data': self.data,
            'result': self.result,
            'timestamp': self.timestamp.isoformat(),
            'status': self.status
        }

class PolicyExecutionService:
    """Service for policy-based auto-execution"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.policies = {}
        self.executions = []
        self.action_handlers = {}
        self._initialize_default_policies()
    
    def _initialize_default_policies(self):
        """Initialize default policies"""
        # Policy 1: Auto-publish low-risk plans
        policy1 = Policy(
            policy_id="POL-001",
            policy_type=PolicyType.AUTO_PUBLISH,
            name="Auto-Publish Low-Risk Plans",
            conditions=[
                PolicyCondition("risk_score", "<", 0.15),
                PolicyCondition("allocation_coverage", ">=", 0.8),
                PolicyCondition("prediction_confidence", ">=", 0.75)
            ],
            action="publish_plan"
        )
        self.policies["POL-001"] = policy1
        
        # Policy 2: Auto-mitigate high-severity alerts
        policy2 = Policy(
            policy_id="POL-002",
            policy_type=PolicyType.AUTO_MITIGATE,
            name="Auto-Mitigate High-Severity Alerts",
            conditions=[
                PolicyCondition("severity", "in", ["critical", "high"]),
                PolicyCondition("mitigation_effectiveness", ">=", 0.85)
            ],
            action="apply_best_mitigation"
        )
        self.policies["POL-002"] = policy2
        
        # Policy 3: Auto-escalate critical issues
        policy3 = Policy(
            policy_id="POL-003",
            policy_type=PolicyType.AUTO_ESCALATE,
            name="Auto-Escalate Critical Issues",
            conditions=[
                PolicyCondition("severity", "==", "critical"),
                PolicyCondition("impact_level", ">=", 0.9)
            ],
            action="escalate_to_manager"
        )
        self.policies["POL-003"] = policy3
        
        # Policy 4: Auto-send daily reports
        policy4 = Policy(
            policy_id="POL-004",
            policy_type=PolicyType.AUTO_EXECUTE,
            name="Auto-Send Daily Reports",
            conditions=[
                PolicyCondition("report_type", "==", "daily"),
                PolicyCondition("time_of_day", "==", "08:00")
            ],
            action="send_daily_report"
        )
        self.policies["POL-004"] = policy4
    
    def register_action_handler(self, action: str, handler: Callable):
        """Register action handler"""
        self.action_handlers[action] = handler
        self.logger.info(f"✓ Registered action handler: {action}")
    
    def evaluate_policies(self, data: Dict) -> List[PolicyExecution]:
        """Evaluate all policies against data"""
        try:
            executions = []
            
            for policy_id, policy in self.policies.items():
                if policy.evaluate(data):
                    # Execute policy
                    execution = self._execute_policy(policy, data)
                    executions.append(execution)
                    
                    # Update policy stats
                    policy.execution_count += 1
                    policy.last_execution = datetime.now()
            
            self.logger.info(f"✓ Evaluated {len(self.policies)} policies. Executed {len(executions)}")
            
            return executions
        
        except Exception as e:
            self.logger.error(f"Error evaluating policies: {e}")
            raise
    
    def _execute_policy(self, policy: Policy, data: Dict) -> PolicyExecution:
        """Execute a policy"""
        try:
            result = "executed"
            
            # Call action handler if registered
            if policy.action in self.action_handlers:
                handler = self.action_handlers[policy.action]
                result = handler(data)
            
            execution = PolicyExecution(policy.id, data, result)
            self.executions.append(execution)
            
            self.logger.info(f"✓ Executed policy {policy.id}: {policy.action}")
            
            return execution
        
        except Exception as e:
            self.logger.error(f"Error executing policy: {e}")
            raise
    
    def create_policy(self, policy_type: PolicyType, name: str,
                     conditions: List[Dict], action: str) -> Policy:
        """Create a new policy"""
        try:
            policy_id = f"POL-{int(datetime.now().timestamp())}"
            
            # Convert condition dicts to PolicyCondition objects
            policy_conditions = [
                PolicyCondition(c['field'], c['operator'], c['value'])
                for c in conditions
            ]
            
            policy = Policy(policy_id, policy_type, name, policy_conditions, action)
            self.policies[policy_id] = policy
            
            self.logger.info(f"✓ Created policy {policy_id}: {name}")
            
            return policy
        
        except Exception as e:
            self.logger.error(f"Error creating policy: {e}")
            raise
    
    def update_policy(self, policy_id: str, enabled: bool = None) -> Optional[Policy]:
        """Update policy"""
        try:
            policy = self.policies.get(policy_id)
            if not policy:
                raise ValueError(f"Policy {policy_id} not found")
            
            if enabled is not None:
                policy.enabled = enabled
            
            self.logger.info(f"✓ Updated policy {policy_id}")
            
            return policy
        
        except Exception as e:
            self.logger.error(f"Error updating policy: {e}")
            raise
    
    def get_policies(self, policy_type: Optional[PolicyType] = None) -> List[Dict]:
        """Get policies, optionally filtered by type"""
        policies = list(self.policies.values())
        
        if policy_type:
            policies = [p for p in policies if p.type == policy_type]
        
        return [p.to_dict() for p in policies]
    
    def get_executions(self, policy_id: Optional[str] = None, limit: int = 100) -> List[Dict]:
        """Get policy executions"""
        executions = self.executions
        
        if policy_id:
            executions = [e for e in executions if e.policy_id == policy_id]
        
        return [e.to_dict() for e in executions[-limit:]]
    
    def get_status(self) -> Dict:
        """Get policy execution service status"""
        return {
            'status': 'running',
            'total_policies': len(self.policies),
            'enabled_policies': len([p for p in self.policies.values() if p.enabled]),
            'total_executions': len(self.executions),
            'timestamp': datetime.now().isoformat()
        }
