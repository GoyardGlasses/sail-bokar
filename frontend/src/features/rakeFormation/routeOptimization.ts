/**
 * Route Optimization System
 * Optimizes loading points and routes for dispatch
 */

export interface LoadingPointEquipment {
  type: string // 'conveyor', 'loader', 'magnet', 'tippler', etc.
  capacity: number
  available: boolean
}

export interface LoadingPointStatus {
  pointId: string
  stockyardId: string
  name: string
  capacity: number // tonnes/day
  currentLoad: number
  availableCapacity: number
  nextAvailableTime: Date
  equipment: LoadingPointEquipment[]
  operationalHours: { start: string; end: string }
  throughput: number // tonnes/hour
  lastUpdated: Date
}

export interface Route {
  routeId: string
  from: string
  to: string
  distance: number
  estimatedTime: number // hours
  cost: number // ₹ per tonne
  congestionLevel: number // 0-100
  sidingCapacity: number // wagons
  restrictions: string[]
  lastUpdated: Date
}

export interface RoutingDecision {
  orderId: string
  loadingPointId: string
  routeId: string
  totalCost: number
  estimatedDeliveryTime: Date
  feasibility: number
  reason: string
}

export interface RoutingResult {
  decisions: RoutingDecision[]
  totalCost: number
  averageFeasibility: number
  unroutedOrders: string[]
  warnings: string[]
}

/**
 * Check if loading point has required equipment for material
 */
function hasRequiredEquipment(
  lp: LoadingPointStatus,
  materialId: string
): boolean {
  // Equipment requirements by material type
  const equipmentMap: Record<string, string[]> = {
    'coal-001': ['conveyor', 'loader'],
    'coal-002': ['conveyor', 'loader'],
    'ore-001': ['conveyor', 'magnet'],
    'ore-002': ['conveyor', 'magnet'],
    'limestone-001': ['conveyor'],
    'limestone-002': ['conveyor'],
    'coke-001': ['conveyor', 'loader'],
    'sinter-001': ['conveyor'],
    'pellets-001': ['conveyor'],
  }

  const required = equipmentMap[materialId] || ['conveyor']
  return required.every((eq) =>
    lp.equipment.some((e) => e.type === eq && e.available)
  )
}

/**
 * Calculate routing score for a loading point and route combination
 */
function calculateRoutingScore(
  lp: LoadingPointStatus,
  route: Route,
  allocation: any,
  constraints: any
): number {
  // Capacity score (0-100)
  const capacityScore = Math.min(
    100,
    (lp.availableCapacity / lp.capacity) * 100
  )

  // Cost score (0-100) - prefer cheaper routes
  const costScore = Math.max(0, 100 - (route.cost / 1000) * 10)

  // Congestion score (0-100) - prefer less congested routes
  const congestionScore = Math.max(0, 100 - route.congestionLevel)

  // Time score (0-100) - prefer faster routes
  const timeScore = Math.max(0, 100 - (route.estimatedTime / 48) * 10)

  // Equipment score (0-100)
  const equipmentScore = hasRequiredEquipment(lp, allocation.materialId)
    ? 100
    : 0

  // Weighted score
  return (
    capacityScore * 0.2 +
    costScore * 0.3 +
    congestionScore * 0.2 +
    timeScore * 0.15 +
    equipmentScore * 0.15
  )
}

/**
 * Main routing optimization algorithm
 */
