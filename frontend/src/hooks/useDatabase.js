/**
 * useDatabase Hook
 * Provides access to historical data from PostgreSQL database
 * Replaces mock data with real database records
 */

import { useState, useEffect, useCallback } from 'react'
import client from '../api/client'

export const useDatabase = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ============================================================================
  // SHIPMENTS
  // ============================================================================

  const getShipments = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.route) params.append('route', filters.route)
      if (filters.material) params.append('material', filters.material)
      if (filters.days) params.append('days', filters.days)
      if (filters.limit) params.append('limit', filters.limit)

      const response = await client.get(`/api/database/shipments?${params}`)
      setLoading(false)
      return response.data || []
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return []
    }
  }, [])

  const getShipmentsSummary = useCallback(async (days = 30) => {
    setLoading(true)
    setError(null)
    try {
      const response = await client.get(`/api/database/shipments/summary?days=${days}`)
      setLoading(false)
      return response.data
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return null
    }
  }, [])

  // ============================================================================
  // DECISIONS
  // ============================================================================

  const getDecisions = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.scenario) params.append('scenario', filters.scenario)
      if (filters.days) params.append('days', filters.days)
      if (filters.limit) params.append('limit', filters.limit)

      const response = await client.get(`/api/database/decisions?${params}`)
      setLoading(false)
      return response.data || []
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return []
    }
  }, [])

  // ============================================================================
  // DISPATCHES
  // ============================================================================

  const getDispatches = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.route) params.append('route', filters.route)
      if (filters.material) params.append('material', filters.material)
      if (filters.status) params.append('status', filters.status)
      if (filters.days) params.append('days', filters.days)
      if (filters.limit) params.append('limit', filters.limit)

      const response = await client.get(`/api/database/dispatches?${params}`)
      setLoading(false)
      return response.data || []
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return []
    }
  }, [])

  const getDispatchesSummary = useCallback(async (days = 30) => {
    setLoading(true)
    setError(null)
    try {
      const response = await client.get(`/api/database/dispatches/summary?days=${days}`)
      setLoading(false)
      return response.data
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return null
    }
  }, [])

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  const getMaterialAnalytics = useCallback(async (days = 30) => {
    setLoading(true)
    setError(null)
    try {
      const response = await client.get(`/api/database/analytics/materials?days=${days}`)
      setLoading(false)
      return response.data || []
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return []
    }
  }, [])

  const getRouteAnalytics = useCallback(async (days = 30) => {
    setLoading(true)
    setError(null)
    try {
      const response = await client.get(`/api/database/analytics/routes?days=${days}`)
      setLoading(false)
      return response.data
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return null
    }
  }, [])

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  const checkDatabaseHealth = useCallback(async () => {
    try {
      const response = await client.get('/api/database/health')
      return response.data
    } catch (err) {
      return { connected: false, error: err.message }
    }
  }, [])

  return {
    loading,
    error,
    // Shipments
    getShipments,
    getShipmentsSummary,
    // Decisions
    getDecisions,
    // Dispatches
    getDispatches,
    getDispatchesSummary,
    // Analytics
    getMaterialAnalytics,
    getRouteAnalytics,
    // Health
    checkDatabaseHealth,
  }
}

export default useDatabase
