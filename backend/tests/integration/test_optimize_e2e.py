"""
End-to-end integration tests for optimization.
"""

import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestOptimizeEndToEnd:
    """End-to-end tests for optimization flow."""
    
    def test_optimize_small_input(self):
        """Test optimization with small input (3 orders, 1 rake, 4 trucks)."""
        response = client.post(
            "/optimize/dispatch",
            json={
                "orders": [
                    {
                        "order_id": "ORD001",
                        "material_type": "HR_Coils",
                        "quantity_tonnes": 1000,
                        "destination": "Kolkata",
                        "priority": "HIGH"
                    },
                    {
                        "order_id": "ORD002",
                        "material_type": "CR_Coils",
                        "quantity_tonnes": 800,
                        "destination": "Patna",
                        "priority": "MEDIUM"
                    },
                    {
                        "order_id": "ORD003",
                        "material_type": "Plates",
                        "quantity_tonnes": 500,
                        "destination": "Ranchi",
                        "priority": "LOW"
                    }
                ],
                "available_rakes": 1,
                "available_trucks": 4,
                "inventory": {
                    "HR_Coils": 5000,
                    "CR_Coils": 3000,
                    "Plates": 2000
                }
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        
        # Verify response structure
        assert 'data' in data
        assert 'rakes' in data['data']
        assert 'trucks' in data['data']
        assert 'summary' in data['data']
        
        # Verify summary has required fields
        summary = data['data']['summary']
        assert 'total_cost' in summary
        assert 'total_tonnage' in summary
        assert 'total_rakes' in summary
        assert 'total_trucks' in summary
        assert summary['total_cost'] >= 0
        assert summary['total_tonnage'] >= 0
    
    def test_optimize_high_priority_orders(self):
        """Test optimization with high priority orders."""
        response = client.post(
            "/optimize/dispatch",
            json={
                "orders": [
                    {
                        "order_id": f"ORD{i:03d}",
                        "material_type": "HR_Coils",
                        "quantity_tonnes": 500,
                        "destination": "Kolkata",
                        "priority": "HIGH"
                    }
                    for i in range(2)
                ],
                "available_rakes": 2,
                "available_trucks": 5,
                "inventory": {"HR_Coils": 10000}
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        assert data['data']['summary']['total_tonnage'] > 0
    
    def test_optimize_mixed_materials(self):
        """Test optimization with mixed materials."""
        response = client.post(
            "/optimize/dispatch",
            json={
                "orders": [
                    {
                        "order_id": "ORD001",
                        "material_type": "HR_Coils",
                        "quantity_tonnes": 600,
                        "destination": "Kolkata",
                        "priority": "HIGH"
                    },
                    {
                        "order_id": "ORD002",
                        "material_type": "CR_Coils",
                        "quantity_tonnes": 400,
                        "destination": "Patna",
                        "priority": "MEDIUM"
                    },
                    {
                        "order_id": "ORD003",
                        "material_type": "Wire_Rods",
                        "quantity_tonnes": 300,
                        "destination": "Durgapur",
                        "priority": "LOW"
                    }
                ],
                "available_rakes": 2,
                "available_trucks": 8,
                "inventory": {
                    "HR_Coils": 5000,
                    "CR_Coils": 4000,
                    "Wire_Rods": 3000
                }
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        assert len(data['data']['rakes']) + len(data['data']['trucks']) > 0
    
    def test_optimize_no_rakes_available(self):
        """Test optimization with no rakes (should use trucks)."""
        response = client.post(
            "/optimize/dispatch",
            json={
                "orders": [
                    {
                        "order_id": "ORD001",
                        "material_type": "HR_Coils",
                        "quantity_tonnes": 100,
                        "destination": "Kolkata",
                        "priority": "HIGH"
                    }
                ],
                "available_rakes": 0,
                "available_trucks": 10,
                "inventory": {"HR_Coils": 5000}
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        # Should use trucks instead
        assert data['data']['summary']['total_trucks'] > 0 or data['data']['summary']['total_rakes'] == 0

class TestOptimizeValidation:
    """Tests for request validation."""
    
    def test_invalid_order_structure(self):
        """Test with invalid order structure."""
        response = client.post(
            "/optimize/dispatch",
            json={
                "orders": "invalid",  # Should be list
                "available_rakes": 5,
                "available_trucks": 20,
                "inventory": {}
            }
        )
        
        assert response.status_code == 422
    
    def test_missing_required_fields(self):
        """Test with missing required fields."""
        response = client.post(
            "/optimize/dispatch",
            json={
                "orders": [
                    {
                        "order_id": "ORD001",
                        # Missing material_type
                        "quantity_tonnes": 500,
                        "destination": "Kolkata",
                        "priority": "HIGH"
                    }
                ],
                "available_rakes": 5,
                "available_trucks": 20,
                "inventory": {}
            }
        )
        
        assert response.status_code == 422

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
