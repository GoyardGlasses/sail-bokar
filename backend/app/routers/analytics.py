"""
Analytics API Router
Provides endpoints for advanced analytics, KPIs, and performance metrics
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import json

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


# Pydantic Models
class KPIMetric(BaseModel):
    name: str
    value: float
    target: float
    variance: float
    trend: str
    unit: str


class PerformanceData(BaseModel):
    date: str
    rakes: int
    tonnage: float
    cost: float
    utilization: float
    onTimePercentage: float
    avgDelay: float


class RouteAnalytics(BaseModel):
    route: str
    totalShipments: int
    avgCost: float
    avgDelay: float
    onTimePercentage: float
    costVariance: float
    delayVariance: float
    riskScore: float


class CostAnalytics(BaseModel):
    period: str
    totalCost: float
    avgCostPerTonne: float
    costBreakdown: Dict[str, float]
    costTrend: float
    savingsAchieved: float
    savingsPercentage: float


class Recommendation(BaseModel):
    title: str
    description: str
    impact: str
    priority: str


class KPIResponse(BaseModel):
    onTimeDelivery: KPIMetric
    costPerTonne: KPIMetric
    rakeUtilization: KPIMetric
    emptyRakes: KPIMetric
    customerSatisfaction: KPIMetric
    npsScore: KPIMetric
    operationalEfficiency: KPIMetric
    costSavings: KPIMetric


class AnalyticsResponse(BaseModel):
    status: str
    data: Dict
    timestamp: str


# Helper Functions
def generate_kpi_metrics() -> KPIResponse:
    """Generate KPI metrics"""
    return KPIResponse(
        onTimeDelivery=KPIMetric(
            name="On-Time Delivery",
            value=96.5,
            target=95,
            variance=1.5,
            trend="up",
            unit="%",
        ),
        costPerTonne=KPIMetric(
            name="Cost per Tonne",
            value=78,
            target=85,
            variance=-7,
            trend="down",
            unit="₹",
        ),
        rakeUtilization=KPIMetric(
            name="Rake Utilization",
            value=91.2,
            target=85,
            variance=6.2,
            trend="up",
            unit="%",
        ),
        emptyRakes=KPIMetric(
            name="Empty Rakes",
            value=2.1,
            target=5,
            variance=-2.9,
            trend="down",
            unit="%",
        ),
        customerSatisfaction=KPIMetric(
            name="Customer Satisfaction",
            value=4.7,
            target=4.5,
            variance=0.2,
            trend="up",
            unit="/5",
        ),
        npsScore=KPIMetric(
            name="NPS Score",
            value=68,
            target=60,
            variance=8,
            trend="up",
            unit="points",
        ),
        operationalEfficiency=KPIMetric(
            name="Operational Efficiency",
            value=87.3,
            target=80,
            variance=7.3,
            trend="up",
            unit="%",
        ),
        costSavings=KPIMetric(
            name="Cost Savings",
            value=15.2,
            target=12,
            variance=3.2,
            trend="up",
            unit="%",
        ),
    )


def generate_performance_data(days: int = 30) -> List[PerformanceData]:
    """Generate performance data for time period"""
    import random

    data = []
    for i in range(days):
        date = datetime.now() - timedelta(days=days - i - 1)
        data.append(
            PerformanceData(
                date=date.strftime("%Y-%m-%d"),
                rakes=random.randint(5, 13),
                tonnage=random.randint(400, 600),
                cost=random.randint(300000, 500000),
                utilization=random.randint(75, 95),
                onTimePercentage=random.randint(90, 100),
                avgDelay=random.random() * 2,
            )
        )
    return data


def generate_route_analytics() -> List[RouteAnalytics]:
    """Generate route analytics"""
    import random

    routes = [
        "Bokaro-Dhanbad",
        "Bokaro-Hatia",
        "Bokaro-Kolkata",
        "Bokaro-Patna",
        "Bokaro-Ranchi",
        "Bokaro-Durgapur",
        "Bokaro-Haldia",
    ]

    return [
        RouteAnalytics(
            route=route,
            totalShipments=random.randint(20, 70),
            avgCost=random.randint(600, 1000),
            avgDelay=random.random() * 3,
            onTimePercentage=random.randint(85, 100),
            costVariance=random.random() * 20,
            delayVariance=random.random() * 2,
            riskScore=random.randint(10, 50),
        )
        for route in routes
    ]


def generate_cost_analytics(period: str = "monthly") -> CostAnalytics:
    """Generate cost analytics"""
    import random

    totalCost = random.randint(1000000, 1500000)
    return CostAnalytics(
        period=period,
        totalCost=totalCost,
        avgCostPerTonne=random.randint(75, 100),
        costBreakdown={
            "loading": totalCost * 0.15,
            "transport": totalCost * 0.55,
            "demurrage": totalCost * 0.1,
            "toll": totalCost * 0.08,
            "insurance": totalCost * 0.05,
            "handling": totalCost * 0.07,
        },
        costTrend=-0.12,
        savingsAchieved=totalCost * 0.15,
        savingsPercentage=15,
    )


def generate_recommendations() -> List[Recommendation]:
    """Generate recommendations"""
    return [
        Recommendation(
            title="Optimize Low-Performing Routes",
            description="Routes Bokaro-Hatia and Bokaro-Kolkata have on-time % below 95%",
            impact="5-10% improvement",
            priority="high",
        ),
        Recommendation(
            title="Reduce Empty Rakes",
            description="Implement better load consolidation to reduce empty rakes from 2.1% to <1%",
            impact="₹50-100L annual savings",
            priority="high",
        ),
        Recommendation(
            title="Expand Cost Optimization",
            description="Current cost is 7% below target. Expand optimization to more routes.",
            impact="5-8% additional savings",
            priority="medium",
        ),
    ]


# API Endpoints
@router.get("/kpis", response_model=AnalyticsResponse)
async def get_kpis():
    """Get KPI metrics"""
    try:
        kpis = generate_kpi_metrics()
        return AnalyticsResponse(
            status="success",
            data=json.loads(kpis.model_dump_json()),
            timestamp=datetime.now().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/performance", response_model=AnalyticsResponse)
async def get_performance(days: int = Query(30, ge=1, le=365)):
    """Get performance data for specified days"""
    try:
        data = generate_performance_data(days)
        return AnalyticsResponse(
            status="success",
            data={"performance": [d.model_dump() for d in data]},
            timestamp=datetime.now().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/routes", response_model=AnalyticsResponse)
async def get_route_analytics():
    """Get route analytics"""
    try:
        routes = generate_route_analytics()
        return AnalyticsResponse(
            status="success",
            data={"routes": [r.model_dump() for r in routes]},
            timestamp=datetime.now().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/costs", response_model=AnalyticsResponse)
async def get_cost_analytics(period: str = Query("monthly")):
    """Get cost analytics"""
    try:
        costs = generate_cost_analytics(period)
        return AnalyticsResponse(
            status="success",
            data=costs.model_dump(),
            timestamp=datetime.now().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations", response_model=AnalyticsResponse)
async def get_recommendations():
    """Get recommendations"""
    try:
        recommendations = generate_recommendations()
        return AnalyticsResponse(
            status="success",
            data={"recommendations": [r.model_dump() for r in recommendations]},
            timestamp=datetime.now().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compare")
async def compare_scenarios(scenario1: Dict, scenario2: Dict):
    """Compare two scenarios"""
    try:
        comparison = {
            "scenario1": scenario1,
            "scenario2": scenario2,
            "differences": {
                "cost_difference": scenario2.get("cost", 0) - scenario1.get("cost", 0),
                "time_difference": scenario2.get("time", 0) - scenario1.get("time", 0),
                "efficiency_difference": scenario2.get("efficiency", 0)
                - scenario1.get("efficiency", 0),
            },
            "winner": "scenario1"
            if scenario1.get("score", 0) > scenario2.get("score", 0)
            else "scenario2",
        }
        return AnalyticsResponse(
            status="success",
            data=comparison,
            timestamp=datetime.now().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "analytics",
        "timestamp": datetime.now().isoformat(),
    }
