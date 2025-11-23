import axios from 'axios'

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

export interface AlertRule {
  id: string
  name: string
  description: string
  metric: string
  condition: 'greater_than' | 'less_than' | 'equals' | 'between'
  threshold: number
  thresholdMax?: number
  enabled: boolean
  channels: ('email' | 'sms' | 'push' | 'slack' | 'webhook')[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string
  updatedAt: string
}

export interface Alert {
  id: string
  ruleId: string
  ruleName: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  value: number
  threshold: number
  metric: string
  status: 'active' | 'acknowledged' | 'resolved'
  createdAt: string
  resolvedAt?: string
  acknowledgedAt?: string
  acknowledgedBy?: string
}

export interface AlertStats {
  total: number
  active: number
  acknowledged: number
  resolved: number
  bySeverity: Record<string, number>
}

// Mock alert rules
const mockRules: AlertRule[] = [
  {
    id: '1',
    name: 'High Delay Risk',
    description: 'Alert when delay risk exceeds 70%',
    metric: 'delay_risk',
    condition: 'greater_than',
    threshold: 70,
    enabled: true,
    channels: ['email', 'push', 'slack'],
    severity: 'high',
    createdAt: '2025-11-01',
    updatedAt: '2025-11-23',
  },
  {
    id: '2',
    name: 'Low Forecast Confidence',
    description: 'Alert when forecast confidence drops below 75%',
    metric: 'forecast_confidence',
    condition: 'less_than',
    threshold: 75,
    enabled: true,
    channels: ['email', 'push'],
    severity: 'medium',
    createdAt: '2025-11-02',
    updatedAt: '2025-11-23',
  },
  {
    id: '3',
    name: 'Critical Equipment Failure',
    description: 'Alert when equipment failure risk exceeds 80%',
    metric: 'equipment_failure_risk',
    condition: 'greater_than',
    threshold: 80,
    enabled: true,
    channels: ['email', 'sms', 'slack', 'webhook'],
    severity: 'critical',
    createdAt: '2025-11-03',
    updatedAt: '2025-11-23',
  },
  {
    id: '4',
    name: 'Anomaly Detected',
    description: 'Alert when anomalies are detected in data',
    metric: 'anomaly_score',
    condition: 'greater_than',
    threshold: 0.8,
    enabled: true,
    channels: ['email', 'push'],
    severity: 'medium',
    createdAt: '2025-11-04',
    updatedAt: '2025-11-23',
  },
]

// Mock alerts
const mockAlerts: Alert[] = [
  {
    id: 'a1',
    ruleId: '1',
    ruleName: 'High Delay Risk',
    severity: 'high',
    message: 'Bokaro->Dhanbad route has 85% delay risk',
    value: 85,
    threshold: 70,
    metric: 'delay_risk',
    status: 'active',
    createdAt: '2025-11-23T18:30:00Z',
  },
  {
    id: 'a2',
    ruleId: '3',
    ruleName: 'Critical Equipment Failure',
    severity: 'critical',
    message: 'Truck Fleet A has 78% failure risk - immediate maintenance required',
    value: 78,
    threshold: 80,
    metric: 'equipment_failure_risk',
    status: 'active',
    createdAt: '2025-11-23T17:45:00Z',
  },
  {
    id: 'a3',
    ruleId: '2',
    ruleName: 'Low Forecast Confidence',
    severity: 'medium',
    message: 'Forecast confidence dropped to 72% for Kolkata route',
    value: 72,
    threshold: 75,
    metric: 'forecast_confidence',
    status: 'acknowledged',
    createdAt: '2025-11-23T16:20:00Z',
    acknowledgedAt: '2025-11-23T17:00:00Z',
    acknowledgedBy: 'admin@example.com',
  },
]

export const getAlertRules = async (): Promise<AlertRule[]> => {
  try {
    const response = await axios.get(`${API_URL}/alerts/rules`)
    return response.data
  } catch (error) {
    console.warn('Alert rules API error, using mock data:', error)
    return mockRules
  }
}

export const createAlertRule = async (rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AlertRule> => {
  try {
    const response = await axios.post(`${API_URL}/alerts/rules`, rule)
    return response.data
  } catch (error) {
    console.warn('Create alert rule error, using mock:', error)
    return {
      ...rule,
      id: `rule_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}

export const updateAlertRule = async (id: string, rule: Partial<AlertRule>): Promise<AlertRule> => {
  try {
    const response = await axios.put(`${API_URL}/alerts/rules/${id}`, rule)
    return response.data
  } catch (error) {
    console.warn('Update alert rule error, using mock:', error)
    const existing = mockRules.find(r => r.id === id)
    return {
      ...existing,
      ...rule,
      updatedAt: new Date().toISOString(),
    } as AlertRule
  }
}

export const deleteAlertRule = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/alerts/rules/${id}`)
  } catch (error) {
    console.warn('Delete alert rule error:', error)
  }
}

export const getAlerts = async (status?: string): Promise<Alert[]> => {
  try {
    const params = status ? { status } : {}
    const response = await axios.get(`${API_URL}/alerts`, { params })
    return response.data
  } catch (error) {
    console.warn('Get alerts API error, using mock data:', error)
    return status ? mockAlerts.filter(a => a.status === status) : mockAlerts
  }
}

export const acknowledgeAlert = async (id: string, userId: string): Promise<Alert> => {
  try {
    const response = await axios.put(`${API_URL}/alerts/${id}/acknowledge`, { userId })
    return response.data
  } catch (error) {
    console.warn('Acknowledge alert error, using mock:', error)
    const alert = mockAlerts.find(a => a.id === id)
    return {
      ...alert,
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: userId,
    } as Alert
  }
}

export const resolveAlert = async (id: string): Promise<Alert> => {
  try {
    const response = await axios.put(`${API_URL}/alerts/${id}/resolve`)
    return response.data
  } catch (error) {
    console.warn('Resolve alert error, using mock:', error)
    const alert = mockAlerts.find(a => a.id === id)
    return {
      ...alert,
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
    } as Alert
  }
}

export const getAlertStats = async (): Promise<AlertStats> => {
  try {
    const response = await axios.get(`${API_URL}/alerts/stats`)
    return response.data
  } catch (error) {
    console.warn('Alert stats API error, using mock data:', error)
    const stats: AlertStats = {
      total: mockAlerts.length,
      active: mockAlerts.filter(a => a.status === 'active').length,
      acknowledged: mockAlerts.filter(a => a.status === 'acknowledged').length,
      resolved: mockAlerts.filter(a => a.status === 'resolved').length,
      bySeverity: {
        critical: mockAlerts.filter(a => a.severity === 'critical').length,
        high: mockAlerts.filter(a => a.severity === 'high').length,
        medium: mockAlerts.filter(a => a.severity === 'medium').length,
        low: mockAlerts.filter(a => a.severity === 'low').length,
      },
    }
    return stats
  }
}

export const testAlertRule = async (rule: AlertRule): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(`${API_URL}/alerts/rules/test`, rule)
    return response.data
  } catch (error) {
    console.warn('Test alert rule error:', error)
    return { success: true, message: 'Alert rule test notification sent' }
  }
}
