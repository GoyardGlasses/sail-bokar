"""
Feedback Loop & Model Retraining Service - Phase 2 Feature 3
Continuous learning and model improvement
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from enum import Enum
import logging
import random

logger = logging.getLogger(__name__)

class FeedbackType(str, Enum):
    PREDICTION_ACCURACY = "prediction_accuracy"
    PLAN_QUALITY = "plan_quality"
    ALERT_RELEVANCE = "alert_relevance"
    MITIGATION_EFFECTIVENESS = "mitigation_effectiveness"
    USER_SATISFACTION = "user_satisfaction"

class Feedback:
    """Feedback object"""
    def __init__(self, feedback_type: FeedbackType, reference_id: str, 
                 actual_value: Any, predicted_value: Any, score: float, notes: str = ""):
        self.id = f"FEEDBACK-{int(datetime.now().timestamp() * 1000)}"
        self.type = feedback_type
        self.reference_id = reference_id
        self.actual_value = actual_value
        self.predicted_value = predicted_value
        self.score = score  # 0-1
        self.notes = notes
        self.created_at = datetime.now()
        self.processed = False
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'type': self.type,
            'reference_id': self.reference_id,
            'actual_value': actual_value,
            'predicted_value': self.predicted_value,
            'score': self.score,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'processed': self.processed
        }

class ModelPerformance:
    """Model performance metrics"""
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.accuracy = 0.75
        self.precision = 0.80
        self.recall = 0.70
        self.f1_score = 0.75
        self.last_updated = datetime.now()
        self.total_predictions = 0
        self.correct_predictions = 0
    
    def update(self, correct: bool):
        """Update performance metrics"""
        self.total_predictions += 1
        if correct:
            self.correct_predictions += 1
        
        self.accuracy = self.correct_predictions / self.total_predictions if self.total_predictions > 0 else 0
        self.last_updated = datetime.now()
    
    def to_dict(self) -> Dict:
        return {
            'model_name': self.model_name,
            'accuracy': self.accuracy,
            'precision': self.precision,
            'recall': self.recall,
            'f1_score': self.f1_score,
            'total_predictions': self.total_predictions,
            'correct_predictions': self.correct_predictions,
            'last_updated': self.last_updated.isoformat()
        }

class RetrainingJob:
    """Model retraining job"""
    def __init__(self, job_id: str, model_name: str, reason: str):
        self.id = job_id
        self.model_name = model_name
        self.reason = reason
        self.status = "pending"  # pending, running, completed, failed
        self.created_at = datetime.now()
        self.started_at = None
        self.completed_at = None
        self.improvement = 0.0
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'model_name': self.model_name,
            'reason': self.reason,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'improvement': self.improvement
        }

class FeedbackLoopService:
    """Service for feedback loop and model retraining"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.feedback_history = []
        self.model_performance = {}
        self.retraining_jobs = []
        self.drift_threshold = 0.1  # 10% accuracy drop triggers retraining
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize model performance tracking"""
        models = [
            'delay_prediction',
            'cost_prediction',
            'demand_forecast',
            'route_optimization',
            'risk_assessment'
        ]
        
        for model in models:
            self.model_performance[model] = ModelPerformance(model)
    
    def submit_feedback(self, feedback_type: FeedbackType, reference_id: str,
                       actual_value: Any, predicted_value: Any, score: float,
                       notes: str = "") -> Feedback:
        """Submit feedback on prediction"""
        try:
            feedback = Feedback(feedback_type, reference_id, actual_value, 
                              predicted_value, score, notes)
            
            self.feedback_history.append(feedback)
            
            # Update model performance
            self._update_model_performance(feedback)
            
            # Check if retraining needed
            self._check_retraining_trigger(feedback)
            
            self.logger.info(f"✓ Submitted feedback {feedback.id}: {feedback_type}")
            
            return feedback
        
        except Exception as e:
            self.logger.error(f"Error submitting feedback: {e}")
            raise
    
    def _update_model_performance(self, feedback: Feedback):
        """Update model performance based on feedback"""
        try:
            # Map feedback type to model
            model_map = {
                FeedbackType.PREDICTION_ACCURACY: 'delay_prediction',
                FeedbackType.PLAN_QUALITY: 'route_optimization',
                FeedbackType.ALERT_RELEVANCE: 'risk_assessment',
                FeedbackType.MITIGATION_EFFECTIVENESS: 'risk_assessment',
                FeedbackType.USER_SATISFACTION: 'demand_forecast'
            }
            
            model_name = model_map.get(feedback.type)
            if model_name and model_name in self.model_performance:
                model = self.model_performance[model_name]
                
                # Update based on score
                is_correct = feedback.score >= 0.7
                model.update(is_correct)
                
                self.logger.info(f"✓ Updated performance for {model_name}: accuracy={model.accuracy*100:.1f}%")
        
        except Exception as e:
            self.logger.error(f"Error updating model performance: {e}")
    
    def _check_retraining_trigger(self, feedback: Feedback):
        """Check if model retraining should be triggered"""
        try:
            # Check if accuracy has drifted
            model_map = {
                FeedbackType.PREDICTION_ACCURACY: 'delay_prediction',
                FeedbackType.PLAN_QUALITY: 'route_optimization',
                FeedbackType.ALERT_RELEVANCE: 'risk_assessment',
                FeedbackType.MITIGATION_EFFECTIVENESS: 'risk_assessment',
                FeedbackType.USER_SATISFACTION: 'demand_forecast'
            }
            
            model_name = model_map.get(feedback.type)
            if model_name and model_name in self.model_performance:
                model = self.model_performance[model_name]
                
                # Trigger retraining if accuracy drops below threshold
                if model.accuracy < 0.65:  # 65% accuracy threshold
                    self.trigger_retraining(model_name, "accuracy_drift")
        
        except Exception as e:
            self.logger.error(f"Error checking retraining trigger: {e}")
    
    def trigger_retraining(self, model_name: str, reason: str) -> RetrainingJob:
        """Trigger model retraining"""
        try:
            job_id = f"RETRAIN-{int(datetime.now().timestamp())}"
            job = RetrainingJob(job_id, model_name, reason)
            
            # Simulate retraining
            job.status = "running"
            job.started_at = datetime.now()
            
            # Simulate improvement
            job.improvement = random.uniform(0.02, 0.08)  # 2-8% improvement
            
            job.status = "completed"
            job.completed_at = datetime.now()
            
            # Update model performance
            if model_name in self.model_performance:
                model = self.model_performance[model_name]
                model.accuracy = min(0.95, model.accuracy + job.improvement)
            
            self.retraining_jobs.append(job)
            
            self.logger.info(f"✓ Completed retraining job {job_id}: {model_name} (+{job.improvement*100:.1f}%)")
            
            return job
        
        except Exception as e:
            self.logger.error(f"Error triggering retraining: {e}")
            raise
    
    def get_feedback(self, feedback_type: Optional[FeedbackType] = None, 
                    limit: int = 100) -> List[Dict]:
        """Get feedback history"""
        feedback = self.feedback_history
        
        if feedback_type:
            feedback = [f for f in feedback if f.type == feedback_type]
        
        return [f.to_dict() for f in feedback[-limit:]]
    
    def get_model_performance(self, model_name: Optional[str] = None) -> List[Dict]:
        """Get model performance metrics"""
        if model_name:
            model = self.model_performance.get(model_name)
            if model:
                return [model.to_dict()]
            return []
        
        return [m.to_dict() for m in self.model_performance.values()]
    
    def get_retraining_jobs(self, limit: int = 50) -> List[Dict]:
        """Get retraining jobs"""
        return [j.to_dict() for j in self.retraining_jobs[-limit:]]
    
    def get_drift_detection(self) -> Dict:
        """Get data drift detection results"""
        try:
            drifted_models = []
            
            for model_name, model in self.model_performance.items():
                if model.accuracy < 0.65:
                    drifted_models.append({
                        'model': model_name,
                        'accuracy': model.accuracy,
                        'status': 'drifted'
                    })
            
            return {
                'total_models': len(self.model_performance),
                'drifted_models': len(drifted_models),
                'models': drifted_models,
                'timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            self.logger.error(f"Error detecting drift: {e}")
            raise
    
    def get_status(self) -> Dict:
        """Get feedback loop service status"""
        avg_accuracy = sum(m.accuracy for m in self.model_performance.values()) / len(self.model_performance) if self.model_performance else 0
        
        return {
            'status': 'running',
            'total_feedback': len(self.feedback_history),
            'total_models': len(self.model_performance),
            'average_accuracy': avg_accuracy,
            'retraining_jobs': len(self.retraining_jobs),
            'completed_retrainings': len([j for j in self.retraining_jobs if j.status == 'completed']),
            'timestamp': datetime.now().isoformat()
        }
