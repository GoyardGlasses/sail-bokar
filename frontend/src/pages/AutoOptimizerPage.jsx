/**
 * Auto-Optimizer Dashboard - Phase 1
 * Shows automatic optimization plans and triggers
 */

import React, { useState, useEffect } from 'react'
import { Zap, CheckCircle, AlertCircle, TrendingUp, Play, RefreshCw, BarChart3 } from 'lucide-react'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'
import InlineDecisionSummary from '../features/decisionSupport/components/InlineDecisionSummary'

export default function AutoOptimizerPage() {
  const { dataImported, getPrediction } = useMLPredictions()
  const [mlPredictions, setMlPredictions] = useState({})
  const [status, setStatus] = useState(null)
  const [plans, setPlans] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const { data: importedData, isLoaded } = useImportedData()

  // Get ML predictions when data is imported
  useEffect(() => {
    if (dataImported) {
      const predictions = {
        route: getPrediction('route_optimization'),
        cost: getPrediction('cost_optimization'),
        time: getPrediction('time_optimization'),
      }
      setMlPredictions(predictions)
    }
  }, [dataImported, getPrediction])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    // Mock data
    const mockStatus = {
      status: 'running',
      active_plans: 3,
      auto_published: 24,
      pending_approval: 2,
      timestamp: new Date().toISOString()
    }

    const mockPlans = [
      { id: 'PLAN-001', status: 'auto_published', risk_score: 0.12, cost_savings: 37500, orders: 5, created_at: new Date().toISOString() },
      { id: 'PLAN-002', status: 'pending', risk_score: 0.28, cost_savings: 42000, orders: 6, created_at: new Date().toISOString() },
      { id: 'PLAN-003', status: 'auto_published', risk_score: 0.08, cost_savings: 35000, orders: 4, created_at: new Date().toISOString() },
    ]

    const mockStats = {
      total_plans: 26,
      auto_published_rate: 0.92,
      avg_cost_savings: 37500,
      avg_time_savings: 2.5,
      avg_risk_score: 0.15
    }

    try {
      const [statusRes, plansRes, statsRes] = await Promise.all([
        fetch('/api/auto-optimizer/status').catch(() => null),
        fetch('/api/auto-optimizer/plans?limit=10').catch(() => null),
        fetch('/api/auto-optimizer/stats').catch(() => null),
      ])

      try {
        const statusData = statusRes ? await statusRes.json() : mockStatus
        const plansData = plansRes ? await plansRes.json() : { plans: mockPlans }
        const statsData = statsRes ? await statsRes.json() : mockStats

        setStatus(statusData || mockStatus)
        setPlans((plansData?.plans) || mockPlans)
        setStats(statsData || mockStats)
      } catch {
        setStatus(mockStatus)
        setPlans(mockPlans)
        setStats(mockStats)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setStatus(mockStatus)
      setPlans(mockPlans)
      setStats(mockStats)
      setLoading(false)
    }
  }

  const hasImportedOrders =
    isLoaded && importedData && Array.isArray(importedData.orders) && importedData.orders.length > 0

  const hasImportedRakes =
    isLoaded && importedData && Array.isArray(importedData.rakes) && importedData.rakes.length > 0

  let totalOrders = 0
  let totalTonnage = 0

  if (hasImportedOrders) {
    importedData.orders.forEach((o) => {
      const qty = Number(o.totalQuantity ?? o.quantity ?? 0)
      if (Number.isFinite(qty) && qty > 0) {
        totalTonnage += qty
      }
    })
    totalOrders = importedData.orders.length
  }

  if (!hasImportedOrders && hasImportedRakes) {
    importedData.rakes.forEach((r) => {
      const qty = Number(r.totalTonnage ?? r.tonnage ?? r.quantity ?? 0)
      if (Number.isFinite(qty) && qty > 0) {
        totalTonnage += qty
      }
    })
  }

  const costOpt = mlPredictions.cost && (Array.isArray(mlPredictions.cost) ? mlPredictions.cost[0] : mlPredictions.cost)
  const timeOpt = mlPredictions.time && (Array.isArray(mlPredictions.time) ? mlPredictions.time[0] : mlPredictions.time)
  const routeOpt = mlPredictions.route && (Array.isArray(mlPredictions.route) ? mlPredictions.route[0] : mlPredictions.route)

  const costSavingsPct = costOpt && typeof costOpt === 'object'
    ? (() => {
        const raw =
          typeof costOpt.savings_percent === 'number'
            ? costOpt.savings_percent
            : typeof costOpt.cost_reduction_pct === 'number'
              ? costOpt.cost_reduction_pct
              : typeof costOpt.expected_savings_pct === 'number'
                ? costOpt.expected_savings_pct
                : null
        if (raw == null) return null
        return raw <= 1 ? raw * 100 : raw
      })()
    : null

  const timeSavingsPct = timeOpt && typeof timeOpt === 'object'
    ? (() => {
        const raw =
          typeof timeOpt.time_savings_pct === 'number'
            ? timeOpt.time_savings_pct
            : typeof timeOpt.reduction_percent === 'number'
              ? timeOpt.reduction_percent
              : null
        if (raw == null) return null
        return raw <= 1 ? raw * 100 : raw
      })()
    : null

  const riskReductionPct = routeOpt && typeof routeOpt === 'object'
    ? (() => {
        const raw =
          typeof routeOpt.risk_reduction_pct === 'number'
            ? routeOpt.risk_reduction_pct
            : typeof routeOpt.risk_improvement === 'number'
              ? routeOpt.risk_improvement
              : null
        if (raw == null) return null
        return raw <= 1 ? raw * 100 : raw
      })()
    : null

  const triggerOptimization = async () => {
    try {
      setTriggering(true)
      const res = await fetch('/api/auto-optimizer/optimize/trigger', { method: 'POST' })
      const data = await res.json()
      
      if (data.status === 'success') {
        // Show success message
        alert(`✓ Optimization triggered!\nPlan ID: ${data.plan_id}\nStatus: ${data.plan_status}`)
        await fetchData()
      }
    } catch (error) {
      console.error('Error triggering optimization:', error)
      alert('Error triggering optimization')
    } finally {
      setTriggering(false)
    }
  }

  const publishPlan = async (planId) => {
    try {
      const res = await fetch(`/api/auto-optimizer/plans/${planId}/publish`, { method: 'POST' })
      const data = await res.json()
      
      if (data.status === 'success') {
        alert(`✓ Plan published!\nPublished at: ${data.published_at}`)
        await fetchData()
      }
    } catch (error) {
      console.error('Error publishing plan:', error)
      alert('Error publishing plan')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Zap className="mx-auto text-blue-600 mb-4 animate-spin" size={48} />
          <p className="text-slate-600 dark:text-slate-400">Loading auto-optimizer...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Auto-Optimizer
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Automatic optimization plans and intelligent scheduling
          </p>
        </div>
        <button
          onClick={triggerOptimization}
          disabled={triggering}
          className="btn btn-primary flex items-center gap-2"
        >
          <Play size={18} />
          {triggering ? 'Running...' : 'Trigger Optimization'}
        </button>
      </div>

      <InlineDataImport templateId="operations" />

      {(totalOrders > 0 || costSavingsPct !== null || timeSavingsPct !== null || riskReductionPct !== null) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {totalOrders > 0 && (
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">Dataset Size</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-2">
                {totalOrders.toLocaleString()} orders
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {totalTonnage > 0 ? `${totalTonnage.toLocaleString()}T total tonnage` : 'No tonnage field detected'}
              </p>
            </div>
          )}

          {costSavingsPct !== null && (
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">ML Cost Savings</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {costSavingsPct.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">From cost_optimization model</p>
            </div>
          )}

          {timeSavingsPct !== null && (
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">ML Time Savings</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {timeSavingsPct.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">From time_optimization model</p>
            </div>
          )}

          {riskReductionPct !== null && (
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">ML Risk Improvement</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {riskReductionPct.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">From route_optimization model</p>
            </div>
          )}
        </div>
      )}

      {/* Status Cards */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
            <p className="text-2xl font-bold text-green-600 flex items-center gap-2 mt-2">
              <CheckCircle size={24} />
              {status.status}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Optimizations</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{status.optimization_count}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Plans Generated</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">{status.plans_generated}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Auto-Published</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{status.auto_published_plans}</p>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && stats.auto_published_rate !== undefined && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-slate-900 dark:text-slate-50">Auto-Publish Rate</p>
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {((stats.auto_published_rate || 0) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              {Math.round((stats.total_plans || 0) * (stats.auto_published_rate || 0))} of {stats.total_plans || 0} plans
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-slate-900 dark:text-slate-50">Avg Cost Savings</p>
              <BarChart3 className="text-blue-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-blue-600">
              ₹{((stats.avg_cost_savings || 0) / 1000).toFixed(1)}K
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Per optimization run
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-slate-900 dark:text-slate-50">Avg Time Savings</p>
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {(stats.avg_time_savings || 0).toFixed(1)}h
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Per optimization run
            </p>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {stats && stats.total_plans !== undefined && (
        <div className="card">
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">Key Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Plans</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{stats.total_plans || 0}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Risk Score</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{((stats.avg_risk_score || 0) * 100).toFixed(0)}%</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Savings</p>
              <p className="text-xl font-bold text-green-600">₹{(((stats.avg_cost_savings || 0) * (stats.total_plans || 0)) / 100000).toFixed(1)}Cr</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Hours Saved</p>
              <p className="text-xl font-bold text-blue-600">{(((stats.avg_time_savings || 0) * (stats.total_plans || 0))).toFixed(0)}h</p>
            </div>
          </div>
        </div>
      )}

      {/* Plans List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            Recent Plans
          </h2>
          <button
            onClick={fetchData}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          {plans.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto text-slate-400 mb-3" size={32} />
              <p className="text-slate-600 dark:text-slate-400">No plans generated yet</p>
            </div>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-slate-900 dark:text-slate-50">
                        {plan.id}
                      </p>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          plan.status === 'auto_published'
                            ? 'bg-green-100 text-green-700'
                            : plan.status === 'published'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {plan.status}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          plan.risk_assessment?.risk_level === 'low'
                            ? 'bg-green-100 text-green-700'
                            : plan.risk_assessment?.risk_level === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        Risk: {plan.risk_assessment?.risk_level}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Orders</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          {plan.orders}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Tonnage</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          {plan.total_tonnage}T
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Cost Savings</p>
                        <p className="font-semibold text-green-600">
                          ₹{(plan.estimated_cost_savings / 1000).toFixed(1)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Time Savings</p>
                        <p className="font-semibold text-blue-600">
                          {plan.estimated_time_savings.toFixed(1)}h
                        </p>
                      </div>
                    </div>

                    {plan.recommendations && plan.recommendations.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Recommendations:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {plan.recommendations.slice(0, 2).map((rec, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
                            >
                              {rec}
                            </span>
                          ))}
                          {plan.recommendations.length > 2 && (
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              +{plan.recommendations.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {plan.status === 'pending_approval' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        publishPlan(plan.id)
                      }}
                      className="btn btn-primary text-sm"
                    >
                      Publish
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Plan Details Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  Plan Details: {selectedPlan.id}
                </h3>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Full Details</p>
                  <pre className="bg-slate-50 dark:bg-slate-700 p-3 rounded text-xs overflow-x-auto text-slate-900 dark:text-slate-50 whitespace-pre-wrap break-words">
                    {JSON.stringify(selectedPlan, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <InlineDecisionSummary
        context="operations"
        pageTitle="Auto-Optimizer"
      />
    </div>
  )
}
