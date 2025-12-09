import React, { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { AlertCircle, TrendingUp, TrendingDown, Clock, DollarSign, CheckCircle, AlertTriangle, Info, Zap, Brain, BarChart3, Activity, Shield, GitBranch, Download, MessageSquare, Eye } from 'lucide-react'
import {
  MonteCarloSimulation,
  SensitivityAnalysis,
  ScenarioOptimization,
  ComparativeScenarioAnalysis,
  MachineLearningPredictions,
  RealTimeScenarioMonitoring,
} from '../components/ScenarioAdvancedFeatures'
import {
  ScenarioBacktesting,
  AdvancedRiskAnalysis,
  ScenarioCollaboration,
  ExportReporting,
} from '../components/ScenarioAdvancedFeatures2'
import axios from 'axios'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

const API_BASE = 'http://127.0.0.1:8000'

export default function ScenarioAnalysisPage() {
  const { dataImported, getPrediction, lastUpdated } = useMLPredictions()
  const [mlScenarioAnalysis, setMlScenarioAnalysis] = useState(null)
  const [material, setMaterial] = useState('HR_Coils')
  const [predictedDemand, setPredictedDemand] = useState(2500)
  const [confidence, setConfidence] = useState(0.85)
  const [timeHorizon, setTimeHorizon] = useState(30)
  const [estimatedCost, setEstimatedCost] = useState(35000)
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState(15)
  const [riskFactors, setRiskFactors] = useState(['Supply Shortage', 'Market Volatility'])
  const [loading, setLoading] = useState(false)

  // Keep ML scenario_analysis prediction in sync with latest pipeline outputs
  useEffect(() => {
    if (!getPrediction) return
    const scenarioAnalysis = getPrediction('scenario_analysis')
    setMlScenarioAnalysis(scenarioAnalysis)
  }, [lastUpdated, getPrediction])

  const [analysisResult, setAnalysisResult] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [advancedTab, setAdvancedTab] = useState('monte-carlo')
  const [materials, setMaterials] = useState([])
  const [scenarioHistory, setScenarioHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const { data: importedData, isLoaded } = useImportedData()

  const availableRiskFactors = [
    'Supply Shortage',
    'Demand Spike',
    'Transportation Delay',
    'Quality Issue',
    'Equipment Failure',
    'Weather Impact',
    'Market Volatility',
    'Supplier Issue'
  ]

  const hasImportedOrders = useMemo(() => {
    return (
      isLoaded &&
      importedData &&
      Array.isArray(importedData.orders) &&
      importedData.orders.length > 0
    )
  }, [isLoaded, importedData])

  const importedOrdersSummary = useMemo(() => {
    if (!hasImportedOrders) return null

    let totalDemandFromOrders = 0
    try {
      importedData.orders.forEach((o) => {
        const qty = Number(o.totalQuantity ?? o.quantity ?? o.tonnage ?? 0)
        if (Number.isFinite(qty) && qty > 0) {
          totalDemandFromOrders += qty
        }
      })
    } catch (err) {
      console.error('Failed to summarize imported orders for Scenario Analysis:', err)
    }

    return {
      ordersCount: importedData.orders.length,
      totalDemand: totalDemandFromOrders,
    }
  }, [hasImportedOrders, importedData])

  // When imported data is available, use it to initialize predictedDemand
  useEffect(() => {
    if (!importedOrdersSummary || !importedOrdersSummary.totalDemand) return

    try {
      const raw = importedOrdersSummary.totalDemand
      const clamped = Math.max(100, Math.min(10000, Math.round(raw)))
      setPredictedDemand(clamped)
    } catch (err) {
      console.error('Failed to derive predicted demand from imported orders:', err)
    }
  }, [importedOrdersSummary])

  const mlScenarioSummary = useMemo(() => {
    if (!mlScenarioAnalysis) return null

    let scenarioCount = null

    if (Array.isArray(mlScenarioAnalysis)) {
      scenarioCount = mlScenarioAnalysis.length
    } else if (Array.isArray(mlScenarioAnalysis.scenario_predictions)) {
      scenarioCount = mlScenarioAnalysis.scenario_predictions.length
    }

    const riskLevel =
      mlScenarioAnalysis.overall_risk_level ||
      mlScenarioAnalysis.risk_level ||
      null

    if (scenarioCount == null && !riskLevel) {
      return { hasData: true }
    }

    return {
      scenarioCount,
      riskLevel,
    }
  }, [mlScenarioAnalysis])

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      const response = await axios.get(`${API_BASE}/scenario/materials`)
      if (response.data.data.materials) {
        setMaterials(response.data.data.materials)
      }
    } catch (error) {
      console.error('Error fetching materials:', error)
    }
  }

  const fetchScenarioHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/scenario/history/${material}?limit=10`)
      if (response.data.data.scenarios) {
        setScenarioHistory(response.data.data.scenarios)
        setShowHistory(true)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE}/scenario/analyze`, {
        material,
        predicted_demand: predictedDemand,
        confidence,
        time_horizon: timeHorizon,
        risk_factors: riskFactors.length > 0 ? riskFactors : undefined,
        estimated_cost: estimatedCost,
        estimated_delivery_time: estimatedDeliveryTime
      })

      setAnalysisResult(response.data.data)
      setActiveTab('overview')
    } catch (error) {
      console.error('Error analyzing scenario:', error)
      alert('Error analyzing scenario: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  const toggleRiskFactor = (factor) => {
    setRiskFactors(prev =>
      prev.includes(factor)
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    )
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'PROCEED':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'PROCEED_WITH_CAUTION':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'REVIEW_REQUIRED':
        return 'bg-red-100 border-red-300 text-red-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const getConfidenceColor = (level) => {
    switch (level) {
      case 'high':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const scenarioPredictionData = analysisResult?.scenario_predictions?.map((sp, idx) => ({
    name: sp.scenario_type,
    cost: sp.expected_cost,
    time: sp.expected_delivery_time,
    success: sp.success_probability * 100,
    probability: sp.probability * 100
  })) || []

  const similarScenariosData = analysisResult?.similar_scenarios?.slice(0, 5).map(s => ({
    name: s.scenario_id,
    similarity: s.similarity_score * 100,
    effectiveness: s.effectiveness * 100,
    cost: s.historical_cost,
    time: s.historical_delivery_time
  })) || []

  const radarData = analysisResult?.similar_scenarios?.slice(0, 3).map(s => ({
    name: s.scenario_id,
    similarity: s.similarity_score * 100,
    effectiveness: s.effectiveness * 100,
    cost: Math.min((s.historical_cost / estimatedCost) * 100, 100),
    time: Math.min((s.historical_delivery_time / estimatedDeliveryTime) * 100, 100)
  })) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Scenario-Based Predictive Analytics</h1>
          <p className="text-slate-400">Analyze future scenarios using historical context and data-driven decisions</p>
        </div>

        <InlineDataImport templateId="operations" />

        {(importedOrdersSummary || mlScenarioSummary) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {importedOrdersSummary && (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <p className="text-sm text-slate-300">Imported Orders</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {importedOrdersSummary.ordersCount.toLocaleString()} orders
                </p>
                {importedOrdersSummary.totalDemand > 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    Total demand ~ {Math.round(importedOrdersSummary.totalDemand).toLocaleString()} units
                  </p>
                )}
              </div>
            )}
            {mlScenarioSummary && (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <p className="text-sm text-slate-300">ML Scenario Analysis</p>
                {mlScenarioSummary.scenarioCount != null ? (
                  <p className="text-2xl font-bold text-blue-400 mt-1">
                    {mlScenarioSummary.scenarioCount} scenarios modeled
                  </p>
                ) : (
                  <p className="text-2xl font-bold text-blue-400 mt-1">Live model output</p>
                )}
                {mlScenarioSummary.riskLevel && (
                  <p className="text-xs text-slate-400 mt-1 uppercase">
                    Overall risk: {mlScenarioSummary.riskLevel}
                  </p>
                )}
                {!mlScenarioSummary.riskLevel && (
                  <p className="text-xs text-slate-400 mt-1">
                    Using global scenario_analysis predictions
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-white mb-6">Scenario Parameters</h2>

              {/* Material Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Material Type</label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  {materials.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Predicted Demand */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Predicted Demand: <span className="text-blue-400">{predictedDemand.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={predictedDemand}
                  onChange={(e) => setPredictedDemand(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Confidence */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confidence: <span className="text-blue-400">{(confidence * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Time Horizon */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Time Horizon (days): <span className="text-blue-400">{timeHorizon}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="365"
                  step="1"
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Estimated Cost */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Estimated Cost: <span className="text-blue-400">₹{estimatedCost.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Estimated Delivery Time */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Estimated Delivery Time (days): <span className="text-blue-400">{estimatedDeliveryTime}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  step="1"
                  value={estimatedDeliveryTime}
                  onChange={(e) => setEstimatedDeliveryTime(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Risk Factors */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">Risk Factors</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableRiskFactors.map(factor => (
                    <label key={factor} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={riskFactors.includes(factor)}
                        onChange={() => toggleRiskFactor(factor)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                      />
                      <span className="ml-2 text-sm text-slate-300">{factor}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded font-medium transition"
                >
                  {loading ? 'Analyzing...' : 'Analyze Scenario'}
                </button>
                <button
                  onClick={fetchScenarioHistory}
                  className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition"
                >
                  View History
                </button>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {analysisResult ? (
              <div className="space-y-6">
                {/* Main Tabs */}
                <div className="flex gap-2 border-b border-slate-700 overflow-x-auto pb-2">
                  {['overview', 'scenarios', 'similar', 'decision', 'advanced'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab)
                        if (tab === 'advanced') setAdvancedTab('monte-carlo')
                      }}
                      className={`px-4 py-2 font-medium transition whitespace-nowrap ${
                        activeTab === tab
                          ? 'text-blue-400 border-b-2 border-blue-400'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {tab === 'advanced' ? '🚀 Advanced' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Advanced Sub-Tabs */}
                {activeTab === 'advanced' && (
                  <div className="flex gap-2 border-b border-slate-700 overflow-x-auto pb-2 mt-4">
                    {[
                      { id: 'monte-carlo', label: 'Monte Carlo', icon: Zap },
                      { id: 'sensitivity', label: 'Sensitivity', icon: BarChart3 },
                      { id: 'optimization', label: 'Optimization', icon: TrendingUp },
                      { id: 'comparative', label: 'Comparative', icon: Activity },
                      { id: 'ml', label: 'ML Models', icon: Brain },
                      { id: 'monitoring', label: 'Monitoring', icon: Eye },
                      { id: 'backtest', label: 'Backtest', icon: GitBranch },
                      { id: 'risk', label: 'Risk', icon: Shield },
                      { id: 'collab', label: 'Collab', icon: MessageSquare },
                      { id: 'export', label: 'Export', icon: Download },
                    ].map(tab => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setAdvancedTab(tab.id)}
                          className={`flex items-center gap-2 px-3 py-2 font-medium transition whitespace-nowrap text-sm ${
                            advancedTab === tab.id
                              ? 'text-blue-400 border-b-2 border-blue-400'
                              : 'text-slate-400 hover:text-slate-300'
                          }`}
                        >
                          <Icon size={16} />
                          {tab.label}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                        <div className="text-sm text-slate-400 mb-1">Predicted Demand</div>
                        <div className="text-2xl font-bold text-white">{predictedDemand.toLocaleString()}</div>
                      </div>
                      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                        <div className="text-sm text-slate-400 mb-1">Confidence Level</div>
                        <div className="text-2xl font-bold text-blue-400">{(confidence * 100).toFixed(0)}%</div>
                      </div>
                      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                        <div className="text-sm text-slate-400 mb-1">Estimated Cost</div>
                        <div className="text-2xl font-bold text-white">₹{estimatedCost.toLocaleString()}</div>
                      </div>
                      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                        <div className="text-sm text-slate-400 mb-1">Delivery Time</div>
                        <div className="text-2xl font-bold text-white">{estimatedDeliveryTime} days</div>
                      </div>
                    </div>

                    {/* Similar Scenarios Summary */}
                    {analysisResult.similar_scenarios && analysisResult.similar_scenarios.length > 0 && (
                      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                        <h3 className="text-lg font-bold text-white mb-4">Top Similar Historical Scenarios</h3>
                        <div className="space-y-3">
                          {analysisResult.similar_scenarios.slice(0, 3).map((scenario, idx) => (
                            <div key={idx} className="bg-slate-700 rounded p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="font-medium text-white">{scenario.scenario_id}</div>
                                  <div className="text-sm text-slate-400">{new Date(scenario.timestamp).toLocaleDateString()}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-blue-400">
                                    {(scenario.similarity_score * 100).toFixed(1)}% Match
                                  </div>
                                  <div className="text-xs text-slate-400">Effectiveness: {(scenario.effectiveness * 100).toFixed(0)}%</div>
                                </div>
                              </div>
                              <div className="text-sm text-slate-300 mb-2">
                                <strong>Issues:</strong> {scenario.issues_faced.join(', ') || 'None'}
                              </div>
                              <div className="text-sm text-slate-300">
                                <strong>Resolution:</strong> {scenario.resolution_used}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Scenarios Tab */}
                {activeTab === 'scenarios' && scenarioPredictionData.length > 0 && (
                  <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                    <h3 className="text-lg font-bold text-white mb-4">Scenario Predictions</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={scenarioPredictionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                        <Legend />
                        <Bar dataKey="cost" fill="#3b82f6" name="Expected Cost (₹)" />
                        <Bar dataKey="time" fill="#10b981" name="Delivery Time (days)" />
                        <Bar dataKey="success" fill="#f59e0b" name="Success Probability (%)" />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Scenario Details */}
                    <div className="mt-6 space-y-3">
                      {analysisResult.scenario_predictions.map((sp, idx) => (
                        <div key={idx} className={`rounded-lg p-4 border ${
                          sp.scenario_type === 'Best Case' ? 'bg-green-900 border-green-700' :
                          sp.scenario_type === 'Most Likely' ? 'bg-blue-900 border-blue-700' :
                          'bg-red-900 border-red-700'
                        }`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-bold text-white">{sp.scenario_type}</div>
                            <div className="text-sm text-slate-300">Probability: {(sp.probability * 100).toFixed(0)}%</div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-slate-400">Expected Cost</div>
                              <div className="font-bold text-white">₹{sp.expected_cost.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Delivery Time</div>
                              <div className="font-bold text-white">{sp.expected_delivery_time.toFixed(1)} days</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Success Rate</div>
                              <div className="font-bold text-white">{(sp.success_probability * 100).toFixed(0)}%</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Similar Scenarios Tab */}
                {activeTab === 'similar' && similarScenariosData.length > 0 && (
                  <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                    <h3 className="text-lg font-bold text-white mb-4">Historical Scenario Comparison</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="similarity" name="Similarity %" stroke="#94a3b8" />
                        <YAxis dataKey="effectiveness" name="Effectiveness %" stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                        <Scatter name="Historical Scenarios" data={similarScenariosData} fill="#3b82f6" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Decision Tab */}
                {activeTab === 'decision' && analysisResult.decision_support && (
                  <div className="space-y-4">
                    {/* Recommended Action */}
                    <div className={`rounded-lg border-2 p-4 ${getActionColor(analysisResult.decision_support.recommended_action)}`}>
                      <div className="flex items-start gap-3">
                        {analysisResult.decision_support.recommended_action === 'PROCEED' ? (
                          <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                        ) : analysisResult.decision_support.recommended_action === 'PROCEED_WITH_CAUTION' ? (
                          <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
                        ) : (
                          <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                        )}
                        <div>
                          <div className="font-bold text-lg">{analysisResult.decision_support.recommended_action.replace(/_/g, ' ')}</div>
                          <div className="text-sm mt-1">{analysisResult.decision_support.action_description}</div>
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                        <div className="text-sm text-slate-400 mb-1">Expected Cost</div>
                        <div className="text-2xl font-bold text-white">₹{analysisResult.decision_support.expected_cost.toLocaleString()}</div>
                        <div className={`text-sm mt-1 ${analysisResult.decision_support.key_metrics.cost_variance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {analysisResult.decision_support.key_metrics.cost_variance > 0 ? '+' : ''}{analysisResult.decision_support.key_metrics.cost_variance.toFixed(1)}% variance
                        </div>
                      </div>
                      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                        <div className="text-sm text-slate-400 mb-1">Expected Delivery Time</div>
                        <div className="text-2xl font-bold text-white">{analysisResult.decision_support.expected_delivery_time.toFixed(1)} days</div>
                        <div className={`text-sm mt-1 ${analysisResult.decision_support.key_metrics.time_variance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {analysisResult.decision_support.key_metrics.time_variance > 0 ? '+' : ''}{analysisResult.decision_support.key_metrics.time_variance.toFixed(1)}% variance
                        </div>
                      </div>
                      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                        <div className="text-sm text-slate-400 mb-1">Success Probability</div>
                        <div className={`text-2xl font-bold ${getConfidenceColor(analysisResult.decision_support.confidence_level)}`}>
                          {(analysisResult.decision_support.expected_success_probability * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-slate-400 mt-1 capitalize">{analysisResult.decision_support.confidence_level} confidence</div>
                      </div>
                      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                        <div className="text-sm text-slate-400 mb-1">Risk Level</div>
                        <div className={`text-lg font-bold px-2 py-1 rounded inline-block ${getRiskLevelColor(analysisResult.recommendations?.risk_level || 'medium')}`}>
                          {analysisResult.recommendations?.risk_level?.toUpperCase() || 'MEDIUM'}
                        </div>
                      </div>
                    </div>

                    {/* Action Items */}
                    {analysisResult.decision_support.action_items && analysisResult.decision_support.action_items.length > 0 && (
                      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                        <h4 className="font-bold text-white mb-3">Action Items</h4>
                        <ul className="space-y-2">
                          {analysisResult.decision_support.action_items.map((item, idx) => (
                            <li key={idx} className="flex gap-2 text-slate-300">
                              <span className="text-blue-400 font-bold">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Contingency Plans */}
                    {analysisResult.decision_support.contingency_plans && analysisResult.decision_support.contingency_plans.length > 0 && (
                      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                        <h4 className="font-bold text-white mb-3">Contingency Plans</h4>
                        <div className="space-y-3">
                          {analysisResult.decision_support.contingency_plans.map((plan, idx) => (
                            <div key={idx} className="bg-slate-700 rounded p-3">
                              <div className="font-medium text-white mb-2">{plan.trigger}</div>
                              <div className="text-sm text-slate-300 mb-2"><strong>Action:</strong> {plan.action}</div>
                              <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                                <div>Cost: ₹{plan.estimated_cost.toLocaleString()}</div>
                                <div>Time: {plan.estimated_time} days</div>
                                <div>Effectiveness: {(plan.historical_effectiveness * 100).toFixed(0)}%</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Advanced Tab */}
                {activeTab === 'advanced' && (
                  <div className="space-y-6">
                    {advancedTab === 'monte-carlo' && <MonteCarloSimulation />}
                    {advancedTab === 'sensitivity' && <SensitivityAnalysis />}
                    {advancedTab === 'optimization' && <ScenarioOptimization />}
                    {advancedTab === 'comparative' && <ComparativeScenarioAnalysis />}
                    {advancedTab === 'ml' && <MachineLearningPredictions />}
                    {advancedTab === 'monitoring' && <RealTimeScenarioMonitoring />}
                    {advancedTab === 'backtest' && <ScenarioBacktesting />}
                    {advancedTab === 'risk' && <AdvancedRiskAnalysis />}
                    {advancedTab === 'collab' && <ScenarioCollaboration />}
                    {advancedTab === 'export' && <ExportReporting />}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
                <Info className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">Configure parameters and click "Analyze Scenario" to see results</p>
              </div>
            )}
          </div>
        </div>

        {/* Historical Data Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-2xl w-full max-h-96 overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Historical Scenarios - {material}</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                {scenarioHistory.map((scenario, idx) => (
                  <div key={idx} className="bg-slate-700 rounded p-3 border border-slate-600">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-white">{scenario.scenario_id}</div>
                        <div className="text-sm text-slate-400">{new Date(scenario.timestamp).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-400">Effectiveness: {(scenario.effectiveness * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm text-slate-300 mb-2">
                      <div>Demand: {scenario.demand.toLocaleString()}</div>
                      <div>Cost: ₹{scenario.cost.toLocaleString()}</div>
                      <div>Time: {scenario.delivery_time} days</div>
                    </div>
                    {scenario.issues && scenario.issues.length > 0 && (
                      <div className="text-sm text-slate-400 mb-2">
                        <strong>Issues:</strong> {scenario.issues.join(', ')}
                      </div>
                    )}
                    <div className="text-sm text-slate-300">
                      <strong>Resolution:</strong> {scenario.resolution}
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
