import axios from 'axios'

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

// ============ QUALITY CONTROL ============
export interface DefectData {
  id: string
  type: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  count: number
  timestamp: string
  rootCause?: string
}

export const getDefectData = async (period: number = 30): Promise<DefectData[]> => {
  try {
    const response = await axios.get(`${API_URL}/business/quality/defects`, { params: { period } })
    return response.data
  } catch (error) {
    console.warn('Get defect data error, using mock:', error)
    const defectTypes = ['Surface Defect', 'Dimension Error', 'Material Flaw', 'Packaging Damage', 'Color Variation']
    const data: DefectData[] = []
    const today = new Date()
    for (let i = period; i > 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      defectTypes.forEach((type, idx) => {
        const severities: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low']
        data.push({
          id: `defect_${i}_${idx}`,
          type,
          severity: severities[idx % 4],
          count: Math.floor(Math.random() * 50),
          timestamp: date.toISOString().split('T')[0],
        })
      })
    }
    return data
  }
}

export const getQualityMetrics = async () => {
  try {
    const response = await axios.get(`${API_URL}/business/quality/metrics`)
    return response.data
  } catch (error) {
    return {
      aql: 2.5,
      ltpd: 6.5,
      acceptance: 98.5,
      rejection: 1.5,
      trend: 'improving',
    }
  }
}

export const getSupplierQuality = async () => {
  try {
    const response = await axios.get(`${API_URL}/business/quality/suppliers`)
    return response.data
  } catch (error) {
    return [
      { supplier: 'Supplier A', quality: 95, defects: 12, trend: 'up' },
      { supplier: 'Supplier B', quality: 88, defects: 28, trend: 'down' },
      { supplier: 'Supplier C', quality: 92, defects: 18, trend: 'stable' },
      { supplier: 'Supplier D', quality: 85, defects: 35, trend: 'down' },
      { supplier: 'Supplier E', quality: 97, defects: 8, trend: 'up' },
    ]
  }
}

// ============ SUPPLY CHAIN VISIBILITY ============
export interface Shipment {
  id: string
  origin: string
  destination: string
  status: 'In Transit' | 'Delivered' | 'Delayed' | 'At Risk'
  progress: number
  eta: string
  delay?: number
  riskScore: number
}

export const getShipments = async (): Promise<Shipment[]> => {
  try {
    const response = await axios.get(`${API_URL}/business/supply-chain/shipments`)
    return response.data
  } catch (error) {
    console.warn('Get shipments error, using mock:', error)
    const origins = ['Bokaro', 'Rourkela', 'Durgapur']
    const destinations = ['Kolkata', 'Dhanbad', 'Patna', 'Hatia']
    const statuses: Array<'In Transit' | 'Delivered' | 'Delayed' | 'At Risk'> = ['In Transit', 'Delivered', 'Delayed', 'At Risk']
    
    const shipments: Shipment[] = []
    for (let i = 0; i < 20; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      shipments.push({
        id: `SHIP${String(i + 1).padStart(4, '0')}`,
        origin: origins[Math.floor(Math.random() * origins.length)],
        destination: destinations[Math.floor(Math.random() * destinations.length)],
        status,
        progress: Math.floor(Math.random() * 100),
        eta: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        delay: status === 'Delayed' ? Math.floor(Math.random() * 24) : undefined,
        riskScore: Math.floor(Math.random() * 100),
      })
    }
    return shipments
  }
}

export const getSupplyChainMetrics = async () => {
  try {
    const response = await axios.get(`${API_URL}/business/supply-chain/metrics`)
    return response.data
  } catch (error) {
    return {
      onTimeDelivery: 92.5,
      avgDelay: 2.3,
      activeShipments: 45,
      delayedShipments: 3,
      atRiskShipments: 5,
    }
  }
}

// ============ DEMAND PLANNING ============
export interface DemandForecast {
  period: string
  forecast: number
  actual?: number
  lower: number
  upper: number
}

export const getDemandForecast = async (months: number = 12): Promise<DemandForecast[]> => {
  try {
    const response = await axios.get(`${API_URL}/business/demand/forecast`, { params: { months } })
    return response.data
  } catch (error) {
    console.warn('Get demand forecast error, using mock:', error)
    const data: DemandForecast[] = []
    const today = new Date()
    for (let i = 0; i < months; i++) {
      const date = new Date(today)
      date.setMonth(date.getMonth() + i)
      const forecast = Math.floor(Math.random() * 5000) + 5000
      data.push({
        period: date.toISOString().split('T')[0],
        forecast,
        actual: i < 3 ? Math.floor(forecast * (0.9 + Math.random() * 0.2)) : undefined,
        lower: Math.floor(forecast * 0.8),
        upper: Math.floor(forecast * 1.2),
      })
    }
    return data
  }
}

export const getSeasonalFactors = async () => {
  try {
    const response = await axios.get(`${API_URL}/business/demand/seasonal`)
    return response.data
  } catch (error) {
    return [
      { month: 'Jan', factor: 0.85 },
      { month: 'Feb', factor: 0.88 },
      { month: 'Mar', factor: 0.95 },
      { month: 'Apr', factor: 1.05 },
      { month: 'May', factor: 1.12 },
      { month: 'Jun', factor: 1.15 },
      { month: 'Jul', factor: 1.10 },
      { month: 'Aug', factor: 1.08 },
      { month: 'Sep', factor: 0.98 },
      { month: 'Oct', factor: 0.92 },
      { month: 'Nov', factor: 0.88 },
      { month: 'Dec', factor: 0.82 },
    ]
  }
}

export const getDemandAccuracy = async () => {
  try {
    const response = await axios.get(`${API_URL}/business/demand/accuracy`)
    return response.data
  } catch (error) {
    return {
      mae: 245,
      rmse: 312,
      mape: 3.2,
      accuracy: 96.8,
      trend: 'improving',
    }
  }
}
