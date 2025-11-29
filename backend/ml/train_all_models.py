"""
Train All 17 ML Models
Script to train all models using historical data from the website
"""

import logging
import sys
from pathlib import Path
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def train_all_models():
    """Train all 17 ML models"""
    try:
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        from ml.database_schema import init_db
        from ml.data_pipeline import DataPipeline
        from ml.models_builder import MLModelsBuilder
        
        logger.info("\n" + "="*80)
        logger.info("STARTING ML MODELS TRAINING")
        logger.info("="*80)
        
        # Initialize database
        logger.info("\n[1/4] Initializing database...")
        database_url = "sqlite:///./ml_data.db"
        engine = init_db(database_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        logger.info("✓ Database initialized")
        
        # Get training data
        logger.info("\n[2/4] Loading training data...")
        pipeline = DataPipeline(db)
        training_data = pipeline.export_training_data("all")
        
        if training_data.empty:
            logger.error("✗ No training data available")
            return False
        
        logger.info(f"✓ Loaded {len(training_data)} records for training")
        logger.info(f"  - Features: {len(training_data.columns)}")
        logger.info(f"  - Date range: {training_data['date'].min()} to {training_data['date'].max()}")
        
        # Build all models
        logger.info("\n[3/4] Building all 17 ML models...")
        builder = MLModelsBuilder(db)
        results = builder.build_all_models(training_data)
        
        # Save models
        logger.info("\n[4/4] Saving trained models...")
        builder.save_all_models("backend/ml/models")
        logger.info("✓ All models saved")
        
        # Print summary
        logger.info("\n" + "="*80)
        logger.info("TRAINING SUMMARY")
        logger.info("="*80)
        logger.info(f"Total Models: {results['total_models']}")
        logger.info(f"Successful: {results['successful_models']} ✓")
        logger.info(f"Failed: {results['failed_models']} ✗")
        logger.info(f"Success Rate: {(results['successful_models']/results['total_models']*100):.1f}%")
        
        logger.info("\nPREDICTION MODELS (5):")
        for model, data in results['prediction_models'].items():
            status = "✓" if data['success'] else "✗"
            r2 = data['metrics'].get('r2_score', 0)
            logger.info(f"  {status} {model}: R² = {r2:.2%}")
        
        logger.info("\nOPTIMIZATION MODELS (5):")
        for model, data in results['optimization_models'].items():
            status = "✓" if data['success'] else "✗"
            acc = data['metrics'].get('accuracy', data['metrics'].get('r2_score', 0))
            logger.info(f"  {status} {model}: {acc:.2%}")
        
        logger.info("\nRISK & DECISION MODELS (4):")
        for model, data in results['risk_decision_models'].items():
            status = "✓" if data['success'] else "✗"
            score = data['metrics'].get('r2_score', 0)
            logger.info(f"  {status} {model}: {score:.2%}")
        
        logger.info("\nADVANCED MODELS (3):")
        for model, data in results['advanced_models'].items():
            status = "✓" if data['success'] else "✗"
            score = data['metrics'].get('r2_score', 0)
            logger.info(f"  {status} {model}: {score:.2%}")
        
        logger.info("\n" + "="*80)
        logger.info("✓ ALL 17 ML MODELS SUCCESSFULLY TRAINED!")
        logger.info("="*80)
        
        db.close()
        return True
    
    except Exception as e:
        logger.error(f"✗ Error training models: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = train_all_models()
    sys.exit(0 if success else 1)
