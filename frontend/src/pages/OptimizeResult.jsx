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

  // Mock data for demonstration
  const mockResult = {
    rakes: [
      { rake_id: 'RAKE-001', destination: 'Kolkata', tonnes: 500, wagons: 25, estimated_cost: 125000 },
      { rake_id: 'RAKE-002', destination: 'Chennai', tonnes: 450, wagons: 22, estimated_cost: 112500 },
      { rake_id: 'RAKE-003', destination: 'Mumbai', tonnes: 520, wagons: 26, estimated_cost: 130000 },
      { rake_id: 'RAKE-004', destination: 'Delhi', tonnes: 480, wagons: 24, estimated_cost: 120000 },
      { rake_id: 'RAKE-005', destination: 'Bangalore', tonnes: 510, wagons: 25, estimated_cost: 127500 },
    ],
    trucks: [
      { truck_id: 'TRK-001', destination: 'Patna', tonnes: 25, cost: 5000 },
      { truck_id: 'TRK-002', destination: 'Ranchi', tonnes: 28, cost: 5600 },
      { truck_id: 'TRK-003', destination: 'Jamshedpur', tonnes: 30, cost: 6000 },
      { truck_id: 'TRK-004', destination: 'Bokaro', tonnes: 22, cost: 4400 },
      { truck_id: 'TRK-005', destination: 'Dhanbad', tonnes: 26, cost: 5200 },
      { truck_id: 'TRK-006', destination: 'Asansol', tonnes: 24, cost: 4800 },
      { truck_id: 'TRK-007', destination: 'Kolkata', tonnes: 29, cost: 5800 },
      { truck_id: 'TRK-008', destination: 'Howrah', tonnes: 27, cost: 5400 },
    ],
    summary: {
      total_rakes: 5,
      total_trucks: 8,
      total_cost: 615300,
      total_tonnage: 2460,
    },
  }

  const displayResult = result || mockResult
  const { rakes = [], trucks = [], summary = {} } = displayResult
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Optimization Results</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Dispatch plan generated successfully</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="text-blue-600" size={24} />
            <span className="text-sm text-slate-600 dark:text-slate-400">Total Rakes</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{total_rakes}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="text-green-600" size={24} />
            <span className="text-sm text-slate-600 dark:text-slate-400">Total Trucks</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{total_trucks}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-amber-600" size={24} />
            <span className="text-sm text-slate-600 dark:text-slate-400">Total Cost</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">₹{(total_cost / 100000).toFixed(1)}L</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-purple-600" size={24} />
            <span className="text-sm text-slate-600 dark:text-slate-400">Total Tonnage</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{total_tonnage}</p>
        </div>
      </div>

      {/* Rakes Table */}
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Rakes ({rakes.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-600">
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Rake ID</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Destination</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Tonnes</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Wagons</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Cost</th>
              </tr>
            </thead>
            <tbody>
              {rakes.map((rake, idx) => (
                <tr key={idx} className="border-b border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-50">{rake.rake_id}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{rake.destination}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{rake.tonnes}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{rake.wagons}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">₹{(rake.estimated_cost / 100000).toFixed(2)}L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trucks Table */}
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Trucks ({trucks.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-600">
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Truck ID</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Destination</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Tonnes</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Cost</th>
              </tr>
            </thead>
            <tbody>
              {trucks.map((truck, idx) => (
                <tr key={idx} className="border-b border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-50">{truck.truck_id}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{truck.destination}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{truck.tonnes}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">₹{(truck.cost / 1000).toFixed(1)}K</td>
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
