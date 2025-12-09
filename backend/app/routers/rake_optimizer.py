"""
Rake & Transport Optimizer Router
Exposes endpoints to run the global rake optimizer and fetch the latest plan.
"""

from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.routers.data_import_pipeline import pipeline
from app.services.rake_optimizer import (
    build_and_solve_rake_plan,
    build_and_solve_multi_period_rake_plan,
)
from app.services.rake_plan_history import rake_plan_history


router = APIRouter(prefix="/api/rake-optimizer", tags=["rake-optimizer"])


class RakeOptimizerRunRequest(BaseModel):
    """Request payload for running rake optimizer."""

    planning_horizon_days: int = Field(
        1,
        ge=1,
        description="Planning horizon in days (1 = daily plan)",
    )


class MultiPeriodRakeOptimizerRunRequest(BaseModel):
    """Request payload for running multi-period rake optimizer."""

    planning_horizon_days: int = Field(
        3,
        ge=2,
        description="Multi-period planning horizon in days (>=2)",
    )


@router.post("/run")
async def run_rake_optimizer(request: RakeOptimizerRunRequest) -> Dict[str, Any]:
    """Run the global rake & transport optimizer.

    Uses the latest imported data from the DataPipeline and stores the
    resulting plan on the shared pipeline instance.
    """
    if not pipeline.imported_data:
        raise HTTPException(
            status_code=400,
            detail="No data imported. Please import data first via /api/data-import/import.",
        )

    # It is okay if models have not yet been executed; optimizer can still run
    plan = build_and_solve_rake_plan(
        pipeline.imported_data,
        pipeline.predictions,
        planning_horizon_days=request.planning_horizon_days,
    )
    pipeline.rake_plan = plan

    return {
        "status": "success",
        "timestamp": datetime.utcnow().isoformat(),
        "message": "Rake optimizer executed successfully",
        "rake_plan": plan,
    }


@router.get("/plan")
async def get_rake_plan() -> Dict[str, Any]:
    """Get the latest rake & transport plan.

    Returns the most recent plan generated either by /run or by the
    DataPipeline.run_all_models integration.
    """
    if not pipeline.rake_plan:
        raise HTTPException(
            status_code=400,
            detail="No rake plan available. Run /api/rake-optimizer/run or /api/data-import/analyze first.",
        )

    return {
        "status": "success",
        "timestamp": datetime.utcnow().isoformat(),
        "rake_plan": pipeline.rake_plan,
    }


@router.get("/history")
async def get_rake_plan_history(limit: int = 20) -> Dict[str, Any]:
    """Get history of recent rake plans.

    Returns a list of recent plans with summary metrics and plan_ids
    that can be used to fetch full details.
    """
    history = rake_plan_history.get_history(limit=limit)

    return {
        "status": "success",
        "timestamp": datetime.utcnow().isoformat(),
        "total_plans": len(history),
        "plans": history,
    }


@router.get("/history/{plan_id}")
async def get_rake_plan_by_id(plan_id: str) -> Dict[str, Any]:
    """Get a specific rake plan from history by plan_id."""
    plan = rake_plan_history.get_plan(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Rake plan not found")

    return {
        "status": "success",
        "timestamp": datetime.utcnow().isoformat(),
        "rake_plan": plan,
    }


@router.post("/multi-period/run")
async def run_multi_period_rake_optimizer(
    request: MultiPeriodRakeOptimizerRunRequest,
) -> Dict[str, Any]:
    """Run the multi-period rake & transport optimizer.

    This decomposes the planning horizon into daily buckets based on order
    due dates and runs the existing daily optimizer per day, then aggregates
    the results into a multi-day plan.
    """
    if not pipeline.imported_data:
        raise HTTPException(
            status_code=400,
            detail="No data imported. Please import data first via /api/data-import/import.",
        )

    plan = build_and_solve_multi_period_rake_plan(
        pipeline.imported_data,
        pipeline.predictions,
        planning_horizon_days=request.planning_horizon_days,
    )
    pipeline.multi_period_rake_plan = plan

    return {
        "status": "success",
        "timestamp": datetime.utcnow().isoformat(),
        "message": "Multi-period rake optimizer executed successfully",
        "multi_period_rake_plan": plan,
    }


@router.get("/multi-period/plan")
async def get_multi_period_rake_plan() -> Dict[str, Any]:
    """Get the latest multi-period rake & transport plan."""
    multi_plan = getattr(pipeline, "multi_period_rake_plan", None)
    if not multi_plan:
        raise HTTPException(
            status_code=400,
            detail=(
                "No multi-period rake plan available. Run /api/rake-optimizer/multi-period/run "
                "or /api/data-import/analyze first."
            ),
        )

    return {
        "status": "success",
        "timestamp": datetime.utcnow().isoformat(),
        "multi_period_rake_plan": multi_plan,
    }
