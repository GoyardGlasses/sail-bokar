"""
Feedback Loop & Monitoring System
Continuous learning and performance monitoring
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from sqlalchemy.orm import Session
import numpy as np

logger = logging.getLogger(__name__)

class FeedbackLoop:
    """Manage feedback for continuous learning"""
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.logger = logger
    
    def submit_feedback(self, prediction_id: int, actual_outcome: Dict, 
                       feedback_type: str = "correct") -> bool:
        """Submit feedback for prediction"""
        try:
            from database_schema import FeedbackRecord, ModelPrediction
            
            # Get prediction
            prediction = self.db.query(ModelPrediction).filter(
                ModelPrediction.id == prediction_id
            ).first()
            
            if not prediction:
                return False
            
            # Calculate accuracy
            accuracy = self._calculate_accuracy(prediction.prediction, actual_outcome)
            
            # Create feedback
            feedback = FeedbackRecord(
                prediction_id=prediction_id,
                model_name=prediction.model_name,
                actual_outcome=actual_outcome,
                predicted_outcome=prediction.prediction,
                accuracy=accuracy,
                feedback_type=feedback_type
            )
            
            # Update prediction
            prediction.actual_value = actual_outcome
            prediction.accuracy = accuracy
            
            self.db.add(feedback)
            self.db.commit()
            
            self.logger.info(f"Feedback submitted for prediction {prediction_id}")
            return True
        
        except Exception as e:
            self.logger.error(f"Error submitting feedback: {str(e)}")
            self.db.rollback()
            return False
    
    def get_feedback_for_retraining(self, model_name: str, limit: int = 100) -> List[Dict]:
        """Get feedback for model retraining"""
        try:
            from database_schema import FeedbackRecord
            
            feedbacks = self.db.query(FeedbackRecord).filter(
                FeedbackRecord.model_name == model_name
            ).order_by(FeedbackRecord.created_at.desc()).limit(limit).all()
            
            return [
                {
                    'input': f.predicted_outcome,
                    'actual': f.actual_outcome,
                    'accuracy': f.accuracy
                } for f in feedbacks
            ]
        
        except Exception as e:
            self.logger.error(f"Error getting feedback: {str(e)}")
            return []
    
    def _calculate_accuracy(self, predicted: Dict, actual: Dict) -> float:
        """Calculate accuracy"""
        if not predicted or not actual:
            return 0.0
        
        matches = 0
        total = 0
        
        for key in predicted:
            if key in actual:
                total += 1
                try:
                    pred_val = float(predicted[key])
                    actual_val = float(actual[key])
                    if actual_val != 0:
                        diff = abs(pred_val - actual_val) / abs(actual_val)
                        if diff < 0.1:
                            matches += 1
                except:
                    if predicted[key] == actual[key]:
                        matches += 1
        
        return (matches / total * 100) if total > 0 else 0.0


class ModelMonitor:
    """Monitor model performance"""
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.logger = logger
        self.alert_thresholds = {
            'accuracy_drop': 0.1,  # 10% drop
            'drift_score': 0.5,
            'error_rate': 0.2
        }
    
    # ========================================================================
    # PERFORMANCE MONITORING
    # ========================================================================
    
    def track_model_performance(self, model_name: str) -> Dict:
        """Track model performance"""
        try:
            from database_schema import ModelPrediction, ModelPerformance
            
            # Get recent predictions
            predictions = self.db.query(ModelPrediction).filter(
                ModelPrediction.model_name == model_name,
                ModelPrediction.actual_value != None
            ).order_by(ModelPrediction.created_at.desc()).limit(100).all()
            
            if not predictions:
                return {"status": "insufficient_data"}
            
            # Calculate metrics
            accuracies = [p.accuracy for p in predictions if p.accuracy is not None]
            confidences = [p.confidence for p in predictions if p.confidence is not None]
            
            metrics = {
                'avg_accuracy': np.mean(accuracies) if accuracies else 0,
                'min_accuracy': np.min(accuracies) if accuracies else 0,
                'max_accuracy': np.max(accuracies) if accuracies else 0,
                'std_accuracy': np.std(accuracies) if len(accuracies) > 1 else 0,
                'avg_confidence': np.mean(confidences) if confidences else 0,
                'predictions_count': len(predictions),
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Save to database
            perf = ModelPerformance(
                model_name=model_name,
                accuracy=metrics['avg_accuracy'],
                precision=metrics['avg_accuracy'],
                recall=metrics['avg_accuracy'],
                f1_score=metrics['avg_accuracy'],
                predictions_count=metrics['predictions_count'],
                avg_confidence=metrics['avg_confidence']
            )
            
            self.db.add(perf)
            self.db.commit()
            
            # Check for alerts
            self._check_performance_alerts(model_name, metrics)
            
            return metrics
        
        except Exception as e:
            self.logger.error(f"Error tracking performance: {str(e)}")
            return {}
    
    # ========================================================================
    # ALERT SYSTEM
    # ========================================================================
    
    def _check_performance_alerts(self, model_name: str, metrics: Dict):
        """Check for performance alerts"""
        try:
            from database_schema import ModelAlert
            
            # Check accuracy drop
            if metrics['avg_accuracy'] < 70:
                self._create_alert(
                    model_name,
                    "accuracy_drop",
                    "high",
                    f"Model accuracy dropped to {metrics['avg_accuracy']:.2f}%",
                    70,
                    metrics['avg_accuracy']
                )
            
            # Check confidence drop
            if metrics['avg_confidence'] < 0.5:
                self._create_alert(
                    model_name,
                    "confidence_drop",
                    "medium",
                    f"Model confidence dropped to {metrics['avg_confidence']:.2f}",
                    0.5,
                    metrics['avg_confidence']
                )
        
        except Exception as e:
            self.logger.error(f"Error checking alerts: {str(e)}")
    
    def _create_alert(self, model_name: str, alert_type: str, severity: str,
                     message: str, threshold: float, current_value: float):
        """Create alert"""
        try:
            from database_schema import ModelAlert
            
            alert = ModelAlert(
                model_name=model_name,
                alert_type=alert_type,
                severity=severity,
                message=message,
                threshold=threshold,
                current_value=current_value
            )
            
            self.db.add(alert)
            self.db.commit()
            
            self.logger.warning(f"Alert created: {model_name} - {alert_type}")
        
        except Exception as e:
            self.logger.error(f"Error creating alert: {str(e)}")
    
    # ========================================================================
    # DATA DRIFT DETECTION
    # ========================================================================
    
    def detect_data_drift(self, feature_name: str, new_data: List[float]) -> Dict:
        """Detect data drift"""
        try:
            from database_schema import FeatureStatistics, DataDriftLog
            
            # Get feature statistics
            stats = self.db.query(FeatureStatistics).filter(
                FeatureStatistics.feature_name == feature_name
            ).first()
            
            if not stats:
                return {"status": "no_baseline"}
            
            # Calculate new statistics
            new_mean = np.mean(new_data)
            new_std = np.std(new_data)
            
            # Calculate drift score (Kullback-Leibler divergence approximation)
            drift_score = self._calculate_drift_score(
                stats.mean, stats.std_dev,
                new_mean, new_std
            )
            
            # Log drift
            drift_log = DataDriftLog(
                feature_name=feature_name,
                drift_detected=drift_score > self.alert_thresholds['drift_score'],
                drift_score=drift_score,
                threshold=self.alert_thresholds['drift_score'],
                old_mean=stats.mean,
                new_mean=new_mean,
                old_std=stats.std_dev,
                new_std=new_std
            )
            
            self.db.add(drift_log)
            self.db.commit()
            
            if drift_score > self.alert_thresholds['drift_score']:
                self._create_alert(
                    "data_drift",
                    "data_drift",
                    "high",
                    f"Data drift detected for {feature_name}",
                    self.alert_thresholds['drift_score'],
                    drift_score
                )
            
            return {
                'feature': feature_name,
                'drift_detected': drift_score > self.alert_thresholds['drift_score'],
                'drift_score': float(drift_score),
                'old_mean': float(stats.mean),
                'new_mean': float(new_mean),
                'old_std': float(stats.std_dev),
                'new_std': float(new_std)
            }
        
        except Exception as e:
            self.logger.error(f"Error detecting drift: {str(e)}")
            return {}
    
    def _calculate_drift_score(self, old_mean: float, old_std: float,
                              new_mean: float, new_std: float) -> float:
        """Calculate drift score"""
        if old_std == 0 or new_std == 0:
            return 0.0
        
        # Simplified drift score
        mean_diff = abs(old_mean - new_mean) / (old_std + 1e-6)
        std_ratio = abs(old_std - new_std) / (old_std + 1e-6)
        
        return (mean_diff + std_ratio) / 2
    
    # ========================================================================
    # MONITORING DASHBOARD
    # ========================================================================
    
    def get_monitoring_dashboard(self) -> Dict:
        """Get monitoring dashboard data"""
        try:
            from database_schema import MLModel, ModelAlert, ModelPerformance
            
            # Get all models
            models = self.db.query(MLModel).all()
            
            # Get recent alerts
            alerts = self.db.query(ModelAlert).filter(
                ModelAlert.is_resolved == False
            ).order_by(ModelAlert.created_at.desc()).limit(10).all()
            
            # Get recent performance
            perf = self.db.query(ModelPerformance).order_by(
                ModelPerformance.date.desc()
            ).limit(10).all()
            
            return {
                'total_models': len(models),
                'active_models': len([m for m in models if m.status == 'active']),
                'models': [
                    {
                        'name': m.name,
                        'status': m.status,
                        'accuracy': m.accuracy,
                        'last_trained': m.last_trained.isoformat() if m.last_trained else None
                    } for m in models
                ],
                'active_alerts': len(alerts),
                'recent_alerts': [
                    {
                        'model': a.model_name,
                        'type': a.alert_type,
                        'severity': a.severity,
                        'message': a.message,
                        'created_at': a.created_at.isoformat()
                    } for a in alerts
                ],
                'recent_performance': [
                    {
                        'model': p.model_name,
                        'accuracy': p.accuracy,
                        'date': p.date.isoformat()
                    } for p in perf
                ]
            }
        
        except Exception as e:
            self.logger.error(f"Error getting dashboard: {str(e)}")
            return {}
    
    def get_model_alerts(self, model_name: str = None) -> List[Dict]:
        """Get model alerts"""
        try:
            from database_schema import ModelAlert
            
            query = self.db.query(ModelAlert)
            
            if model_name:
                query = query.filter(ModelAlert.model_name == model_name)
            
            alerts = query.order_by(ModelAlert.created_at.desc()).limit(50).all()
            
            return [
                {
                    'id': a.id,
                    'model': a.model_name,
                    'type': a.alert_type,
                    'severity': a.severity,
                    'message': a.message,
                    'threshold': a.threshold,
                    'current_value': a.current_value,
                    'is_resolved': a.is_resolved,
                    'created_at': a.created_at.isoformat()
                } for a in alerts
            ]
        
        except Exception as e:
            self.logger.error(f"Error getting alerts: {str(e)}")
            return []
    
    def resolve_alert(self, alert_id: int) -> bool:
        """Resolve alert"""
        try:
            from database_schema import ModelAlert
            
            alert = self.db.query(ModelAlert).filter(ModelAlert.id == alert_id).first()
            if alert:
                alert.is_resolved = True
                alert.resolved_at = datetime.utcnow()
                self.db.commit()
                return True
            return False
        
        except Exception as e:
            self.logger.error(f"Error resolving alert: {str(e)}")
            return False
