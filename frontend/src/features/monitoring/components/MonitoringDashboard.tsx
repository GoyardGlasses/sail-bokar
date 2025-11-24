/**
 * Monitoring Dashboard
 * Real-time system metrics and alerts
 */

import React, { useState, useEffect } from 'react'
import { AlertCircle, TrendingUp, Database, Zap, Activity, CheckCircle } from 'lucide-react'
import { metricsService, MetricsSnapshot, Alert } from '../../../services/metrics'

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const snapshot = await metricsService.collectMetrics()
        setMetrics(snapshot)

        const newAlerts = await metricsService.checkAlerts()
        setAlerts(newAlerts)
      } catch (error) {
        console.error('Failed to load metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
    metricsService.startAutoCollection(60000) // Collect every minute

    return () => metricsService.stopAutoCollection()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Activity className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-slate-600 dark:text-slate-400">Loading metrics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">System Monitoring</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Real-time metrics and performance monitoring
        </p>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <AlertCircle size={20} className="text-red-600" />
            Active Alerts ({alerts.length})
          </h2>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === 'P1'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    : alert.severity === 'P2'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      {alert.title}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {alert.message}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      alert.severity === 'P1'
                        ? 'bg-red-200 text-red-800'
                        : alert.severity === 'P2'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-blue-200 text-blue-800'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">On-Time Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {(metrics.kpis.on_time_rate * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Target: 95%</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">Rake Utilization</p>
              <p className="text-2xl font-bold text-blue-600">
                {(metrics.kpis.rake_utilization * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Target: 85%</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">Cost Per Ton</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                ₹{metrics.kpis.cost_per_ton}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Target: ₹950</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">System Uptime</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {metrics.kpis.system_uptime_pct.toFixed(2)}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Target: 99.5%</p>
            </div>
          </div>

          {/* API Metrics */}
          <div className="card">
            <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
              <Zap size={20} />
              API Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-600 dark:text-slate-400">Avg Latency</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {metrics.api.avg_latency_ms.toFixed(0)}ms
                </p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Error Rate</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {(metrics.api.error_rate * 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Total Requests</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {metrics.api.requests_total}
                </p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Errors</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {metrics.api.errors_total}
                </p>
              </div>
            </div>
          </div>

          {/* Inventory Metrics */}
          <div className="card">
            <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Inventory Integration
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-600 dark:text-slate-400">Ingest Latency (P95)</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {metrics.inventory.ingest_latency_p95_ms}ms
                </p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Sync Success Rate</p>
                <p className="text-lg font-bold text-green-600">
                  {(metrics.inventory.sync_success_ratio * 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Records/Minute</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {metrics.inventory.records_per_minute}
                </p>
              </div>
            </div>
          </div>

          {/* Database Metrics */}
          <div className="card">
            <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
              <Database size={20} />
              Database Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-600 dark:text-slate-400">Total Rows</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {metrics.database.total_rows.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Total Size</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {metrics.database.total_size_mb.toFixed(0)}MB
                </p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Query P95</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {metrics.database.query_p95_ms.toFixed(0)}ms
                </p>
              </div>
            </div>
          </div>

          {/* Model Metrics */}
          <div className="card">
            <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
              <CheckCircle size={20} />
              ML Models Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-600 dark:text-slate-400">Avg Inference (P95)</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {metrics.models.avg_inference_p95_ms.toFixed(0)}ms
                </p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Avg Accuracy</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {(metrics.models.avg_accuracy * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400">Drift Alerts</p>
                <p
                  className={`text-lg font-bold ${
                    metrics.models.drift_alerts > 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {metrics.models.drift_alerts}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
          </div>
        </>
      )}
    </div>
  )
}
