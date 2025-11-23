import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000'

export interface Location {
  id: string
  lat: number
  lon: number
  type: 'loading' | 'unloading' | 'yard' | 'port'
  name?: string
}

export interface Route {
  from: string
  to: string
  status: 'on-time' | 'delayed' | 'completed'
  rake_id: string
  distance?: number
  duration?: number
}

export interface RouteData {
  locations: Location[]
  routes: Route[]
}

export interface AssistantSuggestion {
  orderId: string
  suggestion: string
  recommendations: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

// Mock data
const mockRouteData: RouteData = {
  locations: [
    { id: 'LP1_Bokaro', lat: 23.66, lon: 86.14, type: 'loading', name: 'Bokaro Loading Point' },
    { id: 'LP2_Durgapur', lat: 23.8, lon: 87.31, type: 'loading', name: 'Durgapur Loading Point' },
    { id: 'Haldia_Port_User', lat: 22.17, lon: 88.08, type: 'port', name: 'Haldia Port' },
    { id: 'Kolkata_Yard', lat: 22.57, lon: 88.36, type: 'yard', name: 'Kolkata Yard' },
    { id: 'Patna_Yard', lat: 25.59, lon: 85.14, type: 'yard', name: 'Patna Yard' },
    { id: 'Ranchi_Yard', lat: 23.34, lon: 85.33, type: 'yard', name: 'Ranchi Yard' },
  ],
  routes: [
    { from: 'LP1_Bokaro', to: 'Haldia_Port_User', status: 'on-time', rake_id: 'SAIL-R001', distance: 280, duration: 12 },
    { from: 'LP2_Durgapur', to: 'Kolkata_Yard', status: 'on-time', rake_id: 'SAIL-R002', distance: 150, duration: 6 },
    { from: 'LP1_Bokaro', to: 'Patna_Yard', status: 'delayed', rake_id: 'SAIL-R003', distance: 320, duration: 14 },
    { from: 'LP2_Durgapur', to: 'Ranchi_Yard', status: 'completed', rake_id: 'SAIL-R004', distance: 180, duration: 8 },
  ],
}

export const getRouteData = async (): Promise<RouteData> => {
  try {
    const response = await axios.get(`${API_BASE}/api/routes/data`)
    return response.data
  } catch (error) {
    console.warn('Failed to fetch route data, using mock data:', error)
    return mockRouteData
  }
}

export const getAssistantSuggestion = async (orderId: string): Promise<AssistantSuggestion> => {
  try {
    const response = await axios.get(`${API_BASE}/api/assistant/route?orderId=${orderId}`)
    return response.data
  } catch (error) {
    console.warn('Failed to fetch assistant suggestion, using mock data:', error)
    return {
      orderId,
      suggestion: `Optimized route for ${orderId}: Consider using SAIL-R001 for faster delivery. Current ETA: 12 hours. Traffic conditions are favorable on NH2.`,
      recommendations: [
        'Use Bokaro to Haldia route for better throughput',
        'Schedule dispatch during off-peak hours (2-4 AM)',
        'Monitor fuel consumption on this route',
        'Consider consolidating with SAIL-R002 for cost savings',
      ],
      riskLevel: 'low',
    }
  }
}

export const getMockRouteData = (): RouteData => {
  return mockRouteData
}
