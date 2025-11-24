import React from 'react'
import { useOptimizeStore } from '../../store/useOptimizeStore'
import { Truck, Zap, DollarSign, Clock, Download, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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
  const totalTonnage = rakesList.reduce((sum, r) => sum + r.tonnes, 0) + 
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

  const displayResult = result || mockResult
  const { rakes = [], trucks = [], summary = {} } = displayResult
  const { total_rakes = 0, total_trucks = 0, total_cost = 0, total_tonnage = 0 } = summary

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Optimization Results</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Dispatch plan generated successfully</p>
        </div>
        <button
          onClick={() => navigate('/optimize')}
          className="btn btn-outline flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          New Optimization
        </button>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Rakes ({rakes.length})</h2>
          <div className="space-y-3">
            {rakes.map((rake, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-600/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <p className="font-medium text-slate-900 dark:text-slate-50">{rake.rake_id}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{rake.destination} | {rake.tonnes} tonnes | {rake.wagons} wagons</p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">₹{(rake.estimated_cost / 100000).toFixed(2)}L</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Trucks ({trucks.length})</h2>
          <div className="space-y-3">
            {trucks.map((truck, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-600/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <p className="font-medium text-slate-900 dark:text-slate-50">{truck.truck_id}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{truck.destination} | {truck.tonnes} tonnes</p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">₹{(truck.cost / 1000).toFixed(1)}K</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
