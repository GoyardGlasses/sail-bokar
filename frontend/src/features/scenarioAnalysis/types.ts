/**
 * Advanced Scenario Analysis Types
 */

export interface Scenario {
  id: string
  name: string
  description: string
  parameters: ScenarioParameter[]
  results: ScenarioResult
  createdAt: string
  status: 'draft' | 'active' | 'archived'
}

export interface ScenarioParameter {
  name: string
  value: any
  type: 'number' | 'string' | 'boolean' | 'date'
}

export interface ScenarioResult {
  totalCost: number
  totalRevenue: number
  profitMargin: number
  rakeCount: number
  utilizationRate: number
  slaCompliance: number
  riskScore: number
  feasibility: number
}

export interface ScenarioComparison {
  scenario1: Scenario
  scenario2: Scenario
  costDifference: number
  revenueDifference: number
  profitDifference: number
  winner: string
}

export interface ScenarioAnalysisState {
  scenarios: Scenario[]
  comparisons: ScenarioComparison[]
  selectedScenario?: string
  isAnalyzing: boolean
  error: string | null
}
