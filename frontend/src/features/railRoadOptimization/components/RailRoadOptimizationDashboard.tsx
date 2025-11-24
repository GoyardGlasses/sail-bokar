/**
 * Rail vs Road Optimization Dashboard
 * Cost analysis and mode selection
 */

import React, { useState } from 'react'
import { TrendingDown, Truck, Train, Leaf, DollarSign, Clock } from 'lucide-react'
import { useRailRoadOptimizationStore } from '../store'

export default function RailRoadOptimizationDashboard() {
  const [quantity, setQuantity] = useState(500)
  const [distance, setDistance] = useState(500)
  const [priority, setPriority] = useState('medium')

  const { analyzeCost, optimizeMode, getAnalytics } = useRailRoadOptimizationStore()

  const analysis = analyzeCost(quantity, distance)
  const optimization = optimizeMode(quantity, distance, priority)
  const analytics = getAnalytics()

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Rail vs Road Optimization
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Cost analysis and transport mode selection
        </p>
      </div>

      {/* Input Controls */}
      <div className="card grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
            Quantity (tonnes)
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
            Distance (km)
          </label>
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
          >
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Recommendation */}
      {optimization && (
        <div className="card border-2 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              Recommended Mode
            </h3>
            <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full font-bold">
              {optimization.recommendedMode.toUpperCase()}
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{optimization.reasoning}</p>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Cost</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                ₹{optimization.estimatedCost.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Time</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {optimization.estimatedTime.toFixed(1)}h
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Reliability</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {optimization.reliability}%
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Emissions</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {(optimization.emissions / 1000).toFixed(1)}T
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cost Comparison */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rail */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Train className="text-blue-600" size={24} />
              <h3 className="font-bold text-slate-900 dark:text-slate-50">Rail</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total Cost</span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  ₹{analysis.railCost!.totalCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Per Tonne</span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  ₹{analysis.railCost!.costPerTonne.toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Transit Time</span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  {analysis.railCost!.transitTime.toFixed(1)}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Emissions</span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  {(analysis.carbonComparison.railEmissions / 1000).toFixed(1)}T
                </span>
              </div>
            </div>
          </div>

          {/* Road */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="text-orange-600" size={24} />
              <h3 className="font-bold text-slate-900 dark:text-slate-50">Road</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total Cost</span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  ₹{analysis.roadCost!.totalCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Per Tonne</span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  ₹{analysis.roadCost!.costPerTonne.toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Transit Time</span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  {analysis.roadCost!.transitTime.toFixed(1)}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Emissions</span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  {(analysis.carbonComparison.roadEmissions / 1000).toFixed(1)}T
                </span>
              </div>
            </div>
          </div>

          {/* Savings */}
          <div className="card bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="text-green-600" size={24} />
              <h3 className="font-bold text-slate-900 dark:text-slate-50">Savings</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Cost Savings</span>
                <span className="font-semibold text-green-600">
                  {analysis.savingsPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Amount</span>
                <span className="font-semibold text-green-600">
                  ₹{Math.abs(analysis.railCost!.totalCost - analysis.roadCost!.totalCost).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Emissions Savings</span>
                <span className="font-semibold text-green-600">
                  {analysis.carbonComparison.savingsPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Best Mode</span>
                <span className="font-semibold text-green-600">
                  {analysis.recommendation.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics */}
      <div className="card">
        <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">Overall Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Shipments</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {analytics.totalShipments}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Rail Usage</p>
            <p className="text-2xl font-bold text-blue-600">
              {analytics.railPercentage.toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Road Usage</p>
            <p className="text-2xl font-bold text-orange-600">
              {analytics.roadPercentage.toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Emissions</p>
            <p className="text-2xl font-bold text-red-600">
              {(analytics.totalEmissions / 1000).toFixed(1)}T
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
