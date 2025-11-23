import React from 'react'
import { ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AccuracyDashboard() {
  const data = [
    { month: 'Jan', predicted: 8, actual: 7.5, error: 6.7 },
    { month: 'Feb', predicted: 6, actual: 6.2, error: 3.3 },
    { month: 'Mar', predicted: 9, actual: 8.8, error: 2.2 },
    { month: 'Apr', predicted: 5, actual: 5.5, error: 9.1 },
    { month: 'May', predicted: 7, actual: 6.9, error: 1.4 },
    { month: 'Jun', predicted: 8, actual: 8.1, error: 1.2 },
  ]

  const metrics = [
    { label: 'Overall Accuracy', value: '94.2%', trend: '+2.1%' },
    { label: 'Mean Absolute Error', value: '0.42h', trend: '-0.15h' },
    { label: 'Predictions Made', value: '2,847', trend: '+312' },
    { label: 'Model Confidence', value: '89.5%', trend: '+3.2%' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Model Accuracy Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="card">
            <p className="text-sm text-slate-600 mb-1">{m.label}</p>
            <p className="text-3xl font-bold text-slate-900">{m.value}</p>
            <p className="text-xs text-green-600 font-medium mt-2">{m.trend}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Prediction Accuracy Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="predicted" fill="#3b82f6" stroke="#3b82f6" name="Predicted" />
            <Line yAxisId="left" type="monotone" dataKey="actual" stroke="#10b981" name="Actual" strokeWidth={2} />
            <Bar yAxisId="right" dataKey="error" fill="#ef4444" name="Error %" opacity={0.3} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="card bg-blue-50 border border-blue-200">
        <h3 className="font-bold text-blue-900 mb-3">Model Trust Score</h3>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-blue-900">Overall Reliability</span>
          <span className="text-sm font-bold text-blue-900">89.5%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-3">
          <div className="bg-blue-600 h-3 rounded-full" style={{ width: '89.5%' }} />
        </div>
        <p className="text-sm text-blue-800 mt-3">
          Model trained on 2,847 predictions with 94.2% accuracy. High confidence in predictions.
        </p>
      </div>
    </div>
  )
}
