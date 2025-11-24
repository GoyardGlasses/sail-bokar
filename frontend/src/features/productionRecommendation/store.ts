/**
 * Production Recommendation Store
 * Zustand store for production recommendations
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import {
  ProductionRecommendationState,
  DemandForecast,
  ProductionCapacity,
  ProductionSchedule,
  ProductionRecommendation,
  ProductionScenario,
  DemandAnalysis,
  ProductionAnalysis,
  SupplyDemandGap,
} from './types'

interface ProductionRecommendationStore extends ProductionRecommendationState {
  // Demand Actions
  addDemand: (demand: DemandForecast) => void
  updateDemand: (id: string, demand: Partial<DemandForecast>) => void
  removeDemand: (id: string) => void

  // Capacity Actions
  addCapacity: (capacity: ProductionCapacity) => void
  updateCapacity: (id: string, capacity: Partial<ProductionCapacity>) => void
  removeCapacity: (id: string) => void

  // Schedule Actions
  addSchedule: (schedule: ProductionSchedule) => void
  updateSchedule: (id: string, schedule: Partial<ProductionSchedule>) => void
  removeSchedule: (id: string) => void

  // Recommendation Actions
  addRecommendation: (recommendation: ProductionRecommendation) => void
  removeRecommendation: (id: string) => void
  setSelectedRecommendation: (id: string | undefined) => void

  // Scenario Actions
  addScenario: (scenario: ProductionScenario) => void
  removeScenario: (id: string) => void

  // Analytics
  getDemandAnalysis: () => DemandAnalysis
  getProductionAnalysis: () => ProductionAnalysis
  getSupplyDemandGaps: () => SupplyDemandGap[]
  getTotalRecommendedProduction: () => number

  // UI Actions
  setAnalyzing: (analyzing: boolean) => void
  setError: (error: string | null) => void
}

export const useProductionRecommendationStore = create<ProductionRecommendationStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        demands: [],
        capacities: [],
        schedules: [],
        recommendations: [],
        scenarios: [],
        isAnalyzing: false,
        error: null,

        // Demand Actions
        addDemand: (demand) =>
          set((state) => ({
            demands: [...state.demands, demand],
          })),

        updateDemand: (id, updates) =>
          set((state) => ({
            demands: state.demands.map((d) => (d.id === id ? { ...d, ...updates } : d)),
          })),

        removeDemand: (id) =>
          set((state) => ({
            demands: state.demands.filter((d) => d.id !== id),
          })),

        // Capacity Actions
        addCapacity: (capacity) =>
          set((state) => ({
            capacities: [...state.capacities, capacity],
          })),

        updateCapacity: (id, updates) =>
          set((state) => ({
            capacities: state.capacities.map((c) => (c.id === id ? { ...c, ...updates } : c)),
          })),

        removeCapacity: (id) =>
          set((state) => ({
            capacities: state.capacities.filter((c) => c.id !== id),
          })),

        // Schedule Actions
        addSchedule: (schedule) =>
          set((state) => ({
            schedules: [...state.schedules, schedule],
          })),

        updateSchedule: (id, updates) =>
          set((state) => ({
            schedules: state.schedules.map((s) => (s.id === id ? { ...s, ...updates } : s)),
          })),

        removeSchedule: (id) =>
          set((state) => ({
            schedules: state.schedules.filter((s) => s.id !== id),
          })),

        // Recommendation Actions
        addRecommendation: (recommendation) =>
          set((state) => ({
            recommendations: [...state.recommendations, recommendation],
          })),

        removeRecommendation: (id) =>
          set((state) => ({
            recommendations: state.recommendations.filter((r) => r.id !== id),
          })),

        setSelectedRecommendation: (id) => set({ selectedRecommendation: id }),

        // Scenario Actions
        addScenario: (scenario) =>
          set((state) => ({
            scenarios: [...state.scenarios, scenario],
          })),

        removeScenario: (id) =>
          set((state) => ({
            scenarios: state.scenarios.filter((s) => s.id !== id),
          })),

        // Analytics
        getDemandAnalysis: () => {
          const state = get()
          const demands = state.demands.map((d) => d.forecastedDemand)
          if (demands.length === 0) {
            return {
              id: 'da-001',
              period: 'current',
              totalDemand: 0,
              averageDemand: 0,
              peakDemand: 0,
              demandVariability: 0,
              seasonalPattern: 'stable',
              trend: 'stable',
              forecastAccuracy: 0,
            }
          }

          const total = demands.reduce((sum, d) => sum + d, 0)
          const avg = total / demands.length
          const peak = Math.max(...demands)
          const variance = demands.reduce((sum, d) => sum + Math.pow(d - avg, 2), 0) / demands.length

          return {
            id: 'da-001',
            period: 'current',
            totalDemand: total,
            averageDemand: avg,
            peakDemand: peak,
            demandVariability: Math.sqrt(variance),
            seasonalPattern: 'stable',
            trend: 'stable',
            forecastAccuracy: 85,
          }
        },

        getProductionAnalysis: () => {
          const state = get()
          const productions = state.schedules.map((s) => s.actualQuantity || s.plannedQuantity)
          if (productions.length === 0) {
            return {
              id: 'pa-001',
              period: 'current',
              totalProduction: 0,
              averageProduction: 0,
              utilizationRate: 0,
              efficiency: 0,
              costPerUnit: 0,
              qualityScore: 0,
              bottlenecks: [],
            }
          }

          const total = productions.reduce((sum, p) => sum + p, 0)
          const avg = total / productions.length
          const capacities = state.capacities.map((c) => c.maxCapacity)
          const totalCapacity = capacities.reduce((sum, c) => sum + c, 0)
          const utilization = (total / Math.max(1, totalCapacity)) * 100

          return {
            id: 'pa-001',
            period: 'current',
            totalProduction: total,
            averageProduction: avg,
            utilizationRate: utilization,
            efficiency: 85,
            costPerUnit: 500,
            qualityScore: 92,
            bottlenecks: [],
          }
        },

        getSupplyDemandGaps: () => {
          const state = get()
          const demandMap = new Map<string, number>()
          const supplyMap = new Map<string, number>()

          state.demands.forEach((d) => {
            demandMap.set(d.productId, d.forecastedDemand)
          })

          state.capacities.forEach((c) => {
            supplyMap.set(c.productId, c.availableCapacity)
          })

          const gaps: SupplyDemandGap[] = []
          demandMap.forEach((demand, productId) => {
            const supply = supplyMap.get(productId) || 0
            const gap = demand - supply
            if (gap !== 0) {
              gaps.push({
                productId,
                productName: `Product ${productId}`,
                demand,
                supply,
                gap,
                gapPercentage: (gap / demand) * 100,
                severity: Math.abs(gap) > demand * 0.3 ? 'critical' : 'medium',
                recommendation: gap > 0 ? 'Increase production' : 'Reduce production',
              })
            }
          })

          return gaps
        },

        getTotalRecommendedProduction: () => {
          const state = get()
          return state.recommendations.reduce((sum, r) => sum + r.recommendedProduction, 0)
        },

        // UI Actions
        setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
        setError: (error) => set({ error }),
      }),
      {
        name: 'production-recommendation-store',
      }
    )
  )
)
