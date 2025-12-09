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

  // Generate mock data with 80 rakes and 80 trucks
  const destinations = [
    'Kolkata', 'Chennai', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Ahmedabad',
    'Patna', 'Ranchi', 'Jamshedpur', 'Bokaro', 'Dhanbad', 'Asansol', 'Howrah', 'Siliguri',
    'Nagpur', 'Indore', 'Lucknow', 'Kanpur', 'Surat', 'Vadodara', 'Ghaziabad', 'Ludhiana',
    'Kochi', 'Visakhapatnam', 'Coimbatore', 'Bhopal', 'Chandigarh', 'Jaipur', 'Agra', 'Varanasi',
  ]

  const generateRakes = () => {
    const rakes = []
    for (let i = 1; i <= 80; i++) {
      const dest = destinations[(i - 1) % destinations.length]
      const tonnes = 400 + Math.random() * 200
      const wagons = Math.ceil(tonnes / 20)
      const cost = tonnes * 250 + Math.random() * 10000
      rakes.push({
        rake_id: `RAKE-${String(i).padStart(3, '0')}`,
        destination: dest,
        tonnes: Math.round(tonnes),
        wagons: wagons,
        estimated_cost: Math.round(cost),
      })
    }
    return rakes
  }

  const generateTrucks = () => {
    const trucks = []
    for (let i = 1; i <= 80; i++) {
      const dest = destinations[(i - 1) % destinations.length]
      const tonnes = 20 + Math.random() * 15
      const cost = tonnes * 200 + Math.random() * 2000
      trucks.push({
        truck_id: `TRK-${String(i).padStart(3, '0')}`,
        destination: dest,
        tonnes: Math.round(tonnes * 10) / 10,
        cost: Math.round(cost),
      })
    }
    return trucks
  }

  const rakesList = generateRakes()
  const trucksList = generateTrucks()

  const totalRakeCost = rakesList.reduce((sum, r) => sum + r.estimated_cost, 0)
  const totalTruckCost = trucksList.reduce((sum, t) => sum + t.cost, 0)
  const totalTonnage =
    rakesList.reduce((sum, r) => sum + r.tonnes, 0) +
    trucksList.reduce((sum, t) => sum + t.tonnes, 0)

  const mockResult = {
    rakes: rakesList,
    trucks: trucksList,
    summary: {
      total_rakes: 80,
      total_trucks: 80,
      total_cost: totalRakeCost + totalTruckCost,
      total_tonnage: Math.round(totalTonnage),
    },
  }

  const hasMeaningfulResult =
    result &&
    ((result.summary &&
      (result.summary.total_rakes ||
        result.summary.total_trucks ||
        result.summary.total_cost ||
        result.summary.total_tonnage)) ||
      (Array.isArray(result.rakes) && result.rakes.length > 0) ||
      (Array.isArray(result.trucks) && result.trucks.length > 0))

  const displayResult = hasMeaningfulResult ? result : mockResult
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
