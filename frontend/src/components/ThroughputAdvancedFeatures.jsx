import React, { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, PieChart, Pie, Cell } from 'recharts'
import { AlertCircle, TrendingUp, Zap, Clock, Gauge, Users, AlertTriangle, Calendar, Download, Eye, Bell, TrendingDown } from 'lucide-react'

// ============ REAL-TIME THROUGHPUT DASHBOARD ============
export function RealTimeThroughputDashboard() {
  const [currentThroughput, setCurrentThroughput] = useState(38500)
  const [dispatchCount, setDispatchCount] = useState(112)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentThroughput(prev => prev + Math.random() * 1000 - 500)
      setDispatchCount(prev => prev + Math.floor(Math.random() * 3))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const activeLoadingPoints = [
    { name: 'LP1 Bokaro', status: 'Active', throughput: 12500, dispatches: 35 },
    { name: 'LP2 Dhanbad', status: 'Active', throughput: 9800, dispatches: 28 },
    { name: 'LP3 Ranchi', status: 'Active', throughput: 8200, dispatches: 23 },
    { name: 'LP4 Jamshedpur', status: 'Idle', throughput: 0, dispatches: 0 },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Real-Time Throughput Dashboard</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-sm text-slate-600 mb-2">Current Throughput</p>
          <p className="text-4xl font-bold text-blue-600">{Math.round(currentThroughput).toLocaleString()}</p>
          <p className="text-xs text-slate-600 mt-2">tonnes/hour</p>
          <div className="mt-3 h-1 bg-blue-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: '75%' }}></div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-sm text-slate-600 mb-2">Active Dispatches</p>
          <p className="text-4xl font-bold text-green-600">{dispatchCount}</p>
          <p className="text-xs text-slate-600 mt-2">in progress</p>
          <div className="mt-3 flex gap-2">
            <span className="px-2 py-1 rounded text-xs font-semibold bg-green-200 text-green-800">Live</span>
            <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">+2 min ago</span>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <p className="text-sm text-slate-600 mb-2">Active Loading Points</p>
          <p className="text-4xl font-bold text-purple-600">3/6</p>
          <p className="text-xs text-slate-600 mt-2">operational</p>
          <div className="mt-3 space-y-1">
            {activeLoadingPoints.filter(lp => lp.status === 'Active').map((lp, i) => (
              <p key={i} className="text-xs text-slate-600">{lp.name}: {lp.throughput.toLocaleString()} T</p>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Active Loading Points Status</p>
        <div className="space-y-2">
          {activeLoadingPoints.map((lp, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${lp.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                <p className="text-sm font-medium text-slate-900">{lp.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-600">{lp.throughput.toLocaleString()} T</p>
                <p className="text-xs font-bold text-slate-900">{lp.dispatches} dispatches</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ THROUGHPUT TRENDS & PATTERNS ============
export function ThroughputTrendsPatterns() {
  const [timeframe, setTimeframe] = useState('daily')

  const dailyData = [
    { time: '00:00', throughput: 15000, dispatches: 42 },
    { time: '04:00', throughput: 12000, dispatches: 34 },
    { time: '08:00', throughput: 42000, dispatches: 120 },
    { time: '12:00', throughput: 48000, dispatches: 137 },
    { time: '16:00', throughput: 45000, dispatches: 128 },
    { time: '20:00', throughput: 38000, dispatches: 108 },
  ]

  const weeklyData = [
    { day: 'Mon', throughput: 38500, dispatches: 110 },
    { day: 'Tue', throughput: 39200, dispatches: 112 },
    { day: 'Wed', throughput: 37800, dispatches: 108 },
    { day: 'Thu', throughput: 40100, dispatches: 115 },
    { day: 'Fri', throughput: 41500, dispatches: 118 },
    { day: 'Sat', throughput: 35200, dispatches: 100 },
    { day: 'Sun', throughput: 32100, dispatches: 92 },
  ]

  const peakHours = [
    { hour: '10-11 AM', throughput: 52000, percentage: 95 },
    { hour: '11-12 PM', throughput: 51000, percentage: 93 },
    { hour: '2-3 PM', throughput: 50000, percentage: 91 },
    { hour: '3-4 PM', throughput: 48000, percentage: 88 },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Throughput Trends & Patterns</h3>

      <div className="flex gap-2 mb-4">
        {['daily', 'weekly', 'monthly'].map(tf => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-4 py-2 rounded font-medium transition-all ${
              timeframe === tf
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
            }`}
          >
            {tf.charAt(0).toUpperCase() + tf.slice(1)}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={timeframe === 'daily' ? dailyData : weeklyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={timeframe === 'daily' ? 'time' : 'day'} />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip formatter={(v) => v.toLocaleString()} />
          <Legend />
          <Area yAxisId="left" type="monotone" dataKey="throughput" fill="#3b82f6" stroke="#1e40af" opacity={0.6} name="Throughput (T)" />
          <Line yAxisId="right" type="monotone" dataKey="dispatches" stroke="#ef4444" strokeWidth={2} name="Dispatches" />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Peak Hours Analysis</p>
        <div className="space-y-2">
          {peakHours.map((ph, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <p className="text-sm font-medium text-slate-900">{ph.hour}</p>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${ph.percentage}%` }}></div>
                </div>
                <p className="text-sm font-bold text-slate-900 w-16">{ph.throughput.toLocaleString()}T</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ DISPATCH MANAGEMENT ============
export function DispatchManagement() {
  const dispatches = [
    { id: 'D001', status: 'In Progress', origin: 'LP1 Bokaro', destination: 'Kolkata', tonnage: 45, eta: '2h 30m', priority: 'High' },
    { id: 'D002', status: 'Queued', origin: 'LP2 Dhanbad', destination: 'Patna', tonnage: 38, eta: '4h 15m', priority: 'Medium' },
    { id: 'D003', status: 'In Progress', origin: 'LP3 Ranchi', destination: 'Jamshedpur', tonnage: 52, eta: '1h 45m', priority: 'High' },
    { id: 'D004', status: 'Scheduled', origin: 'LP1 Bokaro', destination: 'Dhanbad', tonnage: 40, eta: '6h', priority: 'Low' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Dispatch Management</h3>

      <div className="card p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-3 py-2 text-left font-bold">Dispatch ID</th>
              <th className="px-3 py-2 text-left font-bold">Status</th>
              <th className="px-3 py-2 text-left font-bold">Route</th>
              <th className="px-3 py-2 text-right font-bold">Tonnage</th>
              <th className="px-3 py-2 text-right font-bold">ETA</th>
              <th className="px-3 py-2 text-center font-bold">Priority</th>
            </tr>
          </thead>
          <tbody>
            {dispatches.map((d, i) => (
              <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-3 py-2 font-bold text-slate-900">{d.id}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    d.status === 'In Progress' ? 'bg-green-100 text-green-800' :
                    d.status === 'Queued' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-slate-600">{d.origin} → {d.destination}</td>
                <td className="px-3 py-2 text-right font-bold text-slate-900">{d.tonnage}T</td>
                <td className="px-3 py-2 text-right text-slate-600">{d.eta}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    d.priority === 'High' ? 'bg-red-100 text-red-800' :
                    d.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {d.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============ EQUIPMENT TRACKING ============
export function EquipmentTracking() {
  const equipment = [
    { name: 'Crane #1', status: 'Active', utilization: 92, lastMaintenance: '5 days ago', nextMaintenance: '25 days', efficiency: 98 },
    { name: 'Crane #2', status: 'Maintenance', utilization: 0, lastMaintenance: 'Today', nextMaintenance: '30 days', efficiency: 0 },
    { name: 'Conveyor A', status: 'Active', utilization: 87, lastMaintenance: '10 days ago', nextMaintenance: '20 days', efficiency: 95 },
    { name: 'Conveyor B', status: 'Active', utilization: 85, lastMaintenance: '8 days ago', nextMaintenance: '22 days', efficiency: 93 },
    { name: 'Loader #1', status: 'Active', utilization: 78, lastMaintenance: '3 days ago', nextMaintenance: '27 days', efficiency: 92 },
    { name: 'Loader #2', status: 'Idle', utilization: 0, lastMaintenance: '1 day ago', nextMaintenance: '29 days', efficiency: 0 },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Equipment Tracking</h3>

      <div className="space-y-2">
        {equipment.map((eq, i) => (
          <div key={i} className="card p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="font-bold text-slate-900">{eq.name}</p>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                eq.status === 'Active' ? 'bg-green-100 text-green-800' :
                eq.status === 'Maintenance' ? 'bg-orange-100 text-orange-800' :
                'bg-slate-100 text-slate-800'
              }`}>
                {eq.status}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-sm mb-2">
              <div>
                <p className="text-xs text-slate-600">Utilization</p>
                <p className="font-bold text-slate-900">{eq.utilization}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Efficiency</p>
                <p className="font-bold text-slate-900">{eq.efficiency}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Last Maintenance</p>
                <p className="font-bold text-slate-900">{eq.lastMaintenance}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Next Maintenance</p>
                <p className="font-bold text-slate-900">{eq.nextMaintenance}</p>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${eq.utilization}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============ MANPOWER ANALYTICS ============
export function ManpowerAnalytics() {
  const shifts = [
    { shift: 'Morning (6 AM - 2 PM)', available: 45, assigned: 42, utilization: 93, productivity: 92 },
    { shift: 'Afternoon (2 PM - 10 PM)', available: 40, assigned: 38, utilization: 95, productivity: 88 },
    { shift: 'Night (10 PM - 6 AM)', available: 30, assigned: 28, utilization: 93, productivity: 85 },
  ]

  const performanceData = [
    { name: 'Operator A', dispatches: 28, efficiency: 96, rating: 4.8 },
    { name: 'Operator B', dispatches: 25, efficiency: 92, rating: 4.5 },
    { name: 'Operator C', dispatches: 22, efficiency: 88, rating: 4.2 },
    { name: 'Operator D', dispatches: 26, efficiency: 94, rating: 4.6 },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Manpower Analytics</h3>

      <div className="space-y-3">
        {shifts.map((s, i) => (
          <div key={i} className="card p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="font-bold text-slate-900">{s.shift}</p>
              <p className="text-sm text-slate-600">{s.assigned}/{s.available} assigned</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
              <div>
                <p className="text-xs text-slate-600">Utilization</p>
                <p className="font-bold text-slate-900">{s.utilization}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Productivity</p>
                <p className="font-bold text-slate-900">{s.productivity}%</p>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${s.utilization}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Top Performers</p>
        <div className="space-y-2">
          {performanceData.map((p, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <p className="text-sm font-medium text-slate-900">{p.name}</p>
              <div className="text-right">
                <p className="text-xs text-slate-600">{p.dispatches} dispatches</p>
                <p className="text-sm font-bold text-slate-900">⭐ {p.rating}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ BOTTLENECK DETECTION ============
export function BottleneckDetection() {
  const bottlenecks = [
    { issue: 'LP1 Bokaro Capacity', severity: 'Critical', impact: '92% utilization', rootCause: 'High demand', recommendation: 'Add equipment', eta: '2 weeks' },
    { issue: 'Crane #2 Downtime', severity: 'High', impact: '15% throughput loss', rootCause: 'Maintenance', recommendation: 'Schedule maintenance', eta: '3 days' },
    { issue: 'Manpower Shortage', severity: 'Medium', impact: '8% efficiency loss', rootCause: 'Shift gap', recommendation: 'Hire temporary staff', eta: '1 week' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Bottleneck Detection</h3>

      <div className="space-y-3">
        {bottlenecks.map((b, i) => (
          <div key={i} className="card p-4 border-l-4 border-orange-500">
            <div className="flex justify-between items-start mb-2">
              <p className="font-bold text-slate-900">{b.issue}</p>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                b.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                b.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {b.severity}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <p className="text-xs text-slate-600">Impact</p>
                <p className="font-bold text-slate-900">{b.impact}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Root Cause</p>
                <p className="font-bold text-slate-900">{b.rootCause}</p>
              </div>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-xs text-slate-600">Recommendation</p>
              <p className="text-sm font-bold text-slate-900">{b.recommendation}</p>
              <p className="text-xs text-slate-600 mt-1">ETA: {b.eta}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============ THROUGHPUT FORECASTING ============
export function ThroughputForecasting() {
  const forecastData = [
    { date: 'Today', actual: 38500, forecast: 38500, confidence: 100 },
    { date: 'Tomorrow', actual: null, forecast: 39200, confidence: 92 },
    { date: 'Day 3', actual: null, forecast: 40100, confidence: 85 },
    { date: 'Day 4', actual: null, forecast: 39800, confidence: 78 },
    { date: 'Day 5', actual: null, forecast: 41500, confidence: 72 },
    { date: 'Day 6', actual: null, forecast: 42000, confidence: 68 },
    { date: 'Day 7', actual: null, forecast: 40500, confidence: 65 },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Throughput Forecasting</h3>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={forecastData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(v) => v ? `${v.toLocaleString()} T` : 'N/A'} />
          <Legend />
          <Area type="monotone" dataKey="forecast" fill="#e0e7ff" stroke="none" opacity={0.3} name="Forecast Range" />
          <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual" />
          <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Forecast Confidence</p>
        <div className="space-y-2">
          {forecastData.slice(1).map((f, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <p className="text-sm font-medium text-slate-900">{f.date}</p>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${f.confidence}%` }}></div>
                </div>
                <p className="text-sm font-bold text-slate-900 w-12">{f.confidence}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
