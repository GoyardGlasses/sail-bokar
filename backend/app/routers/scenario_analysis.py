"""
API Router for Scenario-Based Predictive Analytics with Historical Context.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ..services.scenario_analysis_service import scenario_analysis_service
from ..schemas import BaseResponse

router = APIRouter(prefix="/scenario", tags=["Scenario Analysis"])


class AnalyzeScenarioRequest(BaseModel):
    """Request model for scenario analysis."""
    material: str = Field(..., description="Material type (e.g., HR_Coils, CR_Coils)")
    predicted_demand: float = Field(..., description="Predicted demand quantity", gt=0)
    confidence: float = Field(..., description="Confidence level (0-1)", ge=0, le=1)
    time_horizon: int = Field(..., description="Days into future", gt=0)
    risk_factors: Optional[List[str]] = Field(
        None,
        description="List of identified risk factors"
    )
    estimated_cost: Optional[float] = Field(
        None,
        description="Estimated cost"
    )
    estimated_delivery_time: Optional[int] = Field(
        None,
        description="Estimated delivery time in days"
    )


class ScenarioHistoryRequest(BaseModel):
    """Request model for scenario history."""
    material: str = Field(..., description="Material type")
    limit: int = Field(10, description="Number of scenarios to return", ge=1, le=100)


class CompareScenarioRequest(BaseModel):
    """Request model for scenario comparison."""
    scenario_ids: List[str] = Field(..., description="List of scenario IDs to compare")


@router.post("/analyze", response_model=BaseResponse)
async def analyze_scenario(request: AnalyzeScenarioRequest):
    """
    Analyze a prediction scenario against historical data.

    This endpoint:
    1. Takes a predicted scenario (demand, cost, delivery time, risk factors)
    2. Finds similar historical scenarios
    3. Extracts lessons learned from how similar situations were handled
    4. Creates multiple scenario-based predictions (best/likely/worst case)
    5. Generates decision recommendations based on historical effectiveness

    **Example Request:**
    ```json
    {
        "material": "HR_Coils",
        "predicted_demand": 2500,
        "confidence": 0.85,
        "time_horizon": 30,
        "risk_factors": ["Supply Shortage", "Market Volatility"],
        "estimated_cost": 35000,
        "estimated_delivery_time": 15
    }
    ```

    **Response includes:**
    - Similar historical scenarios with matching factors
    - Recommendations based on past resolutions
    - Multiple scenario predictions (best/likely/worst case)
    - Decision support with action items and contingency plans
    """
    try:
        result = scenario_analysis_service.analyze_scenario(
            material=request.material,
            predicted_demand=request.predicted_demand,
            confidence=request.confidence,
            time_horizon=request.time_horizon,
            risk_factors=request.risk_factors,
            estimated_cost=request.estimated_cost,
            estimated_delivery_time=request.estimated_delivery_time
        )

        return BaseResponse(
            status="success",
            message="Scenario analysis completed successfully",
            data=result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{material}", response_model=BaseResponse)
async def get_scenario_history(
    material: str,
    limit: int = Query(10, ge=1, le=100)
):
    """
    Get historical scenarios for a specific material.

    Returns the most recent historical scenarios for analysis and comparison.

    **Parameters:**
    - `material`: Material type (e.g., HR_Coils, CR_Coils)
    - `limit`: Number of scenarios to return (1-100)

    **Response includes:**
    - List of historical scenarios with dates, costs, delivery times
    - Issues faced and resolutions applied
    - Effectiveness scores
    """
    try:
        result = scenario_analysis_service.get_scenario_history(material, limit)
        return BaseResponse(
            status="success",
            message=f"Retrieved {len(result['scenarios'])} historical scenarios",
            data=result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compare", response_model=BaseResponse)
async def compare_scenarios(request: CompareScenarioRequest):
    """
    Compare multiple historical scenarios.

    Allows side-by-side comparison of different scenarios to identify patterns
    and differences in how similar situations were handled.

    **Example Request:**
    ```json
    {
        "scenario_ids": ["HIST_0001", "HIST_0015", "HIST_0042"]
    }
    ```

    **Response includes:**
    - Detailed comparison of each scenario
    - Summary statistics (average cost, delivery time, effectiveness)
    - Key differences and patterns
    """
    try:
        result = scenario_analysis_service.compare_scenarios(request.scenario_ids)

        if result.get("status") == "error":
            raise HTTPException(status_code=404, detail=result.get("message"))

        return BaseResponse(
            status="success",
            message="Scenario comparison completed",
            data=result
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/materials", response_model=BaseResponse)
async def get_available_materials():
    """
    Get list of materials with historical data.

    Returns all materials that have historical scenarios available for analysis.
    """
    try:
        materials = set(s.material for s in scenario_analysis_service.historical_scenarios)
        material_stats = {}

        for material in materials:
            scenarios = [
                s for s in scenario_analysis_service.historical_scenarios
                if s.material == material
            ]
            material_stats[material] = {
                "count": len(scenarios),
                "avg_cost": round(sum(s.cost for s in scenarios) / len(scenarios), 2),
                "avg_delivery_time": round(sum(s.delivery_time for s in scenarios) / len(scenarios), 2),
                "avg_effectiveness": round(sum(s.effectiveness_score for s in scenarios) / len(scenarios), 3)
            }

        return BaseResponse(
            status="success",
            message=f"Found {len(materials)} materials with historical data",
            data={
                "materials": sorted(list(materials)),
                "statistics": material_stats
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/statistics", response_model=BaseResponse)
async def get_scenario_statistics():
    """
    Get overall statistics about historical scenarios.

    Returns aggregate statistics across all historical scenarios.
    """
    try:
        scenarios = scenario_analysis_service.historical_scenarios

        if not scenarios:
            return BaseResponse(
                status="success",
                message="No historical scenarios available",
                data={"total_scenarios": 0}
            )

        import numpy as np

        costs = [s.cost for s in scenarios]
        times = [s.delivery_time for s in scenarios]
        effectiveness = [s.effectiveness_score for s in scenarios]
        issues_count = sum(len(s.issues) for s in scenarios)

        return BaseResponse(
            status="success",
            message="Retrieved scenario statistics",
            data={
                "total_scenarios": len(scenarios),
                "cost": {
                    "min": round(min(costs), 2),
                    "max": round(max(costs), 2),
                    "mean": round(np.mean(costs), 2),
                    "std": round(np.std(costs), 2)
                },
                "delivery_time": {
                    "min": min(times),
                    "max": max(times),
                    "mean": round(np.mean(times), 2),
                    "std": round(np.std(times), 2)
                },
                "effectiveness": {
                    "min": round(min(effectiveness), 3),
                    "max": round(max(effectiveness), 3),
                    "mean": round(np.mean(effectiveness), 3),
                    "std": round(np.std(effectiveness), 3)
                },
                "total_issues_encountered": issues_count,
                "avg_issues_per_scenario": round(issues_count / len(scenarios), 2)
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/decision-support", response_model=BaseResponse)
async def get_decision_support(request: AnalyzeScenarioRequest):
    """
    Get comprehensive decision support for a scenario.

    This is a convenience endpoint that performs full scenario analysis
    and returns only the decision support section.

    **Response includes:**
    - Recommended action (PROCEED, PROCEED_WITH_CAUTION, REVIEW_REQUIRED)
    - Expected outcomes (cost, time, success probability)
    - Action items and contingency plans
    - Key metrics and variance analysis
    """
    try:
        result = scenario_analysis_service.analyze_scenario(
            material=request.material,
            predicted_demand=request.predicted_demand,
            confidence=request.confidence,
            time_horizon=request.time_horizon,
            risk_factors=request.risk_factors,
            estimated_cost=request.estimated_cost,
            estimated_delivery_time=request.estimated_delivery_time
        )

        decision = result.get("decision_support", {})

        return BaseResponse(
            status="success",
            message="Decision support generated",
            data={
                "scenario_id": result.get("scenario_id"),
                "material": request.material,
                "decision_support": decision,
                "similar_scenarios_count": len(result.get("similar_scenarios", [])),
                "timestamp": result.get("timestamp")
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
