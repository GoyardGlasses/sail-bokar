/**
 * Advanced Rake Formation Algorithms
 * Feature 1: Multi-destination rake support
 * Feature 3: Rail vs road optimization
 * Feature 4: Wagon type specifications
 */

import {
  RakeFormationInput,
  PlannedRake,
  RakeComposition,
  AlgorithmConfig,
} from './types'

// ============================================================================
// FEATURE 1: MULTI-DESTINATION RAKE SUPPORT
// ============================================================================

export interface DestinationStop {
  destination: string
  orders: RakeComposition[]
  unloadingSequence: number
  unloadingTime: number
  distance?: number
}

export interface MultiDestinationRake extends PlannedRake {
  multiDestination: boolean
  destinations: DestinationStop[]
  unloadingSequenceCost: number
}

/**
 * Optimize unloading sequence for multi-destination rakes
 * Uses nearest neighbor algorithm to minimize travel distance
 */
export function optimizeUnloadingSequence(
  destinations: DestinationStop[],
  distanceMatrix: Map<string, Map<string, number>>
): DestinationStop[] {
  if (destinations.length <= 1) return destinations

  const optimized: DestinationStop[] = []
  const remaining = new Set(destinations.map((_, i) => i))
  let current = 0
  optimized.push({ ...destinations[0], unloadingSequence: 1 })
  remaining.delete(0)

  while (remaining.size > 0) {
    let nearest = -1
    let minDistance = Infinity

    for (const idx of remaining) {
      const dist = distanceMatrix.get(destinations[current].destination)?.get(destinations[idx].destination) || Infinity
      if (dist < minDistance) {
        minDistance = dist
        nearest = idx
      }
    }

    if (nearest !== -1) {
      optimized.push({
        ...destinations[nearest],
        unloadingSequence: optimized.length + 1,
      })
      current = nearest
      remaining.delete(nearest)
    }
  }

  return optimized
}

/**
 * Calculate cost of unloading sequence
 * Includes: travel distance, time, demurrage
 */
export function calculateUnloadingSequenceCost(
  destinations: DestinationStop[],
  costPerKm: number = 50,
  demurragePerHour: number = 500
): number {
  let totalCost = 0
  let totalDistance = 0
  let totalTime = 0

  for (let i = 0; i < destinations.length - 1; i++) {
    totalDistance += destinations[i].distance || 100 // Default 100 km between destinations
    totalTime += destinations[i].unloadingTime
  }

  totalCost = totalDistance * costPerKm + totalTime * demurragePerHour

  return totalCost
}

/**
 * Group orders into multi-destination rake
 * Maximizes utilization while minimizing sequence cost
 */
