/**
 * Rail vs Road Optimization Store
 * Zustand store for transport mode optimization
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import {
  RailRoadOptimizationState,
  RailTransport,
  RoadTransport,
  Route,
  TransportScenario,
  TransportCostAnalysis,
  OptimizationResult,
  ModeAnalytics,
} from './types'

interface RailRoadOptimizationStore extends RailRoadOptimizationState {
  // Rail Options
  addRailOption: (rail: RailTransport) => void
  updateRailOption: (id: string, rail: Partial<RailTransport>) => void
  removeRailOption: (id: string) => void

  // Road Options
  addRoadOption: (road: RoadTransport) => void
  updateRoadOption: (id: string, road: Partial<RoadTransport>) => void
  removeRoadOption: (id: string) => void

  // Routes
  addRoute: (route: Route) => void
  updateRoute: (id: string, route: Partial<Route>) => void
  removeRoute: (id: string) => void
  getRoute: (origin: string, destination: string) => Route | undefined

  // Scenarios
  addScenario: (scenario: TransportScenario) => void
  removeScenario: (id: string) => void
  setSelectedScenario: (id: string | undefined) => void

  // Analysis & Optimization
  analyzeCost: (quantity: number, distance: number) => TransportCostAnalysis | null
  optimizeMode: (quantity: number, distance: number, priority: string) => OptimizationResult | null
  getAnalytics: () => ModeAnalytics

  // UI Actions
  setAnalyzing: (analyzing: boolean) => void
  setError: (error: string | null) => void
}

export const useRailRoadOptimizationStore = create<RailRoadOptimizationStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        railOptions: [],
        roadOptions: [],
        routes: [],
        scenarios: [],
        isAnalyzing: false,
        error: null,

        // Rail Options
        addRailOption: (rail) =>
          set((state) => ({
            railOptions: [...state.railOptions, rail],
          })),

        updateRailOption: (id, updates) =>
          set((state) => ({
            railOptions: state.railOptions.map((r) => (r.id === id ? { ...r, ...updates } : r)),
          })),

        removeRailOption: (id) =>
          set((state) => ({
            railOptions: state.railOptions.filter((r) => r.id !== id),
          })),

        // Road Options
        addRoadOption: (road) =>
          set((state) => ({
            roadOptions: [...state.roadOptions, road],
          })),

        updateRoadOption: (id, updates) =>
          set((state) => ({
            roadOptions: state.roadOptions.map((r) => (r.id === id ? { ...r, ...updates } : r)),
          })),

        removeRoadOption: (id) =>
          set((state) => ({
            roadOptions: state.roadOptions.filter((r) => r.id !== id),
          })),

        // Routes
        addRoute: (route) =>
          set((state) => ({
            routes: [...state.routes, route],
          })),

        updateRoute: (id, updates) =>
          set((state) => ({
            routes: state.routes.map((r) => (r.id === id ? { ...r, ...updates } : r)),
          })),

        removeRoute: (id) =>
          set((state) => ({
            routes: state.routes.filter((r) => r.id !== id),
          })),

        getRoute: (origin, destination) => {
          const state = get()
          return state.routes.find((r) => r.origin === origin && r.destination === destination)
        },

        // Scenarios
        addScenario: (scenario) =>
          set((state) => ({
            scenarios: [...state.scenarios, scenario],
          })),

        removeScenario: (id) =>
          set((state) => ({
            scenarios: state.scenarios.filter((s) => s.id !== id),
          })),

        setSelectedScenario: (id) => set({ selectedScenario: id }),

        // Analysis & Optimization
        analyzeCost: (quantity, distance) => {
          const state = get()
          if (state.railOptions.length === 0 || state.roadOptions.length === 0) return null

          const rail = state.railOptions[0]
          const road = state.roadOptions[0]

          const railCost = {
            fixedCost: rail.fixedCost,
            variableCost: rail.costPerKm * distance + rail.costPerTonne * quantity,
            loadingCost: rail.loadingTime * 500,
            unloadingCost: rail.unloadingTime * 500,
            totalCost: rail.fixedCost + rail.costPerKm * distance + rail.costPerTonne * quantity + (rail.loadingTime + rail.unloadingTime) * 500,
            costPerTonne: (rail.fixedCost + rail.costPerKm * distance + rail.costPerTonne * quantity + (rail.loadingTime + rail.unloadingTime) * 500) / quantity,
            transitTime: (distance / 100) * rail.transitTime,
            reliability: rail.reliability,
          }

          const roadCost = {
            fixedCost: road.fixedCost,
            variableCost: road.costPerKm * distance + road.costPerTonne * quantity,
            tollCost: road.tollCost,
            fuelSurcharge: (road.costPerKm * distance * road.fuelSurcharge) / 100,
            loadingCost: road.loadingTime * 500,
            unloadingCost: road.unloadingTime * 500,
            totalCost: road.fixedCost + road.costPerKm * distance + road.costPerTonne * quantity + road.tollCost + (road.costPerKm * distance * road.fuelSurcharge) / 100 + (road.loadingTime + road.unloadingTime) * 500,
            costPerTonne: (road.fixedCost + road.costPerKm * distance + road.costPerTonne * quantity + road.tollCost + (road.costPerKm * distance * road.fuelSurcharge) / 100 + (road.loadingTime + road.unloadingTime) * 500) / quantity,
            transitTime: (distance / 100) * road.transitTime,
            reliability: road.reliability,
          }

          const hybridCost = {
            railPortion: 50,
            roadPortion: 50,
            railCost: railCost.totalCost * 0.5,
            roadCost: roadCost.totalCost * 0.5,
            totalCost: railCost.totalCost * 0.5 + roadCost.totalCost * 0.5,
            costPerTonne: (railCost.totalCost * 0.5 + roadCost.totalCost * 0.5) / quantity,
            transitTime: (railCost.transitTime + roadCost.transitTime) / 2,
            reliability: (railCost.reliability + roadCost.reliability) / 2,
          }

          const railEmissions = rail.carbonEmissions * quantity
          const roadEmissions = road.carbonEmissions * quantity
          const hybridEmissions = (railEmissions + roadEmissions) / 2

          return {
            quantity,
            distance,
            railCost,
            roadCost,
            hybridCost,
            recommendation: railCost.totalCost < roadCost.totalCost ? 'rail' : 'road',
            savingsPercentage: Math.abs((railCost.totalCost - roadCost.totalCost) / Math.max(railCost.totalCost, roadCost.totalCost)) * 100,
            carbonComparison: {
              railEmissions,
              roadEmissions,
              hybridEmissions,
              lowestEmission: railEmissions < roadEmissions ? 'rail' : 'road',
              savingsPercentage: Math.abs((railEmissions - roadEmissions) / Math.max(railEmissions, roadEmissions)) * 100,
            },
          }
        },

        optimizeMode: (quantity, distance, priority) => {
          const analysis = get().analyzeCost(quantity, distance)
          if (!analysis) return null

          const priorityWeights = {
            urgent: { cost: 0.2, time: 0.6, reliability: 0.2, emissions: 0 },
            high: { cost: 0.3, time: 0.4, reliability: 0.3, emissions: 0 },
            medium: { cost: 0.4, time: 0.2, reliability: 0.2, emissions: 0.2 },
            low: { cost: 0.3, time: 0.1, reliability: 0.2, emissions: 0.4 },
          }

          const weights = priorityWeights[priority as keyof typeof priorityWeights] || priorityWeights.medium

          const railScore =
            (1 - analysis.railCost!.costPerTonne / Math.max(analysis.railCost!.costPerTonne, analysis.roadCost!.costPerTonne)) * weights.cost * 100 +
            (1 - analysis.railCost!.transitTime / Math.max(analysis.railCost!.transitTime, analysis.roadCost!.transitTime)) * weights.time * 100 +
            (analysis.railCost!.reliability / 100) * weights.reliability * 100 +
            (1 - analysis.carbonComparison.railEmissions / Math.max(analysis.carbonComparison.railEmissions, analysis.carbonComparison.roadEmissions)) * weights.emissions * 100

          const roadScore =
            (1 - analysis.roadCost!.costPerTonne / Math.max(analysis.railCost!.costPerTonne, analysis.roadCost!.costPerTonne)) * weights.cost * 100 +
            (1 - analysis.roadCost!.transitTime / Math.max(analysis.railCost!.transitTime, analysis.roadCost!.transitTime)) * weights.time * 100 +
            (analysis.roadCost!.reliability / 100) * weights.reliability * 100 +
            (1 - analysis.carbonComparison.roadEmissions / Math.max(analysis.carbonComparison.railEmissions, analysis.carbonComparison.roadEmissions)) * weights.emissions * 100

          const recommendedMode = railScore > roadScore ? 'rail' : 'road'
          const selectedCost = recommendedMode === 'rail' ? analysis.railCost!.totalCost : analysis.roadCost!.totalCost
          const selectedTime = recommendedMode === 'rail' ? analysis.railCost!.transitTime : analysis.roadCost!.transitTime
          const selectedReliability = recommendedMode === 'rail' ? analysis.railCost!.reliability : analysis.roadCost!.reliability
          const selectedEmissions = recommendedMode === 'rail' ? analysis.carbonComparison.railEmissions : analysis.carbonComparison.roadEmissions

          return {
            recommendedMode,
            estimatedCost: selectedCost,
            estimatedTime: selectedTime,
            reliability: selectedReliability,
            emissions: selectedEmissions,
            reasoning: `${recommendedMode.toUpperCase()} is recommended based on ${priority} priority with ${weights.cost * 100}% cost, ${weights.time * 100}% time, ${weights.reliability * 100}% reliability, and ${weights.emissions * 100}% emissions weighting.`,
            alternatives: [
              {
                mode: 'rail',
                cost: analysis.railCost!.totalCost,
                time: analysis.railCost!.transitTime,
                reliability: analysis.railCost!.reliability,
                emissions: analysis.carbonComparison.railEmissions,
                score: railScore,
                pros: ['Lower emissions', 'High capacity', 'Cost effective for bulk'],
                cons: ['Longer transit time', 'Less flexibility'],
              },
              {
                mode: 'road',
                cost: analysis.roadCost!.totalCost,
                time: analysis.roadCost!.transitTime,
                reliability: analysis.roadCost!.reliability,
                emissions: analysis.carbonComparison.roadEmissions,
                score: roadScore,
                pros: ['Faster delivery', 'Door-to-door', 'Flexible'],
                cons: ['Higher cost', 'More emissions', 'Limited capacity'],
              },
            ],
            score: Math.max(railScore, roadScore),
          }
        },

        getAnalytics: () => {
          const state = get()
          const totalShipments = state.scenarios.length
          const railShipments = state.scenarios.filter((s) => s.selectedMode === 'rail').length
          const roadShipments = state.scenarios.filter((s) => s.selectedMode === 'road').length
          const hybridShipments = state.scenarios.filter((s) => s.selectedMode === 'hybrid').length

          const totalCost = state.scenarios.reduce((sum, s) => sum + s.analysis.railCost!.totalCost, 0)
          const totalEmissions = state.scenarios.reduce((sum, s) => sum + s.analysis.carbonComparison.railEmissions, 0)

          return {
            totalShipments,
            railShipments,
            roadShipments,
            hybridShipments,
            railPercentage: totalShipments > 0 ? (railShipments / totalShipments) * 100 : 0,
            roadPercentage: totalShipments > 0 ? (roadShipments / totalShipments) * 100 : 0,
            hybridPercentage: totalShipments > 0 ? (hybridShipments / totalShipments) * 100 : 0,
            totalCost,
            totalEmissions,
            averageCost: totalShipments > 0 ? totalCost / totalShipments : 0,
            averageTime: 0,
            averageReliability: 0,
          }
        },

        // UI Actions
        setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
        setError: (error) => set({ error }),
      }),
      {
        name: 'rail-road-optimization-store',
      }
    )
  )
)
