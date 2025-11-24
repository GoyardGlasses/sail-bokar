/**
 * Forecast Feature Types
 * TypeScript interfaces and types for forecast feature
 */

export interface MLModel {
  id: number
  name: string
  algorithmName: string
  version: string
  status: 'active' | 'inactive' | 'loaded'
  accuracy: number
  type: 'regression' | 'classification' | 'optimization' | 'clustering'
}

export interface ForecastConfig {
  startDate: string
  endDate: string
  selectedModels: string[]
  confidence: number
  includeSeasonality: boolean
}

export interface ForecastResult {
  id: string
  modelId: number
  predictions: number[]
  confidence: number[]
  accuracy: number
  timestamp: string
  metadata: Record<string, any>
}

export interface ForecastState {
  data: ForecastResult | null
  isLoading: boolean
  error: string | null
}

export interface ForecastResponse {
  success: boolean
  data: ForecastResult
  message: string
}

export interface ForecastError {
  code: string
  message: string
  details?: Record<string, any>
}