export function optimizeRouting(
  allocations: any[],
  loadingPoints: LoadingPointStatus[],
  routes: Route[],
  constraints: any = {}
): RoutingResult {
  const decisions: RoutingDecision[] = []
  const unroutedOrders: string[] = []
  const warnings: string[] = []

  // Process each allocation
  for (const allocation of allocations) {
    // Find loading points at this stockyard
    const availableLPs = loadingPoints.filter(
      (lp) =>
        lp.stockyardId === allocation.stockyardId &&
        lp.availableCapacity >= allocation.quantity &&
        hasRequiredEquipment(lp, allocation.materialId)
    )

    if (availableLPs.length === 0) {
      unroutedOrders.push(allocation.orderId)
      warnings.push(
        `No suitable loading point at ${allocation.stockyardName} for material ${allocation.materialId}`
      )
      continue
    }

    // Find routes from this stockyard to destination
    const possibleRoutes = routes.filter(
      (r) =>
        r.from === allocation.stockyardId &&
        r.to === allocation.destination &&
        r.sidingCapacity >= (constraints.minRakeSize || 55)
    )

    if (possibleRoutes.length === 0) {
      unroutedOrders.push(allocation.orderId)
      warnings.push(
        `No suitable route from ${allocation.stockyardId} to ${allocation.destination}`
      )
      continue
    }

    // Score each combination
    const scored = availableLPs.flatMap((lp) =>
      possibleRoutes.map((route) => ({
        lp,
        route,
        score: calculateRoutingScore(lp, route, allocation, constraints),
      }))
    )

    // Pick best
    const best = scored.sort((a, b) => b.score - a.score)[0]

    if (best) {
      const decision: RoutingDecision = {
        orderId: allocation.orderId,
        loadingPointId: best.lp.pointId,
        routeId: best.route.routeId,
        totalCost: allocation.cost + best.route.cost * allocation.quantity,
        estimatedDeliveryTime: new Date(
          Date.now() + best.route.estimatedTime * 3600000
        ),
        feasibility: best.score,
        reason: generateRoutingReason(best, allocation),
      }

      decisions.push(decision)

      // Update loading point capacity
      best.lp.currentLoad += allocation.quantity
      best.lp.availableCapacity -= allocation.quantity
    }
  }

  return {
    decisions,
    totalCost: decisions.reduce((sum, d) => sum + d.totalCost, 0),
    averageFeasibility:
      decisions.length > 0
        ? decisions.reduce((sum, d) => sum + d.feasibility, 0) / decisions.length
        : 0,
    unroutedOrders,
    warnings,
  }
}

/**
 * Generate human-readable reason for routing decision
 */
function generateRoutingReason(scored: any, allocation: any): string {
  const reasons: string[] = []

  if (scored.score >= 90) {
    reasons.push('Optimal routing')
  } else if (scored.score >= 75) {
    reasons.push('Good routing')
  } else {
    reasons.push('Acceptable routing')
  }

  reasons.push(`Loading Point: ${scored.lp.name}`)
  reasons.push(`Route: ${scored.route.distance}km`)

  if (scored.route.congestionLevel < 30) {
    reasons.push('Low congestion')
  } else if (scored.route.congestionLevel < 70) {
    reasons.push('Moderate congestion')
  } else {
    reasons.push('High congestion')
  }

  return reasons.join('; ')
}

/**
 * Get routing summary
 */
export function getRoutingSummary(result: RoutingResult): any {
  return {
    totalAllocations: result.decisions.length + result.unroutedOrders.length,
    routedAllocations: result.decisions.length,
    unroutedAllocations: result.unroutedOrders.length,
    routingRate: (
      (result.decisions.length /
        (result.decisions.length + result.unroutedOrders.length)) *
      100
    ).toFixed(1),
    totalCost: result.totalCost,
    averageFeasibility: result.averageFeasibility.toFixed(1),
    warnings: result.warnings,
  }
}

/**
 * Validate routing decision against constraints
 */
export function validateRouting(
  decision: RoutingDecision,
  constraints: any
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (decision.totalCost > (constraints.maxCost || 100000)) {
    errors.push(`Cost exceeds maximum (₹${constraints.maxCost})`)
  }

  if (decision.feasibility < (constraints.minFeasibility || 50)) {
    errors.push(`Feasibility below minimum (${constraints.minFeasibility}%)`)
  }

  const deliveryTime = decision.estimatedDeliveryTime.getTime() - Date.now()
  const maxDeliveryTime = (constraints.maxDeliveryHours || 72) * 3600000
  if (deliveryTime > maxDeliveryTime) {
    errors.push(
      `Estimated delivery time exceeds maximum (${constraints.maxDeliveryHours} hours)`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get loading point utilization
 */
export function getLoadingPointUtilization(
  lps: LoadingPointStatus[]
): Record<string, number> {
  const utilization: Record<string, number> = {}

  for (const lp of lps) {
    utilization[lp.pointId] = ((lp.currentLoad / lp.capacity) * 100).toFixed(1) as any
  }

  return utilization
}

/**
 * Get route statistics
 */
export function getRouteStatistics(
  decisions: RoutingDecision[],
  routes: Route[]
): any {
  const routeUsage: Record<string, number> = {}
  const routeCosts: Record<string, number> = {}

  for (const decision of decisions) {
    routeUsage[decision.routeId] = (routeUsage[decision.routeId] || 0) + 1
    routeCosts[decision.routeId] =
      (routeCosts[decision.routeId] || 0) + decision.totalCost
  }

  return {
    routeUsage,
    routeCosts,
    mostUsedRoute: Object.entries(routeUsage).sort((a, b) => b[1] - a[1])[0],
    leastCostRoute: Object.entries(routeCosts).sort((a, b) => a[1] - b[1])[0],
  }
}
