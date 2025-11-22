import React, { useEffect, useState } from 'react'
import { Package, Zap, Truck, TrendingUp } from 'lucide-react'
import KPICard from '../../components/Cards/KPICard'
import { getMetrics } from '../../api/endpoints'

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getMetrics()
        setMetrics(data.data)
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Available Rakes"
          value="12"
          unit="rakes"
          trend={5}
          icon={Zap}
          color="primary"
        />
        <KPICard
          title="Pending Orders"
          value="24"
          unit="orders"
          trend={-2}
          icon={Package}
          color="warning"
        />
        <KPICard
          title="Trucks Available"
          value="18"
          unit="trucks"
          trend={0}
          icon={Truck}
          color="success"
        />
        <KPICard
          title="Optimization Success"
          value="95.2"
          unit="%"
          trend={3}
          icon={TrendingUp}
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Optimizations</h2>
          <div className="space-y-3">
            {/* Placeholder for recent optimizations */}
            <p className="text-gray-500 text-center py-8">No recent optimizations</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
          <div className="space-y-3">
            {/* Placeholder for system health */}
            <p className="text-gray-500 text-center py-8">Loading health status...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
