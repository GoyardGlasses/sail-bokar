/**
 * Delay Prediction API
 * Handles all API calls for delay prediction functionality
 */

import client from './client'

/**
 * Predict delays for given parameters
 * Uses mock data for testing
 */
export const predictDelay = async (data) => {
  console.log('Predicting delays for:', data)
  
  // Mock data for testing - based on the input route
  const mockResponse = {
    confidence: 0.81,
    summary: {
      overall_delay_prob: 0.12,
      top_risk: ['Bokaro->Dhanbad', 'Bokaro->Hatia'],
    },
    routes: [
      {
        route: data.route || 'Bokaro->Dhanbad',
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

  // Return mock data immediately (for testing without backend)
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Returning mock delay prediction response')
      resolve(mockResponse)
    }, 500)
  })
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
