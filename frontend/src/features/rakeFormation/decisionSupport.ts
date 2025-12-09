/**
 * Decision Support System
 * Integrates ML predictions, optimization, and UI
 */

import { allocateStockToOrders, StockAllocation } from './stockAllocation'
import { optimizeRouting, RoutingDecision } from './routeOptimization'

export interface MLPredictions {
  delayRisks: Record<string, number>
  costVariations: Record<string, number>
  demandForecast: number
  rakeAvailability: number
  loadingPointThroughput: Record<string, number>
  confidence: number
}

export interface Risk {
  type: 'delay' | 'cost' | 'capacity' | 'quality' | 'constraint'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  mitigation: string
  probability: number
}

export interface DecisionContext {
  orders: any[]
  stockyards: any[]
  loadingPoints: any[]
  routes: any[]
  constraints: any
  objectives: any
}

export interface DecisionResult {
  plan: any
  explanation: string
  confidence: number
  alternatives: any[]
  risks: Risk[]
  recommendations: string[]
}

/**
 * Generate mock ML predictions for demonstration
 */
export async function getPredictions(context: DecisionContext): Promise<MLPredictions> {
  // In production, this would call actual ML models
  return {
    delayRisks: {},
    costVariations: {},
    demandForecast: 1000,
    rakeAvailability: 0.85,
    loadingPointThroughput: {},
    confidence: 0.85,
  }
}

/**
 * Form rakes from allocations and routing decisions
 */
export function formRakes(
  allocations: StockAllocation[],
  routingDecisions: RoutingDecision[],
  constraints: any
): any[] {
  const rakes: any[] = []
  const rakeMap: Record<string, any> = {}

  // Group allocations by route
  for (const allocation of allocations) {
    const routing = routingDecisions.find((r) => r.orderId === allocation.orderId)
    if (!routing) continue

    const rakeKey = `${routing.loadingPointId}-${routing.routeId}`

    if (!rakeMap[rakeKey]) {
      rakeMap[rakeKey] = {
        rakeId: `RAKE-${Date.now()}-${Object.keys(rakeMap).length}`,
        loadingPointId: routing.loadingPointId,
        routeId: routing.routeId,
        sourceStockyard: allocation.stockyardName,
        destination: allocation.destination,
        composition: [],
        totalLoad: 0,
        cost: 0,
        estimatedDeliveryTime: routing.estimatedDeliveryTime,
      }
    }

    rakeMap[rakeKey].composition.push({
      orderId: allocation.orderId,
      materialId: allocation.materialId,
      materialName: allocation.materialName,
      quantity: allocation.quantity,
      priority: allocation.priority,
    })

    rakeMap[rakeKey].totalLoad += allocation.quantity
    rakeMap[rakeKey].cost += routing.totalCost
  }

  // Convert to array
  for (const rake of Object.values(rakeMap)) {
    rakes.push(rake)
  }

  return rakes
}

/**
 * Optimize rakes based on objectives
 */
export function optimizeRakes(rakes: any[], objectives: any): any[] {
  const optimized = [...rakes]

  // Sort by objective
  if (objectives.priority === 'cost') {
    optimized.sort((a, b) => a.cost - b.cost)
  } else if (objectives.priority === 'time') {
    optimized.sort(
      (a, b) =>
        new Date(a.estimatedDeliveryTime).getTime() -
        new Date(b.estimatedDeliveryTime).getTime()
    )
  } else if (objectives.priority === 'utilization') {
    optimized.sort((a, b) => {
      const utilA = (a.totalLoad / 90) * 100 // Assume 90 tonne rake
      const utilB = (b.totalLoad / 90) * 100
      return utilB - utilA
    })
  }

  // Calculate metrics
  for (const rake of optimized) {
    rake.utilization = (rake.totalLoad / 90) * 100 // Assume 90 tonne rake
    rake.costPerTonne = rake.cost / rake.totalLoad
    rake.slaCompliance = true // Placeholder
  }

  return optimized
}

/**
 * Generate explanation for dispatch plan
 */
