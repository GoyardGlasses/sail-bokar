"""
Automated ML Model Training Scheduler
Trains all 17 ML models daily at specified time
Monitors model performance and retrains on demand

Features:
- Daily automated training at 2 AM (configurable)
- Performance monitoring and alerts
- Automatic retraining if accuracy drops
- Model versioning and rollback capability
- Training history and logs
"""

import logging
import asyncio
import json
from datetime import datetime, time, timedelta
from pathlib import Path
from typing import Dict, List, Optional
import threading
import schedule
import pickle
import hashlib

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backend/ml/logs/training_scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURATION
# ============================================================================

TRAINING_CONFIG = {
    'DAILY_TRAINING_TIME': '02:00',  # 2 AM daily
    'PERFORMANCE_CHECK_INTERVAL': 3600,  # Check every hour
    'MIN_ACCURACY_THRESHOLD': 0.70,  # Retrain if accuracy drops below 70%
    'MAX_RETRAIN_ATTEMPTS': 3,
    'MODEL_VERSIONING': True,
    'BACKUP_MODELS': True,
    'MODELS_DIR': Path('backend/ml/models'),
    'LOGS_DIR': Path('backend/ml/logs'),
    'HISTORY_FILE': Path('backend/ml/logs/training_history.json'),
}

# Ensure directories exist
TRAINING_CONFIG['MODELS_DIR'].mkdir(parents=True, exist_ok=True)
TRAINING_CONFIG['LOGS_DIR'].mkdir(parents=True, exist_ok=True)

# ============================================================================
# TRAINING HISTORY MANAGER
# ============================================================================

