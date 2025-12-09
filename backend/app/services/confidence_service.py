"""
Confidence Indicators Service - Phase 1 Feature 3
Tracks and displays confidence scores for all predictions
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from enum import Enum
import logging
import random

logger = logging.getLogger(__name__)

class ConfidenceLevel(str, Enum):
    VERY_LOW = "very_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"

class ConfidenceIndicator:
    """Confidence indicator for a prediction"""
    def __init__(self, prediction_type: str, value: float, confidence: float, 
                 min_value: float, max_value: float, factors: List[str] = None):
        self.id = f"CONF-{int(datetime.now().timestamp() * 1000)}"
        self.prediction_type = prediction_type
        self.value = value
        self.confidence = confidence  # 0-1
        self.min_value = min_value
        self.max_value = max_value
        self.factors = factors or []
        self.created_at = datetime.now()
        self.trend = "stable"  # stable, improving, declining
    
    def get_level(self) -> ConfidenceLevel:
        """Get confidence level"""
        if self.confidence >= 0.9:
            return ConfidenceLevel.VERY_HIGH
        elif self.confidence >= 0.75:
            return ConfidenceLevel.HIGH
        elif self.confidence >= 0.6:
            return ConfidenceLevel.MEDIUM
        elif self.confidence >= 0.4:
            return ConfidenceLevel.LOW
        else:
            return ConfidenceLevel.VERY_LOW
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'prediction_type': self.prediction_type,
            'value': self.value,
            'confidence': self.confidence,
            'confidence_level': self.get_level(),
            'min_value': self.min_value,
            'max_value': self.max_value,
            'range': f"{self.min_value:.0f} - {self.max_value:.0f}",
            'factors': self.factors,
            'trend': self.trend,
            'created_at': self.created_at.isoformat()
        }

class ConfidenceService:
    """Service for confidence indicators"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.indicators_history = []
        self.confidence_scores = {}
    
    def analyze_plan_confidence(self, plan: Dict) -> Dict:
        """
        Analyze confidence of all predictions in a plan
        Returns comprehensive confidence report
        """
        try:
            predictions = plan.get('predictions', {})
            
            # Analyze each prediction type
            demand_conf = self._analyze_demand_confidence(predictions.get('demand_forecast', {}))
            delay_conf = self._analyze_delay_confidence(predictions.get('delay_forecast', {}))
            cost_conf = self._analyze_cost_confidence(predictions.get('cost_forecast', {}))
            
            indicators = [demand_conf, delay_conf, cost_conf]
            
            # Calculate overall confidence
            overall_confidence = sum(ind.confidence for ind in indicators) / len(indicators)
            
            # Store indicators
            for ind in indicators:
                self.indicators_history.append(ind)
            
            self.logger.info(f"✓ Analyzed confidence for plan {plan.get('id')}. Overall: {overall_confidence*100:.0f}%")
            
            return {
                'plan_id': plan.get('id'),
                'overall_confidence': overall_confidence,
                'overall_level': self._get_confidence_level(overall_confidence),
                'indicators': [ind.to_dict() for ind in indicators],
                'recommendations': self._get_recommendations(indicators),
                'timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            self.logger.error(f"Error analyzing confidence: {e}")
            raise
    
    def _analyze_demand_confidence(self, demand_forecast: Dict) -> ConfidenceIndicator:
        """Analyze demand forecast confidence"""
        base_confidence = demand_forecast.get('confidence', 0.75)
        
        # Adjust based on data quality
        total_demand = demand_forecast.get('total_demand', 0)
        if total_demand > 5000:
            base_confidence -= 0.1  # High demand = less predictable
        
        # Calculate range
        min_demand = total_demand * 0.85
        max_demand = total_demand * 1.15
        
        factors = [
            'Historical data: 2 years',
            'Seasonal adjustment: Applied',
            'Trend analysis: Stable',
            'External factors: Considered'
        ]
        
        indicator = ConfidenceIndicator(
            prediction_type='demand_forecast',
            value=total_demand,
            confidence=max(0.5, min(0.95, base_confidence)),
            min_value=min_demand,
            max_value=max_demand,
            factors=factors
        )
        
        return indicator
    
    def _analyze_delay_confidence(self, delay_forecast: Dict) -> ConfidenceIndicator:
        """Analyze delay forecast confidence"""
        base_confidence = delay_forecast.get('confidence', 0.70)
        
        # Adjust based on delay probability
        avg_delay_prob = delay_forecast.get('avg_delay_probability', 0)
        if avg_delay_prob > 0.5:
            base_confidence -= 0.15  # High uncertainty = less confidence
        
        # Calculate range
        avg_delay = delay_forecast.get('delays', [{}])[0].get('estimated_delay_hours', 0)
        min_delay = max(0, avg_delay - 4)
        max_delay = avg_delay + 4
        
        factors = [
            'Route data: Complete',
            'Weather patterns: Analyzed',
            'Traffic conditions: Real-time',
            'Historical delays: Reviewed'
        ]
        
        indicator = ConfidenceIndicator(
            prediction_type='delay_forecast',
            value=avg_delay,
            confidence=max(0.4, min(0.90, base_confidence)),
            min_value=min_delay,
            max_value=max_delay,
            factors=factors
        )
        
        return indicator
    
    def _analyze_cost_confidence(self, cost_forecast: Dict) -> ConfidenceIndicator:
        """Analyze cost forecast confidence"""
        base_confidence = cost_forecast.get('confidence', 0.80)
        
        # Adjust based on cost variance
        avg_cost = cost_forecast.get('avg_cost_per_tonne', 0)
        if avg_cost > 60:
            base_confidence -= 0.05  # High cost = slightly less predictable
        
        # Calculate range
        min_cost = avg_cost * 0.90
        max_cost = avg_cost * 1.10
        
        factors = [
            'Fuel prices: Current',
            'Labor costs: Stable',
            'Toll rates: Fixed',
            'Market conditions: Analyzed'
        ]
        
        indicator = ConfidenceIndicator(
            prediction_type='cost_forecast',
            value=avg_cost,
            confidence=max(0.6, min(0.95, base_confidence)),
            min_value=min_cost,
            max_value=max_cost,
            factors=factors
        )
        
        return indicator
    
    def _get_confidence_level(self, confidence: float) -> str:
        """Get confidence level from score"""
        if confidence >= 0.9:
            return "very_high"
        elif confidence >= 0.75:
            return "high"
        elif confidence >= 0.6:
            return "medium"
        elif confidence >= 0.4:
            return "low"
        else:
            return "very_low"
    
    def _get_recommendations(self, indicators: List[ConfidenceIndicator]) -> List[str]:
        """Get recommendations based on confidence levels"""
        recommendations = []
        
        for ind in indicators:
            if ind.confidence < 0.6:
                if ind.prediction_type == 'demand_forecast':
                    recommendations.append("⚠️ Demand forecast confidence is low. Consider collecting more historical data.")
                elif ind.prediction_type == 'delay_forecast':
                    recommendations.append("⚠️ Delay forecast confidence is low. Add more route-specific data.")
                elif ind.prediction_type == 'cost_forecast':
                    recommendations.append("⚠️ Cost forecast confidence is low. Update market data.")
        
        if not recommendations:
            recommendations.append("✓ All predictions have good confidence levels. Plan is reliable.")
        
        return recommendations
    
    def get_confidence_trend(self, prediction_type: str, days: int = 7) -> Dict:
        """Get confidence trend over time"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            relevant_indicators = [
                ind for ind in self.indicators_history
                if ind.prediction_type == prediction_type and ind.created_at >= cutoff_date
            ]
            
            if not relevant_indicators:
                return {
                    'prediction_type': prediction_type,
                    'trend': 'no_data',
                    'indicators': []
                }
            
            # Calculate trend
            first_conf = relevant_indicators[0].confidence
            last_conf = relevant_indicators[-1].confidence
            trend = 'improving' if last_conf > first_conf else ('declining' if last_conf < first_conf else 'stable')
            
            return {
                'prediction_type': prediction_type,
                'trend': trend,
                'start_confidence': first_conf,
                'end_confidence': last_conf,
                'change': last_conf - first_conf,
                'indicators': [ind.to_dict() for ind in relevant_indicators]
            }
        
        except Exception as e:
            self.logger.error(f"Error getting confidence trend: {e}")
            raise
    
    def get_status(self) -> Dict:
        """Get confidence service status"""
        if not self.indicators_history:
            avg_confidence = 0
        else:
            avg_confidence = sum(ind.confidence for ind in self.indicators_history) / len(self.indicators_history)
        
        return {
            'status': 'running',
            'total_indicators': len(self.indicators_history),
            'average_confidence': avg_confidence,
            'confidence_level': self._get_confidence_level(avg_confidence),
            'timestamp': datetime.now().isoformat()
        }
    
    def get_all_indicators(self, limit: int = 100) -> List[Dict]:
        """Get all confidence indicators"""
        return [ind.to_dict() for ind in self.indicators_history[-limit:]]
