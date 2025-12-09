from __future__ import annotations

from typing import List

from ortools.sat.python import cp_model

from .models import Product, RakeTemplate, RakePlan, LoadAssignment, Wagon


_WEIGHT_SCALE = 1000  # tonnes -> scaled integer units


def _scale_tonnes(x: float) -> int:
    return int(round(x * _WEIGHT_SCALE))


def optimize_loading(
    products: List[Product],
    rake_template: RakeTemplate,
    allow_unassigned: bool = True,
    max_time_sec: float = 10.0,
) -> RakePlan:
    """Optimise loading of a fixed rake.

    Objective: maximise total loaded weight with a soft preference for
    higher-priority products.

    - Each product can be loaded into at most one slot (no splitting).
    - Slot-level and wagon-level weight limits are enforced.
    - Basic dimensional checks are enforced by only allowing assignments
      where the product fits inside the slot bounding box.
    """

    if not products:
        wagons = rake_template.instantiate_rake()
        return RakePlan(
            rake_template_id=rake_template.id,
            wagons=wagons,
            assignments=[],
            total_loaded_t=0.0,
            utilization_pct=0.0,
            unassigned_products=[],
        )

    wagons: List[Wagon] = rake_template.instantiate_rake()

    # Flatten slots: each entry keeps wagon and slot index
    slot_index = []  # (wagon_idx, slot_idx)
    for w_idx, wagon in enumerate(wagons):
        for s_idx, _ in enumerate(wagon.slots):
            slot_index.append((w_idx, s_idx))

    model = cp_model.CpModel()

    # Create assignment vars only where product fits the slot geometrically
    x = {}  # (p_idx, loc_idx) -> bool var
    prod_slot_list = [[] for _ in range(len(products))]

    for p_idx, p in enumerate(products):
        for loc_idx, (w_idx, s_idx) in enumerate(slot_index):
            wagon = wagons[w_idx]
            slot = wagon.slots[s_idx]

            fits = True
            if p.length_m is not None and p.length_m > slot.max_length_m:
                fits = False
            if p.width_m is not None and p.width_m > slot.max_width_m:
                fits = False
            if p.height_m is not None and p.height_m > slot.max_height_m:
                fits = False

            if not fits:
                continue

            var = model.NewBoolVar(f"x_p{p_idx}_l{loc_idx}")
            x[(p_idx, loc_idx)] = var
            prod_slot_list[p_idx].append(var)

        if not prod_slot_list[p_idx] and not allow_unassigned:
            raise ValueError(
                f"Product {p.id} cannot fit in any slot of rake template {rake_template.id} "
                "with allow_unassigned=False."
            )

    # Product assignment constraints
    for p_idx, vars_for_p in enumerate(prod_slot_list):
        if not vars_for_p:
            # No feasible slot: simply remains unassigned if allowed
            continue
        if allow_unassigned:
            model.Add(sum(vars_for_p) <= 1)
        else:
            model.Add(sum(vars_for_p) == 1)

    # Slot weight capacities
    for loc_idx, (w_idx, s_idx) in enumerate(slot_index):
        wagon = wagons[w_idx]
        slot = wagon.slots[s_idx]
        cap_int = _scale_tonnes(slot.max_weight_t)
        terms = []
        for p_idx, p in enumerate(products):
            var = x.get((p_idx, loc_idx))
            if var is None:
                continue
            terms.append(_scale_tonnes(p.weight_t) * var)
        if terms:
            model.Add(sum(terms) <= cap_int)

    # Wagon-level capacities
    for w_idx, wagon in enumerate(wagons):
        cap_int = _scale_tonnes(wagon.payload_limit_t)
        terms = []
        for loc_idx, (ww_idx, s_idx) in enumerate(slot_index):
            if ww_idx != w_idx:
                continue
            for p_idx, p in enumerate(products):
                var = x.get((p_idx, loc_idx))
                if var is None:
                    continue
                terms.append(_scale_tonnes(p.weight_t) * var)
        if terms:
            model.Add(sum(terms) <= cap_int)

    # Product loaded indicator
    loaded = []  # one per product
    for p_idx, vars_for_p in enumerate(prod_slot_list):
        if not vars_for_p:
            loaded.append(None)
            continue
        y = model.NewBoolVar(f"loaded_p{p_idx}")
        # y == OR(vars_for_p)
        model.AddMaxEquality(y, vars_for_p)
        loaded.append(y)

    # Objective: maximise total loaded weight with priority multiplier
    objective_terms = []
    for p_idx, p in enumerate(products):
        y = loaded[p_idx]
        if y is None:
            continue
        weight_int = _scale_tonnes(p.weight_t)
        # Priority scale: base 10 + priority (>=1) so that priority matters but
        # weight still dominates.
        coeff = weight_int * (10 + int(p.priority))
        objective_terms.append(coeff * y)

    if objective_terms:
        model.Maximize(sum(objective_terms))

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = float(max_time_sec)
    solver.parameters.num_search_workers = 8

    status = solver.Solve(model)
    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        raise RuntimeError(f"No feasible loading plan found for rake template {rake_template.id}")

    # Extract assignments
    assignments: List[LoadAssignment] = []
    assigned_weight_t = 0.0
    assigned_products = set()

    for (p_idx, loc_idx), var in x.items():
        if solver.BooleanValue(var):
            w_idx, s_idx = slot_index[loc_idx]
            wagon = wagons[w_idx]
            slot = wagon.slots[s_idx]
            p = products[p_idx]
            assignments.append(
                LoadAssignment(
                    product_id=p.id,
                    wagon_id=wagon.id,
                    slot_id=slot.id,
                )
            )
            assigned_weight_t += p.weight_t
            assigned_products.add(p.id)

    total_capacity_t = sum(w.payload_limit_t for w in wagons)
    utilization_pct = (assigned_weight_t / total_capacity_t * 100.0) if total_capacity_t > 0 else 0.0

    unassigned_products = [p.id for p in products if p.id not in assigned_products]

    return RakePlan(
        rake_template_id=rake_template.id,
        wagons=wagons,
        assignments=assignments,
        total_loaded_t=assigned_weight_t,
        utilization_pct=utilization_pct,
        unassigned_products=unassigned_products,
    )
