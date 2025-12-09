/**
 * Cost Analysis Page - Connected to ML Models
 * Shows real predictions from Cost Prediction and Cost Optimization models
 * Updates automatically when data is imported
 */

import React, { useState, useEffect } from 'react'
import { TrendingDown, DollarSign, AlertCircle, RefreshCw } from 'lucide-react'
import { useMLPredictions } from '../context/MLPredictionsContext'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

export default function CostPageWithML() {
  const { predictions, loading, dataImported, getPrediction, fetchPredictions } = useMLPredictions()
  const [costData, setCostData] = useState(null)
  const [optimizationData, setOptimizationData] = useState(null)

  // Update when predictions change
  useEffect(() => {
    if (predictions) {
      const costPred = getPrediction('cost_prediction')
      const optPred = getPrediction('cost_optimization')
      
      setCostData(costPred)
      setOptimizationData(optPred)
    }
  }, [predictions, getPrediction])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <DollarSign className="mx-auto text-blue-600 mb-4 animate-spin" size={48} />
          <p className="text-slate-600 dark:text-slate-400">Loading cost analysis...</p>
        </div>
      </div>
    )
  }

  if (!dataImported) {
    return (
      <div className="p-8 space-y-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={24} />
            <div>
              <h3 className="font-bold text-yellow-900 dark:text-yellow-100">No Data Imported</h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                Please import data using the upload panel below or from the Data Import Center to see cost analysis predictions.
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-2">
                Once you upload data, the ML models will analyze it and show predictions here.
              </p>
            </div>
          </div>
        </div>

        <InlineDataImport templateId="cost" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-2">Cost Prediction Model</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Predicts shipping costs based on route, tonnage, material, and fuel prices
            </p>
          </div>
          <div className="card">
            <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-2">Cost Optimization Model</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Identifies cost-saving opportunities and optimization strategies
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Cost Analysis
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Real predictions from ML models analyzing your data
          </p>
        </div>
        <button
          onClick={fetchPredictions}
          className="btn btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <InlineDataImport templateId="cost" />

      {/* Cost Prediction Model */}
      {costData && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              💰 Cost Prediction Model
            </h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-semibold">
              Confidence: {(costData.confidence * 100).toFixed(0)}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-300 mb-1">Cost Per Shipment</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">
                ₹{costData.predicted_cost_per_shipment?.toLocaleString()}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-300 mb-1">Total Predicted Cost</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-200">
                ₹{costData.total_predicted_cost?.toLocaleString()}
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-600 dark:text-purple-300 mb-1">Model Accuracy</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-200">
                {(costData.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-3">Cost Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Average Rail Cost</span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  ₹{costData.cost_breakdown?.avg_rail_cost?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Average Road Cost</span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  ₹{costData.cost_breakdown?.avg_road_cost?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cost Optimization Model */}
      {optimizationData && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              🎯 Cost Optimization Model
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded text-xs font-semibold">
              Confidence: {(optimizationData.confidence * 100).toFixed(0)}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-300 mb-1">Savings Per Shipment</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-200">
                ₹{optimizationData.potential_savings_per_shipment?.toLocaleString()}
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-600 dark:text-emerald-300 mb-1">Total Potential Savings</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-200">
                ₹{optimizationData.total_potential_savings?.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-2">
              <TrendingDown size={18} className="text-green-600" />
              Optimization Strategy
            </h4>
            <p className="text-slate-700 dark:text-slate-300">
              {optimizationData.optimization_strategy}
            </p>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3">How This Works</h3>
        <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>1. You import data (stockyards, materials, orders, routes) using this page's upload panel or the Data Import Center</li>
          <li>2. Backend ML models analyze your data</li>
          <li>3. Cost Prediction model calculates expected shipping costs</li>
          <li>4. Cost Optimization model identifies savings opportunities</li>
          <li>5. Predictions appear here automatically</li>
          <li>6. Use these insights to optimize your logistics operations</li>
        </ol>
      </div>
    </div>
  )
}
