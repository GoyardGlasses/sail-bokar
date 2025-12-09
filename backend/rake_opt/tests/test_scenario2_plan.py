from __future__ import annotations

from rake_opt.models import Product, RakeTemplate
from rake_opt.scenario2_plan import choose_best_rake


def _make_template(template_id: str, payload_per_wagon: float, num_wagons: int) -> RakeTemplate:
  return RakeTemplate(
    id=template_id,
    wagon_type="TEST",
    num_wagons=num_wagons,
    wagon_params={
      "payload_limit_t": payload_per_wagon,
      "length_m": 12.0,
      "width_m": 2.8,
      "height_m": 2.8,
      "slots": [
        {"id": "front", "max_weight_t": payload_per_wagon / 2, "max_length_m": 6.0, "max_width_m": 2.8, "max_height_m": 2.8},
        {"id": "rear", "max_weight_t": payload_per_wagon / 2, "max_length_m": 6.0, "max_width_m": 2.8, "max_height_m": 2.8},
      ],
    },
  )


def test_choose_best_rake_picks_higher_utilisation_template() -> None:
  # Two candidate templates: both can carry all 60t, but one has lower total
  # capacity and therefore higher utilisation.
  t1 = _make_template("RAKE_HEAVY", payload_per_wagon=100.0, num_wagons=1)  # 100t capacity
  t2 = _make_template("RAKE_LIGHT", payload_per_wagon=40.0, num_wagons=2)   # 80t capacity

  products = [
    Product(id="P1", type="HR_COIL", weight_t=20.0, length_m=5.0, width_m=2.0, height_m=1.5),
    Product(id="P2", type="HR_COIL", weight_t=20.0, length_m=5.0, width_m=2.0, height_m=1.5),
    Product(id="P3", type="PLATE", weight_t=20.0, length_m=5.0, width_m=2.0, height_m=1.5),
  ]

  plan, template = choose_best_rake(products, candidate_templates=[t1, t2], allow_unassigned=False)

  # All products should be loaded in the selected plan
  assert set(plan.unassigned_products) == set()
  assert plan.total_loaded_t == 60.0

  # The lighter rake (80t) should be preferred due to better utilisation
  assert template.id == "RAKE_LIGHT"