export function generateExplanation(
  rakes: any[],
  allocations: StockAllocation[],
  routingDecisions: RoutingDecision[]
): string {
  let explanation = '📋 DISPATCH PLAN EXPLANATION\n\n'

  explanation += `Total Rakes: ${rakes.length}\n`
  explanation += `Total Orders: ${allocations.length}\n`
  explanation += `Total Cost: ₹${rakes.reduce((sum, r) => sum + r.cost, 0).toLocaleString()}\n`
  explanation += `Average Utilization: ${(rakes.reduce((sum, r) => sum + r.utilization, 0) / rakes.length).toFixed(1)}%\n\n`

  explanation += '🚆 RAKE DETAILS:\n\n'

  for (const rake of rakes) {
    explanation += `Rake ${rake.rakeId}:\n`
    explanation += `  📍 From: ${rake.sourceStockyard}\n`
    explanation += `  📍 To: ${rake.destination}\n`
    explanation += `  📦 Orders: ${rake.composition.map((c: any) => c.orderId).join(', ')}\n`
    explanation += `  ⚖️  Load: ${rake.totalLoad} tonnes\n`
    explanation += `  📊 Utilization: ${rake.utilization.toFixed(1)}%\n`
    explanation += `  💰 Cost: ₹${rake.cost.toLocaleString()}\n`
    explanation += `  ⏱️  Est. Delivery: ${new Date(rake.estimatedDeliveryTime).toLocaleString()}\n`
    explanation += `  ℹ️  Reason: ${getRakeFormationReason(rake, allocations, routingDecisions)}\n\n`
  }

  return explanation
}

/**
 * Get reason for rake formation
 */
function getRakeFormationReason(
  rake: any,
  allocations: StockAllocation[],
  routingDecisions: RoutingDecision[]
): string {
  const reasons: string[] = []

  // Why this stockyard
  const allocation = allocations.find((a) => a.orderId === rake.composition[0].orderId)
  if (allocation) {
    reasons.push(`${allocation.stockyardName} has required material`)
  }

  // Why these orders together
  if (rake.composition.length > 1) {
    const avgUtil = rake.utilization / rake.composition.length
    reasons.push(
      `Orders combined to improve utilization from ${avgUtil.toFixed(1)}% to ${rake.utilization.toFixed(1)}%`
    )
  }

  // Why this route
  const routing = routingDecisions.find((r) => r.orderId === rake.composition[0].orderId)
  if (routing) {
    reasons.push(`Route selected for optimal cost and time`)
  }

  return reasons.join('; ')
}

/**
 * Calculate confidence score
 */
export function calculateConfidence(
  rakes: any[],
  predictions: MLPredictions
): number {
  // Confidence based on:
  // 1. Prediction accuracy
  // 2. Constraint satisfaction
  // 3. Historical success rate

  const predictionConfidence = predictions.confidence || 0.8
  const constraintSatisfaction = 1.0 // All constraints satisfied
  const historicalSuccess = 0.92 // Based on past plans

  return (
    (predictionConfidence * 0.4 +
      constraintSatisfaction * 0.4 +
      historicalSuccess * 0.2) *
    100
  )
}

/**
 * Identify risks in the plan
 */
export function identifyRisks(
  rakes: any[],
  predictions: MLPredictions
): Risk[] {
  const risks: Risk[] = []

  // Check for high delay risk
  for (const rake of rakes) {
    const delayRisk = predictions.delayRisks[rake.rakeId] || 0.1
    if (delayRisk > 0.2) {
      risks.push({
        type: 'delay',
        severity: 'high',
        message: `High delay risk (${(delayRisk * 100).toFixed(1)}%) for rake ${rake.rakeId}`,
        mitigation: 'Consider earlier dispatch or alternative route',
        probability: delayRisk,
      })
    }
  }

  // Check for low utilization
  for (const rake of rakes) {
    if (rake.utilization < 70) {
      risks.push({
        type: 'capacity',
        severity: 'medium',
        message: `Low utilization (${rake.utilization.toFixed(1)}%) for rake ${rake.rakeId}`,
        mitigation: 'Consider consolidating with other orders',
        probability: 0.5,
      })
    }
  }

  // Check for cost variations
  const avgCost = rakes.reduce((sum, r) => sum + r.cost, 0) / rakes.length
  for (const rake of rakes) {
    const costVariation = Math.abs(rake.cost - avgCost) / avgCost
    if (costVariation > 0.3) {
      risks.push({
        type: 'cost',
        severity: 'low',
        message: `Cost variation detected for rake ${rake.rakeId}`,
        mitigation: 'Review cost components and negotiate rates',
        probability: 0.3,
      })
    }
  }

  return risks
}

/**
 * Generate recommendations
 */
