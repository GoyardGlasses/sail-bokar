"""
End-to-End Optimization Tests
Tests the complete optimization pipeline with various scenarios
"""

import pytest
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path

logger = logging.getLogger(__name__)


class TestOptimizationE2E:
    """End-to-end optimization tests"""

    @pytest.fixture
    def client(self):
        """FastAPI test client"""
        from fastapi.testclient import TestClient
        from backend.app.main import app
        return TestClient(app)

    @pytest.fixture
    def sample_payload(self):
        """Sample optimization payload"""
        return {
            "orders": [
                {
                    "order_id": 1,
                    "material_type": "HR_Coils",
                    "quantity_tonnes": 500,
                    "destination": "Kolkata",
                    "priority": "HIGH",
                    "loading_point": "LP1",
                },
                {
                    "order_id": 2,
                    "material_type": "Plates",
                    "quantity_tonnes": 300,
                    "destination": "Patna",
                    "priority": "MEDIUM",
                    "loading_point": "LP1",
                },
                {
                    "order_id": 3,
                    "material_type": "Wire_Rods",
                    "quantity_tonnes": 200,
                    "destination": "Ranchi",
                    "priority": "LOW",
                    "loading_point": "LP2",
                },
            ],
            "available_rakes": 2,
            "available_trucks": 5,
            "inventory": [
                {
                    "stockyard": "Bokaro",
                    "material_type": "HR_Coils",
                    "quantity_tonnes": 1000,
                },
                {
                    "stockyard": "Bokaro",
                    "material_type": "Plates",
                    "quantity_tonnes": 500,
                },
                {
                    "stockyard": "Bokaro",
                    "material_type": "Wire_Rods",
                    "quantity_tonnes": 300,
                },
            ],
        }

    # ========================================================================
    # Health & Status Tests
    # ========================================================================

    def test_health_check(self, client):
        """Test backend health check"""
        response = client.get("/meta/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"

    def test_metrics_endpoint(self, client):
        """Test metrics endpoint"""
        response = client.get(
            "/meta/metrics",
            headers={"X-API-Token": "sail-bokaro-admin-token-secret"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "uptime" in data
        assert "optimizer_runs" in data

    def test_config_endpoint(self, client):
        """Test config endpoint"""
        response = client.get("/meta/config")
        assert response.status_code == 200
        data = response.json()
        assert "materials" in data
        assert "destinations" in data

    # ========================================================================
    # Prediction Tests
    # ========================================================================

    def test_demand_forecast(self, client):
        """Test demand forecasting"""
        payload = {
            "destination": "Kolkata",
            "horizon_days": 7,
            "historical_data": [
                {"date": "2025-11-15", "demand": 500},
                {"date": "2025-11-16", "demand": 520},
                {"date": "2025-11-17", "demand": 510},
            ],
        }
        response = client.post("/predict/demand", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "forecast" in data
        assert len(data["forecast"]) > 0

    def test_delay_prediction(self, client):
        """Test delay prediction"""
        payload = {
            "route_id": "Bokaro-Kolkata",
            "distance_km": 250,
            "vehicle_type": "TRUCK",
            "time_of_day": "morning",
            "weather": "clear",
        }
        response = client.post("/predict/delay", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "predicted_delay_hours" in data
        assert isinstance(data["predicted_delay_hours"], (int, float))

    def test_rake_availability_prediction(self, client):
        """Test rake availability prediction"""
        payload = {
            "yard": "Bokaro",
            "days_ahead": 7,
            "historical_data": [
                {"date": "2025-11-15", "available_rakes": 5},
                {"date": "2025-11-16", "available_rakes": 6},
            ],
        }
        response = client.post("/predict/rake-availability", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "forecast" in data

    def test_cost_prediction(self, client):
        """Test cost prediction"""
        payload = {
            "tonnes": 500,
            "distance_km": 250,
            "transport_mode": "RAIL",
            "material_type": "HR_Coils",
        }
        response = client.post("/predict/cost", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "estimated_cost" in data
        assert data["estimated_cost"] > 0

    def test_throughput_prediction(self, client):
        """Test throughput prediction"""
        payload = {
            "loading_point": "LP1",
            "hours_ahead": 24,
            "historical_data": [
                {"timestamp": "2025-11-21T10:00:00", "throughput": 100},
                {"timestamp": "2025-11-21T11:00:00", "throughput": 110},
            ],
        }
        response = client.post("/predict/throughput", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "forecast" in data

    def test_transport_mode_classification(self, client):
        """Test transport mode classification"""
        payload = {
            "tonnes": 500,
            "distance_km": 250,
            "urgency": "HIGH",
            "destination": "Kolkata",
        }
        response = client.post("/classify/transport-mode", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "recommended_mode" in data
        assert data["recommended_mode"] in ["RAIL", "ROAD"]

    # ========================================================================
    # Optimization Tests
    # ========================================================================

    def test_optimize_basic(self, client, sample_payload):
        """Test basic optimization"""
        response = client.post("/optimize/dispatch", json=sample_payload)
        assert response.status_code == 200
        data = response.json()

        # Verify response structure
        assert "rakes" in data
        assert "trucks" in data
        assert "summary" in data
        assert isinstance(data["rakes"], list)
        assert isinstance(data["trucks"], list)

    def test_optimize_response_structure(self, client, sample_payload):
        """Test optimization response structure"""
        response = client.post("/optimize/dispatch", json=sample_payload)
        assert response.status_code == 200
        data = response.json()

        # Check summary fields
        summary = data["summary"]
        assert "total_cost" in summary
        assert "total_tonnes" in summary
        assert "total_rakes_used" in summary
        assert "total_trucks_used" in summary

    def test_optimize_with_high_priority(self, client, sample_payload):
        """Test optimization with high priority orders"""
        # Modify payload to have high priority orders
        sample_payload["orders"] = [
            {
                "order_id": 1,
                "material_type": "HR_Coils",
                "quantity_tonnes": 500,
                "destination": "Kolkata",
                "priority": "HIGH",
                "loading_point": "LP1",
            }
        ]
        response = client.post("/optimize/dispatch", json=sample_payload)
        assert response.status_code == 200
        data = response.json()
        assert len(data["rakes"]) > 0 or len(data["trucks"]) > 0

    def test_optimize_stress_test_200_orders(self, client):
        """Stress test: 200 orders"""
        payload = {
            "orders": [
                {
                    "order_id": i,
                    "material_type": "HR_Coils",
                    "quantity_tonnes": 100,
                    "destination": "Kolkata",
                    "priority": "MEDIUM",
                    "loading_point": "LP1",
                }
                for i in range(200)
            ],
            "available_rakes": 5,
            "available_trucks": 20,
            "inventory": [
                {
                    "stockyard": "Bokaro",
                    "material_type": "HR_Coils",
                    "quantity_tonnes": 50000,
                }
            ],
        }
        response = client.post("/optimize/dispatch", json=payload, timeout=300)
        assert response.status_code == 200
        data = response.json()
        assert "rakes" in data
        assert "summary" in data

    def test_optimize_no_rakes_available(self, client, sample_payload):
        """Test optimization with no rakes available"""
        sample_payload["available_rakes"] = 0
        response = client.post("/optimize/dispatch", json=sample_payload)
        # Should still return 200 but use trucks instead
        assert response.status_code == 200
        data = response.json()
        assert "trucks" in data

    def test_optimize_insufficient_inventory(self, client, sample_payload):
        """Test optimization with insufficient inventory"""
        sample_payload["inventory"] = [
            {
                "stockyard": "Bokaro",
                "material_type": "HR_Coils",
                "quantity_tonnes": 100,  # Less than order quantity
            }
        ]
        response = client.post("/optimize/dispatch", json=sample_payload)
        # Should return 200 with partial fulfillment or error
        assert response.status_code in [200, 400]

    # ========================================================================
    # Error Handling Tests
    # ========================================================================

    def test_optimize_invalid_payload(self, client):
        """Test optimization with invalid payload"""
        response = client.post("/optimize/dispatch", json={"invalid": "data"})
        assert response.status_code == 422

    def test_optimize_missing_orders(self, client):
        """Test optimization with missing orders"""
        payload = {
            "available_rakes": 2,
            "available_trucks": 5,
            "inventory": [],
        }
        response = client.post("/optimize/dispatch", json=payload)
        assert response.status_code == 422

    def test_predict_invalid_input(self, client):
        """Test prediction with invalid input"""
        response = client.post("/predict/demand", json={"invalid": "data"})
        assert response.status_code == 422

    # ========================================================================
    # Timeout Tests
    # ========================================================================

    def test_optimize_timeout_handling(self, client, sample_payload):
        """Test optimization timeout handling"""
        # This test verifies that the optimizer respects time limits
        response = client.post("/optimize/dispatch", json=sample_payload, timeout=5)
        # Should either complete or timeout gracefully
        assert response.status_code in [200, 408, 504]

    # ========================================================================
    # Logging Tests
    # ========================================================================

    def test_optimize_creates_log(self, client, sample_payload):
        """Test that optimization creates log file"""
        response = client.post("/optimize/dispatch", json=sample_payload)
        assert response.status_code == 200

        # Check if log file was created
        logs_dir = Path("logs/optimize_runs")
        if logs_dir.exists():
            log_files = list(logs_dir.glob("*.json"))
            assert len(log_files) > 0

    # ========================================================================
    # Integration Tests
    # ========================================================================

    def test_full_workflow(self, client, sample_payload):
        """Test complete workflow: health → forecast → optimize"""
        # 1. Health check
        response = client.get("/meta/health")
        assert response.status_code == 200

        # 2. Forecast
        forecast_payload = {
            "destination": "Kolkata",
            "horizon_days": 7,
            "historical_data": [{"date": "2025-11-15", "demand": 500}],
        }
        response = client.post("/predict/demand", json=forecast_payload)
        assert response.status_code == 200

        # 3. Optimize
        response = client.post("/optimize/dispatch", json=sample_payload)
        assert response.status_code == 200
        data = response.json()
        assert "rakes" in data
        assert "summary" in data

    def test_multiple_optimizations(self, client, sample_payload):
        """Test multiple consecutive optimizations"""
        for i in range(3):
            response = client.post("/optimize/dispatch", json=sample_payload)
            assert response.status_code == 200
            data = response.json()
            assert "summary" in data


class TestModelLoading:
    """Test ML model loading"""

    def test_all_models_loaded(self):
        """Test that all 7 ML models are loaded"""
        from backend.app.services.ml_service import MLService

        ml_service = MLService()
        models = ml_service.get_loaded_models()

        assert len(models) >= 7
        assert "demand" in models
        assert "delay" in models
        assert "rake_availability" in models
        assert "throughput" in models
        assert "cost" in models
        assert "mode_classifier" in models


class TestDatabaseIntegration:
    """Test database integration"""

    def test_database_connection(self):
        """Test database connection"""
        from backend.app.db import test_connection

        assert test_connection() is True

    def test_query_functions(self):
        """Test database query functions"""
        from backend.app.db import (
            get_orders_by_destination,
            get_latest_inventory,
        )

        # These should not raise exceptions
        orders = get_orders_by_destination("Kolkata")
        assert isinstance(orders, list)

        inventory = get_latest_inventory("Bokaro")
        assert isinstance(inventory, list)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
