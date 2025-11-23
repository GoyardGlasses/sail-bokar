import React, { useState } from 'react'
import { AlertCircle, Bell, FileText, Brain, TrendingUp } from 'lucide-react'

// ============ ADVANCED ANALYTICS ============
export function AdvancedAnalytics() {
  const correlationMatrix = [
    { factor: 'Distance', correlation: 0.87, strength: 'Very Strong' },
    { factor: 'Fuel Price', correlation: 0.72, strength: 'Strong' },
    { factor: 'Demurrage', correlation: 0.65, strength: 'Moderate' },
    { factor: 'Handling', correlation: 0.58, strength: 'Moderate' },
    { factor: 'Weather', correlation: 0.35, strength: 'Weak' },
  ]

  const outliers = [
    { date: '2025-11-15', cost: 1250, reason: 'Fuel price spike', severity: 'High' },
    { date: '2025-11-10', cost: 1180, reason: 'Extended demurrage', severity: 'Medium' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Advanced Analytics</h3>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Correlation Analysis</p>
        <div className="space-y-2">
          {correlationMatrix.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <p className="text-sm font-medium text-slate-900">{item.factor}</p>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${item.correlation * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm font-bold text-slate-900 w-20">{item.correlation.toFixed(2)}</p>
                <p className="text-xs text-slate-600 w-24">{item.strength}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Anomaly Detection</p>
        <div className="space-y-2">
          {outliers.map((outlier, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-orange-50 rounded border-l-4 border-orange-500">
              <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-slate-900">{outlier.date}</p>
                <p className="text-sm text-slate-600">{outlier.reason}</p>
                <p className="text-sm font-bold text-orange-600">₹{outlier.cost}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                outlier.severity === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {outlier.severity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ REAL-TIME MONITORING ============
export function RealTimeMonitoring() {
  const [alerts] = useState([
    { id: 1, type: 'Cost Alert', message: 'Cost exceeded threshold by 5%', severity: 'High', time: '2 min ago' },
    { id: 2, type: 'Trend Alert', message: 'Upward trend detected in fuel prices', severity: 'Medium', time: '15 min ago' },
    { id: 3, type: 'Anomaly', message: 'Unusual spike in demurrage charges', severity: 'High', time: '1 hour ago' },
  ])

  const kpis = [
    { label: 'Current Cost', value: '₹950', trend: '+2.1%', status: 'warning' },
    { label: 'Daily Avg', value: '₹945', trend: '-0.5%', status: 'normal' },
    { label: 'Weekly Avg', value: '₹935', trend: '+1.6%', status: 'warning' },
    { label: 'Monthly Avg', value: '₹920', trend: '+3.3%', status: 'alert' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Real-Time Monitoring & Alerts</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <div key={i} className={`card p-3 ${
            kpi.status === 'alert' ? 'bg-red-50' : kpi.status === 'warning' ? 'bg-orange-50' : 'bg-green-50'
          }`}>
            <p className="text-xs text-slate-600">{kpi.label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{kpi.value}</p>
            <p className={`text-xs font-semibold mt-1 ${
              kpi.trend.startsWith('+') ? 'text-red-600' : 'text-green-600'
            }`}>
              {kpi.trend}
            </p>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Active Alerts</p>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded border-l-4 border-orange-500">
              <Bell size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-slate-900">{alert.type}</p>
                <p className="text-sm text-slate-600">{alert.message}</p>
                <p className="text-xs text-slate-500 mt-1">{alert.time}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${
                alert.severity === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {alert.severity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ REPORTING & INSIGHTS ============
export function ReportingInsights() {
  const insights = [
    {
      title: 'Cost Reduction Opportunity',
      description: 'Switching to Route B can save 12% on transportation costs',
      impact: 'High',
      action: 'Review Route B details',
    },
    {
      title: 'Seasonal Pattern Detected',
      description: 'Q2 typically sees 8% higher costs due to increased demand',
      impact: 'Medium',
      action: 'Plan ahead for Q2',
    },
    {
      title: 'Supplier Performance',
      description: 'Supplier C offers 10% better rates than current supplier',
      impact: 'High',
      action: 'Negotiate with Supplier C',
    },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Reporting & Insights</h3>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div key={i} className="card p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-2">
              <p className="font-bold text-slate-900">{insight.title}</p>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                insight.impact === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {insight.impact} Impact
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-3">{insight.description}</p>
            <button className="text-sm text-blue-600 font-medium hover:underline">{insight.action} →</button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button className="card p-4 text-center hover:bg-slate-50 transition">
          <FileText size={24} className="mx-auto mb-2 text-blue-600" />
          <p className="font-medium text-slate-900">Executive Summary</p>
          <p className="text-xs text-slate-600 mt-1">1-page overview</p>
        </button>
        <button className="card p-4 text-center hover:bg-slate-50 transition">
          <FileText size={24} className="mx-auto mb-2 text-green-600" />
          <p className="font-medium text-slate-900">Detailed Report</p>
          <p className="text-xs text-slate-600 mt-1">Full analysis</p>
        </button>
        <button className="card p-4 text-center hover:bg-slate-50 transition">
          <FileText size={24} className="mx-auto mb-2 text-purple-600" />
          <p className="font-medium text-slate-900">Custom Report</p>
          <p className="text-xs text-slate-600 mt-1">Build your own</p>
        </button>
      </div>
    </div>
  )
}

// ============ ADVANCED ML FEATURES ============
export function AdvancedMLFeatures() {
  const mlModels = [
    { name: 'Demand Forecasting', accuracy: 91, status: 'Active', nextUpdate: '2h' },
    { name: 'Price Prediction', accuracy: 87, status: 'Active', nextUpdate: '4h' },
    { name: 'Anomaly Detection', accuracy: 94, status: 'Active', nextUpdate: '1h' },
    { name: 'Clustering Analysis', accuracy: 89, status: 'Inactive', nextUpdate: 'N/A' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Advanced ML Features</h3>

      <div className="space-y-2">
        {mlModels.map((model, i) => (
          <div key={i} className="card p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  <Brain size={18} className="text-purple-600" />
                  {model.name}
                </p>
                <p className="text-xs text-slate-600 mt-1">ML Model</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                model.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
              }`}>
                {model.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-900">Accuracy: {model.accuracy}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${model.accuracy}%` }}></div>
                </div>
              </div>
              <p className="text-xs text-slate-600 ml-3 whitespace-nowrap">Next: {model.nextUpdate}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 bg-blue-50">
        <p className="text-sm font-medium text-slate-900 mb-2">ML Insights</p>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>✓ Demand forecasting predicts 15% increase in Q2</li>
          <li>✓ Price prediction suggests optimal buying window in 3 weeks</li>
          <li>✓ Anomaly detection identified 2 unusual cost spikes</li>
        </ul>
      </div>
    </div>
  )
}
