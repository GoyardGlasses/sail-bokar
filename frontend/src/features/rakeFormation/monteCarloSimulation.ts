/**
 * Advanced Monte Carlo Simulation for Rake Formation Optimization
 * Simulates 10,000+ scenarios to find optimal rake plans
 * Handles uncertainty in:
 * - Material availability
 * - Order arrivals
 * - Transport delays
 * - Cost variations
 * - Equipment availability
 */

export interface SimulationScenario {
  scenarioId: string
  iteration: number
  materialAvailability: Map<string, number>
  orderArrivals: any[]
  transportDelays: Map<string, number>
  costVariations: Map<string, number>
  equipmentAvailability: Map<string, number>
  rakeFormationPlan: any
  totalCost: number
  utilizationScore: number
  slaCompliance: number
  feasibilityScore: number
  timestamp: Date
}

export interface MonteCarloResult {
  totalScenarios: number
  successfulScenarios: number
  failedScenarios: number
  averageCost: number
  minCost: number
  maxCost: number
  costStdDev: number
  costDistribution: number[]
  averageUtilization: number
  averageSLACompliance: number
  riskMetrics: {
    costRisk: number // Probability of exceeding budget
    delayRisk: number // Probability of SLA miss
    capacityRisk: number // Probability of insufficient capacity
    overallRisk: number
  }
  confidenceIntervals: {
    cost95: [number, number]
    utilization95: [number, number]
    sla95: [number, number]
  }
  optimalPlan: any
  scenarioDistribution: SimulationScenario[]
  recommendations: string[]
}

export interface UncertaintyParameters {
  materialAvailabilityStdDev: number // % of mean
  orderArrivalVariance: number // % of expected
  transportDelayStdDev: number // hours
  costVariationStdDev: number // % of base cost
  equipmentFailureRate: number // % probability
  demandVariability: number // % of forecast
}

export const DEFAULT_UNCERTAINTY_PARAMS: UncertaintyParameters = {
  materialAvailabilityStdDev: 15, // ±15%
  orderArrivalVariance: 20, // ±20%
  transportDelayStdDev: 4, // ±4 hours
  costVariationStdDev: 10, // ±10%
  equipmentFailureRate: 5, // 5% chance
  demandVariability: 25, // ±25%
}

// ============================================================================
// MONTE CARLO SIMULATION ENGINE
// ============================================================================

/**
 * Run Monte Carlo simulation for rake formation
 */
export function runMonteCarloSimulation(
  baseScenario: any,
  numScenarios: number = 10000,
  uncertaintyParams: UncertaintyParameters = DEFAULT_UNCERTAINTY_PARAMS
): MonteCarloResult {
  const scenarios: SimulationScenario[] = []
  const costs: number[] = []
  const utilizations: number[] = []
  const slaCompliances: number[] = []

  console.log(`🎲 Starting Monte Carlo Simulation with ${numScenarios} scenarios...`)

  for (let i = 0; i < numScenarios; i++) {
    // Generate random scenario
    const scenario = generateRandomScenario(
      baseScenario,
      i,
      uncertaintyParams
    )

    // Optimize rake plan for this scenario
    const plan = optimizeRakePlanForScenario(scenario)

    // Calculate metrics
    const cost = calculateTotalCost(plan, scenario)
    const utilization = calculateUtilization(plan)
    const slaCompliance = calculateSLACompliance(plan, scenario)
    const feasibility = calculateFeasibility(plan, scenario)

    scenarios.push({
      scenarioId: `SIM-${i}`,
      iteration: i,
      materialAvailability: scenario.materialAvailability,
      orderArrivals: scenario.orderArrivals,
      transportDelays: scenario.transportDelays,
      costVariations: scenario.costVariations,
      equipmentAvailability: scenario.equipmentAvailability,
      rakeFormationPlan: plan,
      totalCost: cost,
      utilizationScore: utilization,
      slaCompliance,
      feasibilityScore: feasibility,
      timestamp: new Date(),
    })

    costs.push(cost)
    utilizations.push(utilization)
    slaCompliances.push(slaCompliance)

    // Progress logging
    if ((i + 1) % 1000 === 0) {
      console.log(`✓ Completed ${i + 1}/${numScenarios} scenarios`)
    }
  }

  // Calculate statistics
  const result = calculateStatistics(
    scenarios,
    costs,
    utilizations,
    slaCompliances,
    baseScenario
  )

  console.log(`✅ Monte Carlo Simulation Complete!`)
  console.log(`   Average Cost: ₹${result.averageCost.toFixed(0)}`)
  console.log(`   Cost Range: ₹${result.minCost.toFixed(0)} - ₹${result.maxCost.toFixed(0)}`)
  console.log(`   Overall Risk: ${result.riskMetrics.overallRisk.toFixed(1)}%`)

  return result
}

