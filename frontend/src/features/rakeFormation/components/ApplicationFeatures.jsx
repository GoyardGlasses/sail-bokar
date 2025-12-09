import React, { useState, useEffect } from 'react'
import { AlertCircle, TrendingDown, BarChart3, Bell, FileText, Truck } from 'lucide-react'

/**
 * Application Features Component
 * Displays alerts, reports, and real-time tracking
 */
export default function ApplicationFeatures() {
  const [activeTab, setActiveTab] = useState('alerts')
  const [alerts, setAlerts] = useState([])
  const [reports, setReports] = useState([])
  const [tracking, setTracking] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFeatures()
  }, [activeTab])

  const loadFeatures = async () => {
    setLoading(true)
    try {
      if (activeTab === 'alerts') {
        setAlerts(generateAlerts())
      } else if (activeTab === 'reports') {
        setReports(generateReports())
      } else if (activeTab === 'tracking') {
        setTracking(generateTracking())
      }
    } finally {
      setLoading(false)
    }
  }

  const generateAlerts = () => [
    {
      id: 1,
      type: 'warning',
      title: 'High Fuel Surcharge Alert',
      message: 'Fuel prices increased 8% this month. Consider alternative routes.',
      timestamp: new Date(Date.now() - 30 * 60000).toLocaleString(),
      severity: 'high',
      action: 'View Routes',
    },
    {
      id: 2,
      type: 'info',
      title: 'Optimal Dispatch Time',
      message: 'Best time to dispatch: 6:00 AM - 8:00 AM (low traffic)',
      timestamp: new Date(Date.now() - 60 * 60000).toLocaleString(),
      severity: 'medium',
      action: 'Schedule',
    },
    {
      id: 3,
      type: 'success',
      title: 'Cost Optimization Achieved',
      message: 'Saved ₹45,000 using optimized routing for RAKE-001',
      timestamp: new Date(Date.now() - 120 * 60000).toLocaleString(),
      severity: 'low',
      action: 'Details',
    },
    {
      id: 4,
      type: 'warning',
      title: 'Weather Alert',
      message: 'Heavy rain expected on Bokaro-Kolkata route. Delay risk: 35%',
      timestamp: new Date(Date.now() - 180 * 60000).toLocaleString(),
      severity: 'high',
      action: 'Reroute',
    },
  ]

  const generateReports = () => [
    {
      id: 1,
      title: 'Daily Dispatch Summary',
      date: new Date().toLocaleDateString(),
      metrics: {
        'Total Rakes': 8,
        'Total Load': '650 tonnes',
        'Total Cost': '₹5,20,000',
        'Avg Utilization': '87%',
      },
      status: 'completed',
    },
    {
      id: 2,
      title: 'Route Performance Analysis',
      date: new Date(Date.now() - 86400000).toLocaleDateString(),
      metrics: {
        'Best Route': 'Bokaro-Ranchi',
        'Avg Cost': '₹850/tonne',
        'On-Time %': '98%',
        'Avg Delay': '0.2 days',
      },
      status: 'completed',
    },
    {
      id: 3,
      title: 'Cost Optimization Report',
      date: new Date(Date.now() - 172800000).toLocaleDateString(),
      metrics: {
        'Baseline Cost': '₹6,50,000',
        'Optimized Cost': '₹5,52,500',
        'Savings': '₹97,500',
        'Savings %': '15%',
      },
      status: 'completed',
    },
    {
      id: 4,
      title: 'ML Model Performance',
      date: 'Monthly',
      metrics: {
        'Delay Prediction Accuracy': '92%',
        'Cost Prediction Accuracy': '88%',
        'Quality Prediction Accuracy': '85%',
        'Overall Confidence': '88%',
      },
      status: 'completed',
    },
  ]

  const generateTracking = () => [
    {
      id: 1,
      rakeId: 'RAKE-001',
      status: 'in_transit',
      route: 'Bokaro → Kolkata',
      progress: 65,
      currentLocation: 'Hatia Junction',
      eta: '2024-12-03 14:30',
      load: '85 tonnes',
      cost: '₹68,000',
    },
    {
      id: 2,
      rakeId: 'RAKE-002',
      status: 'loading',
      route: 'Bokaro → Ranchi',
      progress: 25,
      currentLocation: 'Bokaro Loading Point 1',
      eta: '2024-12-02 18:00',
      load: '92 tonnes',
      cost: '₹73,600',
    },
    {
      id: 3,
      rakeId: 'RAKE-003',
      status: 'completed',
      route: 'Bokaro → Dhanbad',
      progress: 100,
      currentLocation: 'Dhanbad Siding',
      eta: '2024-12-02 10:15',
      load: '88 tonnes',
      cost: '₹70,400',
    },
    {
      id: 4,
      rakeId: 'RAKE-004',
      status: 'pending',
      route: 'Bokaro → Patna',
      progress: 0,
      currentLocation: 'Bokaro Yard',
      eta: '2024-12-03 06:00',
      load: '90 tonnes',
      cost: '₹72,000',
    },
  ]

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Bell className="w-5 h-5 text-blue-500" />
      case 'success':
        return <TrendingDown className="w-5 h-5 text-green-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_transit':
        return 'bg-blue-100 text-blue-800'
      case 'loading':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Application Features
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time alerts, reports, and tracking for dispatch operations
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'alerts', label: 'Alerts', icon: Bell },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'tracking', label: 'Tracking', icon: Truck },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        ) : activeTab === 'alerts' ? (
          <AlertsView alerts={alerts} getAlertIcon={getAlertIcon} />
        ) : activeTab === 'reports' ? (
          <ReportsView reports={reports} />
        ) : (
          <TrackingView tracking={tracking} getStatusColor={getStatusColor} />
        )}
      </div>
    </div>
  )
}

/**
 * Alerts View Component
 */
function AlertsView({ alerts, getAlertIcon }) {
  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <div className="flex-shrink-0 mt-1">{getAlertIcon(alert.type)}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {alert.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {alert.message}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {alert.timestamp}
            </p>
          </div>
          <button className="flex-shrink-0 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-colors">
            {alert.action}
          </button>
        </div>
      ))}
    </div>
  )
}

/**
 * Reports View Component
 */
function ReportsView({ reports }) {
  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report.id}
          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {report.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {report.date}
              </p>
            </div>
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
              {report.status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(report.metrics).map(([key, value]) => (
              <div key={key} className="p-2 bg-white dark:bg-gray-700 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {key}
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>
          <button className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Download Report →
          </button>
        </div>
      ))}
    </div>
  )
}

/**
 * Tracking View Component
 */
function TrackingView({ tracking, getStatusColor }) {
  return (
    <div className="space-y-4">
      {tracking.map((rake) => (
        <div
          key={rake.id}
          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {rake.rakeId}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {rake.route}
              </p>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(rake.status)}`}>
              {rake.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {rake.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${rake.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Location</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {rake.currentLocation}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">ETA</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {rake.eta}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Load</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {rake.load}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Cost</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {rake.cost}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
