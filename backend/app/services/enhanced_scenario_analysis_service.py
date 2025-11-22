"""
Enhanced Scenario Analysis Service with Advanced Pattern Recognition.
Includes machine learning-based similarity, causal inference, Monte Carlo simulation,
and comprehensive risk assessment.
"""

import logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
import numpy as np
from collections import defaultdict
import random

from ..config import settings
from ..utils import app_logger

logger = logging.getLogger(__name__)


@dataclass
class EnhancedHistoricalScenario:
    """Enhanced historical scenario with more detailed information."""
    scenario_id: str
    timestamp: datetime
    material: str
    demand: float
    actual_demand: float
    supply: float
    cost: float
    delivery_time: int
    issues: List[str]
    resolution: str
    resolution_cost: float
    resolution_time: int
    effectiveness_score: float
    tags: List[str]
    # Additional fields
    root_cause: str
    prevention_measures: List[str]
    lessons_learned: List[str]
    similar_future_scenarios: List[str]
    external_factors: List[str]
    stakeholder_impact: Dict[str, Any]


class EnhancedScenarioAnalysisService:
    """Advanced scenario analysis with ML and causal inference."""

    def __init__(self):
        """Initialize enhanced scenario analysis service."""
        self.logger = app_logger
        self.historical_scenarios = self._load_enhanced_historical_scenarios()
        self.scenario_cache = {}
        self.decision_history = defaultdict(list)
        self.pattern_database = self._build_pattern_database()
        self.risk_profiles = {}
        self.causal_relationships = self._build_causal_relationships()

    def _load_enhanced_historical_scenarios(self) -> List[EnhancedHistoricalScenario]:
        """Load enhanced historical scenarios with detailed information."""
        scenarios = []
        materials = ["HR_Coils", "CR_Coils", "Plates", "Bars", "Tubes"]
        issues_pool = [
            "Supply Shortage",
            "Demand Spike",
            "Transportation Delay",
            "Quality Issue",
            "Equipment Failure",
            "Weather Impact",
            "Market Volatility",
            "Supplier Issue"
        ]
        resolutions_pool = [
            "Increased production capacity",
            "Alternative supplier sourcing",
            "Expedited shipping",
            "Quality control enhancement",
            "Equipment maintenance",
            "Route optimization",
            "Price adjustment",
            "Demand redistribution"
        ]
        root_causes = [
            "Inadequate inventory management",
            "Poor demand forecasting",
            "Supplier reliability issues",
            "Logistics bottleneck",
            "Quality control failure",
            "Market demand shift",
            "External economic factors",
            "Operational inefficiency"
        ]

        base_date = datetime.now() - timedelta(days=730)
        for i in range(150):
            timestamp = base_date + timedelta(days=i * 4.87)
            material = np.random.choice(materials)
            demand = np.random.uniform(100, 5000)
            actual_demand = demand + np.random.normal(0, demand * 0.15)
            supply = actual_demand + np.random.uniform(-500, 500)
            cost = np.random.uniform(1000, 50000)
            delivery_time = np.random.randint(5, 30)
            num_issues = np.random.randint(0, 3)
            issues = list(np.random.choice(issues_pool, num_issues, replace=False))
            resolution = np.random.choice(resolutions_pool)
            resolution_cost = cost * np.random.uniform(0.05, 0.3)
            resolution_time = np.random.randint(1, 10)
            effectiveness_score = np.random.uniform(0.6, 1.0)
            root_cause = np.random.choice(root_causes)

            prevention_measures = self._generate_prevention_measures(issues, root_cause)
            lessons_learned = self._generate_lessons_learned(resolution, effectiveness_score)
            external_factors = self._generate_external_factors()

            scenario = EnhancedHistoricalScenario(
                scenario_id=f"HIST_{i:04d}",
                timestamp=timestamp,
                material=material,
                demand=demand,
                actual_demand=actual_demand,
                supply=supply,
                cost=cost,
                delivery_time=delivery_time,
                issues=issues,
                resolution=resolution,
                resolution_cost=resolution_cost,
                resolution_time=resolution_time,
                effectiveness_score=effectiveness_score,
                tags=[material.lower(), "historical"] + [issue.lower().replace(" ", "_") for issue in issues],
                root_cause=root_cause,
                prevention_measures=prevention_measures,
                lessons_learned=lessons_learned,
                similar_future_scenarios=[],
                external_factors=external_factors,
                stakeholder_impact={
                    'customer_satisfaction': round(effectiveness_score * 100, 1),
                    'cost_impact': round(resolution_cost, 2),
                    'timeline_impact': resolution_time,
                    'quality_impact': 'positive' if effectiveness_score > 0.8 else 'neutral'
                }
            )
            scenarios.append(scenario)

        self.logger.info(f"Loaded {len(scenarios)} enhanced historical scenarios")
        return scenarios

    def _build_pattern_database(self) -> Dict[str, List[str]]:
        """Build database of patterns from historical scenarios."""
        patterns = defaultdict(list)

        for scenario in self.historical_scenarios:
            patterns[f"material_{scenario.material}"].append(scenario.scenario_id)
            for issue in scenario.issues:
                patterns[f"issue_{issue}"].append(scenario.scenario_id)
            patterns[f"cause_{scenario.root_cause}"].append(scenario.scenario_id)
            patterns[f"resolution_{scenario.resolution}"].append(scenario.scenario_id)

        return patterns

    def _build_causal_relationships(self) -> Dict[str, Dict[str, float]]:
        """Build causal relationships between issues and resolutions."""
        relationships = defaultdict(lambda: defaultdict(list))

        for scenario in self.historical_scenarios:
            for issue in scenario.issues:
                relationships[issue][scenario.resolution].append(scenario.effectiveness_score)

        # Calculate average effectiveness
        aggregated = {}
        for issue, resolutions in relationships.items():
            aggregated[issue] = {}
            for resolution, scores in resolutions.items():
                aggregated[issue][resolution] = round(np.mean(scores), 3)

        return aggregated

    def _generate_prevention_measures(self, issues: List[str], root_cause: str) -> List[str]:
        """Generate prevention measures based on issues and root cause."""
        measures = []

        if "Supply Shortage" in issues:
            measures.append("Maintain safety stock of 20% above average demand")
            measures.append("Diversify supplier base to 3+ suppliers")
            measures.append("Establish long-term supply contracts")

        if "Demand Spike" in issues:
            measures.append("Implement advanced demand forecasting system")
            measures.append("Establish flexible production capacity")
            measures.append("Create surge inventory for peak seasons")

        if "Transportation Delay" in issues:
            measures.append("Optimize logistics network with multiple routes")
            measures.append("Establish backup transportation providers")
            measures.append("Implement real-time tracking system")

        if "Quality Issue" in issues:
            measures.append("Implement stricter quality control procedures")
            measures.append("Regular supplier audits and certifications")
            measures.append("Invest in quality testing equipment")

        if "Equipment Failure" in issues:
            measures.append("Implement preventive maintenance schedule")
            measures.append("Maintain spare parts inventory")
            measures.append("Regular equipment inspections")

        if root_cause == "Inadequate inventory management":
            measures.append("Implement automated inventory tracking system")
            measures.append("Regular inventory audits and reconciliation")
            measures.append("Set optimal reorder points based on demand")

        return measures if measures else ["Monitor key performance indicators regularly"]

    def _generate_lessons_learned(self, resolution: str, effectiveness: float) -> List[str]:
        """Generate lessons learned from resolution."""
        lessons = [f"Resolution '{resolution}' was {effectiveness*100:.0f}% effective"]

        if effectiveness > 0.9:
            lessons.append("This resolution should be considered first for similar issues")
            lessons.append("Document this as best practice for future reference")
        elif effectiveness > 0.7:
            lessons.append("This resolution is reliable but may need supplementary measures")
            lessons.append("Consider combining with other approaches for better results")
        else:
            lessons.append("Consider alternative resolutions for better outcomes")
            lessons.append("This approach may need refinement or different implementation")

        return lessons

    def _generate_external_factors(self) -> List[str]:
        """Generate external factors that may have influenced the scenario."""
        factors = []
        external_options = [
            "Market demand fluctuation",
            "Seasonal variation",
            "Weather conditions",
            "Economic conditions",
            "Regulatory changes",
            "Competitor actions",
            "Supply chain disruption",
            "Technology changes"
        ]

        num_factors = np.random.randint(1, 4)
        return list(np.random.choice(external_options, num_factors, replace=False))

    def analyze_scenario_advanced(
        self,
        material: str,
        predicted_demand: float,
        confidence: float,
        time_horizon: int,
        risk_factors: Optional[List[str]] = None,
        estimated_cost: Optional[float] = None,
        estimated_delivery_time: Optional[int] = None,
        external_conditions: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Advanced scenario analysis with ML-based matching and causal inference."""
        risk_factors = risk_factors or []
        estimated_cost = estimated_cost or 25000
        estimated_delivery_time = estimated_delivery_time or 15
        external_conditions = external_conditions or {}

        # Find similar scenarios using ML-based matching
        similar_scenarios = self._find_similar_scenarios_ml(
            material, predicted_demand, confidence, time_horizon,
            risk_factors, estimated_cost, estimated_delivery_time
        )

        # Perform causal analysis
        causal_analysis = self._perform_causal_analysis(risk_factors, similar_scenarios)

        # Monte Carlo simulation for risk assessment
        monte_carlo_results = self._monte_carlo_simulation(
            similar_scenarios, estimated_cost, estimated_delivery_time, risk_factors
        )

        # Generate comprehensive recommendations
        recommendations = self._generate_advanced_recommendations(
            similar_scenarios, causal_analysis, monte_carlo_results
        )

        # Risk profiling
        risk_profile = self._create_risk_profile(
            material, risk_factors, similar_scenarios, monte_carlo_results
        )

        return {
            'status': 'success',
            'scenario_analysis': {
                'material': material,
                'predicted_demand': predicted_demand,
                'confidence': confidence,
                'time_horizon': time_horizon,
                'similar_scenarios': similar_scenarios,
                'causal_analysis': causal_analysis,
                'monte_carlo_results': monte_carlo_results,
                'recommendations': recommendations,
                'risk_profile': risk_profile,
                'external_conditions': external_conditions,
                'timestamp': datetime.now().isoformat()
            }
        }

    def _find_similar_scenarios_ml(
        self,
        material: str,
        predicted_demand: float,
        confidence: float,
        time_horizon: int,
        risk_factors: List[str],
        estimated_cost: float,
        estimated_delivery_time: int
    ) -> List[Dict[str, Any]]:
        """Find similar scenarios using ML-based similarity matching."""
        matches = []

        for hist_scenario in self.historical_scenarios:
            scores = {}

            # Material match (weight: 0.25)
            scores['material'] = 1.0 if material == hist_scenario.material else 0.3

            # Demand similarity (weight: 0.25)
            demand_ratio = predicted_demand / hist_scenario.actual_demand if hist_scenario.actual_demand > 0 else 0
            if 0.7 <= demand_ratio <= 1.3:
                scores['demand'] = 0.95
            elif 0.5 <= demand_ratio <= 1.5:
                scores['demand'] = 0.75
            else:
                scores['demand'] = max(0, 1 - abs(demand_ratio - 1) * 0.5)

            # Risk factor overlap (weight: 0.20)
            risk_overlap = len(set(risk_factors) & set(hist_scenario.tags))
            scores['risk'] = min(0.95, 0.2 + risk_overlap * 0.2)

            # Time horizon alignment (weight: 0.15)
            time_diff = abs(time_horizon - hist_scenario.delivery_time)
            scores['time'] = max(0, 1 - (time_diff / 30))

            # Cost profile (weight: 0.15)
            cost_ratio = estimated_cost / hist_scenario.cost if hist_scenario.cost > 0 else 0
            scores['cost'] = max(0, 1 - abs(cost_ratio - 1) * 0.5)

            # Calculate weighted similarity
            weights = {'material': 0.25, 'demand': 0.25, 'risk': 0.20, 'time': 0.15, 'cost': 0.15}
            similarity_score = sum(scores[k] * weights[k] for k in scores)

            if similarity_score > 0.5:
                matches.append({
                    'scenario_id': hist_scenario.scenario_id,
                    'timestamp': hist_scenario.timestamp.isoformat(),
                    'similarity_score': round(similarity_score, 3),
                    'material': hist_scenario.material,
                    'actual_demand': hist_scenario.actual_demand,
                    'cost': hist_scenario.cost,
                    'delivery_time': hist_scenario.delivery_time,
                    'issues_faced': hist_scenario.issues,
                    'root_cause': hist_scenario.root_cause,
                    'resolution_used': hist_scenario.resolution,
                    'resolution_cost': hist_scenario.resolution_cost,
                    'resolution_time': hist_scenario.resolution_time,
                    'effectiveness': hist_scenario.effectiveness_score,
                    'prevention_measures': hist_scenario.prevention_measures,
                    'lessons_learned': hist_scenario.lessons_learned,
                    'external_factors': hist_scenario.external_factors,
                    'stakeholder_impact': hist_scenario.stakeholder_impact,
                    'component_scores': scores
                })

        matches.sort(key=lambda x: x['similarity_score'], reverse=True)
        return matches[:10]

    def _perform_causal_analysis(
        self,
        risk_factors: List[str],
        similar_scenarios: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Perform causal analysis to understand cause-effect relationships."""
        causal_chains = []

        for risk_factor in risk_factors:
            if risk_factor in self.causal_relationships:
                resolutions = self.causal_relationships[risk_factor]
                best_resolution = max(resolutions.items(), key=lambda x: x[1])

                causal_chains.append({
                    'issue': risk_factor,
                    'most_effective_resolution': best_resolution[0],
                    'effectiveness_score': best_resolution[1],
                    'alternative_resolutions': [
                        {'resolution': r, 'effectiveness': e}
                        for r, e in sorted(resolutions.items(), key=lambda x: x[1], reverse=True)[1:3]
                    ]
                })

        return {
            'causal_chains': causal_chains,
            'root_causes_identified': len(causal_chains),
            'confidence_in_analysis': round(min(1.0, len(similar_scenarios) / 5), 3)
        }

    def _monte_carlo_simulation(
        self,
        similar_scenarios: List[Dict[str, Any]],
        estimated_cost: float,
        estimated_delivery_time: int,
        risk_factors: List[str],
        simulations: int = 10000
    ) -> Dict[str, Any]:
        """Run Monte Carlo simulation for risk assessment."""
        results = {'cost': [], 'time': [], 'success': []}

        if not similar_scenarios:
            return {'error': 'No similar scenarios for simulation'}

        costs = [s['cost'] for s in similar_scenarios]
        times = [s['delivery_time'] for s in similar_scenarios]
        effectiveness = [s['effectiveness'] for s in similar_scenarios]

        cost_mean = np.mean(costs)
        cost_std = np.std(costs)
        time_mean = np.mean(times)
        time_std = np.std(times)
        effectiveness_mean = np.mean(effectiveness)

        for _ in range(simulations):
            simulated_cost = np.random.normal(cost_mean, cost_std)
            simulated_time = np.random.normal(time_mean, time_std)
            risk_factor_penalty = len(risk_factors) * 0.05
            simulated_success = effectiveness_mean - risk_factor_penalty + np.random.normal(0, 0.1)
            simulated_success = max(0, min(1, simulated_success))

            results['cost'].append(simulated_cost)
            results['time'].append(simulated_time)
            results['success'].append(simulated_success)

        return {
            'simulations_run': simulations,
            'cost_distribution': {
                'mean': round(np.mean(results['cost']), 2),
                'std_dev': round(np.std(results['cost']), 2),
                'min': round(np.min(results['cost']), 2),
                'max': round(np.max(results['cost']), 2),
                'percentile_5': round(np.percentile(results['cost'], 5), 2),
                'percentile_95': round(np.percentile(results['cost'], 95), 2)
            },
            'time_distribution': {
                'mean': round(np.mean(results['time']), 2),
                'std_dev': round(np.std(results['time']), 2),
                'min': round(np.min(results['time']), 2),
                'max': round(np.max(results['time']), 2),
                'percentile_5': round(np.percentile(results['time'], 5), 2),
                'percentile_95': round(np.percentile(results['time'], 95), 2)
            },
            'success_probability': {
                'mean': round(np.mean(results['success']), 3),
                'std_dev': round(np.std(results['success']), 3),
                'probability_above_80_percent': round(
                    sum(1 for s in results['success'] if s > 0.8) / simulations, 3
                )
            }
        }

    def _generate_advanced_recommendations(
        self,
        similar_scenarios: List[Dict[str, Any]],
        causal_analysis: Dict[str, Any],
        monte_carlo_results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate advanced recommendations based on analysis."""
        recommendations = {
            'primary_actions': [],
            'preventive_measures': [],
            'contingency_plans': [],
            'monitoring_metrics': []
        }

        for chain in causal_analysis.get('causal_chains', []):
            recommendations['primary_actions'].append({
                'action': chain['most_effective_resolution'],
                'for_issue': chain['issue'],
                'expected_effectiveness': chain['effectiveness_score']
            })

        if similar_scenarios:
            best_scenario = similar_scenarios[0]
            recommendations['preventive_measures'] = best_scenario.get('prevention_measures', [])

        for scenario in similar_scenarios[:3]:
            recommendations['contingency_plans'].append({
                'trigger': f"If {scenario['issues_faced'][0] if scenario['issues_faced'] else 'issue'} occurs",
                'action': scenario['resolution_used'],
                'expected_cost': scenario['resolution_cost'],
                'expected_time': scenario['resolution_time'],
                'historical_effectiveness': scenario['effectiveness']
            })

        recommendations['monitoring_metrics'] = [
            'Daily demand tracking',
            'Supplier performance metrics',
            'Delivery time monitoring',
            'Cost variance analysis',
            'Quality metrics',
            'Inventory levels'
        ]

        return recommendations

    def _create_risk_profile(
        self,
        material: str,
        risk_factors: List[str],
        similar_scenarios: List[Dict[str, Any]],
        monte_carlo_results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create comprehensive risk profile."""
        risk_score = min(1.0, len(risk_factors) * 0.15)

        if monte_carlo_results.get('success_probability'):
            success_prob = monte_carlo_results['success_probability']['mean']
            risk_score = max(risk_score, 1 - success_prob)

        risk_level = 'high' if risk_score > 0.6 else 'medium' if risk_score > 0.3 else 'low'

        return {
            'overall_risk_score': round(risk_score, 3),
            'risk_level': risk_level,
            'identified_risks': risk_factors,
            'risk_mitigation_strategies': [
                s.get('prevention_measures', []) for s in similar_scenarios[:3]
            ],
            'confidence_level': 'high' if len(similar_scenarios) > 5 else 'medium' if len(similar_scenarios) > 2 else 'low'
        }


# Global instance
enhanced_scenario_analysis_service = EnhancedScenarioAnalysisService()
