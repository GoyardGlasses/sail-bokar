/**
 * Forecast Feature API
 * API calls for forecast feature with error handling
 */

import axios from 'axios'
import { ForecastConfig, ForecastResult, ForecastResponse, ForecastError } from './types'

const API_BASE = (import.meta.env as any).VITE_API_URL || 'http://127.0.0.1:8000'
const FORECAST_API = `${API_BASE}/api/v1/forecasts`

/**
 * Run forecast with given configuration
 */
export const runForecast = async (config: ForecastConfig): Promise<ForecastResult> => {
  try {
    const response = await axios.post<ForecastResponse>(`${FORECAST_API}/run`, config)
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data
  } catch (error) {
    const forecastError: ForecastError = {
      code: 'FORECAST_RUN_FAILED',
      message: error instanceof Error ? error.message : 'Failed to run forecast',
    }
    throw forecastError
  }
}

/**
 * Get forecast history
 */
export const getForecastHistory = async (limit: number = 10): Promise<ForecastResult[]> => {
  try {
    const response = await axios.get<{ data: ForecastResult[] }>(`${FORECAST_API}/history`, {
      params: { limit },
    })
    return response.data.data
  } catch (error) {
    throw {
      code: 'FORECAST_HISTORY_FAILED',
      message: 'Failed to fetch forecast history',
    }
  }
}

/**
 * Get forecast by ID
 */
export const getForecastById = async (id: string): Promise<ForecastResult> => {
  try {
    const response = await axios.get<{ data: ForecastResult }>(`${FORECAST_API}/${id}`)
    return response.data.data
  } catch (error) {
    throw {
      code: 'FORECAST_NOT_FOUND',
      message: `Forecast ${id} not found`,
    }
  }
}

/**
 * Delete forecast
 */
export const deleteForecast = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${FORECAST_API}/${id}`)
  } catch (error) {
    throw {
      code: 'FORECAST_DELETE_FAILED',
      message: 'Failed to delete forecast',
    }
  }
}

/**
 * Export forecast results
 */
export const exportForecast = async (id: string, format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
  try {
    const response = await axios.get(`${FORECAST_API}/${id}/export`, {
      params: { format },
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    throw {
      code: 'FORECAST_EXPORT_FAILED',
      message: 'Failed to export forecast',
    }
  }
}
