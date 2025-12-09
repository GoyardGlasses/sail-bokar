import React from 'react'
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Download } from 'lucide-react'

export default function ForecastCharts({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="card space-y-4">
        <div className="h-96 bg-slate-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!data || !data.predictions || data.predictions.length === 0) {
    return null
  }

  const handleExport = (format) => {
    alert(`Exporting as ${format.toUpperCase()}...`)
  }

  // Combine historical and predicted data
  const chartData = [
    ...(data.historical_data || []),
    ...data.predictions,
  ]

  // KPI calculations
  const summary = data.summary || {}
  const horizonDays = data.predictions.length
  const avgDemand = Math.round(
    data.predictions.reduce((sum, p) => sum + (p.demand || 0), 0) / data.predictions.length
  )

  let peakDemand = null
  let peakDate = null
  data.predictions.forEach((p) => {
    const d = typeof p.demand === 'number' ? p.demand : 0
    if (!Number.isFinite(d)) return
    if (peakDemand === null || d > peakDemand) {
      peakDemand = d
      peakDate = p.date
    }
  })

  const totalTonnes =
    typeof summary.predicted_tonnes === 'number' && Number.isFinite(summary.predicted_tonnes)
      ? summary.predicted_tonnes
      : avgDemand * horizonDays

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-slate-600 mb-1">Predicted Demand (Avg)</p>
          <p className="text-3xl font-bold text-slate-900">{avgDemand.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2">tonnes</p>
        </div>

        <div className="card">
          <p className="text-sm text-slate-600 mb-1">Predicted Rakes Required</p>
          <p className="text-3xl font-bold text-slate-900">{Math.round(avgDemand / 160)}</p>
          <p className="text-xs text-slate-500 mt-2">rakes</p>
        </div>

        <div className="card">
          <p className="text-sm text-slate-600 mb-1">Model Confidence</p>
          <p className="text-3xl font-bold text-slate-900">{(data.model_confidence * 100).toFixed(1)}%</p>
          <p className="text-xs text-slate-500 mt-2">trust score</p>
        </div>
      </div>

      {/* Time-Series Chart */}
      <div className="card">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Demand Forecast with 90% Confidence Interval</h3>
        <p className="text-xs text-slate-600 mb-3">
          Over the next {horizonDays} days, the model predicts an average of {avgDemand.toLocaleString()} tonnes per
          day, totalling approximately {totalTonnes.toLocaleString()} tonnes. The blue line shows predicted demand by
          day, while the shaded band between the upper and lower series is the 90% confidence interval.{' '}
          {peakDemand != null && peakDate && (
            <span>
              The highest day in this forecast is {peakDate} at about {peakDemand.toLocaleString()} tonnes, which is
              roughly {Math.round((peakDemand / avgDemand - 1) * 100)}% above the average.
            </span>
          )}
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval={Math.floor(chartData.length / 10)}
            />
            <YAxis />
            <Tooltip
              formatter={(value) => value?.toLocaleString()}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="upper"
              fill="#dbeafe"
              stroke="none"
              name="90% Upper Bound"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="lower"
              fill="#ffffff"
              stroke="none"
              name="90% Lower Bound"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="demand"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Predicted Demand"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Table */}
      <div className="card">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Forecast Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-4 py-2 text-left font-bold text-slate-900">Date</th>
                <th className="px-4 py-2 text-right font-bold text-slate-900">Demand (tonnes)</th>
                <th className="px-4 py-2 text-right font-bold text-slate-900">Lower Bound</th>
                <th className="px-4 py-2 text-right font-bold text-slate-900">Upper Bound</th>
                <th className="px-4 py-2 text-right font-bold text-slate-900">Rakes Required</th>
              </tr>
            </thead>
            <tbody>
              {data.predictions.slice(0, 10).map((pred, idx) => (
                <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-900">{pred.date}</td>
                  <td className="px-4 py-2 text-right font-medium text-slate-900">
                    {pred.demand?.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-600">
                    {pred.lower?.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-600">
                    {pred.upper?.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-slate-900">
                    {Math.round((pred.demand || 0) / 160)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => handleExport('png')}
          className="flex-1 btn btn-secondary"
        >
          <Download size={18} className="inline mr-2" />
          Export as PNG
        </button>
        <button
          onClick={() => handleExport('pdf')}
          className="flex-1 btn btn-secondary"
        >
          <Download size={18} className="inline mr-2" />
          Export as PDF
        </button>
      </div>
    </div>
  )
}
