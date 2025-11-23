import React, { useState } from 'react'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from 'recharts'
import { Download, Eye, EyeOff, TrendingUp } from 'lucide-react'

export default function ThroughputTimeline({ data, loadingPoint }) {
  const [showDispatches, setShowDispatches] = useState(true)
  const [showRegionComparison, setShowRegionComparison] = useState(false)

  if (!data || data.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-slate-600">No throughput data available</p>
      </div>
    )
  }

  const handleDownloadChart = () => {
    const element = document.querySelector('[data-chart-ref]')
    if (!element) return

    const canvas = element.querySelector('canvas')
    if (!canvas) {
      console.error('Canvas not found')
      return
    }

    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `throughput-${loadingPoint}-${new Date().toISOString().split('T')[0]}.png`
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setShowDispatches(!showDispatches)}
          className={`flex items-center gap-2 px-4 py-2 rounded border-2 transition-all ${
            showDispatches
              ? 'border-blue-500 bg-blue-50 text-blue-600'
              : 'border-slate-300 text-slate-600 hover:border-slate-400'
          }`}
        >
          {showDispatches ? <Eye size={18} /> : <EyeOff size={18} />}
          Dispatches
        </button>

        <button
          onClick={() => setShowRegionComparison(!showRegionComparison)}
          className={`flex items-center gap-2 px-4 py-2 rounded border-2 transition-all ${
            showRegionComparison
              ? 'border-purple-500 bg-purple-50 text-purple-600'
              : 'border-slate-300 text-slate-600 hover:border-slate-400'
          }`}
        >
          {showRegionComparison ? <Eye size={18} /> : <EyeOff size={18} />}
          Region Comparison
        </button>

        <button
          onClick={handleDownloadChart}
          className="flex items-center gap-2 px-4 py-2 rounded border-2 border-green-500 bg-green-50 text-green-600 hover:bg-green-100 transition-all"
        >
          <Download size={18} />
          Download Chart
        </button>
      </div>

      {/* Main Chart */}
      <div data-chart-ref className="card p-4">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" label={{ value: 'Throughput (Tonnes)', angle: -90, position: 'insideLeft' }} />
            {showDispatches && (
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Dispatches', angle: 90, position: 'insideRight' }} />
            )}
            <Tooltip
              formatter={(value, name) => {
                if (name === 'tonnes') return [`${value.toLocaleString()} tonnes`, 'Throughput']
                if (name === 'dispatches') return [`${value} dispatches`, 'Dispatches']
                return [value, name]
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="tonnes"
              fill="#3b82f6"
              stroke="#1e40af"
              opacity={0.6}
              name="Throughput (Tonnes)"
            />
            {showDispatches && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="dispatches"
                stroke="#ef4444"
                strokeWidth={2}
                name="Dispatches"
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Region Comparison Chart */}
      {showRegionComparison && (
        <div className="card p-4">
          <p className="text-sm font-medium text-slate-900 mb-3">Region Comparison</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toLocaleString()} tonnes`} />
              <Legend />
              <Line type="monotone" dataKey="tonnes" stroke="#3b82f6" strokeWidth={2} name="Region A" />
              <Line type="monotone" dataKey="tonnes" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Region B" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
