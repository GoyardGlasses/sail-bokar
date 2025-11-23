import React, { useState } from 'react'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ComposedChart, Cell } from 'recharts'
import { TrendingUp, AlertCircle, CheckCircle, Download, Share2, Lock, Zap, Eye, GitBranch, MessageSquare } from 'lucide-react'

// ============ MONTE CARLO SIMULATION ============
export function MonteCarloSimulation() {
  const [simulations] = useState({
    runs: 10000,
    costDistribution: [
      { range: '₹30-35K', probability: 15, count: 1500 },
      { range: '₹35-40K', probability: 25, count: 2500 },
      { range: '₹40-45K', probability: 35, count: 3500 },
      { range: '₹45-50K', probability: 20, count: 2000 },
      { range: '₹50-55K', probability: 5, count: 500 },
    ],
    timeDistribution: [
      { range: '10-12 days', probability: 10, count: 1000 },
      { range: '12-14 days', probability: 25, count: 2500 },
      { range: '14-16 days', probability: 40, count: 4000 },
      { range: '16-18 days', probability: 20, count: 2000 },
      { range: '18-20 days', probability: 5, count: 500 },
    ],
  })

  const confidenceIntervals = [
    { level: '68% CI', min: 38500, max: 46200, label: '1σ' },
    { level: '95% CI', min: 35800, max: 48900, label: '2σ' },
    { level: '99% CI', min: 33100, max: 51600, label: '3σ' },
  ]

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Monte Carlo Simulation</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
          <p className="text-sm font-medium text-slate-300 mb-3">Cost Distribution ({simulations.runs.toLocaleString()} runs)</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={simulations.costDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
          <p className="text-sm font-medium text-slate-300 mb-3">Time Distribution ({simulations.runs.toLocaleString()} runs)</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={simulations.timeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
        <p className="text-sm font-medium text-slate-300 mb-3">Confidence Intervals</p>
        <div className="space-y-3">
          {confidenceIntervals.map((ci, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium text-slate-900">{ci.level} ({ci.label})</p>
                <p className="text-xs font-bold text-slate-400">{((ci.max - ci.min) / ci.min * 100).toFixed(1)}% range</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-600">₹{ci.min.toLocaleString()}</span>
                <div className="flex-1 h-2 bg-gradient-to-r from-blue-200 to-blue-600 rounded" />
                <span className="text-slate-600">₹{ci.max.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4 text-center">
          <p className="text-sm text-slate-400">Mean Cost</p>
          <p className="text-2xl font-bold text-white mt-2">₹42,350</p>
        </div>
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4 text-center">
          <p className="text-sm text-slate-400">Std Deviation</p>
          <p className="text-2xl font-bold text-white mt-2">₹3,850</p>
        </div>
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4 text-center">
          <p className="text-sm text-slate-400">Risk (VaR 95%)</p>
          <p className="text-2xl font-bold text-orange-400 mt-2">₹48,900</p>
        </div>
      </div>
    </div>
  )
}

// ============ SENSITIVITY ANALYSIS ============
export function SensitivityAnalysis() {
  const [parameters] = useState([
    { name: 'Demand Volume', min: -20, max: 20, impact: 15.5, elasticity: 0.78 },
    { name: 'Material Cost', min: -15, max: 15, impact: 12.3, elasticity: 0.92 },
    { name: 'Transport Cost', min: -25, max: 25, impact: 8.7, elasticity: 0.65 },
    { name: 'Labor Cost', min: -10, max: 10, impact: 5.2, elasticity: 0.48 },
    { name: 'Lead Time', min: -30, max: 30, impact: 9.8, elasticity: 0.71 },
  ])

  const tornadoData = parameters.map(p => ({
    name: p.name,
    min: p.min,
    max: p.max,
    impact: p.impact,
  }))

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Sensitivity Analysis</h3>

      <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
        <p className="text-sm font-medium text-slate-300 mb-3">Tornado Diagram - Parameter Impact</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={tornadoData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="min" stackId="a" fill="#ef4444" />
            <Bar dataKey="max" stackId="a" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
        <p className="text-sm font-medium text-slate-300 mb-3">Parameter Elasticity</p>
        <div className="space-y-2">
          {parameters.map((p, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <div>
                <p className="text-sm font-medium text-slate-900">{p.name}</p>
                <p className="text-xs text-slate-600">Range: {p.min}% to +{p.max}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">Elasticity: {p.elasticity.toFixed(2)}</p>
                <p className="text-xs text-slate-600">Impact: {p.impact.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ SCENARIO OPTIMIZATION ============
export function ScenarioOptimization() {
  const [optimizations] = useState([
    { objective: 'Cost Minimization', currentCost: 42350, optimizedCost: 38200, savings: 9.8, timeImpact: 2.1 },
    { objective: 'Time Minimization', currentTime: 15, optimizedTime: 12, savings: 20, costImpact: 5.3 },
    { objective: 'Risk Minimization', currentRisk: 8.5, optimizedRisk: 4.2, savings: 50.6, costImpact: 3.2 },
    { objective: 'Balanced Approach', currentScore: 72, optimizedScore: 88, savings: 22.2, timeImpact: 1.5 },
  ])

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Scenario Optimization</h3>

      <div className="space-y-3">
        {optimizations.map((opt, i) => (
          <div key={i} className="card p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-3">
              <p className="font-bold text-slate-900">{opt.objective}</p>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                {opt.savings.toFixed(1)}% improvement
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-600">Current</p>
                <p className="font-bold text-slate-900">
                  {opt.objective.includes('Cost') ? `₹${opt.currentCost.toLocaleString()}` :
                   opt.objective.includes('Time') ? `${opt.currentTime} days` :
                   opt.objective.includes('Risk') ? `${opt.currentRisk}%` :
                   `${opt.currentScore} pts`}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Optimized</p>
                <p className="font-bold text-green-600">
                  {opt.objective.includes('Cost') ? `₹${opt.optimizedCost.toLocaleString()}` :
                   opt.objective.includes('Time') ? `${opt.optimizedTime} days` :
                   opt.objective.includes('Risk') ? `${opt.optimizedRisk}%` :
                   `${opt.optimizedScore} pts`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============ COMPARATIVE SCENARIO ANALYSIS ============
export function ComparativeScenarioAnalysis() {
  const [scenarios] = useState([
    { name: 'Best Case', cost: 35000, time: 12, success: 95, risk: 5, roi: 28 },
    { name: 'Most Likely', cost: 42350, time: 15, success: 85, risk: 8.5, roi: 22 },
    { name: 'Worst Case', cost: 52000, time: 20, success: 65, risk: 18, roi: 12 },
  ])

  const comparisonData = [
    { metric: 'Cost', best: 35, likely: 42.35, worst: 52 },
    { metric: 'Time', best: 12, likely: 15, worst: 20 },
    { metric: 'Success %', best: 95, likely: 85, worst: 65 },
    { metric: 'Risk %', best: 5, likely: 8.5, worst: 18 },
  ]

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Comparative Scenario Analysis</h3>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Scenario Comparison</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="best" fill="#10b981" name="Best Case" />
            <Bar dataKey="likely" fill="#3b82f6" name="Most Likely" />
            <Bar dataKey="worst" fill="#ef4444" name="Worst Case" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((s, i) => (
          <div key={i} className={`card p-4 ${i === 0 ? 'border-l-4 border-green-500' : i === 1 ? 'border-l-4 border-blue-500' : 'border-l-4 border-red-500'}`}>
            <p className="font-bold text-slate-900 mb-3">{s.name}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Cost</span>
                <span className="font-bold text-slate-900">₹{s.cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Time</span>
                <span className="font-bold text-slate-900">{s.time} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Success</span>
                <span className="font-bold text-slate-900">{s.success}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Risk</span>
                <span className="font-bold text-slate-900">{s.risk}%</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-600">ROI</span>
                <span className="font-bold text-green-600">{s.roi}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============ MACHINE LEARNING PREDICTIONS ============
export function MachineLearningPredictions() {
  const [models] = useState([
    { name: 'Neural Network', accuracy: 94.2, mape: 3.8, rmse: 1250, status: 'active' },
    { name: 'Random Forest', accuracy: 91.5, mape: 5.2, rmse: 1680, status: 'active' },
    { name: 'Gradient Boosting', accuracy: 93.8, mape: 4.1, rmse: 1380, status: 'active' },
    { name: 'LSTM RNN', accuracy: 92.1, mape: 4.9, rmse: 1520, status: 'active' },
  ])

  const ensembleData = [
    { model: 'NN', weight: 0.35 },
    { model: 'RF', weight: 0.25 },
    { model: 'GB', weight: 0.25 },
    { model: 'LSTM', weight: 0.15 },
  ]

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Machine Learning Predictions</h3>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Model Performance</p>
        <div className="space-y-2">
          {models.map((m, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium text-slate-900">{m.name}</p>
                <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">Active</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-slate-600">Accuracy</p>
                  <p className="font-bold text-slate-900">{m.accuracy}%</p>
                </div>
                <div>
                  <p className="text-slate-600">MAPE</p>
                  <p className="font-bold text-slate-900">{m.mape}%</p>
                </div>
                <div>
                  <p className="text-slate-600">RMSE</p>
                  <p className="font-bold text-slate-900">₹{m.rmse.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Ensemble Weights</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ensembleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="model" />
            <YAxis />
            <Tooltip formatter={(v) => (v * 100).toFixed(1) + '%'} />
            <Bar dataKey="weight" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ============ REAL-TIME SCENARIO MONITORING ============
export function RealTimeScenarioMonitoring() {
  const [metrics] = useState([
    { kpi: 'Current Cost', value: 41200, target: 42350, status: 'on-track', trend: 'down' },
    { kpi: 'Delivery Progress', value: 65, target: 100, status: 'on-track', trend: 'up' },
    { kpi: 'Risk Level', value: 7.2, target: 8.5, status: 'good', trend: 'down' },
    { kpi: 'Success Probability', value: 87, target: 85, status: 'excellent', trend: 'up' },
  ])

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Real-Time Scenario Monitoring</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="card p-4">
            <div className="flex justify-between items-start mb-3">
              <p className="font-bold text-slate-900">{m.kpi}</p>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                m.status === 'excellent' ? 'bg-green-100 text-green-800' :
                m.status === 'good' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {m.status}
              </span>
            </div>
            <div className="flex items-end gap-3">
              <div>
                <p className="text-3xl font-bold text-slate-900">{m.value}</p>
                <p className="text-xs text-slate-600">Target: {m.target}</p>
              </div>
              <div className="flex-1">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${m.status === 'excellent' ? 'bg-green-600' : m.status === 'good' ? 'bg-blue-600' : 'bg-yellow-600'}`}
                    style={{ width: `${Math.min((m.value / m.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
