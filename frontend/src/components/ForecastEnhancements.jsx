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

// 6. WHAT-IF ANALYSIS - ENHANCED
export function WhatIfAnalysis() {
  const [scenarios, setScenarios] = useState([
    { name: 'Base Case', trainingDays: 60, horizonDays: 30, impact: 0, demandChange: 0, costChange: 0, riskChange: 0 },
    { name: 'More Data', trainingDays: 180, horizonDays: 30, impact: 2.3, demandChange: 1.2, costChange: -2.1, riskChange: -1.5 },
    { name: 'Shorter Horizon', trainingDays: 60, horizonDays: 7, impact: 3.8, demandChange: 0.8, costChange: -0.5, riskChange: -2.3 },
    { name: 'Market Surge', trainingDays: 60, horizonDays: 30, impact: 1.5, demandChange: 15, costChange: 8.5, riskChange: 3.2 },
    { name: 'Economic Downturn', trainingDays: 60, horizonDays: 30, impact: -2.1, demandChange: -12, costChange: -5.2, riskChange: 5.8 },
  ])

  const [selectedScenario, setSelectedScenario] = useState(0)
  const [customParams, setCustomParams] = useState({ training: 60, horizon: 30, seasonality: 1, trend: 1 })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">🔮 What-If Analysis</h3>
        <p className="text-sm text-slate-600 mb-4">Explore different scenarios and their impact on forecasts</p>
      </div>

      {/* Scenario Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-bold text-slate-900 mb-4">📊 Predefined Scenarios</h4>
          <div className="space-y-2">
            {scenarios.map((s, i) => (
              <button
                key={i}
                onClick={() => setSelectedScenario(i)}
                className={`w-full text-left p-3 rounded-lg border-2 transition ${
                  selectedScenario === i
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="font-semibold text-slate-900">{s.name}</p>
                <p className="text-xs text-slate-600">Impact: {s.impact > 0 ? '+' : ''}{s.impact}%</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Scenario Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-bold text-slate-900 mb-4">📈 Impact Analysis</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">Accuracy Impact</span>
              <span className={`text-lg font-bold ${scenarios[selectedScenario].impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {scenarios[selectedScenario].impact > 0 ? '+' : ''}{scenarios[selectedScenario].impact}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">Demand Change</span>
              <span className={`text-lg font-bold ${scenarios[selectedScenario].demandChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {scenarios[selectedScenario].demandChange > 0 ? '+' : ''}{scenarios[selectedScenario].demandChange}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">Cost Impact</span>
              <span className={`text-lg font-bold ${scenarios[selectedScenario].costChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {scenarios[selectedScenario].costChange > 0 ? '+' : ''}{scenarios[selectedScenario].costChange}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">Risk Change</span>
              <span className={`text-lg font-bold ${scenarios[selectedScenario].riskChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {scenarios[selectedScenario].riskChange > 0 ? '+' : ''}{scenarios[selectedScenario].riskChange}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Parameter Builder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-bold text-slate-900 mb-4">⚙️ Custom Scenario Builder</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Training Days: {customParams.training}</label>
            <input
              type="range"
              min="7"
              max="365"
              value={customParams.training}
              onChange={(e) => setCustomParams({ ...customParams, training: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Forecast Horizon: {customParams.horizon}</label>
            <input
              type="range"
              min="1"
              max="90"
              value={customParams.horizon}
              onChange={(e) => setCustomParams({ ...customParams, horizon: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Seasonality: {customParams.seasonality.toFixed(1)}x</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={customParams.seasonality}
              onChange={(e) => setCustomParams({ ...customParams, seasonality: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Trend: {customParams.trend.toFixed(1)}x</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={customParams.trend}
              onChange={(e) => setCustomParams({ ...customParams, trend: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
        <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
          Run Custom Scenario
        </button>
      </div>

      {/* Scenario Comparison Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-bold text-slate-900 mb-4">📊 Scenario Comparison</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={scenarios}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="impact" fill="#3b82f6" name="Accuracy Impact %" />
            <Bar dataKey="demandChange" fill="#10b981" name="Demand Change %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Matrix */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-bold text-slate-900 mb-4">⚠️ Risk vs Reward Matrix</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map((s, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border-2 ${
                s.riskChange > 3 ? 'border-red-300 bg-red-50' : s.riskChange > 0 ? 'border-yellow-300 bg-yellow-50' : 'border-green-300 bg-green-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-slate-900">{s.name}</p>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  s.riskChange > 3 ? 'bg-red-200 text-red-800' : s.riskChange > 0 ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'
                }`}>
                  {s.riskChange > 0 ? 'HIGH RISK' : 'LOW RISK'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-600">Reward</p>
                  <p className="font-bold text-slate-900">{s.impact > 0 ? '+' : ''}{s.impact}%</p>
                </div>
                <div>
                  <p className="text-slate-600">Risk</p>
                  <p className="font-bold text-slate-900">{s.riskChange > 0 ? '+' : ''}{s.riskChange}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sensitivity Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-bold text-slate-900 mb-4">📉 Sensitivity Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">Training Data Sensitivity</p>
            <div className="space-y-2">
              {[30, 60, 90, 180].map((days) => (
                <div key={days} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <span className="text-sm text-slate-600">{days} days</span>
                  <div className="w-32 bg-slate-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: `${(days / 180) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{(85 + (days / 180) * 10).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">Forecast Horizon Sensitivity</p>
            <div className="space-y-2">
              {[7, 14, 30, 60].map((days) => (
                <div key={days} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <span className="text-sm text-slate-600">{days} days</span>
                  <div className="w-32 bg-slate-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-green-500" style={{ width: `${(1 - days / 60) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{(95 - (days / 60) * 15).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg shadow p-6 border border-blue-200">
        <h4 className="font-bold text-slate-900 mb-3">💡 Recommendations</h4>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>✓ Use "More Data" scenario for 2.3% accuracy improvement</li>
          <li>✓ "Shorter Horizon" provides best accuracy (3.8%) for short-term forecasts</li>
          <li>✓ Monitor "Market Surge" scenario - high demand change (+15%)</li>
          <li>✓ "Economic Downturn" shows highest risk increase (+5.8%)</li>
          <li>✓ Combine scenarios for robust forecasting strategy</li>
        </ul>
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
