"""
Model Registry & A/B Testing Service - Phase 3 Feature 2
Model versioning, registry, and A/B testing
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from enum import Enum
import logging
import random

logger = logging.getLogger(__name__)

class ModelStatus(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"

class ABTestStatus(str, Enum):
    PLANNED = "planned"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class ModelVersion:
    """Model version object"""
    def __init__(self, model_name: str, version: str, accuracy: float, 
                 status: ModelStatus = ModelStatus.DEVELOPMENT):
        self.id = f"MODEL-{int(datetime.now().timestamp() * 1000)}"
        self.model_name = model_name
        self.version = version
        self.accuracy = accuracy
        self.status = status
        self.created_at = datetime.now()
        self.deployed_at = None
        self.metrics = {
            'accuracy': accuracy,
            'precision': random.uniform(0.7, 0.95),
            'recall': random.uniform(0.7, 0.95),
            'f1_score': random.uniform(0.7, 0.95)
        }
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'model_name': self.model_name,
            'version': self.version,
            'accuracy': self.accuracy,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'deployed_at': self.deployed_at.isoformat() if self.deployed_at else None,
            'metrics': self.metrics
        }

class ABTest:
    """A/B test object"""
    def __init__(self, test_id: str, model_name: str, version_a: str, 
                 version_b: str, traffic_split: float = 0.5):
        self.id = test_id
        self.model_name = model_name
        self.version_a = version_a
        self.version_b = version_b
        self.traffic_split = traffic_split  # % traffic to version B
        self.status = ABTestStatus.PLANNED
        self.created_at = datetime.now()
        self.started_at = None
        self.completed_at = None
        self.results = None
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'model_name': self.model_name,
            'version_a': self.version_a,
            'version_b': self.version_b,
            'traffic_split': self.traffic_split,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'results': self.results
        }

class ModelRegistryService:
    """Service for model registry and A/B testing"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.models = {}  # model_name -> [versions]
        self.ab_tests = {}
        self.production_models = {}  # model_name -> current_version
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize with default models"""
        default_models = [
            ('delay_prediction', '1.0', 0.82),
            ('cost_prediction', '1.0', 0.85),
            ('demand_forecast', '1.0', 0.80),
            ('route_optimization', '1.0', 0.78),
            ('risk_assessment', '1.0', 0.75)
        ]
        
        for model_name, version, accuracy in default_models:
            model_version = ModelVersion(model_name, version, accuracy, ModelStatus.PRODUCTION)
            model_version.deployed_at = datetime.now()
            
            self.models[model_name] = [model_version]
            self.production_models[model_name] = version
    
    def register_model(self, model_name: str, version: str, accuracy: float,
                      status: str = "development") -> ModelVersion:
        """Register a new model version"""
        try:
            status_enum = ModelStatus(status)
            model_version = ModelVersion(model_name, version, accuracy, status_enum)
            
            if model_name not in self.models:
                self.models[model_name] = []
            
            self.models[model_name].append(model_version)
            
            self.logger.info(f"✓ Registered model {model_name}:{version} (accuracy: {accuracy*100:.1f}%)")
            
            return model_version
        
        except Exception as e:
            self.logger.error(f"Error registering model: {e}")
            raise
    
    def promote_to_production(self, model_name: str, version: str) -> Dict:
        """Promote model version to production"""
        try:
            if model_name not in self.models:
                raise ValueError(f"Model {model_name} not found")
            
            # Find version
            model_version = None
            for v in self.models[model_name]:
                if v.version == version:
                    model_version = v
                    break
            
            if not model_version:
                raise ValueError(f"Version {version} not found")
            
            # Update status
            model_version.status = ModelStatus.PRODUCTION
            model_version.deployed_at = datetime.now()
            
            # Update production models
            self.production_models[model_name] = version
            
            self.logger.info(f"✓ Promoted {model_name}:{version} to production")
            
            return model_version.to_dict()
        
        except Exception as e:
            self.logger.error(f"Error promoting model: {e}")
            raise
    
    def create_ab_test(self, model_name: str, version_a: str, version_b: str,
                      traffic_split: float = 0.5) -> ABTest:
        """Create A/B test"""
        try:
            test_id = f"ABTEST-{int(datetime.now().timestamp())}"
            ab_test = ABTest(test_id, model_name, version_a, version_b, traffic_split)
            
            # Start test
            ab_test.status = ABTestStatus.RUNNING
            ab_test.started_at = datetime.now()
            
            # Simulate test results
            ab_test.results = {
                'version_a': {
                    'accuracy': random.uniform(0.75, 0.85),
                    'conversions': random.randint(800, 1000),
                    'avg_response_time': random.uniform(100, 200)
                },
                'version_b': {
                    'accuracy': random.uniform(0.78, 0.88),
                    'conversions': random.randint(800, 1000),
                    'avg_response_time': random.uniform(100, 200)
                }
            }
            
            # Complete test
            ab_test.status = ABTestStatus.COMPLETED
            ab_test.completed_at = datetime.now()
            
            self.ab_tests[test_id] = ab_test
            
            self.logger.info(f"✓ Created and completed A/B test {test_id}")
            
            return ab_test
        
        except Exception as e:
            self.logger.error(f"Error creating A/B test: {e}")
            raise
    
    def get_model_versions(self, model_name: str) -> List[Dict]:
        """Get all versions of a model"""
        if model_name not in self.models:
            return []
        
        return [v.to_dict() for v in self.models[model_name]]
    
    def get_production_models(self) -> Dict[str, Dict]:
        """Get all production models"""
        result = {}
        
        for model_name, version in self.production_models.items():
            for v in self.models.get(model_name, []):
                if v.version == version:
                    result[model_name] = v.to_dict()
                    break
        
        return result
    
    def get_ab_tests(self, status: Optional[str] = None, limit: int = 50) -> List[Dict]:
        """Get A/B tests"""
        tests = list(self.ab_tests.values())
        
        if status:
            tests = [t for t in tests if t.status == status]
        
        return [t.to_dict() for t in tests[-limit:]]
    
    def get_status(self) -> Dict:
        """Get model registry status"""
        total_versions = sum(len(v) for v in self.models.values())
        
        return {
            'status': 'running',
            'total_models': len(self.models),
            'total_versions': total_versions,
            'production_models': len(self.production_models),
            'ab_tests': len(self.ab_tests),
            'timestamp': datetime.now().isoformat()
        }
