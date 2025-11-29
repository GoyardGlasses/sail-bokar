"""
Feature Engineering Module
Extracts and creates meaningful features for ML models
"""

import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)

class FeatureEngineer:
    """Feature engineering for ML models"""
    
    def __init__(self):
        self.logger = logger
        self.feature_stats = {}
    
    # ========================================================================
    # FEATURE EXTRACTION
    # ========================================================================
    
    def extract_dispatch_features(self, dispatch_data: Dict) -> Dict:
        """Extract features from dispatch data"""
        features = {}
        
        # Route features
        features['route_risk'] = self._get_route_risk(dispatch_data.get('route'))
        features['route_distance'] = self._get_route_distance(dispatch_data.get('route'))
        
        # Material features
        features['material_risk'] = self._get_material_risk(dispatch_data.get('material'))
        features['material_cost'] = self._get_material_cost(dispatch_data.get('material'))
        
        # Tonnage features
        tonnage = dispatch_data.get('tonnage', 0)
        features['tonnage'] = tonnage
        features['tonnage_category'] = self._categorize_tonnage(tonnage)
        
        # Time features
        features['day_of_week'] = self._get_day_of_week(dispatch_data.get('date'))
        features['is_weekend'] = self._is_weekend(dispatch_data.get('date'))
        features['hour_of_day'] = self._get_hour_of_day(dispatch_data.get('dispatch_time'))
        
        # Weather features
        features['weather_risk'] = self._get_weather_risk(dispatch_data.get('weather'))
        
        # Traffic features
        features['traffic_risk'] = self._get_traffic_risk(dispatch_data.get('traffic_level'))
        
        # Vehicle features
        features['vehicle_age'] = self._estimate_vehicle_age(dispatch_data.get('vehicle'))
        
        # Driver features
        features['driver_experience'] = self._estimate_driver_experience(dispatch_data.get('driver'))
        
        # Derived features
        features['total_risk'] = self._calculate_total_risk(features)
        features['cost_per_km'] = self._calculate_cost_per_km(
            dispatch_data.get('total_cost', 0),
            features['route_distance']
        )
        
        return features
    
    def extract_decision_features(self, decision_data: Dict) -> Dict:
        """Extract features from decision data"""
        features = {}
        
        # Scenario features
        features['scenario_complexity'] = decision_data.get('complexity', 50)
        features['scenario_severity'] = self._severity_to_numeric(decision_data.get('severity'))
        
        # Decision features
        num_decisions = len(decision_data.get('decisions', []))
        features['num_decisions'] = num_decisions
        features['decision_diversity'] = self._calculate_decision_diversity(decision_data.get('decisions', []))
        
        # Outcome features
        features['outcome_success'] = 1 if decision_data.get('outcome') == 'Success' else 0
        
        # Impact features
        features['cost_impact'] = decision_data.get('cost_impact', 0)
        features['time_impact'] = decision_data.get('time_impact', 0)
        features['satisfaction_impact'] = decision_data.get('satisfaction_impact', 0)
        
        # Risk features
        features['risk_mitigated'] = decision_data.get('risk_mitigated', 0)
        
        # Derived features
        features['total_impact'] = self._calculate_total_impact(features)
        features['decision_effectiveness'] = self._calculate_decision_effectiveness(features)
        
        return features
    
    # ========================================================================
    # FEATURE NORMALIZATION
    # ========================================================================
    
    def normalize_features(self, features: Dict, feature_stats: Dict = None) -> Dict:
        """Normalize features to 0-1 range"""
        normalized = {}
        
        for key, value in features.items():
            if isinstance(value, (int, float)):
                # Use provided stats or assume 0-100 range
                if feature_stats and key in feature_stats:
                    stats = feature_stats[key]
                    min_val = stats.get('min', 0)
                    max_val = stats.get('max', 100)
                else:
                    min_val = 0
                    max_val = 100
                
                # Normalize
                if max_val != min_val:
                    normalized[key] = (value - min_val) / (max_val - min_val)
                else:
                    normalized[key] = 0.5
            else:
                normalized[key] = value
        
        return normalized
    
    def scale_features(self, features: Dict, method: str = "minmax") -> Dict:
        """Scale features using specified method"""
        if method == "minmax":
            return self.normalize_features(features)
        elif method == "zscore":
            return self._zscore_scaling(features)
        else:
            return features
    
    def _zscore_scaling(self, features: Dict) -> Dict:
        """Z-score scaling"""
        scaled = {}
        for key, value in features.items():
            if isinstance(value, (int, float)):
                # Assume mean=50, std=15 for 0-100 range
                scaled[key] = (value - 50) / 15
            else:
                scaled[key] = value
        return scaled
    
    # ========================================================================
    # DERIVED FEATURES
    # ========================================================================
    
    def create_derived_features(self, base_features: Dict) -> Dict:
        """Create derived features from base features"""
        derived = {}
        
        # Risk-related derived features
        if 'total_risk' in base_features and 'risk_mitigated' in base_features:
            derived['net_risk'] = max(0, base_features['total_risk'] - base_features['risk_mitigated'])
        
        # Cost-related derived features
        if 'cost_per_km' in base_features and 'tonnage' in base_features:
            derived['cost_per_tonne_km'] = base_features['cost_per_km'] / max(1, base_features['tonnage'])
        
        # Time-related derived features
        if 'route_distance' in base_features:
            derived['estimated_speed'] = base_features['route_distance'] / max(1, base_features.get('planned_days', 1) * 24)
        
        # Efficiency features
        if 'total_impact' in base_features and 'num_decisions' in base_features:
            derived['impact_per_decision'] = base_features['total_impact'] / max(1, base_features['num_decisions'])
        
        return derived
    
    # ========================================================================
    # HELPER METHODS - ROUTE FEATURES
    # ========================================================================
    
    def _get_route_risk(self, route: str) -> float:
        """Get risk score for route"""
        route_risks = {
            'bokaro-dhanbad': 85,
            'bokaro-hatia': 35,
            'bokaro-kolkata': 12,
            'bokaro-patna': 8,
            'bokaro-ranchi': 10,
            'bokaro-durgapur': 15,
            'bokaro-haldia': 25,
        }
        return route_risks.get(route, 50)
    
    def _get_route_distance(self, route: str) -> float:
        """Get distance for route"""
        route_distances = {
            'bokaro-dhanbad': 85,
            'bokaro-hatia': 120,
            'bokaro-kolkata': 180,
            'bokaro-patna': 150,
            'bokaro-ranchi': 95,
            'bokaro-durgapur': 110,
            'bokaro-haldia': 220,
        }
        return route_distances.get(route, 100)
    
    # ========================================================================
    # HELPER METHODS - MATERIAL FEATURES
    # ========================================================================
    
    def _get_material_risk(self, material: str) -> float:
        """Get risk score for material"""
        material_risks = {
            'cr_coils': 15,
            'hr_coils': 22,
            'plates': 28,
            'wire_rods': 18,
            'tmt_bars': 20,
            'pig_iron': 32,
            'billets': 19,
        }
        return material_risks.get(material, 20)
    
    def _get_material_cost(self, material: str) -> float:
        """Get cost for material"""
        material_costs = {
            'cr_coils': 5200,
            'hr_coils': 3500,
            'plates': 4200,
            'wire_rods': 2800,
            'tmt_bars': 3100,
            'pig_iron': 2500,
            'billets': 3400,
        }
        return material_costs.get(material, 3500)
    
    # ========================================================================
    # HELPER METHODS - WEATHER & TRAFFIC
    # ========================================================================
    
    def _get_weather_risk(self, weather: str) -> float:
        """Get risk for weather condition"""
        weather_risks = {
            'clear': 0,
            'rainy': 10,
            'foggy': 15,
            'stormy': 25,
        }
        return weather_risks.get(weather, 5)
    
    def _get_traffic_risk(self, traffic_level: str) -> float:
        """Get risk for traffic level"""
        traffic_risks = {
            'low': 5,
            'medium': 15,
            'high': 25,
            'very-high': 35,
        }
        return traffic_risks.get(traffic_level, 15)
    
    # ========================================================================
    # HELPER METHODS - TIME FEATURES
    # ========================================================================
    
    def _get_day_of_week(self, date_str: str) -> int:
        """Get day of week (0-6)"""
        try:
            if isinstance(date_str, str):
                date = datetime.fromisoformat(date_str)
            else:
                date = date_str
            return date.weekday()
        except:
            return 0
    
    def _is_weekend(self, date_str: str) -> int:
        """Check if date is weekend"""
        day = self._get_day_of_week(date_str)
        return 1 if day >= 5 else 0
    
    def _get_hour_of_day(self, time_str: str) -> int:
        """Get hour of day"""
        try:
            if time_str:
                hour = int(time_str.split(':')[0])
                return hour
        except:
            pass
        return 12
    
    # ========================================================================
    # HELPER METHODS - CATEGORICAL
    # ========================================================================
    
    def _categorize_tonnage(self, tonnage: float) -> str:
        """Categorize tonnage"""
        if tonnage < 25:
            return 'light'
        elif tonnage < 50:
            return 'medium'
        elif tonnage < 75:
            return 'heavy'
        else:
            return 'very_heavy'
    
    def _severity_to_numeric(self, severity: str) -> float:
        """Convert severity to numeric"""
        severity_map = {
            'low': 25,
            'medium': 50,
            'high': 75,
            'critical': 100,
        }
        return severity_map.get(severity, 50)
    
    # ========================================================================
    # HELPER METHODS - ESTIMATES
    # ========================================================================
    
    def _estimate_vehicle_age(self, vehicle: str) -> float:
        """Estimate vehicle age (years)"""
        # Simplified: assume vehicles are 1-5 years old
        try:
            vehicle_num = int(vehicle.split('-')[1])
            return (vehicle_num % 5) + 1
        except:
            return 3
    
    def _estimate_driver_experience(self, driver: str) -> float:
        """Estimate driver experience (years)"""
        # Simplified: assume 3-15 years experience
        try:
            driver_hash = sum(ord(c) for c in driver)
            return ((driver_hash % 12) + 3)
        except:
            return 7
    
    # ========================================================================
    # HELPER METHODS - CALCULATIONS
    # ========================================================================
    
    def _calculate_total_risk(self, features: Dict) -> float:
        """Calculate total risk from components"""
        route_risk = features.get('route_risk', 0)
        material_risk = features.get('material_risk', 0)
        weather_risk = features.get('weather_risk', 0)
        traffic_risk = features.get('traffic_risk', 0)
        
        # Weighted average
        total = (route_risk * 0.4 + material_risk * 0.3 + 
                weather_risk * 0.2 + traffic_risk * 0.1)
        return min(100, total)
    
    def _calculate_cost_per_km(self, total_cost: float, distance: float) -> float:
        """Calculate cost per km"""
        return total_cost / max(1, distance)
    
    def _calculate_decision_diversity(self, decisions: List) -> float:
        """Calculate diversity of decisions"""
        if not decisions:
            return 0
        unique_decisions = len(set(decisions))
        return (unique_decisions / len(decisions)) * 100
    
    def _calculate_total_impact(self, features: Dict) -> float:
        """Calculate total impact"""
        cost_impact = abs(features.get('cost_impact', 0))
        time_impact = abs(features.get('time_impact', 0))
        satisfaction_impact = abs(features.get('satisfaction_impact', 0))
        
        return cost_impact + time_impact + satisfaction_impact
    
    def _calculate_decision_effectiveness(self, features: Dict) -> float:
        """Calculate decision effectiveness"""
        if features.get('outcome_success', 0):
            return features.get('total_impact', 0) * 1.5
        else:
            return max(0, features.get('total_impact', 0) * 0.5)
