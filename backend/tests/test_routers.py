"""
Unit tests for API routers.
"""

import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app

client = TestClient(app)

# ============================================================================
# HEALTH & METADATA TESTS
# ============================================================================

def test_root():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_api_info():
    """Test API info endpoint."""
    response = client.get("/api")
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert "endpoints" in response.json()["data"]

def test_health_check():
    """Test health check endpoint."""
    response = client.get("/meta/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "models_loaded" in data
    assert "models_failed" in data

def test_models_info():
    """Test models info endpoint."""
    response = client.get("/meta/models")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data

def test_config():
    """Test config endpoint."""
    response = client.get("/meta/config")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "app_name" in data["data"]
    assert "app_version" in data["data"]

# ============================================================================
# FORECAST TESTS
# ============================================================================

def test_demand_forecast_valid():
    """Test demand forecast with valid input."""
    response = client.post(
        "/predict/demand",
        json={
            "material_type": "HR_Coils",
            "destination": "Kolkata",
            "quantity_tonnes": 500,
            "priority": "HIGH"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data

def test_demand_forecast_invalid():
    """Test demand forecast with invalid input."""
    response = client.post(
        "/predict/demand",
        json={
            "material_type": "HR_Coils",
            "destination": "Kolkata",
            "quantity_tonnes": -100,  # Invalid: negative
            "priority": "HIGH"
        }
    )
    assert response.status_code == 422  # Validation error

def test_rake_availability_forecast():
    """Test rake availability forecast."""
    response = client.post(
        "/predict/rake-availability",
        json={
            "date": "2025-11-22",
            "destination": "Kolkata",
            "material_type": "HR_Coils"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"

# ============================================================================
# PREDICTION TESTS
# ============================================================================

def test_delay_prediction():
    """Test delay prediction."""
    response = client.post(
        "/predict/delay",
        json={
            "route": "Kolkata-Bokaro",
            "tonnes_dispatched": 1000,
            "material_type": "HR_Coils",
            "weather_condition": "Clear"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "delay_probability" in data["data"]
    assert "predicted_delay_hours" in data["data"]

def test_throughput_prediction():
    """Test throughput prediction."""
    response = client.post(
        "/predict/throughput",
        json={
            "loading_point": "LP1",
            "material_type": "HR_Coils",
            "equipment_operational_count": 5,
            "shift": "Morning"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"

def test_cost_prediction():
    """Test cost prediction."""
    response = client.post(
        "/predict/cost",
        json={
            "route": "Kolkata-Bokaro",
            "tonnes_dispatched": 1000,
            "delay_hours": 2.5,
            "material_type": "HR_Coils"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "predicted_cost_rs" in data["data"]

def test_mode_classification():
    """Test transport mode classification."""
    response = client.post(
        "/predict/mode",
        json={
            "quantity_tonnes": 500,
            "distance_km": 250,
            "priority": "HIGH",
            "destination": "Kolkata",
            "material_type": "HR_Coils"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "recommended_mode" in data["data"]
    assert data["data"]["recommended_mode"] in ["RAIL", "ROAD"]

# ============================================================================
# OPTIMIZATION TESTS
# ============================================================================

def test_dispatch_optimization():
    """Test dispatch optimization."""
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
            "available_rakes": 10,
            "available_trucks": 25,
            "inventory": {
                "HR_Coils": 5000,
                "CR_Coils": 3000
            }
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "rakes" in data["data"]
    assert "trucks" in data["data"]
    assert "summary" in data["data"]

# ============================================================================
# ERROR HANDLING TESTS
# ============================================================================

def test_404_not_found():
    """Test 404 error."""
    response = client.get("/nonexistent")
    assert response.status_code == 404

def test_invalid_json():
    """Test invalid JSON."""
    response = client.post(
        "/predict/demand",
        json={"invalid": "data"}
    )
    assert response.status_code == 422

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
