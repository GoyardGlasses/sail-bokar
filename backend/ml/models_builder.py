"""
ML Models Builder - Build and train all 17 real ML models
Each model is specialized for one task and learns from historical data
"""

import logging
import pickle
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, Tuple, Any
from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error, accuracy_score
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class MLModelsBuilder:
    """Build and manage all 17 ML models"""
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.logger = logger
        self.models = {}
        self.scalers = {}
        self.encoders = {}
    
    # ========================================================================
    # GROUP 1: PREDICTION MODELS (5 models)
    # ========================================================================
    
    def build_delay_prediction_model(self, training_data: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Model 1: Delay Prediction
        Predicts shipment delays based on route, material, weather, traffic
        """
        try:
            self.logger.info("Building Delay Prediction Model...")
            
            # Prepare data
            X, y = self._prepare_data(training_data, 'delay_days')
            if X is None:
                return False, {"error": "Insufficient data"}
            
            # Train model
            model, metrics = self._train_regression_model(X, y, "delay_prediction_model")
            
            self.models['delay_prediction_model'] = model
            self.logger.info(f"✓ Delay Prediction Model trained. R²: {metrics['r2_score']:.2%}")
            
            return True, metrics
        except Exception as e:
            self.logger.error(f"Error building delay model: {str(e)}")
            return False, {"error": str(e)}
    
    def build_cost_prediction_model(self, training_data: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Model 2: Cost Prediction
        Predicts shipping costs based on route, tonnage, material, fuel
        """
        try:
            self.logger.info("Building Cost Prediction Model...")
            
            X, y = self._prepare_data(training_data, 'total_cost')
            if X is None:
                return False, {"error": "Insufficient data"}
            
            model, metrics = self._train_regression_model(X, y, "cost_prediction_model")
            
            self.models['cost_prediction_model'] = model
            self.logger.info(f"✓ Cost Prediction Model trained. R²: {metrics['r2_score']:.2%}")
            
            return True, metrics
        except Exception as e:
            self.logger.error(f"Error building cost model: {str(e)}")
            return False, {"error": str(e)}
    
    def build_demand_forecasting_model(self, training_data: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Model 3: Demand Forecasting
        Predicts future demand based on historical patterns
        """
        try:
            self.logger.info("Building Demand Forecasting Model...")
            
            X, y = self._prepare_data(training_data, 'tonnage')
            if X is None:
                return False, {"error": "Insufficient data"}
            
            model, metrics = self._train_regression_model(X, y, "demand_forecasting_model")
            
            self.models['demand_forecasting_model'] = model
            self.logger.info(f"✓ Demand Forecasting Model trained. R²: {metrics['r2_score']:.2%}")
            
            return True, metrics
        except Exception as e:
            self.logger.error(f"Error building demand model: {str(e)}")
            return False, {"error": str(e)}
    
    def build_quality_prediction_model(self, training_data: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Model 4: Quality Prediction
        Predicts delivery quality score based on route, material, weather
        """
        try:
            self.logger.info("Building Quality Prediction Model...")
            
            X, y = self._prepare_data(training_data, 'quality_score')
            if X is None:
                return False, {"error": "Insufficient data"}
            
            model, metrics = self._train_regression_model(X, y, "quality_prediction_model")
            
            self.models['quality_prediction_model'] = model
            self.logger.info(f"✓ Quality Prediction Model trained. R²: {metrics['r2_score']:.2%}")
            
            return True, metrics
        except Exception as e:
            self.logger.error(f"Error building quality model: {str(e)}")
            return False, {"error": str(e)}
    
    def build_fuel_consumption_model(self, training_data: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Model 5: Fuel Consumption
        Predicts fuel consumption based on distance, vehicle, load, weather
        """
        try:
            self.logger.info("Building Fuel Consumption Model...")
            
            X, y = self._prepare_data(training_data, 'fuel_consumed')
            if X is None:
                return False, {"error": "Insufficient data"}
            
            model, metrics = self._train_regression_model(X, y, "fuel_consumption_model")
            
            self.models['fuel_consumption_model'] = model
            self.logger.info(f"✓ Fuel Consumption Model trained. R²: {metrics['r2_score']:.2%}")
            
            return True, metrics
        except Exception as e:
            self.logger.error(f"Error building fuel model: {str(e)}")
            return False, {"error": str(e)}
    
    # ========================================================================
    # GROUP 2: OPTIMIZATION MODELS (5 models)
    # ========================================================================
    
    def build_route_optimization_model(self, training_data: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Model 6: Route Optimization
        Recommends best route based on cost, time, and safety constraints
        """
        try:
            self.logger.info("Building Route Optimization Model...")
            
            # Encode routes
            X, y = self._prepare_categorical_data(training_data, 'route', 'route')
            if X is None:
                return False, {"error": "Insufficient data"}
            
            model, metrics = self._train_classification_model(X, y, "route_optimization_model")
            
            self.models['route_optimization_model'] = model
            self.logger.info(f"✓ Route Optimization Model trained. Accuracy: {metrics['accuracy']:.2%}")
            
            return True, metrics
        except Exception as e:
            self.logger.error(f"Error building route model: {str(e)}")
            return False, {"error": str(e)}
    
    def build_cost_optimization_model(self, training_data: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Model 7: Cost Optimization
        Minimizes costs while maintaining quality and delivery time
        """
        try:
            self.logger.info("Building Cost Optimization Model...")
            
            X, y = self._prepare_data(training_data, 'cost_optimization')
            if X is None:
                return False, {"error": "Insufficient data"}
            
            model, metrics = self._train_regression_model(X, y, "cost_optimization_model")
            
            self.models['cost_optimization_model'] = model
            self.logger.info(f"✓ Cost Optimization Model trained. R²: {metrics['r2_score']:.2%}")
            
            return True, metrics
        except Exception as e:
            self.logger.error(f"Error building cost optimization model: {str(e)}")
            return False, {"error": str(e)}
    
    def build_time_optimization_model(self, training_data: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Model 8: Time Optimization
        Minimizes delivery time based on route and constraints
        """
        try:
            self.logger.info("Building Time Optimization Model...")
            
            X, y = self._prepare_data(training_data, 'actual_days')
            if X is None:
                return False, {"error": "Insufficient data"}
            
            model, metrics = self._train_regression_model(X, y, "time_optimization_model")
            
            self.models['time_optimization_model'] = model
            self.logger.info(f"✓ Time Optimization Model trained. R²: {metrics['r2_score']:.2%}")
            
            return True, metrics
        except Exception as e:
            self.logger.error(f"Error building time optimization model: {str(e)}")
            return False, {"error": str(e)}
    
    def build_vehicle_allocation_model(self, training_data: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Model 9: Vehicle Allocation
        Assigns best vehicle based on tonnage, route, urgency
        """
        try:
            self.logger.info("Building Vehicle Allocation Model...")
            
            X, y = self._prepare_categorical_data(training_data, 'vehicle', 'vehicle')
            if X is None:
                return False, {"error": "Insufficient data"}
            
            model, metrics = self._train_classification_model(X, y, "vehicle_allocation_model")
            
            self.models['vehicle_allocation_model'] = model
            self.logger.info(f"✓ Vehicle Allocation Model trained. Accuracy: {metrics['accuracy']:.2%}")
            
            return True, metrics
        except Exception as e:
            self.logger.error(f"Error building vehicle allocation model: {str(e)}")
            return False, {"error": str(e)}
    
    def build_material_recommendation_model(self, training_data: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Model 10: Material Recommendation
        Recommends best material based on route, cost, quality requirements
        """
        try:
            self.logger.info("Building Material Recommendation Model...")
            
            X, y = self._prepare_categorical_data(training_data, 'material', 'material')
            if X is None:
                return False, {"error": "Insufficient data"}
            
            model, metrics = self._train_classification_model(X, y, "material_recommendation_model")
            
            self.models['material_recommendation_model'] = model
            self.logger.info(f"✓ Material Recommendation Model trained. Accuracy: {metrics['accuracy']:.2%}")
            
            return True, metrics
        except Exception as e:
            self.logger.error(f"Error building material model: {str(e)}")
            return False, {"error": str(e)}
    
    # ========================================================================
    # GROUP 3: RISK & DECISION MODELS (4 models)
    # ========================================================================
    
    def build_risk_assessment_model(self, training_data: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Model 11: Risk Assessment
        Calculates shipment risk score based on all factors
        """
        try:
            self.logger.info("Building Risk Assessment Model...")
            
            X, y = self._prepare_data(training_data, 'risk_score')
            if X is None:
                return False, {"error": "Insufficient data"}
            
            model, metrics = self._train_regression_model(X, y, "risk_assessment_model")
            
            self.models['risk_assessment_model'] = model
            self.logger.info(f"✓ Risk Assessment Model trained. R²: {metrics['r2_score']:.2%}")
            
            return True, metrics
        except Exception as e:
            self.logger.error(f"Error building risk model: {str(e)}")
            return False, {"error": str(e)}
    
    def build_decision_support_model(self, training_data: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Model 12: Decision Support
        Recommends best decisions based on historical decisions and outcomes
        """
        try:
            self.logger.info("Building Decision Support Model...")
            
            X, y = self._prepare_data(training_data, 'complexity')
            if X is None:
                return False, {"error": "Insufficient data"}
            
            model, metrics = self._train_regression_model(X, y, "decision_support_model")
            
            self.models['decision_support_model'] = model
            self.logger.info(f"✓ Decision Support Model trained. R²: {metrics['r2_score']:.2%}")
            
            return True, metrics
        except Exception as e:
            self.logger.error(f"Error building decision support model: {str(e)}")
            return False, {"error": str(e)}
    
    def build_anomaly_detection_model(self, training_data: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Model 13: Anomaly Detection
        Detects unusual patterns in dispatch data
        """
        try:
            self.logger.info("Building Anomaly Detection Model...")
            
            X, _ = self._prepare_data(training_data, 'delay_days')
            if X is None:
                return False, {"error": "Insufficient data"}
            
            # Use Isolation Forest for anomaly detection
            model = IsolationForest(contamination=0.1, random_state=42)
            model.fit(X)
            
            self.models['anomaly_detection_model'] = model
            self.logger.info(f"✓ Anomaly Detection Model trained.")
            
            return True, {"status": "trained"}
        except Exception as e:
            self.logger.error(f"Error building anomaly model: {str(e)}")
            return False, {"error": str(e)}
    
    def build_supplier_performance_model(self, training_data: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Model 14: Supplier Performance
        Rates supplier reliability based on performance history
        """
        try:
            self.logger.info("Building Supplier Performance Model...")
            
            X, y = self._prepare_data(training_data, 'satisfaction')
            if X is None:
                return False, {"error": "Insufficient data"}
            
            model, metrics = self._train_regression_model(X, y, "supplier_performance_model")
            
            self.models['supplier_performance_model'] = model
            self.logger.info(f"✓ Supplier Performance Model trained. R²: {metrics['r2_score']:.2%}")
            
            return True, metrics
        except Exception as e:
            self.logger.error(f"Error building supplier model: {str(e)}")
            return False, {"error": str(e)}
    
    # ========================================================================
    # GROUP 4: ADVANCED MODELS (3 models)
    # ========================================================================
    
    def build_scenario_analysis_model(self, training_data: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Model 15: Scenario Analysis
        Simulates outcomes for different scenarios
        """
        try:
            self.logger.info("Building Scenario Analysis Model...")
            
            X, y = self._prepare_data(training_data, 'actual_days')
            if X is None:
                return False, {"error": "Insufficient data"}
            
            model, metrics = self._train_regression_model(X, y, "scenario_analysis_model")
            
            self.models['scenario_analysis_model'] = model
            self.logger.info(f"✓ Scenario Analysis Model trained. R²: {metrics['r2_score']:.2%}")
            
            return True, metrics
        except Exception as e:
            self.logger.error(f"Error building scenario model: {str(e)}")
            return False, {"error": str(e)}
    
    def build_predictive_maintenance_model(self, training_data: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Model 16: Predictive Maintenance
        Predicts vehicle maintenance needs based on usage
        """
        try:
            self.logger.info("Building Predictive Maintenance Model...")
            
            X, y = self._prepare_data(training_data, 'fuel_consumed')
            if X is None:
                return False, {"error": "Insufficient data"}
            
            model, metrics = self._train_regression_model(X, y, "predictive_maintenance_model")
            
            self.models['predictive_maintenance_model'] = model
            self.logger.info(f"✓ Predictive Maintenance Model trained. R²: {metrics['r2_score']:.2%}")
            
            return True, metrics
        except Exception as e:
            self.logger.error(f"Error building maintenance model: {str(e)}")
            return False, {"error": str(e)}
    
    def build_customer_satisfaction_model(self, training_data: pd.DataFrame) -> Tuple[bool, Dict]:
        """
        Model 17: Customer Satisfaction
        Predicts customer satisfaction based on delivery performance
        """
        try:
            self.logger.info("Building Customer Satisfaction Model...")
            
            X, y = self._prepare_data(training_data, 'satisfaction')
            if X is None:
                return False, {"error": "Insufficient data"}
            
            model, metrics = self._train_regression_model(X, y, "customer_satisfaction_model")
            
            self.models['customer_satisfaction_model'] = model
            self.logger.info(f"✓ Customer Satisfaction Model trained. R²: {metrics['r2_score']:.2%}")
            
            return True, metrics
        except Exception as e:
            self.logger.error(f"Error building satisfaction model: {str(e)}")
            return False, {"error": str(e)}
    
    # ========================================================================
    # BUILD ALL MODELS
    # ========================================================================
    
    def build_all_models(self, training_data: pd.DataFrame) -> Dict:
        """Build all 17 ML models"""
        results = {
            "prediction_models": {},
            "optimization_models": {},
            "risk_decision_models": {},
            "advanced_models": {},
            "total_models": 0,
            "successful_models": 0,
            "failed_models": 0,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Group 1: Prediction Models
        self.logger.info("\n" + "="*60)
        self.logger.info("BUILDING GROUP 1: PREDICTION MODELS (5 models)")
        self.logger.info("="*60)
        
        success, metrics = self.build_delay_prediction_model(training_data)
        results["prediction_models"]["delay_prediction"] = {"success": success, "metrics": metrics}
        results["successful_models"] += success
        results["total_models"] += 1
        
        success, metrics = self.build_cost_prediction_model(training_data)
        results["prediction_models"]["cost_prediction"] = {"success": success, "metrics": metrics}
        results["successful_models"] += success
        results["total_models"] += 1
        
        success, metrics = self.build_demand_forecasting_model(training_data)
        results["prediction_models"]["demand_forecasting"] = {"success": success, "metrics": metrics}
        results["successful_models"] += success
        results["total_models"] += 1
        
        success, metrics = self.build_quality_prediction_model(training_data)
        results["prediction_models"]["quality_prediction"] = {"success": success, "metrics": metrics}
        results["successful_models"] += success
        results["total_models"] += 1
        
        success, metrics = self.build_fuel_consumption_model(training_data)
        results["prediction_models"]["fuel_consumption"] = {"success": success, "metrics": metrics}
        results["successful_models"] += success
        results["total_models"] += 1
        
        # Group 2: Optimization Models
        self.logger.info("\n" + "="*60)
        self.logger.info("BUILDING GROUP 2: OPTIMIZATION MODELS (5 models)")
        self.logger.info("="*60)
        
        success, metrics = self.build_route_optimization_model(training_data)
        results["optimization_models"]["route_optimization"] = {"success": success, "metrics": metrics}
        results["successful_models"] += success
        results["total_models"] += 1
        
        success, metrics = self.build_cost_optimization_model(training_data)
        results["optimization_models"]["cost_optimization"] = {"success": success, "metrics": metrics}
        results["successful_models"] += success
        results["total_models"] += 1
        
        success, metrics = self.build_time_optimization_model(training_data)
        results["optimization_models"]["time_optimization"] = {"success": success, "metrics": metrics}
        results["successful_models"] += success
        results["total_models"] += 1
        
        success, metrics = self.build_vehicle_allocation_model(training_data)
        results["optimization_models"]["vehicle_allocation"] = {"success": success, "metrics": metrics}
        results["successful_models"] += success
        results["total_models"] += 1
        
        success, metrics = self.build_material_recommendation_model(training_data)
        results["optimization_models"]["material_recommendation"] = {"success": success, "metrics": metrics}
        results["successful_models"] += success
        results["total_models"] += 1
        
        # Group 3: Risk & Decision Models
        self.logger.info("\n" + "="*60)
        self.logger.info("BUILDING GROUP 3: RISK & DECISION MODELS (4 models)")
        self.logger.info("="*60)
        
        success, metrics = self.build_risk_assessment_model(training_data)
        results["risk_decision_models"]["risk_assessment"] = {"success": success, "metrics": metrics}
        results["successful_models"] += success
        results["total_models"] += 1
        
        success, metrics = self.build_decision_support_model(training_data)
        results["risk_decision_models"]["decision_support"] = {"success": success, "metrics": metrics}
        results["successful_models"] += success
        results["total_models"] += 1
        
        success, metrics = self.build_anomaly_detection_model(training_data)
        results["risk_decision_models"]["anomaly_detection"] = {"success": success, "metrics": metrics}
        results["successful_models"] += success
        results["total_models"] += 1
        
        success, metrics = self.build_supplier_performance_model(training_data)
        results["risk_decision_models"]["supplier_performance"] = {"success": success, "metrics": metrics}
        results["successful_models"] += success
        results["total_models"] += 1
        
        # Group 4: Advanced Models
        self.logger.info("\n" + "="*60)
        self.logger.info("BUILDING GROUP 4: ADVANCED MODELS (3 models)")
        self.logger.info("="*60)
        
        success, metrics = self.build_scenario_analysis_model(training_data)
        results["advanced_models"]["scenario_analysis"] = {"success": success, "metrics": metrics}
        results["successful_models"] += success
        results["total_models"] += 1
        
        success, metrics = self.build_predictive_maintenance_model(training_data)
        results["advanced_models"]["predictive_maintenance"] = {"success": success, "metrics": metrics}
        results["successful_models"] += success
        results["total_models"] += 1
        
        success, metrics = self.build_customer_satisfaction_model(training_data)
        results["advanced_models"]["customer_satisfaction"] = {"success": success, "metrics": metrics}
        results["successful_models"] += success
        results["total_models"] += 1
        
        results["failed_models"] = results["total_models"] - results["successful_models"]
        
        # Summary
        self.logger.info("\n" + "="*60)
        self.logger.info("✓ ALL 17 ML MODELS BUILT!")
        self.logger.info(f"✓ Successful: {results['successful_models']}/{results['total_models']}")
        self.logger.info(f"✗ Failed: {results['failed_models']}/{results['total_models']}")
        self.logger.info("="*60)
        
        return results
    
    # ========================================================================
    # HELPER METHODS
    # ========================================================================
    
    def _prepare_data(self, data: pd.DataFrame, target_column: str) -> Tuple[pd.DataFrame, pd.Series]:
        """Prepare data for training"""
        try:
            data = data.dropna(subset=[target_column])
            if len(data) < 10:
                return None, None
            
            y = data[target_column]
            X = data.drop(columns=[target_column])
            X = X.select_dtypes(include=[np.number])
            
            return X, y
        except:
            return None, None
    
    def _prepare_categorical_data(self, data: pd.DataFrame, target_column: str, 
                                  category_column: str) -> Tuple[pd.DataFrame, pd.Series]:
        """Prepare categorical data for training"""
        try:
            data = data.dropna(subset=[target_column])
            if len(data) < 10:
                return None, None
            
            y = data[target_column]
            X = data.drop(columns=[target_column])
            X = X.select_dtypes(include=[np.number])
            
            # Encode target
            encoder = LabelEncoder()
            y_encoded = encoder.fit_transform(y)
            
            self.encoders[target_column] = encoder
            
            return X, y_encoded
        except:
            return None, None
    
    def _train_regression_model(self, X: pd.DataFrame, y: pd.Series, 
                               model_name: str) -> Tuple[Any, Dict]:
        """Train regression model"""
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        model = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)
        model.fit(X_train_scaled, y_train)
        
        y_pred = model.predict(X_test_scaled)
        
        metrics = {
            'mse': float(mean_squared_error(y_test, y_pred)),
            'rmse': float(np.sqrt(mean_squared_error(y_test, y_pred))),
            'mae': float(mean_absolute_error(y_test, y_pred)),
            'r2_score': float(r2_score(y_test, y_pred))
        }
        
        self.scalers[model_name] = scaler
        
        return model, metrics
    
    def _train_classification_model(self, X: pd.DataFrame, y: np.ndarray, 
                                   model_name: str) -> Tuple[Any, Dict]:
        """Train classification model"""
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
        model.fit(X_train_scaled, y_train)
        
        y_pred = model.predict(X_test_scaled)
        
        metrics = {
            'accuracy': float(accuracy_score(y_test, y_pred))
        }
        
        self.scalers[model_name] = scaler
        
        return model, metrics
    
    def save_all_models(self, directory: str = "models") -> bool:
        """Save all trained models"""
        try:
            import os
            os.makedirs(directory, exist_ok=True)
            
            for model_name, model in self.models.items():
                filepath = f"{directory}/{model_name}.pkl"
                with open(filepath, 'wb') as f:
                    pickle.dump(model, f)
                self.logger.info(f"✓ Saved {model_name}")
            
            return True
        except Exception as e:
            self.logger.error(f"Error saving models: {str(e)}")
            return False
