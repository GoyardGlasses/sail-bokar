/**
 * Forecast Feature Hooks
 * Custom React hooks for forecast feature
 */

import { useCallback } from 'react'
import { useForecastStore } from './store'
import { runForecast, getForecastHistory, getForecastById, deleteForecast, exportForecast } from './api'
import { ForecastConfig, ForecastResult } from './types'

/**
 * Hook to run forecast
 */
export const useRunForecast = () => {
  const { setIsLoading, setError, setForecastData } = useForecastStore()

  const run = useCallback(async (config: ForecastConfig) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await runForecast(config)
      setForecastData(result)
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to run forecast'
      setError(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading, setError, setForecastData])

  return { run, isLoading: useForecastStore((state) => state.isLoading) }
}

/**
 * Hook to fetch forecast history
 */
export const useForecastHistory = () => {
  const { setIsLoading, setError } = useForecastStore()

  const fetch = useCallback(async (limit?: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const history = await getForecastHistory(limit)
      return history
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch history'
      setError(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading, setError])

  return { fetch, isLoading: useForecastStore((state) => state.isLoading) }
}

/**
 * Hook to get forecast by ID
 */
export const useForecast = (id: string) => {
  const { setIsLoading, setError, setForecastData } = useForecastStore()

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getForecastById(id)
      setForecastData(result)
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch forecast'
      setError(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [id, setIsLoading, setError, setForecastData])

  return { fetch, isLoading: useForecastStore((state) => state.isLoading) }
}

/**
 * Hook to delete forecast
 */
export const useDeleteForecast = () => {
  const { setIsLoading, setError, clearForecast } = useForecastStore()

  const remove = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteForecast(id)
      clearForecast()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete forecast'
      setError(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading, setError, clearForecast])

  return { remove, isLoading: useForecastStore((state) => state.isLoading) }
}

/**
 * Hook to export forecast
 */
export const useExportForecast = () => {
  const { setIsLoading, setError } = useForecastStore()

  const export_ = useCallback(async (id: string, format: 'csv' | 'json' = 'csv') => {
    setIsLoading(true)
    setError(null)
    try {
      const blob = await exportForecast(id, format)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `forecast-${id}.${format}`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export forecast'
      setError(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading, setError])

  return { export: export_, isLoading: useForecastStore((state) => state.isLoading) }
}