/**
 * Generate random scenario based on uncertainty parameters
 */
function generateRandomScenario(
  baseScenario: any,
  iteration: number,
  params: UncertaintyParameters
): any {
  return {
    ...baseScenario,
    materialAvailability: generateMaterialAvailability(
      baseScenario.materials,
      params.materialAvailabilityStdDev
    ),
    orderArrivals: generateOrderArrivals(
      baseScenario.orders,
      params.orderArrivalVariance
    ),
    transportDelays: generateTransportDelays(
      baseScenario.routes,
      params.transportDelayStdDev
    ),
    costVariations: generateCostVariations(
      baseScenario.costBase,
      params.costVariationStdDev
    ),
    equipmentAvailability: generateEquipmentAvailability(
      baseScenario.equipment,
      params.equipmentFailureRate
    ),
    demandVariability: params.demandVariability,
  }
}

/**
 * Generate random material availability
 */
function generateMaterialAvailability(
  baseMaterials: any[],
  stdDev: number
): Map<string, number> {
  const availability = new Map<string, number>()

  for (const material of baseMaterials) {
    const variance = (Math.random() - 0.5) * 2 * stdDev // -stdDev to +stdDev
    const factor = 1 + variance / 100
    const quantity = Math.max(0, material.quantity * factor)
    availability.set(material.id, quantity)
  }

  return availability
}

/**
 * Generate random order arrivals
 */
function generateOrderArrivals(
  baseOrders: any[],
  variance: number
): any[] {
  return baseOrders.map((order) => {
    const variationFactor = (Math.random() - 0.5) * 2 * variance / 100
    return {
      ...order,
      quantity: Math.max(0, order.quantity * (1 + variationFactor)),
      arrivalTime: new Date(
        order.arrivalTime.getTime() +
          (Math.random() - 0.5) * 2 * variance * 60 * 60 * 1000
      ),
    }
  })
}

/**
 * Generate random transport delays
 */
function generateTransportDelays(
  baseRoutes: any[],
  stdDev: number
): Map<string, number> {
  const delays = new Map<string, number>()

  for (const route of baseRoutes) {
    // Normal distribution approximation
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const delay = route.baseDelay + z * stdDev

    delays.set(route.id, Math.max(0, delay))
  }

  return delays
}

/**
 * Generate random cost variations
 */
function generateCostVariations(
  baseCost: number,
  stdDev: number
): Map<string, number> {
  const variations = new Map<string, number>()

  const costFactors = [
    'fuel',
    'labor',
    'maintenance',
    'toll',
    'handling',
    'demurrage',
  ]

  for (const factor of costFactors) {
    const variance = (Math.random() - 0.5) * 2 * stdDev
    const multiplier = 1 + variance / 100
    variations.set(factor, multiplier)
  }

  return variations
}

/**
 * Generate random equipment availability
 */
function generateEquipmentAvailability(
  baseEquipment: any[],
  failureRate: number
): Map<string, number> {
  const availability = new Map<string, number>()

  for (const equipment of baseEquipment) {
    const isAvailable = Math.random() * 100 > failureRate
    availability.set(equipment.id, isAvailable ? 1 : 0)
  }

  return availability
}

/**
 * Optimize rake plan for specific scenario
 */
function optimizeRakePlanForScenario(scenario: any): any {
  // Use greedy algorithm with scenario-specific constraints
  const rakes: any[] = []
  let totalUtilization = 0

  // Group orders by destination
  const ordersByDestination = new Map<string, any[]>()
  for (const order of scenario.orderArrivals) {
    if (!ordersByDestination.has(order.destination)) {
      ordersByDestination.set(order.destination, [])
    }
    ordersByDestination.get(order.destination)!.push(order)
  }

  // Create rakes for each destination
  for (const [destination, orders] of ordersByDestination) {
    const rake = {
      rakeId: `RAKE-${Date.now()}-${Math.random()}`,
      destination,
      orders,
      totalQuantity: orders.reduce((sum: number, o: any) => sum + o.quantity, 0),
      cost: calculateRakeCost(orders, scenario),
      utilization: calculateRakeUtilization(orders),
      feasible: checkRakeFeasibility(orders, scenario),
    }

    if (rake.feasible) {
      rakes.push(rake)
      totalUtilization += rake.utilization
    }
  }

  return {
    rakes,
    totalQuantity: rakes.reduce((sum: number, r: any) => sum + r.totalQuantity, 0),
    totalCost: rakes.reduce((sum: number, r: any) => sum + r.cost, 0),
    averageUtilization: rakes.length > 0 ? totalUtilization / rakes.length : 0,
    feasible: rakes.length > 0,
  }
}

