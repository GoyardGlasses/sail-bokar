import React from 'react'
import { useOptimizeStore } from '../../store/useOptimizeStore'
import { Truck, Zap, DollarSign, Clock } from 'lucide-react'

export default function OptimizeResult() {
  const { optimizationResult } = useOptimizeStore()

  if (!optimizationResult) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Optimization Results</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500 text-center py-12">No optimization results available</p>
        </div>
      </div>
    )
  }

  const { rakes, trucks, summary } = optimizationResult

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Optimization Results</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="text-primary-600" size={24} />
            <span className="text-sm text-gray-600">Total Rakes</span>
          </div>
          <p className="text-3xl font-bold">{summary.total_rakes}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="text-secondary-600" size={24} />
            <span className="text-sm text-gray-600">Total Trucks</span>
          </div>
          <p className="text-3xl font-bold">{summary.total_trucks}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-success-600" size={24} />
            <span className="text-sm text-gray-600">Total Cost</span>
          </div>
          <p className="text-3xl font-bold">₹{(summary.total_cost / 100000).toFixed(1)}L</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-warning-600" size={24} />
            <span className="text-sm text-gray-600">Total Tonnage</span>
          </div>
          <p className="text-3xl font-bold">{summary.total_tonnage}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rakes ({rakes.length})</h2>
          <div className="space-y-3">
            {rakes.map((rake, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium">{rake.rake_id}</p>
                <p className="text-sm text-gray-600">{rake.tonnes} tonnes | {rake.wagons} wagons</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Trucks ({trucks.length})</h2>
          <div className="space-y-3">
            {trucks.map((truck, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium">{truck.truck_id}</p>
                <p className="text-sm text-gray-600">{truck.tonnes} tonnes</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
