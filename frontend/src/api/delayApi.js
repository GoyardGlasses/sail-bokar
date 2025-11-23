/**
 * Delay Prediction API
 * Handles all API calls for delay prediction functionality
 */

import client from './client'

/**
 * Predict delays for given parameters
 * Uses mock data for testing when backend doesn't have data
 */
export const predictDelay = async (data) => {
  // Mock data for testing
  const mockResponse = {
    confidence: 0.81,
    summary: {
      overall_delay_prob: 0.12,
      top_risk: ['Bokaro->Dhanbad', 'Bokaro->Hatia'],
    },
    routes: [
      {
        route: 'Bokaro->Dhanbad',
        predicted_delay_hours: 12,
        probability: 0.21,
        action: 're-route',
      },
      {
        route: 'Bokaro->Hatia',
        predicted_delay_hours: 8,
        probability: 0.15,
        action: 'monitor',
      },
      {
        route: 'Bokaro->Kolkata',
        predicted_delay_hours: 5,
        probability: 0.08,
        action: 'proceed',
      },
      {
        route: 'Bokaro->Patna',
        predicted_delay_hours: 3,
        probability: 0.05,
        action: 'proceed',
      },
      {
        route: 'Bokaro->Ranchi',
        predicted_delay_hours: 6,
        probability: 0.10,
        action: 'monitor',
      },
    ],
  }

  try {
    // Try to call the real API first
    const response = await client.post('/predict/delay', data)
    console.log('API response:', response)
    // If response is valid, return it
    if (response && response.routes && response.routes.length > 0) {
      return response
    }
    // Otherwise use mock data
    console.warn('API returned empty response, using mock data')
    return mockResponse
  } catch (error) {
    console.warn('API call failed, using mock data:', error.message)
    // If API fails, return mock data
    return mockResponse
  }
}

/**
 * Get available destinations from backend
 */
export const getDestinations = async () => {
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
export const getMaterials = async () => {
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
export const getDefaultDestinations = () => [
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
export const getDefaultMaterials = () => [
  'All',
  'HR_Coils',
  'CR_Coils',
  'Plates',
  'Wire_Rods',
  'TMT_Bars',
  'Pig_Iron',
  'Billets',
]
