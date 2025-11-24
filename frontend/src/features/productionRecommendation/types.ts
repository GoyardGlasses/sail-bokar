/**
 * Production Recommendation Engine Types
 * AI-powered production recommendations based on demand
 */

// ============================================================================
// DEMAND TYPES
// ============================================================================

export interface DemandForecast {
  id: string
  productId: string
  productName: string
  period: string
  forecastedDemand: number
  confidence: number
  trend: 'increasing' | 'decreasing' | 'stable'
  seasonalFactor: number
  historicalAccuracy: number
}

export interface OrderDemand {
  productId: string
  productName: string
  totalOrders: number
  totalQuantity: number
  averageOrderSize: number
  urgentOrders: number
  standardOrders: number
  delayedOrders: number
}

// ============================================================================
// PRODUCTION TYPES
// ============================================================================

export interface ProductionCapacity {
  id: string
  productId: string
  productName: string
  maxCapacity: number
  currentUtilization: number
  availableCapacity: number
  productionTime: number
  costPerUnit: number
  qualityRating: number
}

export interface ProductionSchedule {
  id: string
  productId: string
  startDate: string
  endDate: string
  plannedQuantity: number
  actualQuantity: number
  status: 'planned' | 'in_progress' | 'completed' | 'delayed'
  efficiency: number
  costVariance: number
}

// ============================================================================
// RECOMMENDATION TYPES
// ============================================================================

export interface ProductionRecommendation {
  id: string
  productId: string
  productName: string
  currentDemand: number
  recommendedProduction: number
  rationale: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  expectedROI: number
  riskLevel: 'low' | 'medium' | 'high'
  timeline: string
  resources: ResourceRequirement[]
  constraints: string[]
  alternatives: RecommendationAlternative[]
}

export interface ResourceRequirement {
  resource: string
  quantity: number
  unit: string
  availability: number
  cost: number
}

export interface RecommendationAlternative {
  id: string
  productionQuantity: number
  expectedCost: number
  expectedRevenue: number
  profitMargin: number
  riskLevel: string
  timeToMarket: string
}

// ============================================================================
// ANALYSIS TYPES
// ============================================================================

export interface DemandAnalysis {
  id: string
  period: string
  totalDemand: number
  averageDemand: number
  peakDemand: number
  demandVariability: number
  seasonalPattern: string
  trend: 'increasing' | 'decreasing' | 'stable'
  forecastAccuracy: number
}

export interface ProductionAnalysis {
  id: string
  period: string
  totalProduction: number
  averageProduction: number
  utilizationRate: number
  efficiency: number
  costPerUnit: number
  qualityScore: number
  bottlenecks: string[]
}

export interface SupplyDemandGap {
  productId: string
  productName: string
  demand: number
  supply: number
  gap: number
  gapPercentage: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  recommendation: string
}

// ============================================================================
// SCENARIO TYPES
// ============================================================================

export interface ProductionScenario {
  id: string
  name: string
  description: string
  products: ScenarioProduct[]
  totalCost: number
  expectedRevenue: number
  profitMargin: number
  riskScore: number
  feasibility: number
  timeline: string
}

export interface ScenarioProduct {
  productId: string
  productName: string
  plannedQuantity: number
  expectedCost: number
  expectedRevenue: number
  profitMargin: number
}

// ============================================================================
// STATE TYPES
// ============================================================================

export interface ProductionRecommendationState {
  demands: DemandForecast[]
  capacities: ProductionCapacity[]
  schedules: ProductionSchedule[]
  recommendations: ProductionRecommendation[]
  scenarios: ProductionScenario[]
  selectedRecommendation?: string
  isAnalyzing: boolean
  error: string | null
}
