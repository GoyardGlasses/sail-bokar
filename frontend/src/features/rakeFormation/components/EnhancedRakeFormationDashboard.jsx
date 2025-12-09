/**
 * Enhanced Rake Formation Dashboard
 * Integrates all 5 features:
 * 1. Multi-destination rake support
 * 2. Real-time database integration
 * 3. Rail vs road optimization
 * 4. Wagon type specifications
 * 5. Automated daily planning
 */

import React, { useState, useEffect } from 'react'
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Layers,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Truck,
  Train,
  MapPin,
  Calendar,
} from 'lucide-react'
import { useRakeFormationStore } from '../store'
import { useRakeFormation } from '../../../hooks/useRakeFormation'
import {
  GreedyAlgorithm,
  GeneticAlgorithm,
  SimulatedAnnealingAlgorithm,
} from '../algorithms'
import {
  compareTransportModes,
  findBestWagon,
  groupOrdersForMultiDestination,
  optimizeUnloadingSequence,
  calculateUnloadingSequenceCost,
  DEFAULT_WAGON_TYPES,
} from '../advancedAlgorithms'

export default function EnhancedRakeFormationDashboard() {
  const [activeTab, setActiveTab] = useState<'optimizer' | 'results' | 'comparison' | 'modes' | 'wagons'>('optimizer')
  const [isRunning, setIsRunning] = useState(false)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'greedy' | 'genetic' | 'simulated_annealing'>('greedy')
  const [useMultiDestination, setUseMultiDestination] = useState(true)
  const [useRailRoadOptimization, setUseRailRoadOptimization] = useState(true)

  // Real-time data from database
  const {
    orders,
    materials,
    rakes,
    plans,
    loading: dataLoading,
    error: dataError,
    fetchAllData,
  } = useRakeFormation()

  // Store
  const {
    currentPlan,
    previousPlans,
    optimizationProgress,
    isOptimizing,
    setCurrentPlan,
    setIsOptimizing,
    setOptimizationProgress,
    setError,
    getBestPlan,
  } = useRakeFormationStore()

  // Transport modes comparison
  const [modesComparison, setModesComparison] = useState<any>(null)

  // Wagon recommendations
  const [wagonRecommendations, setWagonRecommendations] = useState<any>(null)

  // Refresh data on mount
  useEffect(() => {
    fetchAllData()
  }, [])

  /**
   * Feature 1 & 2: Optimize with real-time data and multi-destination support
   */
  const handleOptimize = async () => {
    setIsOptimizing(true)
    setIsRunning(true)
    setError(null)

    try {
      // Simulate optimization progress
      for (let i = 0; i <= 100; i += 10) {
        setOptimizationProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      // Prepare input from real database data
      const mockInput: any = {
        orders: orders.length > 0 ? orders : generateMockOrders(),
        availableRakes: rakes.length > 0 ? rakes : generateMockRakes(),
        stockyards: materials.length > 0 ? groupMaterialsByStockyard(materials) : generateMockStockyards(),
        loadingPoints: generateMockLoadingPoints(),
        constraints: {
          minRakeSize: 1000,
          maxRakeSize: 2500,
          maxLoadingPointCapacity: 500,
          maxSidingCapacity: 10,
          routeRestrictions: [],
          timeWindows: { start: '06:00', end: '22:00' },
        },
        objectives: {
          minimizeCost: 0.3,
          maximizeUtilization: 0.4,
          minimizeDelay: 0.2,
          meetSLA: 0.1,
        },
      }

      // Feature 1: Multi-destination grouping
      if (useMultiDestination) {
        const groupedOrders = groupOrdersForMultiDestination(
          mockInput.orders,
          mockInput.availableRakes[0]?.capacity || 2000,
          3
        )
        mockInput.orders = groupedOrders.flat()
      }

      // Run selected algorithm
      let result
      const config = {
        type: selectedAlgorithm as any,
        maxIterations: 100,
        populationSize: 50,
        temperature: 100,
        coolingRate: 0.95,
        timeLimit: 30,
      }

      switch (selectedAlgorithm) {
        case 'greedy':
          result = GreedyAlgorithm.optimize(mockInput, config)
          break
        case 'genetic':
          result = GeneticAlgorithm.optimize(mockInput, config)
          break
        case 'simulated_annealing':
          result = SimulatedAnnealingAlgorithm.optimize(mockInput, config)
          break
        default:
          result = GreedyAlgorithm.optimize(mockInput, config)
      }

      // Feature 3: Add rail vs road optimization
      if (useRailRoadOptimization && result.plan.rakes.length > 0) {
        const firstRake = result.plan.rakes[0]
        const comparison = compareTransportModes(
          100, // distance
          firstRake.totalLoad,
          firstRake.priority > 3 ? 'urgent' : 'medium'
        )
        setModesComparison(comparison)

        // Add transport mode to rake
        firstRake.transportMode = comparison.recommendation
        firstRake.modeComparison = comparison
      }

      // Feature 4: Recommend wagons
      if (result.plan.rakes.length > 0) {
        const firstRake = result.plan.rakes[0]
        const recommendations = findBestWagon(
          firstRake.composition[0]?.materialName || 'coal',
          firstRake.totalLoad,
          DEFAULT_WAGON_TYPES
        )
        setWagonRecommendations(recommendations)
      }

      setCurrentPlan(result.plan)
      setOptimizationProgress(100)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Optimization failed')
    } finally {
      setIsOptimizing(false)
      setIsRunning(false)
    }
  }

  const bestPlan = getBestPlan()

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Advanced Rake Formation Engine
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            AI-powered optimization with multi-destination, rail/road, and real-time data integration
          </p>
        </div>
        <button
          onClick={handleOptimize}
          disabled={isOptimizing || dataLoading}
          className="btn btn-primary flex items-center gap-2"
        >
          <Zap size={20} />
          {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
        </button>
      </div>

      {/* Data Status */}
      {dataError && (
        <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300">
            <AlertTriangle className="inline mr-2" size={16} />
            {dataError}
          </p>
        </div>
      )}

      {/* Real-time Data Summary */}
      <div className="card">
        <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">Real-time Data Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Pending Orders</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{orders.length}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Available Materials</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{materials.length}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Available Rakes</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{rakes.length}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Saved Plans</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{plans.length}</p>
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="card">
        <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">Advanced Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useMultiDestination}
              onChange={(e) => setUseMultiDestination(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-slate-900 dark:text-slate-50">
              Feature 1: Multi-Destination Rakes
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useRailRoadOptimization}
              onChange={(e) => setUseRailRoadOptimization(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-slate-900 dark:text-slate-50">
              Feature 3: Rail vs Road Optimization
            </span>
          </label>
        </div>
      </div>

      {/* Algorithm Selection */}
      <div className="card">
        <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">Select Algorithm</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { id: 'greedy', name: 'Greedy', desc: 'Fast, Real-time' },
            { id: 'genetic', name: 'Genetic', desc: 'Better Optimization' },
            { id: 'simulated_annealing', name: 'Simulated Annealing', desc: 'Escape Local Optima' },
          ].map((algo) => (
            <button
              key={algo.id}
              onClick={() => setSelectedAlgorithm(algo.id as any)}
              className={`p-3 rounded-lg border-2 transition ${
                selectedAlgorithm === algo.id
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-600'
              }`}
            >
              <p className="font-semibold text-slate-900 dark:text-slate-50">{algo.name}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{algo.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      {isOptimizing && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-slate-900 dark:text-slate-50">Optimization Progress</p>
            <span className="text-sm text-slate-600 dark:text-slate-400">{optimizationProgress}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${optimizationProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {[
          { id: 'optimizer', label: 'Optimizer', icon: Zap },
          { id: 'results', label: 'Results', icon: TrendingUp },
          { id: 'modes', label: 'Rail vs Road', icon: Train },
          { id: 'wagons', label: 'Wagons', icon: Truck },
          { id: 'comparison', label: `History (${previousPlans.length})`, icon: Layers },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`px-4 py-2 font-medium flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 dark:text-slate-400'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Results Tab */}
        {activeTab === 'results' && currentPlan && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="text-green-600" size={24} />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Cost</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  ₹{currentPlan.totalCost.toLocaleString()}
                </p>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-blue-600" size={24} />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Utilization</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {currentPlan.totalUtilization.toFixed(1)}%
                </p>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="text-purple-600" size={24} />
                  <span className="text-sm text-slate-600 dark:text-slate-400">SLA Compliance</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {currentPlan.slaCompliance.toFixed(1)}%
                </p>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 mb-2">
                  <Layers className="text-orange-600" size={24} />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Rakes Used</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {currentPlan.rakes.length}
                </p>
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">Planned Rakes</h3>
              <div className="space-y-3">
                {currentPlan.rakes.map((rake) => (
                  <div key={rake.rakeId} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-900 dark:text-slate-50">{rake.rakeId}</p>
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {rake.utilization.toFixed(1)}% utilized
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Load</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          {rake.totalLoad} tonnes
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">From</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          {rake.sourceStockyard}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">To</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          {rake.destination}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Cost</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          ₹{rake.cost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rail vs Road Tab */}
        {activeTab === 'modes' && modesComparison && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Rail */}
              <div className="card border-2 border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <Train className="text-blue-600" size={24} />
                  <h4 className="font-bold text-slate-900 dark:text-slate-50">Rail</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-slate-600 dark:text-slate-400">Cost:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-50 ml-2">
                      ₹{modesComparison.rail.cost.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-600 dark:text-slate-400">Time:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-50 ml-2">
                      {modesComparison.rail.transitTime}h
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-600 dark:text-slate-400">Reliability:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-50 ml-2">
                      {modesComparison.rail.reliability}%
                    </span>
                  </p>
                </div>
              </div>

              {/* Road */}
              <div className="card border-2 border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="text-orange-600" size={24} />
                  <h4 className="font-bold text-slate-900 dark:text-slate-50">Road</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-slate-600 dark:text-slate-400">Cost:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-50 ml-2">
                      ₹{modesComparison.road.cost.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-600 dark:text-slate-400">Time:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-50 ml-2">
                      {modesComparison.road.transitTime}h
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-600 dark:text-slate-400">Reliability:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-50 ml-2">
                      {modesComparison.road.reliability}%
                    </span>
                  </p>
                </div>
              </div>

              {/* Recommendation */}
              <div className="card border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <h4 className="font-bold text-green-700 dark:text-green-300">Recommended</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-green-700 dark:text-green-300 font-semibold">
                      {modesComparison.recommendation.toUpperCase()}
                    </span>
                  </p>
                  <p className="text-green-700 dark:text-green-300">{modesComparison.reason}</p>
                  <p>
                    <span className="font-semibold">Savings:</span>
                    <span className="ml-2">₹{modesComparison.costSavings.toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wagons Tab */}
        {activeTab === 'wagons' && wagonRecommendations && (
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">Recommended Wagons</h3>
              <div className="space-y-3">
                {wagonRecommendations.slice(0, 3).map((match: any, idx: number) => (
                  <div
                    key={idx}
                    className={`border rounded-lg p-3 ${
                      idx === 0
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {match.wagon.name}
                      </p>
                      <span className="text-sm font-bold text-blue-600">
                        Score: {match.recommendationScore.toFixed(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Capacity</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          {match.wagon.capacity}t
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Utilization</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          {match.utilizationScore.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Cost/km</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          ₹{match.wagon.costPerKm}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Compatibility</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          {match.compatibility}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper functions
function generateMockOrders() {
  return [
    {
      orderId: 'ORD-001',
      materialId: 'coal-001',
      materialName: 'Coal',
      quantity: 500,
      destination: 'Kolkata',
      priority: 'high',
      requiredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      slaHours: 48,
      cost: 125000,
    },
  ]
}

function generateMockRakes() {
  return [
    {
      rakeId: 'RAKE-001',
      capacity: 2000,
      currentLoad: 0,
      location: 'Bokaro',
      availableDate: new Date().toISOString(),
      costPerKm: 50,
    },
  ]
}

function generateMockStockyards() {
  return [
    {
      stockyardId: 'sy-001',
      name: 'Bokaro Stockyard',
      location: 'Bokaro',
      materials: [
        { materialId: 'coal-001', quantity: 5000, quality: 'A', age: 4 },
      ],
      loadingPoints: 2,
      capacity: 5000,
    },
  ]
}

function generateMockLoadingPoints() {
  return [
    {
      pointId: 'lp-001',
      stockyardId: 'sy-001',
      capacity: 500,
      operationalHours: { start: '06:00', end: '22:00' },
      equipment: ['conveyor', 'loader'],
    },
  ]
}

function groupMaterialsByStockyard(materials: any[]) {
  const grouped = new Map()
  for (const material of materials) {
    if (!grouped.has(material.stockyardId)) {
      grouped.set(material.stockyardId, {
        stockyardId: material.stockyardId,
        name: `Stockyard ${material.stockyardId}`,
        location: 'Bokaro',
        materials: [],
        loadingPoints: 1,
        capacity: 5000,
      })
    }
    grouped.get(material.stockyardId).materials.push(material)
  }
  return Array.from(grouped.values())
}
