import React, { useState, useEffect } from 'react'
import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-react'

export default function AlertsDisplay() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [dismissedAlerts, setDismissedAlerts] = useState([])

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ml/monitoring/alerts')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.data?.alerts || [])
      } else {
        // Fallback mock alerts
        setAlerts([
          {
            id: 1,
            type: 'error',
            title: 'Data Drift Detected',
            message: 'Delay Prediction Model - Input distribution has changed. Retrain recommended.',
            model: 'Delay Prediction Model',
            timestamp: new Date().toISOString(),
            severity: 'high'
          },
          {
            id: 2,
            type: 'warning',
            title: 'Low Confidence Predictions',
            message: 'Cost Prediction Model - Accuracy below 85%. Review training data.',
            model: 'Cost Prediction Model',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            severity: 'medium'
          },
          {
            id: 3,
            type: 'info',
            title: 'Model Update Available',
            message: 'New version of Risk Assessment Model is ready for deployment.',
            model: 'Risk Assessment Model',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            severity: 'low'
          },
          {
            id: 4,
            type: 'warning',
            title: 'Anomaly Detected',
            message: 'Unusual pattern detected in Vehicle Allocation Model predictions.',
            model: 'Vehicle Allocation Model',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            severity: 'medium'
          },
          {
            id: 5,
            type: 'success',
            title: 'Model Retraining Complete',
            message: 'Demand Forecasting Model successfully retrained with new data.',
            model: 'Demand Forecasting Model',
            timestamp: new Date(Date.now() - 5400000).toISOString(),
            severity: 'low'
          },
        ])
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
      // Use fallback alerts
      setAlerts([
        {
          id: 1,
          type: 'error',
          title: 'Data Drift Detected',
          message: 'Delay Prediction Model - Input distribution has changed.',
          model: 'Delay Prediction Model',
          timestamp: new Date().toISOString(),
          severity: 'high'
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const dismissAlert = (id) => {
    setDismissedAlerts(prev => [...prev, id])
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return <AlertCircle size={20} className="text-red-600" />
      case 'warning': return <AlertTriangle size={20} className="text-orange-600" />
      case 'success': return <CheckCircle size={20} className="text-green-600" />
      case 'info': return <Info size={20} className="text-blue-600" />
      default: return <Info size={20} className="text-slate-600" />
    }
  }

  const getAlertBgColor = (type) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200'
      case 'warning': return 'bg-orange-50 border-orange-200'
      case 'success': return 'bg-green-50 border-green-200'
      case 'info': return 'bg-blue-50 border-blue-200'
      default: return 'bg-slate-50 border-slate-200'
    }
  }

  const getAlertTextColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-900'
      case 'warning': return 'text-orange-900'
      case 'success': return 'text-green-900'
      case 'info': return 'text-blue-900'
      default: return 'text-slate-900'
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (dismissedAlerts.includes(alert.id)) return false
    if (filter === 'all') return true
    return alert.type === filter
  })

  const stats = {
    total: alerts.length,
    errors: alerts.filter(a => a.type === 'error').length,
    warnings: alerts.filter(a => a.type === 'warning').length,
    info: alerts.filter(a => a.type === 'info').length,
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-slate-600">Loading alerts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">ML Alerts</h2>
        <p className="text-slate-600 mt-1">Real-time monitoring and notifications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-sm text-slate-600">Total Alerts</p>
          <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-red-700">Errors</p>
          <p className="text-3xl font-bold text-red-900">{stats.errors}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-sm text-orange-700">Warnings</p>
          <p className="text-3xl font-bold text-orange-900">{stats.warnings}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-700">Info</p>
          <p className="text-3xl font-bold text-blue-900">{stats.info}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'error', 'warning', 'info', 'success'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === type
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <CheckCircle size={32} className="text-green-600 mx-auto mb-3" />
            <p className="text-green-900 font-semibold">All Clear!</p>
            <p className="text-green-700 text-sm mt-1">No alerts to display</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`${getAlertBgColor(alert.type)} border rounded-lg p-4 flex items-start gap-4`}
            >
              <div className="flex-shrink-0 mt-1">
                {getAlertIcon(alert.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`font-semibold ${getAlertTextColor(alert.type)}`}>
                      {alert.title}
                    </p>
                    <p className={`text-sm mt-1 ${getAlertTextColor(alert.type)}`}>
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        alert.severity === 'high' ? 'bg-red-200 text-red-900' :
                        alert.severity === 'medium' ? 'bg-orange-200 text-orange-900' :
                        'bg-blue-200 text-blue-900'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-slate-600">
                        {alert.model}
                      </span>
                      <span className="text-slate-500">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Buttons */}
      {filteredAlerts.length > 0 && (
        <div className="flex gap-3">
          <button
            onClick={fetchAlerts}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={() => setDismissedAlerts([])}
            className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Show All
          </button>
        </div>
      )}
    </div>
  )
}