export function groupOrdersForMultiDestination(
  orders: RakeComposition[],
  rakeCapacity: number,
  maxDestinations: number = 3
): RakeComposition[][] {
  const groups: RakeComposition[][] = []
  const destinationMap = new Map<string, RakeComposition[]>()

  // Group orders by destination
  for (const order of orders) {
    if (!destinationMap.has(order.destination)) {
      destinationMap.set(order.destination, [])
    }
    destinationMap.get(order.destination)!.push(order)
  }

  // Combine destinations to maximize utilization
  const destinations = Array.from(destinationMap.entries())
  let currentGroup: RakeComposition[] = []
  let currentLoad = 0

  for (const [_, destOrders] of destinations) {
    for (const order of destOrders) {
      if (currentLoad + order.quantity <= rakeCapacity) {
        currentGroup.push(order)
        currentLoad += order.quantity
      } else {
        if (currentGroup.length > 0) {
          groups.push(currentGroup)
        }
        currentGroup = [order]
        currentLoad = order.quantity
      }
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  return groups
}

// ============================================================================
// FEATURE 3: RAIL VS ROAD OPTIMIZATION
// ============================================================================

export interface TransportMode {
  mode: 'rail' | 'road' | 'hybrid'
  cost: number
  transitTime: number // hours
  capacity: number // tonnes
  reliability: number // 0-100
  emissions: number // kg CO2
  costPerTonne: number
  costPerKm: number
  flexibilityScore: number // 0-100
}

export interface ModeComparison {
  rail: TransportMode
  road: TransportMode
  hybrid: TransportMode
  recommendation: 'rail' | 'road' | 'hybrid'
  reason: string
  costSavings: number
}

/**
 * Calculate rail transport option
 */
export function calculateRailOption(
  distance: number,
  quantity: number,
  urgency: 'low' | 'medium' | 'high' | 'urgent'
): TransportMode {
  const baseRate = 25 // ₹ per tonne
  const cost = quantity * baseRate + distance * 100
  const transitTime = distance / 50 + 4 // 50 km/hour + 4 hours loading/unloading

  return {
    mode: 'rail',
    cost,
    transitTime,
    capacity: 2000,
    reliability: 95,
    emissions: 50,
    costPerTonne: baseRate,
    costPerKm: 100,
    flexibilityScore: 40,
  }
}

/**
 * Calculate road transport option
 */
export function calculateRoadOption(
  distance: number,
  quantity: number,
  urgency: 'low' | 'medium' | 'high' | 'urgent'
): TransportMode {
  const baseRate = 150 // ₹ per tonne
  const cost = quantity * baseRate + distance * 50
  const transitTime = distance / 60 + 2 // 60 km/hour + 2 hours loading/unloading

  return {
    mode: 'road',
    cost,
    transitTime,
    capacity: 500,
    reliability: 85,
    emissions: 200,
    costPerTonne: baseRate,
    costPerKm: 50,
    flexibilityScore: 90,
  }
}

/**
 * Calculate hybrid (rail + road) option
 * Rail for long distance, road for last mile
 */
export function calculateHybridOption(
  distance: number,
  quantity: number,
  urgency: 'low' | 'medium' | 'high' | 'urgent'
): TransportMode {
  const railDistance = distance * 0.8
  const roadDistance = distance * 0.2

  const railCost = quantity * 25 + railDistance * 100
  const roadCost = quantity * 50 + roadDistance * 50
  const cost = railCost + roadCost

  const railTime = railDistance / 50
  const roadTime = roadDistance / 60
  const transitTime = railTime + roadTime + 3 // 3 hours for transshipment

  return {
    mode: 'hybrid',
    cost,
    transitTime,
    capacity: 2000,
    reliability: 92,
    emissions: 100,
    costPerTonne: cost / quantity,
    costPerKm: cost / distance,
    flexibilityScore: 70,
  }
}

/**
 * Compare all transport modes and recommend best
 */
export function compareTransportModes(
  distance: number,
  quantity: number,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  constraints: any = {}
): ModeComparison {
  const rail = calculateRailOption(distance, quantity, priority)
  const road = calculateRoadOption(distance, quantity, priority)
  const hybrid = calculateHybridOption(distance, quantity, priority)

  let recommendation: 'rail' | 'road' | 'hybrid' = 'rail'
  let reason = ''

  // Priority-based selection
  if (priority === 'urgent') {
    if (road.transitTime < rail.transitTime) {
      recommendation = 'road'
      reason = 'Urgent shipment - road faster'
    } else {
      recommendation = 'rail'
      reason = 'Urgent shipment - rail available'
    }
  } else if (priority === 'high') {
    if (hybrid.cost < rail.cost && hybrid.transitTime < rail.transitTime * 1.2) {
      recommendation = 'hybrid'
      reason = 'High priority - hybrid balances cost and time'
    } else if (rail.cost < road.cost) {
      recommendation = 'rail'
      reason = 'High priority - rail cost-effective'
    } else {
      recommendation = 'road'
      reason = 'High priority - road faster'
    }
  } else {
    // Default: minimize cost
    if (rail.cost < road.cost && rail.cost < hybrid.cost) {
      recommendation = 'rail'
      reason = 'Rail most cost-effective'
    } else if (hybrid.cost < road.cost) {
      recommendation = 'hybrid'
      reason = 'Hybrid offers best balance'
    } else {
      recommendation = 'road'
      reason = 'Road most suitable for this route'
    }
  }

  const selectedMode = recommendation === 'rail' ? rail : recommendation === 'road' ? road : hybrid
  const costSavings = Math.max(rail.cost, road.cost) - selectedMode.cost

  return {
    rail,
    road,
    hybrid,
    recommendation,
    reason,
    costSavings,
  }
}

// ============================================================================
// FEATURE 4: WAGON TYPE SPECIFICATIONS
// ============================================================================

export interface WagonType {
  id: string
  name: string
  capacity: number // tonnes
  length: number // meters
  width: number // meters
  height: number // meters
  weight: number // tonnes (empty)
  equipment: string[] // ['conveyor', 'loader', etc]
  compatibleMaterials: string[]
  costPerKm: number
  maintenanceCost: number
  utilizationRate: number // 0-100
}

export interface ProductWagonMatch {
  product: string
  wagon: WagonType
  compatibility: number // 0-100
  utilizationScore: number
  costScore: number
  recommendationScore: number
}

// Default wagon types
export const DEFAULT_WAGON_TYPES: WagonType[] = [
  {
    id: 'wagon-001',
    name: 'Flat Wagon',
    capacity: 2000,
    length: 13.7,
    width: 2.74,
    height: 1.2,
    weight: 25,
    equipment: ['conveyor', 'loader'],
    compatibleMaterials: ['coal', 'ore', 'limestone', 'plates', 'coils'],
    costPerKm: 50,
    maintenanceCost: 5000,
    utilizationRate: 85,
  },
  {
    id: 'wagon-002',
    name: 'Covered Wagon',
    capacity: 1500,
    length: 13.7,
    width: 2.74,
    height: 2.5,
    weight: 30,
    equipment: ['conveyor', 'loader', 'cover'],
    compatibleMaterials: ['coal', 'ore', 'limestone', 'sheets'],
    costPerKm: 60,
    maintenanceCost: 6000,
    utilizationRate: 80,
  },
  {
    id: 'wagon-003',
    name: 'Hopper Wagon',
    capacity: 2500,
    length: 13.7,
    width: 2.74,
    height: 3.0,
    weight: 28,
    equipment: ['hopper', 'conveyor'],
    compatibleMaterials: ['coal', 'ore', 'limestone'],
    costPerKm: 55,
    maintenanceCost: 5500,
    utilizationRate: 90,
  },
  {
    id: 'wagon-004',
    name: 'Tank Wagon',
    capacity: 1800,
    length: 13.7,
    width: 2.74,
    height: 2.8,
    weight: 32,
    equipment: ['pump', 'valve'],
    compatibleMaterials: ['liquid', 'oil'],
    costPerKm: 70,
    maintenanceCost: 7000,
    utilizationRate: 75,
  },
  {
    id: 'wagon-005',
    name: 'Container Wagon',
    capacity: 2000,
    length: 13.7,
    width: 2.74,
    height: 2.0,
    weight: 22,
    equipment: ['container', 'loader'],
    compatibleMaterials: ['plates', 'coils', 'sheets', 'bars'],
    costPerKm: 65,
    maintenanceCost: 4500,
    utilizationRate: 88,
  },
]

/**
 * Find best wagon for product
 */
export function findBestWagon(
  product: string,
  quantity: number,
  wagonTypes: WagonType[] = DEFAULT_WAGON_TYPES
): ProductWagonMatch[] {
  return wagonTypes
    .map((wagon) => ({
      product,
      wagon,
      compatibility: calculateCompatibility(product, wagon),
      utilizationScore: calculateUtilization(quantity, wagon.capacity),
      costScore: calculateCostScore(wagon),
      recommendationScore: 0,
    }))
    .map((match) => ({
      ...match,
      recommendationScore:
        match.compatibility * 0.4 + match.utilizationScore * 0.4 + (100 - match.costScore) * 0.2,
    }))
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
}

function calculateCompatibility(product: string, wagon: WagonType): number {
  if (!wagon.compatibleMaterials.includes(product.toLowerCase())) return 0
  return 100
}

function calculateUtilization(quantity: number, capacity: number): number {
  return Math.min(100, (quantity / capacity) * 100)
}

function calculateCostScore(wagon: WagonType): number {
  return wagon.costPerKm + wagon.maintenanceCost / 1000
}

// ============================================================================
// FEATURE 5: AUTOMATED DAILY PLANNING (Scheduling Logic)
// ============================================================================

export interface DailyPlanConfig {
  planningTime: string // '02:00' format
  minAccuracyThreshold: number // 0-1
  maxRetrainAttempts: number
  autoApprove: boolean
  notifyOnCompletion: boolean
}

export const DEFAULT_PLAN_CONFIG: DailyPlanConfig = {
  planningTime: '02:00',
  minAccuracyThreshold: 0.7,
  maxRetrainAttempts: 3,
  autoApprove: false,
  notifyOnCompletion: true,
}

/**
 * Check if it's time to run daily planning
 */
export function isTimeForDailyPlanning(config: DailyPlanConfig): boolean {
  const now = new Date()
  const [hours, minutes] = config.planningTime.split(':').map(Number)
  const planTime = new Date()
  planTime.setHours(hours, minutes, 0, 0)

  const timeDiff = Math.abs(now.getTime() - planTime.getTime())
  return timeDiff < 60000 // Within 1 minute
}

/**
 * Generate daily plan ID
 */
export function generateDailyPlanId(): string {
  const date = new Date()
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
  return `DAILY-PLAN-${dateStr}-${Date.now()}`
}

/**
 * Calculate dynamic penalty based on delay
 */
export function calculateDynamicPenalty(
  delayHours: number,
  slaHours: number,
  baseRate: number = 1000
): number {
  if (delayHours <= 0) return 0

  const delayPercentage = (delayHours / slaHours) * 100
  const penaltyMultiplier = 1 + delayPercentage / 100

  return baseRate * penaltyMultiplier
}

/**
 * Calculate demurrage cost
 */
export function calculateDemurrageCost(
  idleHours: number,
  demurrageRate: number = 500 // ₹ per hour
): number {
  return idleHours * demurrageRate
}

/**
 * Calculate idle freight cost
 */
export function calculateIdleFreightCost(
  quantity: number,
  idleDays: number,
  costPerTonnePerDay: number = 50
): number {
  return quantity * idleDays * costPerTonnePerDay
}

// ============================================================================
// FEATURE 2: MULTI-STOCKYARD SOURCING (Helper Functions)
// ============================================================================

export interface StockyardCombination {
  stockyards: {
    stockyardId: string
    quantity: number
    cost: number
  }[]
  totalCost: number
  totalDistance: number
}

/**
 * Generate combinations of stockyards for material sourcing
 */
export function generateStockyardCombinations(
  stockyards: any[],
  requiredQuantity: number,
  maxCombinationSize: number = 3
): StockyardCombination[] {
  const combinations: StockyardCombination[] = []

  // Single stockyard combinations
  for (const sy of stockyards) {
    if (sy.availableQuantity >= requiredQuantity) {
      combinations.push({
        stockyards: [
          {
            stockyardId: sy.stockyardId,
            quantity: requiredQuantity,
            cost: calculateStockyardCost(sy, requiredQuantity),
          },
        ],
        totalCost: calculateStockyardCost(sy, requiredQuantity),
        totalDistance: sy.distance || 0,
      })
    }
  }

  // Multi-stockyard combinations
  for (let i = 0; i < stockyards.length && i < maxCombinationSize; i++) {
    for (let j = i + 1; j < stockyards.length; j++) {
      const sy1 = stockyards[i]
      const sy2 = stockyards[j]

      const qty1 = Math.min(sy1.availableQuantity, requiredQuantity)
      const qty2 = Math.min(sy2.availableQuantity, requiredQuantity - qty1)

      if (qty1 + qty2 >= requiredQuantity) {
        const cost1 = calculateStockyardCost(sy1, qty1)
        const cost2 = calculateStockyardCost(sy2, qty2)

        combinations.push({
          stockyards: [
            { stockyardId: sy1.stockyardId, quantity: qty1, cost: cost1 },
            { stockyardId: sy2.stockyardId, quantity: qty2, cost: cost2 },
          ],
          totalCost: cost1 + cost2,
          totalDistance: (sy1.distance || 0) + (sy2.distance || 0),
        })
      }
    }
  }

  return combinations.sort((a, b) => a.totalCost - b.totalCost)
}

function calculateStockyardCost(stockyard: any, quantity: number): number {
  const baseCost = quantity * (stockyard.costPerTonne || 100)
  const distanceCost = (stockyard.distance || 0) * 50
  return baseCost + distanceCost
}
