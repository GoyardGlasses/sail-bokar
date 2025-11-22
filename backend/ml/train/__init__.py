"""
ML Training Module
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.

This module contains training scripts for all 7 ML models:
1. train_demand.py - Demand Forecasting
2. train_rake_availability.py - Rake Availability Forecasting
3. train_delay.py - Route Delay Prediction
4. train_throughput.py - Loading Point Throughput Prediction
5. train_cost.py - Cost Prediction
6. train_anomaly.py - Anomaly Detection
7. train_mode_classifier.py - Road-vs-Rail Mode Classifier

Usage:
    python train_demand.py
    python train_all.py  # Train all models
"""

__version__ = "1.0.0"
__author__ = "SAIL Bokaro AI Team"

print(f"ML Training Module v{__version__} loaded")