/**
 * Calculate total cost with variations
 */
function calculateTotalCost(plan: any, scenario: any): number {
  let totalCost = 0

  for (const rake of plan.rakes) {
    let rakeCost = rake.cost

    // Apply cost variations
    for (const [factor, multiplier] of scenario.costVariations) {
      rakeCost *= multiplier as number
    }

    // Add transport delay cost
    const route = scenario.routes.find((r: any) => r.destination === rake.destination)
    if (route) {
      const delay = scenario.transportDelays.get(route.id) || 0
      rakeCost += delay * 500 // ₹500 per hour delay
    }

    totalCost += rakeCost
  }

  return totalCost
}

/**
 * Calculate utilization score
 */
function calculateUtilization(plan: any): number {
  if (plan.rakes.length === 0) return 0

  const totalUtilization = plan.rakes.reduce(
    (sum: number, rake: any) => sum + rake.utilization,
    0
  )

  return totalUtilization / plan.rakes.length
}

/**
 * Calculate SLA compliance
 */
function calculateSLACompliance(plan: any, scenario: any): number {
  let compliant = 0
  let total = 0

  for (const rake of plan.rakes) {
    for (const order of rake.orders) {
      total++
      const route = scenario.routes.find((r: any) => r.destination === order.destination)
      if (route) {
        const delay = scenario.transportDelays.get(route.id) || 0
        if (delay <= order.slaHours) {
          compliant++
        }
      }
    }
  }

  return total > 0 ? (compliant / total) * 100 : 0
}

/**
 * Calculate feasibility score
 */
function calculateFeasibility(plan: any, scenario: any): number {
  let score = 100

  // Check material availability
  for (const rake of plan.rakes) {
    for (const order of rake.orders) {
      const available = scenario.materialAvailability.get(order.materialId) || 0
      if (available < order.quantity) {
        score -= 20
      }
    }
  }

  // Check equipment availability
  for (const equipment of scenario.equipment || []) {
    const available = scenario.equipmentAvailability.get(equipment.id) || 1
    if (available === 0) {
      score -= 10
    }
  }

  return Math.max(0, score)
}

/**
 * Calculate rake cost
 */
function calculateRakeCost(orders: any[], scenario: any): number {
  const baseRate = 50 // ₹50 per tonne
  const totalQuantity = orders.reduce((sum: number, o: any) => sum + o.quantity, 0)
  return totalQuantity * baseRate
}

/**
 * Calculate rake utilization
 */
function calculateRakeUtilization(orders: any[]): number {
  const totalQuantity = orders.reduce((sum: number, o: any) => sum + o.quantity, 0)
  const rakeCapacity = 2000 // tonnes
  return Math.min(100, (totalQuantity / rakeCapacity) * 100)
}

/**
 * Check rake feasibility
 */
function checkRakeFeasibility(orders: any[], scenario: any): boolean {
  const totalQuantity = orders.reduce((sum: number, o: any) => sum + o.quantity, 0)
  return totalQuantity > 0 && totalQuantity <= 2500 // Max rake capacity
}

// ============================================================================
// STATISTICAL ANALYSIS
// ============================================================================

/**
 * Calculate statistics from simulation results
 */
