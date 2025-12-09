/**
 * useMLPredictions Hook
 * Fetches ML model predictions and makes them available to all pages
 * This is the central hub for all ML predictions across the website
 */

import { useState, useEffect, useCallback } from 'react'

export default function useMLPredictions() {
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('idle') // idle, importing, analyzing, complete

  // Fetch all predictions from backend
  const fetchPredictions = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/data-import/predictions')
      
      if (!response.ok) {
        throw new Error('Failed to fetch predictions')
      }

      const data = await response.json()
      setPredictions(data.predictions)
      setError(null)
      setStatus('complete')
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
      setStatus('error')
    }
  }, [])

  // Get prediction for specific model
  const getPrediction = useCallback((modelName) => {
    if (!predictions) return null
    return predictions[modelName] || null
  }, [predictions])

  // Get all predictions grouped by category
  const getPredictionsByGroup = useCallback(() => {
    if (!predictions) return null

    return {
      prediction_models: {
        delay_prediction: predictions.delay_prediction,
        cost_prediction: predictions.cost_prediction,
        demand_forecasting: predictions.demand_forecasting,
        quality_prediction: predictions.quality_prediction,
        fuel_consumption: predictions.fuel_consumption,
      },
      optimization_models: {
        route_optimization: predictions.route_optimization,
        cost_optimization: predictions.cost_optimization,
        time_optimization: predictions.time_optimization,
        vehicle_allocation: predictions.vehicle_allocation,
        material_recommendation: predictions.material_recommendation,
      },
      risk_decision_models: {
        risk_assessment: predictions.risk_assessment,
        decision_support: predictions.decision_support,
        anomaly_detection: predictions.anomaly_detection,
        supplier_performance: predictions.supplier_performance,
      },
      advanced_models: {
        scenario_analysis: predictions.scenario_analysis,
        predictive_maintenance: predictions.predictive_maintenance,
        customer_satisfaction: predictions.customer_satisfaction,
      }
    }
  }, [predictions])

  // Check if data has been imported and analyzed
  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/data-import/status')
      const data = await response.json()
      return data.pipeline_status
    } catch (err) {
      console.error('Error checking status:', err)
      return null
    }
  }, [])

  // Auto-fetch predictions when component mounts
  useEffect(() => {
    fetchPredictions()
  }, [fetchPredictions])

  return {
    predictions,
    loading,
    error,
    status,
    fetchPredictions,
    getPrediction,
    getPredictionsByGroup,
    checkStatus,
    hasPredictions: predictions !== null && Object.keys(predictions).length > 0
  }
}
