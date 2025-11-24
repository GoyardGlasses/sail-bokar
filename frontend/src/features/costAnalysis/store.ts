/**
 * Cost Analysis Store
 * Zustand store for cost analysis and optimization
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import {
  CostAnalysisState,
  DetailedCostBreakdown,
  CostAnalysis,
  CostComparison,
  CostForecast,
  CostOptimization,
  CostMetrics,
  CostByCategory,
  CostByProduct,
} from './types'

interface CostAnalysisStore extends CostAnalysisState {
  // Breakdown Actions
  addBreakdown: (breakdown: DetailedCostBreakdown) => void
  updateBreakdown: (id: string, breakdown: Partial<DetailedCostBreakdown>) => void
  removeBreakdown: (id: string) => void
  getBreakdown: (id: string) => DetailedCostBreakdown | undefined

  // Analysis Actions
  addAnalysis: (analysis: CostAnalysis) => void
  getAnalysisByPeriod: (period: string) => CostAnalysis | undefined

  // Comparison Actions
  addComparison: (comparison: CostComparison) => void
  removeComparison: (id: string) => void

  // Forecast Actions
  addForecast: (forecast: CostForecast) => void
  removeForecast: (id: string) => void

  // Optimization Actions
  addOptimization: (optimization: CostOptimization) => void
  removeOptimization: (id: string) => void

  // Analytics
  getMetrics: () => CostMetrics
  getCostByCategory: () => CostByCategory[]
  getCostByProduct: () => CostByProduct[]
  getTotalSavings: () => number

  // UI Actions
  setSelectedBreakdown: (id: string | undefined) => void
  setAnalyzing: (analyzing: boolean) => void
  setError: (error: string | null) => void
}

export const useCostAnalysisStore = create<CostAnalysisStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        breakdowns: [],
        analyses: [],
        comparisons: [],
        forecasts: [],
        optimizations: [],
        isAnalyzing: false,
        error: null,

        // Breakdown Actions
        addBreakdown: (breakdown) =>
          set((state) => ({
            breakdowns: [...state.breakdowns, breakdown],
          })),

        updateBreakdown: (id, updates) =>
          set((state) => ({
            breakdowns: state.breakdowns.map((b) => (b.id === id ? { ...b, ...updates } : b)),
          })),

        removeBreakdown: (id) =>
          set((state) => ({
            breakdowns: state.breakdowns.filter((b) => b.id !== id),
          })),

        getBreakdown: (id) => {
          const state = get()
          return state.breakdowns.find((b) => b.id === id)
        },

        // Analysis Actions
        addAnalysis: (analysis) =>
          set((state) => ({
            analyses: [...state.analyses, analysis],
          })),

        getAnalysisByPeriod: (period) => {
          const state = get()
          return state.analyses.find((a) => a.period === period)
        },

        // Comparison Actions
        addComparison: (comparison) =>
          set((state) => ({
            comparisons: [...state.comparisons, comparison],
          })),

        removeComparison: (id) =>
          set((state) => ({
            comparisons: state.comparisons.filter((c) => c.id !== id),
          })),

        // Forecast Actions
        addForecast: (forecast) =>
          set((state) => ({
            forecasts: [...state.forecasts, forecast],
          })),

        removeForecast: (id) =>
          set((state) => ({
            forecasts: state.forecasts.filter((f) => f.id !== id),
          })),

        // Optimization Actions
        addOptimization: (optimization) =>
          set((state) => ({
            optimizations: [...state.optimizations, optimization],
          })),

        removeOptimization: (id) =>
          set((state) => ({
            optimizations: state.optimizations.filter((o) => o.id !== id),
          })),

        // Analytics
        getMetrics: () => {
          const state = get()
          const costs = state.breakdowns.map((b) => b.totalCost)
          if (costs.length === 0) {
            return {
              totalCost: 0,
              averageCost: 0,
              minCost: 0,
              maxCost: 0,
              standardDeviation: 0,
              costVariance: 0,
              costTrend: 'stable',
              costEfficiency: 0,
            }
          }

          const total = costs.reduce((sum, c) => sum + c, 0)
          const avg = total / costs.length
          const variance = costs.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / costs.length
          const stdDev = Math.sqrt(variance)

          return {
            totalCost: total,
            averageCost: avg,
            minCost: Math.min(...costs),
            maxCost: Math.max(...costs),
            standardDeviation: stdDev,
            costVariance: variance,
            costTrend: 'stable',
            costEfficiency: (avg / Math.max(...costs)) * 100,
          }
        },

        getCostByCategory: () => {
          const state = get()
          const categoryMap = new Map<string, number>()

          state.breakdowns.forEach((breakdown) => {
            breakdown.components.forEach((component) => {
              const current = categoryMap.get(component.category) || 0
              categoryMap.set(component.category, current + component.amount)
            })
          })

          const total = Array.from(categoryMap.values()).reduce((sum, v) => sum + v, 0)

          return Array.from(categoryMap.entries()).map(([category, amount]) => ({
            category,
            amount,
            percentage: (amount / total) * 100,
            trend: 'stable' as const,
            comparison: 0,
          }))
        },

        getCostByProduct: () => {
          const state = get()
          const productMap = new Map<string, { quantity: number; cost: number }>()

          state.breakdowns.forEach((breakdown) => {
            const current = productMap.get(breakdown.orderId) || { quantity: 0, cost: 0 }
            productMap.set(breakdown.orderId, {
              quantity: current.quantity + breakdown.quantity,
              cost: current.cost + breakdown.totalCost,
            })
          })

          return Array.from(productMap.entries()).map(([productId, data]) => ({
            productId,
            productName: `Product ${productId}`,
            quantity: data.quantity,
            totalCost: data.cost,
            costPerUnit: data.cost / data.quantity,
            margin: 0,
            trend: 'stable' as const,
          }))
        },

        getTotalSavings: () => {
          const state = get()
          return state.optimizations.reduce((sum, opt) => sum + opt.savings, 0)
        },

        // UI Actions
        setSelectedBreakdown: (id) => set({ selectedBreakdown: id }),
        setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
        setError: (error) => set({ error }),
      }),
      {
        name: 'cost-analysis-store',
      }
    )
  )
)
