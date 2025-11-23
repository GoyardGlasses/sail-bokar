import React, { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, AlertCircle, FileText, Wrench, Download, Eye } from 'lucide-react'

// ============ COMPARATIVE ANALYSIS ============
export function ComparativeAnalysis() {
  const comparisonData = [
    { lp: 'LP1 Bokaro', throughput: 45000, efficiency: 87, cost: 950, rank: 1 },
    { lp: 'LP2 Dhanbad', throughput: 38000, efficiency: 82, cost: 920, rank: 2 },
    { lp: 'LP3 Ranchi', throughput: 32000, efficiency: 78, cost: 880, rank: 3 },
    { lp: 'LP4 Jamshedpur', throughput: 40000, efficiency: 85, cost: 940, rank: 4 },
    { lp: 'LP5 Patna', throughput: 28000, efficiency: 75, cost: 850, rank: 5 },
    { lp: 'LP6 Hatia', throughput: 35000, efficiency: 80, cost: 900, rank: 6 },
  ]

  const regionData = [
    { name: 'Region A', value: 118000, color: '#3b82f6' },
    { name: 'Region B', value: 135000, color: '#10b981' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Comparative Analysis</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="lp" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip formatter={(v) => `${(v/1000).toFixed(1)}K`} />
            <Bar dataKey="throughput" fill="#3b82f6" name="Throughput" />
          </BarChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={regionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${(value/1000).toFixed(0)}K`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {regionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${(v/1000).toFixed(1)}K tonnes`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-3 py-2 text-left font-bold">Rank</th>
              <th className="px-3 py-2 text-left font-bold">Loading Point</th>
              <th className="px-3 py-2 text-right font-bold">Throughput</th>
              <th className="px-3 py-2 text-right font-bold">Efficiency</th>
              <th className="px-3 py-2 text-right font-bold">Cost/Tonne</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, i) => (
              <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-3 py-2 font-bold text-slate-900">#{row.rank}</td>
                <td className="px-3 py-2 font-medium text-slate-900">{row.lp}</td>
                <td className="px-3 py-2 text-right text-slate-600">{(row.throughput/1000).toFixed(0)}K</td>
                <td className="px-3 py-2 text-right text-slate-600">{row.efficiency}%</td>
                <td className="px-3 py-2 text-right text-slate-600">₹{row.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============ RESOURCE OPTIMIZATION ============
export function ResourceOptimization() {
  const resources = [
    { name: 'Equipment Utilization', current: 87, target: 95, gap: 8, priority: 'High' },
    { name: 'Manpower Efficiency', current: 82, target: 90, gap: 8, priority: 'High' },
    { name: 'Fuel Consumption', current: 78, target: 85, gap: 7, priority: 'Medium' },
    { name: 'Cost per Tonne', current: 920, target: 850, gap: 70, priority: 'High' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Resource Optimization</h3>

      <div className="space-y-3">
        {resources.map((r, i) => (
          <div key={i} className="card p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="font-medium text-slate-900">{r.name}</p>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                r.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {r.priority}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-600">Current: {r.current} | Target: {r.target}</p>
              <p className="text-sm font-bold text-orange-600">Gap: {r.gap}</p>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${(r.current/r.target)*100}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============ REPORTING & INSIGHTS ============
export function ReportingInsights() {
  const insights = [
    {
      title: 'Peak Efficiency Window',
      description: 'Throughput peaks between 10 AM - 2 PM. Schedule 60% of dispatches in this window.',
      impact: 'High',
      action: 'Implement Schedule',
    },
    {
      title: 'Regional Imbalance',
      description: 'Region B has 14% higher throughput. Analyze best practices and replicate in Region A.',
      impact: 'High',
      action: 'Analyze Practices',
    },
    {
      title: 'Equipment Downtime',
      description: 'Crane #2 has 8% downtime. Preventive maintenance can reduce to 2%.',
      impact: 'Medium',
      action: 'Schedule Maintenance',
    },
    {
      title: 'Seasonal Adjustment',
      description: 'Q2 typically sees 15% demand increase. Prepare capacity now.',
      impact: 'Medium',
      action: 'Plan Capacity',
    },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Reporting & Insights</h3>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div key={i} className="card p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-2">
              <p className="font-bold text-slate-900">{insight.title}</p>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                insight.impact === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {insight.impact} Impact
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-3">{insight.description}</p>
            <button className="text-sm text-blue-600 font-medium hover:underline">{insight.action} →</button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button className="card p-4 text-center hover:bg-slate-50 transition">
          <FileText size={24} className="mx-auto mb-2 text-blue-600" />
          <p className="font-medium text-slate-900">Executive Summary</p>
          <p className="text-xs text-slate-600 mt-1">1-page overview</p>
        </button>
        <button className="card p-4 text-center hover:bg-slate-50 transition">
          <FileText size={24} className="mx-auto mb-2 text-green-600" />
          <p className="font-medium text-slate-900">Detailed Report</p>
          <p className="text-xs text-slate-600 mt-1">Full analysis</p>
        </button>
        <button className="card p-4 text-center hover:bg-slate-50 transition">
          <Download size={24} className="mx-auto mb-2 text-purple-600" />
          <p className="font-medium text-slate-900">Export Data</p>
          <p className="text-xs text-slate-600 mt-1">PDF, Excel, CSV</p>
        </button>
      </div>
    </div>
  )
}

// ============ PREDICTIVE MAINTENANCE ============
export function PredictiveMaintenance() {
  const equipment = [
    { name: 'Crane #1', status: 'Healthy', nextMaintenance: '45 days', reliability: 98, riskLevel: 'Low' },
    { name: 'Crane #2', status: 'Warning', nextMaintenance: '15 days', reliability: 85, riskLevel: 'Medium' },
    { name: 'Conveyor A', status: 'Healthy', nextMaintenance: '60 days', reliability: 96, riskLevel: 'Low' },
    { name: 'Conveyor B', status: 'Critical', nextMaintenance: '3 days', reliability: 72, riskLevel: 'High' },
    { name: 'Loader #1', status: 'Healthy', nextMaintenance: '30 days', reliability: 94, riskLevel: 'Low' },
    { name: 'Loader #2', status: 'Warning', nextMaintenance: '10 days', reliability: 80, riskLevel: 'Medium' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Predictive Maintenance</h3>

      <div className="space-y-2">
        {equipment.map((eq, i) => (
          <div key={i} className="card p-3">
            <div className="flex justify-between items-start mb-2">
              <p className="font-medium text-slate-900">{eq.name}</p>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  eq.status === 'Healthy' ? 'bg-green-100 text-green-800' :
                  eq.status === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {eq.status}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  eq.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                  eq.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {eq.riskLevel} Risk
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <p className="text-slate-600">Reliability: {eq.reliability}%</p>
              <p className="text-slate-600">Maintenance: {eq.nextMaintenance}</p>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-blue-500" style={{ width: `${eq.reliability}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============ INTEGRATION & AUTOMATION ============
export function IntegrationAutomation() {
  const integrations = [
    { name: 'Real-Time Data Sync', status: 'Active', lastSync: '2 min ago', frequency: 'Every 5 min' },
    { name: 'Automated Alerts', status: 'Active', lastAlert: '15 min ago', frequency: 'Real-time' },
    { name: 'API Integration', status: 'Active', uptime: '99.8%', frequency: 'Continuous' },
    { name: 'Workflow Automation', status: 'Active', tasksAutomated: 24, frequency: 'Daily' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Integration & Automation</h3>

      <div className="space-y-2">
        {integrations.map((int, i) => (
          <div key={i} className="card p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="font-medium text-slate-900">{int.name}</p>
              <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                {int.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-slate-600">Last Activity</p>
                <p className="font-bold text-slate-900">{int.lastSync || int.lastAlert || int.uptime || int.tasksAutomated}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Frequency</p>
                <p className="font-bold text-slate-900">{int.frequency}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 bg-blue-50">
        <p className="text-sm font-medium text-slate-900 mb-2">Automation Benefits</p>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>✓ 24/7 monitoring without manual intervention</li>
          <li>✓ Instant alerts for critical issues</li>
          <li>✓ Reduced response time by 80%</li>
          <li>✓ Improved data accuracy and consistency</li>
        </ul>
      </div>
    </div>
  )
}
