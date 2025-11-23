/**
 * Delay Prediction API
 * Handles all API calls for delay prediction functionality
 */

import client from './client'

/**
 * Predict delays for given parameters
 */
export const predictDelay = (data) => {
  return client.post('/predict/delay', data)
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
