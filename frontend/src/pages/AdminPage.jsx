import React, { useState } from 'react'
import { reloadModels, getMetrics } from '../api/endpoints'
import { RefreshCw, Activity } from 'lucide-react'
import Spinner from '../components/UI/Spinner'

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [metrics, setMetrics] = useState(null)

  const handleReloadModels = async () => {
    setLoading(true)
    try {
      await reloadModels()
      setMessage('✅ Models reloaded successfully')
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
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Model Management</h2>
          <button
            onClick={handleReloadModels}
            disabled={loading}
            className="w-full btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={20} />
            Reload All Models
          </button>
          {message && (
            <p className="mt-4 p-3 bg-slate-100 rounded-lg text-sm">{message}</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">System Metrics</h2>
          <button
            onClick={handleGetMetrics}
            className="w-full btn btn-primary flex items-center justify-center gap-2"
          >
            <Activity size={20} />
            Fetch Metrics
          </button>
          {metrics && (
            <div className="mt-4 p-3 bg-slate-100 rounded-lg text-sm space-y-1">
              <p>Uptime: {metrics.uptime_seconds}s</p>
              <p>Optimizer Runs: {metrics.optimizer?.total_runs}</p>
              <p>Success Rate: {metrics.optimizer?.success_rate?.toFixed(1)}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
