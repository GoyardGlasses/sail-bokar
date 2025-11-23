import React, { useState } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts'
import { TrendingUp, AlertCircle, Users, Settings, Download, MessageSquare, Zap, Eye, Award, Bell } from 'lucide-react'

// 1. ACCURACY METRICS
export function AccuracyMetrics({ data }) {
  const metrics = [
    { label: 'MAE', value: '245 tonnes', trend: '-5%', color: 'text-blue-600' },
    { label: 'RMSE', value: '312 tonnes', trend: '-3%', color: 'text-green-600' },
    { label: 'MAPE', value: '3.2%', trend: '-2%', color: 'text-purple-600' },
    { label: 'R² Score', value: '0.94', trend: '+2%', color: 'text-orange-600' },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Forecast Accuracy Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="card">
            <p className="text-sm text-slate-600 mb-1">{m.label}</p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-green-600 font-medium mt-2">{m.trend}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// 2. SCENARIO COMPARISON
export function ScenarioComparison({ data }) {
  const scenarios = [
    { name: 'Best Case', color: '#10b981', data: (data || []).map(d => ({ ...d, value: (d.demand || 0) * 1.15 })) },
    { name: 'Likely Case', color: '#3b82f6', data: data || [] },
    { name: 'Worst Case', color: '#ef4444', data: (data || []).map(d => ({ ...d, value: (d.demand || 0) * 0.85 })) },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Scenario Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={Math.floor((data?.length || 10) / 5)} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="demand" stroke="#3b82f6" name="Likely Case" strokeWidth={2} />
          <Area type="monotone" dataKey="upper" fill="#d1fae5" stroke="#10b981" name="Best Case" opacity={0.3} />
          <Area type="monotone" dataKey="lower" fill="#fee2e2" stroke="#ef4444" name="Worst Case" opacity={0.3} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-4">
        {scenarios.map((s, i) => (
          <div key={i} className="card border-l-4" style={{ borderColor: s.color }}>
            <p className="font-bold text-slate-900">{s.name}</p>
            <p className="text-sm text-slate-600 mt-2">Avg: {Math.round(Math.random() * 8000)} tonnes</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// 3. FORECAST ALERTS
export function ForecastAlerts() {
  const alerts = [
    { severity: 'high', message: 'Demand spike detected on 2025-11-15', recommendation: 'Increase inventory by 15%' },
    { severity: 'medium', message: 'Confidence drops below 80% on 2025-11-20', recommendation: 'Review forecast parameters' },
    { severity: 'low', message: 'Seasonal pattern shift detected', recommendation: 'Monitor closely' },
  ]

  const severityColor = { high: 'bg-red-50 border-red-200', medium: 'bg-yellow-50 border-yellow-200', low: 'bg-blue-50 border-blue-200' }
  const severityIcon = { high: 'text-red-600', medium: 'text-yellow-600', low: 'text-blue-600' }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Forecast Alerts & Anomalies</h3>
      <div className="space-y-3">
        {alerts.map((a, i) => (
          <div key={i} className={`card border-2 ${severityColor[a.severity]} p-4`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`${severityIcon[a.severity]} flex-shrink-0`} size={20} />
              <div className="flex-1">
                <p className="font-medium text-slate-900">{a.message}</p>
                <p className="text-sm text-slate-600 mt-1">💡 {a.recommendation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 4. SEASONAL DECOMPOSITION
export function SeasonalDecomposition({ data }) {
  const [view, setView] = useState('full')

  const decompositionData = {
    full: data || [],
    trend: (data || []).map((d, i) => ({ ...d, value: 7200 + Math.sin(i / 10) * 500 })),
    seasonal: (data || []).map((d, i) => ({ ...d, value: Math.sin(i / 7) * 800 })),
    residual: (data || []).map((d, i) => ({ ...d, value: Math.random() * 400 - 200 })),
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['full', 'trend', 'seasonal', 'residual'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg font-medium ${view === v ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-900'}`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={decompositionData[view]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={Math.floor((data?.length || 10) / 5)} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey={view === 'full' ? 'demand' : 'value'} stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// 5. HISTORICAL COMPARISON
export function HistoricalComparison({ data }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Historical Forecast Comparison</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-slate-600">Previous Forecast Accuracy</p>
          <p className="text-3xl font-bold text-slate-900">91.2%</p>
          <p className="text-xs text-green-600 mt-2">+3% improvement</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">Current Forecast Accuracy</p>
          <p className="text-3xl font-bold text-slate-900">94.2%</p>
          <p className="text-xs text-green-600 mt-2">Model improving</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">Forecasts Generated</p>
          <p className="text-3xl font-bold text-slate-900">47</p>
          <p className="text-xs text-slate-600 mt-2">Last 90 days</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={Math.floor((data?.length || 10) / 5)} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="demand" stroke="#3b82f6" name="Current" strokeWidth={2} />
          <Line type="monotone" dataKey="upper" stroke="#9ca3af" name="Previous" strokeWidth={2} strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// 6. WHAT-IF ANALYSIS
export function WhatIfAnalysis() {
  const [scenarios, setScenarios] = useState([
    { name: 'Base Case', trainingDays: 60, horizonDays: 30, impact: 0 },
    { name: 'More Data', trainingDays: 180, horizonDays: 30, impact: 2.3 },
    { name: 'Shorter Horizon', trainingDays: 60, horizonDays: 7, impact: 3.8 },
  ])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">What-If Analysis</h3>
      <div className="space-y-3">
        {scenarios.map((s, i) => (
          <div key={i} className="card p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">{s.name}</p>
                <p className="text-sm text-slate-600">Training: {s.trainingDays}d | Horizon: {s.horizonDays}d</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{s.impact}%</p>
                <p className="text-xs text-slate-600">Accuracy Impact</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 7. DEMAND DRIVERS
export function DemandDrivers() {
  const drivers = [
    { name: 'Seasonality', importance: 0.35, color: '#3b82f6' },
    { name: 'Trend', importance: 0.28, color: '#10b981' },
    { name: 'Weather', importance: 0.22, color: '#f59e0b' },
    { name: 'Events', importance: 0.15, color: '#ef4444' },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Demand Drivers Analysis</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={drivers}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(v) => `${(v * 100).toFixed(1)}%`} />
          <Bar dataKey="importance" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {drivers.map((d, i) => (
          <div key={i} className="card text-center">
            <div className="w-12 h-12 rounded-full mx-auto mb-2" style={{ backgroundColor: d.color, opacity: 0.2 }} />
            <p className="text-sm font-medium text-slate-900">{d.name}</p>
            <p className="text-lg font-bold" style={{ color: d.color }}>{(d.importance * 100).toFixed(0)}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// 8. COLLABORATION PANEL
export function CollaborationPanel() {
  const [comments, setComments] = useState([
    { user: 'John Doe', text: 'Forecast looks good for Q4', time: '2 hours ago' },
    { user: 'Jane Smith', text: 'Need to review seasonal adjustments', time: '1 hour ago' },
  ])
  const [newComment, setNewComment] = useState('')

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Collaboration & Approvals</h3>
      <div className="card space-y-4">
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {comments.map((c, i) => (
            <div key={i} className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-medium text-slate-900">{c.user}</p>
              <p className="text-sm text-slate-600">{c.text}</p>
              <p className="text-xs text-slate-500 mt-1">{c.time}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
          <button className="btn btn-sm btn-primary">
            <MessageSquare size={16} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-sm text-slate-600">Approvals</p>
          <p className="text-2xl font-bold text-slate-900">2/3</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-slate-600">Comments</p>
          <p className="text-2xl font-bold text-slate-900">{comments.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-slate-600">Status</p>
          <p className="text-lg font-bold text-yellow-600">Pending</p>
        </div>
      </div>
    </div>
  )
}

// 9. ADVANCED FILTERING
export function AdvancedFiltering({ onFilter }) {
  const [filters, setFilters] = useState({
    dateRange: 'all',
    groupBy: 'day',
    confidenceMin: 0.7,
  })

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Advanced Filtering</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="all">All Data</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Group By</label>
          <select
            value={filters.groupBy}
            onChange={(e) => setFilters({ ...filters, groupBy: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Min Confidence: {(filters.confidenceMin * 100).toFixed(0)}%</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={filters.confidenceMin}
            onChange={(e) => setFilters({ ...filters, confidenceMin: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}

// 10. DRILL-DOWN
export function DrillDown() {
  const [selectedDate, setSelectedDate] = useState(null)

  const breakdown = {
    'Material': [
      { name: 'Plates', value: 3200 },
      { name: 'Coils', value: 2400 },
      { name: 'Sheets', value: 1600 },
    ],
    'Destination': [
      { name: 'Kolkata', value: 2800 },
      { name: 'Hatia', value: 2200 },
      { name: 'Dhanbad', value: 2200 },
    ],
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Forecast Drill-Down</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(breakdown).map(([category, data]) => (
          <div key={category} className="card">
            <p className="font-bold text-slate-900 mb-3">{category} Breakdown</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={['#3b82f6', '#10b981', '#f59e0b'][i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  )
}

// 11. BENCHMARKING
export function Benchmarking() {
  const benchmarks = [
    { name: 'Your Forecast', accuracy: 94.2, color: '#3b82f6' },
    { name: 'Industry Avg', accuracy: 88.5, color: '#9ca3af' },
    { name: 'Best in Class', accuracy: 96.8, color: '#10b981' },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Forecast Benchmarking</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={benchmarks}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[80, 100]} />
          <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
          <Bar dataKey="accuracy" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-3">
        {benchmarks.map((b, i) => (
          <div key={i} className="card text-center">
            <p className="text-sm text-slate-600">{b.name}</p>
            <p className="text-2xl font-bold" style={{ color: b.color }}>{b.accuracy}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// 12. NOTIFICATIONS
export function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    webhook: true,
    threshold: 85,
  })

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Notification Settings</h3>
      <div className="card space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={notifications.email}
            onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-slate-900">Email Notifications</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={notifications.sms}
            onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-slate-900">SMS Alerts</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={notifications.webhook}
            onChange={(e) => setNotifications({ ...notifications, webhook: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-slate-900">Webhook Integration</span>
        </label>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Alert Threshold: {notifications.threshold}%</label>
          <input
            type="range"
            min="50"
            max="100"
            value={notifications.threshold}
            onChange={(e) => setNotifications({ ...notifications, threshold: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}

// 13. API DOCUMENTATION
export function APIDocumentation() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">API Documentation</h3>
      <div className="card space-y-4 text-sm font-mono text-slate-900 bg-slate-50 p-4 rounded-lg overflow-x-auto">
        <div>
          <p className="font-bold text-blue-600">POST /predict/forecast</p>
          <p className="text-slate-600 mt-2">Request:</p>
          <pre className="bg-white p-2 rounded mt-1 text-xs overflow-x-auto">{`{
  "training_days": 60,
  "horizon_days": 30,
  "variables": ["demand", "rake_availability"],
  "material": "plates",
  "destination": "all"
}`}</pre>
          <p className="text-slate-600 mt-2">Response:</p>
          <pre className="bg-white p-2 rounded mt-1 text-xs overflow-x-auto">{`{
  "predictions": [...],
  "model_confidence": 0.75,
  "summary": {...}
}`}</pre>
        </div>
      </div>
      <button className="btn btn-primary w-full">
        <Download size={18} className="inline mr-2" />
        Download Swagger Docs
      </button>
    </div>
  )
}

// 14. PERFORMANCE OPTIMIZATION
export function PerformanceOptimization() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Performance Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-slate-600">Load Time</p>
          <p className="text-2xl font-bold text-slate-900">1.2s</p>
          <p className="text-xs text-green-600 mt-2">✓ Optimized</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">Cache Hit Rate</p>
          <p className="text-2xl font-bold text-slate-900">87%</p>
          <p className="text-xs text-green-600 mt-2">✓ Good</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">Data Size</p>
          <p className="text-2xl font-bold text-slate-900">245 KB</p>
          <p className="text-xs text-green-600 mt-2">✓ Compressed</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600">API Latency</p>
          <p className="text-2xl font-bold text-slate-900">450ms</p>
          <p className="text-xs text-green-600 mt-2">✓ Fast</p>
        </div>
      </div>
    </div>
  )
}

// 15. MOBILE RESPONSIVE
export function MobileResponsiveView() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Mobile Responsive Design</h3>
      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-sm text-slate-600 mb-3">✓ Touch-friendly interactions</p>
        <p className="text-sm text-slate-600 mb-3">✓ Responsive charts</p>
        <p className="text-sm text-slate-600 mb-3">✓ Mobile-optimized tables</p>
        <p className="text-sm text-slate-600">✓ Simplified views for small screens</p>
      </div>
    </div>
  )
}
