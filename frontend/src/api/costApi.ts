import axios from 'axios'

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

export interface CostPredictionRequest {
  start_date: string
  end_date: string
  material: string
  max_cost?: number
}

export interface CostDriver {
  name: string
  impact: number
}

export interface CostPredictionResponse {
  avg_cost_per_ton: number
  total_cost: number
  drivers?: CostDriver[]
  by_destination?: Array<{
    destination: string
    cost_per_ton: number
    volume: number
  }>
}

// Mock data generator
const generateMockCostData = (request: CostPredictionRequest): CostPredictionResponse => {
  const destinations = ['Kolkata', 'Dhanbad', 'Patna', 'Hatia', 'Ranchi']
  const baseAvgCost = Math.random() * 200 + 800 // 800-1000
  const totalVolume = Math.random() * 2000000 + 1000000 // 1M-3M tonnes

  return {
    avg_cost_per_ton: Math.round(baseAvgCost),
    total_cost: Math.round(baseAvgCost * totalVolume),
    drivers: [
      { name: 'Distance', impact: Math.round(baseAvgCost * 0.35) },
      { name: 'Demurrage', impact: Math.round(baseAvgCost * 0.25) },
      { name: 'Handling', impact: Math.round(baseAvgCost * 0.20) },
      { name: 'Fuel Surcharge', impact: Math.round(baseAvgCost * 0.15) },
      { name: 'Other', impact: Math.round(baseAvgCost * 0.05) },
    ],
    by_destination: destinations.map(dest => ({
      destination: dest,
      cost_per_ton: Math.round(baseAvgCost * (0.8 + Math.random() * 0.4)),
      volume: Math.round(totalVolume / destinations.length),
    })),
  }
}

export const predictCost = async (request: CostPredictionRequest): Promise<CostPredictionResponse> => {
  try {
    const response = await axios.post(`${API_URL}/api/predict/cost`, request)
    return response.data
  } catch (error) {
    console.warn('Cost prediction error, using mock data:', error)
    return generateMockCostData(request)
  }
}

export const exportCostData = async (data: CostPredictionResponse, filename: string = 'cost_prediction.csv'): Promise<void> => {
  try {
    // Create CSV content
    let csvContent = 'Cost Prediction Report\n\n'
    csvContent += `Average Cost Per Ton,${data.avg_cost_per_ton}\n`
    csvContent += `Total Cost,${data.total_cost}\n\n`

    if (data.drivers && data.drivers.length > 0) {
      csvContent += 'Cost Drivers\n'
      csvContent += 'Driver,Impact\n'
      data.drivers.forEach(driver => {
        csvContent += `${driver.name},${driver.impact}\n`
      })
      csvContent += '\n'
    }

    if (data.by_destination && data.by_destination.length > 0) {
      csvContent += 'Cost by Destination\n'
      csvContent += 'Destination,Cost Per Ton,Volume\n'
      data.by_destination.forEach(dest => {
        csvContent += `${dest.destination},${dest.cost_per_ton},${dest.volume}\n`
      })
    }

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Export failed:', error)
    throw error
  }
}

export const getMaterials = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/materials`)
    return response.data
  } catch (error) {
    return ['Steel Plates', 'Coils', 'Sheets', 'Bars', 'Tubes', 'Rods']
  }
}

export const getDestinations = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${API_URL}/api/destinations`)
    return response.data
  } catch (error) {
    return ['Kolkata', 'Dhanbad', 'Patna', 'Hatia', 'Ranchi', 'Jamshedpur']
  }
}
