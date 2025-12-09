import React, { useState, useEffect } from 'react'
import CostForm from '../components/CostForm'
import CostResults from '../components/CostResults'
import {
  EnsembleCostModels,
  ProbabilisticCostForecasting,
  CostSensitivityAnalysis,
  CostBiasAnalysis,
  MonteCarloSimulation,
  CostDriversAnalysis,
  CostVersionControl,
  CostCollaboration,
  CostExportShare,
} from '../components/CostEnhancementsV2'
import {
  CostOptimization,
  CostForecastingTrends,
  ScenarioPlanning,
  Benchmarking,
  CostAllocation,
} from '../components/CostAdvancedAnalytics'
import {
  AdvancedAnalytics,
  RealTimeMonitoring,
  ReportingInsights,
  AdvancedMLFeatures,
} from '../components/CostAdvancedAnalytics2'
import { predictCost } from '../api/costApi'
import { DollarSign, TrendingUp, BarChart3, Eye, Zap, Lock, GitBranch, MessageSquare, Share2, Target, Lightbulb, Brain, Bell, BarChart4, Layers } from 'lucide-react'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'
import InlineDecisionSummary from '../features/decisionSupport/components/InlineDecisionSummary'

export default function CostPredictionPage() {
  const { dataImported, getPrediction, lastUpdated } = useMLPredictions()
  const [mlPrediction, setMlPrediction] = useState(null)
  const [mlOptimization, setMlOptimization] = useState(null)
  const [costData, setCostData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('main')
  const [mlModels] = useState({
    costEstimation: { name: 'Cost Estimation', accuracy: 92.1, status: 'active' },
  })
  const { data: importedData, isLoaded } = useImportedData()

  // Keep ML cost predictions in sync with latest pipeline outputs
  useEffect(() => {
    if (!getPrediction) return
    const costPred = getPrediction('cost_prediction')
    const optPred = getPrediction('cost_optimization')
    setMlPrediction(costPred)
    setMlOptimization(optPred)
  }, [lastUpdated, getPrediction])

  const handlePredictCost = async (formData) => {
    setLoading(true)
    setError(null)
    try {
      const result = await predictCost(formData)
      setCostData(result)
    } catch (err) {
      setError('Failed to predict cost: ' + err.message)
      console.error('Prediction error:', err)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'main', label: 'Main Analysis', icon: DollarSign },
    { id: 'ensemble', label: 'Ensemble Models', icon: BarChart3 },
    { id: 'probabilistic', label: 'Probabilistic', icon: TrendingUp },
    { id: 'sensitivity', label: 'Sensitivity', icon: Eye },
    { id: 'bias', label: 'Bias Analysis', icon: Eye },
    { id: 'monte-carlo', label: 'Monte Carlo', icon: Zap },
    { id: 'drivers', label: 'Cost Drivers', icon: TrendingUp },
    { id: 'versions', label: 'Version Control', icon: GitBranch },
    { id: 'collaboration', label: 'Discussion', icon: MessageSquare },
    { id: 'export', label: 'Export & Share', icon: Share2 },
    { id: 'optimization', label: 'Optimization', icon: Target },
    { id: 'forecasting', label: 'Forecasting', icon: TrendingUp },
    { id: 'scenarios', label: 'Scenarios', icon: Lightbulb },
    { id: 'benchmarking', label: 'Benchmarking', icon: BarChart3 },
    { id: 'allocation', label: 'Allocation', icon: Layers },
    { id: 'advanced', label: 'Advanced', icon: Brain },
    { id: 'monitoring', label: 'Monitoring', icon: Bell },
    { id: 'reporting', label: 'Reporting', icon: BarChart4 },
    { id: 'ml', label: 'ML Features', icon: Brain },
  ]

  const hasImportedOrders =
    isLoaded && importedData && Array.isArray(importedData.orders) && importedData.orders.length > 0

  let totalOrders = 0
  let totalTonnage = 0
  let totalCost = 0

  if (hasImportedOrders) {
    importedData.orders.forEach((o) => {
      const qty = Number(o.totalQuantity ?? o.quantity ?? 0)
      const costPerTonne = Number(
        o.costPerTonne ??
          o.ratePerTonne ??
          o.estimatedCostPerTonne ??
          0,
      )
      const explicitCost = Number(
        o.totalCost ??
          o.estimatedCost ??
          o.cost ??
          0,
      )
      const cost = explicitCost || (qty && costPerTonne ? costPerTonne * qty : 0)

      if (Number.isFinite(qty) && qty > 0) {
        totalTonnage += qty
      }
      if (Number.isFinite(cost) && cost > 0) {
        totalCost += cost
      }
    })
    totalOrders = importedData.orders.length
  }

  const avgCostPerTonneFromOrders =
    totalTonnage > 0 ? totalCost / totalTonnage : null

  const mlCostSource = Array.isArray(mlPrediction) ? mlPrediction[0] : mlPrediction
  const mlOptSource = Array.isArray(mlOptimization) ? mlOptimization[0] : mlOptimization

  const mlAvgCostPerTonne =
    mlCostSource && typeof mlCostSource === 'object'
      ? (() => {
          const candidates = [
            mlCostSource.avg_cost_per_tonne,
            mlCostSource.average_cost_per_tonne,
            mlCostSource.avgCostPerTonne,
            mlCostSource.predicted_cost_per_tonne,
            mlCostSource.cost_per_tonne,
            mlCostSource.mean_cost,
          ]
          for (const c of candidates) {
            const n = Number(c)
            if (Number.isFinite(n) && n > 0) return n
          }
          return null
        })()
      : null

  const mlCostConfidence =
    mlCostSource && typeof mlCostSource === 'object'
      ? (() => {
          const raw =
            typeof mlCostSource.confidence === 'number'
              ? mlCostSource.confidence
              : typeof mlCostSource.confidence_score === 'number'
                ? mlCostSource.confidence_score
                : typeof mlCostSource.probability === 'number'
                  ? mlCostSource.probability
                  : null
          if (raw == null) return null
          return raw <= 1 ? raw * 100 : raw
        })()
      : null

  const mlSavingsPercent =
    mlOptSource && typeof mlOptSource === 'object'
      ? (() => {
          const raw =
            typeof mlOptSource.savings_percent === 'number'
              ? mlOptSource.savings_percent
              : typeof mlOptSource.cost_reduction_pct === 'number'
                ? mlOptSource.cost_reduction_pct
                : null
          if (raw == null) return null
          return raw <= 1 ? raw * 100 : raw
        })()
      : null

  const activeTabLabel = tabs.find((t) => t.id === activeTab)?.label

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <DollarSign size={32} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Cost Per Tonne Prediction</h1>
        </div>
        <p className="text-slate-600">Predict logistics costs and analyze cost drivers by destination</p>
      </div>

      <InlineDataImport templateId="operations" />

      {/* Error Message */}
      {error && (
        <div className="card p-4 bg-red-50 border-l-4 border-red-500">
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}

      {(hasImportedOrders || mlAvgCostPerTonne !== null || mlSavingsPercent !== null) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hasImportedOrders && (
            <div className="card p-4">
              <div className="flex items-start gap-3">
                <DollarSign size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-600">Dataset Cost Summary</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {totalOrders.toLocaleString()} orders / {totalTonnage.toLocaleString()}T
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {typeof avgCostPerTonneFromOrders === 'number'
                      ? `Avg ₹${avgCostPerTonneFromOrders.toFixed(1)} per tonne`
                      : 'No cost fields detected in imported orders'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {mlAvgCostPerTonne !== null && (
            <div className="card p-4">
              <div className="flex items-start gap-3">
                <Brain size={20} className="text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-600">ML Predicted Cost/T</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    ₹{mlAvgCostPerTonne.toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {typeof mlCostConfidence === 'number'
                      ? `Confidence ${mlCostConfidence.toFixed(0)}%`
                      : 'From cost_prediction model'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {mlSavingsPercent !== null && (
            <div className="card p-4">
              <div className="flex items-start gap-3">
                <Target size={20} className="text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-600">Optimization Savings</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {mlSavingsPercent.toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-600 mt-1">From cost_optimization model</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Main Content */}
      {activeTab === 'main' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form - Left Side */}
          <div className="lg:col-span-1">
            <CostForm onSubmit={handlePredictCost} isLoading={loading} />
          </div>

          {/* Results - Right Side */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="card p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Predicting cost...</p>
              </div>
            ) : (
              <CostResults data={costData} />
            )}
          </div>
        </div>
      )}

      {/* Enhancement Tabs - Part 1 */}
      {activeTab === 'ensemble' && <EnsembleCostModels data={costData} />}
      {activeTab === 'probabilistic' && <ProbabilisticCostForecasting data={costData} />}
      {activeTab === 'sensitivity' && <CostSensitivityAnalysis />}
      {activeTab === 'bias' && <CostBiasAnalysis data={costData} />}
      {activeTab === 'monte-carlo' && <MonteCarloSimulation data={costData} />}
      {activeTab === 'drivers' && <CostDriversAnalysis />}
      {activeTab === 'versions' && <CostVersionControl />}
      {activeTab === 'collaboration' && <CostCollaboration />}
      {activeTab === 'export' && <CostExportShare />}

      {/* Advanced Analytics Tabs - Part 2 */}
      {activeTab === 'optimization' && <CostOptimization />}
      {activeTab === 'forecasting' && <CostForecastingTrends />}
      {activeTab === 'scenarios' && <ScenarioPlanning />}
      {activeTab === 'benchmarking' && <Benchmarking />}
      {activeTab === 'allocation' && <CostAllocation />}
      {activeTab === 'advanced' && <AdvancedAnalytics />}
      {activeTab === 'monitoring' && <RealTimeMonitoring />}
      {activeTab === 'reporting' && <ReportingInsights />}
      {activeTab === 'ml' && <AdvancedMLFeatures />}

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-start gap-3">
            <DollarSign size={20} className="text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-900 text-sm">Average Cost</p>
              <p className="text-xs text-slate-600 mt-1">Predicted average cost per tonne based on historical data</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-start gap-3">
            <TrendingUp size={20} className="text-green-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-900 text-sm">Total Cost</p>
              <p className="text-xs text-slate-600 mt-1">Total estimated cost for the selected period</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-start gap-3">
            <DollarSign size={20} className="text-purple-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-900 text-sm">Cost Drivers</p>
              <p className="text-xs text-slate-600 mt-1">Breakdown of factors affecting total cost</p>
            </div>
          </div>
        </div>
      </div>
      <InlineDecisionSummary
        context="cost"
        pageTitle="Cost Per Tonne Prediction"
        activeView={activeTabLabel}
      />
    </div>
  )
}
