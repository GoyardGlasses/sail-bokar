/**
 * RouteAnalytics Component
 * Displays analytics and insights about routes and delays
 */

import React, { useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, AlertTriangle, Clock, Zap } from 'lucide-react'

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e']

export default function RouteAnalytics({ predictions }) {
  const analytics = useMemo(() => {
    if (!predictions || predictions.length === 0) {
      return null
    }

    // Sort by delay probability
    const byDelay = [...predictions].sort((a, b) => b.probability - a.probability)
    const highRiskRoutes = byDelay.filter((p) => p.probability > 0.15)
    const mediumRiskRoutes = byDelay.filter((p) => p.probability > 0.08 && p.probability <= 0.15)
    const lowRiskRoutes = byDelay.filter((p) => p.probability <= 0.08)

    // Average delay by route
    const routeStats = {}
    predictions.forEach((p) => {
      if (!routeStats[p.route]) {
        routeStats[p.route] = { route: p.route, totalDelay: 0, count: 0, maxProb: 0 }
      }
      routeStats[p.route].totalDelay += p.predicted_delay_hours
      routeStats[p.route].count += 1
      routeStats[p.route].maxProb = Math.max(routeStats[p.route].maxProb, p.probability)
    })

    const routeAverages = Object.values(routeStats)
      .map((r) => ({
        ...r,
        avgDelay: (r.totalDelay / r.count).toFixed(1),
      }))
      .sort((a, b) => b.avgDelay - a.avgDelay)

    // Risk distribution
    const riskDistribution = [
      { name: 'High Risk (>15%)', value: highRiskRoutes.length, color: '#ef4444' },
      { name: 'Medium Risk (8-15%)', value: mediumRiskRoutes.length, color: '#f97316' },
      { name: 'Low Risk (<8%)', value: lowRiskRoutes.length, color: '#22c55e' },
    ].filter((r) => r.value > 0)

    // Delay hours distribution
    const delayDistribution = [
      { range: '0-3h', count: predictions.filter((p) => p.predicted_delay_hours <= 3).length },
      { range: '3-6h', count: predictions.filter((p) => p.predicted_delay_hours > 3 && p.predicted_delay_hours <= 6).length },
      { range: '6-12h', count: predictions.filter((p) => p.predicted_delay_hours > 6 && p.predicted_delay_hours <= 12).length },
      { range: '12h+', count: predictions.filter((p) => p.predicted_delay_hours > 12).length },
    ]

    // Statistics
    const avgDelay = (predictions.reduce((sum, p) => sum + p.predicted_delay_hours, 0) / predictions.length).toFixed(1)
    const maxDelay = Math.max(...predictions.map((p) => p.predicted_delay_hours))
    const avgProbability = (predictions.reduce((sum, p) => sum + p.probability, 0) / predictions.length * 100).toFixed(1)

    return {
      highRiskCount: highRiskRoutes.length,
      mediumRiskCount: mediumRiskRoutes.length,
      lowRiskCount: lowRiskRoutes.length,
      avgDelay,
      maxDelay,
      avgProbability,
      routeAverages: routeAverages.slice(0, 8),
      riskDistribution,
      delayDistribution,
      topRiskyRoutes: byDelay.slice(0, 5),
    }
  }, [predictions])

  if (!analytics) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-red-50 border border-red-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">High Risk Routes</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{analytics.highRiskCount}</p>
            </div>
            <AlertTriangle className="text-red-600" size={24} />
          </div>
        </div>

        <div className="card bg-orange-50 border border-orange-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Medium Risk Routes</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">{analytics.mediumRiskCount}</p>
            </div>
            <TrendingUp className="text-orange-600" size={24} />
          </div>
        </div>

        <div className="card bg-green-50 border border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Low Risk Routes</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{analytics.lowRiskCount}</p>
            </div>
            <Zap className="text-green-600" size={24} />
          </div>
        </div>

        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Avg Delay</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{analytics.avgDelay}h</p>
            </div>
            <Clock className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Delay Hours Distribution */}
        <div className="card">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Delay Hours Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.delayDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="Number of Routes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Routes by Average Delay */}
      <div className="card">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Routes by Average Delay</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.routeAverages}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="route" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgDelay" fill="#f59e0b" name="Avg Delay (hours)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Risky Routes Table */}
      <div className="card">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Top 5 Riskiest Routes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-2 text-left text-slate-900">Route</th>
                <th className="px-4 py-2 text-left text-slate-900">Delay (hours)</th>
                <th className="px-4 py-2 text-left text-slate-900">Probability</th>
                <th className="px-4 py-2 text-left text-slate-900">Risk Level</th>
                <th className="px-4 py-2 text-left text-slate-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topRiskyRoutes.map((route, idx) => {
                const riskLevel = route.probability > 0.15 ? 'High' : route.probability > 0.08 ? 'Medium' : 'Low'
                const riskColor = riskLevel === 'High' ? 'text-red-600' : riskLevel === 'Medium' ? 'text-orange-600' : 'text-green-600'
                return (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-900 font-medium">{route.route}</td>
                    <td className="px-4 py-2 text-slate-600">{route.predicted_delay_hours}h</td>
                    <td className="px-4 py-2 text-slate-600">{(route.probability * 100).toFixed(1)}%</td>
                    <td className={`px-4 py-2 font-medium ${riskColor}`}>{riskLevel}</td>
                    <td className="px-4 py-2 text-slate-600">{route.action}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
