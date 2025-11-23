import axios from 'axios'

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

// ============ DATA INTEGRATION & ETL ============
export interface Connector {
  id: string
  name: string
  type: 'api' | 'database' | 'file' | 'webhook'
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: string
  recordsSync: number
  config: Record<string, any>
}

export interface DataMapping {
  id: string
  connectorId: string
  sourceField: string
  targetField: string
  transformation?: string
  dataType: string
}

export interface ETLJob {
  id: string
  name: string
  connectorId: string
  schedule: string
  status: 'running' | 'completed' | 'failed' | 'scheduled'
  lastRun?: string
  nextRun?: string
  recordsProcessed: number
  errors: number
}

export const getConnectors = async (): Promise<Connector[]> => {
  try {
    const response = await axios.get(`${API_URL}/integration/connectors`)
    return response.data
  } catch (error) {
    console.warn('Get connectors error, using mock:', error)
    return [
      {
        id: '1',
        name: 'ERP System API',
        type: 'api',
        status: 'connected',
        lastSync: new Date(Date.now() - 60000).toISOString(),
        recordsSync: 1250,
        config: { url: 'https://erp.example.com/api', method: 'REST' },
      },
      {
        id: '2',
        name: 'Warehouse Database',
        type: 'database',
        status: 'connected',
        lastSync: new Date(Date.now() - 300000).toISOString(),
        recordsSync: 5420,
        config: { host: 'warehouse.db.com', port: 5432 },
      },
      {
        id: '3',
        name: 'CSV Upload',
        type: 'file',
        status: 'disconnected',
        recordsSync: 0,
        config: { format: 'CSV', delimiter: ',' },
      },
      {
        id: '4',
        name: 'Webhook Integration',
        type: 'webhook',
        status: 'connected',
        lastSync: new Date(Date.now() - 120000).toISOString(),
        recordsSync: 342,
        config: { endpoint: '/webhook/data' },
      },
    ]
  }
}

export const createConnector = async (connector: Omit<Connector, 'id' | 'lastSync' | 'recordsSync'>): Promise<Connector> => {
  try {
    const response = await axios.post(`${API_URL}/integration/connectors`, connector)
    return response.data
  } catch (error) {
    console.warn('Create connector error, using mock:', error)
    return {
      ...connector,
      id: `conn_${Date.now()}`,
      lastSync: new Date().toISOString(),
      recordsSync: 0,
    }
  }
}

export const testConnector = async (connectorId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(`${API_URL}/integration/connectors/${connectorId}/test`)
    return response.data
  } catch (error) {
    return { success: false, message: 'Connection test failed' }
  }
}

export const getDataMappings = async (connectorId: string): Promise<DataMapping[]> => {
  try {
    const response = await axios.get(`${API_URL}/integration/mappings`, { params: { connectorId } })
    return response.data
  } catch (error) {
    console.warn('Get mappings error, using mock:', error)
    return [
      {
        id: '1',
        connectorId,
        sourceField: 'order_id',
        targetField: 'id',
        dataType: 'string',
      },
      {
        id: '2',
        connectorId,
        sourceField: 'order_date',
        targetField: 'timestamp',
        transformation: 'parseDate',
        dataType: 'datetime',
      },
      {
        id: '3',
        connectorId,
        sourceField: 'qty',
        targetField: 'quantity',
        transformation: 'parseInt',
        dataType: 'integer',
      },
    ]
  }
}

export const createDataMapping = async (mapping: Omit<DataMapping, 'id'>): Promise<DataMapping> => {
  try {
    const response = await axios.post(`${API_URL}/integration/mappings`, mapping)
    return response.data
  } catch (error) {
    return {
      ...mapping,
      id: `map_${Date.now()}`,
    }
  }
}

export const getETLJobs = async (): Promise<ETLJob[]> => {
  try {
    const response = await axios.get(`${API_URL}/integration/jobs`)
    return response.data
  } catch (error) {
    console.warn('Get ETL jobs error, using mock:', error)
    return [
      {
        id: '1',
        name: 'Daily ERP Sync',
        connectorId: '1',
        schedule: '0 2 * * *',
        status: 'completed',
        lastRun: new Date(Date.now() - 3600000).toISOString(),
        nextRun: new Date(Date.now() + 82800000).toISOString(),
        recordsProcessed: 1250,
        errors: 0,
      },
      {
        id: '2',
        name: 'Hourly Warehouse Sync',
        connectorId: '2',
        schedule: '0 * * * *',
        status: 'completed',
        lastRun: new Date(Date.now() - 600000).toISOString(),
        nextRun: new Date(Date.now() + 1800000).toISOString(),
        recordsProcessed: 5420,
        errors: 2,
      },
      {
        id: '3',
        name: 'Real-time Webhook',
        connectorId: '4',
        schedule: 'real-time',
        status: 'running',
        recordsProcessed: 342,
        errors: 0,
      },
    ]
  }
}

export const runETLJob = async (jobId: string): Promise<{ success: boolean; jobId: string }> => {
  try {
    const response = await axios.post(`${API_URL}/integration/jobs/${jobId}/run`)
    return response.data
  } catch (error) {
    return { success: false, jobId }
  }
}

export const getDataQualityMetrics = async () => {
  try {
    const response = await axios.get(`${API_URL}/integration/quality`)
    return response.data
  } catch (error) {
    return {
      completeness: 98.5,
      accuracy: 96.2,
      consistency: 97.8,
      timeliness: 99.1,
      validity: 98.9,
    }
  }
}

export const uploadFile = async (file: File, connectorId: string): Promise<{ success: boolean; recordsProcessed: number }> => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('connectorId', connectorId)
    const response = await axios.post(`${API_URL}/integration/upload`, formData)
    return response.data
  } catch (error) {
    return { success: false, recordsProcessed: 0 }
  }
}

export const getIntegrationStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/integration/stats`)
    return response.data
  } catch (error) {
    return {
      totalConnectors: 4,
      activeConnectors: 3,
      totalRecordsSynced: 8012,
      totalErrors: 2,
      lastSyncTime: new Date(Date.now() - 60000).toISOString(),
    }
  }
}
