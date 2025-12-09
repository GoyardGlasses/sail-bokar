"""
High-level Rake & Transport Optimizer service.
Builds optimizer input from imported_data and calls the OR-Tools CP-SAT
RakeFormationOptimizer via OptimizeService.
"""

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from ortools.sat.python import cp_model
from app.services.optimize_service import optimize_service
from app.config import settings
from app.utils import app_logger
from app.services.rake_plan_history import rake_plan_history


def _map_orders(imported_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Map imported orders into optimizer-friendly format."""
    mapped: List[Dict[str, Any]] = []
    raw_orders = imported_data.get("orders", []) or []

    for idx, order in enumerate(raw_orders):
        order_id = (
            order.get("id")
            or order.get("orderId")
            or f"ORD_{idx + 1:03d}"
        )
        material = (
            order.get("material")
            or order.get("product")
            or settings.MATERIALS[0]
        )
        destination = order.get("destination") or settings.DESTINATIONS[0]
        quantity_raw = order.get("quantity", 0) or 0
        try:
            quantity = float(quantity_raw)
        except (TypeError, ValueError):
            quantity = 0.0

        priority_raw = order.get("priority", "MEDIUM")
        priority = str(priority_raw).upper()

        due_date = (
            order.get("due_date")
            or order.get("dueDate")
            or order.get("delivery_date")
            or order.get("deliveryDate")
        )

        mapped.append(
            {
                "order_id": str(order_id),
                "material_type": str(material),
                "quantity_tonnes": quantity,
                "destination": str(destination),
                "priority": priority,
                "due_date": due_date,
            }
        )

    return mapped


def _build_inventory(imported_data: Dict[str, Any]) -> Dict[str, float]:
    """Build simple material-wise inventory from imported materials."""
    inventory: Dict[str, float] = {}
    materials = imported_data.get("materials", []) or []

    for mat in materials:
        name = (
            mat.get("name")
            or mat.get("material")
            or settings.MATERIALS[0]
        )
        qty_raw = mat.get("quantity", 0) or 0
        try:
            qty = float(qty_raw)
        except (TypeError, ValueError):
            qty = 0.0

        key = str(name)
        inventory[key] = inventory.get(key, 0.0) + qty

    return inventory


def _count_available_rakes(imported_data: Dict[str, Any]) -> int:
    """Count available rakes from imported data."""
    rakes = imported_data.get("rakes", []) or []
    if not rakes:
        return 0

    available = [
        r
        for r in rakes
        if str(r.get("status", "available")).lower() == "available"
    ]
    return len(available) if available else len(rakes)


def _estimate_available_trucks(imported_data: Dict[str, Any]) -> int:
    """Estimate available trucks from imported vehicles if present."""
    vehicles = imported_data.get("vehicles") or imported_data.get("trucks")
    if isinstance(vehicles, list) and vehicles:
        return len(vehicles)

    # Fallback to a reasonable default
    return 20


def build_and_solve_rake_plan(
    imported_data: Dict[str, Any],
    predictions: Dict[str, Any] | None = None,
    planning_horizon_days: int = 1,
) -> Dict[str, Any]:
    """Build optimizer input from imported_data and solve for rake plan.

    This is the main entry point used by the DataPipeline and API router.
    """
    if not imported_data or not imported_data.get("orders"):
        app_logger.warning("Rake optimizer called with no orders in imported_data")

    orders = _map_orders(imported_data)
    available_rakes = _count_available_rakes(imported_data)
    available_trucks = _estimate_available_trucks(imported_data)
    inventory = _build_inventory(imported_data)

    request_json: Dict[str, Any] = {
        "orders": orders,
        "available_rakes": available_rakes,
        "available_trucks": available_trucks,
        "inventory": inventory,
    }

    optimizer_input = optimize_service.build_optimizer_input(request_json)
    solution = optimize_service.run_optimizer(optimizer_input)

    plan: Dict[str, Any] = {
        "generated_at": datetime.utcnow().isoformat(),
        "planning_horizon_days": planning_horizon_days,
        "input_summary": {
            "num_orders": len(orders),
            "available_rakes": available_rakes,
            "available_trucks": available_trucks,
            "materials_in_inventory": len(inventory),
        },
        "solution": solution,
    }

    # Store plan in history with a generated plan_id
    history_record = rake_plan_history.add_plan(plan)
    plan["plan_id"] = history_record.get("plan_id", plan.get("plan_id"))

    return plan


def _extract_order_due_date_value(order: Dict[str, Any]) -> Any:
    """Extract a generic due-date value from raw imported order data."""
    return (
        order.get("due_date")
        or order.get("dueDate")
        or order.get("delivery_date")
        or order.get("deliveryDate")
        or order.get("deadline")
        or order.get("requiredDate")
    )


def _safe_parse_datetime(value: Any) -> Optional[datetime]:
    """Best-effort parse of a datetime value from various formats."""
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value)
        except ValueError:
            return None
    return None


def _allocate_orders_to_days_cp(
    raw_orders: List[Dict[str, Any]],
    planning_start_date,
    planning_horizon_days: int,
    available_rakes: int,
    available_trucks: int,
) -> List[List[Dict[str, Any]]]:
    """Allocate orders to days across the horizon using a small CP-SAT model."""
    if planning_horizon_days <= 0:
        return []

    # Default greedy allocation by due date (used as fallback or if model can't improve)
    greedy_orders_by_day: List[List[Dict[str, Any]]] = [
        [] for _ in range(planning_horizon_days)
    ]

    for order in raw_orders:
        dt = _safe_parse_datetime(_extract_order_due_date_value(order))
        if dt is None:
            day_index = 0
        else:
            delta_days = (dt.date() - planning_start_date).days
            if delta_days < 0:
                day_index = 0
            elif delta_days >= planning_horizon_days:
                day_index = planning_horizon_days - 1
            else:
                day_index = delta_days
        greedy_orders_by_day[day_index].append(order)

    if not raw_orders or planning_horizon_days == 1:
        return greedy_orders_by_day

    # Approximate total daily capacity (rail + road) in tonnes
    try:
        wagon_capacity = float(getattr(settings, "WAGON_CAPACITY_TONNES", 63))
    except Exception:
        wagon_capacity = 63.0

    max_wagons_per_rake = 59
    rail_capacity_per_day = max(0.0, float(available_rakes) * max_wagons_per_rake * wagon_capacity)
    road_capacity_per_day = max(0.0, float(available_trucks) * 22.0)
    approximate_capacity_per_day = rail_capacity_per_day + road_capacity_per_day

    quantities: List[int] = []
    due_day_indices: List[int] = []
    priority_weights: List[float] = []

    for order in raw_orders:
        quantity_raw = order.get("quantity_tonnes") or order.get("quantity") or 0
        try:
            q = float(quantity_raw or 0)
        except (TypeError, ValueError):
            q = 0.0
        quantities.append(max(0, int(round(q))))

        dt = _safe_parse_datetime(_extract_order_due_date_value(order))
        if dt is None:
            due_idx = planning_horizon_days - 1
        else:
            delta_days = (dt.date() - planning_start_date).days
            if delta_days < 0:
                due_idx = 0
            elif delta_days >= planning_horizon_days:
                due_idx = planning_horizon_days - 1
            else:
                due_idx = delta_days
        due_day_indices.append(due_idx)

        priority_raw = order.get("priority", "MEDIUM")
        pr = str(priority_raw).upper()
        if pr == "HIGH":
            weight = 2.0
        elif pr == "LOW":
            weight = 0.5
        else:
            weight = 1.0
        priority_weights.append(weight)

    total_demand = sum(quantities)
    if approximate_capacity_per_day <= 0:
        approximate_capacity_per_day = float(total_demand)

    if total_demand <= 0:
        return greedy_orders_by_day

    model = cp_model.CpModel()
    num_orders = len(raw_orders)
    horizon = planning_horizon_days

    x: Dict[tuple, cp_model.IntVar] = {}
    overcap_vars: List[cp_model.IntVar] = []

    # Decision variables: x[i, t] = 1 if order i is scheduled on day t
    for i in range(num_orders):
        for t in range(horizon):
            x[(i, t)] = model.NewBoolVar(f"order_{i}_day_{t}")

    # Over-capacity slack per day (soft capacity constraint)
    for t in range(horizon):
        overcap = model.NewIntVar(0, int(total_demand), f"overcap_day_{t}")
        overcap_vars.append(overcap)

    # Each order assigned to exactly one day
    for i in range(num_orders):
        model.Add(sum(x[(i, t)] for t in range(horizon)) == 1)

    # Daily capacity constraints with slack
    capacity_int = int(round(approximate_capacity_per_day))
    for t in range(horizon):
        lhs = []
        for i in range(num_orders):
            q_i = quantities[i]
            if q_i > 0:
                lhs.append(q_i * x[(i, t)])
        if lhs:
            model.Add(sum(lhs) <= capacity_int + overcap_vars[t])

    # Objective: minimize lateness (days after due date) weighted by quantity and priority,
    # plus a strong penalty on capacity violations.
    base_penalty_per_tonne_day = 10
    overcap_penalty_per_tonne = base_penalty_per_tonne_day * 50

    objective_terms = []
    for i in range(num_orders):
        q_i = quantities[i]
        if q_i <= 0:
            continue
        due_idx = due_day_indices[i]
        pr_weight = priority_weights[i]
        for t in range(horizon):
            lateness_days = max(0, t - due_idx)
            if lateness_days <= 0:
                continue
            coeff = int(round(q_i * pr_weight * base_penalty_per_tonne_day * lateness_days))
            if coeff > 0:
                objective_terms.append(coeff * x[(i, t)])

    for overcap in overcap_vars:
        if overcap_penalty_per_tonne > 0:
            objective_terms.append(overcap * overcap_penalty_per_tonne)

    if objective_terms:
        model.Minimize(sum(objective_terms))

    solver = cp_model.CpSolver()
    try:
        if hasattr(solver.parameters, "max_time_in_seconds"):
            solver.parameters.max_time_in_seconds = float(
                getattr(settings, "OPTIMIZER_TIME_LIMIT", 10)
            )
        if hasattr(solver.parameters, "random_seed"):
            solver.parameters.random_seed = int(
                getattr(settings, "OPTIMIZER_RANDOM_SEED", 42)
            )
    except Exception:
        pass

    status = solver.Solve(model)
    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        app_logger.warning(
            "Multi-period CP allocator infeasible or failed (status=%s). Falling back to greedy bucketing.",
            status,
        )
        return greedy_orders_by_day

    orders_by_day: List[List[Dict[str, Any]]] = [
        [] for _ in range(planning_horizon_days)
    ]

    for i, order in enumerate(raw_orders):
        assigned_day = None
        for t in range(horizon):
            if solver.Value(x[(i, t)]):
                assigned_day = t
                break

        if assigned_day is None:
            assigned_day = min(max(due_day_indices[i], 0), planning_horizon_days - 1)

        orders_by_day[assigned_day].append(order)

    return orders_by_day


def build_and_solve_multi_period_rake_plan(
    imported_data: Dict[str, Any],
    predictions: Dict[str, Any] | None = None,
    planning_horizon_days: int = 3,
) -> Dict[str, Any]:
    """Build and solve a multi-period rake plan by slicing orders across days."""
    if planning_horizon_days <= 1:
        single_plan = build_and_solve_rake_plan(
            imported_data, predictions, planning_horizon_days=1
        )
        solution = single_plan.get("solution", {}) or {}
        summary = solution.get("summary", {}) or {}
        return {
            "generated_at": single_plan.get("generated_at"),
            "planning_horizon_days": 1,
            "planning_start_date": (single_plan.get("generated_at") or datetime.utcnow().isoformat()).split("T")[0],
            "input_summary": single_plan.get("input_summary", {}),
            "summary": {
                "total_cost": summary.get("total_cost", 0),
                "total_tonnage": summary.get("total_tonnage", 0),
                "total_rakes": summary.get("total_rakes", 0),
                "total_trucks": summary.get("total_trucks", 0),
            },
            "daily_plans": [
                {
                    "day_index": 0,
                    "date": (single_plan.get("generated_at") or datetime.utcnow().isoformat()).split("T")[0],
                    "has_plan": True,
                    "rake_plan": single_plan,
                }
            ],
        }

    raw_orders = imported_data.get("orders", []) or []
    if not raw_orders:
        return {
            "generated_at": datetime.utcnow().isoformat(),
            "planning_horizon_days": planning_horizon_days,
            "planning_start_date": datetime.utcnow().date().isoformat(),
            "input_summary": {
                "num_orders": 0,
                "orders_by_day": [0 for _ in range(planning_horizon_days)],
                "available_rakes_per_day": 0,
                "available_trucks_per_day": 0,
            },
            "summary": {
                "total_cost": 0,
                "total_tonnage": 0,
                "total_rakes": 0,
                "total_trucks": 0,
            },
            "daily_plans": [],
        }

    due_datetimes = []
    for order in raw_orders:
        dt = _safe_parse_datetime(_extract_order_due_date_value(order))
        if dt is not None:
            due_datetimes.append(dt)

    if due_datetimes:
        planning_start_date = min(due_datetimes).date()
    else:
        planning_start_date = datetime.utcnow().date()

    available_rakes = _count_available_rakes(imported_data)
    available_trucks = _estimate_available_trucks(imported_data)

    orders_by_day = _allocate_orders_to_days_cp(
        raw_orders,
        planning_start_date,
        planning_horizon_days,
        available_rakes,
        available_trucks,
    )

    daily_plans: List[Dict[str, Any]] = []
    total_cost = 0.0
    total_tonnage = 0.0
    total_rakes = 0
    total_trucks = 0

    for day_index in range(planning_horizon_days):
        day_date = planning_start_date + timedelta(days=day_index)
        day_orders = orders_by_day[day_index]

        if not day_orders:
            daily_plans.append(
                {
                    "day_index": day_index,
                    "date": day_date.isoformat(),
                    "has_plan": False,
                    "rake_plan": None,
                }
            )
            continue

        day_imported_data = dict(imported_data)
        day_imported_data["orders"] = day_orders

        day_plan = build_and_solve_rake_plan(
            day_imported_data, predictions, planning_horizon_days=1
        )
        solution = day_plan.get("solution", {}) or {}
        summary = solution.get("summary", {}) or {}

        total_cost += float(summary.get("total_cost") or 0)
        total_tonnage += float(summary.get("total_tonnage") or 0)
        total_rakes += int(summary.get("total_rakes") or 0)
        total_trucks += int(summary.get("total_trucks") or 0)

        daily_plans.append(
            {
                "day_index": day_index,
                "date": day_date.isoformat(),
                "has_plan": True,
                "rake_plan": day_plan,
            }
        )

    input_summary = {
        "num_orders": len(raw_orders),
        "orders_by_day": [len(bucket) for bucket in orders_by_day],
        "available_rakes_per_day": available_rakes,
        "available_trucks_per_day": available_trucks,
    }

    return {
        "generated_at": datetime.utcnow().isoformat(),
        "planning_horizon_days": planning_horizon_days,
        "planning_start_date": planning_start_date.isoformat(),
        "input_summary": input_summary,
        "summary": {
            "total_cost": total_cost,
            "total_tonnage": total_tonnage,
            "total_rakes": total_rakes,
            "total_trucks": total_trucks,
        },
        "daily_plans": daily_plans,
    }
