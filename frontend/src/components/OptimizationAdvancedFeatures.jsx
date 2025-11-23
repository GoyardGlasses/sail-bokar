import React, { useState } from 'react'
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Lock, AlertCircle, CheckCircle, Zap, TrendingUp, Download, Settings, Eye } from 'lucide-react'

// ============ CONSTRAINT MANAGEMENT ============
export function ConstraintManagement() {
  const [constraints] = useState([
    { id: 1, name: 'Max Delivery Time', type: 'hard', value: '24 hours', penalty: 'Infeasible', status: 'active' },
    { id: 2, name: 'Vehicle Capacity', type: 'hard', value: '5000 kg', penalty: 'Infeasible', status: 'active' },
    { id: 3, name: 'Cost Budget', type: 'soft', value: '₹50,000', penalty: '-10 points', status: 'active' },
    { id: 4, name: 'Fuel Efficiency', type: 'soft', value: '>8 km/l', penalty: '-5 points', status: 'active' },
  ])

  const violations = [
    { constraint: 'Max Delivery Time', violations: 2, severity: 'high', impact: 'Critical' },
    { constraint: 'Vehicle Capacity', violations: 0, severity: 'none', impact: 'None' },
    { constraint: 'Cost Budget', violations: 1, severity: 'medium', impact: 'Moderate' },
  ]

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Constraint Management</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
          <p className="text-sm font-medium text-slate-300 mb-3">Active Constraints</p>
          <div className="space-y-2">
            {constraints.map((c, i) => (
              <div key={i} className="p-3 bg-slate-600 rounded border border-slate-500">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-white">{c.name}</p>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    c.type === 'hard' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {c.type.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{c.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
          <p className="text-sm font-medium text-slate-300 mb-3">Constraint Violations</p>
          <div className="space-y-2">
            {violations.map((v, i) => (
              <div key={i} className="p-3 bg-slate-600 rounded border-l-4 border-orange-500">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-white">{v.constraint}</p>
                  <span className={`text-xs font-bold ${
                    v.severity === 'high' ? 'text-red-400' :
                    v.severity === 'medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {v.violations} violations
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Impact: {v.impact}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="w-full btn btn-secondary">
        <Lock size={18} className="mr-2" />
        Add Constraint
      </button>
    </div>
  )
}

// ============ SENSITIVITY ANALYSIS ============
export function OptimizationSensitivityAnalysis() {
  const sensitivityData = [
    { parameter: 'Fuel Cost', impact: 35, direction: 'positive' },
    { parameter: 'Distance Weight', impact: 28, direction: 'positive' },
    { parameter: 'Time Weight', impact: 22, direction: 'negative' },
    { parameter: 'Vehicle Count', impact: 18, direction: 'positive' },
    { parameter: 'Capacity', impact: 15, direction: 'positive' },
  ]

  const tradeoffData = [
    { cost: 35000, time: 24, efficiency: 65 },
    { cost: 38000, time: 20, efficiency: 72 },
    { cost: 42000, time: 16, efficiency: 78 },
    { cost: 45000, time: 12, efficiency: 85 },
    { cost: 50000, time: 8, efficiency: 90 },
  ]

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Sensitivity Analysis</h3>

      <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
        <p className="text-sm font-medium text-slate-300 mb-3">Parameter Impact Analysis</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={sensitivityData} layout="vertical" margin={{ left: 120 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="parameter" type="category" width={110} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="impact" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
        <p className="text-sm font-medium text-slate-300 mb-3">Cost-Time-Efficiency Trade-off</p>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={tradeoffData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="cost" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="time" stroke="#ef4444" strokeWidth={2} name="Time (hrs)" />
            <Area yAxisId="right" type="monotone" dataKey="efficiency" fill="#10b981" stroke="#059669" opacity={0.6} name="Efficiency %" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ============ REAL-TIME MONITORING ============
export function RealTimeOptimizationMonitoring() {
  const [metrics] = useState({
    generation: 45,
    maxGenerations: 100,
    bestFitness: 0.892,
    avgFitness: 0.756,
    diversity: 0.68,
    convergence: 0.85,
  })

  const convergenceData = [
    { gen: 0, best: 0.45, avg: 0.32 },
    { gen: 10, best: 0.62, avg: 0.51 },
    { gen: 20, best: 0.74, avg: 0.65 },
    { gen: 30, best: 0.81, avg: 0.72 },
    { gen: 40, best: 0.87, avg: 0.75 },
    { gen: 45, best: 0.892, avg: 0.756 },
  ]

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Real-Time Monitoring</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
          <p className="text-sm text-slate-400">Generation Progress</p>
          <p className="text-3xl font-bold text-white mt-2">{metrics.generation}/{metrics.maxGenerations}</p>
          <div className="w-full bg-slate-600 rounded-full h-2 mt-3">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(metrics.generation / metrics.maxGenerations) * 100}%` }} />
          </div>
        </div>
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
          <p className="text-sm text-slate-400">Best Fitness</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{(metrics.bestFitness * 100).toFixed(1)}%</p>
          <p className="text-xs text-slate-400 mt-2">Avg: {(metrics.avgFitness * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
          <p className="text-sm text-slate-400">Population Diversity</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">{(metrics.diversity * 100).toFixed(0)}%</p>
          <p className="text-xs text-slate-400 mt-2">Convergence: {(metrics.convergence * 100).toFixed(0)}%</p>
        </div>
      </div>

      <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
        <p className="text-sm font-medium text-slate-300 mb-3">Convergence Tracking</p>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={convergenceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="gen" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="best" stroke="#10b981" strokeWidth={2} name="Best Fitness" />
            <Line type="monotone" dataKey="avg" stroke="#f59e0b" strokeWidth={2} name="Avg Fitness" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ============ SOLUTION COMPARISON ============
export function SolutionComparison() {
  const [solutions] = useState([
    { id: 'S1', cost: 35000, time: 24, efficiency: 65, vehicles: 3, feasible: true, rank: 1 },
    { id: 'S2', cost: 38000, time: 20, efficiency: 72, vehicles: 3, feasible: true, rank: 2 },
    { id: 'S3', cost: 42000, time: 16, efficiency: 78, vehicles: 4, feasible: true, rank: 3 },
    { id: 'S4', cost: 45000, time: 12, efficiency: 85, vehicles: 4, feasible: true, rank: 4 },
  ])

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Solution Comparison</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="px-4 py-2 text-left text-slate-300">Solution</th>
              <th className="px-4 py-2 text-left text-slate-300">Cost</th>
              <th className="px-4 py-2 text-left text-slate-300">Time</th>
              <th className="px-4 py-2 text-left text-slate-300">Efficiency</th>
              <th className="px-4 py-2 text-left text-slate-300">Vehicles</th>
              <th className="px-4 py-2 text-left text-slate-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {solutions.map((s, i) => (
              <tr key={i} className="border-b border-slate-700 hover:bg-slate-700">
                <td className="px-4 py-2 text-white font-medium">{s.id}</td>
                <td className="px-4 py-2 text-slate-300">₹{s.cost.toLocaleString()}</td>
                <td className="px-4 py-2 text-slate-300">{s.time} hrs</td>
                <td className="px-4 py-2 text-slate-300">{s.efficiency}%</td>
                <td className="px-4 py-2 text-slate-300">{s.vehicles}</td>
                <td className="px-4 py-2">
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                    Feasible
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
          <p className="text-sm font-medium text-slate-300 mb-3">Cost vs Time</p>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cost" name="Cost" />
              <YAxis dataKey="time" name="Time" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Solutions" data={solutions} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
          <p className="text-sm font-medium text-slate-300 mb-3">Efficiency vs Cost</p>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cost" name="Cost" />
              <YAxis dataKey="efficiency" name="Efficiency" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Solutions" data={solutions} fill="#10b981" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ============ ADVANCED VISUALIZATION ============
export function AdvancedVisualization() {
  const radarData = [
    { metric: 'Cost', value: 65 },
    { metric: 'Time', value: 72 },
    { metric: 'Efficiency', value: 78 },
    { metric: 'Feasibility', value: 95 },
    { metric: 'Scalability', value: 82 },
  ]

  const heatmapData = [
    { solution: 'S1', cost: 35, time: 24, efficiency: 65 },
    { solution: 'S2', cost: 38, time: 20, efficiency: 72 },
    { solution: 'S3', cost: 42, time: 16, efficiency: 78 },
    { solution: 'S4', cost: 45, time: 12, efficiency: 85 },
  ]

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Advanced Visualization</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
          <p className="text-sm font-medium text-slate-300 mb-3">Solution Performance Radar</p>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis />
              <Radar name="Best Solution" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
          <p className="text-sm font-medium text-slate-300 mb-3">Performance Heatmap</p>
          <div className="space-y-2">
            {heatmapData.map((h, i) => (
              <div key={i} className="p-2 bg-slate-600 rounded">
                <p className="text-sm font-medium text-white mb-2">{h.solution}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded" style={{ backgroundColor: `rgba(239, 68, 68, ${h.cost / 100})` }}>
                    <p className="text-slate-300">Cost: {h.cost}%</p>
                  </div>
                  <div className="p-2 rounded" style={{ backgroundColor: `rgba(59, 130, 246, ${h.time / 100})` }}>
                    <p className="text-slate-300">Time: {h.time}%</p>
                  </div>
                  <div className="p-2 rounded" style={{ backgroundColor: `rgba(16, 185, 129, ${h.efficiency / 100})` }}>
                    <p className="text-slate-300">Eff: {h.efficiency}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ GENETIC ALGORITHM TUNING ============
export function GeneticAlgorithmTuning() {
  const [params] = useState({
    mutationRate: 0.15,
    crossoverProb: 0.85,
    populationSize: 100,
    elitism: 0.1,
    tournamentSize: 3,
  })

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">GA Parameter Tuning</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Mutation Rate', value: params.mutationRate, min: 0, max: 1, step: 0.01 },
          { label: 'Crossover Probability', value: params.crossoverProb, min: 0, max: 1, step: 0.01 },
          { label: 'Population Size', value: params.populationSize, min: 10, max: 500, step: 10 },
          { label: 'Elitism Rate', value: params.elitism, min: 0, max: 0.5, step: 0.01 },
        ].map((p, i) => (
          <div key={i} className="bg-slate-700 rounded-lg border border-slate-600 p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-slate-300">{p.label}</p>
              <span className="text-sm font-bold text-blue-400">{p.value}</span>
            </div>
            <input
              type="range"
              min={p.min}
              max={p.max}
              step={p.step}
              defaultValue={p.value}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
        <p className="text-sm font-medium text-slate-300 mb-3">Selection Strategy</p>
        <div className="space-y-2">
          {['Tournament Selection', 'Roulette Wheel', 'Rank Selection', 'Uniform Random'].map((s, i) => (
            <label key={i} className="flex items-center p-2 bg-slate-600 rounded cursor-pointer hover:bg-slate-500">
              <input type="radio" name="selection" className="mr-2" defaultChecked={i === 0} />
              <span className="text-sm text-slate-300">{s}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
