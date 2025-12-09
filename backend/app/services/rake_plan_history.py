"""Rake Plan History management for the global CP-SAT rake optimizer.

This module provides a lightweight file-backed history store for rake plans
produced by the RakeFormationOptimizer. It is intentionally simple and
self-contained so it can be used both by the optimizer service and the
API router without requiring a full database schema.
"""

import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class RakePlanHistory:
    """Manage history of rake plans on disk.

    Each record in the history file contains a compact summary plus the
    full plan payload as returned by build_and_solve_rake_plan.
    """

    def __init__(self, history_file: str = "backend/logs/rake_optimizer_history.json"):
        self.history_file = history_file
        self.plans: List[Dict[str, Any]] = []
        self._load()

    def _load(self) -> None:
        """Load history from JSON file if present."""
        try:
            if os.path.exists(self.history_file):
                with open(self.history_file, "r") as f:
                    self.plans = json.load(f)
                logger.info("Loaded %d rake plan history records", len(self.plans))
        except Exception as exc:
            logger.error("Error loading rake plan history: %s", exc)
            self.plans = []

    def _save(self) -> None:
        """Persist history to JSON file."""
        try:
            os.makedirs(os.path.dirname(self.history_file), exist_ok=True)
            with open(self.history_file, "w") as f:
                json.dump(self.plans, f, indent=2, default=str)
            logger.info("Saved %d rake plan history records", len(self.plans))
        except Exception as exc:
            logger.error("Error saving rake plan history: %s", exc)

    def add_plan(self, plan: Dict[str, Any]) -> Dict[str, Any]:
        """Add a plan to history and persist it.

        The plan is expected to be the full payload returned by
        build_and_solve_rake_plan, including the nested solver "solution".
        """
        plan_id = plan.get("plan_id") or f"RAKE-PLAN-{int(datetime.utcnow().timestamp())}"
        plan["plan_id"] = plan_id

        solution = plan.get("solution", {}) or {}
        summary = solution.get("summary", {}) or {}

        record: Dict[str, Any] = {
            "plan_id": plan_id,
            "generated_at": plan.get("generated_at"),
            "planning_horizon_days": plan.get("planning_horizon_days"),
            "total_cost": summary.get("total_cost"),
            "total_tonnage": summary.get("total_tonnage"),
            "total_rakes": summary.get("total_rakes"),
            "total_trucks": summary.get("total_trucks"),
            "solver_status": solution.get("solver_status"),
            "objective_value": solution.get("objective_value"),
            "plan": plan,
        }

        self.plans.append(record)
        self._save()
        return record

    def get_history(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Return the most recent plan summaries, newest last."""
        if limit <= 0:
            return []
        return self.plans[-limit:]

    def get_plan(self, plan_id: str) -> Optional[Dict[str, Any]]:
        """Return the full stored plan for a given plan_id, if any."""
        for record in self.plans:
            if record.get("plan_id") == plan_id:
                # Prefer the embedded full plan if present
                return record.get("plan") or record
        return None


# Shared history instance used across the app
rake_plan_history = RakePlanHistory()
