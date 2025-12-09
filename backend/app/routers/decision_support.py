"""
Decision Support System API Router
Integrates stock allocation, routing optimization, and decision support
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/decision-support", tags=["decision-support"])


class MaterialInfo(BaseModel):
    materialId: str
    materialName: str
    quantity: int
    reserved: int = 0
    quality: str = "A"
    age: int = 0


class StockyardInfo(BaseModel):
    stockyardId: str
    name: str
    location: str
    coordinates: Dict[str, float]
    materials: List[MaterialInfo]
    capacity: int = 1000
    currentLoad: int = 0


class OrderInfo(BaseModel):
    orderId: str
    materialId: str
    materialName: str
    quantity: int
    destination: str
    requiredDate: str
    priority: str = "medium"
    requiredQuality: str = "A"
    cost: float = 0


class LoadingPointInfo(BaseModel):
    pointId: str
    stockyardId: str
    name: str
    capacity: int
    currentLoad: int = 0
    equipment: List[str] = []
    operationalHours: Dict[str, str] = {"start": "06:00", "end": "22:00"}
    throughput: int = 100


class RouteInfo(BaseModel):
    routeId: str
    fromLocation: str
    toLocation: str
    distance: int
    estimatedTime: int
    cost: int
    congestionLevel: int = 0
    sidingCapacity: int = 90
    restrictions: List[str] = []


class ConstraintsInfo(BaseModel):
    minRakeSize: int = 55
    maxRakeSize: int = 90
    minOrderQty: int = 10
    maxOrderQty: int = 5000
    maxDistance: int = 1000
    minFeasibility: int = 50


class ObjectivesInfo(BaseModel):
    priority: str = "cost"  # cost, time, utilization
    maxCost: float = 1000000
    maxDeliveryHours: int = 72


class DecisionRequest(BaseModel):
    orders: List[OrderInfo]
    stockyards: List[StockyardInfo]
    loadingPoints: List[LoadingPointInfo]
    routes: List[RouteInfo]
    constraints: ConstraintsInfo = ConstraintsInfo()
    objectives: ObjectivesInfo = ObjectivesInfo()


class StockAllocationResult(BaseModel):
    orderId: str
    stockyardId: str
    stockyardName: str
    materialId: str
    materialName: str
    quantity: int
    cost: float
    distance: float
    quality: str
    feasibility: float
    reason: str
    destination: str
    priority: str


class RoutingDecisionResult(BaseModel):
    orderId: str
    loadingPointId: str
    routeId: str
    totalCost: float
    estimatedDeliveryTime: str
    feasibility: float
    reason: str


class RakeComposition(BaseModel):
    orderId: str
    materialId: str
    materialName: str
    quantity: int
    priority: str


class PlannedRake(BaseModel):
    rakeId: str
    loadingPointId: str
    routeId: str
    sourceStockyard: str
    destination: str
    composition: List[RakeComposition]
    totalLoad: int
    utilization: float
    cost: float
    estimatedDeliveryTime: str
    slaCompliance: bool = True


class Risk(BaseModel):
    type: str  # delay, cost, capacity, quality, constraint
    severity: str  # low, medium, high, critical
    message: str
    mitigation: str
    probability: float


class DecisionResponse(BaseModel):
    planId: str
    rakes: List[PlannedRake]
    totalCost: float
    totalLoad: int
    totalUtilization: float
    slaCompliance: float
    feasibility: float
    createdAt: str
    status: str = "draft"
    confidence: float
    explanation: str
    risks: List[Risk]
    recommendations: List[str]
    alternatives: List[Dict[str, Any]] = []


# Helper functions

def calculate_distance(from_coords: Dict, to_coords: Dict) -> float:
    """Calculate distance using Haversine formula"""
    from math import radians, cos, sin, asin, sqrt

    lat1, lon1 = from_coords.get("lat", 0), from_coords.get("lng", 0)
    lat2, lon2 = to_coords.get("lat", 0), to_coords.get("lng", 0)

    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    r = 6371
    return c * r


def allocate_stock_to_orders(
    orders: List[OrderInfo],
    stockyards: List[StockyardInfo],
    constraints: ConstraintsInfo,
) -> tuple[List[StockAllocationResult], List[str]]:
    """Allocate orders to stockyards"""
    allocations = []
    unallocated = []

    # Sort orders by priority
    priority_map = {"urgent": 4, "high": 3, "medium": 2, "low": 1}
    sorted_orders = sorted(
        orders,
        key=lambda x: (
            -priority_map.get(x.priority, 0),
            x.requiredDate,
        ),
    )

    for order in sorted_orders:
        # Find stockyards with this material
        candidates = []
        for sy in stockyards:
            material = next(
                (m for m in sy.materials if m.materialId == order.materialId),
                None,
            )
            if material and material.quantity - material.reserved >= order.quantity:
                distance = calculate_distance(sy.coordinates, order.destination)
                score = (
                    (material.quantity - material.reserved) / order.quantity * 0.35
                    + (100 - distance / 10) * 0.3
                    + (100 if material.quality == order.requiredQuality else 50) * 0.25
                    + (100 - material.age * 10) * 0.1
                )
                candidates.append((sy, material, distance, score))

        if not candidates:
            unallocated.append(order.orderId)
            continue

        # Pick best
        best_sy, best_material, distance, score = max(
            candidates, key=lambda x: x[3]
        )

        cost = (500 + distance * 5) * order.quantity

        allocation = StockAllocationResult(
            orderId=order.orderId,
            stockyardId=best_sy.stockyardId,
            stockyardName=best_sy.name,
            materialId=order.materialId,
            materialName=order.materialName,
            quantity=order.quantity,
            cost=cost,
            distance=distance,
            quality=best_material.quality,
            feasibility=score,
            reason=f"Allocated from {best_sy.name} ({distance:.0f}km away)",
            destination=order.destination,
            priority=order.priority,
        )

        allocations.append(allocation)
        best_material.reserved += order.quantity
        best_sy.currentLoad += order.quantity

    return allocations, unallocated


def optimize_routing(
    allocations: List[StockAllocationResult],
    loading_points: List[LoadingPointInfo],
    routes: List[RouteInfo],
    constraints: ConstraintsInfo,
) -> tuple[List[RoutingDecisionResult], List[str]]:
    """Optimize routing for allocations"""
    decisions = []
    unrouted = []

    for allocation in allocations:
        # Find loading points at this stockyard
        available_lps = [
            lp
            for lp in loading_points
            if lp.stockyardId == allocation.stockyardId
            and lp.currentLoad + allocation.quantity <= lp.capacity
        ]

        if not available_lps:
            unrouted.append(allocation.orderId)
            continue

        # Find routes
        possible_routes = [
            r
            for r in routes
            if r.fromLocation == allocation.stockyardId
            and r.toLocation == allocation.destination
            and r.sidingCapacity >= constraints.minRakeSize
        ]

        if not possible_routes:
            unrouted.append(allocation.orderId)
            continue

        # Score combinations
        best_score = -1
        best_lp = None
        best_route = None

        for lp in available_lps:
            for route in possible_routes:
                score = (
                    (lp.capacity - lp.currentLoad) / lp.capacity * 0.2
                    + (100 - route.cost / 100) * 0.3
                    + (100 - route.congestionLevel) * 0.2
                    + (100 - route.estimatedTime / 48 * 10) * 0.15
                    + 100 * 0.15  # Equipment score
                )

                if score > best_score:
                    best_score = score
                    best_lp = lp
                    best_route = route

        if best_lp and best_route:
            total_cost = allocation.cost + best_route.cost * allocation.quantity
            delivery_time = datetime.now()

            decision = RoutingDecisionResult(
                orderId=allocation.orderId,
                loadingPointId=best_lp.pointId,
                routeId=best_route.routeId,
                totalCost=total_cost,
                estimatedDeliveryTime=delivery_time.isoformat(),
                feasibility=best_score,
                reason=f"Route via {best_lp.name}",
            )

            decisions.append(decision)
            best_lp.currentLoad += allocation.quantity

    return decisions, unrouted


def form_rakes(
    allocations: List[StockAllocationResult],
    routing_decisions: List[RoutingDecisionResult],
) -> List[PlannedRake]:
    """Form rakes from allocations and routing"""
    rake_map = {}

    for allocation in allocations:
        routing = next(
            (r for r in routing_decisions if r.orderId == allocation.orderId),
            None,
        )
        if not routing:
            continue

        rake_key = f"{routing.loadingPointId}-{routing.routeId}"

        if rake_key not in rake_map:
            rake_map[rake_key] = {
                "rakeId": f"RAKE-{datetime.now().timestamp()}-{len(rake_map)}",
                "loadingPointId": routing.loadingPointId,
                "routeId": routing.routeId,
                "sourceStockyard": allocation.stockyardName,
                "destination": allocation.destination,
                "composition": [],
                "totalLoad": 0,
                "cost": 0,
                "estimatedDeliveryTime": routing.estimatedDeliveryTime,
            }

        rake_map[rake_key]["composition"].append(
            RakeComposition(
                orderId=allocation.orderId,
                materialId=allocation.materialId,
                materialName=allocation.materialName,
                quantity=allocation.quantity,
                priority=allocation.priority,
            )
        )

        rake_map[rake_key]["totalLoad"] += allocation.quantity
        rake_map[rake_key]["cost"] += routing.totalCost

    rakes = []
    for rake_data in rake_map.values():
        utilization = (rake_data["totalLoad"] / 90) * 100
        rake = PlannedRake(
            rakeId=rake_data["rakeId"],
            loadingPointId=rake_data["loadingPointId"],
            routeId=rake_data["routeId"],
            sourceStockyard=rake_data["sourceStockyard"],
            destination=rake_data["destination"],
            composition=rake_data["composition"],
            totalLoad=rake_data["totalLoad"],
            utilization=utilization,
            cost=rake_data["cost"],
            estimatedDeliveryTime=rake_data["estimatedDeliveryTime"],
        )
        rakes.append(rake)

    return rakes


def identify_risks(rakes: List[PlannedRake]) -> List[Risk]:
    """Identify risks in the plan"""
    risks = []

    for rake in rakes:
        if rake.utilization < 70:
            risks.append(
                Risk(
                    type="capacity",
                    severity="medium",
                    message=f"Low utilization ({rake.utilization:.1f}%) for rake {rake.rakeId}",
                    mitigation="Consider consolidating with other orders",
                    probability=0.5,
                )
            )

    return risks


def generate_recommendations(rakes: List[PlannedRake]) -> List[str]:
    """Generate recommendations"""
    recommendations = []

    avg_util = sum(r.utilization for r in rakes) / len(rakes) if rakes else 0
    if avg_util < 75:
        recommendations.append(
            f"Average utilization is {avg_util:.1f}%. Consider consolidating rakes."
        )

    if rakes:
        total_cost = sum(r.cost for r in rakes)
        total_load = sum(r.totalLoad for r in rakes)
        avg_cost_per_tonne = total_cost / total_load if total_load > 0 else 0
        recommendations.append(
            f"Average cost per tonne is ₹{avg_cost_per_tonne:.0f}. Monitor for optimization."
        )

    return recommendations


# API Endpoints


@router.post("/generate-decision", response_model=DecisionResponse)
async def generate_decision(request: DecisionRequest):
    """
    Generate integrated dispatch decision
    Combines stock allocation, routing optimization, and decision support
    """
    try:
        logger.info(f"Generating decision for {len(request.orders)} orders")

        # Step 1: Allocate stock
        allocations, unallocated = allocate_stock_to_orders(
            request.orders, request.stockyards, request.constraints
        )

        if not allocations:
            raise HTTPException(
                status_code=400,
                detail="No orders could be allocated to stockyards",
            )

        logger.info(f"Allocated {len(allocations)} orders, {len(unallocated)} unallocated")

        # Step 2: Optimize routing
        routing_decisions, unrouted = optimize_routing(
            allocations, request.loadingPoints, request.routes, request.constraints
        )

        if not routing_decisions:
            raise HTTPException(
                status_code=400,
                detail="No orders could be routed",
            )

        logger.info(f"Routed {len(routing_decisions)} orders, {len(unrouted)} unrouted")

        # Step 3: Form rakes
        rakes = form_rakes(allocations, routing_decisions)

        # Step 4: Calculate metrics
        total_cost = sum(r.cost for r in rakes)
        total_load = sum(r.totalLoad for r in rakes)
        avg_utilization = sum(r.utilization for r in rakes) / len(rakes) if rakes else 0

        # Step 5: Identify risks
        risks = identify_risks(rakes)

        # Step 6: Generate recommendations
        recommendations = generate_recommendations(rakes)

        # Step 7: Generate explanation
        explanation = f"""
