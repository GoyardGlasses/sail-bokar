import axios from 'axios'

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

// ============ REPORTING ENGINE ============
export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  sections: ReportSection[]
  createdAt: string
  updatedAt: string
}

export interface ReportSection {
  id: string
  title: string
  type: 'chart' | 'table' | 'metric' | 'text' | 'image'
  config: Record<string, any>
}

export interface Report {
  id: string
  templateId: string
  name: string
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
  createdBy: string
  data?: any
}

export interface ReportSchedule {
  id: string
  reportId: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  recipients: string[]
  format: 'pdf' | 'excel' | 'html'
  nextRun?: string
  enabled: boolean
}

export const getReportTemplates = async (): Promise<ReportTemplate[]> => {
  try {
    const response = await axios.get(`${API_URL}/reporting/templates`)
    return response.data
  } catch (error) {
    console.warn('Get templates error, using mock:', error)
    return [
      {
        id: '1',
        name: 'Executive Summary',
        description: 'High-level KPIs and metrics',
        category: 'Executive',
        sections: [
          { id: 's1', title: 'Key Metrics', type: 'metric', config: {} },
          { id: 's2', title: 'Performance Trend', type: 'chart', config: { chartType: 'line' } },
          { id: 's3', title: 'Summary', type: 'text', config: {} },
        ],
        createdAt: '2025-01-01',
        updatedAt: '2025-11-23',
      },
      {
        id: '2',
        name: 'Operations Report',
        description: 'Detailed operational metrics',
        category: 'Operations',
        sections: [
          { id: 's4', title: 'Daily Stats', type: 'table', config: {} },
          { id: 's5', title: 'Efficiency', type: 'chart', config: { chartType: 'bar' } },
          { id: 's6', title: 'Issues', type: 'table', config: {} },
        ],
        createdAt: '2025-01-15',
        updatedAt: '2025-11-23',
      },
      {
        id: '3',
        name: 'Financial Report',
        description: 'Cost and budget analysis',
        category: 'Finance',
        sections: [
          { id: 's7', title: 'Revenue', type: 'metric', config: {} },
          { id: 's8', title: 'Expenses', type: 'chart', config: { chartType: 'pie' } },
          { id: 's9', title: 'Variance', type: 'table', config: {} },
        ],
        createdAt: '2025-02-01',
        updatedAt: '2025-11-23',
      },
    ]
  }
}

export const createReport = async (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report> => {
  try {
    const response = await axios.post(`${API_URL}/reporting/reports`, report)
    return response.data
  } catch (error) {
    return {
      ...report,
      id: `report_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}

export const getReports = async (): Promise<Report[]> => {
  try {
    const response = await axios.get(`${API_URL}/reporting/reports`)
    return response.data
  } catch (error) {
    console.warn('Get reports error, using mock:', error)
    return [
      {
        id: '1',
        templateId: '1',
        name: 'November Executive Summary',
        status: 'published',
        createdAt: '2025-11-20',
        updatedAt: '2025-11-23',
        createdBy: 'admin@example.com',
      },
      {
        id: '2',
        templateId: '2',
        name: 'Weekly Operations Report',
        status: 'published',
        createdAt: '2025-11-18',
        updatedAt: '2025-11-23',
        createdBy: 'manager@example.com',
      },
      {
        id: '3',
        templateId: '3',
        name: 'Q3 Financial Report',
        status: 'archived',
        createdAt: '2025-09-30',
        updatedAt: '2025-10-15',
        createdBy: 'finance@example.com',
      },
    ]
  }
}

export const publishReport = async (reportId: string): Promise<Report> => {
  try {
    const response = await axios.put(`${API_URL}/reporting/reports/${reportId}/publish`)
    return response.data
  } catch (error) {
    return { id: reportId, templateId: '', name: '', status: 'published', createdAt: '', updatedAt: '', createdBy: '' }
  }
}

export const exportReport = async (reportId: string, format: 'pdf' | 'excel' | 'html'): Promise<Blob> => {
  try {
    const response = await axios.get(`${API_URL}/reporting/reports/${reportId}/export`, {
      params: { format },
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    return new Blob(['Export not available'], { type: 'text/plain' })
  }
}

export const getReportSchedules = async (): Promise<ReportSchedule[]> => {
  try {
    const response = await axios.get(`${API_URL}/reporting/schedules`)
    return response.data
  } catch (error) {
    console.warn('Get schedules error, using mock:', error)
    return [
      {
        id: '1',
        reportId: '1',
        frequency: 'weekly',
        recipients: ['admin@example.com', 'manager@example.com'],
        format: 'pdf',
        nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        enabled: true,
      },
      {
        id: '2',
        reportId: '2',
        frequency: 'daily',
        recipients: ['operations@example.com'],
        format: 'excel',
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        enabled: true,
      },
      {
        id: '3',
        reportId: '3',
        frequency: 'monthly',
        recipients: ['finance@example.com', 'cfo@example.com'],
        format: 'pdf',
        enabled: false,
      },
    ]
  }
}

export const createSchedule = async (schedule: Omit<ReportSchedule, 'id' | 'nextRun'>): Promise<ReportSchedule> => {
  try {
    const response = await axios.post(`${API_URL}/reporting/schedules`, schedule)
    return response.data
  } catch (error) {
    return {
      ...schedule,
      id: `sched_${Date.now()}`,
      nextRun: new Date().toISOString(),
    }
  }
}

export const getReportingStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/reporting/stats`)
    return response.data
  } catch (error) {
    return {
      totalReports: 45,
      publishedReports: 32,
      draftReports: 10,
      archivedReports: 3,
      totalSchedules: 8,
      activeSchedules: 6,
      reportsThisMonth: 12,
      averageGenerationTime: 2.3,
    }
  }
}
