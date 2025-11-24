/**
 * Scenario Analysis Store
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { ScenarioAnalysisState, Scenario, ScenarioComparison } from './types'

interface ScenarioAnalysisStore extends ScenarioAnalysisState {
  addScenario: (scenario: Scenario) => void
  removeScenario: (id: string) => void
  compareScenarios: (id1: string, id2: string) => ScenarioComparison | null
  setSelectedScenario: (id: string | undefined) => void
  setAnalyzing: (analyzing: boolean) => void
  setError: (error: string | null) => void
}

export const useScenarioAnalysisStore = create<ScenarioAnalysisStore>()(
  devtools(
    persist(
      (set, get) => ({
        scenarios: [],
        comparisons: [],
        isAnalyzing: false,
        error: null,

        addScenario: (scenario) =>
          set((state) => ({
            scenarios: [...state.scenarios, scenario],
          })),

        removeScenario: (id) =>
          set((state) => ({
            scenarios: state.scenarios.filter((s) => s.id !== id),
          })),

        compareScenarios: (id1, id2) => {
          const state = get()
          const s1 = state.scenarios.find((s) => s.id === id1)
          const s2 = state.scenarios.find((s) => s.id === id2)
          if (!s1 || !s2) return null

          return {
            scenario1: s1,
            scenario2: s2,
            costDifference: s1.results.totalCost - s2.results.totalCost,
            revenueDifference: s1.results.totalRevenue - s2.results.totalRevenue,
            profitDifference: s1.results.profitMargin - s2.results.profitMargin,
            winner: s1.results.profitMargin > s2.results.profitMargin ? s1.name : s2.name,
          }
        },

        setSelectedScenario: (id) => set({ selectedScenario: id }),
        setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
        setError: (error) => set({ error }),
      }),
      { name: 'scenario-analysis-store' }
    )
  )
)
