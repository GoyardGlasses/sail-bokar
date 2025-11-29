"""
Model Serving Layer
Provides API endpoints for model predictions
"""

import logging
from typing import Dict, List, Any
from datetime import datetime
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class ModelServer:
    """Serve ML models via API"""
    
    def __init__(self, db_session: Session, model_trainer):
        self.db = db_session
        self.trainer = model_trainer
        self.logger = logger
        self.prediction_cache = {}
    
    # ========================================================================
    # PREDICTION ENDPOINTS
    # ========================================================================
    
    def predict_delay(self, input_data: Dict) -> Dict:
        """Predict shipment delay"""
        try:
            success, result = self.trainer.predict("delay_prediction_model", input_data)
            
            if success:
                # Store prediction
                self._store_prediction("delay_prediction_model", input_data, result)
                return {
                    "status": "success",
                    "predicted_delay_days": result['prediction'],
                    "confidence": result['confidence'],
                    "timestamp": result['timestamp']
                }
            else:
                return {"status": "error", "message": result.get('error')}
        
        except Exception as e:
            self.logger.error(f"Error predicting delay: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def predict_cost(self, input_data: Dict) -> Dict:
        """Predict shipping cost"""
        try:
            success, result = self.trainer.predict("cost_prediction_model", input_data)
            
            if success:
                self._store_prediction("cost_prediction_model", input_data, result)
                return {
                    "status": "success",
                    "predicted_cost": result['prediction'],
                    "confidence": result['confidence'],
                    "timestamp": result['timestamp']
                }
            else:
                return {"status": "error", "message": result.get('error')}
        
        except Exception as e:
            self.logger.error(f"Error predicting cost: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def predict_quality(self, input_data: Dict) -> Dict:
        """Predict delivery quality"""
        try:
            success, result = self.trainer.predict("quality_prediction_model", input_data)
            
            if success:
                self._store_prediction("quality_prediction_model", input_data, result)
                return {
                    "status": "success",
                    "predicted_quality_score": result['prediction'],
                    "confidence": result['confidence'],
                    "timestamp": result['timestamp']
                }
            else:
                return {"status": "error", "message": result.get('error')}
        
        except Exception as e:
            self.logger.error(f"Error predicting quality: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def predict_fuel(self, input_data: Dict) -> Dict:
        """Predict fuel consumption"""
        try:
            success, result = self.trainer.predict("fuel_consumption_model", input_data)
            
            if success:
                self._store_prediction("fuel_consumption_model", input_data, result)
                return {
                    "status": "success",
                    "predicted_fuel_liters": result['prediction'],
                    "confidence": result['confidence'],
                    "timestamp": result['timestamp']
                }
            else:
                return {"status": "error", "message": result.get('error')}
        
        except Exception as e:
            self.logger.error(f"Error predicting fuel: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def predict_demand(self, input_data: Dict) -> Dict:
        """Predict demand"""
        try:
            success, result = self.trainer.predict("demand_forecasting_model", input_data)
            
            if success:
                self._store_prediction("demand_forecasting_model", input_data, result)
                return {
                    "status": "success",
                    "predicted_demand_tonnage": result['prediction'],
                    "confidence": result['confidence'],
                    "timestamp": result['timestamp']
                }
            else:
                return {"status": "error", "message": result.get('error')}
        
        except Exception as e:
            self.logger.error(f"Error predicting demand: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    # ========================================================================
    # OPTIMIZATION ENDPOINTS
    # ========================================================================
    
    def optimize_route(self, input_data: Dict) -> Dict:
        """Optimize route selection"""
        try:
            success, result = self.trainer.predict("route_optimization_model", input_data)
            
            if success:
                self._store_prediction("route_optimization_model", input_data, result)
                return {
                    "status": "success",
                    "recommended_route": result['prediction'],
                    "confidence": result['confidence'],
                    "timestamp": result['timestamp']
                }
            else:
                return {"status": "error", "message": result.get('error')}
        
        except Exception as e:
            self.logger.error(f"Error optimizing route: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def optimize_cost(self, input_data: Dict) -> Dict:
        """Optimize cost"""
        try:
            success, result = self.trainer.predict("cost_optimization_model", input_data)
            
            if success:
                self._store_prediction("cost_optimization_model", input_data, result)
                return {
                    "status": "success",
                    "optimized_cost": result['prediction'],
                    "savings_percentage": (1 - result['prediction'] / input_data.get('current_cost', 1)) * 100,
                    "confidence": result['confidence'],
                    "timestamp": result['timestamp']
                }
            else:
                return {"status": "error", "message": result.get('error')}
        
        except Exception as e:
            self.logger.error(f"Error optimizing cost: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def optimize_time(self, input_data: Dict) -> Dict:
        """Optimize delivery time"""
        try:
            success, result = self.trainer.predict("time_optimization_model", input_data)
            
            if success:
                self._store_prediction("time_optimization_model", input_data, result)
                return {
                    "status": "success",
                    "optimized_delivery_days": result['prediction'],
                    "time_saved_days": input_data.get('planned_days', 0) - result['prediction'],
                    "confidence": result['confidence'],
                    "timestamp": result['timestamp']
                }
            else:
                return {"status": "error", "message": result.get('error')}
        
        except Exception as e:
            self.logger.error(f"Error optimizing time: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def allocate_vehicle(self, input_data: Dict) -> Dict:
        """Allocate best vehicle"""
        try:
            success, result = self.trainer.predict("vehicle_allocation_model", input_data)
            
            if success:
                self._store_prediction("vehicle_allocation_model", input_data, result)
                return {
                    "status": "success",
                    "recommended_vehicle": result['prediction'],
                    "confidence": result['confidence'],
                    "timestamp": result['timestamp']
                }
            else:
                return {"status": "error", "message": result.get('error')}
        
        except Exception as e:
            self.logger.error(f"Error allocating vehicle: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def recommend_material(self, input_data: Dict) -> Dict:
        """Recommend best material"""
        try:
            success, result = self.trainer.predict("material_recommendation_model", input_data)
            
            if success:
                self._store_prediction("material_recommendation_model", input_data, result)
                return {
                    "status": "success",
                    "recommended_material": result['prediction'],
                    "confidence": result['confidence'],
                    "timestamp": result['timestamp']
                }
            else:
                return {"status": "error", "message": result.get('error')}
        
        except Exception as e:
            self.logger.error(f"Error recommending material: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    # ========================================================================
    # RISK & DECISION ENDPOINTS
    # ========================================================================
    
    def assess_risk(self, input_data: Dict) -> Dict:
        """Assess shipment risk"""
        try:
            success, result = self.trainer.predict("risk_assessment_model", input_data)
            
            if success:
                self._store_prediction("risk_assessment_model", input_data, result)
                risk_score = result['prediction']
                risk_level = "Low" if risk_score < 30 else "Medium" if risk_score < 60 else "High" if risk_score < 85 else "Critical"
                
                return {
                    "status": "success",
                    "risk_score": risk_score,
                    "risk_level": risk_level,
                    "confidence": result['confidence'],
                    "timestamp": result['timestamp']
                }
            else:
                return {"status": "error", "message": result.get('error')}
        
        except Exception as e:
            self.logger.error(f"Error assessing risk: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def support_decision(self, input_data: Dict) -> Dict:
        """Support decision making"""
        try:
            success, result = self.trainer.predict("decision_support_model", input_data)
            
            if success:
                self._store_prediction("decision_support_model", input_data, result)
                return {
                    "status": "success",
                    "recommended_decision": result['prediction'],
                    "confidence": result['confidence'],
                    "timestamp": result['timestamp']
                }
            else:
                return {"status": "error", "message": result.get('error')}
        
        except Exception as e:
            self.logger.error(f"Error supporting decision: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    def detect_anomaly(self, input_data: Dict) -> Dict:
        """Detect anomalies"""
        try:
            success, result = self.trainer.predict("anomaly_detection_model", input_data)
            
            if success:
                self._store_prediction("anomaly_detection_model", input_data, result)
                return {
                    "status": "success",
                    "is_anomaly": result['prediction'] > 0.5,
                    "anomaly_score": result['prediction'],
                    "confidence": result['confidence'],
                    "timestamp": result['timestamp']
                }
            else:
                return {"status": "error", "message": result.get('error')}
        
        except Exception as e:
            self.logger.error(f"Error detecting anomaly: {str(e)}")
            return {"status": "error", "message": str(e)}
    
    # ========================================================================
    # HELPER METHODS
    # ========================================================================
    
    def _store_prediction(self, model_name: str, input_data: Dict, result: Dict):
        """Store prediction in database"""
        try:
            from database_schema import ModelPrediction
            
            prediction = ModelPrediction(
                model_name=model_name,
                input_data=input_data,
                prediction=result,
                confidence=result.get('confidence', 0.5)
            )
            
            self.db.add(prediction)
            self.db.commit()
        
        except Exception as e:
            self.logger.error(f"Error storing prediction: {str(e)}")
    
    def get_model_status(self, model_name: str = None) -> Dict:
        """Get model status"""
        try:
            from database_schema import MLModel
            
            if model_name:
                model = self.db.query(MLModel).filter(MLModel.name == model_name).first()
                if model:
                    return {
                        "name": model.name,
                        "status": model.status,
                        "accuracy": model.accuracy,
                        "last_trained": model.last_trained.isoformat() if model.last_trained else None,
                        "version": model.version
                    }
            else:
                models = self.db.query(MLModel).all()
                return {
                    "total_models": len(models),
                    "active_models": len([m for m in models if m.status == "active"]),
                    "models": [
                        {
                            "name": m.name,
                            "status": m.status,
                            "accuracy": m.accuracy
                        } for m in models
                    ]
                }
        
        except Exception as e:
            self.logger.error(f"Error getting model status: {str(e)}")
            return {}
