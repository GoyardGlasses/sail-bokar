import React, { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Zap, TrendingDown, Maximize2, Lock, Eye, Settings, History, Download, GitBranch, CheckCircle, AlertCircle, Brain } from 'lucide-react'
import {
  ConstraintManagement,
  OptimizationSensitivityAnalysis,
  RealTimeOptimizationMonitoring,
  SolutionComparison,
  AdvancedVisualization,
  GeneticAlgorithmTuning,
} from '../components/OptimizationAdvancedFeatures'
import {
  HistoricalAnalysis,
  ExportReportingOptimization,
  MultiAlgorithmComparison,
  ConstraintVisualization,
  SolutionValidation,
} from '../components/OptimizationAdvancedFeatures2'
import axios from 'axios'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

const API_BASE = 'http://127.0.0.1:8000'

export default function AdvancedOptimizationPage() {
  const { dataImported, getPrediction } = useMLPredictions()
  const { data: importedData, isLoaded } = useImportedData()
  const [mlRouteOptimization, setMlRouteOptimization] = useState(null)
  const [orders, setOrders] = useState([
    { id: '1', material: 'HR_Coils', destination: 'Kolkata', quantity: 500, distance: 250 },
    { id: '2', material: 'CR_Coils', destination: 'Patna', quantity: 300, distance: 180 },
    { id: '3', material: 'Plates', destination: 'Ranchi', quantity: 400, distance: 150 }
  ])
  const [optimizationResult, setOptimizationResult] = useState(null)

  // Get ML prediction when data is imported
  useEffect(() => {
    if (dataImported) {
      const routeOpt = getPrediction('route_optimization')
      setMlRouteOptimization(routeOpt)
    }
  }, [dataImported, getPrediction])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('results')
  const [mlModels] = useState({
    modeSelection: { name: 'Mode Selection', accuracy: 87.8, status: 'active' },
  })
  const [newOrder, setNewOrder] = useState({
    material: 'HR_Coils',
    destination: 'Kolkata',
    quantity: 100,
    distance: 250
  })

  const hasImportedOrders = useMemo(() => {
    return (
      isLoaded &&
      importedData &&
      Array.isArray(importedData.orders) &&
      importedData.orders.length > 0
    )
  }, [isLoaded, importedData])

  // When imported data is available, map it into orders while keeping mocks as fallback
  useEffect(() => {
    if (!hasImportedOrders) return

    try {
      const mappedOrders = importedData.orders.map((o, index) => {
        const id = o.id || o.orderId || (index + 1).toString()
        const material = o.product || o.material || 'HR_Coils'
        const destination = o.destination || 'Kolkata'
        const quantity = Number(o.quantity ?? o.totalQuantity ?? o.tonnage ?? 100)
        const distance = Number(o.distance ?? 250)

        return {
          id,
          material,
          destination,
          quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 100,
          distance: Number.isFinite(distance) && distance > 0 ? distance : 250,
        }
      })

      if (mappedOrders.length > 0) {
        setOrders(mappedOrders)
      }
    } catch (err) {
      console.error('Failed to map imported orders for Advanced Optimization:', err)
    }
  }, [hasImportedOrders, importedData])

  const mlRouteSummary = useMemo(() => {
    if (!mlRouteOptimization || typeof mlRouteOptimization !== 'object') return null

    const raw = Array.isArray(mlRouteOptimization)
      ? mlRouteOptimization[0]
      : mlRouteOptimization

    if (!raw || typeof raw !== 'object') return null

    const optimalRoute =
      raw.optimalRoute ||
      raw.best_route ||
      raw.recommended_route ||
      null

    const costRaw = Number(
      raw.costSavings ??
      raw.cost_savings ??
      raw.expected_savings ??
      0
    )
    const timeRaw = Number(
      raw.timeSavings ??
      raw.time_savings ??
      raw.time_reduction ??
      0
    )

    const costSavings = Number.isFinite(costRaw) && costRaw !== 0 ? costRaw : null
    const timeSavings = Number.isFinite(timeRaw) && timeRaw !== 0 ? timeRaw : null

    if (!optimalRoute && costSavings === null && timeSavings === null) return null

    return {
      optimalRoute,
      costSavings,
      timeSavings,
    }
  }, [mlRouteOptimization])

  const optimize = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE}/optimize/routes/multi-objective`, {
        orders: orders.map((o, idx) => ({
          id: o.id || idx.toString(),
          ...o
        }))
      })
      setOptimizationResult(response.data.data)
    } catch (error) {
      console.error('Error optimizing:', error)
    } finally {
      setLoading(false)
    }
  }

  const addOrder = () => {
    setOrders([...orders, {
      id: Date.now().toString(),
      ...newOrder
    }])
    setNewOrder({
      material: 'HR_Coils',
      destination: 'Kolkata',
      quantity: 100,
      distance: 250
    })
  }

  const removeOrder = (id) => {
    setOrders(orders.filter(o => o.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-yellow-600" />
          <h1 className="text-3xl font-bold text-gray-900">Advanced Multi-Objective Optimization</h1>
        </div>
        <p className="text-gray-600">NSGA2 Evolutionary Algorithm</p>
      </div>

      <InlineDataImport templateId="operations" />

      {(hasImportedOrders || mlRouteSummary) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hasImportedOrders && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-600">Imported Orders Used</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {importedData.orders.length.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Orders from uploaded dataset are feeding the optimizer
              </p>
            </div>
          )}
          {mlRouteSummary && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600">ML Route Optimization Insight</p>
              {mlRouteSummary.optimalRoute && (
                <p className="text-sm font-semibold text-green-700 mt-1">
                  Best Route: {mlRouteSummary.optimalRoute}
                </p>
              )}
              <div className="mt-1 text-xs text-gray-600 space-y-1">
                {mlRouteSummary.costSavings !== null && (
                  <p>Cost savings: ₹{Math.round(mlRouteSummary.costSavings).toLocaleString()}</p>
                )}
                {mlRouteSummary.timeSavings !== null && (
                  <p>Time savings: {mlRouteSummary.timeSavings.toFixed(1)} hours</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Order */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Order</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
            <select
              value={newOrder.material}
              onChange={(e) => setNewOrder({...newOrder, material: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option>HR_Coils</option>
              <option>CR_Coils</option>
              <option>Plates</option>
              <option>Wire_Rods</option>
              <option>TMT_Bars</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
            <select
              value={newOrder.destination}
              onChange={(e) => setNewOrder({...newOrder, destination: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option>Kolkata</option>
              <option>Patna</option>
              <option>Ranchi</option>
              <option>Durgapur</option>
              <option>Haldia</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (tonnes)</label>
            <input
              type="number"
              value={newOrder.quantity}
              onChange={(e) => setNewOrder({...newOrder, quantity: parseFloat(e.target.value)})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Distance (km)</label>
            <input
              type="number"
              value={newOrder.distance}
              onChange={(e) => setNewOrder({...newOrder, distance: parseFloat(e.target.value)})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addOrder}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Order
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Orders ({orders.length})</h2>
        <div className="space-y-2">
          {orders.map(order => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{order.material} → {order.destination}</p>
                <p className="text-sm text-gray-600">{order.quantity} tonnes | {order.distance} km</p>
              </div>
              <button
                onClick={() => removeOrder(order.id)}
                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Optimize Button */}
      <div className="flex gap-4">
        <button
          onClick={optimize}
          disabled={loading || orders.length === 0}
          className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 font-semibold"
        >
          {loading ? 'Optimizing...' : 'Run Multi-Objective Optimization'}
        </button>
      </div>

      {/* Advanced Features Tabs */}
      {optimizationResult && (
        <div className="space-y-6">
          <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-2">
            {[
              { id: 'results', label: 'Results', icon: TrendingDown },
              { id: 'constraints', label: 'Constraints', icon: Lock },
              { id: 'sensitivity', label: 'Sensitivity', icon: Eye },
              { id: 'monitoring', label: 'Monitoring', icon: Zap },
              { id: 'comparison', label: 'Comparison', icon: Maximize2 },
              { id: 'visualization', label: 'Visualization', icon: Maximize2 },
              { id: 'tuning', label: 'GA Tuning', icon: Settings },
              { id: 'history', label: 'History', icon: History },
              { id: 'export', label: 'Export', icon: Download },
              { id: 'algorithms', label: 'Algorithms', icon: GitBranch },
              { id: 'validation', label: 'Validation', icon: CheckCircle },
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-yellow-600 text-yellow-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          {activeTab === 'results' && (
            <>
              {/* Best Solution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              Best Solution
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Total Cost</p>
                <p className="text-3xl font-bold text-gray-900">₹{optimizationResult.best_solution.cost.toFixed(0)}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Delivery Time</p>
                <p className="text-3xl font-bold text-gray-900">{optimizationResult.best_solution.time.toFixed(1)} hrs</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Efficiency</p>
                <p className="text-3xl font-bold text-gray-900">{optimizationResult.best_solution.efficiency.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Optimization Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Method</p>
                <p className="text-lg font-bold text-gray-900">{optimizationResult.optimization_method}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Solutions Found</p>
                <p className="text-lg font-bold text-gray-900">{optimizationResult.n_solutions}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Generations</p>
                <p className="text-lg font-bold text-gray-900">{optimizationResult.statistics.generations}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Population</p>
                <p className="text-lg font-bold text-gray-900">{optimizationResult.statistics.population_size}</p>
              </div>
            </div>
          </div>
            </>
          )}

          {/* Other Tabs */}
          {activeTab === 'constraints' && <ConstraintManagement />}
          {activeTab === 'sensitivity' && <OptimizationSensitivityAnalysis />}
          {activeTab === 'monitoring' && <RealTimeOptimizationMonitoring />}
          {activeTab === 'comparison' && <SolutionComparison />}
          {activeTab === 'visualization' && <AdvancedVisualization />}
          {activeTab === 'tuning' && <GeneticAlgorithmTuning />}
          {activeTab === 'history' && <HistoricalAnalysis />}
          {activeTab === 'export' && <ExportReportingOptimization />}
          {activeTab === 'algorithms' && <MultiAlgorithmComparison />}
          {activeTab === 'validation' && <SolutionValidation />}
        </div>
      )}

      {/* Algorithm Comparison */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Optimization Algorithms</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-2 border-yellow-600 rounded-lg p-4 bg-yellow-50">
            <h3 className="font-bold text-gray-900 mb-2">NSGA2 (Current)</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Multi-objective</li>
              <li>✓ Pareto optimal</li>
              <li>✓ Scalable</li>
              <li>✓ Non-dominated solutions</li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">Genetic Algorithm</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Population-based</li>
              <li>✓ Good for large spaces</li>
              <li>✗ Slower convergence</li>
              <li>✗ Single objective</li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">Greedy Heuristic</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Very fast</li>
              <li>✓ Simple</li>
              <li>✗ Local optima</li>
              <li>✗ Limited quality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
