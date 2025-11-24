/**
 * Rake Formation Engine Types
 * Complete type definitions for rake formation optimization
 */

// ============================================================================
// RAKE FORMATION TYPES
// ============================================================================

export interface RakeFormationInput {
  orders: FormationOrder[]
  availableRakes: FormationRake[]
  stockyards: FormationStockyard[]
  loadingPoints: FormationLoadingPoint[]
  constraints: FormationConstraints
  objectives: FormationObjectives
}

export interface FormationOrder {
  orderId: string
  materialId: string
  materialName: string
  quantity: number
  destination: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  requiredDate: string
  slaHours: number
  cost: number
}

export interface FormationRake {
  rakeId: string
  capacity: number
  currentLoad: number
  location: string
  availableDate: string
  costPerKm: number
}

export interface FormationStockyard {
  stockyardId: string
  name: string
  location: string
  materials: {
    materialId: string
    quantity: number
    quality: string
    age: number
  }[]
  loadingPoints: number
  capacity: number
}

export interface FormationLoadingPoint {
  pointId: string
  stockyardId: string
  capacity: number // tonnes/day
  operationalHours: { start: string; end: string }
  equipment: string[]
}

export interface FormationConstraints {
  minRakeSize: number // tonnes
  maxRakeSize: number // tonnes
  maxLoadingPointCapacity: number // tonnes/day
  maxSidingCapacity: number // rakes
  routeRestrictions: string[]
  timeWindows: { start: string; end: string }
}

export interface FormationObjectives {
  minimizeCost: number // weight 0-1
  maximizeUtilization: number // weight 0-1
  minimizeDelay: number // weight 0-1
  meetSLA: number // weight 0-1
}

// ============================================================================
// RAKE FORMATION PLAN TYPES
// ============================================================================

export interface RakeFormationPlan {
  planId: string
  timestamp: string
  algorithm: 'greedy' | 'genetic' | 'simulated_annealing' | 'constraint_solver'
  rakes: PlannedRake[]
  totalCost: number
  totalUtilization: number
  slaCompliance: number
  feasibility: number // 0-100
  metrics: FormationMetrics
  constraints: ConstraintViolation[]
}

export interface PlannedRake {
  rakeId: string
  composition: RakeComposition[]
  totalLoad: number
  utilization: number // percentage
  sourceStockyard: string
  destination: string
  loadingPoint: string
  estimatedLoadingTime: number // hours
  estimatedDispatchTime: string
  estimatedDeliveryTime: string
  cost: number
  costBreakdown: {
    loading: number
    transport: number
    demurrage: number
    penalty: number
  }
  priority: number
  slaCompliance: boolean
}

export interface RakeComposition {
  orderId: string
  materialId: string
  materialName: string
  quantity: number
  destination: string
  priority: string
}

export interface FormationMetrics {
  totalOrders: number
  allocatedOrders: number
  totalQuantity: number
  totalRakes: number
  averageUtilization: number
  averageCost: number
  totalCost: number
  slaCompliance: number // percentage
  delayedOrders: number
  costOverruns: number
  executionTime: number // milliseconds
}

export interface ConstraintViolation {
  type: string
  severity: 'critical' | 'warning' | 'info'
  message: string
  affectedRakes: string[]
  resolution?: string
}

// ============================================================================
// ALGORITHM TYPES
// ============================================================================

export interface AlgorithmConfig {
  type: 'greedy' | 'genetic' | 'simulated_annealing' | 'constraint_solver'
  maxIterations: number
  populationSize?: number // for genetic
  temperature?: number // for simulated annealing
  coolingRate?: number // for simulated annealing
  timeLimit: number // seconds
}

export interface AlgorithmResult {
  plan: RakeFormationPlan
  quality: number // 0-100
  executionTime: number
  iterations: number
  converged: boolean
}

// ============================================================================
// OPTIMIZATION SCENARIO TYPES
// ============================================================================

export interface OptimizationScenario {
  name: string
  description: string
  input: RakeFormationInput
  expectedOutput: {
    minRakes: number
    maxRakes: number
    expectedCost: number
    expectedUtilization: number
  }
  testCases: {
    name: string
    input: RakeFormationInput
    expectedPlan: Partial<RakeFormationPlan>
  }[]
}

// ============================================================================
// RAKE FORMATION STATE TYPES
// ============================================================================

export interface RakeFormationState {
  currentPlan: RakeFormationPlan | null
  previousPlans: RakeFormationPlan[]
  isOptimizing: boolean
  optimizationProgress: number // 0-100
  error: string | null
  selectedAlgorithm: 'greedy' | 'genetic' | 'simulated_annealing' | 'constraint_solver'
  algorithmConfig: AlgorithmConfig
}

// ============================================================================
// COMPARISON TYPES
// ============================================================================

export interface PlanComparison {
  plan1: RakeFormationPlan
  plan2: RakeFormationPlan
  costDifference: number
  utilizationDifference: number
  slaDifference: number
  rakeCountDifference: number
  winner: 'plan1' | 'plan2' | 'tie'
  analysis: string
}
