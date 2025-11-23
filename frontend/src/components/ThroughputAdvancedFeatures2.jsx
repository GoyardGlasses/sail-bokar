import React, { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts'
import { TrendingUp, TrendingDown, AlertCircle, Download, FileText, Eye, Bell } from 'lucide-react'

// ============ COST PER UNIT THROUGHPUT ============
export function CostPerUnitThroughput() {
  const costData = [
    { date: '2025-11-15', throughput: 38500, cost: 920, efficiency: 87, trend: 'stable' },
    { date: '2025-11-16', throughput: 39200, cost: 915, efficiency: 88, trend: 'up' },
    { date: '2025-11-17', throughput: 37800, cost: 925, efficiency: 86, trend: 'down' },
    { date: '2025-11-18', throughput: 40100, cost: 910, efficiency: 89, trend: 'up' },
    { date: '2025-11-19', throughput: 41500, cost: 905, efficiency: 90, trend: 'up' },
    { date: '2025-11-20', throughput: 38500, cost: 920, efficiency: 87, trend: 'stable' },
  ]

  const benchmarks = [
    { category: 'Your Cost', value: 920, color: '#3b82f6' },
    { category: 'Industry Avg', value: 900, color: '#10b981' },
    { category: 'Best in Class', value: 850, color: '#f59e0b' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Cost Per Unit Throughput</h3>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={costData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" label={{ value: 'Cost (₹)', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: 'Efficiency (%)', angle: 90, position: 'insideRight' }} />
          <Tooltip formatter={(v) => v.toLocaleString()} />
          <Legend />
          <Area yAxisId="left" type="monotone" dataKey="cost" fill="#3b82f6" stroke="#1e40af" opacity={0.6} name="Cost per Tonne" />
          <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} name="Efficiency %" />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {benchmarks.map((b, i) => (
          <div key={i} className="card p-4 text-center">
            <p className="text-sm text-slate-600">{b.category}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">₹{b.value}</p>
            {i === 0 && <p className="text-xs text-orange-600 mt-2">+8.2% vs best</p>}
            {i === 1 && <p className="text-xs text-green-600 mt-2">+2.2% vs avg</p>}
            {i === 2 && <p className="text-xs text-green-600 mt-2">Best in class</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============ ALERTS & NOTIFICATIONS ============
export function AlertsNotifications() {
  const [alerts] = useState([
    { id: 1, type: 'Capacity Alert', message: 'LP1 Bokaro at 92% capacity', severity: 'Critical', time: '2 min ago', action: 'View Details' },
    { id: 2, type: 'Performance', message: 'Throughput down 5% vs yesterday', severity: 'High', time: '15 min ago', action: 'Analyze' },
    { id: 3, type: 'Equipment', message: 'Crane #2 maintenance due in 3 days', severity: 'Medium', time: '1 hour ago', action: 'Schedule' },
    { id: 4, type: 'Dispatch', message: 'Dispatch D001 delayed by 30 minutes', severity: 'Medium', time: '2 hours ago', action: 'Track' },
    { id: 5, type: 'Manpower', message: 'Night shift understaffed by 2 operators', severity: 'High', time: '3 hours ago', action: 'Assign' },
  ])

  const thresholds = [
    { metric: 'Capacity Threshold', value: 85, current: 92, status: 'Exceeded' },
    { metric: 'Performance Threshold', value: 80, current: 87, status: 'Normal' },
    { metric: 'Equipment Utilization', value: 90, current: 85, status: 'Normal' },
    { metric: 'Cost per Tonne', value: 950, current: 920, status: 'Good' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Alerts & Notifications</h3>

      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="card p-4 border-l-4 border-orange-500">
            <div className="flex justify-between items-start mb-2">
              <p className="font-bold text-slate-900">{alert.type}</p>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                alert.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                alert.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {alert.severity}
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-2">{alert.message}</p>
            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-500">{alert.time}</p>
              <button className="text-xs text-blue-600 font-medium hover:underline">{alert.action} →</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Threshold Monitoring</p>
        <div className="space-y-2">
          {thresholds.map((t, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <p className="text-sm font-medium text-slate-900">{t.metric}</p>
              <div className="text-right">
                <p className="text-xs text-slate-600">Threshold: {t.value}</p>
                <p className={`text-sm font-bold ${
                  t.status === 'Exceeded' ? 'text-red-600' :
                  t.status === 'Good' ? 'text-green-600' :
                  'text-slate-900'
                }`}>
                  Current: {t.current} ({t.status})
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ EXPORT & REPORTING ============
export function ExportReporting() {
  const reports = [
    { name: 'Daily Throughput Report', frequency: 'Daily', lastGenerated: '2 hours ago', format: 'PDF, Excel' },
    { name: 'Weekly Summary', frequency: 'Weekly', lastGenerated: '1 day ago', format: 'PDF, Excel' },
    { name: 'Monthly Performance', frequency: 'Monthly', lastGenerated: '5 days ago', format: 'PDF, Excel' },
    { name: 'Equipment Maintenance', frequency: 'Weekly', lastGenerated: '3 days ago', format: 'PDF, Excel' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Export & Reporting</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-sm font-medium text-slate-900 mb-3">Quick Export</p>
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
          <p className="text-sm font-medium text-slate-900 mb-3">Scheduled Reports</p>
          <div className="space-y-2">
            <button className="w-full btn btn-secondary btn-sm justify-start">
              <Bell size={16} className="mr-2" />
              Daily Report (6 AM)
            </button>
            <button className="w-full btn btn-secondary btn-sm justify-start">
              <Bell size={16} className="mr-2" />
              Weekly Report (Monday)
            </button>
            <button className="w-full btn btn-secondary btn-sm justify-start">
              <Bell size={16} className="mr-2" />
              Monthly Report (1st)
            </button>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-slate-900 mb-3">Available Reports</p>
        <div className="space-y-2">
          {reports.map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <div>
                <p className="text-sm font-medium text-slate-900">{r.name}</p>
                <p className="text-xs text-slate-600">{r.frequency} • Last: {r.lastGenerated}</p>
              </div>
              <button className="text-sm text-blue-600 font-medium hover:underline">Download →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ HISTORICAL ANALYSIS ============
export function HistoricalAnalysis() {
  const [comparison, setComparison] = useState('yoy')

  const yoyData = [
    { month: 'Jan', current: 38500, previous: 35200, growth: 9.4 },
    { month: 'Feb', current: 39200, previous: 36800, growth: 6.5 },
    { month: 'Mar', current: 40100, previous: 37500, growth: 7.0 },
    { month: 'Apr', current: 41500, previous: 38200, growth: 8.6 },
    { month: 'May', current: 42800, previous: 39500, growth: 8.4 },
    { month: 'Jun', current: 44200, previous: 40800, growth: 8.3 },
  ]

  const momData = [
    { week: 'Week 1', current: 38500, previous: 37200, growth: 3.5 },
    { week: 'Week 2', current: 39200, previous: 38100, growth: 2.9 },
    { week: 'Week 3', current: 40100, previous: 39500, growth: 1.5 },
    { week: 'Week 4', current: 41500, previous: 40200, growth: 3.2 },
  ]

  const data = comparison === 'yoy' ? yoyData : momData

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Historical Analysis</h3>

      <div className="flex gap-2 mb-4">
        {['yoy', 'mom'].map(comp => (
          <button
            key={comp}
            onClick={() => setComparison(comp)}
            className={`px-4 py-2 rounded font-medium transition-all ${
              comparison === comp
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
            }`}
          >
            {comp === 'yoy' ? 'Year-over-Year' : 'Month-over-Month'}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={comparison === 'yoy' ? 'month' : 'week'} />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip formatter={(v) => v.toLocaleString()} />
          <Legend />
          <Area yAxisId="left" type="monotone" dataKey="previous" fill="#e0e7ff" stroke="none" opacity={0.3} name="Previous Period" />
          <Line yAxisId="left" type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2} name="Current" />
          <Line yAxisId="left" type="monotone" dataKey="previous" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" name="Previous" />
          <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#10b981" strokeWidth={2} name="Growth %" />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Average Growth</p>
          <p className="text-3xl font-bold text-green-600 mt-2">+6.8%</p>
          <p className="text-xs text-slate-600 mt-1">{comparison === 'yoy' ? 'Year-over-Year' : 'Month-over-Month'}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Highest Growth</p>
          <p className="text-3xl font-bold text-green-600 mt-2">+9.4%</p>
          <p className="text-xs text-slate-600 mt-1">January</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-slate-600">Lowest Growth</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">+1.5%</p>
          <p className="text-xs text-slate-600 mt-1">Week 3</p>
        </div>
      </div>
    </div>
  )
}
