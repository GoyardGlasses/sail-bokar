/**
 * Cost Analysis Enhancement Types
 * Detailed cost breakdown and analysis
 */

// ============================================================================
// COST COMPONENT TYPES
// ============================================================================

export interface CostComponent {
  id: string
  name: string
  category: 'material' | 'labor' | 'transport' | 'overhead' | 'other'
  amount: number
  percentage: number
  description: string
  variability: 'fixed' | 'variable' | 'semi-variable'
}

export interface DetailedCostBreakdown {
  id: string
  orderId: string
  quantity: number
  unit: string
  components: CostComponent[]
  subtotal: number
  taxes: number
  discounts: number
  totalCost: number
  costPerUnit: number
  margin: number
  marginPercentage: number
  timestamp: string
}

// ============================================================================
// COST ANALYSIS TYPES
// ============================================================================

export interface CostAnalysis {
  id: string
  period: string
  startDate: string
  endDate: string
  totalOrders: number
  totalCost: number
  averageCostPerOrder: number
  costBreakdown: CostComponent[]
  trends: CostTrend[]
  anomalies: CostAnomaly[]
  recommendations: CostRecommendation[]
}

export interface CostTrend {
  date: string
  cost: number
  trend: 'up' | 'down' | 'stable'
  percentageChange: number
  reason: string
}

export interface CostAnomaly {
  id: string
  orderId: string
  date: string
  expectedCost: number
  actualCost: number
  variance: number
  variancePercentage: number
  severity: 'low' | 'medium' | 'high'
  reason: string
}

export interface CostRecommendation {
  id: string
  category: string
  currentCost: number
  potentialSavings: number
  savingsPercentage: number
  action: string
  priority: 'low' | 'medium' | 'high'
  estimatedImpact: string
}

// ============================================================================
// COST COMPARISON TYPES
// ============================================================================

export interface CostComparison {
  id: string
  scenario1Id: string
  scenario2Id: string
  scenario1Cost: number
  scenario2Cost: number
  difference: number
  percentageDifference: number
  winner: string
  breakdown: ComponentComparison[]
}

export interface ComponentComparison {
  component: string
  scenario1Amount: number
  scenario2Amount: number
  difference: number
  percentageDifference: number
}

// ============================================================================
// COST FORECAST TYPES
// ============================================================================

export interface CostForecast {
  id: string
  period: string
  forecastedCost: number
  confidence: number
  lowerBound: number
  upperBound: number
  factors: ForecastFactor[]
  assumptions: string[]
}

export interface ForecastFactor {
  name: string
  impact: number
  direction: 'positive' | 'negative'
  probability: number
}

// ============================================================================
// COST OPTIMIZATION TYPES
// ============================================================================

export interface CostOptimization {
  id: string
  orderId: string
  currentCost: number
  optimizedCost: number
  savings: number
  savingsPercentage: number
  optimizations: Optimization[]
  constraints: string[]
  feasibility: number
}

export interface Optimization {
  id: string
  name: string
  description: string
  currentValue: number
  optimizedValue: number
  savings: number
  implementation: string
  timeToImplement: string
  riskLevel: 'low' | 'medium' | 'high'
}

// ============================================================================
// COST ANALYTICS TYPES
// ============================================================================

export interface CostMetrics {
  totalCost: number
  averageCost: number
  minCost: number
  maxCost: number
  standardDeviation: number
  costVariance: number
  costTrend: 'increasing' | 'decreasing' | 'stable'
  costEfficiency: number
}

export interface CostByCategory {
  category: string
  amount: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
  comparison: number
}

export interface CostByProduct {
  productId: string
  productName: string
  quantity: number
  totalCost: number
  costPerUnit: number
  margin: number
  trend: 'up' | 'down' | 'stable'
}

// ============================================================================
// STATE TYPES
// ============================================================================

export interface CostAnalysisState {
  breakdowns: DetailedCostBreakdown[]
  analyses: CostAnalysis[]
  comparisons: CostComparison[]
  forecasts: CostForecast[]
  optimizations: CostOptimization[]
  selectedBreakdown?: string
  isAnalyzing: boolean
  error: string | null
}
