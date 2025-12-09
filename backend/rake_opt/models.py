from __future__ import annotations

from typing import List, Optional, Dict, Any

from pydantic import BaseModel, Field, validator


class Product(BaseModel):
    id: str
    type: str = Field(..., description="Logical material type, e.g. HR_COIL, CR_SHEET")
    weight_t: float = Field(..., gt=0, description="Weight in tonnes")
    length_m: Optional[float] = Field(None, gt=0)
    width_m: Optional[float] = Field(None, gt=0)
    height_m: Optional[float] = Field(None, gt=0)
    priority: int = Field(1, description="Higher = more important to load")
    destination: Optional[str] = None


class Slot(BaseModel):
    id: str
    max_weight_t: float = Field(..., gt=0)
    max_length_m: float = Field(..., gt=0)
    max_width_m: float = Field(..., gt=0)
    max_height_m: float = Field(..., gt=0)


class Wagon(BaseModel):
    id: str
    wagon_type: str
    payload_limit_t: float = Field(..., gt=0)
    length_m: float = Field(..., gt=0)
    width_m: float = Field(..., gt=0)
    height_m: float = Field(..., gt=0)
    slots: List[Slot]

    @property
    def total_slot_capacity_t(self) -> float:
        return sum(s.max_weight_t for s in self.slots)


class RakeTemplate(BaseModel):
    id: str
    wagon_type: str
    num_wagons: int = Field(..., gt=0)
    wagon_params: Dict[str, Any]

    def instantiate_rake(self) -> List[Wagon]:
        """Expand this template into concrete wagons with generated IDs.

        wagon_params is expected to contain:
        - payload_limit_t
        - length_m, width_m, height_m
        - slots: list of slot dicts with the Slot fields
        """

        slots_raw = self.wagon_params.get("slots", [])
        slots: List[Slot] = [Slot(**s) for s in slots_raw]

        wagons: List[Wagon] = []
        for idx in range(1, self.num_wagons + 1):
            wagons.append(
                Wagon(
                    id=f"{self.wagon_type}_{idx}",
                    wagon_type=self.wagon_type,
                    payload_limit_t=float(self.wagon_params["payload_limit_t"]),
                    length_m=float(self.wagon_params["length_m"]),
                    width_m=float(self.wagon_params["width_m"]),
                    height_m=float(self.wagon_params["height_m"]),
                    slots=slots,
                )
            )
        return wagons


class LoadAssignment(BaseModel):
    product_id: str
    wagon_id: str
    slot_id: Optional[str] = None
    x_offset_m: Optional[float] = None
    y_offset_m: Optional[float] = None


class RakePlan(BaseModel):
    rake_template_id: str
    wagons: List[Wagon]
    assignments: List[LoadAssignment]
    total_loaded_t: float
    utilization_pct: float
    unassigned_products: List[str]

    @validator("utilization_pct")
    def clamp_utilization(cls, v: float) -> float:
        if v < 0:
            return 0.0
        if v > 100:
            return 100.0
        return v
