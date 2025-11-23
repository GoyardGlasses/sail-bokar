import axios from 'axios'

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

// ============ SUPPLIER MANAGEMENT ============
export interface Supplier {
  id: string
  name: string
  onTimeDelivery: number
  quality: number
  cost: number
  capacity: number
  riskScore: number
  status: 'Active' | 'On Watch' | 'Inactive'
}

export const getSuppliers = async (): Promise<Supplier[]> => {
  try {
    const response = await axios.get(`${API_URL}/business/suppliers`)
    return response.data
  } catch (error) {
    console.warn('Get suppliers error, using mock:', error)
    return [
      { id: '1', name: 'Supplier A', onTimeDelivery: 95, quality: 92, cost: 85, capacity: 1000, riskScore: 15, status: 'Active' },
      { id: '2', name: 'Supplier B', onTimeDelivery: 88, quality: 85, cost: 90, capacity: 800, riskScore: 35, status: 'On Watch' },
      { id: '3', name: 'Supplier C', onTimeDelivery: 92, quality: 88, cost: 88, capacity: 1200, riskScore: 20, status: 'Active' },
      { id: '4', name: 'Supplier D', onTimeDelivery: 85, quality: 80, cost: 95, capacity: 600, riskScore: 50, status: 'On Watch' },
      { id: '5', name: 'Supplier E', onTimeDelivery: 98, quality: 95, cost: 80, capacity: 1500, riskScore: 10, status: 'Active' },
    ]
  }
}

export const getSupplierPerformance = async (supplierId: string, period: number = 30) => {
  try {
    const response = await axios.get(`${API_URL}/business/suppliers/${supplierId}/performance`, { params: { period } })
    return response.data
  } catch (error) {
    const data = []
    const today = new Date()
    for (let i = period; i > 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      data.push({
        timestamp: date.toISOString().split('T')[0],
        onTime: Math.floor(Math.random() * 100),
        quality: Math.floor(Math.random() * 100),
        cost: Math.floor(Math.random() * 100),
      })
    }
    return data
  }
}

export const getSupplierContracts = async () => {
  try {
    const response = await axios.get(`${API_URL}/business/suppliers/contracts`)
    return response.data
  } catch (error) {
    return [
      { id: '1', supplier: 'Supplier A', value: 500000, startDate: '2025-01-01', endDate: '2026-01-01', status: 'Active' },
      { id: '2', supplier: 'Supplier B', value: 350000, startDate: '2025-03-01', endDate: '2026-03-01', status: 'Active' },
      { id: '3', supplier: 'Supplier C', value: 600000, startDate: '2025-02-01', endDate: '2026-02-01', status: 'Active' },
    ]
  }
}

// ============ RISK MANAGEMENT ============
export interface Risk {
  id: string
  title: string
  category: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  probability: number
  impact: number
  mitigation: string
  status: 'Open' | 'Mitigated' | 'Closed'
}

export const getRisks = async (): Promise<Risk[]> => {
  try {
    const response = await axios.get(`${API_URL}/business/risks`)
    return response.data
  } catch (error) {
    console.warn('Get risks error, using mock:', error)
    return [
      { id: '1', title: 'Supplier Capacity Shortage', category: 'Supply', severity: 'High', probability: 60, impact: 80, mitigation: 'Diversify suppliers', status: 'Open' },
      { id: '2', title: 'Weather Delays', category: 'External', severity: 'Medium', probability: 40, impact: 60, mitigation: 'Route alternatives', status: 'Open' },
      { id: '3', title: 'Equipment Failure', category: 'Operational', severity: 'High', probability: 30, impact: 90, mitigation: 'Preventive maintenance', status: 'Mitigated' },
      { id: '4', title: 'Quality Issues', category: 'Quality', severity: 'Medium', probability: 25, impact: 70, mitigation: 'Supplier audits', status: 'Mitigated' },
      { id: '5', title: 'Cost Inflation', category: 'Financial', severity: 'Medium', probability: 75, impact: 50, mitigation: 'Long-term contracts', status: 'Open' },
    ]
  }
}

export const getRiskMatrix = async () => {
  try {
    const response = await axios.get(`${API_URL}/business/risks/matrix`)
    return response.data
  } catch (error) {
    return {
      critical: 2,
      high: 5,
      medium: 8,
      low: 3,
    }
  }
}

// ============ SUSTAINABILITY ============
export interface EmissionsData {
  timestamp: string
  route: string
  emissions: number
  fuel: number
  distance: number
}

export const getEmissionsData = async (period: number = 30): Promise<EmissionsData[]> => {
  try {
    const response = await axios.get(`${API_URL}/business/sustainability/emissions`, { params: { period } })
    return response.data
  } catch (error) {
    console.warn('Get emissions data error, using mock:', error)
    const routes = ['Bokaro-Kolkata', 'Bokaro-Dhanbad', 'Bokaro-Patna', 'Bokaro-Hatia']
    const data: EmissionsData[] = []
    const today = new Date()
    for (let i = period; i > 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      routes.forEach(route => {
        data.push({
          timestamp: date.toISOString().split('T')[0],
          route,
          emissions: Math.round(Math.random() * 500),
          fuel: Math.round(Math.random() * 100),
          distance: Math.round(Math.random() * 500) + 100,
        })
      })
    }
    return data
  }
}

export const getSustainabilityMetrics = async () => {
  try {
    const response = await axios.get(`${API_URL}/business/sustainability/metrics`)
    return response.data
  } catch (error) {
    return {
      carbonFootprint: 2450,
      fuelEfficiency: 8.5,
      greenSuppliers: 3,
      wasteReduction: 15,
      waterUsage: 450,
    }
  }
}

export const getESGReport = async () => {
  try {
    const response = await axios.get(`${API_URL}/business/sustainability/esg`)
    return response.data
  } catch (error) {
    return {
      environmental: 72,
      social: 68,
      governance: 75,
      overall: 72,
    }
  }
}

export const getGreenSuppliers = async () => {
  try {
    const response = await axios.get(`${API_URL}/business/sustainability/green-suppliers`)
    return response.data
  } catch (error) {
    return [
      { id: '1', name: 'Supplier A', certification: 'ISO 14001', emissions: 'Low', score: 95 },
      { id: '2', name: 'Supplier C', certification: 'ISO 14001', emissions: 'Low', score: 92 },
      { id: '3', name: 'Supplier E', certification: 'ISO 14001', emissions: 'Very Low', score: 98 },
    ]
  }
}
