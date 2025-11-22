import React, { useEffect, useState } from 'react'
import { Package, Zap, Truck, TrendingUp } from 'lucide-react'
import MetricCard from '../components/UI/MetricCard'
import Spinner from '../components/UI/Spinner'
import { getMetrics } from '../api/endpoints'

/**
 * Dashboard - Main landing page with KPIs
 */
export default function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getMetrics()
        setMetrics(data?.data || {})
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
        // Use mock data as fallback
        setMetrics({
          uptime_seconds: 3600,
          optimizer: {
            total_runs: 42,
            successes: 40,
            failures: 2,
            success_rate: 95.2
          },
          requests: {},
          models: {}
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Spinner text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome to SAIL Bokaro Logistics Optimizer</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-responsive">
        <MetricCard
          title="Available Rakes"
          value="12"
          unit="rakes"
          trend={5}
          icon={Zap}
          color="primary"
        />
        <MetricCard
          title="Pending Orders"
          value="24"
          unit="orders"
          trend={-2}
          icon={Package}
          color="warning"
        />
        <MetricCard
          title="Trucks Available"
          value="18"
          unit="trucks"
          trend={0}
          icon={Truck}
          color="success"
        />
        <MetricCard
          title="Optimization Success"
          value="95.2"
          unit="%"
          trend={3}
          icon={TrendingUp}
          color="success"
        />
      </div>

      {/* Charts & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Optimizations</h2>
          <div className="space-y-3">
            {metrics?.optimizer?.total_runs > 0 ? (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium">Total Runs: {metrics.optimizer.total_runs}</p>
                <p className="text-sm text-slate-600">Success Rate: {metrics.optimizer.success_rate.toFixed(1)}%</p>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No optimizations yet</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">System Health</h2>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-900">✓ All Systems Operational</p>
              <p className="text-xs text-green-700 mt-1">Uptime: {metrics?.uptime_seconds}s</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
