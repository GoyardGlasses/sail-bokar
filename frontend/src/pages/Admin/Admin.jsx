import React, { useState } from 'react'
import { reloadModels, getMetrics } from '../../api/endpoints'
import { RefreshCw, Activity } from 'lucide-react'

export default function Admin() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [metrics, setMetrics] = useState(null)

  const handleReloadModels = async () => {
    setLoading(true)
    try {
      const adminToken = prompt('Enter admin token:')
      if (adminToken) {
        await reloadModels(adminToken)
        setMessage('✅ Models reloaded successfully')
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleGetMetrics = async () => {
    try {
      const data = await getMetrics()
      setMetrics(data.data)
    } catch (error) {
      setMessage(`❌ Error fetching metrics: ${error.message}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Model Management</h2>
          <button
            onClick={handleReloadModels}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <RefreshCw size={20} />
            Reload All Models
          </button>
          {message && (
            <p className="mt-4 p-3 bg-gray-100 rounded-lg text-sm">{message}</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Metrics</h2>
          <button
            onClick={handleGetMetrics}
            className="w-full flex items-center justify-center gap-2 bg-secondary-600 text-white py-3 rounded-lg hover:bg-secondary-700"
          >
            <Activity size={20} />
            Fetch Metrics
          </button>
          {metrics && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm">
              <p>Uptime: {metrics.uptime_seconds}s</p>
              <p>Optimizer Runs: {metrics.optimizer.total_runs}</p>
              <p>Success Rate: {metrics.optimizer.success_rate.toFixed(1)}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
