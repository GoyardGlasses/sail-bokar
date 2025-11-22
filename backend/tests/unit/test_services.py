"""
Unit tests for services.
"""

import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.services.inference_service import inference_service
from app.services.optimize_service import optimize_service

class TestInferenceService:
    """Tests for inference service."""
    
    def test_predict_demand(self):
        """Test demand prediction."""
        result = inference_service.predict_demand_forecast(
            'HR_Coils', 'Kolkata', 500, 'HIGH'
        )
        
        assert 'predicted_demand_tonnes' in result
        assert result['predicted_demand_tonnes'] > 0
        assert 'confidence' in result
    
    def test_predict_rake_availability(self):
        """Test rake availability prediction."""
        result = inference_service.predict_available_rakes('2025-11-22')
        
        assert 'predicted_available_rakes' in result
        assert result['predicted_available_rakes'] >= 0
    
    def test_predict_delay(self):
        """Test delay prediction."""
        result = inference_service.predict_route_delay(
            'Kolkata-Bokaro', 1000, 'HR_Coils', 'Clear'
        )
        
        assert 'predicted_delay_hours' in result
        assert result['predicted_delay_hours'] >= 0
    
    def test_predict_throughput(self):
        """Test throughput prediction."""
        result = inference_service.predict_loading_throughput(
            'LP1', 'HR_Coils', 5, 'Morning'
        )
        
        assert 'predicted_throughput_tph' in result
        assert result['predicted_throughput_tph'] > 0
    
    def test_predict_cost(self):
        """Test cost prediction."""
        result = inference_service.predict_dispatch_cost(
            'Kolkata-Bokaro', 1000, 2.0, 'HR_Coils'
        )
        
        assert 'predicted_cost_rs' in result
        assert result['predicted_cost_rs'] > 0
    
    def test_predict_mode(self):
        """Test mode prediction."""
        result = inference_service.predict_optimal_mode(
            500, 250, 'HIGH', 'Kolkata', 'HR_Coils'
        )
        
        assert 'recommended_mode' in result
        assert result['recommended_mode'] in ['RAIL', 'ROAD']

class TestOptimizeService:
    """Tests for optimization service."""
    
    def test_build_optimizer_input(self):
        """Test building optimizer input."""
        request = {
            'orders': [
                {
                    'order_id': 'ORD001',
                    'material_type': 'HR_Coils',
                    'quantity_tonnes': 500,
                    'destination': 'Kolkata',
                    'priority': 'HIGH'
                }
            ],
            'available_rakes': 5,
            'available_trucks': 20,
            'inventory': {'HR_Coils': 5000}
        }
        
        optimizer_input = optimize_service.build_optimizer_input(request)
        
        assert 'orders' in optimizer_input
        assert 'ml_predictions' in optimizer_input
        assert 'cost_parameters' in optimizer_input
        assert len(optimizer_input['ml_predictions']) > 0

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
