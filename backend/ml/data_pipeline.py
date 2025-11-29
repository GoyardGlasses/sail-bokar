"""
Data Pipeline Module
Handles real-time data collection, validation, and feeding to ML models
"""

import json
import logging
from datetime import datetime
from typing import Dict, List, Any
import pandas as pd
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class DataPipeline:
    """Main data pipeline for collecting and processing data"""
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.logger = logger
    
    # ========================================================================
    # DATA COLLECTION
    # ========================================================================
    
    def collect_dispatch_data(self, dispatch_info: Dict) -> bool:
        """Collect real-time dispatch data"""
        try:
            from database_schema import HistoricalDispatch
            
            dispatch = HistoricalDispatch(
                order_id=dispatch_info.get('order_id'),
                customer_id=dispatch_info.get('customer_id'),
                customer_name=dispatch_info.get('customer_name'),
                route=dispatch_info.get('route'),
                material=dispatch_info.get('material'),
                tonnage=dispatch_info.get('tonnage'),
                vehicle=dispatch_info.get('vehicle'),
                driver=dispatch_info.get('driver'),
                reason=dispatch_info.get('reason'),
                status=dispatch_info.get('status', 'in-transit'),
                dispatch_type=dispatch_info.get('dispatch_type'),
                distance=dispatch_info.get('distance'),
                planned_days=dispatch_info.get('planned_days'),
                actual_days=dispatch_info.get('actual_days'),
                delay_days=dispatch_info.get('delay_days', 0),
                total_cost=dispatch_info.get('total_cost'),
                fuel_consumed=dispatch_info.get('fuel_consumed'),
                quality_score=dispatch_info.get('quality_score'),
                satisfaction=dispatch_info.get('satisfaction'),
                stops=dispatch_info.get('stops', []),
                incidents=dispatch_info.get('incidents', []),
                notes=dispatch_info.get('notes')
            )
            
            self.db.add(dispatch)
            self.db.commit()
            self.logger.info(f"Dispatch data collected: {dispatch_info.get('order_id')}")
            return True
        except Exception as e:
            self.logger.error(f"Error collecting dispatch data: {str(e)}")
            self.db.rollback()
            return False
    
    def collect_feedback(self, prediction_id: int, actual_outcome: Dict, feedback_type: str = "correct") -> bool:
        """Collect feedback for predictions"""
        try:
            from database_schema import FeedbackRecord, ModelPrediction
            
            # Get original prediction
            prediction = self.db.query(ModelPrediction).filter(
                ModelPrediction.id == prediction_id
            ).first()
            
            if not prediction:
                self.logger.error(f"Prediction {prediction_id} not found")
                return False
            
            # Calculate accuracy
            accuracy = self._calculate_accuracy(prediction.prediction, actual_outcome)
            
            # Create feedback record
            feedback = FeedbackRecord(
                prediction_id=prediction_id,
                model_name=prediction.model_name,
                actual_outcome=actual_outcome,
                predicted_outcome=prediction.prediction,
                accuracy=accuracy,
                feedback_type=feedback_type
            )
            
            # Update prediction with actual value
            prediction.actual_value = actual_outcome
            prediction.accuracy = accuracy
            
            self.db.add(feedback)
            self.db.commit()
            self.logger.info(f"Feedback collected for prediction {prediction_id}")
            return True
        except Exception as e:
            self.logger.error(f"Error collecting feedback: {str(e)}")
            self.db.rollback()
            return False
    
    def collect_incident(self, dispatch_id: str, incident_info: Dict) -> bool:
        """Log incident during dispatch"""
        try:
            from database_schema import HistoricalDispatch
            
            dispatch = self.db.query(HistoricalDispatch).filter(
                HistoricalDispatch.order_id == dispatch_id
            ).first()
            
            if dispatch:
                incidents = dispatch.incidents or []
                incidents.append({
                    **incident_info,
                    'timestamp': datetime.utcnow().isoformat()
                })
                dispatch.incidents = incidents
                self.db.commit()
                self.logger.info(f"Incident logged for dispatch {dispatch_id}")
                return True
            return False
        except Exception as e:
            self.logger.error(f"Error logging incident: {str(e)}")
            self.db.rollback()
            return False
    
    # ========================================================================
    # DATA VALIDATION
    # ========================================================================
    
    def validate_dispatch_data(self, dispatch_info: Dict) -> tuple[bool, List[str]]:
        """Validate dispatch data"""
        errors = []
        
        required_fields = ['order_id', 'route', 'material', 'tonnage', 'vehicle', 'driver']
        for field in required_fields:
            if field not in dispatch_info or dispatch_info[field] is None:
                errors.append(f"Missing required field: {field}")
        
        # Validate numeric fields
        numeric_fields = ['tonnage', 'distance', 'planned_days', 'total_cost']
        for field in numeric_fields:
            if field in dispatch_info and dispatch_info[field] is not None:
                try:
                    float(dispatch_info[field])
                except ValueError:
                    errors.append(f"Invalid numeric value for {field}")
        
        # Validate route
        valid_routes = ['bokaro-dhanbad', 'bokaro-hatia', 'bokaro-kolkata', 
                       'bokaro-patna', 'bokaro-ranchi', 'bokaro-durgapur', 'bokaro-haldia']
        if dispatch_info.get('route') not in valid_routes:
            errors.append(f"Invalid route: {dispatch_info.get('route')}")
        
        # Validate material
        valid_materials = ['cr_coils', 'hr_coils', 'plates', 'wire_rods', 'tmt_bars', 'pig_iron', 'billets']
        if dispatch_info.get('material') not in valid_materials:
            errors.append(f"Invalid material: {dispatch_info.get('material')}")
        
        return len(errors) == 0, errors
    
    def validate_feedback_data(self, feedback_info: Dict) -> tuple[bool, List[str]]:
        """Validate feedback data"""
        errors = []
        
        if 'prediction_id' not in feedback_info:
            errors.append("Missing prediction_id")
        
        if 'actual_outcome' not in feedback_info:
            errors.append("Missing actual_outcome")
        
        return len(errors) == 0, errors
    
    # ========================================================================
    # DATA CLEANING & PREPROCESSING
    # ========================================================================
    
    def clean_data(self, data: Dict) -> Dict:
        """Clean and preprocess data"""
        cleaned = {}
        
        for key, value in data.items():
            # Remove None values
            if value is None:
                continue
            
            # Convert string numbers to float
            if isinstance(value, str):
                try:
                    cleaned[key] = float(value)
                    continue
                except ValueError:
                    pass
            
            # Convert to lowercase for string fields
            if isinstance(value, str):
                cleaned[key] = value.lower().strip()
            else:
                cleaned[key] = value
        
        return cleaned
    
    def handle_missing_values(self, data: Dict, strategy: str = "mean") -> Dict:
        """Handle missing values in data"""
        # This would use feature statistics to fill missing values
        # For now, return data as is
        return data
    
    # ========================================================================
    # DATA EXPORT FOR ML TRAINING
    # ========================================================================
    
    def export_training_data(self, data_type: str = "all") -> pd.DataFrame:
        """Export data for ML model training"""
        try:
            from database_schema import HistoricalDispatch, HistoricalDecision, HistoricalShipment
            
            if data_type == "dispatch":
                data = self.db.query(HistoricalDispatch).all()
                return self._convert_to_dataframe(data)
            
            elif data_type == "decision":
                data = self.db.query(HistoricalDecision).all()
                return self._convert_to_dataframe(data)
            
            elif data_type == "shipment":
                data = self.db.query(HistoricalShipment).all()
                return self._convert_to_dataframe(data)
            
            else:  # all
                dispatch_df = self.export_training_data("dispatch")
                decision_df = self.export_training_data("decision")
                shipment_df = self.export_training_data("shipment")
                return pd.concat([dispatch_df, decision_df, shipment_df], ignore_index=True)
        
        except Exception as e:
            self.logger.error(f"Error exporting training data: {str(e)}")
            return pd.DataFrame()
    
    def _convert_to_dataframe(self, data: List) -> pd.DataFrame:
        """Convert SQLAlchemy objects to DataFrame"""
        records = []
        for item in data:
            record = {}
            for column in item.__table__.columns:
                record[column.name] = getattr(item, column.name)
            records.append(record)
        return pd.DataFrame(records)
    
    # ========================================================================
    # UTILITY METHODS
    # ========================================================================
    
    def _calculate_accuracy(self, predicted: Dict, actual: Dict) -> float:
        """Calculate accuracy between prediction and actual outcome"""
        if not predicted or not actual:
            return 0.0
        
        matches = 0
        total = 0
        
        for key in predicted:
            if key in actual:
                total += 1
                pred_val = float(predicted[key]) if isinstance(predicted[key], (int, float, str)) else predicted[key]
                actual_val = float(actual[key]) if isinstance(actual[key], (int, float, str)) else actual[key]
                
                if isinstance(pred_val, float) and isinstance(actual_val, float):
                    # For numeric values, calculate percentage difference
                    if actual_val != 0:
                        diff = abs(pred_val - actual_val) / abs(actual_val)
                        if diff < 0.1:  # Within 10%
                            matches += 1
                else:
                    # For categorical values, exact match
                    if pred_val == actual_val:
                        matches += 1
        
        return (matches / total * 100) if total > 0 else 0.0
    
    def get_data_statistics(self) -> Dict:
        """Get statistics about collected data"""
        try:
            from database_schema import HistoricalDispatch, HistoricalDecision, HistoricalShipment
            
            dispatch_count = self.db.query(HistoricalDispatch).count()
            decision_count = self.db.query(HistoricalDecision).count()
            shipment_count = self.db.query(HistoricalShipment).count()
            
            return {
                'total_records': dispatch_count + decision_count + shipment_count,
                'dispatch_records': dispatch_count,
                'decision_records': decision_count,
                'shipment_records': shipment_count,
                'last_updated': datetime.utcnow().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error getting data statistics: {str(e)}")
            return {}
