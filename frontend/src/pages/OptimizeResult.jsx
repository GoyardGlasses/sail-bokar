import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Zap, DollarSign, Clock, Download, ArrowLeft } from 'lucide-react'
import { useOptimizeStore } from '../store/useOptimizeStore'
import { formatCurrency, formatDate, getStatusColor } from '../utils/format'

/**
 * OptimizeResult - Display optimization results
 */
export default function OptimizeResult() {
  const navigate = useNavigate()
  const { result } = useOptimizeStore()

  if (!result) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate('/optimize')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Optimization
        </button>
        <div className="card text-center py-12">
          <p className="text-slate-600">No optimization results available</p>
        </div>
      </div>
    )
  }

  const { rakes = [], trucks = [], summary = {} } = result
  const { total_cost = 0, total_tonnage = 0, total_rakes = 0, total_trucks = 0 } = summary

  const handleExport = () => {
    const dataStr = JSON.stringify(result, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `optimization-result-${Date.now()}.json`
    link.click()
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Optimization Results</h1>
          <p className="text-slate-600 mt-1">Dispatch plan generated successfully</p>
        </div>
        <button
          onClick={handleExport}
          className="btn btn-primary flex items-center gap-2"
        >
          <Download size={20} />
          Export Plan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-responsive">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="text-blue-600" size={24} />
            <span className="text-sm text-slate-600">Total Rakes</span>
          </div>
          <p className="text-3xl font-bold">{total_rakes}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="text-green-600" size={24} />
            <span className="text-sm text-slate-600">Total Trucks</span>
          </div>
          <p className="text-3xl font-bold">{total_trucks}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-amber-600" size={24} />
            <span className="text-sm text-slate-600">Total Cost</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(total_cost)}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-purple-600" size={24} />
            <span className="text-sm text-slate-600">Total Tonnage</span>
          </div>
          <p className="text-3xl font-bold">{total_tonnage}</p>
        </div>
      </div>

      {/* Rakes Table */}
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Rakes ({rakes.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Rake ID</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Destination</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Tonnes</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Wagons</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Cost</th>
              </tr>
            </thead>
            <tbody>
              {rakes.map((rake, idx) => (
                <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">{rake.rake_id}</td>
                  <td className="py-3 px-4">{rake.destination}</td>
                  <td className="py-3 px-4">{rake.tonnes}</td>
                  <td className="py-3 px-4">{rake.wagons}</td>
                  <td className="py-3 px-4">{formatCurrency(rake.estimated_cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trucks Table */}
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Trucks ({trucks.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Truck ID</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Destination</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Tonnes</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Cost</th>
              </tr>
            </thead>
            <tbody>
              {trucks.map((truck, idx) => (
                <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">{truck.truck_id}</td>
                  <td className="py-3 px-4">{truck.destination}</td>
                  <td className="py-3 px-4">{truck.tonnes}</td>
                  <td className="py-3 px-4">{formatCurrency(truck.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={() => navigate('/optimize')}
        className="btn btn-outline"
      >
        <ArrowLeft size={20} />
        New Optimization
      </button>
    </div>
  )
}
