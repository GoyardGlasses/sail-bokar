/**
 * Delay Prediction API
 * Handles all API calls for delay prediction functionality
 */

import client from './client'

export interface DelayPredictionRequest {
  start_date: string
  end_date: string
  material: string
  destination: string
  priority: number
}

export interface DelayRoute {
  route: string
  predicted_delay_hours: number
  probability: number
  action: string
}

export interface DelaySummary {
  overall_delay_prob: number
  top_risk: string[]
}

export interface DelayPredictionResponse {
  confidence: number
  summary: DelaySummary
  routes: DelayRoute[]
}

/**
 * Predict delays for given parameters
 */
export const predictDelay = (data: DelayPredictionRequest): Promise<DelayPredictionResponse> => {
  return client.post('/predict/delay', data)
}

/**
 * Get available destinations from backend
 */
export const getDestinations = async (): Promise<string[]> => {
  try {
    const response = await client.get('/meta/config')
    return response.data?.destinations || getDefaultDestinations()
  } catch (error) {
    console.warn('Failed to fetch destinations, using defaults:', error)
    return getDefaultDestinations()
  }
}

/**
 * Get available materials from backend
 */
export const getMaterials = async (): Promise<string[]> => {
  try {
    const response = await client.get('/meta/config')
    return response.data?.materials || getDefaultMaterials()
  } catch (error) {
    console.warn('Failed to fetch materials, using defaults:', error)
    return getDefaultMaterials()
  }
}

/**
 * Default destinations (Bokaro steel plant context)
 */
export const getDefaultDestinations = (): string[] => [
  'Kolkata',
  'Patna',
  'Ranchi',
  'Durgapur',
  'Haldia',
  'Dhanbad',
  'Hatia',
  'Bokaro',
]

/**
 * Default materials
 */
export const getDefaultMaterials = (): string[] => [
  'All',
  'HR_Coils',
  'CR_Coils',
  'Plates',
  'Wire_Rods',
  'TMT_Bars',
  'Pig_Iron',
  'Billets',
]
