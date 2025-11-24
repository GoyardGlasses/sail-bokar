/**
 * Rake Formation Optimization Algorithms
 * Multiple algorithms for optimal rake formation
 */

import {
  RakeFormationInput,
  RakeFormationPlan,
  PlannedRake,
  RakeComposition,
  AlgorithmConfig,
  AlgorithmResult,
  FormationMetrics,
} from './types'

// ============================================================================
// GREEDY ALGORITHM - Fast, Good for Real-time
// ============================================================================

export class GreedyAlgorithm {
  static optimize(input: RakeFormationInput, config: AlgorithmConfig): AlgorithmResult {
    const startTime = Date.now()
    const rakes: PlannedRake[] = []
    const allocatedOrders = new Set<string>()
    const remainingRakes = [...input.availableRakes]
    const priorityMap = { urgent: 4, high: 3, medium: 2, low: 1 }

    // Sort orders by priority and SLA
    const sortedOrders = [...input.orders].sort((a, b) => {
      const priorityDiff = priorityMap[b.priority as keyof typeof priorityMap] - priorityMap[a.priority as keyof typeof priorityMap]
      if (priorityDiff !== 0) return priorityDiff
      return new Date(a.requiredDate).getTime() - new Date(b.requiredDate).getTime()
    })

    // Greedy allocation
    for (const order of sortedOrders) {
      if (allocatedOrders.has(order.orderId)) continue

      // Find best rake
      const bestRake = remainingRakes.find(
        (r) => r.capacity - r.currentLoad >= order.quantity
      )

      if (bestRake) {
        // Find best stockyard
        const bestStockyard = input.stockyards.find((s) =>
          s.materials.some((m) => m.materialId === order.materialId && m.quantity >= order.quantity)
        )

        if (bestStockyard) {
          const composition: RakeComposition = {
            orderId: order.orderId,
            materialId: order.materialId,
            materialName: order.materialName,
            quantity: order.quantity,
            destination: order.destination,
            priority: order.priority,
          }

          const plannedRake: PlannedRake = {
            rakeId: bestRake.rakeId,
            composition: [composition],
            totalLoad: order.quantity,
            utilization: (order.quantity / bestRake.capacity) * 100,
            sourceStockyard: bestStockyard.name,
            destination: order.destination,
            loadingPoint: `LP-${bestStockyard.stockyardId}`,
            estimatedLoadingTime: Math.ceil(order.quantity / 100), // 100 tonnes/hour
            estimatedDispatchTime: new Date(Date.now() + 3600000).toISOString(),
            estimatedDeliveryTime: new Date(Date.now() + 172800000).toISOString(), // +2 days
            cost: order.cost,
            costBreakdown: {
              loading: order.cost * 0.2,
              transport: order.cost * 0.6,
              demurrage: order.cost * 0.1,
              penalty: 0,
            },
            priority: priorityMap[order.priority] || 1,
            slaCompliance: true,
          }

          rakes.push(plannedRake)
          allocatedOrders.add(order.orderId)
          bestRake.currentLoad += order.quantity
        }
      }
    }

    const plan = generatePlan(rakes, input, 'greedy', startTime)

    return {
      plan,
      quality: Math.min(100, (allocatedOrders.size / input.orders.length) * 100),
      executionTime: Date.now() - startTime,
      iterations: input.orders.length,
      converged: allocatedOrders.size === input.orders.length,
    }
  }
}

// ============================================================================
// GENETIC ALGORITHM - Better Optimization, Slower
// ============================================================================

export class GeneticAlgorithm {
  static optimize(input: RakeFormationInput, config: AlgorithmConfig): AlgorithmResult {
    const startTime = Date.now()
    const populationSize = config.populationSize || 50
    const maxIterations = config.maxIterations || 100

    // Initialize population
    let population = Array.from({ length: populationSize }, () =>
      generateRandomSolution(input)
    )

    let bestSolution = population[0]
    let bestFitness = calculateFitness(bestSolution, input)

    // Evolution loop
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      if (Date.now() - startTime > config.timeLimit * 1000) break

      // Evaluate fitness
      const fitness = population.map((sol) => calculateFitness(sol, input))

      // Track best
      for (let i = 0; i < population.length; i++) {
        if (fitness[i] > bestFitness) {
          bestFitness = fitness[i]
          bestSolution = population[i]
        }
      }

      // Selection and crossover
      const newPopulation: PlannedRake[][] = []
      for (let i = 0; i < populationSize; i++) {
        const parent1 = selectByFitness(population, fitness)
        const parent2 = selectByFitness(population, fitness)
        const child = crossover(parent1, parent2)
        newPopulation.push(mutate(child))
      }

      population = newPopulation
    }

    const plan = generatePlan(bestSolution, input, 'genetic', startTime)

    return {
      plan,
      quality: Math.min(100, bestFitness),
      executionTime: Date.now() - startTime,
      iterations: maxIterations,
      converged: bestFitness > 90,
    }
  }
}

// ============================================================================
// SIMULATED ANNEALING - Escape Local Optima
// ============================================================================

