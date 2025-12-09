/**
 * Auto-Alerts & Mitigation Dashboard - Phase 1 Feature 2
 * Shows alerts and suggested mitigations
 */

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Zap, TrendingDown, RefreshCw, Play } from 'lucide-react'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'
import InlineDecisionSummary from '../features/decisionSupport/components/InlineDecisionSummary'

export default function AutoAlertsPage() {
  const { dataImported, getPrediction } = useMLPredictions()
  const [mlAnomalyDetection, setMlAnomalyDetection] = useState(null)
  const [status, setStatus] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [filter, setFilter] = useState('all') // all, critical, high, medium, low

  const { data: importedData, isLoaded } = useImportedData()

  // Get ML prediction when data is imported
  useEffect(() => {
    if (dataImported) {
      const anomalyDetection = getPrediction('anomaly_detection')
      setMlAnomalyDetection(anomalyDetection)
    }
  }, [dataImported, getPrediction])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [statusRes, alertsRes, statsRes] = await Promise.all([
        fetch('/api/auto-alerts/status').catch(() => null),
        fetch('/api/auto-alerts/alerts').catch(() => null),
        fetch('/api/auto-alerts/stats').catch(() => null),
      ])

      const mockAlerts = [
        { id: 'ALERT-001', type: 'stock_low', severity: 'high', message: 'Stock level below threshold', plan_id: 'PLAN-001', created_at: new Date().toISOString(), status: 'active' },
        { id: 'ALERT-002', type: 'delay_risk', severity: 'medium', message: 'Potential delay detected', plan_id: 'PLAN-002', created_at: new Date().toISOString(), status: 'active' },
        { id: 'ALERT-003', type: 'cost_overrun', severity: 'high', message: 'Cost exceeding budget', plan_id: 'PLAN-003', created_at: new Date().toISOString(), status: 'resolved' },
      ]

      const mockStats = {
        total_alerts: 3,
        active_alerts: 2,
        resolved_alerts: 1,
        avg_resolution_time: 2.5,
        mitigation_success_rate: 0.92
      }

      setStatus(statusRes ? await statusRes.json() : { status: 'running', active_alerts: 2, total_alerts: 3, timestamp: new Date().toISOString() })
      setAlerts(alertsRes ? (await alertsRes.json()).alerts || mockAlerts : mockAlerts)
      setStats(statsRes ? await statsRes.json() : mockStats)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const triggerAnalysis = async () => {
    try {
      setAnalyzing(true)
      const res = await fetch('/api/auto-alerts/analyze/trigger', { method: 'POST' })
      const data = await res.json()
      
      if (data.status === 'success') {
        alert(`✓ Analysis triggered!\nFound ${data.total_alerts} alerts`)
        await fetchData()
      }
    } catch (error) {
      console.error('Error triggering analysis:', error)
      alert('Error triggering analysis')
    } finally {
      setAnalyzing(false)
    }
  }

  const applyMitigation = async (alertId, mitigationId) => {
    try {
      const res = await fetch(`/api/auto-alerts/alerts/${alertId}/mitigations/${mitigationId}/apply`, {
        method: 'POST'
      })
      const data = await res.json()
      
      if (data.status === 'success') {
        alert('✓ Mitigation applied successfully!')
        await fetchData()
      }
    } catch (error) {
      console.error('Error applying mitigation:', error)
      alert('Error applying mitigation')
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700'
      case 'high':
        return 'bg-orange-100 text-orange-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'low':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertCircle className="text-red-600" size={20} />
      case 'medium':
        return <AlertCircle className="text-yellow-600" size={20} />
      default:
        return <AlertCircle className="text-blue-600" size={20} />
    }
  }

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.severity === filter)

  const ordersCount = Array.isArray(importedData?.orders) ? importedData.orders.length : 0
  const routesCount = Array.isArray(importedData?.routes) ? importedData.routes.length : 0
  const hasImportedData = isLoaded && importedData && (ordersCount > 0 || routesCount > 0)

  const hasAnomalyPred = !!mlAnomalyDetection

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Zap className="mx-auto text-blue-600 mb-4 animate-spin" size={48} />
          <p className="text-slate-600 dark:text-slate-400">Loading alerts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Auto-Alerts & Mitigation
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Intelligent alert detection and automatic mitigation strategies
          </p>
        </div>
        <button
          onClick={triggerAnalysis}
          disabled={analyzing}
          className="btn btn-primary flex items-center gap-2"
        >
          <Play size={18} />
          {analyzing ? 'Analyzing...' : 'Trigger Analysis'}
        </button>
      </div>

      <InlineDataImport templateId="operations" />

      {(hasImportedData || hasAnomalyPred || dataImported) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hasImportedData && (
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">Dataset Scope</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-2">
                {ordersCount.toLocaleString()} orders
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {routesCount} routes monitored for auto-alerts
              </p>
            </div>
          )}

          {hasAnomalyPred && (
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">ML Anomaly Detection</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Model outputs available from anomaly_detection pipeline
              </p>
            </div>
          )}

          {dataImported && (
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">ML Pipeline</p>
              <p className="text-2xl font-bold text-green-600 mt-2">Active</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Alerts driven by latest imported data</p>
            </div>
          )}
        </div>
      )}

      {/* Status Cards */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Alerts</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-2">
              {status.total_alerts}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Active Alerts</p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {status.active_alerts}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Mitigated</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {status.mitigated_alerts}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Applied</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {status.mitigations_applied}
            </p>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
              Alerts by Severity
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Critical</span>
                <span className="font-bold text-red-600">{stats.by_severity.critical}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">High</span>
                <span className="font-bold text-orange-600">{stats.by_severity.high}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Medium</span>
                <span className="font-bold text-yellow-600">{stats.by_severity.medium}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Low</span>
                <span className="font-bold text-blue-600">{stats.by_severity.low}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
              Top Alert Types
            </h3>
            <div className="space-y-2">
              {Object.entries(stats.by_type)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {type.replace(/_/g, ' ')}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-50">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {['all', 'critical', 'high', 'medium', 'low'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              filter === f
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="card text-center py-8">
            <CheckCircle className="mx-auto text-green-600 mb-3" size={32} />
            <p className="text-slate-600 dark:text-slate-400">No alerts in this category</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="card cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setSelectedAlert(alert)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getSeverityIcon(alert.severity)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-50">
                        {alert.type.replace(/_/g, ' ').toUpperCase()}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {alert.message}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm mt-3">
                    <span className="text-slate-600 dark:text-slate-400">
                      Plan: {alert.plan_id}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      Orders: {alert.affected_orders.join(', ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      alert.status === 'mitigated'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {alert.status}
                    </span>
                  </div>

                  {alert.mitigations && alert.mitigations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                        Suggested Mitigations:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {alert.mitigations.slice(0, 2).map((mit) => (
                          <div
                            key={mit.id}
                            className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded px-2 py-1 text-xs"
                          >
                            <p className="font-semibold text-blue-900 dark:text-blue-100">
                              {mit.strategy.replace(/_/g, ' ')}
                            </p>
                            <p className="text-blue-700 dark:text-blue-300">
                              Effectiveness: {(mit.effectiveness * 100).toFixed(0)}%
                            </p>
                            {mit.cost_impact !== 0 && (
                              <p className={`text-xs ${mit.cost_impact < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Cost: ₹{mit.cost_impact.toLocaleString()}
                              </p>
                            )}
                          </div>
                        ))}
                        {alert.mitigations.length > 2 && (
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            +{alert.mitigations.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  Alert Details: {selectedAlert.id}
                </h3>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Alert Type
                  </p>
                  <p className="text-slate-900 dark:text-slate-50">
                    {selectedAlert.type.replace(/_/g, ' ')}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Message
                  </p>
                  <p className="text-slate-900 dark:text-slate-50">
                    {selectedAlert.message}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Mitigations
                  </p>
                  <div className="space-y-2">
                    {selectedAlert.mitigations.map((mit) => (
                      <div
                        key={mit.id}
                        className="border border-slate-200 dark:border-slate-700 rounded p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-slate-900 dark:text-slate-50">
                            {mit.strategy.replace(/_/g, ' ')}
                          </p>
                          <button
                            onClick={() => applyMitigation(selectedAlert.id, mit.id)}
                            className="btn btn-sm btn-primary"
                          >
                            Apply
                          </button>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {mit.description}
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-slate-600 dark:text-slate-400">Effectiveness</p>
                            <p className="font-bold text-slate-900 dark:text-slate-50">
                              {(mit.effectiveness * 100).toFixed(0)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-600 dark:text-slate-400">Cost Impact</p>
                            <p className={`font-bold ${mit.cost_impact < 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ₹{mit.cost_impact.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-600 dark:text-slate-400">Time Impact</p>
                            <p className={`font-bold ${mit.time_impact < 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {mit.time_impact > 0 ? '+' : ''}{mit.time_impact}h
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <InlineDecisionSummary
        context="risk"
        pageTitle="Auto-Alerts & Mitigation"
      />
    </div>
  )
}
