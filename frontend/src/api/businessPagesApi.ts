import axios from 'axios'

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

// ============ COST PREDICTION ============
export interface CostData {
  timestamp: string
  category: string
  cost: number
  budget: number
}

export const getCostData = async (period: number = 30): Promise<CostData[]> => {
  try {
    const response = await axios.get(`${API_URL}/business/cost`, { params: { period } })
    return response.data
  } catch (error) {
    console.warn('Get cost data error, using mock:', error)
    const data: CostData[] = []
    const categories = ['Fuel', 'Labor', 'Maintenance', 'Equipment', 'Overhead']
    const today = new Date()
    for (let i = period; i > 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      categories.forEach(cat => {
        data.push({
          timestamp: date.toISOString().split('T')[0],
          category: cat,
          cost: Math.round(Math.random() * 5000),
          budget: Math.round(Math.random() * 6000),
        })
      })
    }
    return data
  }
}

export const getCostOptimizations = async () => {
  try {
    const response = await axios.get(`${API_URL}/business/cost/optimizations`)
    return response.data
  } catch (error) {
    return [
      { id: '1', title: 'Reduce fuel consumption', savings: 15000, effort: 'Medium' },
      { id: '2', title: 'Optimize labor scheduling', savings: 12000, effort: 'High' },
      { id: '3', title: 'Preventive maintenance', savings: 8000, effort: 'Low' },
      { id: '4', title: 'Supplier consolidation', savings: 20000, effort: 'High' },
      { id: '5', title: 'Route optimization', savings: 18000, effort: 'Medium' },
    ]
  }
}

// ============ THROUGHPUT PREDICTION ============
export interface ThroughputData {
  timestamp: string
  capacity: number
  utilization: number
  bottleneck?: string
}

export const getThroughputData = async (period: number = 30): Promise<ThroughputData[]> => {
  try {
    const response = await axios.get(`${API_URL}/business/throughput`, { params: { period } })
    return response.data
  } catch (error) {
    console.warn('Get throughput data error, using mock:', error)
    const data: ThroughputData[] = []
    const today = new Date()
    const bottlenecks = ['None', 'Loading', 'Unloading', 'Inspection', 'Documentation']
    for (let i = period; i > 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      data.push({
        timestamp: date.toISOString().split('T')[0],
        capacity: 1000,
        utilization: Math.round(Math.random() * 100),
        bottleneck: bottlenecks[Math.floor(Math.random() * bottlenecks.length)],
      })
    }
    return data
  }
}

export const getEquipmentStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/business/throughput/equipment`)
    return response.data
  } catch (error) {
    return [
      { id: '1', name: 'Loader A', efficiency: 95, status: 'Operational' },
      { id: '2', name: 'Loader B', efficiency: 78, status: 'Operational' },
      { id: '3', name: 'Conveyor 1', efficiency: 88, status: 'Operational' },
      { id: '4', name: 'Conveyor 2', efficiency: 65, status: 'Maintenance' },
      { id: '5', name: 'Sorter', efficiency: 92, status: 'Operational' },
    ]
  }
}

// ============ INVENTORY MANAGEMENT ============
export interface InventoryItem {
  id: string
  sku: string
  name: string
  quantity: number
  reorderPoint: number
  safetyStock: number
  category: 'A' | 'B' | 'C'
  value: number
  daysOfStock: number
}

export const getInventoryData = async (): Promise<InventoryItem[]> => {
  try {
    const response = await axios.get(`${API_URL}/business/inventory`)
    return response.data
  } catch (error) {
    console.warn('Get inventory data error, using mock:', error)
    const categories = ['Plates', 'Coils', 'Sheets', 'Bars', 'Tubes']
    const items: InventoryItem[] = []
    for (let i = 0; i < 20; i++) {
      const quantity = Math.floor(Math.random() * 1000)
      const reorderPoint = Math.floor(Math.random() * 200) + 100
      items.push({
        id: `item_${i}`,
        sku: `SKU${String(i + 1).padStart(4, '0')}`,
        name: `${categories[i % categories.length]} - Type ${i + 1}`,
        quantity,
        reorderPoint,
        safetyStock: Math.floor(reorderPoint * 0.5),
        category: i < 5 ? 'A' : i < 15 ? 'B' : 'C',
        value: Math.round(Math.random() * 50000),
        daysOfStock: Math.floor(Math.random() * 60) + 5,
      })
    }
    return items
  }
}

export const getABCAnalysis = async () => {
  try {
    const response = await axios.get(`${API_URL}/business/inventory/abc`)
    return response.data
  } catch (error) {
    return {
      A: { count: 5, value: 250000, percentage: 80 },
      B: { count: 10, value: 50000, percentage: 15 },
      C: { count: 5, value: 12500, percentage: 5 },
    }
  }
}

export const getReorderRecommendations = async () => {
  try {
    const response = await axios.get(`${API_URL}/business/inventory/reorder`)
    return response.data
  } catch (error) {
    return [
      { sku: 'SKU0001', name: 'Plates - Type 1', quantity: 50, reorderPoint: 150, status: 'URGENT' },
      { sku: 'SKU0005', name: 'Bars - Type 5', quantity: 120, reorderPoint: 200, status: 'SOON' },
      { sku: 'SKU0010', name: 'Sheets - Type 10', quantity: 180, reorderPoint: 250, status: 'MONITOR' },
    ]
  }
}

export const getInventoryTrends = async (period: number = 30) => {
  try {
    const response = await axios.get(`${API_URL}/business/inventory/trends`, { params: { period } })
    return response.data
  } catch (error) {
    const data = []
    const today = new Date()
    for (let i = period; i > 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      data.push({
        timestamp: date.toISOString().split('T')[0],
        totalValue: Math.round(Math.random() * 500000) + 200000,
        turnover: Math.round(Math.random() * 100),
      })
    }
    return data
  }
}
