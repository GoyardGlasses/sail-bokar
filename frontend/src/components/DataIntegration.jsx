import React, { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Plus, Play, AlertCircle, CheckCircle, Clock, Upload } from 'lucide-react'
import { getConnectors, getDataMappings, getETLJobs, runETLJob, getDataQualityMetrics, uploadFile, getIntegrationStats } from '../api/dataIntegrationApi'

// ============ CONNECTOR MANAGER ============
export function ConnectorManager() {
  const [connectors, setConnectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadConnectors()
  }, [])

  const loadConnectors = async () => {
    try {
      const data = await getConnectors()
      setConnectors(data)
    } catch (error) {
      console.error('Failed to load connectors:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    'connected': 'bg-green-100 text-green-800',
    'disconnected': 'bg-gray-100 text-gray-800',
    'error': 'bg-red-100 text-red-800',
  }

  const typeIcons = {
    'api': '🔗',
    'database': '🗄️',
    'file': '📄',
    'webhook': '🪝',
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Data Connectors</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus size={18} className="inline mr-2" />
          New Connector
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {connectors.map((conn) => (
            <div key={conn.id} className="card p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{typeIcons[conn.type]}</span>
                  <div>
                    <p className="font-bold text-slate-900">{conn.name}</p>
                    <p className="text-sm text-slate-600">{conn.type.toUpperCase()}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[conn.status]}`}>
                  {conn.status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Records Synced</p>
                  <p className="font-bold text-slate-900">{conn.recordsSync.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-600">Last Sync</p>
                  <p className="font-bold text-slate-900">{conn.lastSync ? new Date(conn.lastSync).toLocaleTimeString() : 'Never'}</p>
                </div>
                <div className="text-right">
                  <button className="btn btn-sm btn-secondary">Test</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ ETL JOBS MANAGER ============
export function ETLJobsManager() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const data = await getETLJobs()
      setJobs(data)
    } catch (error) {
      console.error('Failed to load ETL jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRunJob = async (jobId) => {
    try {
      await runETLJob(jobId)
      loadJobs()
    } catch (error) {
      console.error('Failed to run job:', error)
    }
  }

  const statusIcons = {
    'running': <Clock className="text-blue-600" size={20} />,
    'completed': <CheckCircle className="text-green-600" size={20} />,
    'failed': <AlertCircle className="text-red-600" size={20} />,
    'scheduled': <Clock className="text-slate-600" size={20} />,
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">ETL Jobs</h2>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="card p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  {statusIcons[job.status]}
                  <div>
                    <p className="font-bold text-slate-900">{job.name}</p>
                    <p className="text-sm text-slate-600">Schedule: {job.schedule}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRunJob(job.id)}
                  className="btn btn-sm btn-primary"
                >
                  <Play size={16} className="inline mr-1" />
                  Run
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div>
                  <p className="text-slate-600">Records</p>
                  <p className="font-bold text-slate-900">{job.recordsProcessed.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-600">Errors</p>
                  <p className={`font-bold ${job.errors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {job.errors}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Last Run</p>
                  <p className="font-bold text-slate-900">{job.lastRun ? new Date(job.lastRun).toLocaleTimeString() : 'Never'}</p>
                </div>
                <div>
                  <p className="text-slate-600">Next Run</p>
                  <p className="font-bold text-slate-900">{job.nextRun ? new Date(job.nextRun).toLocaleTimeString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ DATA QUALITY DASHBOARD ============
export function DataQualityDashboard() {
  const [metrics, setMetrics] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [metricsData, statsData] = await Promise.all([
        getDataQualityMetrics(),
        getIntegrationStats(),
      ])
      setMetrics(metricsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load quality data:', error)
    } finally {
      setLoading(false)
    }
  }

  const qualityData = metrics ? [
    { metric: 'Completeness', value: metrics.completeness },
    { metric: 'Accuracy', value: metrics.accuracy },
    { metric: 'Consistency', value: metrics.consistency },
    { metric: 'Timeliness', value: metrics.timeliness },
    { metric: 'Validity', value: metrics.validity },
  ] : []

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Data Quality & Integration Stats</h2>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card text-center">
            <p className="text-sm text-slate-600">Total Connectors</p>
            <p className="text-3xl font-bold text-slate-900">{stats.totalConnectors}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Active</p>
            <p className="text-3xl font-bold text-green-600">{stats.activeConnectors}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Records Synced</p>
            <p className="text-3xl font-bold text-slate-900">{(stats.totalRecordsSynced / 1000).toFixed(1)}K</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Errors</p>
            <p className={`text-3xl font-bold ${stats.totalErrors > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {stats.totalErrors}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Last Sync</p>
            <p className="text-sm font-bold text-slate-900">{new Date(stats.lastSyncTime).toLocaleTimeString()}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-4">
            <h3 className="font-bold text-slate-900 mb-4">Quality Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={qualityData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-4">
            <h3 className="font-bold text-slate-900 mb-4">Quality Scores</h3>
            <div className="space-y-3">
              {qualityData.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-medium text-slate-900">{item.metric}</p>
                    <p className="text-sm font-bold text-slate-900">{item.value.toFixed(1)}%</p>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ FILE UPLOAD ============
export function FileUploadComponent() {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadResult = await uploadFile(file, '3')
      setResult(uploadResult)
    } catch (error) {
      console.error('Upload failed:', error)
      setResult({ success: false, recordsProcessed: 0 })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Upload Data File</h3>
      <div className="card p-6 border-2 border-dashed border-slate-300">
        <div className="text-center">
          <Upload className="mx-auto mb-3 text-slate-400" size={32} />
          <label className="cursor-pointer">
            <span className="btn btn-primary">Choose File</span>
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".csv,.xlsx,.json"
              className="hidden"
              disabled={uploading}
            />
          </label>
          <p className="text-sm text-slate-600 mt-2">CSV, Excel, or JSON</p>
        </div>
      </div>
      {result && (
        <div className={`card p-4 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`font-bold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
            {result.success ? '✓ Upload successful' : '✗ Upload failed'}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Records processed: {result.recordsProcessed.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
}