class TrainingHistoryManager:
    """Manages training history and model versions"""
    
    def __init__(self, history_file: Path):
        self.history_file = history_file
        self.history = self._load_history()
    
    def _load_history(self) -> Dict:
        """Load training history from file"""
        if self.history_file.exists():
            try:
                with open(self.history_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading history: {e}")
                return {'trainings': [], 'model_versions': {}}
        return {'trainings': [], 'model_versions': {}}
    
    def _save_history(self):
        """Save training history to file"""
        try:
            with open(self.history_file, 'w') as f:
                json.dump(self.history, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error saving history: {e}")
    
    def add_training_record(self, training_data: Dict):
        """Add a training record"""
        record = {
            'timestamp': datetime.now().isoformat(),
            'status': training_data.get('status'),
            'models_trained': training_data.get('models_trained', 0),
            'successful_models': training_data.get('successful_models', 0),
            'failed_models': training_data.get('failed_models', 0),
            'avg_accuracy': training_data.get('avg_accuracy', 0),
            'duration_seconds': training_data.get('duration_seconds', 0),
            'errors': training_data.get('errors', []),
        }
        self.history['trainings'].append(record)
        self._save_history()
        return record
    
    def add_model_version(self, model_name: str, version_info: Dict):
        """Add model version info"""
        if model_name not in self.history['model_versions']:
            self.history['model_versions'][model_name] = []
        
        version_info['timestamp'] = datetime.now().isoformat()
        self.history['model_versions'][model_name].append(version_info)
        self._save_history()
    
    def get_latest_training(self) -> Optional[Dict]:
        """Get latest training record"""
        if self.history['trainings']:
            return self.history['trainings'][-1]
        return None
    
    def get_model_versions(self, model_name: str) -> List[Dict]:
        """Get all versions of a model"""
        return self.history['model_versions'].get(model_name, [])
    
    def get_training_stats(self) -> Dict:
        """Get training statistics"""
        trainings = self.history['trainings']
        if not trainings:
            return {}
        
        successful = sum(1 for t in trainings if t['status'] == 'success')
        total_models_trained = sum(t.get('models_trained', 0) for t in trainings)
        avg_accuracy = sum(t.get('avg_accuracy', 0) for t in trainings) / len(trainings)
        
        return {
            'total_trainings': len(trainings),
            'successful_trainings': successful,
            'success_rate': successful / len(trainings) * 100,
            'total_models_trained': total_models_trained,
            'avg_accuracy': avg_accuracy,
            'last_training': trainings[-1]['timestamp'] if trainings else None,
        }

# ============================================================================
# MODEL TRAINER
# ============================================================================

class AutomatedModelTrainer:
    """Handles automated model training"""
    
    def __init__(self):
        self.history_manager = TrainingHistoryManager(TRAINING_CONFIG['HISTORY_FILE'])
        self.is_training = False
        self.last_training_time = None
    
    def train_all_models(self) -> Dict:
        """Train all 17 ML models"""
        if self.is_training:
            logger.warning("Training already in progress, skipping...")
            return {'status': 'skipped', 'reason': 'Training already in progress'}
        
        self.is_training = True
        start_time = datetime.now()
        logger.info("\n" + "="*80)
        logger.info("STARTING AUTOMATED DAILY TRAINING")
        logger.info("="*80)
        
        try:
            # Import here to avoid circular imports
            from ml.models_builder import MLModelsBuilder
            from ml.data_pipeline import DataPipeline
            from sqlalchemy import create_engine
            from sqlalchemy.orm import sessionmaker
            
            # Setup database
            database_url = "sqlite:///./ml_data.db"
            engine = create_engine(database_url)
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
            db = SessionLocal()
            
            # Get training data
            logger.info("[1/3] Loading training data...")
            pipeline = DataPipeline(db)
            training_data = pipeline.export_training_data("all")
            
            if training_data.empty:
                logger.error("No training data available")
                return {'status': 'failed', 'reason': 'No training data'}
            
            logger.info(f"Loaded {len(training_data)} records")
            
            # Train models
            logger.info("[2/3] Training all 17 models...")
            builder = MLModelsBuilder(db)
            results = builder.build_all_models(training_data)
            
            # Save models
            logger.info("[3/3] Saving trained models...")
            builder.save_all_models(str(TRAINING_CONFIG['MODELS_DIR']))
            
            # Create backup if configured
            if TRAINING_CONFIG['BACKUP_MODELS']:
                self._backup_models()
            
            # Calculate duration
            duration = (datetime.now() - start_time).total_seconds()
            
            # Prepare response
            response = {
                'status': 'success',
                'timestamp': start_time.isoformat(),
                'duration_seconds': duration,
                'models_trained': results.get('total_models', 0),
                'successful_models': results.get('successful_models', 0),
                'failed_models': results.get('failed_models', 0),
                'avg_accuracy': self._calculate_avg_accuracy(results),
                'model_details': results,
            }
            
            # Save to history
            self.history_manager.add_training_record(response)
            self.last_training_time = start_time
            
            logger.info("\n" + "="*80)
            logger.info(f"✓ TRAINING COMPLETED SUCCESSFULLY")
            logger.info(f"  Duration: {duration:.1f} seconds")
            logger.info(f"  Models: {results.get('successful_models', 0)}/{results.get('total_models', 0)} successful")
            logger.info(f"  Avg Accuracy: {response['avg_accuracy']:.2%}")
            logger.info("="*80 + "\n")
            
            db.close()
            return response
            
        except Exception as e:
            logger.error(f"Training failed: {e}", exc_info=True)
            duration = (datetime.now() - start_time).total_seconds()
            
            response = {
                'status': 'failed',
                'timestamp': start_time.isoformat(),
                'duration_seconds': duration,
                'error': str(e),
            }
            
            self.history_manager.add_training_record(response)
            return response
        
        finally:
            self.is_training = False
    
    def _calculate_avg_accuracy(self, results: Dict) -> float:
        """Calculate average accuracy from results"""
        accuracies = []
        
        for category in ['prediction_models', 'optimization_models', 'risk_decision_models', 'advanced_models']:
            models = results.get(category, {})
            for model_data in models.values():
                metrics = model_data.get('metrics', {})
                acc = metrics.get('accuracy', metrics.get('r2_score', 0))
                if acc:
                    accuracies.append(acc)
        
        return sum(accuracies) / len(accuracies) if accuracies else 0
    
    def _backup_models(self):
        """Backup current models"""
        try:
            backup_dir = TRAINING_CONFIG['MODELS_DIR'] / f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            backup_dir.mkdir(parents=True, exist_ok=True)
            
            for model_file in TRAINING_CONFIG['MODELS_DIR'].glob('*.pkl'):
                if model_file.is_file():
                    import shutil
                    shutil.copy2(model_file, backup_dir / model_file.name)
            
            logger.info(f"✓ Models backed up to {backup_dir}")
        except Exception as e:
            logger.error(f"Backup failed: {e}")
    
    def check_model_performance(self) -> Dict:
        """Check if models need retraining"""
        latest_training = self.history_manager.get_latest_training()
        
        if not latest_training:
            return {'needs_retraining': False, 'reason': 'No previous training'}
        
        avg_accuracy = latest_training.get('avg_accuracy', 0)
        
        if avg_accuracy < TRAINING_CONFIG['MIN_ACCURACY_THRESHOLD']:
            logger.warning(f"⚠️  Model accuracy below threshold: {avg_accuracy:.2%}")
            return {
                'needs_retraining': True,
                'reason': f'Accuracy below threshold: {avg_accuracy:.2%}',
                'current_accuracy': avg_accuracy,
                'threshold': TRAINING_CONFIG['MIN_ACCURACY_THRESHOLD'],
            }
        
        return {'needs_retraining': False, 'reason': 'Performance acceptable'}
    
    def get_training_status(self) -> Dict:
        """Get current training status"""
        return {
            'is_training': self.is_training,
            'last_training_time': self.last_training_time.isoformat() if self.last_training_time else None,
            'stats': self.history_manager.get_training_stats(),
        }

# ============================================================================
# SCHEDULER
# ============================================================================

class TrainingScheduler:
    """Manages training schedule"""
    
    def __init__(self):
        self.trainer = AutomatedModelTrainer()
        self.scheduler = schedule.Scheduler()
        self._setup_schedule()
    
    def _setup_schedule(self):
        """Setup training schedule"""
        training_time = TRAINING_CONFIG['DAILY_TRAINING_TIME']
        
        # Schedule daily training
        self.scheduler.every().day.at(training_time).do(self._daily_training_job)
        logger.info(f"✓ Scheduled daily training at {training_time}")
        
        # Schedule performance checks every hour
        self.scheduler.every().hour.do(self._performance_check_job)
        logger.info("✓ Scheduled hourly performance checks")
    
    def _daily_training_job(self):
        """Daily training job"""
        logger.info("🔄 Starting scheduled daily training...")
        result = self.trainer.train_all_models()
        
        if result['status'] == 'success':
            logger.info("✅ Daily training completed successfully")
        else:
            logger.error(f"❌ Daily training failed: {result.get('error')}")
    
    def _performance_check_job(self):
        """Performance check job"""
        check_result = self.trainer.check_model_performance()
        
        if check_result['needs_retraining']:
            logger.warning(f"⚠️  Performance check triggered retraining: {check_result['reason']}")
            self.trainer.train_all_models()
    
    def start(self):
        """Start the scheduler in a background thread"""
        def run_scheduler():
            logger.info("🚀 Training scheduler started")
            while True:
                self.scheduler.run_pending()
                asyncio.sleep(60)  # Check every minute
        
        thread = threading.Thread(target=run_scheduler, daemon=True)
        thread.start()
        logger.info("✓ Scheduler running in background thread")
    
    def get_status(self) -> Dict:
        """Get scheduler status"""
        return {
            'scheduler_active': True,
            'training_time': TRAINING_CONFIG['DAILY_TRAINING_TIME'],
            'trainer_status': self.trainer.get_training_status(),
            'next_run': str(self.scheduler.next_run) if self.scheduler.jobs else None,
        }

# ============================================================================
# GLOBAL SCHEDULER INSTANCE
# ============================================================================

_scheduler_instance = None

def get_scheduler() -> TrainingScheduler:
    """Get or create scheduler instance"""
    global _scheduler_instance
    if _scheduler_instance is None:
        _scheduler_instance = TrainingScheduler()
    return _scheduler_instance

def start_scheduler():
    """Start the training scheduler"""
    scheduler = get_scheduler()
    scheduler.start()

# ============================================================================
# MANUAL TRAINING ENDPOINT
# ============================================================================

def trigger_manual_training() -> Dict:
    """Manually trigger training"""
    scheduler = get_scheduler()
    logger.info("📌 Manual training triggered")
    return scheduler.trainer.train_all_models()

def get_scheduler_status() -> Dict:
    """Get scheduler status"""
    scheduler = get_scheduler()
    return scheduler.get_status()

def get_training_history() -> Dict:
    """Get training history"""
    scheduler = get_scheduler()
    return {
        'history': scheduler.trainer.history_manager.history,
        'stats': scheduler.trainer.history_manager.get_training_stats(),
    }

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    logger.info("Starting ML Training Scheduler...")
    start_scheduler()
    
    # Keep running
    try:
        while True:
            asyncio.sleep(1)
    except KeyboardInterrupt:
        logger.info("Scheduler stopped")
