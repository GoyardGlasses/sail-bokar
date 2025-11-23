import axios from 'axios'

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  resource: string
  resourceId: string
  changes: Record<string, any>
  timestamp: string
  ipAddress: string
  status: 'success' | 'failure'
  details?: string
}

export interface ComplianceReport {
  id: string
  name: string
  type: 'gdpr' | 'soc2' | 'hipaa' | 'pci_dss'
  status: 'compliant' | 'non_compliant' | 'partial'
  checkedAt: string
  issues: ComplianceIssue[]
  score: number
}

export interface ComplianceIssue {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  remediation: string
  dueDate?: string
}

export interface DataProtectionPolicy {
  id: string
  name: string
  description: string
  dataClassification: string
  retentionDays: number
  encryptionEnabled: boolean
  anonymizationEnabled: boolean
  enabled: boolean
}

// Mock audit logs
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    userId: 'admin@example.com',
    userName: 'Admin User',
    action: 'LOGIN',
    resource: 'Authentication',
    resourceId: 'auth_session_1',
    changes: {},
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    ipAddress: '192.168.1.100',
    status: 'success',
  },
  {
    id: '2',
    userId: 'admin@example.com',
    userName: 'Admin User',
    action: 'CREATE',
    resource: 'Dashboard',
    resourceId: 'dash_123',
    changes: { name: 'Executive Dashboard', widgets: 4 },
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    ipAddress: '192.168.1.100',
    status: 'success',
  },
  {
    id: '3',
    userId: 'manager@example.com',
    userName: 'Manager User',
    action: 'UPDATE',
    resource: 'AlertRule',
    resourceId: 'rule_456',
    changes: { threshold: 70, severity: 'high' },
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    ipAddress: '192.168.1.101',
    status: 'success',
  },
  {
    id: '4',
    userId: 'analyst@example.com',
    userName: 'Analyst User',
    action: 'DELETE',
    resource: 'Report',
    resourceId: 'report_789',
    changes: { reason: 'Duplicate' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    ipAddress: '192.168.1.102',
    status: 'success',
  },
]

// Mock compliance reports
const mockComplianceReports: ComplianceReport[] = [
  {
    id: '1',
    name: 'GDPR Compliance',
    type: 'gdpr',
    status: 'compliant',
    checkedAt: new Date().toISOString(),
    issues: [],
    score: 95,
  },
  {
    id: '2',
    name: 'SOC 2 Type II',
    type: 'soc2',
    status: 'partial',
    checkedAt: new Date().toISOString(),
    issues: [
      {
        id: '1',
        severity: 'high',
        title: 'Missing encryption on data at rest',
        description: 'Some databases are not encrypted',
        remediation: 'Enable encryption for all databases',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    score: 78,
  },
]

// Mock data protection policies
const mockPolicies: DataProtectionPolicy[] = [
  {
    id: '1',
    name: 'Customer Data Protection',
    description: 'Protection policy for customer personal data',
    dataClassification: 'Confidential',
    retentionDays: 365,
    encryptionEnabled: true,
    anonymizationEnabled: true,
    enabled: true,
  },
  {
    id: '2',
    name: 'Financial Data Protection',
    description: 'Protection policy for financial information',
    dataClassification: 'Highly Confidential',
    retentionDays: 2555,
    encryptionEnabled: true,
    anonymizationEnabled: false,
    enabled: true,
  },
]

export const getAuditLogs = async (filters?: { userId?: string; action?: string; limit?: number }): Promise<AuditLog[]> => {
  try {
    const response = await axios.get(`${API_URL}/audit/logs`, { params: filters })
    return response.data
  } catch (error) {
    console.warn('Get audit logs error, using mock data:', error)
    let logs = mockAuditLogs
    if (filters?.userId) logs = logs.filter(l => l.userId === filters.userId)
    if (filters?.action) logs = logs.filter(l => l.action === filters.action)
    if (filters?.limit) logs = logs.slice(0, filters.limit)
    return logs
  }
}

export const getComplianceReports = async (): Promise<ComplianceReport[]> => {
  try {
    const response = await axios.get(`${API_URL}/compliance/reports`)
    return response.data
  } catch (error) {
    console.warn('Get compliance reports error, using mock data:', error)
    return mockComplianceReports
  }
}

export const runComplianceCheck = async (type: string): Promise<ComplianceReport> => {
  try {
    const response = await axios.post(`${API_URL}/compliance/check`, { type })
    return response.data
  } catch (error) {
    console.warn('Run compliance check error, using mock:', error)
    return {
      id: `report_${Date.now()}`,
      name: `${type} Compliance Check`,
      type: type as any,
      status: 'compliant',
      checkedAt: new Date().toISOString(),
      issues: [],
      score: 90,
    }
  }
}

export const getDataProtectionPolicies = async (): Promise<DataProtectionPolicy[]> => {
  try {
    const response = await axios.get(`${API_URL}/compliance/policies`)
    return response.data
  } catch (error) {
    console.warn('Get policies error, using mock data:', error)
    return mockPolicies
  }
}

export const createDataProtectionPolicy = async (policy: Omit<DataProtectionPolicy, 'id'>): Promise<DataProtectionPolicy> => {
  try {
    const response = await axios.post(`${API_URL}/compliance/policies`, policy)
    return response.data
  } catch (error) {
    console.warn('Create policy error, using mock:', error)
    return {
      ...policy,
      id: `policy_${Date.now()}`,
    }
  }
}

export const exportAuditReport = async (format: 'pdf' | 'csv' | 'excel'): Promise<Blob> => {
  try {
    const response = await axios.get(`${API_URL}/audit/export`, {
      params: { format },
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    console.warn('Export audit report error:', error)
    return new Blob(['Export not available'], { type: 'text/plain' })
  }
}

export const getComplianceScore = async (): Promise<{ overall: number; byType: Record<string, number> }> => {
  try {
    const response = await axios.get(`${API_URL}/compliance/score`)
    return response.data
  } catch (error) {
    console.warn('Get compliance score error, using mock:', error)
    return {
      overall: 87,
      byType: {
        gdpr: 95,
        soc2: 78,
        hipaa: 85,
        pci_dss: 82,
      },
    }
  }
}