📋 DISPATCH PLAN SUMMARY

Total Rakes: {len(rakes)}
Total Orders: {len(allocations)}
Total Cost: ₹{total_cost:,.0f}
Total Load: {total_load}T
Average Utilization: {avg_utilization:.1f}%

ALLOCATION RESULTS:
- Successfully allocated: {len(allocations)} orders
- Failed to allocate: {len(unallocated)} orders

ROUTING RESULTS:
- Successfully routed: {len(routing_decisions)} orders
- Failed to route: {len(unrouted)} orders

RAKE FORMATION:
- Total rakes formed: {len(rakes)}
- Average cost per tonne: ₹{total_cost/total_load:.0f}
"""

        # Step 8: Calculate confidence
        confidence = 85.0  # Base confidence

        response = DecisionResponse(
            planId=f"PLAN-{datetime.now().timestamp()}",
            rakes=rakes,
            totalCost=total_cost,
            totalLoad=total_load,
            totalUtilization=avg_utilization,
            slaCompliance=100.0,
            feasibility=100.0,
            createdAt=datetime.now().isoformat(),
            status="draft",
            confidence=confidence,
            explanation=explanation,
            risks=risks,
            recommendations=recommendations,
            alternatives=[],
        )

        logger.info(f"Decision generated successfully: {response.planId}")
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating decision: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating decision: {str(e)}")


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "decision-support",
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/status")
async def get_status():
    """Get service status"""
    return {
        "service": "decision-support",
        "status": "operational",
        "features": [
            "stock-allocation",
            "routing-optimization",
            "rake-formation",
            "risk-assessment",
            "recommendations",
        ],
        "timestamp": datetime.now().isoformat(),
    }
