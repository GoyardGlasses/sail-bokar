/**
 * Rake Formation Store
 * Zustand store for rake formation optimization
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import {
  RakeFormationState,
  RakeFormationPlan,
  AlgorithmConfig,
} from './types'

interface RakeFormationStore extends RakeFormationState {
  // Plan Actions
  setCurrentPlan: (plan: RakeFormationPlan) => void
  addToPreviousPlans: (plan: RakeFormationPlan) => void
  clearPreviousPlans: () => void
  getPreviousPlan: (index: number) => RakeFormationPlan | undefined

  // Optimization Actions
  setIsOptimizing: (optimizing: boolean) => void
  setOptimizationProgress: (progress: number) => void
  setError: (error: string | null) => void

  // Algorithm Actions
  setSelectedAlgorithm: (algorithm: 'greedy' | 'genetic' | 'simulated_annealing' | 'constraint_solver') => void
  setAlgorithmConfig: (config: Partial<AlgorithmConfig>) => void

  // Summary & Analytics
  getBestPlan: () => RakeFormationPlan | null
  getWorstPlan: () => RakeFormationPlan | null
  comparePlans: (index1: number, index2: number) => any
}

const defaultAlgorithmConfig: AlgorithmConfig = {
  type: 'greedy',
  maxIterations: 100,
  populationSize: 50,
  temperature: 100,
  coolingRate: 0.95,
  timeLimit: 30,
}

export const useRakeFormationStore = create<RakeFormationStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentPlan: null,
        previousPlans: [],
        isOptimizing: false,
        optimizationProgress: 0,
        error: null,
        selectedAlgorithm: 'greedy',
        algorithmConfig: defaultAlgorithmConfig,

        // Plan Actions
        setCurrentPlan: (plan) =>
          set((state) => ({
            currentPlan: plan,
            previousPlans: [plan, ...state.previousPlans].slice(0, 10), // Keep last 10
          })),

        addToPreviousPlans: (plan) =>
          set((state) => ({
            previousPlans: [plan, ...state.previousPlans].slice(0, 10),
          })),

        clearPreviousPlans: () =>
          set({
            previousPlans: [],
          }),

        getPreviousPlan: (index) => {
          const state = get()
          return state.previousPlans[index]
        },

        // Optimization Actions
        setIsOptimizing: (optimizing) => set({ isOptimizing: optimizing }),

        setOptimizationProgress: (progress) =>
          set({ optimizationProgress: Math.min(100, Math.max(0, progress)) }),

        setError: (error) => set({ error }),

        // Algorithm Actions
        setSelectedAlgorithm: (algorithm) => set({ selectedAlgorithm: algorithm }),

        setAlgorithmConfig: (config) =>
          set((state) => ({
            algorithmConfig: { ...state.algorithmConfig, ...config },
          })),

        // Summary & Analytics
        getBestPlan: () => {
          const state = get()
          if (state.previousPlans.length === 0) return null

          return state.previousPlans.reduce((best, current) => {
            const bestScore = best.totalUtilization * 0.4 + (100 - best.totalCost / 10000) * 0.3 + best.slaCompliance * 0.3
            const currentScore = current.totalUtilization * 0.4 + (100 - current.totalCost / 10000) * 0.3 + current.slaCompliance * 0.3
            return currentScore > bestScore ? current : best
          })
        },

        getWorstPlan: () => {
          const state = get()
          if (state.previousPlans.length === 0) return null

          return state.previousPlans.reduce((worst, current) => {
            const worstScore = worst.totalUtilization * 0.4 + (100 - worst.totalCost / 10000) * 0.3 + worst.slaCompliance * 0.3
            const currentScore = current.totalUtilization * 0.4 + (100 - current.totalCost / 10000) * 0.3 + current.slaCompliance * 0.3
            return currentScore < worstScore ? current : worst
          })
        },

        comparePlans: (index1, index2) => {
          const state = get()
          const plan1 = state.previousPlans[index1]
          const plan2 = state.previousPlans[index2]

          if (!plan1 || !plan2) return null

          return {
            costDifference: plan1.totalCost - plan2.totalCost,
            utilizationDifference: plan1.totalUtilization - plan2.totalUtilization,
            slaDifference: plan1.slaCompliance - plan2.slaCompliance,
            rakeCountDifference: plan1.rakes.length - plan2.rakes.length,
            winner: plan1.totalCost < plan2.totalCost ? 'plan1' : 'plan2',
          }
        },
      }),
      {
        name: 'rake-formation-store',
      }
    )
  )
)
