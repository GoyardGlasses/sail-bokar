/**
 * Forecast Store Tests
 * Unit tests for Zustand forecast store
 */

import { renderHook, act } from '@testing-library/react'
import { useForecastStore } from '../store'

describe('Forecast Store', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useForecastStore())
    act(() => {
      result.current.resetState()
    })
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useForecastStore())
      
      expect(result.current.forecastData).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.selectedModel).toBeNull()
    })
  })

  describe('setForecastData', () => {
    it('should set forecast data', () => {
      const { result } = renderHook(() => useForecastStore())
      const mockData = { id: '1', predictions: [1, 2, 3] }

      act(() => {
        result.current.setForecastData(mockData)
      })

      expect(result.current.forecastData).toEqual(mockData)
    })
  })

  describe('setIsLoading', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useForecastStore())

      act(() => {
        result.current.setIsLoading(true)
      })

      expect(result.current.isLoading).toBe(true)

      act(() => {
        result.current.setIsLoading(false)
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('setError', () => {
    it('should set error message', () => {
      const { result } = renderHook(() => useForecastStore())
      const errorMsg = 'Test error'

      act(() => {
        result.current.setError(errorMsg)
      })

      expect(result.current.error).toBe(errorMsg)
    })

    it('should clear error when set to null', () => {
      const { result } = renderHook(() => useForecastStore())

      act(() => {
        result.current.setError('Test error')
      })

      expect(result.current.error).toBe('Test error')

      act(() => {
        result.current.setError(null)
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('setSelectedModel', () => {
    it('should set selected model', () => {
      const { result } = renderHook(() => useForecastStore())
      const modelName = 'XGBoost'

      act(() => {
        result.current.setSelectedModel(modelName)
      })

      expect(result.current.selectedModel).toBe(modelName)
    })
  })

  describe('clearForecast', () => {
    it('should clear forecast data and error', () => {
      const { result } = renderHook(() => useForecastStore())

      act(() => {
        result.current.setForecastData({ id: '1' })
        result.current.setError('Test error')
      })

      expect(result.current.forecastData).not.toBeNull()
      expect(result.current.error).not.toBeNull()

      act(() => {
        result.current.clearForecast()
      })

      expect(result.current.forecastData).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })

  describe('resetState', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useForecastStore())

      act(() => {
        result.current.setForecastData({ id: '1' })
        result.current.setIsLoading(true)
        result.current.setError('Test error')
        result.current.setSelectedModel('XGBoost')
      })

      act(() => {
        result.current.resetState()
      })

      expect(result.current.forecastData).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.selectedModel).toBeNull()
    })
  })
})
