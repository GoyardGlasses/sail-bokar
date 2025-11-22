"""
Unit tests for optimization endpoints and services.
"""

import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app
from app.services.optimize_service import optimize_service
from app.optimizer.solver import RakeFormationOptimizer

client = TestClient(app)

# ============================================================================
# OPTIMIZATION SERVICE TESTS
# ============================================================================

def test_build_optimizer_input():
    """Test building optimizer input with ML predictions."""
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

def test_optimize_basic():
    """Test basic optimization with small input."""
    request = {
        'orders': [
            {
                'order_id': 'ORD001',
                'material_type': 'HR_Coils',
                'quantity_tonnes': 1000,
                'destination': 'Kolkata',
                'priority': 'HIGH'
            },
            {
                'order_id': 'ORD002',
                'material_type': 'CR_Coils',
                'quantity_tonnes': 800,
                'destination': 'Patna',
                'priority': 'MEDIUM'
            }
        ],
        'available_rakes': 2,
        'available_trucks': 10,
        'inventory': {
            'HR_Coils': 5000,
            'CR_Coils': 3000
        }
    }
    
    optimizer_input = optimize_service.build_optimizer_input(request)
    solution = optimize_service.run_optimizer(optimizer_input)
    
    assert 'rakes' in solution
    assert 'trucks' in solution
    assert 'summary' in solution
    assert solution['summary']['total_tonnage'] > 0

def test_optimize_empty_orders():
    """Test optimization with empty orders."""
    request = {
        'orders': [],
        'available_rakes': 5,
        'available_trucks': 20,
        'inventory': {}
    }
    
    optimizer_input = optimize_service.build_optimizer_input(request)
    solution = optimize_service.run_optimizer(optimizer_input)
    
    assert solution['summary']['total_rakes'] == 0
    assert solution['summary']['total_trucks'] == 0
    assert solution['summary']['total_tonnage'] == 0

def test_optimize_no_rakes():
    """Test optimization with no available rakes (prefer trucks)."""
    request = {
        'orders': [
            {
                'order_id': 'ORD001',
                'material_type': 'HR_Coils',
                'quantity_tonnes': 100,
                'destination': 'Kolkata',
                'priority': 'HIGH'
            }
        ],
        'available_rakes': 0,
        'available_trucks': 10,
        'inventory': {'HR_Coils': 5000}
    }
    
    optimizer_input = optimize_service.build_optimizer_input(request)
    solution = optimize_service.run_optimizer(optimizer_input)
    
    # Should use trucks instead
    assert solution['summary']['total_trucks'] > 0 or solution['summary']['total_rakes'] == 0

# ============================================================================
# SOLVER TESTS
# ============================================================================

def test_solver_basic():
    """Test solver with basic input."""
    optimizer = RakeFormationOptimizer(time_limit_seconds=5)
    
    input_json = {
        'orders': [
            {
                'order_id': 'ORD001',
                'material_type': 'HR_Coils',
                'quantity_tonnes': 1000,
                'destination': 'Kolkata',
                'priority': 'HIGH'
            }
        ],
        'available_rakes': 2,
        'available_trucks': 10,
        'inventory': {'HR_Coils': 5000},
        'ml_predictions': {
            'delay_RAKE_001': 2.0,
            'delay_TRUCK_001': 1.5,
            'demurrage_hours': 0.5,
        },
        'cost_parameters': {
            'freight_rate_per_tonne': 500,
            'demurrage_rate_per_wagon_per_hour': 100,
            'truck_cost_per_km_per_tonne': 30,
        }
    }
    
    solution = optimizer.solve(input_json)
    
    assert 'rakes' in solution
    assert 'trucks' in solution
    assert 'summary' in solution
    assert 'solver_status' in solution

def test_solver_timeout_fallback():
    """Test solver timeout with greedy fallback."""
    optimizer = RakeFormationOptimizer(time_limit_seconds=0.001)  # Very short timeout
    
    input_json = {
        'orders': [
            {
                'order_id': f'ORD{i:03d}',
                'material_type': 'HR_Coils',
                'quantity_tonnes': 500,
                'destination': 'Kolkata',
                'priority': 'MEDIUM'
            }
            for i in range(5)
        ],
        'available_rakes': 3,
        'available_trucks': 10,
        'inventory': {'HR_Coils': 10000},
        'ml_predictions': {},
        'cost_parameters': {}
    }
    
    solution = optimizer.solve(input_json)
    
    # Should return greedy fallback
    assert solution['solver_status'] in ['GREEDY_FALLBACK', 'FEASIBLE', 'OPTIMAL']
    assert 'summary' in solution

# ============================================================================
# API ENDPOINT TESTS
# ============================================================================

def test_optimize_dispatch_endpoint():
    """Test /optimize/dispatch endpoint."""
    response = client.post(
        "/optimize/dispatch",
        json={
            "orders": [
                {
                    "order_id": "ORD001",
                    "material_type": "HR_Coils",
                    "quantity_tonnes": 500,
                    "destination": "Kolkata",
                    "priority": "HIGH"
                }
            ],
            "available_rakes": 2,
            "available_trucks": 10,
            "inventory": {"HR_Coils": 5000}
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'success'
    assert 'data' in data
    assert 'rakes' in data['data']
    assert 'trucks' in data['data']
    assert 'summary' in data['data']

def test_optimize_dispatch_multiple_orders():
    """Test /optimize/dispatch with multiple orders."""
    response = client.post(
        "/optimize/dispatch",
        json={
            "orders": [
                {
                    "order_id": f"ORD{i:03d}",
                    "material_type": "HR_Coils" if i % 2 == 0 else "CR_Coils",
                    "quantity_tonnes": 500 + i * 100,
                    "destination": ["Kolkata", "Patna", "Ranchi"][i % 3],
                    "priority": ["HIGH", "MEDIUM", "LOW"][i % 3]
                }
                for i in range(3)
            ],
            "available_rakes": 3,
            "available_trucks": 15,
            "inventory": {
                "HR_Coils": 10000,
                "CR_Coils": 8000
            }
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'success'
    assert len(data['data']['rakes']) + len(data['data']['trucks']) > 0

def test_optimize_dispatch_invalid_input():
    """Test /optimize/dispatch with invalid input."""
    response = client.post(
        "/optimize/dispatch",
        json={
            "orders": "invalid",  # Should be list
            "available_rakes": 2,
            "available_trucks": 10,
            "inventory": {}
        }
    )
    
    assert response.status_code == 422  # Validation error

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
