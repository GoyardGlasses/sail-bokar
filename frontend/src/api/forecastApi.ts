import axios from 'axios'

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

export interface ForecastRequest {
  training_days: number
  horizon_days: number
  variables: string[]
  material?: string
  destination?: string
}

export interface ForecastPrediction {
  date: string
  demand?: number
  throughput?: number
  rake_availability?: number
  congestion?: number
  upper?: number
  lower?: number
}

export interface ForecastResponse {
  predictions: ForecastPrediction[]
  model_confidence: number
  historical_data?: ForecastPrediction[]
  summary?: {
    predicted_tonnes?: number
    predicted_rakes?: number
    predicted_cost?: number
  }
}

// Mock data for testing
const generateMockForecast = (horizonDays: number): ForecastResponse => {
  const predictions: ForecastPrediction[] = []
  const today = new Date()

  for (let i = 0; i < horizonDays; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    const baseDemand = 7200 + Math.random() * 2000
    const variance = baseDemand * 0.125

    predictions.push({
      date: dateStr,
      demand: Math.round(baseDemand),
      upper: Math.round(baseDemand + variance),
      lower: Math.round(baseDemand - variance),
      rake_availability: Math.round(45 + Math.random() * 15),
      throughput: Math.round(8500 + Math.random() * 1500),
      congestion: Math.round(Math.random() * 100),
    })
  }

  const avgDemand = Math.round(predictions.reduce((sum, p) => sum + (p.demand || 0), 0) / predictions.length)

  return {
    predictions,
    model_confidence: 0.75 + Math.random() * 0.15,
    summary: {
      predicted_tonnes: avgDemand * horizonDays,
      predicted_rakes: Math.round((avgDemand / 160) * horizonDays),
      predicted_cost: Math.round((avgDemand * 45) / 1000) * horizonDays,
    },
  }
}

// Generate historical data
const generateHistoricalData = (trainingDays: number): ForecastPrediction[] => {
  const historical: ForecastPrediction[] = []
  const today = new Date()

  for (let i = trainingDays; i > 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const baseDemand = 7000 + Math.random() * 2500
    historical.push({
      date: dateStr,
      demand: Math.round(baseDemand),
      rake_availability: Math.round(40 + Math.random() * 20),
      throughput: Math.round(8000 + Math.random() * 2000),
      congestion: Math.round(Math.random() * 100),
    })
  }

  return historical
}

export const predictForecast = async (request: ForecastRequest): Promise<ForecastResponse> => {
  try {
    const response = await axios.post(`${API_URL}/predict/forecast`, request)
    return response.data
  } catch (error) {
    console.warn('Forecast API error, using mock data:', error)
    // Return mock data for testing
    const mockResponse = generateMockForecast(request.horizon_days)
    mockResponse.historical_data = generateHistoricalData(request.training_days)
    return mockResponse
  }
}

export const getForecastMetadata = async () => {
  try {
    const response = await axios.get(`${API_URL}/meta/forecast`)
    return response.data
  } catch (error) {
    console.warn('Metadata API error:', error)
    return {
      variables: ['demand', 'throughput', 'rake_availability', 'congestion'],
      materials: ['plates', 'coils', 'sheets', 'bars'],
      destinations: ['all', 'kolkata', 'hatia', 'dhanbad', 'patna', 'ranchi'],
    }
  }
}
