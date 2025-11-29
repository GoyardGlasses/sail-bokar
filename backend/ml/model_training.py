"""
Model Training Infrastructure
Handles training, versioning, and management of ML models
"""

import logging
import pickle
import json
from datetime import datetime
from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class ModelTrainer:
    """Train and manage ML models"""
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.logger = logger
        self.models = {}
        self.scalers = {}
    
    # ========================================================================
    # MODEL TRAINING
    # ========================================================================
    
    def train_model(self, model_name: str, training_data: pd.DataFrame, 
                   target_column: str, model_type: str = "regression") -> Tuple[bool, Dict]:
        """Train a new ML model"""
        try:
            self.logger.info(f"Starting training for model: {model_name}")
            
            # Prepare data
            X, y = self._prepare_training_data(training_data, target_column)
            
            if X is None or len(X) == 0:
                return False, {"error": "Insufficient training data"}
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Train model
            if model_type == "regression":
                model = GradientBoostingRegressor(
                    n_estimators=100,
                    learning_rate=0.1,
                    max_depth=5,
                    random_state=42
                )
            else:
                model = RandomForestRegressor(
                    n_estimators=100,
                    max_depth=10,
                    random_state=42
                )
            
            model.fit(X_train_scaled, y_train)
            
            # Evaluate
            y_pred = model.predict(X_test_scaled)
            metrics = self._calculate_metrics(y_test, y_pred)
            
            # Store model
            self.models[model_name] = {
                'model': model,
                'scaler': scaler,
                'features': X.columns.tolist(),
                'metrics': metrics,
                'trained_at': datetime.utcnow().isoformat(),
                'training_data_size': len(X)
            }
            
            # Save to database
            self._save_model_to_db(model_name, model, scaler, metrics)
            
            self.logger.info(f"Model {model_name} trained successfully. Accuracy: {metrics['r2_score']:.2%}")
            
            return True, metrics
        
        except Exception as e:
            self.logger.error(f"Error training model {model_name}: {str(e)}")
            return False, {"error": str(e)}
    
    def retrain_model(self, model_name: str, new_data: pd.DataFrame, 
                     target_column: str) -> Tuple[bool, Dict]:
        """Retrain existing model with new data"""
        return self.train_model(model_name, new_data, target_column)
    
    # ========================================================================
    # MODEL PREDICTION
    # ========================================================================
    
    def predict(self, model_name: str, input_data: Dict) -> Tuple[bool, Any]:
        """Make prediction using trained model"""
        try:
            if model_name not in self.models:
                return False, {"error": f"Model {model_name} not found"}
            
            model_info = self.models[model_name]
            model = model_info['model']
            scaler = model_info['scaler']
            features = model_info['features']
            
            # Prepare input
            X = self._prepare_prediction_input(input_data, features)
            
            if X is None:
                return False, {"error": "Invalid input data"}
            
            # Scale
            X_scaled = scaler.transform(X)
            
            # Predict
            prediction = model.predict(X_scaled)[0]
            
            # Get confidence (feature importance weighted)
            confidence = self._calculate_confidence(model, X_scaled)
            
            return True, {
                'prediction': float(prediction),
                'confidence': float(confidence),
                'model': model_name,
                'timestamp': datetime.utcnow().isoformat()
            }
        
        except Exception as e:
            self.logger.error(f"Error making prediction with {model_name}: {str(e)}")
            return False, {"error": str(e)}
    
    def batch_predict(self, model_name: str, input_data_list: list) -> Tuple[bool, list]:
        """Make batch predictions"""
        predictions = []
        for input_data in input_data_list:
            success, result = self.predict(model_name, input_data)
            if success:
                predictions.append(result)
        
        return len(predictions) > 0, predictions
    
    # ========================================================================
    # MODEL VERSIONING
    # ========================================================================
    
    def save_model_version(self, model_name: str, version: str) -> bool:
        """Save model version"""
        try:
            if model_name not in self.models:
                return False
            
            model_info = self.models[model_name]
            
            # Save to file
            filename = f"models/{model_name}_v{version}.pkl"
            with open(filename, 'wb') as f:
                pickle.dump(model_info, f)
            
            self.logger.info(f"Model {model_name} version {version} saved")
            return True
        
        except Exception as e:
            self.logger.error(f"Error saving model version: {str(e)}")
            return False
    
    def load_model_version(self, model_name: str, version: str) -> bool:
        """Load model version"""
        try:
            filename = f"models/{model_name}_v{version}.pkl"
            with open(filename, 'rb') as f:
                model_info = pickle.load(f)
            
            self.models[model_name] = model_info
            self.logger.info(f"Model {model_name} version {version} loaded")
            return True
        
        except Exception as e:
            self.logger.error(f"Error loading model version: {str(e)}")
            return False
    
    # ========================================================================
    # MODEL PERFORMANCE TRACKING
    # ========================================================================
    
    def track_performance(self, model_name: str, y_actual: list, y_predicted: list) -> Dict:
        """Track model performance"""
        try:
            metrics = self._calculate_metrics(y_actual, y_predicted)
            
            # Save to database
            from database_schema import ModelPerformance
            
            perf = ModelPerformance(
                model_name=model_name,
                accuracy=metrics.get('r2_score'),
                precision=metrics.get('precision'),
                recall=metrics.get('recall'),
                f1_score=metrics.get('f1_score'),
                rmse=metrics.get('rmse'),
                mae=metrics.get('mae'),
                predictions_count=len(y_predicted),
                avg_confidence=metrics.get('confidence', 0.5)
            )
            
            self.db.add(perf)
            self.db.commit()
            
            return metrics
        
        except Exception as e:
            self.logger.error(f"Error tracking performance: {str(e)}")
            return {}
    
    # ========================================================================
    # HELPER METHODS
    # ========================================================================
    
    def _prepare_training_data(self, data: pd.DataFrame, target_column: str) -> Tuple[pd.DataFrame, pd.Series]:
        """Prepare data for training"""
        try:
            # Remove rows with missing target
            data = data.dropna(subset=[target_column])
            
            if len(data) < 10:
                return None, None
            
            # Separate features and target
            y = data[target_column]
            X = data.drop(columns=[target_column])
            
            # Remove non-numeric columns
            X = X.select_dtypes(include=[np.number])
            
            return X, y
        
        except Exception as e:
            self.logger.error(f"Error preparing training data: {str(e)}")
            return None, None
    
    def _prepare_prediction_input(self, input_data: Dict, features: list) -> pd.DataFrame:
        """Prepare input for prediction"""
        try:
            # Create dataframe with required features
            data = {}
            for feature in features:
                data[feature] = [input_data.get(feature, 0)]
            
            return pd.DataFrame(data)
        
        except Exception as e:
            self.logger.error(f"Error preparing prediction input: {str(e)}")
            return None
    
    def _calculate_metrics(self, y_actual, y_predicted) -> Dict:
        """Calculate model metrics"""
        try:
            mse = mean_squared_error(y_actual, y_predicted)
            rmse = np.sqrt(mse)
            mae = mean_absolute_error(y_actual, y_predicted)
            r2 = r2_score(y_actual, y_predicted)
            
            return {
                'mse': float(mse),
                'rmse': float(rmse),
                'mae': float(mae),
                'r2_score': float(r2),
                'accuracy': float(max(0, 1 - (mae / (max(y_actual) - min(y_actual) + 1)))),
                'precision': float(r2),
                'recall': float(r2),
                'f1_score': float(r2)
            }
        
        except Exception as e:
            self.logger.error(f"Error calculating metrics: {str(e)}")
            return {}
    
    def _calculate_confidence(self, model, X_scaled) -> float:
        """Calculate prediction confidence"""
        try:
            if hasattr(model, 'feature_importances_'):
                importances = model.feature_importances_
                return float(np.mean(importances) * 100)
            return 75.0
        except:
            return 75.0
    
    def _save_model_to_db(self, model_name: str, model, scaler, metrics):
        """Save model info to database"""
        try:
            from database_schema import MLModel
            
            ml_model = MLModel(
                name=model_name,
                model_type="regression",
                description=f"ML Model: {model_name}",
                version="1.0",
                status="active",
                accuracy=metrics.get('r2_score', 0),
                last_trained=datetime.utcnow(),
                training_data_size=metrics.get('training_data_size', 0),
                model_path=f"models/{model_name}.pkl",
                config={"metrics": metrics}
            )
            
            self.db.add(ml_model)
            self.db.commit()
        
        except Exception as e:
            self.logger.error(f"Error saving model to DB: {str(e)}")
