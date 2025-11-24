/**
 * Comprehensive Reporting & Analytics Types
 */

export interface Report {
  id: string
  name: string
  type: 'summary' | 'detailed' | 'executive' | 'technical'
  format: 'pdf' | 'excel' | 'html' | 'json'
  generatedAt: string
  generatedBy: string
  sections: ReportSection[]
  metadata: ReportMetadata
}

export interface ReportSection {
  id: string
  title: string
  content: string
  charts: Chart[]
  tables: Table[]
}

export interface Chart {
  id: string
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap'
  title: string
  data: any
}

export interface Table {
  id: string
  title: string
  headers: string[]
  rows: any[][]
}

export interface ReportMetadata {
  period: string
  startDate: string
  endDate: string
  dataSource: string
  accuracy: number
  lastUpdated: string
}

export interface Analytics {
  id: string
  metric: string
  value: number
  trend: 'up' | 'down' | 'stable'
  percentageChange: number
  benchmark: number
  status: 'good' | 'warning' | 'critical'
}

export interface ReportingState {
  reports: Report[]
  analytics: Analytics[]
  selectedReport?: string
  isGenerating: boolean
  error: string | null
}
