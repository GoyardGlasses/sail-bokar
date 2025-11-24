/**
 * Rail vs Road Optimization Types
 * Cost analysis and mode selection for logistics
 */

// ============================================================================
// TRANSPORT MODE TYPES
// ============================================================================

export type TransportMode = 'rail' | 'road' | 'hybrid'

export interface RailTransport {
  id: string
  name: string
  capacity: number // tonnes
  costPerKm: number
  costPerTonne: number
  fixedCost: number // per rake
  loadingTime: number // hours
  unloadingTime: number // hours
  transitTime: number // hours per 100km
  reliability: number // 0-100
  carbonEmissions: number // kg CO2 per tonne
  minQuantity: number // minimum load
  maxQuantity: number // maximum load
  available: boolean
}

export interface RoadTransport {
  id: string
  name: string
  capacity: number // tonnes
  costPerKm: number
  costPerTonne: number
  fixedCost: number // per truck
  loadingTime: number // hours
  unloadingTime: number // hours
  transitTime: number // hours per 100km
  reliability: number // 0-100
  carbonEmissions: number // kg CO2 per tonne
  minQuantity: number // minimum load
  maxQuantity: number // maximum load
  available: boolean
  tollCost: number // per trip
  fuelSurcharge: number // percentage
}

// ============================================================================
// ROUTE TYPES
// ============================================================================

export interface Route {
  id: string
  origin: string
  destination: string
  distance: number // km
  railAvailable: boolean
  roadAvailable: boolean
  railTime: number // hours
  roadTime: number // hours
  railCost: number // base cost
  roadCost: number // base cost
  trafficLevel: 'low' | 'medium' | 'high'
  seasonalFactors: SeasonalFactor[]
}

export interface SeasonalFactor {
  season: 'monsoon' | 'summer' | 'winter' | 'spring'
  railDiscount: number // percentage
  roadSurcharge: number // percentage
  reliability: number // 0-100
}

// ============================================================================
// COST ANALYSIS TYPES
// ============================================================================

export interface TransportCostAnalysis {
  quantity: number // tonnes
  distance: number // km
  railCost: RailCostBreakdown | null
  roadCost: RoadCostBreakdown | null
  hybridCost: HybridCostBreakdown | null
  recommendation: TransportMode
  savingsPercentage: number
  carbonComparison: CarbonComparison
}

export interface RailCostBreakdown {
  fixedCost: number
  variableCost: number
  loadingCost: number
  unloadingCost: number
  totalCost: number
  costPerTonne: number
  transitTime: number
  reliability: number
}

export interface RoadCostBreakdown {
  fixedCost: number
  variableCost: number
  tollCost: number
  fuelSurcharge: number
  loadingCost: number
  unloadingCost: number
  totalCost: number
  costPerTonne: number
  transitTime: number
  reliability: number
}

export interface HybridCostBreakdown {
  railPortion: number // percentage
  roadPortion: number // percentage
  railCost: number
  roadCost: number
  totalCost: number
  costPerTonne: number
  transitTime: number
  reliability: number
}

export interface CarbonComparison {
  railEmissions: number // kg CO2
  roadEmissions: number // kg CO2
  hybridEmissions: number // kg CO2
  lowestEmission: TransportMode
  savingsPercentage: number
}

// ============================================================================
// OPTIMIZATION TYPES
// ============================================================================

export interface ModeOptimizationRequest {
  quantity: number
  origin: string
  destination: string
  requiredDate: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  constraints: OptimizationConstraints
  objectives: OptimizationObjectives
}

export interface OptimizationConstraints {
  maxCost?: number
  maxTransitTime?: number
  minReliability?: number
  maxCarbonEmissions?: number
  mustUseRail?: boolean
  mustUseRoad?: boolean
  preferredMode?: TransportMode
}

export interface OptimizationObjectives {
  minimizeCost: number // 0-1
  minimizeTime: number // 0-1
  maximizeReliability: number // 0-1
  minimizeEmissions: number // 0-1
}

export interface OptimizationResult {
  recommendedMode: TransportMode
  estimatedCost: number
  estimatedTime: number
  reliability: number
  emissions: number
  reasoning: string
  alternatives: ModeAlternative[]
  score: number // 0-100
}

export interface ModeAlternative {
  mode: TransportMode
  cost: number
  time: number
  reliability: number
  emissions: number
  score: number
  pros: string[]
  cons: string[]
}

// ============================================================================
// SCENARIO TYPES
// ============================================================================

export interface TransportScenario {
  id: string
  name: string
  description: string
  quantity: number
  origin: string
  destination: string
  distance: number
  railOption: RailTransport
  roadOption: RoadTransport
  selectedMode: TransportMode
  analysis: TransportCostAnalysis
  savings: number
  createdAt: string
}

export interface ScenarioComparison {
  scenario1: TransportScenario
  scenario2: TransportScenario
  costDifference: number
  timeDifference: number
  emissionsDifference: number
  winner: string
}

// ============================================================================
// STATE TYPES
// ============================================================================

export interface RailRoadOptimizationState {
  railOptions: RailTransport[]
  roadOptions: RoadTransport[]
  routes: Route[]
  scenarios: TransportScenario[]
  selectedScenario?: string
  isAnalyzing: boolean
  error: string | null
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface ModeAnalytics {
  totalShipments: number
  railShipments: number
  roadShipments: number
  hybridShipments: number
  railPercentage: number
  roadPercentage: number
  hybridPercentage: number
  totalCost: number
  totalEmissions: number
  averageCost: number
  averageTime: number
  averageReliability: number
}

export interface CostTrendAnalysis {
  period: string
  railCost: number
  roadCost: number
  hybridCost: number
  railTrend: 'up' | 'down' | 'stable'
  roadTrend: 'up' | 'down' | 'stable'
  recommendation: TransportMode
}

export interface RouteAnalytics {
  routeId: string
  origin: string
  destination: string
  distance: number
  railUtilization: number // percentage
  roadUtilization: number // percentage
  bestMode: TransportMode
  costSavings: number
  emissionsSavings: number
}