export class SimulatedAnnealingAlgorithm {
  static optimize(input: RakeFormationInput, config: AlgorithmConfig): AlgorithmResult {
    const startTime = Date.now()
    let temperature = config.temperature || 100
    const coolingRate = config.coolingRate || 0.95
    const maxIterations = config.maxIterations || 1000

    let currentSolution = generateRandomSolution(input)
    let currentFitness = calculateFitness(currentSolution, input)
    let bestSolution = currentSolution
    let bestFitness = currentFitness

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      if (Date.now() - startTime > config.timeLimit * 1000) break

      // Generate neighbor solution
      const neighbor = generateNeighbor(currentSolution)
      const neighborFitness = calculateFitness(neighbor, input)

      // Acceptance probability
      const delta = neighborFitness - currentFitness
      const acceptanceProbability = delta > 0 ? 1 : Math.exp(delta / temperature)

      if (Math.random() < acceptanceProbability) {
        currentSolution = neighbor
        currentFitness = neighborFitness
      }

      // Track best
      if (currentFitness > bestFitness) {
        bestFitness = currentFitness
        bestSolution = currentSolution
      }

      // Cool down
      temperature *= coolingRate
    }

    const plan = generatePlan(bestSolution, input, 'simulated_annealing', startTime)

    return {
      plan,
      quality: Math.min(100, bestFitness),
      executionTime: Date.now() - startTime,
      iterations: maxIterations,
      converged: bestFitness > 85,
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateRandomSolution(input: RakeFormationInput): PlannedRake[] {
  const rakes: PlannedRake[] = []
  const orders = [...input.orders].sort(() => Math.random() - 0.5)

  for (const order of orders) {
    const rake = input.availableRakes[Math.floor(Math.random() * input.availableRakes.length)]
    const stockyard = input.stockyards[Math.floor(Math.random() * input.stockyards.length)]

    const composition: RakeComposition = {
      orderId: order.orderId,
      materialId: order.materialId,
      materialName: order.materialName,
      quantity: order.quantity,
      destination: order.destination,
      priority: order.priority,
    }

    rakes.push({
      rakeId: rake.rakeId,
      composition: [composition],
      totalLoad: order.quantity,
      utilization: (order.quantity / rake.capacity) * 100,
      sourceStockyard: stockyard.name,
      destination: order.destination,
      loadingPoint: `LP-${stockyard.stockyardId}`,
      estimatedLoadingTime: Math.ceil(order.quantity / 100),
      estimatedDispatchTime: new Date(Date.now() + 3600000).toISOString(),
      estimatedDeliveryTime: new Date(Date.now() + 172800000).toISOString(),
      cost: order.cost,
      costBreakdown: {
        loading: order.cost * 0.2,
        transport: order.cost * 0.6,
        demurrage: order.cost * 0.1,
        penalty: 0,
      },
      priority: 1,
      slaCompliance: true,
    })
  }

  return rakes
}

function calculateFitness(solution: PlannedRake[], input: RakeFormationInput): number {
  const totalCost = solution.reduce((sum, r) => sum + r.cost, 0)
  const avgUtilization = solution.reduce((sum, r) => sum + r.utilization, 0) / solution.length
  const slaCompliance = (solution.filter((r) => r.slaCompliance).length / solution.length) * 100

  // Weighted fitness
  const costScore = Math.max(0, 100 - (totalCost / 1000000) * 10)
  const utilizationScore = avgUtilization
  const slaScore = slaCompliance

  return costScore * 0.3 + utilizationScore * 0.4 + slaScore * 0.3
}

function selectByFitness(population: PlannedRake[][], fitness: number[]): PlannedRake[] {
  const totalFitness = fitness.reduce((a, b) => a + b, 0)
  let random = Math.random() * totalFitness
  for (let i = 0; i < population.length; i++) {
    random -= fitness[i]
    if (random <= 0) return population[i]
  }
  return population[population.length - 1]
}

function crossover(parent1: PlannedRake[], parent2: PlannedRake[]): PlannedRake[] {
  const crossoverPoint = Math.floor(Math.random() * Math.min(parent1.length, parent2.length))
  return [...parent1.slice(0, crossoverPoint), ...parent2.slice(crossoverPoint)]
}

function mutate(solution: PlannedRake[]): PlannedRake[] {
  if (Math.random() < 0.1) {
    const idx = Math.floor(Math.random() * solution.length)
    const newSolution = [...solution]
    newSolution[idx] = { ...newSolution[idx], utilization: Math.random() * 100 }
    return newSolution
  }
  return solution
}

function generateNeighbor(solution: PlannedRake[]): PlannedRake[] {
  const neighbor = [...solution]
  const idx = Math.floor(Math.random() * neighbor.length)
  neighbor[idx] = { ...neighbor[idx], utilization: Math.random() * 100 }
  return neighbor
}

function generatePlan(
  rakes: PlannedRake[],
  input: RakeFormationInput,
  algorithm: string,
  startTime: number
): RakeFormationPlan {
  const totalCost = rakes.reduce((sum, r) => sum + r.cost, 0)
  const avgUtilization = rakes.length > 0 ? rakes.reduce((sum, r) => sum + r.utilization, 0) / rakes.length : 0
  const slaCompliance = rakes.length > 0 ? (rakes.filter((r) => r.slaCompliance).length / rakes.length) * 100 : 0

  const metrics: FormationMetrics = {
    totalOrders: input.orders.length,
    allocatedOrders: rakes.length,
    totalQuantity: rakes.reduce((sum, r) => sum + r.totalLoad, 0),
    totalRakes: rakes.length,
    averageUtilization: avgUtilization,
    averageCost: totalCost / Math.max(1, rakes.length),
    totalCost,
    slaCompliance,
    delayedOrders: 0,
    costOverruns: 0,
    executionTime: Date.now() - startTime,
  }

  return {
    planId: `PLAN-${Date.now()}`,
    timestamp: new Date().toISOString(),
    algorithm: algorithm as any,
    rakes,
    totalCost,
    totalUtilization: avgUtilization,
    slaCompliance,
    feasibility: Math.min(100, (rakes.length / input.orders.length) * 100),
    metrics,
    constraints: [],
  }
}
