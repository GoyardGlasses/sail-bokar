"""
Pydantic schemas for request/response validation.
SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ============================================================================
# COMMON SCHEMAS
# ============================================================================

class BaseResponse(BaseModel):
    """Base response schema for all endpoints."""
    status: str = Field(..., description="Response status (success/error)")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    """Error response schema."""
    status: str = "error"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    message: str
    error_code: Optional[str] = None

# ============================================================================
# DEMAND FORECASTING SCHEMAS
# ============================================================================

class DemandForecastRequest(BaseModel):
    """Request schema for demand forecasting."""
    material_type: str = Field(..., description="Material type")
    destination: str = Field(..., description="Destination")
    quantity_tonnes: float = Field(..., gt=0, description="Quantity in tonnes")
    priority: str = Field(..., description="Priority level (HIGH/MEDIUM/LOW)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "material_type": "HR_Coils",
                "destination": "Kolkata",
                "quantity_tonnes": 500,
                "priority": "HIGH"
            }
        }

class DemandForecastResponse(BaseResponse):
    """Response schema for demand forecasting."""
    data: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Predicted demand metrics"
    )

# ============================================================================
# RAKE AVAILABILITY SCHEMAS
# ============================================================================

class RakeAvailabilityRequest(BaseModel):
    """Request schema for rake availability prediction."""
    date: str = Field(..., description="Date (YYYY-MM-DD)")
    destination: str = Field(..., description="Destination")
    material_type: str = Field(..., description="Material type")
    
    class Config:
        json_schema_extra = {
            "example": {
                "date": "2025-11-22",
                "destination": "Kolkata",
                "material_type": "HR_Coils"
            }
        }

class RakeAvailabilityResponse(BaseResponse):
    """Response schema for rake availability."""
    data: Optional[Dict[str, Any]] = None

# ============================================================================
# DELAY PREDICTION SCHEMAS
# ============================================================================

class DelayPredictionRequest(BaseModel):
    """Request schema for delay prediction."""
    route: str = Field(..., description="Route name")
    tonnes_dispatched: float = Field(..., gt=0, description="Tonnes dispatched")
    material_type: str = Field(..., description="Material type")
    weather_condition: Optional[str] = Field(None, description="Weather condition")
    
    class Config:
        json_schema_extra = {
            "example": {
                "route": "Kolkata-Bokaro",
                "tonnes_dispatched": 1000,
                "material_type": "HR_Coils",
                "weather_condition": "Clear"
            }
        }

class DelayPredictionResponse(BaseResponse):
    """Response schema for delay prediction."""
    data: Optional[Dict[str, Any]] = None

# ============================================================================
# THROUGHPUT PREDICTION SCHEMAS
# ============================================================================

class ThroughputPredictionRequest(BaseModel):
    """Request schema for throughput prediction."""
    loading_point: str = Field(..., description="Loading point (LP1/LP2/LP3)")
    material_type: str = Field(..., description="Material type")
    equipment_operational_count: int = Field(..., ge=0, description="Equipment count")
    shift: str = Field(..., description="Shift (Morning/Afternoon/Night)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "loading_point": "LP1",
                "material_type": "HR_Coils",
                "equipment_operational_count": 5,
                "shift": "Morning"
            }
        }

class ThroughputPredictionResponse(BaseResponse):
    """Response schema for throughput prediction."""
    data: Optional[Dict[str, Any]] = None

# ============================================================================
# COST PREDICTION SCHEMAS
# ============================================================================

class CostPredictionRequest(BaseModel):
    """Request schema for cost prediction."""
    route: str = Field(..., description="Route name")
    tonnes_dispatched: float = Field(..., gt=0, description="Tonnes dispatched")
    delay_hours: float = Field(..., ge=0, description="Delay hours")
    material_type: str = Field(..., description="Material type")
    
    class Config:
        json_schema_extra = {
            "example": {
                "route": "Kolkata-Bokaro",
                "tonnes_dispatched": 1000,
                "delay_hours": 2.5,
                "material_type": "HR_Coils"
            }
        }

class CostPredictionResponse(BaseResponse):
    """Response schema for cost prediction."""
    data: Optional[Dict[str, Any]] = None

# ============================================================================
# MODE CLASSIFIER SCHEMAS
# ============================================================================

class ModeClassificationRequest(BaseModel):
    """Request schema for transport mode classification."""
    quantity_tonnes: float = Field(..., gt=0, description="Quantity in tonnes")
    distance_km: float = Field(..., gt=0, description="Distance in km")
    priority: str = Field(..., description="Priority (HIGH/MEDIUM/LOW)")
    destination: str = Field(..., description="Destination")
    material_type: str = Field(..., description="Material type")
    
    class Config:
        json_schema_extra = {
            "example": {
                "quantity_tonnes": 500,
                "distance_km": 250,
                "priority": "HIGH",
                "destination": "Kolkata",
                "material_type": "HR_Coils"
            }
        }

class ModeClassificationResponse(BaseResponse):
    """Response schema for mode classification."""
    data: Optional[Dict[str, Any]] = None

# ============================================================================
# OPTIMIZATION SCHEMAS
# ============================================================================

class RakeDispatchPlan(BaseModel):
    """Rake dispatch plan item."""
    rake_id: str
    destination: str
    material_type: str
    tonnes: float
    estimated_cost: float
    estimated_delay_hours: float

class TruckDispatchPlan(BaseModel):
    """Truck dispatch plan item."""
    truck_id: str
    destination: str
    material_type: str
    tonnes: float
    estimated_cost: float
    estimated_delay_hours: float

class OptimizationSummary(BaseModel):
    """Summary of optimization results."""
    total_cost: float
    total_tonnage: float
    rail_vs_road_ratio: float
    total_rakes: int
    total_trucks: int
    estimated_completion_days: float

class OptimizationRequest(BaseModel):
    """Request schema for optimization."""
    orders: List[Dict[str, Any]] = Field(..., description="Customer orders")
    available_rakes: int = Field(..., ge=0, description="Available rakes")
    available_trucks: int = Field(..., ge=0, description="Available trucks")
    inventory: Dict[str, float] = Field(..., description="Current inventory by material")
    
    class Config:
        json_schema_extra = {
            "example": {
                "orders": [
                    {
                        "order_id": "ORD001",
                        "material_type": "HR_Coils",
                        "quantity_tonnes": 500,
                        "destination": "Kolkata",
                        "priority": "HIGH"
                    }
                ],
                "available_rakes": 10,
                "available_trucks": 25,
                "inventory": {
                    "HR_Coils": 5000,
                    "CR_Coils": 3000
                }
            }
        }

class OptimizationResponse(BaseResponse):
    """Response schema for optimization."""
    data: Optional[Dict[str, Any]] = None

# ============================================================================
# METADATA SCHEMAS
# ============================================================================

class ModelInfo(BaseModel):
    """Information about a trained model."""
    name: str
    type: str
    status: str
    file_path: str
    last_updated: Optional[str] = None

class HealthCheckResponse(BaseModel):
    """Health check response."""
    status: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    models_loaded: int
    models_failed: int
    version: str

class MetadataResponse(BaseResponse):
    """Response schema for metadata endpoints."""
    data: Optional[Dict[str, Any]] = None
