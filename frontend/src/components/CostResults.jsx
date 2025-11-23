import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts'
import { Download, TrendingUp } from 'lucide-react'
import { exportCostData } from '../api/costApi'

export default function CostResults({ data, onExport }) {
  if (!data) {
    return (
      <div className="card p-8 text-center text-slate-600">
        <p>Run a prediction to see results</p>
      </div>
    )
  }

  const handleExport = async () => {
    try {
      await exportCostData(data, `cost_prediction_${new Date().toISOString().split('T')[0]}.csv`)
    } catch (error) {
      alert('Export failed: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-sm text-slate-600 mb-2">Predicted Average Cost Per Ton</p>
          <p className="text-4xl font-bold text-blue-600">₹{data.avg_cost_per_ton.toLocaleString()}</p>
          <p className="text-xs text-slate-600 mt-2">Based on historical data and current trends</p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-sm text-slate-600 mb-2">Predicted Total Cost</p>
          <p className="text-4xl font-bold text-green-600">₹{(data.total_cost / 1000000).toFixed(2)}M</p>
          <p className="text-xs text-slate-600 mt-2">Total estimated cost for period</p>
        </div>
      </div>

      {/* Cost by Destination Chart */}
      {data.by_destination && data.by_destination.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Cost Per Ton by Destination</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.by_destination}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="destination" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="cost_per_ton" fill="#3b82f6" name="Cost Per Ton" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Cost Drivers - Waterfall Chart */}
      {data.drivers && data.drivers.length > 0 ? (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Cost Drivers Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data.drivers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="impact" fill="#10b981" name="Impact (₹)" />
            </ComposedChart>
          </ResponsiveContainer>
          
          {/* Drivers Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="px-4 py-2 text-left font-bold text-slate-900">Driver</th>
                  <th className="px-4 py-2 text-right font-bold text-slate-900">Impact (₹)</th>
                  <th className="px-4 py-2 text-right font-bold text-slate-900">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {data.drivers.map((driver, idx) => {
                  const totalImpact = data.drivers.reduce((sum, d) => sum + d.impact, 0)
                  const percentage = ((driver.impact / totalImpact) * 100).toFixed(1)
                  return (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium text-slate-900">{driver.name}</td>
                      <td className="px-4 py-2 text-right text-slate-600">₹{driver.impact.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right text-slate-600">{percentage}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-6 bg-blue-50">
          <p className="text-sm text-slate-900 font-medium mb-2">Cost Breakdown Explanation</p>
          <p className="text-sm text-slate-600">
            The predicted cost per ton is based on multiple factors including distance to destination, 
            demurrage charges, handling costs, fuel surcharges, and other operational expenses. 
            The total cost is calculated by multiplying the average cost per ton by the total volume 
            of material transported during the specified period.
          </p>
        </div>
      )}

      {/* Export Button */}
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="btn btn-primary flex items-center gap-2"
        >
          <Download size={18} />
          Export as CSV
        </button>
      </div>
    </div>
  )
}
