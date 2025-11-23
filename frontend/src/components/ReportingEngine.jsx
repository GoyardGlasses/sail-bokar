import React, { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Plus, Download, Eye, Settings, Trash2, Send } from 'lucide-react'
import { getReportTemplates, getReports, publishReport, exportReport, getReportSchedules, createSchedule, getReportingStats } from '../api/reportingApi'

// ============ REPORT BUILDER ============
export function ReportBuilder() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const data = await getReportTemplates()
      setTemplates(data)
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReport = (templateId) => {
    setSelectedTemplate(templateId)
    alert(`Creating report from template ${templateId}`)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Report Templates</h2>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="card p-4 hover:shadow-lg transition-shadow">
              <div className="mb-3">
                <h3 className="font-bold text-slate-900">{template.name}</h3>
                <p className="text-sm text-slate-600">{template.description}</p>
              </div>
              <div className="mb-3">
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                  {template.category}
                </span>
              </div>
              <div className="mb-3 text-sm text-slate-600">
                <p>{template.sections.length} sections</p>
              </div>
              <button
                onClick={() => handleCreateReport(template.id)}
                className="btn btn-primary w-full"
              >
                <Plus size={16} className="inline mr-1" />
                Create Report
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ REPORT MANAGER ============
export function ReportManager() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      const data = await getReports()
      setReports(data)
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (reportId) => {
    try {
      await publishReport(reportId)
      loadReports()
    } catch (error) {
      console.error('Failed to publish report:', error)
    }
  }

  const handleExport = async (reportId, format) => {
    try {
      const blob = await exportReport(reportId, format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report_${reportId}.${format}`
      a.click()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const statusColors = {
    'draft': 'bg-yellow-100 text-yellow-800',
    'published': 'bg-green-100 text-green-800',
    'archived': 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Reports</h2>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-4 py-2 text-left font-bold text-slate-900">Report Name</th>
                <th className="px-4 py-2 text-left font-bold text-slate-900">Status</th>
                <th className="px-4 py-2 text-left font-bold text-slate-900">Created By</th>
                <th className="px-4 py-2 text-left font-bold text-slate-900">Created</th>
                <th className="px-4 py-2 text-center font-bold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-900">{report.name}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[report.status]}`}>
                      {report.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{report.createdBy}</td>
                  <td className="px-4 py-2 text-slate-600">{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      {report.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(report.id)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Publish"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleExport(report.id, 'pdf')}
                        className="text-green-600 hover:text-green-700"
                        title="Export PDF"
                      >
                        <Download size={18} />
                      </button>
                      <button className="text-red-600 hover:text-red-700" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ============ REPORT DISTRIBUTION ============
export function ReportDistribution() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = async () => {
    try {
      const data = await getReportSchedules()
      setSchedules(data)
    } catch (error) {
      console.error('Failed to load schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const frequencyColors = {
    'daily': 'bg-blue-100 text-blue-800',
    'weekly': 'bg-green-100 text-green-800',
    'monthly': 'bg-purple-100 text-purple-800',
    'quarterly': 'bg-orange-100 text-orange-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Report Distribution</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus size={18} className="inline mr-2" />
          New Schedule
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div key={schedule.id} className={`card p-4 ${schedule.enabled ? 'border-l-4 border-green-500' : 'opacity-60'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-slate-900">Report #{schedule.reportId}</p>
                  <p className="text-sm text-slate-600">{schedule.recipients.length} recipients</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${frequencyColors[schedule.frequency]}`}>
                    {schedule.frequency.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${schedule.enabled ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                    {schedule.enabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-slate-600">Format</p>
                  <p className="font-bold text-slate-900">{schedule.format.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-slate-600">Recipients</p>
                  <p className="font-bold text-slate-900">{schedule.recipients.join(', ')}</p>
                </div>
                <div>
                  <p className="text-slate-600">Next Run</p>
                  <p className="font-bold text-slate-900">{schedule.nextRun ? new Date(schedule.nextRun).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ REPORTING STATS ============
export function ReportingStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getReportingStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Reporting Statistics</h2>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <p className="text-sm text-slate-600">Total Reports</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalReports}</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-slate-600">Published</p>
              <p className="text-3xl font-bold text-green-600">{stats.publishedReports}</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-slate-600">Drafts</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.draftReports}</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-slate-600">Active Schedules</p>
              <p className="text-3xl font-bold text-blue-600">{stats.activeSchedules}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card text-center">
              <p className="text-sm text-slate-600">This Month</p>
              <p className="text-3xl font-bold text-slate-900">{stats.reportsThisMonth}</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-slate-600">Avg Generation Time</p>
              <p className="text-3xl font-bold text-slate-900">{stats.averageGenerationTime}s</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-slate-600">Total Schedules</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalSchedules}</p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
