import React, { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts'
import { CheckCircle, AlertCircle, TrendingUp, Download, Share2, GitBranch, MessageSquare, Eye } from 'lucide-react'

// ============ SCENARIO BACKTESTING ============
export function ScenarioBacktesting() {
  const [backtest] = useState({
    totalScenarios: 250,
    accurateScenarios: 235,
    accuracy: 94,
    mape: 3.8,
    rmse: 1250,
  })

  const backtestData = [
    { period: 'Q1 2025', predicted: 42000, actual: 41200, error: 1.9 },
    { period: 'Q2 2025', predicted: 45000, actual: 46800, error: 3.8 },
    { period: 'Q3 2025', predicted: 48000, actual: 47500, error: 1.0 },
    { period: 'Q4 2025', predicted: 50000, actual: 51200, error: 2.3 },
  ]

  const improvementSuggestions = [
    { area: 'Demand Forecasting', current: 91, potential: 96, gap: 5 },
    { area: 'Cost Estimation', current: 93, potential: 97, gap: 4 },
    { area: 'Time Prediction', current: 89, potential: 95, gap: 6 },
    { area: 'Risk Assessment', current: 92, potential: 96, gap: 4 },
  ]

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Scenario Backtesting</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Total Scenarios Tested</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{backtest.totalScenarios}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Accurate Predictions</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{backtest.accurateScenarios}</p>
          <p className="text-xs text-slate-600 mt-1">{backtest.accuracy}% accuracy</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Mean Absolute Error</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{backtest.mape}%</p>
        </div>
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Historical Accuracy</p>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={backtestData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} name="Predicted" />
            <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" />
            <Bar dataKey="error" fill="#f59e0b" name="Error %" opacity={0.6} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Improvement Opportunities</p>
        <div className="space-y-2">
          {improvementSuggestions.map((s, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium text-slate-900">{s.area}</p>
                <span className="text-xs font-bold text-orange-600">+{s.gap}% potential</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${s.current}%` }} />
                </div>
                <span className="text-sm font-bold text-slate-900">{s.current}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ ADVANCED RISK ANALYSIS ============
export function AdvancedRiskAnalysis() {
  const [riskMetrics] = useState({
    var95: 48900,
    cvar95: 51200,
    var99: 52800,
    cvar99: 54500,
  })

  const riskData = [
    { percentile: '50th', value: 42350 },
    { percentile: '75th', value: 45200 },
    { percentile: '90th', value: 47800 },
    { percentile: '95th', value: 48900 },
    { percentile: '99th', value: 52800 },
  ]

  const correlationMatrix = [
    { factor: 'Demand', correlation: 1.0 },
    { factor: 'Material Cost', correlation: 0.82 },
    { factor: 'Transport', correlation: 0.65 },
    { factor: 'Labor', correlation: 0.48 },
    { factor: 'Lead Time', correlation: 0.71 },
  ]

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Advanced Risk Analysis</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-sm font-medium text-slate-900 mb-3">Value at Risk (VaR)</p>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded">
              <p className="text-sm text-slate-600">VaR 95%</p>
              <p className="text-2xl font-bold text-slate-900">₹{riskMetrics.var95.toLocaleString()}</p>
              <p className="text-xs text-slate-600 mt-1">95% confidence level</p>
            </div>
            <div className="p-3 bg-orange-50 rounded">
              <p className="text-sm text-slate-600">VaR 99%</p>
              <p className="text-2xl font-bold text-slate-900">₹{riskMetrics.var99.toLocaleString()}</p>
              <p className="text-xs text-slate-600 mt-1">99% confidence level</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <p className="text-sm font-medium text-slate-900 mb-3">Conditional VaR (CVaR)</p>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded">
              <p className="text-sm text-slate-600">CVaR 95%</p>
              <p className="text-2xl font-bold text-slate-900">₹{riskMetrics.cvar95.toLocaleString()}</p>
              <p className="text-xs text-slate-600 mt-1">Expected loss beyond VaR</p>
            </div>
            <div className="p-3 bg-red-100 rounded">
              <p className="text-sm text-slate-600">CVaR 99%</p>
              <p className="text-2xl font-bold text-slate-900">₹{riskMetrics.cvar99.toLocaleString()}</p>
              <p className="text-xs text-slate-600 mt-1">Extreme loss scenario</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Risk Distribution</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={riskData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="percentile" />
            <YAxis />
            <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Factor Correlation</p>
        <div className="space-y-2">
          {correlationMatrix.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <p className="text-sm font-medium text-slate-900">{c.factor}</p>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-200 rounded-full">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${c.correlation * 100}%` }} />
                </div>
                <span className="text-sm font-bold text-slate-900">{c.correlation.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ SCENARIO COLLABORATION ============
export function ScenarioCollaboration() {
  const [scenarios] = useState([
    { id: 'SC001', name: 'Q4 Demand Spike', owner: 'John Doe', status: 'approved', comments: 5, version: 3 },
    { id: 'SC002', name: 'Supply Chain Disruption', owner: 'Jane Smith', status: 'pending', comments: 8, version: 2 },
    { id: 'SC003', name: 'Cost Optimization', owner: 'Mike Johnson', status: 'draft', comments: 3, version: 1 },
  ])

  const comments = [
    { author: 'John Doe', text: 'This scenario looks promising. Need to verify demand assumptions.', time: '2h ago' },
    { author: 'Jane Smith', text: 'Agreed. I\'ve updated the cost estimates.', time: '1h ago' },
    { author: 'Mike Johnson', text: 'Ready for approval.', time: '30m ago' },
  ]

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Scenario Collaboration</h3>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Shared Scenarios</p>
        <div className="space-y-2">
          {scenarios.map((s, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-slate-900">{s.name}</p>
                  <p className="text-xs text-slate-600">{s.id} • Owner: {s.owner}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  s.status === 'approved' ? 'bg-green-100 text-green-800' :
                  s.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-slate-200 text-slate-800'
                }`}>
                  {s.status}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-slate-600">
                <span>v{s.version}</span>
                <span>{s.comments} comments</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Recent Comments</p>
        <div className="space-y-3">
          {comments.map((c, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-slate-900">{c.author}</p>
                <p className="text-xs text-slate-600">{c.time}</p>
              </div>
              <p className="text-sm text-slate-700">{c.text}</p>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full btn btn-secondary">
        <MessageSquare size={18} className="mr-2" />
        Add Comment
      </button>
    </div>
  )
}

// ============ EXPORT & REPORTING ============
export function ExportReporting() {
  const [reports] = useState([
    { name: 'Executive Summary', format: 'PDF', size: '2.3 MB', generated: '2h ago' },
    { name: 'Detailed Analysis', format: 'Excel', size: '5.1 MB', generated: '1h ago' },
    { name: 'Risk Assessment', format: 'PDF', size: '3.8 MB', generated: '30m ago' },
    { name: 'Scenario Comparison', format: 'Excel', size: '4.2 MB', generated: '15m ago' },
  ])

  const exportOptions = [
    { format: 'PDF', description: 'Professional report with charts', icon: '📄' },
    { format: 'Excel', description: 'Detailed data with formulas', icon: '📊' },
    { format: 'PowerPoint', description: 'Presentation slides', icon: '🎯' },
    { format: 'JSON', description: 'Raw data export', icon: '⚙️' },
  ]

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Export & Reporting</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-sm font-medium text-slate-900 mb-3">Export Options</p>
          <div className="space-y-2">
            {exportOptions.map((opt, i) => (
              <button key={i} className="w-full p-3 bg-slate-50 rounded hover:bg-slate-100 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{opt.icon}</span>
                  <div>
                    <p className="font-medium text-slate-900">{opt.format}</p>
                    <p className="text-xs text-slate-600">{opt.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <p className="text-sm font-medium text-slate-900 mb-3">Recent Reports</p>
          <div className="space-y-2">
            {reports.map((r, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-slate-900">{r.name}</p>
                  <span className="text-xs font-semibold text-slate-600">{r.format}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{r.size}</span>
                  <span>{r.generated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Scheduled Reports</p>
        <div className="space-y-2">
          {[
            { name: 'Weekly Summary', schedule: 'Every Monday 9 AM', status: 'active' },
            { name: 'Monthly Analysis', schedule: 'First day of month', status: 'active' },
            { name: 'Quarterly Review', schedule: 'Every 3 months', status: 'inactive' },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <div>
                <p className="text-sm font-medium text-slate-900">{s.name}</p>
                <p className="text-xs text-slate-600">{s.schedule}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-800'
              }`}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
