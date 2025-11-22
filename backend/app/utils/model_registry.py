"""
Model Registry - Model versioning and reload management.
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.
"""

import joblib
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ModelRegistry:
    """Registry for managing model versions and reloads."""
    
    def __init__(self):
        """Initialize model registry."""
        self.models = {}
        self.versions = {}
        self.load_times = {}
        self.load_errors = {}
    
    def register_model(
        self,
        name: str,
        path: Path,
        version: str = "1.0.0"
    ) -> bool:
        """
        Register a model in the registry.
        
        Args:
            name: Model name
            path: Path to model file
            version: Model version
        
        Returns:
            True if successful, False otherwise
        """
        try:
            if not Path(path).exists():
                error_msg = f"Model file not found: {path}"
                self.load_errors[name] = error_msg
                logger.error(error_msg)
                return False
            
            model = joblib.load(path)
            self.models[name] = model
            self.versions[name] = version
            self.load_times[name] = datetime.utcnow().isoformat()
            
            # Clear any previous errors
            if name in self.load_errors:
                del self.load_errors[name]
            
            logger.info(f"✅ Registered model '{name}' v{version} from {path}")
            return True
        
        except Exception as e:
            error_msg = f"Failed to register model '{name}': {str(e)}"
            self.load_errors[name] = error_msg
            logger.error(error_msg)
            return False
    
    def load_model(self, name: str) -> Optional[Any]:
        """
        Load a model from registry.
        
        Args:
            name: Model name
        
        Returns:
            Model object or None if not found
        """
        if name not in self.models:
            logger.warning(f"Model '{name}' not found in registry")
            return None
        
        return self.models[name]
    
    def reload_models(self, model_paths: Dict[str, Path]) -> Dict[str, bool]:
        """
        Reload all models safely (swap-on-success).
        
        Args:
            model_paths: Dictionary of model_name -> path
        
        Returns:
            Dictionary of model_name -> success status
        """
        logger.info("Starting model reload...")
        
        results = {}
        old_models = self.models.copy()
        
        try:
            for model_name, path in model_paths.items():
                success = self.register_model(model_name, path)
                results[model_name] = success
                
                if not success:
                    # Restore old model on failure
                    if model_name in old_models:
                        self.models[model_name] = old_models[model_name]
                        logger.warning(f"Restored previous version of '{model_name}'")
            
            logger.info(f"Model reload complete. Success: {sum(results.values())}/{len(results)}")
            return results
        
        except Exception as e:
            logger.error(f"Model reload failed: {str(e)}. Restoring previous models.")
            self.models = old_models
            return {name: False for name in model_paths.keys()}
    
    def get_status(self) -> Dict[str, Any]:
        """Get registry status."""
        return {
            'models_loaded': len(self.models),
            'models_failed': len(self.load_errors),
            'versions': self.versions,
            'load_times': self.load_times,
            'errors': self.load_errors
        }
    
    def is_model_loaded(self, name: str) -> bool:
        """Check if model is loaded."""
        return name in self.models
    
    def get_all_models(self) -> Dict[str, Any]:
        """Get all loaded models."""
        return self.models.copy()

# Global model registry instance
model_registry = ModelRegistry()