function calculateStatistics(
  scenarios: SimulationScenario[],
  costs: number[],
  utilizations: number[],
  slaCompliances: number[],
  baseScenario: any
): MonteCarloResult {
  // Sort for percentile calculations
  const sortedCosts = [...costs].sort((a, b) => a - b)
  const sortedUtilizations = [...utilizations].sort((a, b) => a - b)
  const sortedSLAs = [...slaCompliances].sort((a, b) => a - b)

  // Basic statistics
  const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length
  const minCost = Math.min(...costs)
  const maxCost = Math.max(...costs)
  const costStdDev = calculateStdDev(costs, avgCost)

  // Percentiles
  const p5Cost = sortedCosts[Math.floor(costs.length * 0.05)]
  const p95Cost = sortedCosts[Math.floor(costs.length * 0.95)]

  const p5Util = sortedUtilizations[Math.floor(utilizations.length * 0.05)]
  const p95Util = sortedUtilizations[Math.floor(utilizations.length * 0.95)]

  const p5SLA = sortedSLAs[Math.floor(slaCompliances.length * 0.05)]
  const p95SLA = sortedSLAs[Math.floor(slaCompliances.length * 0.95)]

  // Risk metrics
  const avgCostBudget = baseScenario.budget || avgCost * 1.2
  const costRisk = (costs.filter((c) => c > avgCostBudget).length / costs.length) * 100

  const targetSLA = 95
  const delayRisk = (slaCompliances.filter((s) => s < targetSLA).length / slaCompliances.length) * 100

  const targetUtilization = 80
  const capacityRisk = (utilizations.filter((u) => u < targetUtilization).length / utilizations.length) * 100

  const overallRisk = (costRisk + delayRisk + capacityRisk) / 3

  // Cost distribution (10 buckets)
  const costDistribution = calculateDistribution(sortedCosts, 10)

  // Find optimal plan
  const optimalScenario = scenarios.reduce((best, current) => {
    const bestScore = best.totalCost * 0.5 + (100 - best.utilizationScore) * 0.3 + (100 - best.slaCompliance) * 0.2
    const currentScore = current.totalCost * 0.5 + (100 - current.utilizationScore) * 0.3 + (100 - current.slaCompliance) * 0.2
    return currentScore < bestScore ? current : best
  })

  // Generate recommendations
  const recommendations = generateRecommendations(
    avgCost,
    costStdDev,
    costRisk,
    delayRisk,
    capacityRisk,
    utilizations
  )

  return {
    totalScenarios: scenarios.length,
    successfulScenarios: scenarios.filter((s) => s.feasibilityScore > 50).length,
    failedScenarios: scenarios.filter((s) => s.feasibilityScore <= 50).length,
    averageCost: avgCost,
    minCost,
    maxCost,
    costStdDev,
    costDistribution,
    averageUtilization: utilizations.reduce((a, b) => a + b, 0) / utilizations.length,
    averageSLACompliance: slaCompliances.reduce((a, b) => a + b, 0) / slaCompliances.length,
    riskMetrics: {
      costRisk,
      delayRisk,
      capacityRisk,
      overallRisk,
    },
    confidenceIntervals: {
      cost95: [p5Cost, p95Cost],
      utilization95: [p5Util, p95Util],
      sla95: [p5SLA, p95SLA],
    },
    optimalPlan: optimalScenario.rakeFormationPlan,
    scenarioDistribution: scenarios.slice(0, 100), // Return sample of scenarios
    recommendations,
  }
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[], mean: number): number {
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length
  return Math.sqrt(variance)
}

/**
 * Calculate distribution
 */
function calculateDistribution(sortedValues: number[], buckets: number): number[] {
  const distribution = new Array(buckets).fill(0)
  const min = sortedValues[0]
  const max = sortedValues[sortedValues.length - 1]
  const bucketSize = (max - min) / buckets

  for (const value of sortedValues) {
    const bucketIndex = Math.min(
      buckets - 1,
      Math.floor((value - min) / bucketSize)
    )
    distribution[bucketIndex]++
  }

  return distribution.map((count) => (count / sortedValues.length) * 100)
}

/**
 * Generate recommendations based on results
 */
function generateRecommendations(
  avgCost: number,
  stdDev: number,
  costRisk: number,
  delayRisk: number,
  capacityRisk: number,
  utilizations: number[]
): string[] {
  const recommendations: string[] = []

  // Cost recommendations
  if (costRisk > 30) {
    recommendations.push(
      `⚠️ High cost risk (${costRisk.toFixed(1)}%). Consider: Negotiate better rates, optimize routes, or increase batch sizes.`
    )
  }

  if (stdDev > avgCost * 0.2) {
    recommendations.push(
      `⚠️ High cost variability (${(stdDev / avgCost * 100).toFixed(1)}%). Implement cost controls and buffer management.`
    )
  }

  // Delay recommendations
  if (delayRisk > 20) {
    recommendations.push(
      `⚠️ High delay risk (${delayRisk.toFixed(1)}%). Increase buffer times, improve route planning, or add redundancy.`
    )
  }

  // Capacity recommendations
  if (capacityRisk > 25) {
    recommendations.push(
      `⚠️ Capacity utilization risk (${capacityRisk.toFixed(1)}%). Consider: Consolidate orders, optimize rake composition, or increase capacity.`
    )
  }

  const avgUtilization = utilizations.reduce((a, b) => a + b, 0) / utilizations.length
  if (avgUtilization < 75) {
    recommendations.push(
      `💡 Low utilization (${avgUtilization.toFixed(1)}%). Opportunity to consolidate rakes and reduce costs.`
    )
  }

  if (recommendations.length === 0) {
    recommendations.push(`✅ Plan is robust across all scenarios. Proceed with confidence.`)
  }

  return recommendations
}

