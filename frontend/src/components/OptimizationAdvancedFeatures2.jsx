import React, { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts'
import { History, Zap, CheckCircle, AlertCircle, Download, GitBranch, Eye, TrendingUp } from 'lucide-react'

// ============ HISTORICAL ANALYSIS ============
export function HistoricalAnalysis() {
  const [runs] = useState([
    { id: 'RUN001', date: '2025-11-23', algorithm: 'NSGA2', bestCost: 35000, bestTime: 24, solutions: 45, status: 'completed' },
    { id: 'RUN002', date: '2025-11-22', algorithm: 'NSGA2', bestCost: 36500, bestTime: 22, solutions: 42, status: 'completed' },
    { id: 'RUN003', date: '2025-11-21', algorithm: 'GA', bestCost: 38000, bestTime: 20, solutions: 38, status: 'completed' },
    { id: 'RUN004', date: '2025-11-20', algorithm: 'NSGA2', bestCost: 37200, bestTime: 23, solutions: 40, status: 'completed' },
  ])

  const trendData = [
    { date: 'Nov 20', cost: 37200, time: 23, efficiency: 75 },
    { date: 'Nov 21', cost: 38000, time: 20, efficiency: 72 },
    { date: 'Nov 22', cost: 36500, time: 22, efficiency: 78 },
    { date: 'Nov 23', cost: 35000, time: 24, efficiency: 80 },
  ]

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Historical Analysis</h3>

      <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
        <p className="text-sm font-medium text-slate-300 mb-3">Performance Trends</p>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} name="Best Cost" />
            <Area yAxisId="right" type="monotone" dataKey="efficiency" fill="#10b981" stroke="#059669" opacity={0.6} name="Efficiency %" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
        <p className="text-sm font-medium text-slate-300 mb-3">Previous Runs</p>
        <div className="space-y-2">
          {runs.map((r, i) => (
            <div key={i} className="p-3 bg-slate-600 rounded border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-white">{r.id}</p>
                  <p className="text-xs text-slate-400">{r.date} • {r.algorithm}</p>
                </div>
                <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                  {r.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-slate-300">
                <div>Cost: ₹{r.bestCost.toLocaleString()}</div>
                <div>Time: {r.bestTime}h</div>
                <div>Solutions: {r.solutions}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ EXPORT & REPORTING ============
export function ExportReportingOptimization() {
  const [reports] = useState([
    { name: 'Optimization Report', format: 'PDF', size: '2.5 MB', generated: '2h ago' },
    { name: 'Solutions Data', format: 'CSV', size: '1.2 MB', generated: '1h ago' },
    { name: 'Pareto Front', format: 'JSON', size: '0.8 MB', generated: '30m ago' },
  ])

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Export & Reporting</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
          <p className="text-sm font-medium text-slate-300 mb-3">Export Formats</p>
          <div className="space-y-2">
            {[
              { format: 'PDF', desc: 'Professional report', icon: '📄' },
              { format: 'CSV', desc: 'Spreadsheet data', icon: '📊' },
              { format: 'JSON', desc: 'Raw data', icon: '⚙️' },
              { format: 'Excel', desc: 'With formulas', icon: '📈' },
            ].map((e, i) => (
              <button key={i} className="w-full p-3 bg-slate-600 rounded hover:bg-slate-500 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{e.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{e.format}</p>
                    <p className="text-xs text-slate-400">{e.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
          <p className="text-sm font-medium text-slate-300 mb-3">Recent Reports</p>
          <div className="space-y-2">
            {reports.map((r, i) => (
              <div key={i} className="p-3 bg-slate-600 rounded">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-white text-sm">{r.name}</p>
                  <span className="text-xs font-semibold text-slate-400">{r.format}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{r.size}</span>
                  <span>{r.generated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
        <p className="text-sm font-medium text-slate-300 mb-3">Scheduled Reports</p>
        <div className="space-y-2">
          {[
            { name: 'Daily Summary', schedule: 'Every day 9 AM', active: true },
            { name: 'Weekly Analysis', schedule: 'Every Monday', active: true },
            { name: 'Monthly Review', schedule: '1st of month', active: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-600 rounded">
              <div>
                <p className="text-sm font-medium text-white">{s.name}</p>
                <p className="text-xs text-slate-400">{s.schedule}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                s.active ? 'bg-green-100 text-green-800' : 'bg-slate-500 text-slate-300'
              }`}>
                {s.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ MULTI-ALGORITHM COMPARISON ============
export function MultiAlgorithmComparison() {
  const [algorithms] = useState([
    { name: 'NSGA2', cost: 35000, time: 24, efficiency: 85, solutions: 45, convergence: 0.89, runtime: '2.3s' },
    { name: 'Genetic Algorithm', cost: 38000, time: 20, efficiency: 78, solutions: 38, convergence: 0.76, runtime: '1.8s' },
    { name: 'Particle Swarm', cost: 36500, time: 22, efficiency: 82, solutions: 42, convergence: 0.84, runtime: '2.1s' },
    { name: 'Greedy Heuristic', cost: 42000, time: 16, efficiency: 65, solutions: 1, convergence: 0.45, runtime: '0.3s' },
  ])

  const comparisonData = [
    { metric: 'Cost', NSGA2: 85, GA: 78, PSO: 82, Greedy: 45 },
    { metric: 'Time', NSGA2: 82, GA: 88, PSO: 80, Greedy: 95 },
    { metric: 'Efficiency', NSGA2: 85, GA: 78, PSO: 82, Greedy: 65 },
    { metric: 'Solutions', NSGA2: 90, GA: 85, PSO: 88, Greedy: 20 },
  ]

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Multi-Algorithm Comparison</h3>

      <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
        <p className="text-sm font-medium text-slate-300 mb-3">Algorithm Performance</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="NSGA2" fill="#3b82f6" />
            <Bar dataKey="GA" fill="#10b981" />
            <Bar dataKey="PSO" fill="#f59e0b" />
            <Bar dataKey="Greedy" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="px-4 py-2 text-left text-slate-300">Algorithm</th>
              <th className="px-4 py-2 text-left text-slate-300">Best Cost</th>
              <th className="px-4 py-2 text-left text-slate-300">Time</th>
              <th className="px-4 py-2 text-left text-slate-300">Efficiency</th>
              <th className="px-4 py-2 text-left text-slate-300">Solutions</th>
              <th className="px-4 py-2 text-left text-slate-300">Runtime</th>
            </tr>
          </thead>
          <tbody>
            {algorithms.map((a, i) => (
              <tr key={i} className="border-b border-slate-700 hover:bg-slate-700">
                <td className="px-4 py-2 text-white font-medium">{a.name}</td>
                <td className="px-4 py-2 text-slate-300">₹{a.cost.toLocaleString()}</td>
                <td className="px-4 py-2 text-slate-300">{a.time}h</td>
                <td className="px-4 py-2 text-slate-300">{a.efficiency}%</td>
                <td className="px-4 py-2 text-slate-300">{a.solutions}</td>
                <td className="px-4 py-2 text-slate-300">{a.runtime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============ CONSTRAINT VISUALIZATION ============
export function ConstraintVisualization() {
  const constraintData = [
    { constraint: 'Time Window', satisfied: 92, violated: 8 },
    { constraint: 'Capacity', satisfied: 98, violated: 2 },
    { constraint: 'Cost Budget', satisfied: 85, violated: 15 },
    { constraint: 'Fuel Efficiency', satisfied: 88, violated: 12 },
  ]

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Constraint Visualization</h3>

      <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
        <p className="text-sm font-medium text-slate-300 mb-3">Constraint Satisfaction Rate</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={constraintData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="constraint" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="satisfied" stackId="a" fill="#10b981" name="Satisfied" />
            <Bar dataKey="violated" stackId="a" fill="#ef4444" name="Violated" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {constraintData.map((c, i) => (
          <div key={i} className="bg-slate-700 rounded-lg border border-slate-600 p-4">
            <p className="text-sm font-medium text-slate-300 mb-3">{c.constraint}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Satisfied</span>
                <span>{c.satisfied}%</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${c.satisfied}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============ SOLUTION VALIDATION ============
export function SolutionValidation() {
  const [validations] = useState([
    { check: 'Feasibility', status: 'passed', details: 'All constraints satisfied' },
    { check: 'Capacity Limits', status: 'passed', details: 'Within vehicle capacity' },
    { check: 'Time Windows', status: 'passed', details: 'All deliveries on time' },
    { check: 'Cost Budget', status: 'warning', details: '5% over budget' },
    { check: 'Route Validity', status: 'passed', details: 'All routes valid' },
  ])

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Solution Validation</h3>

      <div className="space-y-2">
        {validations.map((v, i) => (
          <div key={i} className={`p-4 rounded border-l-4 ${
            v.status === 'passed' ? 'bg-green-900 border-green-500' :
            v.status === 'warning' ? 'bg-yellow-900 border-yellow-500' :
            'bg-red-900 border-red-500'
          }`}>
            <div className="flex items-start gap-3">
              {v.status === 'passed' ? (
                <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-1" />
              ) : v.status === 'warning' ? (
                <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-1" />
              ) : (
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-1" />
              )}
              <div>
                <p className="font-medium text-white">{v.check}</p>
                <p className="text-sm text-slate-300 mt-1">{v.details}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4 text-center">
          <p className="text-sm text-slate-400">Checks Passed</p>
          <p className="text-3xl font-bold text-green-400 mt-2">4/5</p>
        </div>
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4 text-center">
          <p className="text-sm text-slate-400">Warnings</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">1</p>
        </div>
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4 text-center">
          <p className="text-sm text-slate-400">Overall Status</p>
          <p className="text-3xl font-bold text-green-400 mt-2">80%</p>
        </div>
      </div>
    </div>
  )
}

// ============ INTERACTIVE PARETO FRONT ============
export function InteractiveParetoFront() {
  const [selectedSolution, setSelectedSolution] = useState(null)

  const solutions = [
    { id: 'S1', cost: 35000, time: 24, efficiency: 65, vehicles: 3, routes: 5 },
    { id: 'S2', cost: 38000, time: 20, efficiency: 72, vehicles: 3, routes: 6 },
    { id: 'S3', cost: 42000, time: 16, efficiency: 78, vehicles: 4, routes: 7 },
    { id: 'S4', cost: 45000, time: 12, efficiency: 85, vehicles: 4, routes: 8 },
  ]

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-bold text-white">Interactive Pareto Front</h3>

      <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
        <p className="text-sm font-medium text-slate-300 mb-3">Pareto Front Visualization</p>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="cost" name="Cost (₹)" />
            <YAxis dataKey="time" name="Time (hrs)" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Solutions" data={solutions} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
        <p className="text-sm font-medium text-slate-300 mb-3">Select Solution</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {solutions.map((s, i) => (
            <button
              key={i}
              onClick={() => setSelectedSolution(s.id)}
              className={`p-3 rounded border-2 transition-all text-left ${
                selectedSolution === s.id
                  ? 'bg-blue-900 border-blue-500'
                  : 'bg-slate-600 border-slate-500 hover:border-blue-400'
              }`}
            >
              <p className="font-medium text-white">{s.id}</p>
              <p className="text-xs text-slate-300">Cost: ₹{s.cost.toLocaleString()} | Time: {s.time}h</p>
            </button>
          ))}
        </div>
      </div>

      {selectedSolution && (
        <div className="bg-slate-700 rounded-lg border border-blue-600 p-4">
          <p className="text-sm font-medium text-slate-300 mb-3">Solution Details: {selectedSolution}</p>
          {solutions.filter(s => s.id === selectedSolution).map((s, i) => (
            <div key={i} className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-600 rounded">
                  <p className="text-xs text-slate-400">Cost</p>
                  <p className="text-lg font-bold text-white">₹{s.cost.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-600 rounded">
                  <p className="text-xs text-slate-400">Time</p>
                  <p className="text-lg font-bold text-white">{s.time}h</p>
                </div>
                <div className="p-3 bg-slate-600 rounded">
                  <p className="text-xs text-slate-400">Efficiency</p>
                  <p className="text-lg font-bold text-white">{s.efficiency}%</p>
                </div>
                <div className="p-3 bg-slate-600 rounded">
                  <p className="text-xs text-slate-400">Vehicles</p>
                  <p className="text-lg font-bold text-white">{s.vehicles}</p>
                </div>
                <div className="p-3 bg-slate-600 rounded">
                  <p className="text-xs text-slate-400">Routes</p>
                  <p className="text-lg font-bold text-white">{s.routes}</p>
                </div>
                <div className="p-3 bg-slate-600 rounded">
                  <p className="text-xs text-slate-400">Rank</p>
                  <p className="text-lg font-bold text-white">{i + 1}</p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors">
                Apply This Solution
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4 text-center">
          <p className="text-sm text-slate-400">Total Solutions</p>
          <p className="text-3xl font-bold text-white mt-2">{solutions.length}</p>
        </div>
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4 text-center">
          <p className="text-sm text-slate-400">Cost Range</p>
          <p className="text-sm font-bold text-white mt-2">₹{Math.min(...solutions.map(s => s.cost)).toLocaleString()} - ₹{Math.max(...solutions.map(s => s.cost)).toLocaleString()}</p>
        </div>
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4 text-center">
          <p className="text-sm text-slate-400">Time Range</p>
          <p className="text-sm font-bold text-white mt-2">{Math.min(...solutions.map(s => s.time))}h - {Math.max(...solutions.map(s => s.time))}h</p>
        </div>
      </div>
    </div>
  )
}
