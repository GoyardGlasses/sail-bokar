/**
 * DelayResults Component
 * Displays delay prediction results with charts and tables
 */

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, AlertCircle } from 'lucide-react'

export default function DelayResults({ data, isLoading, error, onRetry }) {
  if (!data) return null

  const { confidence, summary, routes } = data

  // Prepare chart data
  const chartData = routes.map(route => ({
    route: route.route.substring(0, 15),
    probability: (route.probability * 100).toFixed(1),
    delay: route.predicted_delay_hours,
  }))

  // Download CSV
  const downloadCSV = () => {
    const headers = ['Route', 'Predicted Delay (Hours)', 'Probability', 'Recommended Action']
    const rows = routes.map(r => [
      r.route,
      r.predicted_delay_hours,
      (r.probability * 100).toFixed(1) + '%',
      r.action,
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `delay-prediction-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
          <p className="text-sm text-slate-600 mb-1">Overall Delay Probability</p>
          <p className="text-3xl font-bold text-blue-600">
            {(summary.overall_delay_prob * 100).toFixed(1)}%
          </p>
        </div>

        <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
          <p className="text-sm text-slate-600 mb-1">Confidence Score</p>
          <p className="text-3xl font-bold text-amber-600">
            {(confidence * 100).toFixed(0)}%
          </p>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-pink-50 border border-red-200">
          <p className="text-sm text-slate-600 mb-1">High Risk Routes</p>
          <p className="text-3xl font-bold text-red-600">
            {summary.top_risk?.length || 0}
          </p>
        </div>
      </div>

      {/* Top Risk Routes */}
      {summary.top_risk && summary.top_risk.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            Top Risk Routes
          </h3>
          <div className="space-y-2">
            {summary.top_risk.map((route, idx) => (
              <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-900">{route}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Delay Probability by Route</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="route" />
            <YAxis />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Bar dataKey="probability" fill="#3b82f6" name="Probability (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Results Table */}
      <div className="card overflow-x-auto">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Route Details</h3>
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-900">Route</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-900">Delay (Hours)</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-900">Probability</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route, idx) => (
              <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-900">{route.route}</td>
                <td className="px-4 py-3 text-slate-900">{route.predicted_delay_hours}</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {(route.probability * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-900 capitalize">{route.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Download Button */}
      <button
        onClick={downloadCSV}
        className="btn btn-primary flex items-center gap-2"
        aria-label="Download results as CSV"
      >
        <Download size={20} />
        Download CSV
      </button>
    </div>
  )
}
