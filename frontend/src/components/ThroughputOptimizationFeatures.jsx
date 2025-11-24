import React, { useState } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ComposedChart, Area } from 'recharts'
import { TrendingUp, AlertCircle, Zap, Target, Eye, Bell, FileText, Brain, Lightbulb, Settings, Gauge, Wrench } from 'lucide-react'

// ============ CAPACITY PLANNING & FORECASTING ============
export function CapacityPlanning() {
  const forecastData = [
    { month: 'Jan', current: 38500, forecast: 40000, capacity: 50000 },
    { month: 'Feb', current: 39200, forecast: 41500, capacity: 50000 },
    { month: 'Mar', current: 40100, forecast: 43000, capacity: 50000 },
    { month: 'Apr', current: 41500, forecast: 45000, capacity: 50000 },
    { month: 'May', current: 42800, forecast: 47000, capacity: 50000 },
    { month: 'Jun', current: 44200, forecast: 48500, capacity: 50000 },
  ]

  const bottlenecks = [
    { point: 'LP1 Bokaro', utilization: 92, status: 'Critical' },
    { point: 'LP2 Dhanbad', utilization: 78, status: 'Warning' },
    { point: 'LP3 Ranchi', utilization: 65, status: 'Normal' },
    { point: 'LP4 Jamshedpur', utilization: 88, status: 'Warning' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Capacity Planning & Forecasting</h3>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={forecastData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(v) => `${(v/1000).toFixed(1)}K tonnes`} />
          <Legend />
          <Area type="monotone" dataKey="capacity" fill="#fee2e2" stroke="none" opacity={0.2} name="Max Capacity" />
          <Line type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2} name="Current" />
          <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Bottleneck Analysis</p>
        <div className="space-y-2">
          {bottlenecks.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <p className="text-sm font-medium text-slate-900">{item.point}</p>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${item.utilization}%` }}></div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  item.status === 'Critical' ? 'bg-red-100 text-red-800' :
                  item.status === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ OPTIMIZATION ALGORITHMS ============
export function OptimizationAlgorithms() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('route')
  const [implementationStatus, setImplementationStatus] = useState(null)
  const [isImplementing, setIsImplementing] = useState(false)

  const algorithms = [
    {
      name: 'Route Optimization',
      description: 'Shortest path & least cost routing',
      savings: '12%',
      implementation: 'Easy',
      timeframe: '1 week',
      details: 'Uses Dijkstra algorithm for optimal path finding with cost minimization',
    },
    {
      name: 'Load Balancing',
      description: 'Distribute load across loading points',
      savings: '8%',
      implementation: 'Medium',
      timeframe: '2 weeks',
      details: 'Distributes shipments evenly across all loading points to prevent bottlenecks',
    },
    {
      name: 'Dispatch Scheduling',
      description: 'Optimize dispatch timing & sequencing',
      savings: '15%',
      implementation: 'Hard',
      timeframe: '3 weeks',
      details: 'Schedules dispatches based on demand patterns and resource availability',
    },
    {
      name: 'Resource Allocation',
      description: 'Optimal equipment & manpower assignment',
      savings: '10%',
      implementation: 'Hard',
      timeframe: '4 weeks',
      details: 'Allocates equipment and workforce based on demand forecasts and capacity',
    },
  ]

  const current = algorithms.find(a => a.name.toLowerCase().includes(selectedAlgorithm)) || algorithms[0]

  const handleImplement = async () => {
    setIsImplementing(true)
    setImplementationStatus(null)
    
    // Simulate implementation process
    try {
      // Step 1: Validate
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Step 2: Deploy
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Step 3: Test
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setImplementationStatus({
        success: true,
        message: `✅ ${current.name} implemented successfully!`,
        details: `Algorithm deployed and tested. Expected savings: ${current.savings}. Implementation time: ${current.timeframe}`,
      })
    } catch (error) {
      setImplementationStatus({
        success: false,
        message: '❌ Implementation failed',
        details: 'Please try again or contact support',
      })
    } finally {
      setIsImplementing(false)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Optimization Algorithms</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Available Algorithms</p>
          <div className="space-y-2">
            {algorithms.map((algo, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedAlgorithm(algo.name.toLowerCase())
                  setImplementationStatus(null)
                }}
                className={`w-full text-left p-3 rounded border-2 transition-all ${
                  current.name === algo.name
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
              >
                <p className="font-medium text-slate-900 dark:text-slate-50">{algo.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{algo.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-600 dark:to-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Algorithm Details</p>
          <div className="space-y-3">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{current.name}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{current.description}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 italic">{current.details}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white dark:bg-slate-700 p-2 rounded text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">Savings</p>
                <p className="text-lg font-bold text-green-600">{current.savings}</p>
              </div>
              <div className="bg-white dark:bg-slate-700 p-2 rounded text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">Difficulty</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{current.implementation}</p>
              </div>
              <div className="bg-white dark:bg-slate-700 p-2 rounded text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">Timeframe</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{current.timeframe}</p>
              </div>
            </div>
            <button 
              onClick={handleImplement}
              disabled={isImplementing}
              className="w-full btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isImplementing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Implementing...
                </>
              ) : (
                '🚀 Implement Algorithm'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Implementation Status */}
      {implementationStatus && (
        <div className={`rounded-lg p-4 border-2 ${
          implementationStatus.success
            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
            : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
        }`}>
          <p className={`font-bold text-lg ${
            implementationStatus.success
              ? 'text-green-900 dark:text-green-300'
              : 'text-red-900 dark:text-red-300'
          }`}>
            {implementationStatus.message}
          </p>
          <p className={`text-sm mt-2 ${
            implementationStatus.success
              ? 'text-green-800 dark:text-green-400'
              : 'text-red-800 dark:text-red-400'
          }`}>
            {implementationStatus.details}
          </p>
        </div>
      )}
    </div>
  )
}

// ============ PERFORMANCE ANALYTICS ============
export function PerformanceAnalytics() {
  const metrics = [
    { label: 'Throughput Efficiency', value: 87, unit: '%', color: 'text-green-600' },
    { label: 'Utilization Rate', value: 82, unit: '%', color: 'text-blue-600' },
    { label: 'Downtime', value: 4.2, unit: '%', color: 'text-red-600' },
    { label: 'On-Time Delivery', value: 94, unit: '%', color: 'text-green-600' },
  ]

  const benchmarkData = [
    { category: 'Your Performance', value: 87, color: '#3b82f6' },
    { category: 'Industry Average', value: 78, color: '#10b981' },
    { category: 'Best in Class', value: 95, color: '#f59e0b' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Performance Analytics</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="card p-3 text-center">
            <p className="text-xs text-slate-600">{m.label}</p>
            <p className={`text-2xl font-bold ${m.color} mt-1`}>{m.value}{m.unit}</p>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={benchmarkData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3b82f6">
            {benchmarkData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ============ CONSTRAINT MANAGEMENT ============
export function ConstraintManagement() {
  const constraints = [
    { name: 'Equipment Capacity', current: 45000, max: 50000, utilization: 90, status: 'Critical' },
    { name: 'Manpower Available', current: 120, max: 150, utilization: 80, status: 'Warning' },
    { name: 'Weather Impact', current: 8, max: 10, utilization: 80, status: 'Warning' },
    { name: 'Seasonal Factor', current: 0.95, max: 1.0, utilization: 95, status: 'Critical' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Constraint Management</h3>

      <div className="space-y-3">
        {constraints.map((c, i) => (
          <div key={i} className="card p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="font-medium text-slate-900">{c.name}</p>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                c.status === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {c.status}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">{c.current} / {c.max}</p>
              <p className="text-sm font-bold text-slate-900">{c.utilization}%</p>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${c.utilization}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============ SCENARIO SIMULATION ============
export function ScenarioSimulation() {
  const scenarios = [
    { name: 'Add LP7', impact: '+8%', cost: '₹5Cr', timeframe: '6 months', feasibility: 'High' },
    { name: 'Upgrade Equipment', impact: '+12%', cost: '₹3Cr', timeframe: '3 months', feasibility: 'High' },
    { name: 'Demand Surge +20%', impact: '-15%', cost: '₹0', timeframe: 'Immediate', feasibility: 'Low' },
    { name: 'Manpower +30%', impact: '+5%', cost: '₹1.5Cr', timeframe: '1 month', feasibility: 'Medium' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Scenario Simulation</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {scenarios.map((s, i) => (
          <div key={i} className="card p-4 border-l-4 border-blue-500">
            <p className="font-bold text-slate-900">{s.name}</p>
            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
              <div>
                <p className="text-xs text-slate-600">Throughput Impact</p>
                <p className={`font-bold ${s.impact.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{s.impact}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Investment</p>
                <p className="font-bold text-slate-900">{s.cost}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Timeframe</p>
                <p className="font-bold text-slate-900">{s.timeframe}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Feasibility</p>
                <p className={`font-bold ${
                  s.feasibility === 'High' ? 'text-green-600' :
                  s.feasibility === 'Medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>{s.feasibility}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============ REAL-TIME MONITORING ============
export function RealTimeMonitoring() {
  const [alerts] = useState([
    { id: 1, type: 'Capacity Alert', message: 'LP1 Bokaro at 92% capacity', severity: 'High', time: '2 min ago' },
    { id: 2, type: 'Performance', message: 'Throughput down 5% vs yesterday', severity: 'Medium', time: '15 min ago' },
    { id: 3, type: 'Equipment', message: 'Maintenance due for Crane #3', severity: 'Medium', time: '1 hour ago' },
  ])

  const kpis = [
    { label: 'Current Throughput', value: '38.5K', unit: 'tonnes', trend: '+2.1%', status: 'good' },
    { label: 'Avg Dispatch Time', value: '4.2', unit: 'hours', trend: '-0.3h', status: 'good' },
    { label: 'Equipment Utilization', value: '87%', unit: '', trend: '+1.2%', status: 'warning' },
    { label: 'Manpower Efficiency', value: '92%', unit: '', trend: '+0.8%', status: 'good' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Real-Time Monitoring</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <div key={i} className={`card p-3 ${
            kpi.status === 'warning' ? 'bg-yellow-50' : 'bg-green-50'
          }`}>
            <p className="text-xs text-slate-600">{kpi.label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{kpi.value}</p>
            <p className="text-xs text-slate-600 mt-1">{kpi.unit}</p>
            <p className={`text-xs font-semibold mt-1 ${
              kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>{kpi.trend}</p>
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

// ============ RECOMMENDATIONS ENGINE ============
export function RecommendationsEngine() {
  const recommendations = [
    {
      title: 'Implement Route Optimization',
      description: 'Switch to optimized routing can save 12% on transportation',
      impact: 'High',
      priority: 'Critical',
      action: 'Review & Implement',
    },
    {
      title: 'Increase Manpower in Q2',
      description: 'Forecast shows 15% demand increase in Q2, plan hiring now',
      impact: 'High',
      priority: 'High',
      action: 'Start Recruitment',
    },
    {
      title: 'Upgrade LP1 Equipment',
      description: 'LP1 Bokaro at 92% capacity, upgrade needed to avoid bottleneck',
      impact: 'Medium',
      priority: 'High',
      action: 'Get Quotes',
    },
    {
      title: 'Optimize Dispatch Timing',
      description: 'Shift 20% of dispatches to off-peak hours to improve efficiency',
      impact: 'Medium',
      priority: 'Medium',
      action: 'Analyze Schedule',
    },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Recommendations Engine</h3>

      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <div key={i} className="card p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-2">
              <p className="font-bold text-slate-900">{rec.title}</p>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  rec.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                  rec.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {rec.priority}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  rec.impact === 'High' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {rec.impact} Impact
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-3">{rec.description}</p>
            <button className="text-sm text-blue-600 font-medium hover:underline">{rec.action} →</button>
          </div>
        ))}
      </div>
    </div>
  )
}
