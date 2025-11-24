/**
 * Rake Formation Dashboard
 * Core algorithm for optimal rake formation with multiple optimization strategies
 */

import React, { useState } from 'react'
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Layers,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import { useRakeFormationStore } from '../store'
import { GreedyAlgorithm, GeneticAlgorithm, SimulatedAnnealingAlgorithm } from '../algorithms'
import { RakeFormationInput, RakeFormationPlan } from '../types'

export default function RakeFormationDashboard() {
  const [activeTab, setActiveTab] = useState<'optimizer' | 'results' | 'comparison'>('optimizer')
  const [isRunning, setIsRunning] = useState(false)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'greedy' | 'genetic' | 'simulated_annealing'>('greedy')

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

  // Mock input data
  const mockInput: RakeFormationInput = {
    orders: [
      {
        orderId: 'ORD-001',
        materialId: 'coal-001',
        materialName: 'Coal',
        quantity: 500,
        destination: 'Kolkata',
        priority: 'high',
        requiredDate: '2025-11-26',
        slaHours: 48,
        cost: 125000,
      },
      {
        orderId: 'ORD-002',
        materialId: 'limestone-001',
        materialName: 'Limestone',
        quantity: 300,
        destination: 'Mumbai',
        priority: 'medium',
        requiredDate: '2025-11-28',
        slaHours: 120,
        cost: 75000,
      },
      {
        orderId: 'ORD-003',
        materialId: 'iron-001',
        materialName: 'Iron Ore',
        quantity: 800,
        destination: 'Jamshedpur',
        priority: 'urgent',
        requiredDate: '2025-11-25',
        slaHours: 24,
        cost: 200000,
      },
    ],
    availableRakes: [
      {
        rakeId: 'RAKE-001',
        capacity: 2000,
        currentLoad: 0,
        location: 'Bokaro',
        availableDate: '2025-11-24',
        costPerKm: 50,
      },
      {
        rakeId: 'RAKE-002',
        capacity: 2000,
        currentLoad: 0,
        location: 'Bokaro',
        availableDate: '2025-11-24',
        costPerKm: 50,
      },
      {
        rakeId: 'RAKE-003',
        capacity: 2000,
        currentLoad: 0,
        location: 'CMO',
        availableDate: '2025-11-24',
        costPerKm: 50,
      },
    ],
    stockyards: [
      {
        stockyardId: 'sy-001',
        name: 'Bokaro Stockyard',
        location: 'Bokaro',
        materials: [
          { materialId: 'coal-001', quantity: 5000, quality: 'A', age: 4 },
          { materialId: 'iron-001', quantity: 8000, quality: 'A', age: 9 },
        ],
        loadingPoints: 2,
        capacity: 5000,
      },
      {
        stockyardId: 'sy-002',
        name: 'CMO Stockyard',
        location: 'CMO',
        materials: [
          { materialId: 'limestone-001', quantity: 3500, quality: 'B', age: 6 },
        ],
        loadingPoints: 1,
        capacity: 3500,
      },
    ],
    loadingPoints: [
      {
        pointId: 'lp-001',
        stockyardId: 'sy-001',
        capacity: 500,
        operationalHours: { start: '06:00', end: '22:00' },
        equipment: ['conveyor', 'loader'],
      },
      {
        pointId: 'lp-002',
        stockyardId: 'sy-002',
        capacity: 400,
        operationalHours: { start: '06:00', end: '20:00' },
        equipment: ['conveyor'],
      },
    ],
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
            Rake Formation Engine
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            AI-powered optimization for rake formation and dispatch
          </p>
        </div>
        <button
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="btn btn-primary flex items-center gap-2"
        >
          <Zap size={20} />
          {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
        </button>
      </div>

      {/* Algorithm Selection */}
      <div className="card">
        <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">Select Algorithm</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'optimizer', label: 'Optimizer', icon: Zap },
          { id: 'results', label: 'Results', icon: TrendingUp },
          { id: 'comparison', label: `History (${previousPlans.length})`, icon: Layers },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`px-4 py-2 font-medium flex items-center gap-2 border-b-2 transition ${
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
        {/* Optimizer Tab */}
        {activeTab === 'optimizer' && (
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">Input Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Orders</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {mockInput.orders.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Quantity</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {mockInput.orders.reduce((sum, o) => sum + o.quantity, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">tonnes</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Available Rakes</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {mockInput.availableRakes.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Capacity</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {mockInput.availableRakes.reduce((sum, r) => sum + r.capacity, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">tonnes</p>
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* History Tab */}
        {activeTab === 'comparison' && (
          <div className="space-y-4">
            {previousPlans.length === 0 ? (
              <div className="card text-center py-8">
                <AlertTriangle className="mx-auto text-slate-400 mb-3" size={32} />
                <p className="text-slate-600 dark:text-slate-400">No optimization history yet</p>
              </div>
            ) : (
              previousPlans.map((plan, idx) => (
                <div key={plan.planId} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-50">
                        Plan #{previousPlans.length - idx}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {plan.algorithm} • {new Date(plan.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Cost</p>
                      <p className="font-bold text-slate-900 dark:text-slate-50">
                        ₹{plan.totalCost.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                      <p className="text-slate-600 dark:text-slate-400">Utilization</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {plan.totalUtilization.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                      <p className="text-slate-600 dark:text-slate-400">SLA</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {plan.slaCompliance.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                      <p className="text-slate-600 dark:text-slate-400">Rakes</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {plan.rakes.length}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
