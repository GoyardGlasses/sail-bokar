/**
 * useRakeFormation Hook
 * Feature 2: Real-time database integration
 * Fetches live data for rake formation optimization
 */

import { useEffect, useState } from 'react'
import apiClient from '../api/client'

export function useRakeFormation() {
  const [orders, setOrders] = useState([])
  const [materials, setMaterials] = useState([])
  const [rakes, setRakes] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  /**
   * Fetch all real-time data
   */
  const fetchAllData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [ordersRes, materialsRes, rakesRes, plansRes] = await Promise.all([
        apiClient.get('/api/rake-formation/orders?status=pending&limit=100'),
        apiClient.get('/api/rake-formation/materials?minQuantity=0&limit=100'),
        apiClient.get('/api/rake-formation/rakes?status=available&limit=100'),
        apiClient.get('/api/rake-formation/plans?status=draft&limit=50'),
      ])

      setOrders(ordersRes.data.data || [])
      setMaterials(materialsRes.data.data || [])
      setRakes(rakesRes.data.data || [])
      setPlans(plansRes.data.data || [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching rake formation data:', err)
      setError(err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch orders
   */
  const getOrders = async (filters = {}) => {
    try {
      const params = new URLSearchParams({
        status: filters.status || 'pending',
        priority: filters.priority || '',
        days: filters.days || 30,
        limit: filters.limit || 100,
      })

      const response = await apiClient.get(`/api/rake-formation/orders?${params}`)
      setOrders(response.data.data || [])
      return response.data.data
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err.message)
      return []
    }
  }

  /**
   * Fetch materials
   */
  const getMaterials = async (filters = {}) => {
    try {
      const params = new URLSearchParams({
        stockyardId: filters.stockyardId || '',
        materialId: filters.materialId || '',
        minQuantity: filters.minQuantity || 0,
        limit: filters.limit || 100,
      })

      const response = await apiClient.get(`/api/rake-formation/materials?${params}`)
      setMaterials(response.data.data || [])
      return response.data.data
    } catch (err) {
      console.error('Error fetching materials:', err)
      setError(err.message)
      return []
    }
  }

  /**
   * Fetch rakes
   */
  const getRakes = async (filters = {}) => {
    try {
      const params = new URLSearchParams({
        status: filters.status || 'available',
        location: filters.location || '',
        minCapacity: filters.minCapacity || 0,
        limit: filters.limit || 100,
      })

      const response = await apiClient.get(`/api/rake-formation/rakes?${params}`)
      setRakes(response.data.data || [])
      return response.data.data
    } catch (err) {
      console.error('Error fetching rakes:', err)
      setError(err.message)
      return []
    }
  }

  /**
   * Save plan to database
   */
  const savePlan = async (plan) => {
    try {
      const response = await apiClient.post('/api/rake-formation/plans', plan)
      return response.data.data
    } catch (err) {
      console.error('Error saving plan:', err)
      setError(err.message)
      throw err
    }
  }

  /**
   * Fetch saved plans
   */
  const getPlans = async (filters = {}) => {
    try {
      const params = new URLSearchParams({
        status: filters.status || 'draft',
        days: filters.days || 30,
        limit: filters.limit || 50,
      })

      const response = await apiClient.get(`/api/rake-formation/plans?${params}`)
      setPlans(response.data.data || [])
      return response.data.data
    } catch (err) {
      console.error('Error fetching plans:', err)
      setError(err.message)
      return []
    }
  }

  /**
   * Check system health
   */
  const checkHealth = async () => {
    try {
      const response = await apiClient.get('/api/rake-formation/health')
      return response.data.data
    } catch (err) {
      console.error('Error checking health:', err)
      return { connected: false, mode: 'mock' }
    }
  }

  /**
   * Auto-refresh data every 5 minutes
   */
  useEffect(() => {
    fetchAllData()

    const interval = setInterval(() => {
      fetchAllData()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [])

  return {
    // Data
    orders,
    materials,
    rakes,
    plans,
    lastUpdated,

    // Loading & Error
    loading,
    error,

    // Functions
    fetchAllData,
    getOrders,
    getMaterials,
    getRakes,
    savePlan,
    getPlans,
    checkHealth,
  }
}

export default useRakeFormation
