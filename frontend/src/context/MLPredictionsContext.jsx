/**
 * ML Predictions Context
 * Provides ML predictions to entire application
 * Wrap your app with this provider to access predictions anywhere
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const MLPredictionsContext = createContext()

export function MLPredictionsProvider({ children }) {
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [dataImported, setDataImported] = useState(false)

  // Fetch predictions from backend
  const fetchPredictions = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/data-import/predictions')
      
      if (!response.ok) {
        throw new Error('Failed to fetch predictions')
      }

      const data = await response.json()
      setPredictions(data.predictions)
      setLastUpdated(new Date().toISOString())
      setError(null)
      setLoading(false)
      return data.predictions
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return null
    }
  }, [])

  // Check if data has been imported
  const checkDataStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/data-import/status')
      
      if (!response.ok) {
        // If endpoint doesn't exist, try to fetch predictions anyway
        if (response.status === 404) {
          await fetchPredictions()
          return null
        }
        throw new Error(`Status check failed: ${response.status}`)
      }
      
      const data = await response.json()
      const status = data.pipeline_status
      
      setDataImported(status.data_imported && status.models_executed)
      
      if (status.models_executed) {
        await fetchPredictions()
      }
      
      return status
    } catch (err) {
      // Silently fail - this is expected if backend isn't fully set up
      return null
    }
  }, [fetchPredictions])

  // Auto-check status on mount and periodically
  useEffect(() => {
    checkDataStatus()
    
    // Check every 5 seconds if data has been imported
    const interval = setInterval(checkDataStatus, 5000)
    
    return () => clearInterval(interval)
  }, [checkDataStatus])

  // Get specific prediction
  const getPrediction = useCallback((modelName) => {
    if (!predictions) return null
    return predictions[modelName] || null
  }, [predictions])

  // Get predictions by group
  const getPredictionsByGroup = useCallback((group) => {
    if (!predictions) return null
    
    const groups = {
      prediction: ['delay_prediction', 'cost_prediction', 'demand_forecasting', 'quality_prediction', 'fuel_consumption'],
      optimization: ['route_optimization', 'cost_optimization', 'time_optimization', 'vehicle_allocation', 'material_recommendation'],
      risk_decision: ['risk_assessment', 'decision_support', 'anomaly_detection', 'supplier_performance'],
      advanced: ['scenario_analysis', 'predictive_maintenance', 'customer_satisfaction']
    }
    
    if (!group || !groups[group]) return predictions
    
    const result = {}
    groups[group].forEach(model => {
      if (predictions[model]) {
        result[model] = predictions[model]
      }
    })
    
    return result
  }, [predictions])

  const value = {
    predictions,
    loading,
    error,
    lastUpdated,
    dataImported,
    fetchPredictions,
    checkDataStatus,
    getPrediction,
    getPredictionsByGroup,
    hasPredictions: predictions !== null && Object.keys(predictions).length > 0
  }

  return (
    <MLPredictionsContext.Provider value={value}>
      {children}
    </MLPredictionsContext.Provider>
  )
}

// Hook to use predictions anywhere
export function useMLPredictions() {
  const context = useContext(MLPredictionsContext)
  if (!context) {
    throw new Error('useMLPredictions must be used within MLPredictionsProvider')
  }
  return context
}
