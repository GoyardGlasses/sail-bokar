/**
 * Compliance & Audit System
 * Tracks compliance, audit trails, and regulatory requirements
 */

export interface ComplianceRule {
  ruleId: string
  category: string
  rule: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'active' | 'inactive'
  lastChecked: string
}

export interface AuditLog {
  logId: string
  timestamp: string
  action: string
  user: string
  entity: string
  entityId: string
  changes: Record<string, { before: any; after: any }>
  status: 'success' | 'failure'
  details: string
}

export interface ComplianceViolation {
  violationId: string
  ruleId: string
  rule: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  timestamp: string
  entity: string
  entityId: string
  description: string
  status: 'open' | 'acknowledged' | 'resolved'
  resolution?: string
}

export interface RegulatoryRequirement {
  requirementId: string
  regulation: string
  requirement: string
  applicability: string
  deadline?: string
  status: 'compliant' | 'non-compliant' | 'in-progress'
  evidence: string[]
}

export interface ComplianceReport {
  reportId: string
  date: string
  period: string
  totalRules: number
  compliantRules: number
  violatingRules: number
  compliancePercentage: number
  violations: ComplianceViolation[]
  recommendations: string[]
}

/**
 * Compliance rules database
 */
export const COMPLIANCE_RULES: ComplianceRule[] = [
  {
    ruleId: 'RAKE-001',
    category: 'Rake Formation',
    rule: 'Minimum Rake Size',
    description: 'Minimum rake size must be 50 wagons',
    severity: 'high',
    status: 'active',
    lastChecked: new Date().toISOString(),
  },
  {
    ruleId: 'RAKE-002',
    category: 'Rake Formation',
    rule: 'Maximum Rake Size',
    description: 'Maximum rake size must not exceed 100 wagons',
    severity: 'high',
    status: 'active',
    lastChecked: new Date().toISOString(),
  },
  {
    ruleId: 'RAKE-003',
    category: 'Rake Formation',
    rule: 'Load Balance',
    description: 'Load must be balanced across all wagons (±10%)',
    severity: 'medium',
    status: 'active',
    lastChecked: new Date().toISOString(),
  },
  {
    ruleId: 'LOAD-001',
    category: 'Loading',
    rule: 'Loading Time Limit',
    description: 'Loading must be completed within 8 hours',
    severity: 'high',
    status: 'active',
    lastChecked: new Date().toISOString(),
  },
  {
    ruleId: 'LOAD-002',
    category: 'Loading',
    rule: 'Safety Compliance',
    description: 'All safety protocols must be followed during loading',
    severity: 'critical',
    status: 'active',
    lastChecked: new Date().toISOString(),
  },
  {
    ruleId: 'DISP-001',
    category: 'Dispatch',
    rule: 'SLA Compliance',
    description: 'Dispatch must meet customer SLA requirements',
    severity: 'high',
    status: 'active',
    lastChecked: new Date().toISOString(),
  },
  {
    ruleId: 'DISP-002',
    category: 'Dispatch',
    rule: 'Documentation',
    description: 'All dispatch documents must be complete and signed',
    severity: 'high',
    status: 'active',
    lastChecked: new Date().toISOString(),
  },
  {
    ruleId: 'COST-001',
    category: 'Cost Control',
    rule: 'Cost Limit',
    description: 'Cost per tonne must not exceed budget limit',
    severity: 'medium',
    status: 'active',
    lastChecked: new Date().toISOString(),
  },
  {
    ruleId: 'QUAL-001',
    category: 'Quality',
    rule: 'Quality Standards',
    description: 'Material quality must meet grade specifications',
    severity: 'high',
    status: 'active',
    lastChecked: new Date().toISOString(),
  },
  {
    ruleId: 'ENV-001',
    category: 'Environmental',
    rule: 'Emissions Compliance',
    description: 'Vehicle emissions must meet regulatory standards',
    severity: 'high',
    status: 'active',
    lastChecked: new Date().toISOString(),
  },
]

/**
 * Check compliance for a rake plan
 */
