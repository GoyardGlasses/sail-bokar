/**
 * Constraint Enforcement System
 * Validates plans against hard and soft constraints
 */

export interface ConstraintViolation {
  type: 'hard' | 'soft'
  constraint: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  message: string
  affectedRakes: string[]
  penalty: number
  fixSuggestion: string
}

export interface ConstraintValidationResult {
  isValid: boolean
  hardViolations: ConstraintViolation[]
  softViolations: ConstraintViolation[]
  totalPenalty: number
  feasibilityScore: number
}

/**
 * Hard Constraints (must not be violated)
 */
export const HARD_CONSTRAINTS = {
  MIN_RAKE_SIZE: 55,
  MAX_RAKE_SIZE: 90,
  MIN_ORDER_QTY: 10,
  MAX_ORDER_QTY: 5000,
  MAX_DELIVERY_HOURS: 72,
  MAX_DISTANCE: 1000,
}

/**
 * Soft Constraints (prefer not to violate, apply penalty)
 */
export const SOFT_CONSTRAINTS = {
  MIN_UTILIZATION: 70, // Prefer > 70%
  MAX_COST_PER_TONNE: 1000, // Prefer < ₹1000/tonne
  PREFERRED_LOADING_HOURS: { start: 6, end: 22 }, // Prefer 6 AM - 10 PM
  MAX_RAKES_PER_DAY: 10, // Prefer not to exceed 10 rakes/day
}

/**
 * Validate rake against hard constraints
 */
export function validateHardConstraints(
  rake: any,
  constraints: any
): ConstraintViolation[] {
  const violations: ConstraintViolation[] = []

  // Check minimum rake size
  if (rake.totalLoad < (constraints.minRakeSize || HARD_CONSTRAINTS.MIN_RAKE_SIZE)) {
    violations.push({
      type: 'hard',
      constraint: 'MIN_RAKE_SIZE',
      severity: 'critical',
      message: `Rake load (${rake.totalLoad}T) is below minimum (${constraints.minRakeSize || HARD_CONSTRAINTS.MIN_RAKE_SIZE}T)`,
      affectedRakes: [rake.rakeId],
      penalty: 0,
      fixSuggestion: 'Consolidate with other orders or use road transport',
    })
  }

  // Check maximum rake size
  if (rake.totalLoad > (constraints.maxRakeSize || HARD_CONSTRAINTS.MAX_RAKE_SIZE)) {
    violations.push({
      type: 'hard',
      constraint: 'MAX_RAKE_SIZE',
      severity: 'critical',
      message: `Rake load (${rake.totalLoad}T) exceeds maximum (${constraints.maxRakeSize || HARD_CONSTRAINTS.MAX_RAKE_SIZE}T)`,
      affectedRakes: [rake.rakeId],
      penalty: 0,
      fixSuggestion: 'Split rake into multiple rakes',
    })
  }

  // Check delivery time
  const deliveryTime = new Date(rake.estimatedDeliveryTime).getTime() - Date.now()
  const maxDeliveryTime = (constraints.maxDeliveryHours || HARD_CONSTRAINTS.MAX_DELIVERY_HOURS) * 3600000
  if (deliveryTime > maxDeliveryTime) {
    violations.push({
      type: 'hard',
      constraint: 'MAX_DELIVERY_HOURS',
      severity: 'critical',
      message: `Estimated delivery time (${(deliveryTime / 3600000).toFixed(1)}h) exceeds maximum (${constraints.maxDeliveryHours || HARD_CONSTRAINTS.MAX_DELIVERY_HOURS}h)`,
      affectedRakes: [rake.rakeId],
      penalty: 0,
      fixSuggestion: 'Use faster route or expedite dispatch',
    })
  }

  // Check cost
  if (rake.cost > (constraints.maxCost || 1000000)) {
    violations.push({
      type: 'hard',
      constraint: 'MAX_COST',
      severity: 'high',
      message: `Rake cost (₹${rake.cost.toLocaleString()}) exceeds maximum (₹${(constraints.maxCost || 1000000).toLocaleString()})`,
      affectedRakes: [rake.rakeId],
      penalty: 0,
      fixSuggestion: 'Negotiate rates or use alternative route',
    })
  }

  return violations
}

/**
 * Validate rake against soft constraints
 */
export function validateSoftConstraints(
  rake: any,
  constraints: any
): ConstraintViolation[] {
  const violations: ConstraintViolation[] = []

  // Check utilization
  const minUtil = constraints.minUtilization || SOFT_CONSTRAINTS.MIN_UTILIZATION
  if (rake.utilization < minUtil) {
    const penalty = (minUtil - rake.utilization) * 100 // ₹100 per % below target
    violations.push({
      type: 'soft',
      constraint: 'MIN_UTILIZATION',
      severity: 'medium',
      message: `Rake utilization (${rake.utilization.toFixed(1)}%) is below preferred (${minUtil}%)`,
      affectedRakes: [rake.rakeId],
      penalty,
      fixSuggestion: 'Consolidate with other orders to improve utilization',
    })
  }

  // Check cost per tonne
  const costPerTonne = rake.cost / rake.totalLoad
  const maxCostPerTonne = constraints.maxCostPerTonne || SOFT_CONSTRAINTS.MAX_COST_PER_TONNE
  if (costPerTonne > maxCostPerTonne) {
    const penalty = (costPerTonne - maxCostPerTonne) * rake.totalLoad
    violations.push({
      type: 'soft',
      constraint: 'MAX_COST_PER_TONNE',
      severity: 'low',
      message: `Cost per tonne (₹${costPerTonne.toFixed(0)}) exceeds preferred (₹${maxCostPerTonne})`,
      affectedRakes: [rake.rakeId],
      penalty,
      fixSuggestion: 'Negotiate rates or use alternative route',
    })
  }

  // Check delivery time (soft)
  const deliveryTime = new Date(rake.estimatedDeliveryTime).getTime() - Date.now()
  const preferredDeliveryTime = 48 * 3600000 // 48 hours
  if (deliveryTime > preferredDeliveryTime) {
    const penalty = ((deliveryTime - preferredDeliveryTime) / 3600000) * 1000 // ₹1000 per hour over 48h
    violations.push({
      type: 'soft',
      constraint: 'PREFERRED_DELIVERY_TIME',
      severity: 'low',
      message: `Delivery time (${(deliveryTime / 3600000).toFixed(1)}h) exceeds preferred (48h)`,
      affectedRakes: [rake.rakeId],
      penalty,
      fixSuggestion: 'Expedite dispatch or use faster route',
    })
  }

  return violations
}

