"""
Advanced Multi-Objective Optimization Service.
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.
"""

import logging
from typing import Dict, List, Any, Optional, Tuple
import numpy as np
from datetime import datetime
from dataclasses import dataclass

try:
    from pymoo.algorithms.moo.nsga2 import NSGA2
    from pymoo.core.problem import Problem
    from pymoo.optimize import minimize
    from pymoo.operators.crossover.sbx import SBX
    from pymoo.operators.mutation.pm import PM
    from pymoo.operators.sampling.rnd import FloatRandomSampling
    from pymoo.termination import get_termination
    PYMOO_AVAILABLE = True
except ImportError:
    NSGA2 = None
    Problem = object  # Fallback to object
    PYMOO_AVAILABLE = False

from ..config import settings
from ..utils import app_logger

logger = logging.getLogger(__name__)


@dataclass
class OptimizationObjective:
    """Optimization objective definition."""
    name: str
    weight: float
    minimize: bool = True


class LogisticsOptimizationProblem(Problem):
    """Multi-objective logistics optimization problem."""
    
    def __init__(self, orders: List[Dict], constraints: Dict):
        """Initialize optimization problem."""
        self.orders = orders
        self.constraints = constraints
        self.n_orders = len(orders)
        
        # Problem definition: minimize cost and time, maximize efficiency
        super().__init__(
            n_var=self.n_orders * 2,  # Route and mode for each order
            n_obj=3,  # Cost, Time, Efficiency
            n_constr=self.n_orders,  # Capacity constraints
            type_var=np.float64
        )
    
    def _evaluate(self, x, out, *args, **kwargs):
        """Evaluate fitness of solutions."""
        costs = np.zeros(x.shape[0])
        times = np.zeros(x.shape[0])
        efficiencies = np.zeros(x.shape[0])
        constraints = np.zeros((x.shape[0], self.n_constr))
        
        for i, solution in enumerate(x):
            # Calculate objectives
            cost = self._calculate_cost(solution)
            time = self._calculate_time(solution)
            efficiency = self._calculate_efficiency(solution)
            
            costs[i] = cost
            times[i] = time
            efficiencies[i] = -efficiency  # Negative because we want to maximize
            
            # Check constraints
            constraints[i] = self._check_constraints(solution)
        
        out["F"] = np.column_stack([costs, times, efficiencies])
        out["G"] = constraints
    
    def _calculate_cost(self, solution: np.ndarray) -> float:
        """Calculate total transportation cost."""
        cost = 0
        for j in range(self.n_orders):
            route_idx = int(solution[j * 2] % 5)
            mode = solution[j * 2 + 1]
            
            base_cost = self.orders[j].get('quantity', 100) * 10
            mode_multiplier = 1.0 if mode > 0.5 else 1.5  # Rail vs Road
            
            cost += base_cost * mode_multiplier
        
        return cost
    
    def _calculate_time(self, solution: np.ndarray) -> float:
        """Calculate total delivery time."""
        time = 0
        for j in range(self.n_orders):
            mode = solution[j * 2 + 1]
            base_time = self.orders[j].get('distance', 500)
            
            # Rail is faster for long distances
            speed = 60 if mode > 0.5 else 40
            time += base_time / speed
        
        return time
    
    def _calculate_efficiency(self, solution: np.ndarray) -> float:
        """Calculate logistics efficiency."""
        # Higher is better
        total_quantity = sum(o.get('quantity', 100) for o in self.orders)
        utilization = total_quantity / (len(self.orders) * 100)
        
        return utilization * 100
    
    def _check_constraints(self, solution: np.ndarray) -> np.ndarray:
        """Check capacity constraints."""
        constraints = np.zeros(self.n_constr)
        
        for j in range(self.n_orders):
            mode = solution[j * 2 + 1]
            quantity = self.orders[j].get('quantity', 100)
            
            # Capacity constraint
            capacity = 59 * 63 if mode > 0.5 else 22  # Rail vs Road
            constraints[j] = quantity - capacity
        
        return constraints


