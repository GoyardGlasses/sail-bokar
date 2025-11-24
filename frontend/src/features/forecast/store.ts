/**
 * Forecast Feature Store
 * Centralized state management for forecast feature using Zustand
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface ForecastState {
  // State
  forecastData: any | null
  isLoading: boolean
  error: string | null
  selectedModel: string | null
  
  // Actions
  setForecastData: (data: any) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSelectedModel: (model: string) => void
  clearForecast: () => void
  resetState: () => void
}

export const useForecastStore = create<ForecastState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        forecastData: null,
        isLoading: false,
        error: null,
        selectedModel: null,

        // Actions
        setForecastData: (data) => set({ forecastData: data }),
        setIsLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        setSelectedModel: (model) => set({ selectedModel: model }),
        clearForecast: () => set({ forecastData: null, error: null }),
        resetState: () => set({
          forecastData: null,
          isLoading: false,
          error: null,
          selectedModel: null,
        }),
      }),
      {
        name: 'forecast-store',
      }
    )
  )
)
