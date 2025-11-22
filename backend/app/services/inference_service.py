"""
ML Inference Service - Unified prediction interface.
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, Optional, Tuple
from datetime import datetime
from ..models_loader import (
    predict_demand, predict_rake_availability, predict_delay,
    predict_throughput, predict_cost, predict_transport_mode, models_loader
)
from ..utils import app_logger
from ..config import settings

class InferenceService:
    """Service for unified ML inference across all models."""
    
    @staticmethod
    def predict_demand_forecast(
        material_type: str,
        destination: str,
        quantity_tonnes: float,
        priority: str = "MEDIUM"
    ) -> Dict[str, Any]:
        """
        Predict demand for material-destination pair.
        
        Args:
            material_type: Material type
            destination: Destination
            quantity_tonnes: Quantity in tonnes
            priority: Priority level
        
        Returns:
            Prediction with confidence
        """
        try:
            if not models_loader.is_model_loaded('demand'):
                return {
                    'predicted_demand_tonnes': quantity_tonnes,
                    'confidence': 0.0,
                    'error': 'Model not available'
                }
            
            result = predict_demand(material_type, destination, quantity_tonnes, priority)
            return result
        except Exception as e:
            app_logger.error(f"Demand prediction error: {str(e)}")
            return {
                'predicted_demand_tonnes': quantity_tonnes,
                'confidence': 0.0,
                'error': str(e)
            }
    
    @staticmethod
    def predict_available_rakes(date: str) -> Dict[str, Any]:
        """
        Predict available rakes for a given date.
        
        Args:
            date: Date in YYYY-MM-DD format
        
        Returns:
            Prediction with confidence
        """
        try:
            if not models_loader.is_model_loaded('rake_availability'):
                return {
                    'predicted_available_rakes': 5,
                    'confidence': 0.0,
                    'error': 'Model not available'
                }
            
            result = predict_rake_availability(date, 'Kolkata', 'HR_Coils')
            return result
        except Exception as e:
            app_logger.error(f"Rake availability prediction error: {str(e)}")
            return {
                'predicted_available_rakes': 5,
                'confidence': 0.0,
                'error': str(e)
            }
    
    @staticmethod
    def predict_route_delay(
        route: str,
        tonnes: float,
        material_type: str,
        weather: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Predict delay for a route.
        
        Args:
            route: Route name
            tonnes: Tonnes dispatched
            material_type: Material type
            weather: Weather condition
        
        Returns:
            Prediction with confidence
        """
        try:
            if not models_loader.is_model_loaded('delay_classifier'):
                return {
                    'predicted_delay_hours': 2.0,
                    'delay_probability': 0.5,
                    'confidence': 0.0,
                    'error': 'Model not available'
                }
            
            result = predict_delay(route, tonnes, material_type, weather)
            return result
        except Exception as e:
            app_logger.error(f"Delay prediction error: {str(e)}")
            return {
                'predicted_delay_hours': 2.0,
                'delay_probability': 0.5,
                'confidence': 0.0,
                'error': str(e)
            }
    
    @staticmethod
    def predict_loading_throughput(
        loading_point: str,
        material_type: str,
        equipment_count: int = 5,
        shift: str = "Morning"
    ) -> Dict[str, Any]:
        """
        Predict loading point throughput (TPH).
        
        Args:
            loading_point: Loading point ID
            material_type: Material type
            equipment_count: Equipment operational count
            shift: Shift (Morning/Afternoon/Night)
        
        Returns:
            Prediction with confidence
        """
        try:
            if not models_loader.is_model_loaded('throughput'):
                return {
                    'predicted_throughput_tph': 400.0,
                    'confidence': 0.0,
                    'error': 'Model not available'
                }
            
            result = predict_throughput(loading_point, material_type, equipment_count, shift)
            return result
        except Exception as e:
            app_logger.error(f"Throughput prediction error: {str(e)}")
            return {
                'predicted_throughput_tph': 400.0,
                'confidence': 0.0,
                'error': str(e)
            }
    
    @staticmethod
    def predict_dispatch_cost(
        route: str,
        tonnes: float,
        delay_hours: float,
        material_type: str
    ) -> Dict[str, Any]:
        """
        Predict dispatch cost.
        
        Args:
            route: Route name
            tonnes: Tonnes dispatched
            delay_hours: Estimated delay hours
            material_type: Material type
        
        Returns:
            Prediction with confidence
        """
        try:
            if not models_loader.is_model_loaded('cost'):
                return {
                    'predicted_cost_rs': tonnes * 500,
                    'confidence': 0.0,
                    'error': 'Model not available'
                }
            
            result = predict_cost(route, tonnes, delay_hours, material_type)
            return result
        except Exception as e:
            app_logger.error(f"Cost prediction error: {str(e)}")
            return {
                'predicted_cost_rs': tonnes * 500,
                'confidence': 0.0,
                'error': str(e)
            }
    
    @staticmethod
    def predict_optimal_mode(
        quantity_tonnes: float,
        distance_km: float,
        priority: str,
        destination: str,
        material_type: str
    ) -> Dict[str, Any]:
        """
        Predict optimal transport mode (RAIL vs ROAD).
        
        Args:
            quantity_tonnes: Quantity in tonnes
            distance_km: Distance in km
            priority: Priority level
            destination: Destination
            material_type: Material type
        
        Returns:
            Prediction with confidence
        """
        try:
            if not models_loader.is_model_loaded('mode_classifier'):
                return {
                    'recommended_mode': 'RAIL',
                    'confidence': 0.0,
                    'error': 'Model not available'
                }
            
            result = predict_transport_mode(
                quantity_tonnes, distance_km, priority, destination, material_type
            )
            return result
        except Exception as e:
            app_logger.error(f"Mode prediction error: {str(e)}")
            return {
                'recommended_mode': 'RAIL',
                'confidence': 0.0,
                'error': str(e)
            }

# Global inference service instance
inference_service = InferenceService()
