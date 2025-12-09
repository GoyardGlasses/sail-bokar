/**
 * Monte Carlo Simulation Visualization Component - FIXED
 * Displays results of 10,000+ scenario simulations
 */

import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { AlertCircle, TrendingUp, TrendingDown, Activity, Target, Zap, Play } from 'lucide-react'

export default function MonteCarloVisualizationFixed() {
  const [simulationResults, setSimulationResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [numScenarios, setNumScenarios] = useState(5000)
  const [activeTab, setActiveTab] = useState('overview')

  // Generate mock simulation results
  const generateSimulationResults = (scenarios) => {
    const results = []
    for (let i = 0; i < scenarios; i++) {
      results.push({
        cost: 45000 + Math.random() * 15000,
        delay: 6 + Math.random() * 4,
        utilization: 70 + Math.random() * 25,
        slaCompliance: Math.random() > 0.1, // 90% compliance
      })
    }

    // Calculate statistics
    const costs = results.map((r) => r.cost).sort((a, b) => a - b)
    const delays = results.map((r) => r.delay).sort((a, b) => a - b)
    const utilizations = results.map((r) => r.utilization).sort((a, b) => a - b)

    const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length
    const avgDelay = delays.reduce((a, b) => a + b, 0) / delays.length
    const avgUtilization = utilizations.reduce((a, b) => a + b, 0) / utilizations.length

    return {
      scenarios: results,
      statistics: {
        cost: {
          min: costs[0],
          max: costs[costs.length - 1],
          avg: avgCost,
          p95: costs[Math.floor(costs.length * 0.95)],
          stdDev: Math.sqrt(
            costs.reduce((sum, cost) => sum + Math.pow(cost - avgCost, 2), 0) / costs.length
          ),
        },
        delay: {
          min: delays[0],
          max: delays[delays.length - 1],
          avg: avgDelay,
          p95: delays[Math.floor(delays.length * 0.95)],
          stdDev: Math.sqrt(
            delays.reduce((sum, delay) => sum + Math.pow(delay - avgDelay, 2), 0) / delays.length
          ),
        },
        utilization: {
          min: utilizations[0],
          max: utilizations[utilizations.length - 1],
          avg: avgUtilization,
          p95: utilizations[Math.floor(utilizations.length * 0.95)],
          stdDev: Math.sqrt(
            utilizations.reduce(
              (sum, util) => sum + Math.pow(util - avgUtilization, 2),
              0
            ) / utilizations.length
          ),
        },
        slaCompliance: (results.filter((r) => r.slaCompliance).length / results.length) * 100,
      },
    }
  }

  // Generate distribution data for charts
  const generateDistributionData = (results, metric, bins = 20) => {
    const values = results.map((r) => r[metric])
    const min = Math.min(...values)
    const max = Math.max(...values)
    const binSize = (max - min) / bins

    const distribution = Array(bins)
      .fill(0)
      .map((_, i) => ({
        range: `${(min + i * binSize).toFixed(0)}-${(min + (i + 1) * binSize).toFixed(0)}`,
        count: values.filter((v) => v >= min + i * binSize && v < min + (i + 1) * binSize).length,
      }))

    return distribution
  }

  // Run simulation
  const handleRunSimulation = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate processing time
      const results = generateSimulationResults(numScenarios)
      setSimulationResults(results)
    } catch (error) {
      console.error('Simulation error:', error)
      alert(`Simulation error: ${error.message}`)
    }
    setLoading(false)
  }

  const costDistribution = simulationResults
    ? generateDistributionData(simulationResults.scenarios, 'cost')
    : []
  const delayDistribution = simulationResults
    ? generateDistributionData(simulationResults.scenarios, 'delay')
    : []

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  return (
    <div className="w-full space-y-6">
      {/* Control Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          Monte Carlo Simulation Engine
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Scenarios
            </label>
            <input
              type="number"
              min="1000"
              max="50000"
              step="1000"
              value={numScenarios}
              onChange={(e) => setNumScenarios(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              More scenarios = more accurate results
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Base Cost
            </label>
            <input
              type="text"
              value="₹50,000"
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Budget
            </label>
            <input
              type="text"
              value="₹5,00,000"
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          {loading ? 'Running Simulation...' : `Run Simulation (${numScenarios} Scenarios)`}
        </button>
      </div>

      {/* Results */}
      {simulationResults && (
        <>
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'cost', label: '💰 Cost Analysis' },
              { id: 'delay', label: '⏱️ Delay Analysis' },
              { id: 'risk', label: '⚠️ Risk Assessment' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Cost Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Average Cost</h3>
                  <TrendingDown className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{simulationResults.statistics.cost.avg.toFixed(0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Range: ₹{simulationResults.statistics.cost.min.toFixed(0)} - ₹
                  {simulationResults.statistics.cost.max.toFixed(0)}
                </p>
              </div>

              {/* Delay Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Average Delay</h3>
                  <Activity className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {simulationResults.statistics.delay.avg.toFixed(1)}h
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Range: {simulationResults.statistics.delay.min.toFixed(1)}h -{' '}
                  {simulationResults.statistics.delay.max.toFixed(1)}h
                </p>
              </div>

              {/* Utilization Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Avg Utilization</h3>
                  <Target className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {simulationResults.statistics.utilization.avg.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Range: {simulationResults.statistics.utilization.min.toFixed(1)}% -{' '}
                  {simulationResults.statistics.utilization.max.toFixed(1)}%
                </p>
              </div>

              {/* SLA Compliance Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">SLA Compliance</h3>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {simulationResults.statistics.slaCompliance.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Scenarios meeting SLA
                </p>
              </div>
            </div>
          )}

          {/* Cost Analysis Tab */}
          {activeTab === 'cost' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Cost Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Delay Analysis Tab */}
          {activeTab === 'delay' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Delay Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={delayDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#f59e0b" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Risk Assessment Tab */}
          {activeTab === 'risk' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Risk Metrics
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cost Std Dev</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{simulationResults.statistics.cost.stdDev.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Delay Std Dev</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {simulationResults.statistics.delay.stdDev.toFixed(2)}h
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">95th Percentile Cost</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{simulationResults.statistics.cost.p95.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Recommendations
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      Budget allocation: ₹{(simulationResults.statistics.cost.p95 * 1.1).toFixed(0)}
                    </p>
                  </div>
                  <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded">
                    <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-900 dark:text-green-200">
                      SLA compliance is {simulationResults.statistics.slaCompliance.toFixed(1)}% -
                      acceptable
                    </p>
                  </div>
                  <div className="flex gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-900 dark:text-orange-200">
                      Average delay: {simulationResults.statistics.delay.avg.toFixed(1)}h -
                      monitor closely
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* No Results Message */}
      {!simulationResults && !loading && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8 text-center border border-blue-200 dark:border-blue-800">
          <Zap className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Ready to Run Simulation
          </h3>
          <p className="text-blue-800 dark:text-blue-300">
            Click "Run Simulation" to analyze {numScenarios} scenarios and get insights
          </p>
        </div>
      )}
    </div>
  )
}