// ============================================================================
// SENSITIVITY ANALYSIS
// ============================================================================

export interface SensitivityResult {
  parameter: string
  baseValue: number
  variations: {
    value: number
    costImpact: number
    utilizationImpact: number
    slaImpact: number
  }[]
  elasticity: number // % change in output per 1% change in input
}

/**
 * Perform sensitivity analysis
 */
export function performSensitivityAnalysis(
  baseScenario: any,
  parameter: string,
  variations: number[] = [0.8, 0.9, 1.0, 1.1, 1.2]
): SensitivityResult {
  const results: SensitivityResult = {
    parameter,
    baseValue: baseScenario[parameter] || 0,
    variations: [],
    elasticity: 0,
  }

  let baseResult: any = null
  const impacts: number[] = []

  for (const variation of variations) {
    const modifiedScenario = {
      ...baseScenario,
      [parameter]: baseScenario[parameter] * variation,
    }

    const result = runMonteCarloSimulation(modifiedScenario, 1000)

    if (variation === 1.0) {
      baseResult = result
    }

    if (baseResult) {
      const costImpact = ((result.averageCost - baseResult.averageCost) / baseResult.averageCost) * 100
      const utilizationImpact = result.averageUtilization - baseResult.averageUtilization
      const slaImpact = result.averageSLACompliance - baseResult.averageSLACompliance

      results.variations.push({
        value: variation,
        costImpact,
        utilizationImpact,
        slaImpact,
      })

      impacts.push(costImpact)
    }
  }

  // Calculate elasticity (% change in cost per 1% change in parameter)
  if (results.variations.length >= 2) {
    const v1 = results.variations[0]
    const v2 = results.variations[results.variations.length - 1]
    const parameterChange = ((v2.value - v1.value) / v1.value) * 100
    const costChange = ((v2.costImpact - v1.costImpact) / v1.costImpact) * 100
    results.elasticity = costChange / parameterChange
  }

  return results
}

// ============================================================================
// SCENARIO COMPARISON
// ============================================================================

export interface ScenarioComparison {
  scenario1: string
  scenario2: string
  costDifference: number
  utilizationDifference: number
  slaDifference: number
  riskDifference: number
  recommendation: string
}

/**
 * Compare two scenarios
 */
export function compareScenarios(
  scenario1: any,
  scenario2: any,
  numSimulations: number = 5000
): ScenarioComparison {
  const result1 = runMonteCarloSimulation(scenario1, numSimulations)
  const result2 = runMonteCarloSimulation(scenario2, numSimulations)

  const costDiff = result2.averageCost - result1.averageCost
  const utilDiff = result2.averageUtilization - result1.averageUtilization
  const slaDiff = result2.averageSLACompliance - result1.averageSLACompliance
  const riskDiff = result2.riskMetrics.overallRisk - result1.riskMetrics.overallRisk

  let recommendation = ''
  if (costDiff < -100 && riskDiff < 5) {
    recommendation = `✅ Scenario 2 is better: ${Math.abs(costDiff).toFixed(0)} lower cost with acceptable risk`
  } else if (utilDiff > 5 && slaDiff > 2) {
    recommendation = `✅ Scenario 2 is better: Higher utilization and SLA compliance`
  } else if (riskDiff < -10) {
    recommendation = `✅ Scenario 1 is better: ${Math.abs(riskDiff).toFixed(1)}% lower risk`
  } else {
    recommendation = `⚖️ Both scenarios are comparable. Choose based on strategic priorities.`
  }

  return {
    scenario1: scenario1.name || 'Scenario 1',
    scenario2: scenario2.name || 'Scenario 2',
    costDifference: costDiff,
    utilizationDifference: utilDiff,
    slaDifference: slaDiff,
    riskDifference: riskDiff,
    recommendation,
  }
}
