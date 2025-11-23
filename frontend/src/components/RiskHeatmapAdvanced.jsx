import React, { useState } from 'react'

export default function RiskHeatmap() {
  const [type, setType] = useState('route')

  const heatmap = [
    { route: 'Bokaro->Kolkata', Mon: 0.12, Tue: 0.15, Wed: 0.10, Thu: 0.18, Fri: 0.22, Sat: 0.25, Sun: 0.20 },
    { route: 'Bokaro->Hatia', Mon: 0.15, Tue: 0.12, Wed: 0.18, Thu: 0.14, Fri: 0.16, Sat: 0.20, Sun: 0.18 },
    { route: 'Bokaro->Dhanbad', Mon: 0.21, Tue: 0.25, Wed: 0.20, Thu: 0.28, Fri: 0.30, Sat: 0.32, Sun: 0.28 },
    { route: 'Bokaro->Patna', Mon: 0.08, Tue: 0.10, Wed: 0.09, Thu: 0.11, Fri: 0.12, Sat: 0.14, Sun: 0.10 },
    { route: 'Bokaro->Ranchi', Mon: 0.10, Tue: 0.12, Wed: 0.11, Thu: 0.13, Fri: 0.15, Sat: 0.18, Sun: 0.14 },
  ]

  const getColor = (v) => {
    if (v < 0.10) return 'bg-green-100 text-green-900'
    if (v < 0.15) return 'bg-yellow-100 text-yellow-900'
    if (v < 0.20) return 'bg-orange-100 text-orange-900'
    return 'bg-red-100 text-red-900'
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Risk Heatmap</h2>

      <div className="card flex gap-3">
        {[
          { id: 'route', label: 'Route Risk by Day' },
          { id: 'time', label: 'Time-Based Risk' },
          { id: 'material', label: 'Material Risk' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={`px-4 py-2 rounded-lg font-medium ${type === t.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-900'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-4 py-2 text-left font-bold">Route</th>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <th key={d} className="px-4 py-2 text-center font-bold">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmap.map((row) => (
              <tr key={row.route} className="border-b border-slate-200">
                <td className="px-4 py-2 font-medium">{row.route}</td>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <td key={d} className={`px-4 py-2 text-center font-bold ${getColor(row[d])}`}>
                    {(row[d] * 100).toFixed(0)}%
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 className="font-bold text-slate-900 mb-3">Risk Levels</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { range: '< 10%', color: 'bg-green-100', label: 'Low Risk' },
            { range: '10-15%', color: 'bg-yellow-100', label: 'Medium Risk' },
            { range: '15-20%', color: 'bg-orange-100', label: 'High Risk' },
            { range: '> 20%', color: 'bg-red-100', label: 'Critical Risk' },
          ].map((l) => (
            <div key={l.range} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded ${l.color}`} />
              <div><p className="text-xs font-medium text-slate-600">{l.label}</p><p className="text-xs text-slate-500">{l.range}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
