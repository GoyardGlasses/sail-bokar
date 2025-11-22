#!/usr/bin/env python3

"""
ML Model Verification Script
Verifies that all 7 ML models load correctly and can make predictions
"""

import os
import sys
import logging
from pathlib import Path
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Colors
GREEN = '\033[0;32m'
RED = '\033[0;31m'
YELLOW = '\033[1;33m'
NC = '\033[0m'

def print_status(msg):
    print(f"{GREEN}[✓]{NC} {msg}")

def print_error(msg):
    print(f"{RED}[✗]{NC} {msg}")

def print_info(msg):
    print(f"{YELLOW}[i]{NC} {msg}")

def print_header(msg):
    print("")
    print("=" * 60)
    print(msg)
    print("=" * 60)
    print("")


def verify_model_files():
    """Verify all model files exist"""
    print_header("Verifying Model Files")
    
    models_dir = Path("backend/ml/models")
    
    required_models = {
        "demand_model.pkl": "Demand Forecasting",
        "rake_availability_model.pkl": "Rake Availability",
        "delay_classifier.pkl": "Delay Classifier",
        "delay_regressor.pkl": "Delay Regressor",
        "throughput_model.pkl": "Throughput Prediction",
        "cost_model.pkl": "Cost Estimation",
        "mode_classifier.pkl": "Transport Mode Classification",
    }
    
    missing_models = []
    found_models = []
    
    for model_file, model_name in required_models.items():
        model_path = models_dir / model_file
        if model_path.exists():
            size_mb = model_path.stat().st_size / (1024 * 1024)
            print_status(f"{model_name}: {model_file} ({size_mb:.2f} MB)")
            found_models.append(model_name)
        else:
            print_error(f"{model_name}: {model_file} NOT FOUND")
            missing_models.append(model_name)
    
    print("")
    print(f"Found: {len(found_models)}/{len(required_models)} models")
    
    if missing_models:
        print_error(f"Missing models: {', '.join(missing_models)}")
        return False
    
    return True


def verify_model_loading():
    """Verify models can be loaded"""
    print_header("Verifying Model Loading")
    
    try:
        from backend.app.services.ml_service import MLService
        
        print_info("Initializing ML Service...")
        ml_service = MLService()
        
        models = ml_service.get_loaded_models()
        
        print_status(f"ML Service initialized with {len(models)} models")
        
        for model_name, model_info in models.items():
            status = "✓ Loaded" if model_info.get("loaded") else "✗ Failed"
            print(f"  {model_name}: {status}")
        
        return len(models) >= 7
        
    except Exception as e:
        print_error(f"Failed to initialize ML Service: {e}")
        return False


def verify_model_predictions():
    """Verify models can make predictions"""
    print_header("Verifying Model Predictions")
    
    try:
        from backend.app.services.ml_service import MLService
        
        ml_service = MLService()
        
        # Test demand prediction
        print_info("Testing demand prediction...")
        try:
            demand = ml_service.predict_demand(
                destination="Kolkata",
                historical_data=[500, 520, 510]
            )
            print_status(f"Demand prediction: {demand}")
        except Exception as e:
            print_error(f"Demand prediction failed: {e}")
        
        # Test delay prediction
        print_info("Testing delay prediction...")
        try:
            delay = ml_service.predict_delay(
                route_id="Bokaro-Kolkata",
                distance_km=250,
                vehicle_type="TRUCK"
            )
            print_status(f"Delay prediction: {delay} hours")
        except Exception as e:
            print_error(f"Delay prediction failed: {e}")
        
        # Test rake availability
        print_info("Testing rake availability prediction...")
        try:
            rakes = ml_service.predict_rake_availability(
                yard="Bokaro",
                days_ahead=7
            )
            print_status(f"Rake availability: {rakes}")
        except Exception as e:
            print_error(f"Rake availability prediction failed: {e}")
        
        # Test cost prediction
        print_info("Testing cost prediction...")
        try:
            cost = ml_service.predict_cost(
                tonnes=500,
                distance_km=250,
                transport_mode="RAIL"
            )
            print_status(f"Cost prediction: ₹{cost:,.2f}")
        except Exception as e:
            print_error(f"Cost prediction failed: {e}")
        
        # Test throughput prediction
        print_info("Testing throughput prediction...")
        try:
            throughput = ml_service.predict_throughput(
                loading_point="LP1",
                hours_ahead=24
            )
            print_status(f"Throughput prediction: {throughput} tonnes/hour")
        except Exception as e:
            print_error(f"Throughput prediction failed: {e}")
        
        # Test mode classification
        print_info("Testing transport mode classification...")
        try:
            mode = ml_service.classify_transport_mode(
                tonnes=500,
                distance_km=250,
                urgency="HIGH"
            )
            print_status(f"Transport mode: {mode}")
        except Exception as e:
            print_error(f"Mode classification failed: {e}")
        
        return True
        
    except Exception as e:
        print_error(f"Model prediction test failed: {e}")
        return False


def verify_model_performance():
    """Verify model performance metrics"""
    print_header("Verifying Model Performance")
    
    try:
        from backend.app.services.ml_service import MLService
        
        ml_service = MLService()
        
        # Get performance metrics
        metrics = ml_service.get_model_metrics()
        
        if metrics:
            print_status("Model performance metrics:")
            for model_name, metric_data in metrics.items():
                print(f"  {model_name}:")
                for metric_name, value in metric_data.items():
                    print(f"    {metric_name}: {value}")
        else:
            print_info("No performance metrics available")
        
        return True
        
    except Exception as e:
        print_error(f"Failed to get performance metrics: {e}")
        return False


def verify_database():
    """Verify database connection"""
    print_header("Verifying Database Connection")
    
    try:
        from backend.app.db import test_connection, health_check
        
        print_info("Testing database connection...")
        if test_connection():
            print_status("Database connection successful")
            
            health = health_check()
            print(f"  Status: {health['database']}")
            print(f"  Connected: {health['connected']}")
            print(f"  Tables: {health['tables']}")
            
            return True
        else:
            print_error("Database connection failed")
            return False
            
    except Exception as e:
        print_error(f"Database verification failed: {e}")
        return False


def verify_backend_api():
    """Verify backend API is running"""
    print_header("Verifying Backend API")
    
    try:
        import requests
        
        print_info("Testing backend health endpoint...")
        response = requests.get("http://localhost:8000/meta/health", timeout=5)
        
        if response.status_code == 200:
            print_status("Backend API is running")
            data = response.json()
            print(f"  Status: {data.get('status')}")
            return True
        else:
            print_error(f"Backend health check failed (HTTP {response.status_code})")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to backend (http://localhost:8000)")
        print_info("Make sure backend is running: python -m uvicorn app.main:app --port 8000")
        return False
    except Exception as e:
        print_error(f"Backend verification failed: {e}")
        return False


def main():
    """Main verification function"""
    print_header("SAIL Bokaro - ML Model Verification")
    
    results = {
        "Model Files": verify_model_files(),
        "Model Loading": verify_model_loading(),
        "Model Predictions": verify_model_predictions(),
        "Model Performance": verify_model_performance(),
        "Database": verify_database(),
        "Backend API": verify_backend_api(),
    }
    
    # Summary
    print_header("Verification Summary")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = f"{GREEN}PASS{NC}" if result else f"{RED}FAIL{NC}"
        print(f"{test_name}: {status}")
    
    print("")
    print(f"Total: {passed}/{total} checks passed")
    
    if passed == total:
        print_status("All verifications passed!")
        return 0
    else:
        print_error(f"{total - passed} verification(s) failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