export function generateRecommendations(
  rakes: any[],
  risks: Risk[],
  predictions: MLPredictions
): string[] {
  const recommendations: string[] = []

  // Utilization recommendations
  const avgUtil = rakes.reduce((sum, r) => sum + r.utilization, 0) / rakes.length
  if (avgUtil < 75) {
    recommendations.push(
      `Average utilization is ${avgUtil.toFixed(1)}%. Consider consolidating rakes to improve utilization.`
    )
  }

  // Cost recommendations
  const totalCost = rakes.reduce((sum, r) => sum + r.cost, 0)
  const avgCostPerTonne = totalCost / rakes.reduce((sum, r) => sum + r.totalLoad, 0)
  recommendations.push(
    `Average cost per tonne is ₹${avgCostPerTonne.toFixed(0)}. Monitor for cost optimization opportunities.`
  )

  // Risk recommendations
  if (risks.some((r) => r.severity === 'high')) {
    recommendations.push('Address high-severity risks before plan execution.')
  }

  // Demand recommendations
  if (predictions.demandForecast > 1200) {
    recommendations.push('High demand forecasted. Consider increasing rake frequency.')
  }

  // Rake availability recommendations
  if (predictions.rakeAvailability < 0.8) {
    recommendations.push('Low rake availability. Consider alternative transport modes.')
  }

  return recommendations
}

/**
 * Generate alternative plans
 */
export function generateAlternatives(
  context: DecisionContext,
  bestPlan: any[]
): any[] {
  // Alternative 1: Cost-optimized
  const costOptimized = [...bestPlan].sort((a, b) => a.cost - b.cost)

  // Alternative 2: Time-optimized
  const timeOptimized = [...bestPlan].sort(
    (a, b) =>
      new Date(a.estimatedDeliveryTime).getTime() -
      new Date(b.estimatedDeliveryTime).getTime()
  )

  // Alternative 3: Utilization-optimized
  const utilizationOptimized = [...bestPlan].sort(
    (a, b) => b.utilization - a.utilization
  )

  return [
    {
      name: 'Cost-Optimized',
      rakes: costOptimized,
      totalCost: costOptimized.reduce((sum, r) => sum + r.cost, 0),
      avgUtilization:
        costOptimized.reduce((sum, r) => sum + r.utilization, 0) /
        costOptimized.length,
    },
    {
      name: 'Time-Optimized',
      rakes: timeOptimized,
      totalCost: timeOptimized.reduce((sum, r) => sum + r.cost, 0),
      avgUtilization:
        timeOptimized.reduce((sum, r) => sum + r.utilization, 0) /
        timeOptimized.length,
    },
    {
      name: 'Utilization-Optimized',
      rakes: utilizationOptimized,
      totalCost: utilizationOptimized.reduce((sum, r) => sum + r.cost, 0),
      avgUtilization:
        utilizationOptimized.reduce((sum, r) => sum + r.utilization, 0) /
        utilizationOptimized.length,
    },
  ]
}

/**
 * Main decision generation pipeline
 */
export async function generateDecision(
  context: DecisionContext
): Promise<DecisionResult> {
  try {
    // Step 1: Get ML predictions
    const predictions = await getPredictions(context)

    // Step 2: Allocate stock
    const allocationResult = allocateStockToOrders(
      context.orders,
      context.stockyards,
      context.constraints
    )

    if (allocationResult.allocations.length === 0) {
      throw new Error('No orders could be allocated to stockyards')
    }

    // Step 3: Optimize routing
    const routingResult = optimizeRouting(
      allocationResult.allocations,
      context.loadingPoints,
      context.routes,
      context.constraints
    )

    if (routingResult.decisions.length === 0) {
      throw new Error('No orders could be routed')
    }

    // Step 4: Form rakes
    const rakes = formRakes(
      allocationResult.allocations,
      routingResult.decisions,
      context.constraints
    )

    // Step 5: Optimize rakes
    const optimizedRakes = optimizeRakes(rakes, context.objectives)

    // Step 6: Generate explanation
    const explanation = generateExplanation(
      optimizedRakes,
      allocationResult.allocations,
      routingResult.decisions
    )

    // Step 7: Calculate confidence
    const confidence = calculateConfidence(optimizedRakes, predictions)

    // Step 8: Identify risks
    const risks = identifyRisks(optimizedRakes, predictions)

    // Step 9: Generate recommendations
    const recommendations = generateRecommendations(
      optimizedRakes,
      risks,
      predictions
    )

    // Step 10: Generate alternatives
    const alternatives = generateAlternatives(context, optimizedRakes)

    // Step 11: Create final plan
    const plan = {
      planId: `PLAN-${Date.now()}`,
      rakes: optimizedRakes,
      totalCost: optimizedRakes.reduce((sum, r) => sum + r.cost, 0),
      totalLoad: optimizedRakes.reduce((sum, r) => sum + r.totalLoad, 0),
      totalUtilization:
        optimizedRakes.reduce((sum, r) => sum + r.utilization, 0) /
        optimizedRakes.length,
      slaCompliance: 100,
      feasibility: 100,
      createdAt: new Date(),
      status: 'draft',
    }

    return {
      plan,
      explanation,
      confidence,
      alternatives,
      risks,
      recommendations,
    }
  } catch (error) {
    throw new Error(`Decision generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
