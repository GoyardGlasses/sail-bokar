/**
 * Constraints Management System Types
 * Operational and business constraint definitions
 */

// ============================================================================
// CONSTRAINT TYPES
// ============================================================================

export type ConstraintType = 
  | 'capacity' 
  | 'time' 
  | 'resource' 
  | 'compatibility' 
  | 'regulatory' 
  | 'business'

export type ConstraintSeverity = 'critical' | 'high' | 'medium' | 'low'

export type ConstraintStatus = 'active' | 'inactive' | 'archived'

export interface Constraint {
  id: string
  name: string
  description: string
  type: ConstraintType
  severity: ConstraintSeverity
  status: ConstraintStatus
  category: string
  rule: string
  minValue?: number
  maxValue?: number
  unit?: string
  affectedEntities: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

// ============================================================================
// CAPACITY CONSTRAINTS
// ============================================================================

export interface CapacityConstraint extends Constraint {
  type: 'capacity'
  resourceId: string
  resourceType: 'rake' | 'wagon' | 'loading_point' | 'siding' | 'stockyard'
  maxCapacity: number
  currentUtilization: number
  availableCapacity: number
}

// ============================================================================
// TIME CONSTRAINTS
// ============================================================================

export interface TimeConstraint extends Constraint {
  type: 'time'
  startTime: string
  endTime: string
  duration: number
  durationUnit: 'hours' | 'days' | 'weeks'
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'once'
  timezone: string
}

// ============================================================================
// RESOURCE CONSTRAINTS
// ============================================================================

export interface ResourceConstraint extends Constraint {
  type: 'resource'
  resourceId: string
  resourceType: string
  requiredQuantity: number
  availableQuantity: number
  unit: string
}

// ============================================================================
// COMPATIBILITY CONSTRAINTS
// ============================================================================

export interface CompatibilityConstraint extends Constraint {
  type: 'compatibility'
  item1Type: string
  item1Id: string
  item2Type: string
  item2Id: string
  compatible: boolean
  reason: string
}

// ============================================================================
// REGULATORY CONSTRAINTS
// ============================================================================

export interface RegulatoryConstraint extends Constraint {
  type: 'regulatory'
  regulation: string
  jurisdiction: string
  complianceRequired: boolean
  penaltyForViolation: string
  auditFrequency: string
}

// ============================================================================
// BUSINESS CONSTRAINTS
// ============================================================================

export interface BusinessConstraint extends Constraint {
  type: 'business'
  businessRule: string
  impactArea: string
  costOfViolation: number
  priority: number
}

// ============================================================================
// CONSTRAINT VIOLATION TYPES
// ============================================================================

export interface ConstraintViolation {
  id: string
  constraintId: string
  constraintName: string
  violationType: 'breach' | 'warning' | 'info'
  severity: ConstraintSeverity
  detectedAt: string
  affectedEntity: string
  currentValue: number
  allowedValue: number
  variance: number
  recommendation: string
}

// ============================================================================
// CONSTRAINT RULE TYPES
// ============================================================================

export interface ConstraintRule {
  id: string
  name: string
  description: string
  conditions: RuleCondition[]
  actions: RuleAction[]
  priority: number
  active: boolean
}

export interface RuleCondition {
  field: string
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'contains'
  value: any
}

export interface RuleAction {
  type: 'alert' | 'block' | 'adjust' | 'notify'
  target: string
  message: string
}

// ============================================================================
// CONSTRAINT VALIDATION TYPES
// ============================================================================

export interface ConstraintValidationResult {
  isValid: boolean
  violations: ConstraintViolation[]
  warnings: ConstraintViolation[]
  suggestions: string[]
  validationTime: number
}

export interface ConstraintCheckResult {
  constraintId: string
  constraintName: string
  passed: boolean
  currentValue: number
  allowedValue: number
  message: string
}

// ============================================================================
// STATE TYPES
// ============================================================================

export interface ConstraintsManagementState {
  constraints: Constraint[]
  violations: ConstraintViolation[]
  rules: ConstraintRule[]
  selectedConstraint?: string
  isValidating: boolean
  error: string | null
}
