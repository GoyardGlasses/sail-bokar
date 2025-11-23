/**
 * Real-Time Alerts Component
 * Monitor active shipments and display alerts
 */

import React, { useState } from 'react'
import { Bell, AlertTriangle, CheckCircle } from 'lucide-react'

export default function RealTimeAlerts() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      route: 'Bokaro->Dhanbad',
      severity: 'high',
      message: 'High delay risk detected (85%)',
      timestamp: new Date(Date.now() - 5 * 60000),
      status: 'active',
    },
    {
      id: 2,
      route: 'Bokaro->Hatia',
      severity: 'medium',
      message: 'Weather deteriorating - Rainy conditions expected',
      timestamp: new Date(Date.now() - 15 * 60000),
      status: 'active',
    },
    {
      id: 3,
      route: 'Bokaro->Kolkata',
      severity: 'low',
      message: 'Optimal conditions for dispatch',
      timestamp: new Date(Date.now() - 30 * 60000),
      status: 'resolved',
    },
  ])

  const handleDismiss = (id) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, status: 'dismissed' } : a)))
  }

  const handleSnooze = (id) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, status: 'snoozed' } : a)))
  }

  const activeAlerts = alerts.filter((a) => a.status === 'active')
  const severityColor = {
    high: 'bg-red-50 border-red-200',
    medium: 'bg-orange-50 border-orange-200',
    low: 'bg-green-50 border-green-200',
  }
  const severityBadge = {
    high: 'bg-red-200 text-red-800',
    medium: 'bg-orange-200 text-orange-800',
    low: 'bg-green-200 text-green-800',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-slate-900">Real-Time Alerts</h2>
        <span className="text-sm font-medium text-slate-600">{activeAlerts.length} Active</span>
      </div>

      {activeAlerts.length === 0 ? (
        <div className="card bg-green-50 border border-green-200 p-6 text-center">
          <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
          <p className="text-green-900 font-medium">All systems normal - No active alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeAlerts.map((alert) => (
            <div key={alert.id} className={`card border-2 ${severityColor[alert.severity]} p-4`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell size={18} className={alert.severity === 'high' ? 'text-red-600' : alert.severity === 'medium' ? 'text-orange-600' : 'text-green-600'} />
                    <span className={`text-xs font-bold px-2 py-1 rounded ${severityBadge[alert.severity]}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-medium text-slate-900">{alert.route}</p>
                  <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleSnooze(alert.id)}
                    className="btn btn-sm btn-outline text-slate-600"
                  >
                    Snooze
                  </button>
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="btn btn-sm btn-outline text-red-600"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert History */}
      <div className="card mt-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Alert History</h3>
        <div className="space-y-2">
          {alerts.filter((a) => a.status !== 'active').map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-900">{alert.route}</p>
                <p className="text-xs text-slate-500">{alert.timestamp.toLocaleString()}</p>
              </div>
              <span className="text-xs font-medium text-slate-600 bg-slate-200 px-2 py-1 rounded">
                {alert.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
