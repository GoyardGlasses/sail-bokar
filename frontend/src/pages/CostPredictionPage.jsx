import React, { useState } from 'react'
import CostForm from '../components/CostForm'
import CostResults from '../components/CostResults'
import MLModelsStatus from '../components/MLModelsStatus'
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

export default function CostPredictionPage() {
  const [costData, setCostData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('main')
  const [mlModels] = useState({
    costEstimation: { name: 'Cost Estimation', accuracy: 92.1, status: 'active' },
  })

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

      {/* Error Message */}
      {error && (
        <div className="card p-4 bg-red-50 border-l-4 border-red-500">
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* ML Models Status */}
      <MLModelsStatus
        models={[
          { name: 'Cost Estimation', version: '1.9', status: 'active', accuracy: 92.1, type: 'regression' },
        ]}
      />

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
    </div>
  )
}
