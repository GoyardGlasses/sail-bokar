/**
 * Stock Allocation System
 * Matches orders to stockyards based on availability, quality, and cost
 */

export interface StockyardMaterial {
  materialId: string
  materialName: string
  quantity: number
  reserved: number
  quality: string
  age: number
  lastUpdated: Date
}

export interface StockyardInventory {
  stockyardId: string
  name: string
  location: string
  coordinates: { lat: number; lng: number }
  materials: StockyardMaterial[]
  lastUpdated: Date
  capacity: number
  currentLoad: number
}

export interface StockAllocation {
  orderId: string
  stockyardId: string
  stockyardName: string
  materialId: string
  materialName: string
  quantity: number
  cost: number
  distance: number
  quality: string
  feasibility: number // 0-100
  reason: string
  destination: string
  priority: string
}

export interface AllocationResult {
  allocations: StockAllocation[]
  totalCost: number
  averageFeasibility: number
  unallocatedOrders: string[]
  warnings: string[]
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((to.lat - from.lat) * Math.PI) / 180
  const dLng = ((to.lng - from.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Calculate allocation score for a stockyard-order pair
 */
function calculateAllocationScore(
  stockyard: StockyardInventory,
  order: any,
  material: StockyardMaterial
): number {
  // Availability score (0-100)
  const availableQty = material.quantity - material.reserved
  const availabilityScore = Math.min(100, (availableQty / order.quantity) * 100)

  // Quality score (0-100)
  const qualityScore =
    material.quality === order.requiredQuality ||
    material.quality === 'A' ||
    order.requiredQuality === 'Any'
      ? 100
      : material.quality > order.requiredQuality
        ? 80
        : 50

  // Age score (0-100) - prefer fresher stock
  const ageScore = Math.max(0, 100 - material.age * 10)

  // Capacity score (0-100) - prefer stockyards with capacity
  const capacityScore = Math.min(
    100,
    ((stockyard.capacity - stockyard.currentLoad) / stockyard.capacity) * 100
  )

  // Weighted score
  return (
    availabilityScore * 0.35 +
    qualityScore * 0.25 +
    ageScore * 0.2 +
    capacityScore * 0.2
  )
}

/**
 * Calculate allocation cost
 */
function calculateAllocationCost(
  stockyard: StockyardInventory,
  order: any,
  distance: number
): number {
  // Base cost per tonne
  const baseCost = 500

  // Distance cost (₹5 per km per tonne)
  const distanceCost = distance * 5

  // Quality premium (if higher quality)
  const qualityPremium =
    stockyard.materials.find((m) => m.materialId === order.materialId)
      ?.quality === 'A'
      ? 50
      : 0

  // Total cost per tonne
  const costPerTonne = baseCost + distanceCost + qualityPremium

  // Total cost for order
  return costPerTonne * order.quantity
}

/**
 * Main stock allocation algorithm
 */
export function allocateStockToOrders(
  orders: any[],
  stockyards: StockyardInventory[],
  constraints: any = {}
): AllocationResult {
  const allocations: StockAllocation[] = []
  const unallocatedOrders: string[] = []
  const warnings: string[] = []

  // Sort orders by priority and deadline
  const priorityMap = { urgent: 4, high: 3, medium: 2, low: 1 }
  const sortedOrders = [...orders].sort((a, b) => {
    const priorityDiff =
      (priorityMap[b.priority as keyof typeof priorityMap] || 0) -
      (priorityMap[a.priority as keyof typeof priorityMap] || 0)
    if (priorityDiff !== 0) return priorityDiff
    return new Date(a.requiredDate).getTime() - new Date(b.requiredDate).getTime()
  })

  // Process each order
  for (const order of sortedOrders) {
    // Find stockyards with this material
    const candidates = stockyards.filter((sy) => {
      const material = sy.materials.find((m) => m.materialId === order.materialId)
      if (!material) return false

      const availableQty = material.quantity - material.reserved
      return (
        availableQty >= order.quantity &&
        (order.requiredQuality === 'Any' ||
          material.quality >= order.requiredQuality)
      )
    })

    if (candidates.length === 0) {
      unallocatedOrders.push(order.orderId)
      warnings.push(
        `No stockyard available for order ${order.orderId} (Material: ${order.materialId}, Qty: ${order.quantity})`
      )
      continue
    }

    // Score each candidate
    const scored = candidates.map((sy) => {
      const material = sy.materials.find((m) => m.materialId === order.materialId)!
      const distance = calculateDistance(sy.coordinates, order.destination)
      const score = calculateAllocationScore(sy, order, material)

      return {
        stockyard: sy,
        material,
        distance,
        score,
        cost: calculateAllocationCost(sy, order, distance),
      }
    })

    // Pick best
    const best = scored.sort((a, b) => b.score - a.score)[0]

    if (best) {
      const allocation: StockAllocation = {
        orderId: order.orderId,
        stockyardId: best.stockyard.stockyardId,
        stockyardName: best.stockyard.name,
        materialId: order.materialId,
        materialName: order.materialName,
        quantity: order.quantity,
        cost: best.cost,
        distance: best.distance,
        quality: best.material.quality,
        feasibility: best.score,
        reason: generateAllocationReason(best, order),
        destination: order.destination,
        priority: order.priority,
      }

      allocations.push(allocation)

      // Reserve stock
      best.material.reserved += order.quantity
      best.stockyard.currentLoad += order.quantity
    }
  }

  return {
    allocations,
    totalCost: allocations.reduce((sum, a) => sum + a.cost, 0),
    averageFeasibility:
      allocations.length > 0
        ? allocations.reduce((sum, a) => sum + a.feasibility, 0) / allocations.length
        : 0,
    unallocatedOrders,
    warnings,
  }
}

/**
 * Generate human-readable reason for allocation
 */
function generateAllocationReason(
  scored: any,
  order: any
): string {
  const reasons: string[] = []

  if (scored.score >= 90) {
    reasons.push('Optimal match')
  } else if (scored.score >= 75) {
    reasons.push('Good match')
  } else {
    reasons.push('Acceptable match')
  }

  if (scored.material.quality === 'A') {
    reasons.push('Premium quality available')
  }

  if (scored.distance < 100) {
    reasons.push('Close proximity')
  } else if (scored.distance < 300) {
    reasons.push('Moderate distance')
  } else {
    reasons.push('Long distance')
  }

  if (scored.material.age < 7) {
    reasons.push('Fresh stock')
  }

  return reasons.join('; ')
}

/**
 * Get allocation summary
 */
export function getAllocationSummary(result: AllocationResult): any {
  return {
    totalOrders: result.allocations.length + result.unallocatedOrders.length,
    allocatedOrders: result.allocations.length,
    unallocatedOrders: result.unallocatedOrders.length,
    allocationRate: (
      (result.allocations.length /
        (result.allocations.length + result.unallocatedOrders.length)) *
      100
    ).toFixed(1),
    totalCost: result.totalCost,
    averageFeasibility: result.averageFeasibility.toFixed(1),
    warnings: result.warnings,
  }
}

/**
 * Validate allocation against constraints
 */
export function validateAllocation(
  allocation: StockAllocation,
  constraints: any
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (allocation.quantity < (constraints.minOrderQty || 0)) {
    errors.push(`Order quantity below minimum (${constraints.minOrderQty})`)
  }

  if (allocation.quantity > (constraints.maxOrderQty || 10000)) {
    errors.push(`Order quantity exceeds maximum (${constraints.maxOrderQty})`)
  }

  if (allocation.distance > (constraints.maxDistance || 1000)) {
    errors.push(`Distance exceeds maximum (${constraints.maxDistance} km)`)
  }

  if (allocation.feasibility < (constraints.minFeasibility || 50)) {
    errors.push(`Feasibility below minimum (${constraints.minFeasibility}%)`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