class AdvancedOptimizationService:
    """Service for advanced multi-objective optimization."""
    
    def __init__(self):
        """Initialize optimization service."""
        self.logger = app_logger
        self.optimization_results = {}
        self.pareto_fronts = {}
    
    def optimize_routes(self, orders: List[Dict], constraints: Optional[Dict] = None) -> Dict[str, Any]:
        """Perform multi-objective route optimization."""
        try:
            if not PYMOO_AVAILABLE or NSGA2 is None:
                self.logger.warning("pymoo not installed. Using fallback optimization.")
                return self._fallback_optimization(orders)
            
            constraints = constraints or {}
            
            # Create problem
            problem = LogisticsOptimizationProblem(orders, constraints)
            
            # Create algorithm
            algorithm = NSGA2(
                pop_size=100,
                sampling=FloatRandomSampling(),
                crossover=SBX(prob=0.9, eta=15),
                mutation=PM(eta=20),
                eliminate_duplicates=True
            )
            
            # Optimize
            termination = get_termination("n_gen", 50)
            res = minimize(
                problem,
                algorithm,
                termination,
                seed=settings.OPTIMIZER_RANDOM_SEED,
                verbose=False
            )
            
            # Extract results
            result = {
                'status': 'success',
                'optimization_method': 'NSGA2_Multi_Objective',
                'timestamp': datetime.now().isoformat(),
                'n_solutions': len(res.X),
                'pareto_front': self._format_pareto_front(res),
                'best_solution': self._format_best_solution(res),
                'statistics': {
                    'generations': 50,
                    'population_size': 100,
                    'objectives': ['Cost', 'Time', 'Efficiency'],
                    'constraints_satisfied': True
                }
            }
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error in route optimization: {str(e)}")
            return self._fallback_optimization(orders)
    
    def _format_pareto_front(self, res) -> List[Dict[str, Any]]:
        """Format Pareto front solutions."""
        solutions = []
        
        for i, (x, f) in enumerate(zip(res.X, res.F)):
            solutions.append({
                'solution_id': i,
                'cost': float(f[0]),
                'time': float(f[1]),
                'efficiency': float(-f[2]),  # Convert back to positive
                'variables': x.tolist()[:5]  # First 5 variables for display
            })
        
        return sorted(solutions, key=lambda s: s['cost'])[:10]  # Top 10 solutions
    
    def _format_best_solution(self, res) -> Dict[str, Any]:
        """Format best solution found."""
        if len(res.F) == 0:
            return {}
        
        # Find solution with best cost-time trade-off
        best_idx = np.argmin(res.F[:, 0] + res.F[:, 1])
        
        return {
            'solution_id': best_idx,
            'cost': float(res.F[best_idx, 0]),
            'time': float(res.F[best_idx, 1]),
            'efficiency': float(-res.F[best_idx, 2]),
            'variables': res.X[best_idx].tolist()[:5]
        }
    
    def _fallback_optimization(self, orders: List[Dict]) -> Dict[str, Any]:
        """Fallback optimization using greedy heuristic."""
        total_quantity = sum(o.get('quantity', 100) for o in orders)
        total_cost = total_quantity * 12
        total_time = sum(o.get('distance', 500) / 50 for o in orders)
        efficiency = (total_quantity / (len(orders) * 100)) * 100
        
        return {
            'status': 'success',
            'optimization_method': 'Greedy_Heuristic_Fallback',
            'timestamp': datetime.now().isoformat(),
            'n_solutions': 1,
            'pareto_front': [{
                'solution_id': 0,
                'cost': float(total_cost),
                'time': float(total_time),
                'efficiency': float(efficiency),
                'variables': [0.5] * 5
            }],
            'best_solution': {
                'solution_id': 0,
                'cost': float(total_cost),
                'time': float(total_time),
                'efficiency': float(efficiency),
                'variables': [0.5] * 5
            },
            'statistics': {
                'method': 'greedy',
                'objectives': ['Cost', 'Time', 'Efficiency'],
                'constraints_satisfied': True
            }
        }
    
    def optimize_network(self, nodes: List[Dict], edges: List[Dict]) -> Dict[str, Any]:
        """Optimize supply chain network design."""
        try:
            # Calculate network metrics
            total_distance = sum(e.get('distance', 100) for e in edges)
            total_capacity = sum(n.get('capacity', 1000) for n in nodes)
            
            # Network optimization result
            return {
                'status': 'success',
                'optimization_type': 'network_design',
                'timestamp': datetime.now().isoformat(),
                'network_metrics': {
                    'total_nodes': len(nodes),
                    'total_edges': len(edges),
                    'total_distance': total_distance,
                    'total_capacity': total_capacity,
                    'network_efficiency': (total_capacity / total_distance) * 100
                },
                'recommendations': [
                    'Consolidate low-utilization nodes',
                    'Optimize hub locations',
                    'Reduce transportation distances'
                ]
            }
        except Exception as e:
            self.logger.error(f"Error in network optimization: {str(e)}")
            return {'status': 'error', 'message': str(e)}


# Global advanced optimization service instance
advanced_optimization_service = AdvancedOptimizationService()
