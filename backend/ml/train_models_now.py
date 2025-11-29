#!/usr/bin/env python3
"""
Quick script to train all 17 ML models
Run: python backend/ml/train_models_now.py
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from backend.ml.train_all_models import train_all_models

if __name__ == "__main__":
    print("\n" + "="*80)
    print("TRAINING ALL 17 ML MODELS")
    print("="*80 + "\n")
    
    success = train_all_models()
    
    if success:
        print("\n" + "="*80)
        print("✅ ALL MODELS TRAINED SUCCESSFULLY!")
        print("="*80)
        print("\nModels are ready for predictions!")
        print("Location: backend/ml/models/")
    else:
        print("\n" + "="*80)
        print("❌ TRAINING FAILED")
        print("="*80)
        sys.exit(1)
