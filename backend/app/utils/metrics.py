"""
Metrics collection - Prometheus-compatible metrics.
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.
"""

import time
from datetime import datetime
from typing import Dict, List, Any
from collections import defaultdict
import json

class MetricsCollector:
    """Simple metrics collector for monitoring."""
    
    def __init__(self):
        """Initialize metrics collector."""
        self.request_count = defaultdict(int)
        self.request_latencies = defaultdict(list)
        self.optimizer_runs = 0
        self.optimizer_successes = 0
        self.optimizer_failures = 0
        self.model_load_status = {}
        self.start_time = datetime.utcnow()
    
    def record_request(self, endpoint: str, latency_ms: float, status_code: int) -> None:
        """Record a request metric."""
        self.request_count[endpoint] += 1
        self.request_latencies[endpoint].append(latency_ms)
    
    def record_optimizer_run(self, success: bool) -> None:
        """Record optimizer run result."""
        self.optimizer_runs += 1
        if success:
            self.optimizer_successes += 1
        else:
            self.optimizer_failures += 1
    
    def set_model_status(self, model_name: str, loaded: bool, error: str = None) -> None:
        """Set model load status."""
        self.model_load_status[model_name] = {
            'loaded': loaded,
            'error': error,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get all metrics as dictionary."""
        metrics = {
            'timestamp': datetime.utcnow().isoformat(),
            'uptime_seconds': (datetime.utcnow() - self.start_time).total_seconds(),
            'requests': {},
            'optimizer': {
                'total_runs': self.optimizer_runs,
                'successes': self.optimizer_successes,
                'failures': self.optimizer_failures,
                'success_rate': (
                    self.optimizer_successes / max(1, self.optimizer_runs)
                ) * 100
            },
            'models': self.model_load_status
        }
        
        # Add request metrics
        for endpoint, latencies in self.request_latencies.items():
            if latencies:
                sorted_latencies = sorted(latencies)
                metrics['requests'][endpoint] = {
                    'count': self.request_count[endpoint],
                    'avg_latency_ms': sum(latencies) / len(latencies),
                    'p50_latency_ms': sorted_latencies[len(sorted_latencies) // 2],
                    'p99_latency_ms': sorted_latencies[int(len(sorted_latencies) * 0.99)],
                    'max_latency_ms': max(latencies)
                }
        
        return metrics
    
    def get_prometheus_metrics(self) -> str:
        """Get metrics in Prometheus text format."""
        lines = []
        
        # Request counts
        for endpoint, count in self.request_count.items():
            lines.append(f'request_count{{endpoint="{endpoint}"}} {count}')
        
        # Request latencies
        for endpoint, latencies in self.request_latencies.items():
            if latencies:
                avg = sum(latencies) / len(latencies)
                lines.append(f'request_latency_ms{{endpoint="{endpoint}",quantile="avg"}} {avg:.2f}')
        
        # Optimizer metrics
        lines.append(f'optimizer_total_runs {self.optimizer_runs}')
        lines.append(f'optimizer_successes {self.optimizer_successes}')
        lines.append(f'optimizer_failures {self.optimizer_failures}')
        
        # Model status
        for model_name, status in self.model_load_status.items():
            loaded = 1 if status['loaded'] else 0
            lines.append(f'model_loaded{{model="{model_name}"}} {loaded}')
        
        return '\n'.join(lines)
    
    def reset(self) -> None:
        """Reset metrics."""
        self.request_count.clear()
        self.request_latencies.clear()
        self.optimizer_runs = 0
        self.optimizer_successes = 0
        self.optimizer_failures = 0
        self.start_time = datetime.utcnow()

# Global metrics instance
metrics_collector = MetricsCollector()
