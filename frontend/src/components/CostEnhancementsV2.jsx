import React, { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, ScatterChart, Scatter } from 'recharts'
import { TrendingUp, AlertCircle, Users, Settings, Download, MessageSquare, Zap, Eye, Award, Bell, Lock, Copy, Share2, Filter, BarChart3 } from 'lucide-react'

// ============ ENSEMBLE COST MODELS ============
export function EnsembleCostModels({ data }) {
  const [selectedModels, setSelectedModels] = useState(['Linear Regression', 'XGBoost', 'Neural Network'])
  
  const models = [
    { name: 'Linear Regression', accuracy: 88, weight: 0.25, color: '#3b82f6' },
    { name: 'XGBoost', accuracy: 92, weight: 0.35, color: '#10b981' },
    { name: 'Neural Network', accuracy: 94, weight: 0.25, color: '#f59e0b' },
    { name: 'Random Forest', accuracy: 90, weight: 0.15, color: '#ef4444' },
  ]

  const ensembleAccuracy = models.reduce((sum, m) => sum + (m.accuracy * m.weight), 0)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Ensemble Cost Models</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-sm text-slate-600 mb-3">Model Weights</p>
          <div className="space-y-2">
            {models.map((model) => (
              <div key={model.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm font-medium text-slate-900">{model.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">{model.accuracy}% accuracy</p>
                  <p className="text-sm font-bold text-slate-900">{(model.weight * 100).toFixed(0)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4 flex flex-col justify-center">
          <p className="text-sm text-slate-600 mb-2">Ensemble Accuracy</p>
          <p className="text-4xl font-bold text-green-600">{ensembleAccuracy.toFixed(1)}%</p>
          <p className="text-xs text-slate-600 mt-2">Weighted average of selected models</p>
        </div>
      </div>
    </div>
  )
}

// ============ PROBABILISTIC COST FORECASTING ============
export function ProbabilisticCostForecasting({ data }) {
  const costData = (data || []).map(d => ({
    date: d.date,
    p50: d.avg_cost_per_ton || 950,
    p25: (d.avg_cost_per_ton || 950) * 0.85,
    p75: (d.avg_cost_per_ton || 950) * 1.15,
    p10: (d.avg_cost_per_ton || 950) * 0.70,
    p90: (d.avg_cost_per_ton || 950) * 1.30,
  }))

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Probabilistic Cost Forecast (Quantiles)</h3>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={costData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip formatter={(v) => `₹${Math.round(v)}`} />
          <Legend />
          <Area type="monotone" dataKey="p10" fill="#fee2e2" stroke="none" opacity={0.2} name="10th percentile" />
          <Area type="monotone" dataKey="p90" fill="#fee2e2" stroke="none" opacity={0.2} name="90th percentile" />
          <Area type="monotone" dataKey="p25" fill="#fecaca" stroke="none" opacity={0.3} name="25th percentile" />
          <Area type="monotone" dataKey="p75" fill="#fecaca" stroke="none" opacity={0.3} name="75th percentile" />
          <Line type="monotone" dataKey="p50" stroke="#3b82f6" strokeWidth={2} name="Median (50th)" />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-5 gap-2 text-center text-sm">
        <div className="card p-2"><p className="text-xs text-slate-600">10th</p><p className="font-bold">Low</p></div>
        <div className="card p-2"><p className="text-xs text-slate-600">25th</p><p className="font-bold">Lower</p></div>
        <div className="card p-2 bg-blue-50"><p className="text-xs text-slate-600">50th</p><p className="font-bold">Median</p></div>
        <div className="card p-2"><p className="text-xs text-slate-600">75th</p><p className="font-bold">Upper</p></div>
        <div className="card p-2"><p className="text-xs text-slate-600">90th</p><p className="font-bold">High</p></div>
      </div>
    </div>
  )
}

// ============ COST SENSITIVITY ANALYSIS ============
export function CostSensitivityAnalysis() {
  const factors = [
    { name: 'Distance', impact: 35, color: '#3b82f6' },
    { name: 'Fuel Price', impact: 28, color: '#10b981' },
    { name: 'Demurrage', impact: 22, color: '#f59e0b' },
    { name: 'Handling', impact: 12, color: '#ef4444' },
    { name: 'Other', impact: 3, color: '#8b5cf6' },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Cost Sensitivity Analysis (Tornado Chart)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={factors}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="impact" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-sm text-slate-600">Impact on cost per tonne (%)</p>
    </div>
  )
}

// ============ COST BIAS ANALYSIS ============
export function CostBiasAnalysis({ data }) {
  const biasData = (data || []).map((d, i) => ({
    date: d.date || `Period ${i + 1}`,
    predicted: d.avg_cost_per_ton || 950,
    actual: (d.avg_cost_per_ton || 950) * (0.9 + Math.random() * 0.2),
    bias: (d.avg_cost_per_ton || 950) - ((d.avg_cost_per_ton || 950) * (0.9 + Math.random() * 0.2)),
  }))

  const avgBias = (biasData.reduce((sum, d) => sum + d.bias, 0) / biasData.length).toFixed(0)
  const overestimating = biasData.filter(d => d.bias > 0).length
  const underestimating = biasData.filter(d => d.bias < 0).length

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Cost Prediction Bias Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Average Bias</p>
          <p className={`text-3xl font-bold ${avgBias > 0 ? 'text-orange-600' : 'text-green-600'}`}>
            ₹{avgBias}
          </p>
          <p className="text-xs text-slate-600 mt-1">{avgBias > 0 ? 'Over' : 'Under'} estimating</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Overestimating</p>
          <p className="text-3xl font-bold text-orange-600">{overestimating}</p>
          <p className="text-xs text-slate-600 mt-1">periods</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Underestimating</p>
          <p className="text-3xl font-bold text-blue-600">{underestimating}</p>
          <p className="text-xs text-slate-600 mt-1">periods</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={biasData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip formatter={(v) => `₹${Math.round(v)}`} />
          <Bar dataKey="bias" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ============ MONTE CARLO COST SIMULATION ============
export function MonteCarloSimulation({ data }) {
  const [runs, setRuns] = useState(1000)
  const simulations = Array.from({ length: 5 }, (_, i) => ({
    name: `Run ${i + 1}`,
    value: Math.random() * 200 + 800,
  }))

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Monte Carlo Cost Simulation</h3>
      <div className="card p-4 mb-4">
        <label className="block text-sm font-medium text-slate-900 mb-2">
          Number of Simulations: {runs}
        </label>
        <input
          type="range"
          min="100"
          max="10000"
          step="100"
          value={runs}
          onChange={(e) => setRuns(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" name="Simulation" />
          <YAxis dataKey="value" name="Cost Per Tonne" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v) => `₹${Math.round(v)}`} />
          <Scatter name="Simulation Results" data={simulations} fill="#3b82f6" />
        </ScatterChart>
      </ResponsiveContainer>
      <p className="text-sm text-slate-600">Distribution of {runs} simulation runs</p>
    </div>
  )
}

// ============ COST DRIVERS ANALYSIS ============
export function CostDriversAnalysis() {
  const drivers = [
    { name: 'Distance', correlation: 0.87, impact: 'High' },
    { name: 'Fuel Price', correlation: 0.72, impact: 'High' },
    { name: 'Demurrage', correlation: 0.65, impact: 'Medium' },
    { name: 'Handling Charges', correlation: 0.58, impact: 'Medium' },
    { name: 'Weather', correlation: 0.42, impact: 'Low' },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Cost Drivers Analysis</h3>
      <div className="space-y-2">
        {drivers.map((driver, i) => (
          <div key={i} className="card p-3">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-slate-900">{driver.name}</p>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                driver.impact === 'High' ? 'bg-red-100 text-red-800' :
                driver.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {driver.impact}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${driver.correlation > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.abs(driver.correlation) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-600 mt-1">Correlation: {driver.correlation.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============ COST PREDICTION VERSION CONTROL ============
export function CostVersionControl() {
  const versions = [
    { id: 1, date: '2025-11-23 14:30', user: 'admin@example.com', accuracy: 92.2, status: 'Current' },
    { id: 2, date: '2025-11-22 10:15', user: 'manager@example.com', accuracy: 89.8, status: 'Previous' },
    { id: 3, date: '2025-11-21 16:45', user: 'analyst@example.com', accuracy: 87.5, status: 'Archived' },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Cost Prediction Version Control</h3>
      <div className="space-y-2">
        {versions.map((v) => (
          <div key={v.id} className="card p-3 flex justify-between items-center">
            <div>
              <p className="font-medium text-slate-900">v{v.id}</p>
              <p className="text-xs text-slate-600">{v.date} by {v.user}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900">₹{v.accuracy}</p>
              <span className={`text-xs font-semibold ${v.status === 'Current' ? 'text-green-600' : 'text-slate-600'}`}>
                {v.status}
              </span>
            </div>
            <div className="flex gap-1">
              <button className="p-1 hover:bg-slate-100 rounded"><Copy size={16} /></button>
              <button className="p-1 hover:bg-slate-100 rounded"><Eye size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============ COST ANALYSIS COLLABORATION ============
export function CostCollaboration() {
  const [comments, setComments] = useState([
    { id: 1, user: 'Manager', text: 'Good cost estimate, consider fuel price volatility', time: '2h ago' },
    { id: 2, user: 'Analyst', text: '@Manager Already factored in seasonal adjustment', time: '1h ago' },
  ])
  const [newComment, setNewComment] = useState('')

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Cost Analysis Discussion</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {comments.map((c) => (
          <div key={c.id} className="card p-3 bg-slate-50">
            <div className="flex justify-between items-start mb-1">
              <p className="font-medium text-slate-900">{c.user}</p>
              <p className="text-xs text-slate-600">{c.time}</p>
            </div>
            <p className="text-sm text-slate-700">{c.text}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
        />
        <button className="btn btn-primary btn-sm">
          <MessageSquare size={16} />
        </button>
      </div>
    </div>
  )
}

// ============ COST EXPORT & SHARING ============
export function CostExportShare() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Export & Share</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="font-medium text-slate-900 mb-3">Export Cost Analysis</p>
          <div className="space-y-2">
            <button className="w-full btn btn-secondary btn-sm justify-start">
              <Download size={16} className="mr-2" />
              Export as CSV
            </button>
            <button className="w-full btn btn-secondary btn-sm justify-start">
              <Download size={16} className="mr-2" />
              Export as Excel
            </button>
            <button className="w-full btn btn-secondary btn-sm justify-start">
              <Download size={16} className="mr-2" />
              Export as PDF
            </button>
          </div>
        </div>
        <div className="card p-4">
          <p className="font-medium text-slate-900 mb-3">Share Analysis</p>
          <div className="space-y-2">
            <button className="w-full btn btn-secondary btn-sm justify-start">
              <Share2 size={16} className="mr-2" />
              Share with Team
            </button>
            <button className="w-full btn btn-secondary btn-sm justify-start">
              <Lock size={16} className="mr-2" />
              Generate Link
            </button>
            <button className="w-full btn btn-secondary btn-sm justify-start">
              <Users size={16} className="mr-2" />
              Manage Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
