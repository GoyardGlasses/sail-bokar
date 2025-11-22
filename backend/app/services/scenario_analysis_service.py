"""
Scenario-Based Predictive Analytics with Historical Context Service.

This service analyzes historical data to identify similar scenarios and
provides decision recommendations based on how similar situations were handled.
"""

import logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
import numpy as np
from collections import defaultdict

from ..config import settings
from ..utils import app_logger

logger = logging.getLogger(__name__)


@dataclass
class HistoricalScenario:
    """Represents a historical scenario."""
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


@dataclass
class PredictionScenario:
    """Represents a future prediction scenario."""
    scenario_id: str
    material: str
    predicted_demand: float
    confidence: float
    time_horizon: int
    risk_factors: List[str]
    estimated_cost: float
    estimated_delivery_time: int


@dataclass
class SimilarityMatch:
    """Represents a match between current scenario and historical scenario."""
    historical_scenario: HistoricalScenario
    similarity_score: float
    matching_factors: List[str]
    resolution_recommendation: str
    expected_outcome: Dict[str, Any]


class ScenarioAnalysisService:
    """Service for scenario-based analysis with historical context."""

    def __init__(self):
        """Initialize the scenario analysis service."""
        self.logger = app_logger
        self.historical_scenarios = self._load_historical_scenarios()
        self.scenario_cache = {}
        self.decision_history = defaultdict(list)

    def _load_historical_scenarios(self) -> List[HistoricalScenario]:
        """Load or generate historical scenarios from data."""
        try:
            # In production, load from database
            # For now, generate synthetic historical data
            scenarios = self._generate_synthetic_historical_data()
            self.logger.info(f"Loaded {len(scenarios)} historical scenarios")
            return scenarios
        except Exception as e:
            self.logger.error(f"Error loading historical scenarios: {e}")
            return []

    def _generate_synthetic_historical_data(self) -> List[HistoricalScenario]:
        """Generate synthetic historical scenario data."""
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

        # Generate 100 historical scenarios
        base_date = datetime.now() - timedelta(days=365)
        for i in range(100):
            timestamp = base_date + timedelta(days=i * 3.65)
            material = np.random.choice(materials)
            demand = np.random.uniform(100, 5000)
            actual_demand = demand + np.random.normal(0, demand * 0.1)
            supply = actual_demand + np.random.uniform(-500, 500)
            cost = np.random.uniform(1000, 50000)
            delivery_time = np.random.randint(5, 30)
            num_issues = np.random.randint(0, 3)
            issues = list(np.random.choice(issues_pool, num_issues, replace=False))
            resolution = np.random.choice(resolutions_pool)
            resolution_cost = cost * np.random.uniform(0.05, 0.3)
            resolution_time = np.random.randint(1, 10)
            effectiveness_score = np.random.uniform(0.6, 1.0)

            scenario = HistoricalScenario(
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
                tags=[material.lower(), "historical"] + [issue.lower().replace(" ", "_") for issue in issues]
            )
            scenarios.append(scenario)

        return scenarios

    def analyze_scenario(
        self,
        material: str,
        predicted_demand: float,
        confidence: float,
        time_horizon: int,
        risk_factors: Optional[List[str]] = None,
        estimated_cost: Optional[float] = None,
        estimated_delivery_time: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Analyze a prediction scenario against historical data.

        Args:
            material: Material type
            predicted_demand: Predicted demand quantity
            confidence: Confidence level (0-1)
            time_horizon: Days into future
            risk_factors: List of identified risk factors
            estimated_cost: Estimated cost
            estimated_delivery_time: Estimated delivery time

        Returns:
            Analysis results with recommendations
        """
        try:
            risk_factors = risk_factors or []
            estimated_cost = estimated_cost or 25000
            estimated_delivery_time = estimated_delivery_time or 15

            # Create prediction scenario
            scenario = PredictionScenario(
                scenario_id=f"PRED_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                material=material,
                predicted_demand=predicted_demand,
                confidence=confidence,
                time_horizon=time_horizon,
                risk_factors=risk_factors,
                estimated_cost=estimated_cost,
                estimated_delivery_time=estimated_delivery_time
            )

            # Find similar historical scenarios
            similar_scenarios = self._find_similar_scenarios(scenario)

            # Generate recommendations based on similar scenarios
            recommendations = self._generate_recommendations(scenario, similar_scenarios)

            # Create multiple scenario-based predictions
            scenario_predictions = self._create_scenario_predictions(scenario, similar_scenarios)

            # Generate decision support
            decision = self._generate_decision(scenario, similar_scenarios, scenario_predictions)

            return {
                "status": "success",
                "scenario_id": scenario.scenario_id,
                "material": material,
                "predicted_demand": predicted_demand,
                "confidence": confidence,
                "time_horizon": time_horizon,
                "risk_factors": risk_factors,
                "similar_scenarios": [
                    {
                        "scenario_id": match.historical_scenario.scenario_id,
                        "timestamp": match.historical_scenario.timestamp.isoformat(),
                        "similarity_score": round(match.similarity_score, 3),
                        "matching_factors": match.matching_factors,
                        "historical_demand": match.historical_scenario.actual_demand,
                        "historical_cost": match.historical_scenario.cost,
                        "historical_delivery_time": match.historical_scenario.delivery_time,
                        "issues_faced": match.historical_scenario.issues,
                        "resolution_used": match.historical_scenario.resolution,
                        "resolution_cost": match.historical_scenario.resolution_cost,
                        "resolution_time": match.historical_scenario.resolution_time,
                        "effectiveness": match.historical_scenario.effectiveness_score
                    }
                    for match in similar_scenarios[:5]
                ],
                "recommendations": recommendations,
                "scenario_predictions": scenario_predictions,
                "decision_support": decision,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            self.logger.error(f"Error analyzing scenario: {e}")
            return {
                "status": "error",
                "message": str(e)
            }

    def _find_similar_scenarios(self, scenario: PredictionScenario) -> List[SimilarityMatch]:
        """Find similar historical scenarios."""
        matches = []

        for hist_scenario in self.historical_scenarios:
            # Calculate similarity score
            similarity_score, matching_factors = self._calculate_similarity(
                scenario, hist_scenario
            )

            if similarity_score > 0.5:  # Threshold for relevance
                match = SimilarityMatch(
                    historical_scenario=hist_scenario,
                    similarity_score=similarity_score,
                    matching_factors=matching_factors,
                    resolution_recommendation=hist_scenario.resolution,
                    expected_outcome={
                        "cost_impact": hist_scenario.resolution_cost,
                        "time_impact": hist_scenario.resolution_time,
                        "effectiveness": hist_scenario.effectiveness_score
                    }
                )
                matches.append(match)

        # Sort by similarity score
        matches.sort(key=lambda x: x.similarity_score, reverse=True)
        return matches

    def _calculate_similarity(
        self,
        scenario: PredictionScenario,
        hist_scenario: HistoricalScenario
    ) -> Tuple[float, List[str]]:
        """Calculate similarity between prediction and historical scenario."""
        matching_factors = []
        similarity_components = []

        # Material match
        if scenario.material == hist_scenario.material:
            matching_factors.append("Same material type")
            similarity_components.append(1.0)
        else:
            similarity_components.append(0.3)

        # Demand similarity (normalized)
        demand_ratio = scenario.predicted_demand / hist_scenario.actual_demand
        if 0.7 <= demand_ratio <= 1.3:
            matching_factors.append("Similar demand level")
            similarity_components.append(0.9)
        elif 0.5 <= demand_ratio <= 1.5:
            matching_factors.append("Comparable demand level")
            similarity_components.append(0.7)
        else:
            similarity_components.append(0.4)

        # Risk factor overlap
        risk_overlap = len(set(scenario.risk_factors) & set(hist_scenario.tags))
        if risk_overlap > 0:
            matching_factors.append(f"Shared risk factors: {risk_overlap}")
            similarity_components.append(min(0.8, 0.3 + risk_overlap * 0.2))
        else:
            similarity_components.append(0.2)

        # Time horizon consideration
        time_diff = abs(scenario.time_horizon - hist_scenario.delivery_time)
        if time_diff <= 5:
            matching_factors.append("Similar time horizon")
            similarity_components.append(0.8)
        elif time_diff <= 15:
            matching_factors.append("Comparable time horizon")
            similarity_components.append(0.6)
        else:
            similarity_components.append(0.3)

        # Cost similarity
        cost_ratio = scenario.estimated_cost / hist_scenario.cost
        if 0.8 <= cost_ratio <= 1.2:
            matching_factors.append("Similar cost profile")
            similarity_components.append(0.7)
        else:
            similarity_components.append(0.4)

        # Calculate weighted average
        weights = [0.25, 0.30, 0.20, 0.15, 0.10]
        similarity_score = sum(c * w for c, w in zip(similarity_components, weights))

        return similarity_score, matching_factors

    def _generate_recommendations(
        self,
        scenario: PredictionScenario,
        similar_scenarios: List[SimilarityMatch]
    ) -> Dict[str, Any]:
        """Generate recommendations based on similar scenarios."""
        if not similar_scenarios:
            return {
                "primary": "No similar historical scenarios found. Proceed with standard protocols.",
                "secondary": [],
                "risk_level": "medium",
                "confidence": 0.5
            }

        # Aggregate recommendations from top matches
        primary_resolutions = defaultdict(float)
        avg_effectiveness = 0
        avg_cost_impact = 0
        avg_time_impact = 0

        for match in similar_scenarios[:3]:
            primary_resolutions[match.resolution_recommendation] += match.similarity_score
            avg_effectiveness += match.expected_outcome["effectiveness"]
            avg_cost_impact += match.expected_outcome["cost_impact"]
            avg_time_impact += match.expected_outcome["time_impact"]

        num_matches = min(3, len(similar_scenarios))
        avg_effectiveness /= num_matches
        avg_cost_impact /= num_matches
        avg_time_impact /= num_matches

        # Get top resolution
        top_resolution = max(primary_resolutions.items(), key=lambda x: x[1])

        # Determine risk level
        if avg_effectiveness > 0.8:
            risk_level = "low"
        elif avg_effectiveness > 0.6:
            risk_level = "medium"
        else:
            risk_level = "high"

        return {
            "primary": top_resolution[0],
            "secondary": [
                res for res, score in sorted(
                    primary_resolutions.items(),
                    key=lambda x: x[1],
                    reverse=True
                )[1:3]
            ],
            "expected_cost_impact": round(avg_cost_impact, 2),
            "expected_time_impact": round(avg_time_impact, 2),
            "expected_effectiveness": round(avg_effectiveness, 3),
            "risk_level": risk_level,
            "confidence": round(top_resolution[1] / len(similar_scenarios), 3)
        }

    def _create_scenario_predictions(
        self,
        scenario: PredictionScenario,
        similar_scenarios: List[SimilarityMatch]
    ) -> List[Dict[str, Any]]:
        """Create multiple scenario-based predictions."""
        scenarios_list = []

        # Best case scenario (based on best historical performance)
        if similar_scenarios:
            best_match = similar_scenarios[0]
            scenarios_list.append({
                "scenario_type": "Best Case",
                "probability": 0.25,
                "description": "Optimal execution based on best historical performance",
                "expected_demand": scenario.predicted_demand * 0.95,
                "expected_cost": scenario.estimated_cost * 0.85,
                "expected_delivery_time": scenario.estimated_delivery_time * 0.9,
                "success_probability": best_match.expected_outcome["effectiveness"],
                "based_on": best_match.historical_scenario.scenario_id
            })

            # Most likely scenario (average of similar cases)
            avg_cost = np.mean([m.expected_outcome["cost_impact"] for m in similar_scenarios[:3]])
            avg_time = np.mean([m.expected_outcome["time_impact"] for m in similar_scenarios[:3]])
            scenarios_list.append({
                "scenario_type": "Most Likely",
                "probability": 0.50,
                "description": "Expected outcome based on historical average",
                "expected_demand": scenario.predicted_demand,
                "expected_cost": scenario.estimated_cost + avg_cost,
                "expected_delivery_time": scenario.estimated_delivery_time + avg_time,
                "success_probability": 0.75,
                "based_on": "Average of similar scenarios"
            })

            # Worst case scenario
            worst_match = similar_scenarios[-1] if len(similar_scenarios) > 1 else similar_scenarios[0]
            scenarios_list.append({
                "scenario_type": "Worst Case",
                "probability": 0.25,
                "description": "Potential challenges based on difficult historical cases",
                "expected_demand": scenario.predicted_demand * 1.15,
                "expected_cost": scenario.estimated_cost * 1.3,
                "expected_delivery_time": scenario.estimated_delivery_time * 1.4,
                "success_probability": worst_match.expected_outcome["effectiveness"] * 0.7,
                "based_on": worst_match.historical_scenario.scenario_id
            })
        else:
            # Default scenarios if no historical data
            scenarios_list = [
                {
                    "scenario_type": "Best Case",
                    "probability": 0.25,
                    "expected_demand": scenario.predicted_demand * 0.95,
                    "expected_cost": scenario.estimated_cost * 0.85,
                    "expected_delivery_time": scenario.estimated_delivery_time * 0.9,
                    "success_probability": 0.85
                },
                {
                    "scenario_type": "Most Likely",
                    "probability": 0.50,
                    "expected_demand": scenario.predicted_demand,
                    "expected_cost": scenario.estimated_cost,
                    "expected_delivery_time": scenario.estimated_delivery_time,
                    "success_probability": 0.70
                },
                {
                    "scenario_type": "Worst Case",
                    "probability": 0.25,
                    "expected_demand": scenario.predicted_demand * 1.15,
                    "expected_cost": scenario.estimated_cost * 1.3,
                    "expected_delivery_time": scenario.estimated_delivery_time * 1.4,
                    "success_probability": 0.50
                }
            ]

        return scenarios_list

    def _generate_decision(
        self,
        scenario: PredictionScenario,
        similar_scenarios: List[SimilarityMatch],
        scenario_predictions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate final decision support."""
        # Calculate weighted expected values
        expected_cost = sum(
            sp["expected_cost"] * sp["probability"]
            for sp in scenario_predictions
        )
        expected_time = sum(
            sp["expected_delivery_time"] * sp["probability"]
            for sp in scenario_predictions
        )
        expected_success = sum(
            sp["success_probability"] * sp["probability"]
            for sp in scenario_predictions
        )

        # Determine action
        if expected_success > 0.8:
            action = "PROCEED"
            action_description = "High confidence in successful execution"
        elif expected_success > 0.6:
            action = "PROCEED_WITH_CAUTION"
            action_description = "Moderate confidence; implement contingency plans"
        else:
            action = "REVIEW_REQUIRED"
            action_description = "Low confidence; recommend detailed review before proceeding"

        # Generate action items
        action_items = []
        if scenario.risk_factors:
            action_items.append(f"Monitor risk factors: {', '.join(scenario.risk_factors)}")
        if expected_cost > scenario.estimated_cost * 1.2:
            action_items.append("Budget increase recommended")
        if expected_time > scenario.estimated_delivery_time * 1.2:
            action_items.append("Timeline extension may be needed")
        if similar_scenarios and similar_scenarios[0].similarity_score > 0.8:
            action_items.append(
                f"Apply proven resolution: {similar_scenarios[0].resolution_recommendation}"
            )

        return {
            "recommended_action": action,
            "action_description": action_description,
            "expected_cost": round(expected_cost, 2),
            "expected_delivery_time": round(expected_time, 2),
            "expected_success_probability": round(expected_success, 3),
            "confidence_level": "high" if expected_success > 0.75 else "medium" if expected_success > 0.6 else "low",
            "action_items": action_items,
            "contingency_plans": self._generate_contingency_plans(scenario, similar_scenarios),
            "key_metrics": {
                "cost_variance": round((expected_cost - scenario.estimated_cost) / scenario.estimated_cost * 100, 2),
                "time_variance": round((expected_time - scenario.estimated_delivery_time) / scenario.estimated_delivery_time * 100, 2),
                "success_probability": round(expected_success, 3)
            }
        }

    def _generate_contingency_plans(
        self,
        scenario: PredictionScenario,
        similar_scenarios: List[SimilarityMatch]
    ) -> List[Dict[str, Any]]:
        """Generate contingency plans based on historical issues."""
        contingency_plans = []

        if similar_scenarios:
            for i, match in enumerate(similar_scenarios[:3]):
                if match.historical_scenario.issues:
                    contingency_plans.append({
                        "trigger": f"If {match.historical_scenario.issues[0]} occurs",
                        "action": match.historical_scenario.resolution,
                        "estimated_cost": match.historical_scenario.resolution_cost,
                        "estimated_time": match.historical_scenario.resolution_time,
                        "historical_effectiveness": match.historical_scenario.effectiveness_score,
                        "based_on_scenario": match.historical_scenario.scenario_id
                    })

        return contingency_plans

    def get_scenario_history(self, material: str, limit: int = 10) -> Dict[str, Any]:
        """Get historical scenarios for a material."""
        material_scenarios = [
            s for s in self.historical_scenarios
            if s.material == material
        ]

        return {
            "status": "success",
            "material": material,
            "total_scenarios": len(material_scenarios),
            "scenarios": [
                {
                    "scenario_id": s.scenario_id,
                    "timestamp": s.timestamp.isoformat(),
                    "demand": s.actual_demand,
                    "cost": s.cost,
                    "delivery_time": s.delivery_time,
                    "issues": s.issues,
                    "resolution": s.resolution,
                    "effectiveness": s.effectiveness_score
                }
                for s in sorted(material_scenarios, key=lambda x: x.timestamp, reverse=True)[:limit]
            ]
        }

    def compare_scenarios(
        self,
        scenario_ids: List[str]
    ) -> Dict[str, Any]:
        """Compare multiple scenarios."""
        scenarios_to_compare = [
            s for s in self.historical_scenarios
            if s.scenario_id in scenario_ids
        ]

        if not scenarios_to_compare:
            return {"status": "error", "message": "No scenarios found"}

        return {
            "status": "success",
            "comparison": [
                {
                    "scenario_id": s.scenario_id,
                    "material": s.material,
                    "demand": s.actual_demand,
                    "cost": s.cost,
                    "delivery_time": s.delivery_time,
                    "issues": s.issues,
                    "resolution": s.resolution,
                    "effectiveness": s.effectiveness_score
                }
                for s in scenarios_to_compare
            ],
            "summary": {
                "avg_cost": round(np.mean([s.cost for s in scenarios_to_compare]), 2),
                "avg_delivery_time": round(np.mean([s.delivery_time for s in scenarios_to_compare]), 2),
                "avg_effectiveness": round(np.mean([s.effectiveness_score for s in scenarios_to_compare]), 3)
            }
        }


# Global instance
scenario_analysis_service = ScenarioAnalysisService()
