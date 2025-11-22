import { create } from 'zustand'

/**
 * Optimization state store
 * Manages optimization results, status, and history
 */
export const useOptimizeStore = create((set) => ({
  // Current optimization
  result: null,
  isRunning: false,
  error: null,
  lastRunId: null,
  solverStatus: null,
  solverTime: 0,

  // History
  history: [],

  // Setters
  setResult: (result) =>
    set((state) => ({
      result,
      solverStatus: result?.solver_status,
      solverTime: result?.solver_time_seconds,
      lastRunId: result?.run_id || Date.now(),
      history: [result, ...state.history].slice(0, 10),
    })),

  setIsRunning: (isRunning) => set({ isRunning }),
  setError: (error) => set({ error }),

  clearResult: () =>
    set({
      result: null,
      solverStatus: null,
      solverTime: 0,
      error: null,
    }),

  clearHistory: () => set({ history: [] }),
}))