/**
 * Validate entire plan
 */
export function validatePlan(
  rakes: any[],
  constraints: any
): ConstraintValidationResult {
  const hardViolations: ConstraintViolation[] = []
  const softViolations: ConstraintViolation[] = []
  let totalPenalty = 0

  // Validate each rake
  for (const rake of rakes) {
    const hardVios = validateHardConstraints(rake, constraints)
    const softVios = validateSoftConstraints(rake, constraints)

    hardViolations.push(...hardVios)
    softViolations.push(...softVios)

    totalPenalty += softVios.reduce((sum, v) => sum + v.penalty, 0)
  }

  // Check plan-level constraints
  if (rakes.length > (constraints.maxRakesPerDay || SOFT_CONSTRAINTS.MAX_RAKES_PER_DAY)) {
    softViolations.push({
      type: 'soft',
      constraint: 'MAX_RAKES_PER_DAY',
      severity: 'medium',
      message: `Number of rakes (${rakes.length}) exceeds preferred daily limit (${constraints.maxRakesPerDay || SOFT_CONSTRAINTS.MAX_RAKES_PER_DAY})`,
      affectedRakes: rakes.map((r) => r.rakeId),
      penalty: (rakes.length - (constraints.maxRakesPerDay || SOFT_CONSTRAINTS.MAX_RAKES_PER_DAY)) * 5000,
      fixSuggestion: 'Spread rakes across multiple days',
    })
  }

  // Calculate feasibility score
  const hardViolationCount = hardViolations.length
  const softViolationCount = softViolations.length
  const feasibilityScore = Math.max(
    0,
    100 - hardViolationCount * 50 - softViolationCount * 5
  )

  return {
    isValid: hardViolations.length === 0,
    hardViolations,
    softViolations,
    totalPenalty,
    feasibilityScore,
  }
}

/**
 * Get constraint violation summary
 */
export function getViolationSummary(result: ConstraintValidationResult): string {
  if (result.isValid && result.softViolations.length === 0) {
    return '✅ Plan is fully compliant with all constraints'
  }

  let summary = ''

  if (result.hardViolations.length > 0) {
    summary += `🚨 ${result.hardViolations.length} HARD constraint violations:\n`
    for (const v of result.hardViolations) {
      summary += `  • ${v.message}\n`
    }
  }

  if (result.softViolations.length > 0) {
    summary += `⚠️ ${result.softViolations.length} SOFT constraint violations:\n`
    for (const v of result.softViolations) {
      summary += `  • ${v.message}\n`
    }
  }

  if (result.totalPenalty > 0) {
    summary += `\n💰 Total penalty: ₹${result.totalPenalty.toLocaleString()}`
  }

  return summary
}

/**
 * Suggest constraint relaxation
 */
export function suggestConstraintRelaxation(
  violations: ConstraintViolation[]
): { constraint: string; relaxAmount: number; impact: string }[] {
  const suggestions: { constraint: string; relaxAmount: number; impact: string }[] = []

  for (const violation of violations) {
    if (violation.constraint === 'MIN_RAKE_SIZE') {
      suggestions.push({
        constraint: 'MIN_RAKE_SIZE',
        relaxAmount: 5,
        impact: 'Allow rakes as small as 50T instead of 55T',
      })
    }

    if (violation.constraint === 'MAX_DELIVERY_HOURS') {
      suggestions.push({
        constraint: 'MAX_DELIVERY_HOURS',
        relaxAmount: 12,
        impact: 'Extend delivery time from 72h to 84h',
      })
    }

    if (violation.constraint === 'MIN_UTILIZATION') {
      suggestions.push({
        constraint: 'MIN_UTILIZATION',
        relaxAmount: 5,
        impact: 'Allow utilization as low as 65% instead of 70%',
      })
    }
  }

  return suggestions
}

/**
 * Apply constraint relaxation
 */
export function applyConstraintRelaxation(
  constraints: any,
  relaxations: { constraint: string; relaxAmount: number }[]
): any {
  const relaxed = { ...constraints }

  for (const relaxation of relaxations) {
    if (relaxation.constraint === 'MIN_RAKE_SIZE') {
      relaxed.minRakeSize = (relaxed.minRakeSize || HARD_CONSTRAINTS.MIN_RAKE_SIZE) - relaxation.relaxAmount
    }

    if (relaxation.constraint === 'MAX_DELIVERY_HOURS') {
      relaxed.maxDeliveryHours = (relaxed.maxDeliveryHours || HARD_CONSTRAINTS.MAX_DELIVERY_HOURS) + relaxation.relaxAmount
    }

    if (relaxation.constraint === 'MIN_UTILIZATION') {
      relaxed.minUtilization = (relaxed.minUtilization || SOFT_CONSTRAINTS.MIN_UTILIZATION) - relaxation.relaxAmount
    }
  }

  return relaxed
}
