from __future__ import annotations

import math

import pytest

from rake_opt.models import Product, RakeTemplate
from rake_opt.scenario1_opt import optimize_loading


@pytest.fixture
def small_template() -> RakeTemplate:
  """Two-wagon BOXN-style rake with simple symmetric slots.

  Kept very small so the CP-SAT model solves quickly in tests.
  """

  return RakeTemplate(
    id="TEST_BOXN_RAKE_2",
    wagon_type="BOXN",
    num_wagons=2,
    wagon_params={
      "payload_limit_t": 60.0,
      "length_m": 12.0,
      "width_m": 2.8,
      "height_m": 2.8,
      "slots": [
        {"id": "front", "max_weight_t": 30.0, "max_length_m": 6.0, "max_width_m": 2.8, "max_height_m": 2.8},
        {"id": "rear", "max_weight_t": 30.0, "max_length_m": 6.0, "max_width_m": 2.8, "max_height_m": 2.8},
      ],
    },
  )


def test_optimize_loading_respects_capacity_and_dimensions(small_template: RakeTemplate) -> None:
  products = [
    Product(id="P1", type="HR_COIL", weight_t=10.0, length_m=5.0, width_m=2.0, height_m=1.5),
    Product(id="P2", type="HR_COIL", weight_t=20.0, length_m=5.0, width_m=2.0, height_m=1.5),
    Product(id="P3", type="PLATE", weight_t=25.0, length_m=5.5, width_m=2.5, height_m=1.8),
    # Too heavy for a single slot ( > 30t )
    Product(id="P4", type="PLATE", weight_t=40.0, length_m=5.0, width_m=2.0, height_m=1.5),
  ]

  plan = optimize_loading(products, small_template, allow_unassigned=True, max_time_sec=2.0)

  # Total loaded weight should not exceed total wagon capacity
  total_capacity = sum(w.payload_limit_t for w in plan.wagons)
  assert plan.total_loaded_t <= total_capacity + 1e-6

  # The overweight product should be left unassigned
  assert "P4" in plan.unassigned_products
  assert math.isclose(plan.total_loaded_t, 10.0 + 20.0 + 25.0, rel=1e-6)

  # Utilisation KPI should be consistent with loaded weight
  expected_util = plan.total_loaded_t / total_capacity * 100.0
  assert math.isclose(plan.utilization_pct, expected_util, rel=1e-6)


def test_optimize_loading_assigns_each_product_at_most_once(small_template: RakeTemplate) -> None:
  products = [
    Product(id="P1", type="HR_COIL", weight_t=15.0, length_m=5.0, width_m=2.0, height_m=1.5),
    Product(id="P2", type="HR_COIL", weight_t=15.0, length_m=5.0, width_m=2.0, height_m=1.5),
  ]

  plan = optimize_loading(products, small_template, allow_unassigned=False, max_time_sec=2.0)

  # Each product should appear in at most one assignment
  seen = set()
  for a in plan.assignments:
    key = (a.product_id, a.wagon_id, a.slot_id)
    assert key not in seen
    seen.add(key)

  assert {a.product_id for a in plan.assignments} == {"P1", "P2"}
