import React, { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Download, AlertCircle, CheckCircle, Clock, Lock, Eye, Trash2, Plus } from 'lucide-react'
import { getAuditLogs, getComplianceReports, runComplianceCheck, getDataProtectionPolicies, createDataProtectionPolicy, exportAuditReport, getComplianceScore } from '../api/auditApi'

// Audit Log Viewer Component
export function AuditLogViewer() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadLogs()
  }, [filter])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const filters = filter === 'all' ? {} : { action: filter }
      const data = await getAuditLogs(filters)
      setLogs(data)
    } catch (error) {
      console.error('Failed to load audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format) => {
    try {
      const blob = await exportAuditReport(format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-report.${format}`
      a.click()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const actions = ['all', 'LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Audit Logs</h2>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="btn btn-secondary btn-sm">
            <Download size={16} className="inline mr-1" />
            CSV
          </button>
          <button onClick={() => handleExport('pdf')} className="btn btn-secondary btn-sm">
            <Download size={16} className="inline mr-1" />
            PDF
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {actions.map((action) => (
          <button
            key={action}
            onClick={() => setFilter(action)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === action
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
            }`}
          >
            {action}
          </button>
        ))}
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-4 py-2 text-left font-bold text-slate-900">Timestamp</th>
                <th className="px-4 py-2 text-left font-bold text-slate-900">User</th>
                <th className="px-4 py-2 text-left font-bold text-slate-900">Action</th>
                <th className="px-4 py-2 text-left font-bold text-slate-900">Resource</th>
                <th className="px-4 py-2 text-left font-bold text-slate-900">IP Address</th>
                <th className="px-4 py-2 text-left font-bold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-600">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-2 text-slate-900 font-medium">{log.userName}</td>
                  <td className="px-4 py-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{log.resource}</td>
                  <td className="px-4 py-2 text-slate-600">{log.ipAddress}</td>
                  <td className="px-4 py-2">
                    {log.status === 'success' ? (
                      <span className="text-green-600 font-medium">✓ Success</span>
                    ) : (
                      <span className="text-red-600 font-medium">✗ Failed</span>
                    )}
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

// Compliance Dashboard Component
export function ComplianceDashboard() {
  const [reports, setReports] = useState([])
  const [score, setScore] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [reportsData, scoreData] = await Promise.all([
        getComplianceReports(),
        getComplianceScore(),
      ])
      setReports(reportsData)
      setScore(scoreData)
    } catch (error) {
      console.error('Failed to load compliance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRunCheck = async (type) => {
    try {
      await runComplianceCheck(type)
      loadData()
    } catch (error) {
      console.error('Compliance check failed:', error)
    }
  }

  const statusColors = {
    compliant: 'bg-green-100 text-green-800',
    partial: 'bg-yellow-100 text-yellow-800',
    non_compliant: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Compliance Dashboard</h2>

      {/* Overall Score */}
      {score && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card text-center">
            <p className="text-sm text-slate-600">Overall Score</p>
            <p className="text-4xl font-bold text-slate-900">{score.overall}%</p>
          </div>
          {Object.entries(score.byType).map(([type, value]) => (
            <div key={type} className="card text-center">
              <p className="text-sm text-slate-600 uppercase">{type}</p>
              <p className="text-3xl font-bold text-slate-900">{value}%</p>
            </div>
          ))}
        </div>
      )}

      {/* Compliance Reports */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className={`card p-4 border-l-4 ${
              report.status === 'compliant' ? 'border-green-500' :
              report.status === 'partial' ? 'border-yellow-500' :
              'border-red-500'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-900">{report.name}</h3>
                  <p className="text-sm text-slate-600">Last checked: {new Date(report.checkedAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColors[report.status]}`}>
                    {report.status.toUpperCase()}
                  </span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{report.score}%</p>
                </div>
              </div>

              {report.issues.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-bold text-slate-900">Issues Found:</p>
                  {report.issues.map((issue) => (
                    <div key={issue.id} className="bg-slate-50 p-3 rounded text-sm">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={16} className={
                          issue.severity === 'critical' ? 'text-red-600' :
                          issue.severity === 'high' ? 'text-orange-600' :
                          issue.severity === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        } />
                        <div>
                          <p className="font-medium text-slate-900">{issue.title}</p>
                          <p className="text-slate-600">{issue.description}</p>
                          <p className="text-slate-500 mt-1">Fix: {issue.remediation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => handleRunCheck(report.type)}
                className="btn btn-sm btn-primary mt-3"
              >
                Run Check
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Data Protection Settings Component
export function DataProtectionSettings() {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dataClassification: 'Confidential',
    retentionDays: 365,
    encryptionEnabled: true,
    anonymizationEnabled: true,
  })

  useEffect(() => {
    loadPolicies()
  }, [])

  const loadPolicies = async () => {
    setLoading(true)
    try {
      const data = await getDataProtectionPolicies()
      setPolicies(data)
    } catch (error) {
      console.error('Failed to load policies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePolicy = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a policy name')
      return
    }
    try {
      await createDataProtectionPolicy({
        ...formData,
        enabled: true,
      })
      loadPolicies()
      setShowForm(false)
      setFormData({
        name: '',
        description: '',
        dataClassification: 'Confidential',
        retentionDays: 365,
        encryptionEnabled: true,
        anonymizationEnabled: true,
      })
    } catch (error) {
      console.error('Failed to create policy:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Data Protection Policies</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          <Plus size={18} className="inline mr-2" />
          New Policy
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4 p-6 bg-blue-50">
          <h3 className="font-bold text-slate-900">Create Data Protection Policy</h3>
          <input
            type="text"
            placeholder="Policy name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            rows="3"
          />
          <select
            value={formData.dataClassification}
            onChange={(e) => setFormData({ ...formData, dataClassification: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="Public">Public</option>
            <option value="Internal">Internal</option>
            <option value="Confidential">Confidential</option>
            <option value="Highly Confidential">Highly Confidential</option>
          </select>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Retention Days</label>
            <input
              type="number"
              value={formData.retentionDays}
              onChange={(e) => setFormData({ ...formData, retentionDays: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.encryptionEnabled}
              onChange={(e) => setFormData({ ...formData, encryptionEnabled: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-slate-900">Enable Encryption</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.anonymizationEnabled}
              onChange={(e) => setFormData({ ...formData, anonymizationEnabled: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-slate-900">Enable Anonymization</span>
          </label>
          <div className="flex gap-2">
            <button onClick={handleCreatePolicy} className="btn btn-primary">
              Create Policy
            </button>
            <button onClick={() => setShowForm(false)} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Policies List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {policies.map((policy) => (
            <div key={policy.id} className="card p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-900">{policy.name}</h3>
                  <p className="text-sm text-slate-600">{policy.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  policy.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {policy.enabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-slate-600">Classification:</span>
                  <span className="font-medium text-slate-900">{policy.dataClassification}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-600">Retention:</span>
                  <span className="font-medium text-slate-900">{policy.retentionDays}d</span>
                </div>
                <div className="flex items-center gap-1">
                  {policy.encryptionEnabled ? (
                    <>
                      <Lock size={16} className="text-green-600" />
                      <span className="text-green-600">Encrypted</span>
                    </>
                  ) : (
                    <span className="text-slate-600">Not encrypted</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {policy.anonymizationEnabled ? (
                    <>
                      <Eye size={16} className="text-green-600" />
                      <span className="text-green-600">Anonymized</span>
                    </>
                  ) : (
                    <span className="text-slate-600">Not anonymized</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
