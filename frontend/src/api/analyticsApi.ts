import axios from 'axios'

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

export interface Widget {
  id: string
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'gauge' | 'table' | 'card' | 'heatmap' | 'funnel'
  title: string
  metric: string
  size: 'small' | 'medium' | 'large'
  position: { x: number; y: number }
  data?: any[]
}

export interface Dashboard {
  id: string
  name: string
  description: string
  widgets: Widget[]
  createdAt: string
  updatedAt: string
  isShared: boolean
  owner: string
}

export interface AnalyticsData {
  timestamp: string
  value: number
  category?: string
  [key: string]: any
}

// Mock dashboards
const mockDashboards: Dashboard[] = [
  {
    id: '1',
    name: 'Executive Dashboard',
    description: 'High-level KPIs and metrics',
    widgets: [
      { id: 'w1', type: 'card', title: 'Total Shipments', metric: 'shipments', size: 'small', position: { x: 0, y: 0 } },
      { id: 'w2', type: 'card', title: 'Avg Delay', metric: 'avg_delay', size: 'small', position: { x: 1, y: 0 } },
      { id: 'w3', type: 'line', title: 'Delay Trend', metric: 'delay_trend', size: 'large', position: { x: 0, y: 1 } },
      { id: 'w4', type: 'pie', title: 'Risk Distribution', metric: 'risk_dist', size: 'medium', position: { x: 2, y: 1 } },
    ],
    createdAt: '2025-11-01',
    updatedAt: '2025-11-23',
    isShared: true,
    owner: 'admin@example.com',
  },
  {
    id: '2',
    name: 'Operations Dashboard',
    description: 'Real-time operations metrics',
    widgets: [
      { id: 'w5', type: 'gauge', title: 'System Health', metric: 'health', size: 'small', position: { x: 0, y: 0 } },
      { id: 'w6', type: 'bar', title: 'Route Performance', metric: 'route_perf', size: 'large', position: { x: 1, y: 0 } },
      { id: 'w7', type: 'table', title: 'Active Alerts', metric: 'alerts', size: 'large', position: { x: 0, y: 2 } },
    ],
    createdAt: '2025-11-02',
    updatedAt: '2025-11-23',
    isShared: false,
    owner: 'manager@example.com',
  },
]

// Mock analytics data
const generateMockData = (metric: string, points: number = 30): AnalyticsData[] => {
  const data: AnalyticsData[] = []
  const today = new Date()
  for (let i = points; i > 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      timestamp: date.toISOString().split('T')[0],
      value: Math.round(Math.random() * 100),
      category: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
    })
  }
  return data
}

export const getDashboards = async (): Promise<Dashboard[]> => {
  try {
    const response = await axios.get(`${API_URL}/analytics/dashboards`)
    return response.data
  } catch (error) {
    console.warn('Get dashboards error, using mock data:', error)
    return mockDashboards
  }
}

export const createDashboard = async (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard> => {
  try {
    const response = await axios.post(`${API_URL}/analytics/dashboards`, dashboard)
    return response.data
  } catch (error) {
    console.warn('Create dashboard error, using mock:', error)
    return {
      ...dashboard,
      id: `dash_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}

export const updateDashboard = async (id: string, dashboard: Partial<Dashboard>): Promise<Dashboard> => {
  try {
    const response = await axios.put(`${API_URL}/analytics/dashboards/${id}`, dashboard)
    return response.data
  } catch (error) {
    console.warn('Update dashboard error, using mock:', error)
    const existing = mockDashboards.find(d => d.id === id)
    return {
      ...existing,
      ...dashboard,
      updatedAt: new Date().toISOString(),
    } as Dashboard
  }
}

export const deleteDashboard = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/analytics/dashboards/${id}`)
  } catch (error) {
    console.warn('Delete dashboard error:', error)
  }
}

export const getAnalyticsData = async (metric: string, period: number = 30): Promise<AnalyticsData[]> => {
  try {
    const response = await axios.get(`${API_URL}/analytics/data`, { params: { metric, period } })
    return response.data
  } catch (error) {
    console.warn('Get analytics data error, using mock:', error)
    return generateMockData(metric, period)
  }
}

export const shareDashboard = async (id: string, emails: string[]): Promise<{ success: boolean }> => {
  try {
    const response = await axios.post(`${API_URL}/analytics/dashboards/${id}/share`, { emails })
    return response.data
  } catch (error) {
    console.warn('Share dashboard error:', error)
    return { success: true }
  }
}

export const exportDashboard = async (id: string, format: 'pdf' | 'png' | 'excel'): Promise<Blob> => {
  try {
    const response = await axios.get(`${API_URL}/analytics/dashboards/${id}/export`, {
      params: { format },
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    console.warn('Export dashboard error:', error)
    return new Blob(['Export not available'], { type: 'text/plain' })
  }
}

export const getWidgetLibrary = async () => {
  try {
    const response = await axios.get(`${API_URL}/analytics/widgets`)
    return response.data
  } catch (error) {
    console.warn('Get widget library error, using defaults:', error)
    return {
      widgets: [
        { type: 'line', name: 'Line Chart', icon: '📈', description: 'Time series data' },
        { type: 'bar', name: 'Bar Chart', icon: '📊', description: 'Categorical data' },
        { type: 'pie', name: 'Pie Chart', icon: '🥧', description: 'Distribution data' },
        { type: 'area', name: 'Area Chart', icon: '📉', description: 'Stacked area' },
        { type: 'scatter', name: 'Scatter Plot', icon: '•••', description: 'Correlation data' },
        { type: 'gauge', name: 'Gauge', icon: '🎯', description: 'Progress indicator' },
        { type: 'table', name: 'Table', icon: '📋', description: 'Tabular data' },
        { type: 'card', name: 'KPI Card', icon: '📌', description: 'Key metrics' },
        { type: 'heatmap', name: 'Heatmap', icon: '🔥', description: 'Intensity map' },
        { type: 'funnel', name: 'Funnel', icon: '⏳', description: 'Conversion flow' },
      ],
    }
  }
}
