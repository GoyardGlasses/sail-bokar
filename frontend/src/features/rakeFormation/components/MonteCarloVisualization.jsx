/**
 * Monte Carlo Simulation Visualization Component
 * Displays results of 10,000+ scenario simulations
 */

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AlertCircle, TrendingUp, TrendingDown, Activity, Target, Zap } from 'lucide-react'

// Import simulation functions with proper error handling
let runMonteCarloSimulation = null
let performSensitivityAnalysis = null
let compareScenarios = null

try {
  const monteCarloModule = require('../monteCarloSimulation')
  runMonteCarloSimulation = monteCarloModule.runMonteCarloSimulation
  performSensitivityAnalysis = monteCarloModule.performSensitivityAnalysis
  compareScenarios = monteCarloModule.compareScenarios
} catch (error) {
  console.warn('Monte Carlo module not fully loaded, using fallback:', error)
}

export default function MonteCarloVisualization() {
  const [simulationResults, setSimulationResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [numScenarios, setNumScenarios] = useState(5000)
  const [activeTab, setActiveTab] = useState('overview')
  const [sensitivityParam, setSensitivityParam] = useState('materialAvailability')
  const [sensitivityResults, setSensitivityResults] = useState(null)

  // Sample base scenario
  const baseScenario = {
    name: 'Base Scenario',
    materials: [
      { id: 'coal', quantity: 5000 },
      { id: 'ore', quantity: 3000 },
      { id: 'limestone', quantity: 2000 },
    ],
    orders: [
      { id: 'ord-1', materialId: 'coal', quantity: 500, destination: 'Kolkata', slaHours: 48 },
      { id: 'ord-2', materialId: 'ore', quantity: 400, destination: 'Mumbai', slaHours: 72 },
      { id: 'ord-3', materialId: 'limestone', quantity: 300, destination: 'Delhi', slaHours: 60 },
      { id: 'ord-4', materialId: 'coal', quantity: 600, destination: 'Kolkata', slaHours: 48 },
      { id: 'ord-5', materialId: 'ore', quantity: 350, destination: 'Bangalore', slaHours: 96 },
    ],
    routes: [
      { id: 'route-1', destination: 'Kolkata', baseDelay: 8 },
      { id: 'route-2', destination: 'Mumbai', baseDelay: 12 },
      { id: 'route-3', destination: 'Delhi', baseDelay: 10 },
      { id: 'route-4', destination: 'Bangalore', baseDelay: 15 },
    ],
    equipment: [
      { id: 'eq-1', type: 'loader' },
      { id: 'eq-2', type: 'conveyor' },
    ],
    budget: 500000,
    costBase: 50000,
  }

  // Run simulation
  const handleRunSimulation = async () => {
    setLoading(true)
    try {
      if (!runMonteCarloSimulation) {
        throw new Error('Monte Carlo simulation module not loaded')
      }
      const results = runMonteCarloSimulation(baseScenario, numScenarios)
      setSimulationResults(results)
    } catch (error) {
      console.error('Simulation error:', error)
      alert(`Simulation error: ${error.message}`)
    }
    setLoading(false)
  }

  // Run sensitivity analysis
  const handleSensitivityAnalysis = async () => {
    setLoading(true)
    try {
      if (!performSensitivityAnalysis) {
        throw new Error('Sensitivity analysis module not loaded')
      }
      const results = performSensitivityAnalysis(baseScenario, sensitivityParam)
      setSensitivityResults(results)
    } catch (error) {
      console.error('Sensitivity analysis error:', error)
      alert(`Sensitivity analysis error: ${error.message}`)
    }
    setLoading(false)
  }

  // Prepare cost distribution data
  const getCostDistributionData = () => {
    if (!simulationResults) return []
    return simulationResults.costDistribution.map((value, index) => ({
      bucket: `₹${(simulationResults.minCost + (index * (simulationResults.maxCost - simulationResults.minCost) / 10)) / 1000}k`,
      percentage: value,
    }))
  }

  // Prepare risk metrics data
  const getRiskMetricsData = () => {
    if (!simulationResults) return []
    return [
      { name: 'Cost Risk', value: simulationResults.riskMetrics.costRisk },
      { name: 'Delay Risk', value: simulationResults.riskMetrics.delayRisk },
      { name: 'Capacity Risk', value: simulationResults.riskMetrics.capacityRisk },
    ]
  }

  // Prepare sensitivity data
  const getSensitivityData = () => {
    if (!sensitivityResults) return []
    return sensitivityResults.variations.map((v) => ({
      variation: `${(v.value * 100).toFixed(0)}%`,
      costImpact: v.costImpact,
      utilizationImpact: v.utilizationImpact,
      slaImpact: v.slaImpact,
    }))
  }

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 text-white">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Zap className="w-8 h-8 text-yellow-400" />
          Monte Carlo Simulation Engine
        </h2>
        <p className="text-gray-400">Advanced scenario analysis with 10,000+ simulations</p>
      </div>

      {/* Control Panel */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Number of Scenarios</label>
            <input
              type="number"
              value={numScenarios}
              onChange={(e) => setNumScenarios(parseInt(e.target.value))}
              min="1000"
              max="50000"
              step="1000"
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sensitivity Parameter</label>
            <select
              value={sensitivityParam}
              onChange={(e) => setSensitivityParam(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            >
              <option value="materialAvailability">Material Availability</option>
              <option value="transportDelay">Transport Delay</option>
              <option value="costVariation">Cost Variation</option>
              <option value="equipmentFailure">Equipment Failure</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleRunSimulation}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded font-medium transition"
            >
              {loading ? 'Running...' : 'Run Simulation'}
            </button>
            <button
              onClick={handleSensitivityAnalysis}
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded font-medium transition"
            >
              {loading ? 'Analyzing...' : 'Sensitivity'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700">
        {['overview', 'distribution', 'risk', 'sensitivity', 'recommendations'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {simulationResults ? (
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="text-sm text-gray-400 mb-1">Average Cost</div>
                <div className="text-2xl font-bold text-green-400">
                  ₹{(simulationResults.averageCost / 1000).toFixed(0)}k
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Range: ₹{(simulationResults.minCost / 1000).toFixed(0)}k - ₹{(simulationResults.maxCost / 1000).toFixed(0)}k
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="text-sm text-gray-400 mb-1">Avg Utilization</div>
                <div className="text-2xl font-bold text-blue-400">
                  {simulationResults.averageUtilization.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Std Dev: ₹{(simulationResults.costStdDev / 1000).toFixed(0)}k
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="text-sm text-gray-400 mb-1">SLA Compliance</div>
                <div className="text-2xl font-bold text-purple-400">
                  {simulationResults.averageSLACompliance.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Success Rate: {((simulationResults.successfulScenarios / simulationResults.totalScenarios) * 100).toFixed(1)}%
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="text-sm text-gray-400 mb-1">Overall Risk</div>
                <div className={`text-2xl font-bold ${
                  simulationResults.riskMetrics.overallRisk < 20 ? 'text-green-400' :
                  simulationResults.riskMetrics.overallRisk < 40 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {simulationResults.riskMetrics.overallRisk.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {simulationResults.totalScenarios} scenarios analyzed
                </div>
              </div>
            </div>
          )}

          {/* Distribution Tab */}
          {activeTab === 'distribution' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-semibold mb-4">Cost Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getCostDistributionData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="bucket" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                    <Bar dataKey="percentage" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-semibold mb-4">Confidence Intervals (95%)</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Cost Range</div>
                    <div className="text-lg font-semibold">
                      ₹{(simulationResults.confidenceIntervals.cost95[0] / 1000).toFixed(0)}k - ₹{(simulationResults.confidenceIntervals.cost95[1] / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Utilization Range</div>
                    <div className="text-lg font-semibold">
                      {simulationResults.confidenceIntervals.utilization95[0].toFixed(1)}% - {simulationResults.confidenceIntervals.utilization95[1].toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">SLA Compliance Range</div>
                    <div className="text-lg font-semibold">
                      {simulationResults.confidenceIntervals.sla95[0].toFixed(1)}% - {simulationResults.confidenceIntervals.sla95[1].toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Risk Tab */}
          {activeTab === 'risk' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-semibold mb-4">Risk Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getRiskMetricsData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h3 className="text-lg font-semibold mb-4">Risk Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Cost Risk</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, simulationResults.riskMetrics.costRisk)}%` }}
                        />
                      </div>
                      <span className="font-semibold">{simulationResults.riskMetrics.costRisk.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Delay Risk</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, simulationResults.riskMetrics.delayRisk)}%` }}
                        />
                      </div>
                      <span className="font-semibold">{simulationResults.riskMetrics.delayRisk.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Capacity Risk</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, simulationResults.riskMetrics.capacityRisk)}%` }}
                        />
                      </div>
                      <span className="font-semibold">{simulationResults.riskMetrics.capacityRisk.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sensitivity Tab */}
          {activeTab === 'sensitivity' && sensitivityResults && (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">Sensitivity Analysis: {sensitivityResults.parameter}</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getSensitivityData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="variation" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                  <Legend />
                  <Line type="monotone" dataKey="costImpact" stroke="#ef4444" name="Cost Impact %" />
                  <Line type="monotone" dataKey="utilizationImpact" stroke="#3b82f6" name="Utilization Impact %" />
                  <Line type="monotone" dataKey="slaImpact" stroke="#10b981" name="SLA Impact %" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-slate-700 rounded text-sm">
                <strong>Elasticity:</strong> {sensitivityResults.elasticity.toFixed(2)} (% change in cost per 1% change in parameter)
              </div>
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="space-y-3">
              {simulationResults.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-300">{rec}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Click "Run Simulation" to start Monte Carlo analysis</p>
        </div>
      )}
    </div>
  )
}
