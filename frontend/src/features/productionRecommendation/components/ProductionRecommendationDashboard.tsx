/**
 * Production Recommendation Dashboard
 * AI-powered production recommendations
 */

import React, { useState } from 'react'
import { TrendingUp, BarChart3, Target } from 'lucide-react'
import { useImportedData } from '../../../hooks/useImportedData'
import { useMLPredictions } from '../../../context/MLPredictionsContext'

type TabId = 'recommendations' | 'analysis' | 'scenarios'

export default function ProductionRecommendationDashboard() {
  const [activeTab, setActiveTab] = useState('recommendations' as TabId)

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

  const scenarios = [
    {
      id: 'sc-001',
      name: 'High Demand Surge',
      description: 'Demand increases by 15% for all products over the next month.',
      productionChange: '+12%',
      risk: 'medium',
      recommendation: 'Increase Coal and Iron Ore production, monitor stockyards closely.',
    },
    {
      id: 'sc-002',
      name: 'Maintenance Shutdown',
      description: 'One major production line is down for 7 days.',
      productionChange: '-18%',
      risk: 'high',
      recommendation: 'Prioritize high-ROI orders and reschedule low-priority production.',
    },
    {
      id: 'sc-003',
      name: 'Cost Optimization Drive',
      description: 'Focus on improving utilization without increasing capacity.',
      productionChange: '+5%',
      risk: 'low',
      recommendation: 'Rebalance shifts and optimize loading/unloading operations.',
    },
  ]

  const demandAnalysis = {
    totalDemand: 13500,
    averageDemand: 6750,
    maxDemand: 8000,
    minDemand: 5000,
    peakDemand: 8000,
    demandVariability: 12.5,
    trend: 'increasing',
    forecastAccuracy: 92,
  }

  const productionAnalysis = {
    totalProduction: 14000,
    averageProduction: 7000,
    maxProduction: 8500,
    minProduction: 5500,
    utilizationRate: 85.5,
  }

  const gaps = [
    {
      productId: 'prod-001',
      productName: 'Coal',
      gap: 500,
      gapPercentage: 9.1,
      recommendation: 'Increase Coal production by 500 tonnes to close the demand gap.',
    },
    {
      productId: 'prod-002',
      productName: 'Iron Ore',
      gap: 0,
      gapPercentage: 0,
      recommendation: 'Current Iron Ore production plan is aligned with demand.',
    },
  ]

  // Imported data and ML predictions
  const { data: importedData, isLoaded } = useImportedData()
  const { dataImported, getPrediction } = useMLPredictions()

  const mlDemandForecastRaw: any = dataImported ? getPrediction('demand_forecasting') : null

  const mlDemandForecast: any = Array.isArray(mlDemandForecastRaw) ? mlDemandForecastRaw[0] : mlDemandForecastRaw

  // Runtime demand analysis driven by imported orders (fallback to mock if none)
  let runtimeDemandAnalysis = demandAnalysis
  if (isLoaded && importedData?.orders && Array.isArray(importedData.orders) && importedData.orders.length > 0) {
    try {
      const orders = importedData.orders
      const quantities = orders
        .map((o: any) => Number(o?.quantity ?? 0))
        .filter((q: number) => Number.isFinite(q) && q > 0)

      if (quantities.length > 0) {
        const totalDemand = quantities.reduce((sum: number, q: number) => sum + q, 0)
        const averageDemand = totalDemand / quantities.length
        const maxDemand = Math.max(...quantities)
        const minDemand = Math.min(...quantities)

        const variability = averageDemand > 0
          ? ((maxDemand - minDemand) / averageDemand) * 100
          : demandAnalysis.demandVariability

        const mlConfidence = typeof mlDemandForecast?.confidence === 'number'
          ? Math.round(mlDemandForecast.confidence * 100)
          : demandAnalysis.forecastAccuracy

        const inferredTrend = mlDemandForecast?.factors?.length
          ? 'increasing'
          : demandAnalysis.trend

        runtimeDemandAnalysis = {
          totalDemand: totalDemand || demandAnalysis.totalDemand,
          averageDemand: averageDemand || demandAnalysis.averageDemand,
          maxDemand: maxDemand || demandAnalysis.maxDemand,
          minDemand: minDemand || demandAnalysis.minDemand,
          peakDemand: maxDemand || demandAnalysis.peakDemand,
          demandVariability: Number.isFinite(variability) ? variability : demandAnalysis.demandVariability,
          trend: inferredTrend,
          forecastAccuracy: mlConfidence || demandAnalysis.forecastAccuracy,
        }
      }
    } catch (e) {
      // Fallback silently to mock demandAnalysis
      runtimeDemandAnalysis = demandAnalysis
    }
  }

  // Runtime production analysis – approximate production from available material quantities
  let runtimeProductionAnalysis = productionAnalysis
  if (isLoaded && importedData?.materials && Array.isArray(importedData.materials) && importedData.materials.length > 0) {
    try {
      const mats = importedData.materials
      const quantities = mats
        .map((m: any) => Number(m?.quantity ?? m?.availableQuantity ?? 0))
        .filter((q: number) => Number.isFinite(q) && q > 0)

      if (quantities.length > 0) {
        const totalProduction = quantities.reduce((sum: number, q: number) => sum + q, 0)
        const averageProduction = totalProduction / quantities.length
        const maxProduction = Math.max(...quantities)
        const minProduction = Math.min(...quantities)

        const utilizationBase = totalProduction || productionAnalysis.totalProduction
        const utilizationRate = utilizationBase > 0
          ? Math.min(100, (utilizationBase / (utilizationBase * 1.1)) * 100)
          : productionAnalysis.utilizationRate

        runtimeProductionAnalysis = {
          totalProduction: totalProduction || productionAnalysis.totalProduction,
          averageProduction: averageProduction || productionAnalysis.averageProduction,
          maxProduction: maxProduction || productionAnalysis.maxProduction,
          minProduction: minProduction || productionAnalysis.minProduction,
          utilizationRate,
        }
      }
    } catch (e) {
      runtimeProductionAnalysis = productionAnalysis
    }
  }

  // Runtime recommendations driven by imported materials & orders
  let runtimeRecommendations = mockRecommendations
  let runtimeGaps = gaps

  if (isLoaded && importedData?.materials && Array.isArray(importedData.materials) && importedData.materials.length > 0) {
    try {
      const materials = importedData.materials
      const orders = Array.isArray(importedData.orders) ? importedData.orders : []

      const recs = materials.slice(0, mockRecommendations.length).map((m: any, index: number) => {
        const materialName = m.name || mockRecommendations[index]?.productName || `Material ${index + 1}`
        const materialId = m.materialId || m.id || mockRecommendations[index]?.productId || `prod-${index + 1}`

        const demandForMaterial = orders
          .filter((o: any) => (o.material || '').toLowerCase() === materialName.toLowerCase())
          .reduce((sum: number, o: any) => sum + Number(o?.quantity ?? 0), 0)

        const availableQty = Number(m?.quantity ?? m?.availableQuantity ?? 0)
        const baseRec = mockRecommendations[index] || mockRecommendations[0]

        const gap = Math.max(0, demandForMaterial - availableQty)
        const recommendedProduction = gap > 0 ? availableQty + gap : availableQty

        const priority: 'high' | 'medium' | 'low' = gap > 0 ? 'high' : (baseRec?.priority ?? 'medium')
        const riskLevel: 'low' | 'medium' | 'high' = gap > 0 ? 'medium' : (baseRec?.riskLevel ?? 'low')

        return {
          id: baseRec?.id || `rec-${index + 1}`,
          productId: materialId,
          productName: materialName,
          currentDemand: demandForMaterial || baseRec?.currentDemand || 0,
          recommendedProduction: recommendedProduction || baseRec?.recommendedProduction || 0,
          rationale: baseRec?.rationale || 'Based on uploaded orders and current inventory levels.',
          priority,
          expectedROI: baseRec?.expectedROI ?? 25,
          riskLevel,
          timeline: baseRec?.timeline || '2 weeks',
          resources: baseRec?.resources || [
            { resource: 'Labor', quantity: 40, unit: 'hours', availability: 100, cost: 4000 },
            { resource: 'Equipment', quantity: 2, unit: 'units', availability: 80, cost: 8000 },
          ],
          constraints: baseRec?.constraints || ['Equipment availability', 'Labor constraints'],
          alternatives: baseRec?.alternatives || [],
        }
      })

      if (recs.length > 0) {
        runtimeRecommendations = recs
      }

      // Dynamic supply-demand gaps per material
      const dynamicGaps = materials.map((m: any) => {
        const materialName = m.name || 'Unknown'
        const materialId = m.materialId || m.id || materialName

        const demandForMaterial = orders
          .filter((o: any) => (o.material || '').toLowerCase() === materialName.toLowerCase())
          .reduce((sum: number, o: any) => sum + Number(o?.quantity ?? 0), 0)

        const availableQty = Number(m?.quantity ?? m?.availableQuantity ?? 0)
        const gap = Math.max(0, demandForMaterial - availableQty)
        const gapPercentage = demandForMaterial > 0 ? (gap / demandForMaterial) * 100 : 0

        return {
          productId: materialId,
          productName: materialName,
          gap,
          gapPercentage,
          recommendation:
            gap > 0
              ? `Increase ${materialName} production by ${gap.toLocaleString()} tonnes to close the demand gap.`
              : `Current ${materialName} production plan is aligned with demand.`,
        }
      })

      if (dynamicGaps.length > 0) {
        runtimeGaps = dynamicGaps
      }
    } catch (e) {
      runtimeRecommendations = mockRecommendations
      runtimeGaps = gaps
    }
  }

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
            {runtimeDemandAnalysis.totalDemand.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Avg Demand</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {runtimeDemandAnalysis.averageDemand.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Production</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {runtimeProductionAnalysis.totalProduction.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Utilization</p>
          <p className="text-2xl font-bold text-blue-600">
            {runtimeProductionAnalysis.utilizationRate.toFixed(1)}%
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Recommendations</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {runtimeRecommendations.length}
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
            {runtimeRecommendations.map((rec) => (
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
                    {runtimeDemandAnalysis.peakDemand.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Variability</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    {runtimeDemandAnalysis.demandVariability.toFixed(0)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Trend</p>
                  <p className="text-lg font-bold text-blue-600 capitalize">
                    {runtimeDemandAnalysis.trend}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Forecast Accuracy</p>
                  <p className="text-lg font-bold text-green-600">
                    {runtimeDemandAnalysis.forecastAccuracy}%
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">
                Supply-Demand Gaps
              </h3>
              {runtimeGaps.length === 0 ? (
                <p className="text-slate-600 dark:text-slate-400 text-center py-4">
                  No significant gaps detected
                </p>
              ) : (
                <div className="space-y-2">
                  {runtimeGaps.map((gap) => (
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
          <div className="space-y-4">
            {scenarios.map((sc) => (
              <div key={sc.id} className="card border-l-4 border-blue-500">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-50 text-lg">
                      {sc.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {sc.description}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    Change: {sc.productionChange}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Risk</p>
                    <p className={`font-semibold capitalize ${
                      sc.risk === 'low'
                        ? 'text-green-600'
                        : sc.risk === 'medium'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}>
                      {sc.risk}
                    </p>
                  </div>
                  <div className="flex-1 ml-4">
                    <p className="text-slate-600 dark:text-slate-400 mb-1">Recommendation</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      {sc.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
