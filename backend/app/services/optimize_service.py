"""
Optimization Service - Integration layer for ML inference and OR-Tools solver.
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.
"""

import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

from .inference_service import inference_service
from ..optimizer.solver import RakeFormationOptimizer
from ..config import settings
from ..utils import app_logger

logger = logging.getLogger(__name__)

class OptimizeService:
    """Service for optimization - ML inference + OR-Tools solver."""
    
    def __init__(self):
        """Initialize optimization service."""
        self.optimizer = RakeFormationOptimizer(
            time_limit_seconds=settings.OPTIMIZER_TIME_LIMIT,
            random_seed=settings.OPTIMIZER_RANDOM_SEED
        )
        self.logs_dir = Path(settings.LOGS_DIR) / "optimize_runs"
        self.logs_dir.mkdir(parents=True, exist_ok=True)
    
    def build_optimizer_input(self, request_json: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build optimizer input by calling ML inference functions.
        
        Args:
            request_json: Request JSON with orders, inventory, available resources
        
        Returns:
            Optimizer input JSON with ML predictions
        """
        app_logger.info("Building optimizer input with ML predictions...")
        
        orders = request_json.get('orders', [])
        available_rakes = request_json.get('available_rakes', 5)
        available_trucks = request_json.get('available_trucks', 20)
        inventory = request_json.get('inventory', {})
        
        # Get ML predictions
        ml_predictions = self._get_ml_predictions(orders, available_rakes)
        
        # Build cost parameters
        cost_params = self._build_cost_parameters(orders)
        
        # Aggregate into optimizer input
        optimizer_input = {
            'orders': orders,
            'available_rakes': available_rakes,
            'available_trucks': available_trucks,
            'inventory': inventory,
            'ml_predictions': ml_predictions,
            'cost_parameters': cost_params,
            'timestamp': datetime.utcnow().isoformat(),
        }
        
        return optimizer_input
    
    def _get_ml_predictions(self, orders: List[Dict], available_rakes: int) -> Dict[str, Any]:
        """Get ML predictions for all relevant inputs."""
        predictions = {}
        
        # Predict demand for each unique material-destination pair
        material_dest_pairs = set()
        for order in orders:
            material_dest_pairs.add((
                order.get('material_type', 'HR_Coils'),
                order.get('destination', 'Kolkata')
            ))
        
        for material, destination in material_dest_pairs:
            key = f'demand_{material}_{destination}'
            result = inference_service.predict_demand_forecast(
                material, destination, 1000, 'MEDIUM'
            )
            predictions[key] = result.get('predicted_demand_tonnes', 1000)
        
        # Predict rake availability
        date = datetime.utcnow().strftime('%Y-%m-%d')
        result = inference_service.predict_available_rakes(date)
        predictions['available_rakes_pred'] = result.get('predicted_available_rakes', available_rakes)
        
        # Predict throughput for each loading point
        for lp in settings.LOADING_POINTS:
            result = inference_service.predict_loading_throughput(lp, 'HR_Coils', 5, 'Morning')
            predictions[f'throughput_{lp}'] = result.get('predicted_throughput_tph', 400)
        
        # Predict delay for each route
        for destination in settings.DESTINATIONS:
            result = inference_service.predict_route_delay(
                f'Bokaro-{destination}', 1000, 'HR_Coils', 'Clear'
            )
            predictions[f'delay_{destination}'] = result.get('predicted_delay_hours', 2.0)
        
        # Predict cost for representative shipments
        for destination in settings.DESTINATIONS:
            result = inference_service.predict_dispatch_cost(
                f'Bokaro-{destination}', 1000, 2.0, 'HR_Coils'
            )
            predictions[f'cost_{destination}'] = result.get('predicted_cost_rs', 500000)
        
        # Predict mode for each order
        for i, order in enumerate(orders):
            result = inference_service.predict_optimal_mode(
                order.get('quantity_tonnes', 500),
                200,  # Default distance
                order.get('priority', 'MEDIUM'),
                order.get('destination', 'Kolkata'),
                order.get('material_type', 'HR_Coils')
            )
            predictions[f'mode_order_{i}'] = result.get('recommended_mode', 'RAIL')
        
        # Add default predictions for rake/truck delays
        predictions['demurrage_hours'] = 0.5
        for i in range(20):
            predictions[f'delay_RAKE_{i+1:03d}'] = 2.0
            predictions[f'delay_TRUCK_{i+1:03d}'] = 1.5
        
        return predictions
    
    def _build_cost_parameters(self, orders: List[Dict]) -> Dict[str, Any]:
        """Build cost parameters for optimizer."""
        cost_params = {
            'freight_rate_per_tonne': 500,
            'demurrage_rate_per_wagon_per_hour': 100,
            'truck_cost_per_km_per_tonne': 30,
            'delay_penalty_per_hour': 1000,
            'planning_datetime': datetime.utcnow().isoformat(),
            'sla_penalty_per_tonne_hour': 100,
            'sla_tight_window_hours': 24,
            'sla_priority_weight_high': 2.0,
            'sla_priority_weight_medium': 1.0,
            'sla_priority_weight_low': 0.5,
            'mode_mismatch_penalty_per_tonne': 50,
        }
        
        # Add distance for each destination
        for destination in settings.DESTINATIONS:
            cost_params[f'distance_{destination}'] = {
                'Kolkata': 250,
                'Patna': 300,
                'Ranchi': 150,
                'Durgapur': 100,
                'Haldia': 280,
            }.get(destination, 200)
        
        return cost_params
    
    def run_optimizer(self, optimizer_input: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run the OR-Tools optimizer.
        
        Args:
            optimizer_input: Input JSON with orders and ML predictions
        
        Returns:
            Optimized dispatch plan
        """
        run_id = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        
        try:
            app_logger.info(f"Running optimizer (run_id={run_id})...")
            
            # Solve
            solution = self.optimizer.solve(optimizer_input)
            
            # Log run
            self._log_optimization_run(run_id, optimizer_input, solution)
            
            app_logger.info(f"Optimization complete. Status: {solution.get('solver_status')}")
            
            return solution
        
        except Exception as e:
            app_logger.error(f"Optimization error: {str(e)}")
            raise
    
    def _log_optimization_run(
        self,
        run_id: str,
        input_data: Dict[str, Any],
        solution: Dict[str, Any]
    ) -> None:
        """Log optimization run details."""
        log_entry = {
            'run_id': run_id,
            'timestamp': datetime.utcnow().isoformat(),
            'input_summary': {
                'num_orders': len(input_data.get('orders', [])),
                'available_rakes': input_data.get('available_rakes', 0),
                'available_trucks': input_data.get('available_trucks', 0),
            },
            'solution_summary': {
                'total_rakes': solution.get('summary', {}).get('total_rakes', 0),
                'total_trucks': solution.get('summary', {}).get('total_trucks', 0),
                'total_cost': solution.get('summary', {}).get('total_cost', 0),
                'total_tonnage': solution.get('summary', {}).get('total_tonnage', 0),
            },
            'solver_status': solution.get('solver_status', 'UNKNOWN'),
            'solver_time_seconds': solution.get('solver_time_seconds', 0),
            'objective_value': solution.get('objective_value', 0),
        }
        
        log_file = self.logs_dir / f"{run_id}.json"
        with open(log_file, 'w') as f:
            json.dump(log_entry, f, indent=2)
        
        app_logger.info(f"Optimization run logged to {log_file}")

# Global optimize service instance
optimize_service = OptimizeService()
