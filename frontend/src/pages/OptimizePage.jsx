import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, AlertCircle } from 'lucide-react'
import Spinner from '../components/UI/Spinner'
import { optimizeDispatch } from '../api/endpoints'
import { useOptimizeStore } from '../store/useOptimizeStore'
import { useAppStore } from '../store/useAppStore'

/**
 * OptimizePage - Main optimization form
 */
export default function OptimizePage() {
  const navigate = useNavigate()
  const { setResult, setIsRunning, setError } = useOptimizeStore()
  const { addNotification } = useAppStore()

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

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Rake Optimization</h1>
        <p className="text-slate-600 mt-1">Configure parameters and run optimization</p>
      </div>

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