export function checkCompliance(
  rakeData: Record<string, any>
): { compliant: boolean; violations: ComplianceViolation[] } {
  const violations: ComplianceViolation[] = []

  // Check minimum rake size
  if (rakeData.wagons < 50) {
    violations.push({
      violationId: `VIO-${Date.now()}-1`,
      ruleId: 'RAKE-001',
      rule: 'Minimum Rake Size',
      severity: 'high',
      timestamp: new Date().toISOString(),
      entity: 'Rake',
      entityId: rakeData.rakeId,
      description: `Rake has ${rakeData.wagons} wagons, minimum required is 50`,
      status: 'open',
    })
  }

  // Check maximum rake size
  if (rakeData.wagons > 100) {
    violations.push({
      violationId: `VIO-${Date.now()}-2`,
      ruleId: 'RAKE-002',
      rule: 'Maximum Rake Size',
      severity: 'high',
      timestamp: new Date().toISOString(),
      entity: 'Rake',
      entityId: rakeData.rakeId,
      description: `Rake has ${rakeData.wagons} wagons, maximum allowed is 100`,
      status: 'open',
    })
  }

  // Check loading time
  if (rakeData.loadingTime > 8) {
    violations.push({
      violationId: `VIO-${Date.now()}-3`,
      ruleId: 'LOAD-001',
      rule: 'Loading Time Limit',
      severity: 'high',
      timestamp: new Date().toISOString(),
      entity: 'Rake',
      entityId: rakeData.rakeId,
      description: `Loading time is ${rakeData.loadingTime} hours, limit is 8 hours`,
      status: 'open',
    })
  }

  // Check SLA compliance
  if (rakeData.slaCompliance === false) {
    violations.push({
      violationId: `VIO-${Date.now()}-4`,
      ruleId: 'DISP-001',
      rule: 'SLA Compliance',
      severity: 'high',
      timestamp: new Date().toISOString(),
      entity: 'Rake',
      entityId: rakeData.rakeId,
      description: 'Dispatch does not meet customer SLA requirements',
      status: 'open',
    })
  }

  // Check cost limit
  if (rakeData.costPerTonne > 100) {
    violations.push({
      violationId: `VIO-${Date.now()}-5`,
      ruleId: 'COST-001',
      rule: 'Cost Limit',
      severity: 'medium',
      timestamp: new Date().toISOString(),
      entity: 'Rake',
      entityId: rakeData.rakeId,
      description: `Cost per tonne is ₹${rakeData.costPerTonne}, budget limit is ₹100`,
      status: 'open',
    })
  }

  return {
    compliant: violations.length === 0,
    violations,
  }
}

/**
 * Create audit log entry
 */
export function createAuditLog(
  action: string,
  user: string,
  entity: string,
  entityId: string,
  changes: Record<string, { before: any; after: any }>,
  status: 'success' | 'failure' = 'success',
  details: string = ''
): AuditLog {
  return {
    logId: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action,
    user,
    entity,
    entityId,
    changes,
    status,
    details,
  }
}

/**
 * Generate compliance report
 */
export function generateComplianceReport(
  violations: ComplianceViolation[],
  period: string = 'monthly'
): ComplianceReport {
  const totalRules = COMPLIANCE_RULES.length
  const violatingRules = new Set(violations.map((v) => v.ruleId)).size
  const compliantRules = totalRules - violatingRules
  const compliancePercentage = (compliantRules / totalRules) * 100

  const recommendations: string[] = []

  // Generate recommendations based on violations
  const criticalViolations = violations.filter((v) => v.severity === 'critical')
  if (criticalViolations.length > 0) {
    recommendations.push(
      `Address ${criticalViolations.length} critical violations immediately`
    )
  }

  const highViolations = violations.filter((v) => v.severity === 'high')
  if (highViolations.length > 0) {
    recommendations.push(`Resolve ${highViolations.length} high-severity violations within 48 hours`)
  }

  if (compliancePercentage < 90) {
    recommendations.push('Implement compliance training program')
  }

  if (compliancePercentage < 80) {
    recommendations.push('Conduct full compliance audit')
  }

  return {
    reportId: `RPT-${Date.now()}`,
    date: new Date().toISOString(),
    period,
    totalRules,
    compliantRules,
    violatingRules,
    compliancePercentage: Math.round(compliancePercentage * 100) / 100,
    violations,
    recommendations,
  }
}

