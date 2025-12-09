import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, AlertCircle } from 'lucide-react'
import Spinner from '../components/UI/Spinner'
import { optimizeDispatch } from '../api/endpoints'
import { useOptimizeStore } from '../store/useOptimizeStore'
import { useAppStore } from '../store/useAppStore'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

/**
 * OptimizePage - Main optimization form
 */
export default function OptimizePage() {
  const navigate = useNavigate()
  const { setResult, setIsRunning, setError } = useOptimizeStore()
  const { addNotification } = useAppStore()
  const { dataImported, getPrediction } = useMLPredictions()
  const [mlRouteOptimization, setMlRouteOptimization] = useState(null)
  const [mlTimeOptimization, setMlTimeOptimization] = useState(null)
  const { data: importedData, isLoaded } = useImportedData()

  const [formData, setFormData] = useState({
    orders: [],
    available_rakes: 5,
    available_trucks: 20,
    inventory: {
      HR_Coils: 5000,
      CR_Coils: 3000,
      Plates: 2000,
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setLocalError] = useState(null)

  // When imported data is available, use it to pre-fill orders/inventory while keeping manual edits
  useEffect(() => {
    if (!isLoaded || !importedData) return

    try {
      if (Array.isArray(importedData.orders) && importedData.orders.length > 0) {
        setFormData((prev) => {
          if (prev.orders && prev.orders.length > 0) return prev
          return {
            ...prev,
            orders: importedData.orders,
            inventory: importedData.inventory || prev.inventory,
          }
        })
      } else if (Array.isArray(importedData.rakes) && importedData.rakes.length > 0) {
        setFormData((prev) => ({
          ...prev,
          available_rakes: importedData.rakes.length || prev.available_rakes,
        }))
      }
    } catch (err) {
      console.error('Failed to map imported data for optimization:', err)
    }
  }, [isLoaded, importedData])

  // Get ML predictions when data is imported
  useEffect(() => {
    if (dataImported) {
      const routeOpt = getPrediction('route_optimization')
      const timeOpt = getPrediction('time_optimization')
      setMlRouteOptimization(routeOpt)
      setMlTimeOptimization(timeOpt)
    }
  }, [dataImported, getPrediction])

  const handleOptimize = async () => {
    setIsLoading(true)
    setLocalError(null)
    setIsRunning(true)

    try {
      const response = await optimizeDispatch(formData)
      setResult(response.data)
      addNotification({
        type: 'success',
        message: 'Optimization completed successfully!',
      })
      navigate('/optimize-result')
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Optimization failed'
      setLocalError(errorMsg)
      setError(errorMsg)
      addNotification({
        type: 'error',
        message: errorMsg,
      })
    } finally {
      setIsLoading(false)
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    setFormData({
      orders: [],
      available_rakes: 5,
      available_trucks: 20,
      inventory: {
        HR_Coils: 5000,
        CR_Coils: 3000,
        Plates: 2000,
      },
    })
    setLocalError(null)
  }

  const hasImportedOrders =
    isLoaded && importedData && Array.isArray(importedData.orders) && importedData.orders.length > 0

  const hasImportedRakes =
    isLoaded && importedData && Array.isArray(importedData.rakes) && importedData.rakes.length > 0

  let totalOrders = 0
  let totalTonnage = 0

  if (hasImportedOrders) {
    importedData.orders.forEach((o) => {
      const qty = Number(o.totalQuantity ?? o.quantity ?? 0)
      if (Number.isFinite(qty) && qty > 0) {
        totalTonnage += qty
      }
    })
    totalOrders = importedData.orders.length
  }

  if (!hasImportedOrders && hasImportedRakes) {
    importedData.rakes.forEach((r) => {
      const qty = Number(r.totalTonnage ?? r.tonnage ?? r.quantity ?? 0)
      if (Number.isFinite(qty) && qty > 0) {
        totalTonnage += qty
      }
    })
  }

  const mlRouteSummary = (() => {
    const raw = Array.isArray(mlRouteOptimization) ? mlRouteOptimization[0] : mlRouteOptimization
    if (!raw || typeof raw !== 'object') return null
    const value =
      raw.recommended_rakes ??
      raw.best_rakes ??
      raw.rakes ??
      raw.suggested_rakes ??
      null
    return value ?? null
  })()

  const mlTimeSavingsHours = (() => {
    const raw = Array.isArray(mlTimeOptimization) ? mlTimeOptimization[0] : mlTimeOptimization
    if (!raw || typeof raw !== 'object') return null
    const value =
      raw.time_savings_hours ??
      raw.time_reduction_hours ??
      raw.eta_improvement_hours ??
      null
    return typeof value === 'number' ? value : null
  })()

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Rake Optimization</h1>
        <p className="text-slate-600 mt-1">Configure parameters and run optimization</p>
      </div>

      <InlineDataImport templateId="operations" />

      {(totalOrders > 0 || totalTonnage > 0 || mlRouteSummary !== null || mlTimeSavingsHours !== null) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {totalOrders > 0 && (
            <div className="card">
              <p className="text-sm text-slate-600">Imported Orders</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {totalOrders.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {totalTonnage > 0
                  ? `${totalTonnage.toLocaleString()}T total tonnage`
                  : 'No tonnage field detected'}
              </p>
            </div>
          )}

          {mlRouteSummary !== null && (
            <div className="card">
              <p className="text-sm text-slate-600">ML Recommended Rakes</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {mlRouteSummary}
              </p>
              <p className="text-xs text-slate-500 mt-1">From route_optimization model</p>
            </div>
          )}

          {mlTimeSavingsHours !== null && (
            <div className="card">
              <p className="text-sm text-slate-600">ML Time Savings</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {mlTimeSavingsHours.toFixed(1)}h
              </p>
              <p className="text-xs text-slate-500 mt-1">From time_optimization model</p>
            </div>
          )}
        </div>
      )}

      <div className="card max-w-2xl">
        <div className="space-y-6">
          {/* Rakes Input */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Available Rakes (Max: 80)
            </label>
            <input
              type="number"
              min="0"
              max="80"
              value={formData.available_rakes}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : Math.min(80, Math.max(0, parseInt(e.target.value, 10)))
                setFormData({ ...formData, available_rakes: val })
              }}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-50"
              disabled={isLoading}
            />
          </div>

          {/* Trucks Input */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Available Trucks (Max: 80)
            </label>
            <input
              type="number"
              min="0"
              max="80"
              value={formData.available_trucks}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : Math.min(80, Math.max(0, parseInt(e.target.value, 10)))
                setFormData({ ...formData, available_trucks: val })
              }}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-50"
              disabled={isLoading}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleOptimize}
              disabled={isLoading}
              className="flex-1 btn btn-primary disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" />
                  Running...
                </>
              ) : (
                <>
                  <Zap size={20} />
                  Run Optimization
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="btn btn-outline"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="card flex items-center justify-center py-12">
          <Spinner text="Optimizing dispatch plan..." />
        </div>
      )}
    </div>
  )
}
