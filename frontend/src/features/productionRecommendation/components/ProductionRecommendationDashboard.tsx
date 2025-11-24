/**
 * Production Recommendation Dashboard
 * AI-powered production recommendations
 */

import React, { useState } from 'react'
import { TrendingUp, AlertCircle, Zap, BarChart3, Target } from 'lucide-react'
import { useProductionRecommendationStore } from '../store'

export default function ProductionRecommendationDashboard() {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'analysis' | 'scenarios'>('recommendations')

  const {
    recommendations,
    getDemandAnalysis,
    getProductionAnalysis,
    getSupplyDemandGaps,
    getTotalRecommendedProduction,
  } = useProductionRecommendationStore()

  // Mock data
  const mockRecommendations = [
    {
      id: 'rec-001',
      productId: 'prod-001',
      productName: 'Coal',
      currentDemand: 5000,
      recommendedProduction: 5500,
      rationale: 'Demand increasing, current inventory insufficient',
      priority: 'high' as const,
      expectedROI: 25,
      riskLevel: 'medium' as const,
      timeline: '2 weeks',
      resources: [
        { resource: 'Labor', quantity: 50, unit: 'hours', availability: 100, cost: 5000 },
        { resource: 'Equipment', quantity: 2, unit: 'units', availability: 80, cost: 10000 },
      ],
      constraints: ['Equipment availability', 'Labor constraints'],
      alternatives: [],
    },
    {
      id: 'rec-002',
      productId: 'prod-002',
      productName: 'Iron Ore',
      currentDemand: 8000,
      recommendedProduction: 8500,
      rationale: 'Peak season approaching, prepare inventory',
      priority: 'high' as const,
      expectedROI: 30,
      riskLevel: 'low' as const,
      timeline: '3 weeks',
      resources: [
        { resource: 'Labor', quantity: 75, unit: 'hours', availability: 100, cost: 7500 },
        { resource: 'Equipment', quantity: 3, unit: 'units', availability: 90, cost: 15000 },
      ],
      constraints: [],
      alternatives: [],
    },
  ]

  const demandAnalysis = getDemandAnalysis()
  const productionAnalysis = getProductionAnalysis()
  const gaps = getSupplyDemandGaps()

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Production Recommendation Engine
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          AI-powered production recommendations based on demand forecasts
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Demand</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {demandAnalysis.totalDemand.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Avg Demand</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {demandAnalysis.averageDemand.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Production</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {productionAnalysis.totalProduction.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Utilization</p>
          <p className="text-2xl font-bold text-blue-600">
            {productionAnalysis.utilizationRate.toFixed(1)}%
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Recommendations</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {mockRecommendations.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'recommendations', label: 'Recommendations', icon: Target },
          { id: 'analysis', label: 'Analysis', icon: BarChart3 },
          { id: 'scenarios', label: 'Scenarios', icon: TrendingUp },
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
        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            {mockRecommendations.map((rec) => (
              <div key={rec.id} className="card border-l-4 border-blue-500">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-50 text-lg">
                      {rec.productName}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {rec.rationale}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      rec.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {rec.priority.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Current Demand</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                      {rec.currentDemand.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Recommended</p>
                    <p className="text-lg font-bold text-blue-600">
                      {rec.recommendedProduction.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Expected ROI</p>
                    <p className="text-lg font-bold text-green-600">{rec.expectedROI}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50 mb-2">
                      Resources Required
                    </p>
                    <div className="space-y-1">
                      {rec.resources.map((r) => (
                        <div key={r.resource} className="flex justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-400">{r.resource}</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-50">
                            {r.quantity} {r.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50 mb-2">
                      Timeline & Risk
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">Timeline</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-50">
                          {rec.timeline}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">Risk Level</span>
                        <span
                          className={`font-semibold capitalize ${
                            rec.riskLevel === 'low'
                              ? 'text-green-600'
                              : rec.riskLevel === 'medium'
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }`}
                        >
                          {rec.riskLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">
                Demand Analysis
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Peak Demand</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    {demandAnalysis.peakDemand.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Variability</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    {demandAnalysis.demandVariability.toFixed(0)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Trend</p>
                  <p className="text-lg font-bold text-blue-600 capitalize">
                    {demandAnalysis.trend}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Forecast Accuracy</p>
                  <p className="text-lg font-bold text-green-600">
                    {demandAnalysis.forecastAccuracy}%
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">
                Supply-Demand Gaps
              </h3>
              {gaps.length === 0 ? (
                <p className="text-slate-600 dark:text-slate-400 text-center py-4">
                  No significant gaps detected
                </p>
              ) : (
                <div className="space-y-2">
                  {gaps.map((gap) => (
                    <div
                      key={gap.productId}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          {gap.productName}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {gap.recommendation}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-slate-50">
                          {gap.gap.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {gap.gapPercentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scenarios Tab */}
        {activeTab === 'scenarios' && (
          <div className="card text-center py-8">
            <Zap className="mx-auto text-slate-400 mb-3" size={32} />
            <p className="text-slate-600 dark:text-slate-400">
              Scenario analysis coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