/**
 * Track regulatory requirements
 */
export function trackRegulatoryRequirements(): RegulatoryRequirement[] {
  return [
    {
      requirementId: 'REG-001',
      regulation: 'Indian Railways Act',
      requirement: 'Rake formation must follow railway guidelines',
      applicability: 'All rail shipments',
      deadline: '2024-12-31',
      status: 'compliant',
      evidence: ['Certificate-001', 'Audit-Report-001'],
    },
    {
      requirementId: 'REG-002',
      regulation: 'Motor Vehicles Act',
      requirement: 'All vehicles must have valid registration and insurance',
      applicability: 'All road shipments',
      deadline: '2024-12-31',
      status: 'compliant',
      evidence: ['Insurance-Policy-001', 'Registration-Cert-001'],
    },
    {
      requirementId: 'REG-003',
      regulation: 'Environmental Protection Act',
      requirement: 'Emissions must meet pollution standards',
      applicability: 'All transport',
      deadline: '2024-12-31',
      status: 'compliant',
      evidence: ['Emission-Test-001', 'Green-Cert-001'],
    },
    {
      requirementId: 'REG-004',
      regulation: 'Occupational Safety',
      requirement: 'Workers must have safety training and equipment',
      applicability: 'All operations',
      deadline: '2024-12-31',
      status: 'in-progress',
      evidence: ['Training-Cert-001'],
    },
    {
      requirementId: 'REG-005',
      regulation: 'Data Protection',
      requirement: 'Customer data must be protected and encrypted',
      applicability: 'All digital systems',
      deadline: '2024-12-31',
      status: 'compliant',
      evidence: ['Security-Audit-001', 'Encryption-Cert-001'],
    },
  ]
}

/**
 * Calculate compliance score
 */
export function calculateComplianceScore(
  violations: ComplianceViolation[]
): { score: number; grade: 'A' | 'B' | 'C' | 'D' | 'F'; status: string } {
  const criticalCount = violations.filter((v) => v.severity === 'critical').length
  const highCount = violations.filter((v) => v.severity === 'high').length
  const mediumCount = violations.filter((v) => v.severity === 'medium').length
  const lowCount = violations.filter((v) => v.severity === 'low').length

  // Calculate score (100 - penalties)
  let score = 100
  score -= criticalCount * 20
  score -= highCount * 10
  score -= mediumCount * 5
  score -= lowCount * 2

  score = Math.max(0, score)

  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'A'
  let status = 'Excellent'

  if (score < 90) {
    grade = 'B'
    status = 'Good'
  }
  if (score < 80) {
    grade = 'C'
    status = 'Acceptable'
  }
  if (score < 70) {
    grade = 'D'
    status = 'Poor'
  }
  if (score < 60) {
    grade = 'F'
    status = 'Critical'
  }

  return { score: Math.round(score), grade, status }
}

/**
 * Generate audit trail summary
 */
export function generateAuditTrailSummary(
  logs: AuditLog[]
): Record<string, { count: number; lastAction: string; lastTimestamp: string }> {
  const summary: Record<string, { count: number; lastAction: string; lastTimestamp: string }> = {}

  logs.forEach((log) => {
    if (!summary[log.entity]) {
      summary[log.entity] = {
        count: 0,
        lastAction: '',
        lastTimestamp: '',
      }
    }

    summary[log.entity].count++
    summary[log.entity].lastAction = log.action
    summary[log.entity].lastTimestamp = log.timestamp
  })

  return summary
}

/**
 * Identify compliance trends
 */
export function identifyComplianceTrends(
  reports: ComplianceReport[]
): { trend: 'improving' | 'declining' | 'stable'; changePercentage: number } {
  if (reports.length < 2) {
    return { trend: 'stable', changePercentage: 0 }
  }

  const latest = reports[reports.length - 1].compliancePercentage
  const previous = reports[reports.length - 2].compliancePercentage
  const change = latest - previous
  const changePercentage = (change / previous) * 100

  let trend: 'improving' | 'declining' | 'stable' = 'stable'
  if (changePercentage > 1) trend = 'improving'
  if (changePercentage < -1) trend = 'declining'

  return {
    trend,
    changePercentage: Math.round(changePercentage * 100) / 100,
  }
}
