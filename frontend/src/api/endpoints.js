import client from './client'

/**
 * Health & Metadata Endpoints
 */
export const checkHealth = () => client.get('/meta/health')
export const getMetrics = () => client.get('/meta/metrics')
export const getConfig = () => client.get('/meta/config')
export const getModels = () => client.get('/meta/models')
export const reloadModels = () => client.post('/meta/reload-models')

/**
 * Forecasting Endpoints
 */
export const predictDemand = (data) => client.post('/predict/demand', data)
export const predictRakeAvailability = (data) => client.post('/predict/rake-availability', data)

/**
 * Prediction Endpoints
 */
export const predictDelay = (data) => client.post('/predict/delay', data)
export const predictThroughput = (data) => client.post('/predict/throughput', data)
export const predictCost = (data) => client.post('/predict/cost', data)
export const predictMode = (data) => client.post('/predict/mode', data)

/**
 * Optimization Endpoint
 */
export const optimizeDispatch = (data) => client.post('/optimize/dispatch', data)

/**
 * Batch prediction helper
 */
export const getAllPredictions = async (data) => {
  try {
    const [demand, delay, throughput, cost, mode] = await Promise.all([
      predictDemand(data),
      predictDelay(data),
      predictThroughput(data),
      predictCost(data),
      predictMode(data),
    ])
    return { demand, delay, throughput, cost, mode }
  } catch (error) {
    console.error('Batch prediction failed:', error)
    throw error
  }
}
