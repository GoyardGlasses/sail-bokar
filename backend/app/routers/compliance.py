"""
Compliance & Audit API Router
Provides endpoints for compliance checking, audit trails, and regulatory tracking
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
import json

router = APIRouter(prefix="/api/compliance", tags=["compliance"])


# Pydantic Models
class ComplianceRule(BaseModel):
    ruleId: str
    category: str
    rule: str
    description: str
    severity: str
    status: str
    lastChecked: str


class ComplianceViolation(BaseModel):
    violationId: str
    ruleId: str
    rule: str
    severity: str
    timestamp: str
    entity: str
    entityId: str
    description: str
    status: str
    resolution: Optional[str] = None


class AuditLog(BaseModel):
    logId: str
    timestamp: str
    action: str
    user: str
    entity: str
    entityId: str
    status: str
    details: str


class RegulatoryRequirement(BaseModel):
    requirementId: str
    regulation: str
    requirement: str
    applicability: str
    deadline: Optional[str] = None
    status: str
    evidence: List[str]


class ComplianceScore(BaseModel):
    score: int
    grade: str
    status: str
    violations: int
    compliantRules: int


class ComplianceResponse(BaseModel):
    status: str
    data: Dict
    timestamp: str


# Helper Functions
def get_compliance_rules() -> List[ComplianceRule]:
    """Get all compliance rules"""
    return [
        ComplianceRule(
            ruleId="RAKE-001",
            category="Rake Formation",
            rule="Minimum Rake Size",
            description="Minimum rake size must be 50 wagons",
            severity="high",
            status="active",
            lastChecked=datetime.now().isoformat(),
        ),
        ComplianceRule(
            ruleId="RAKE-002",
            category="Rake Formation",
            rule="Maximum Rake Size",
            description="Maximum rake size must not exceed 100 wagons",
            severity="high",
            status="active",
            lastChecked=datetime.now().isoformat(),
        ),
        ComplianceRule(
            ruleId="RAKE-003",
            category="Rake Formation",
            rule="Load Balance",
            description="Load must be balanced across all wagons (±10%)",
            severity="medium",
            status="active",
            lastChecked=datetime.now().isoformat(),
        ),
        ComplianceRule(
            ruleId="LOAD-001",
            category="Loading",
            rule="Loading Time Limit",
            description="Loading must be completed within 8 hours",
            severity="high",
            status="active",
            lastChecked=datetime.now().isoformat(),
        ),
        ComplianceRule(
            ruleId="LOAD-002",
            category="Loading",
            rule="Safety Compliance",
            description="All safety protocols must be followed during loading",
            severity="critical",
            status="active",
            lastChecked=datetime.now().isoformat(),
        ),
        ComplianceRule(
            ruleId="DISP-001",
            category="Dispatch",
            rule="SLA Compliance",
            description="Dispatch must meet customer SLA requirements",
            severity="high",
            status="active",
            lastChecked=datetime.now().isoformat(),
        ),
        ComplianceRule(
            ruleId="DISP-002",
            category="Dispatch",
            rule="Documentation",
            description="All dispatch documents must be complete and signed",
            severity="high",
            status="active",
            lastChecked=datetime.now().isoformat(),
        ),
        ComplianceRule(
            ruleId="COST-001",
            category="Cost Control",
            rule="Cost Limit",
            description="Cost per tonne must not exceed budget limit",
            severity="medium",
            status="active",
            lastChecked=datetime.now().isoformat(),
        ),
        ComplianceRule(
            ruleId="QUAL-001",
            category="Quality",
            rule="Quality Standards",
            description="Material quality must meet grade specifications",
            severity="high",
            status="active",
            lastChecked=datetime.now().isoformat(),
        ),
        ComplianceRule(
            ruleId="ENV-001",
            category="Environmental",
            rule="Emissions Compliance",
            description="Vehicle emissions must meet regulatory standards",
            severity="high",
            status="active",
            lastChecked=datetime.now().isoformat(),
        ),
    ]


def get_violations() -> List[ComplianceViolation]:
    """Get compliance violations"""
    return [
        ComplianceViolation(
            violationId="VIO-001",
            ruleId="RAKE-001",
            rule="Loading Time Limit",
            severity="high",
            timestamp="2024-12-02T14:30:00",
            entity="Rake",
            entityId="RAKE-001",
            description="Loading time exceeded 8 hours limit",
            status="open",
        ),
        ComplianceViolation(
            violationId="VIO-002",
            ruleId="COST-001",
            rule="Cost Limit",
            severity="medium",
            timestamp="2024-12-02T10:15:00",
            entity="Rake",
            entityId="RAKE-002",
            description="Cost per tonne exceeded budget",
            status="acknowledged",
        ),
        ComplianceViolation(
            violationId="VIO-003",
            ruleId="DISP-001",
            rule="SLA Compliance",
            severity="high",
            timestamp="2024-12-01T18:45:00",
            entity="Rake",
            entityId="RAKE-003",
            description="Dispatch did not meet SLA deadline",
            status="resolved",
            resolution="Expedited delivery completed",
        ),
    ]


def get_audit_logs() -> List[AuditLog]:
    """Get audit logs"""
    return [
        AuditLog(
            logId="LOG-001",
            timestamp="2024-12-02T09:00:00",
            action="Rake Created",
            user="admin@company.com",
            entity="Rake",
            entityId="RAKE-001",
            status="success",
            details="New rake created with 75 wagons",
        ),
        AuditLog(
            logId="LOG-002",
            timestamp="2024-12-02T09:30:00",
            action="Rake Approved",
            user="manager@company.com",
            entity="Rake",
            entityId="RAKE-001",
            status="success",
            details="Rake approved for dispatch",
        ),
        AuditLog(
            logId="LOG-003",
            timestamp="2024-12-02T10:00:00",
            action="Dispatch Started",
            user="driver@company.com",
            entity="Rake",
            entityId="RAKE-001",
            status="success",
            details="Dispatch started from Bokaro",
        ),
        AuditLog(
            logId="LOG-004",
            timestamp="2024-12-02T14:30:00",
            action="Compliance Check Failed",
            user="system",
            entity="Rake",
            entityId="RAKE-002",
            status="failure",
            details="Loading time exceeded limit",
        ),
    ]


def get_regulatory_requirements() -> List[RegulatoryRequirement]:
    """Get regulatory requirements"""
    return [
        RegulatoryRequirement(
            requirementId="REG-001",
            regulation="Indian Railways Act",
            requirement="Rake formation must follow railway guidelines",
            applicability="All rail shipments",
            deadline="2024-12-31",
            status="compliant",
            evidence=["Certificate-001", "Audit-Report-001"],
        ),
        RegulatoryRequirement(
            requirementId="REG-002",
            regulation="Motor Vehicles Act",
            requirement="All vehicles must have valid registration and insurance",
            applicability="All road shipments",
            deadline="2024-12-31",
            status="compliant",
            evidence=["Insurance-Policy-001", "Registration-Cert-001"],
        ),
        RegulatoryRequirement(
            requirementId="REG-003",
            regulation="Environmental Protection Act",
            requirement="Emissions must meet pollution standards",
            applicability="All transport",
            deadline="2024-12-31",
            status="compliant",
            evidence=["Emission-Test-001", "Green-Cert-001"],
        ),
        RegulatoryRequirement(
            requirementId="REG-004",
            regulation="Occupational Safety",
            requirement="Workers must have safety training and equipment",
            applicability="All operations",
            deadline="2024-12-31",
            status="in-progress",
            evidence=["Training-Cert-001"],
        ),
        RegulatoryRequirement(
            requirementId="REG-005",
            regulation="Data Protection",
            requirement="Customer data must be protected and encrypted",
            applicability="All digital systems",
            deadline="2024-12-31",
            status="compliant",
            evidence=["Security-Audit-001", "Encryption-Cert-001"],
        ),
    ]


def calculate_compliance_score(violations: List[ComplianceViolation]) -> ComplianceScore:
    """Calculate compliance score"""
    critical_count = len([v for v in violations if v.severity == "critical"])
    high_count = len([v for v in violations if v.severity == "high"])
    medium_count = len([v for v in violations if v.severity == "medium"])
    low_count = len([v for v in violations if v.severity == "low"])

    score = 100
    score -= critical_count * 20
    score -= high_count * 10
    score -= medium_count * 5
    score -= low_count * 2
    score = max(0, score)

    grade = "A"
    status = "Excellent"
    if score < 90:
        grade = "B"
        status = "Good"
    if score < 80:
        grade = "C"
        status = "Acceptable"
    if score < 70:
        grade = "D"
        status = "Poor"
    if score < 60:
        grade = "F"
        status = "Critical"

    total_rules = 10
    compliant_rules = total_rules - len(violations)

    return ComplianceScore(
        score=score,
        grade=grade,
        status=status,
        violations=len(violations),
        compliantRules=compliant_rules,
    )


# API Endpoints
@router.get("/rules", response_model=ComplianceResponse)
async def get_rules():
    """Get all compliance rules"""
    try:
        rules = get_compliance_rules()
        return ComplianceResponse(
            status="success",
            data={"rules": [r.model_dump() for r in rules]},
            timestamp=datetime.now().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/violations", response_model=ComplianceResponse)
async def get_violations_endpoint():
    """Get compliance violations"""
    try:
        violations = get_violations()
        return ComplianceResponse(
            status="success",
            data={"violations": [v.model_dump() for v in violations]},
            timestamp=datetime.now().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/check")
async def check_compliance(rake_data: Dict):
    """Check compliance for rake data"""
    try:
        violations = []

        # Check minimum rake size
        if rake_data.get("wagons", 0) < 50:
            violations.append(
                {
                    "ruleId": "RAKE-001",
                    "rule": "Minimum Rake Size",
                    "severity": "high",
                    "description": f"Rake has {rake_data.get('wagons')} wagons, minimum required is 50",
                }
            )

        # Check maximum rake size
        if rake_data.get("wagons", 0) > 100:
            violations.append(
                {
                    "ruleId": "RAKE-002",
                    "rule": "Maximum Rake Size",
                    "severity": "high",
                    "description": f"Rake has {rake_data.get('wagons')} wagons, maximum allowed is 100",
                }
            )

        # Check loading time
        if rake_data.get("loadingTime", 0) > 8:
            violations.append(
                {
                    "ruleId": "LOAD-001",
                    "rule": "Loading Time Limit",
                    "severity": "high",
                    "description": f"Loading time is {rake_data.get('loadingTime')} hours, limit is 8 hours",
                }
            )

        return ComplianceResponse(
            status="success",
            data={
                "compliant": len(violations) == 0,
                "violations": violations,
                "violationCount": len(violations),
            },
            timestamp=datetime.now().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/audit-logs", response_model=ComplianceResponse)
async def get_audit_logs_endpoint():
    """Get audit logs"""
    try:
        logs = get_audit_logs()
        return ComplianceResponse(
            status="success",
            data={"logs": [l.model_dump() for l in logs]},
            timestamp=datetime.now().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/regulations", response_model=ComplianceResponse)
async def get_regulations():
    """Get regulatory requirements"""
    try:
        requirements = get_regulatory_requirements()
        return ComplianceResponse(
            status="success",
            data={"regulations": [r.model_dump() for r in requirements]},
            timestamp=datetime.now().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/score", response_model=ComplianceResponse)
async def get_compliance_score():
    """Get compliance score"""
    try:
        violations = get_violations()
        score = calculate_compliance_score(violations)
        return ComplianceResponse(
            status="success",
            data=score.model_dump(),
            timestamp=datetime.now().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "compliance",
        "timestamp": datetime.now().isoformat(),
    }
