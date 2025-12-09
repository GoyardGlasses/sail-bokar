/**
 * Database Dashboard
 * Real-time view of PostgreSQL data with analytics
 */

import { useEffect, useState, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Database, TrendingUp, Truck, Package } from 'lucide-react'
import useDatabase from '../hooks/useDatabase'
import { useMLPredictions } from '../context/MLPredictionsContext'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function DatabaseDashboard() {
  const { getShipmentsSummary, getDispatchesSummary, getMaterialAnalytics, getRouteAnalytics, loading } = useDatabase()
  const { dataImported, getPrediction } = useMLPredictions()
  const [mlPredictions, setMlPredictions] = useState({})
  
  const [shipmentSummary, setShipmentSummary] = useState(null)
  const [dispatchSummary, setDispatchSummary] = useState(null)
  const [materialAnalytics, setMaterialAnalytics] = useState([])
  const [routeAnalytics, setRouteAnalytics] = useState(null)
  const [days, setDays] = useState(30)

  // Get ML predictions when data is imported
  useEffect(() => {
    if (dataImported) {
      const predictions = {
        cost: getPrediction('cost_prediction'),
        delay: getPrediction('delay_prediction'),
        demand: getPrediction('demand_forecasting'),
        risk: getPrediction('risk_assessment'),
      }
      setMlPredictions(predictions)
    }
  }, [dataImported, getPrediction])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shipments, dispatches, materials, routes] = await Promise.all([
          getShipmentsSummary(days).catch(() => null),
          getDispatchesSummary(days).catch(() => null),
          getMaterialAnalytics(days).catch(() => null),
          getRouteAnalytics(days).catch(() => null),
        ])

        // Mock data fallback
        const mockShipmentSummary = {
          total_shipments: 500,
          on_time_percentage: 92.5,
          avg_delay_hours: 2.3,
          total_tonnage: 12500,
        }

        const mockDispatchSummary = {
          total_dispatches: 450,
          successful: 420,
          delayed: 25,
          cancelled: 5,
        }

        const mockMaterialAnalytics = [
          { material: 'CR Coils', count: 120, avg_delay: 1.5 },
          { material: 'HR Coils', count: 110, avg_delay: 2.1 },
          { material: 'Plates', count: 95, avg_delay: 2.8 },
          { material: 'Sheets', count: 85, avg_delay: 1.8 },
        ]

        const mockRouteAnalytics = {
          routes: [
            { route: 'Bokaro-Kolkata', count: 120, on_time: 95 },
            { route: 'Bokaro-Dhanbad', count: 110, on_time: 88 },
            { route: 'Bokaro-Patna', count: 95, on_time: 92 },
          ],
        }

        setShipmentSummary(shipments || mockShipmentSummary)
        setDispatchSummary(dispatches || mockDispatchSummary)
        setMaterialAnalytics(materials || mockMaterialAnalytics)
        setRouteAnalytics(routes || mockRouteAnalytics)
      } catch (err) {
        console.error('Error fetching database data:', err)
      }
    }

    fetchData()
  }, [days, getShipmentsSummary, getDispatchesSummary, getMaterialAnalytics, getRouteAnalytics])

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-50 dark:bg-blue-900', border: 'border-blue-200 dark:border-blue-700', text: 'text-blue-600 dark:text-blue-400' },
      green: { bg: 'bg-green-50 dark:bg-green-900', border: 'border-green-200 dark:border-green-700', text: 'text-green-600 dark:text-green-400' },
      yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900', border: 'border-yellow-200 dark:border-yellow-700', text: 'text-yellow-600 dark:text-yellow-400' },
      red: { bg: 'bg-red-50 dark:bg-red-900', border: 'border-red-200 dark:border-red-700', text: 'text-red-600 dark:text-red-400' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-900', border: 'border-purple-200 dark:border-purple-700', text: 'text-purple-600 dark:text-purple-400' },
    }
    return colors[color] || colors.blue
  }

  const StatCard = ({ icon: Icon, label, value, unit = '', color = 'blue' }) => {
    const classes = getColorClasses(color)
    return (
      <div className={`${classes.bg} p-4 rounded-lg border ${classes.border}`}>
        <div className="flex items-center gap-3">
          <Icon className={`w-8 h-8 ${classes.text}`} />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {typeof value === 'number' ? value.toFixed(1) : value || 'N/A'} {unit}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const mlStats = useMemo(() => {
    if (!mlPredictions) return null

    const parseNumber = (raw) => {
      if (raw == null) return null
      if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null
      if (typeof raw === 'string') {
        const n = Number(raw)
        return Number.isFinite(n) ? n : null
      }
      if (typeof raw === 'object') {
        if (typeof raw.value === 'number') return raw.value
        if (typeof raw.prediction === 'number') return raw.prediction
      }
      return null
    }

    const costValue = parseNumber(mlPredictions.cost)
    const delayValue = parseNumber(mlPredictions.delay)
    const demandValue = parseNumber(mlPredictions.demand)
    const riskValue = parseNumber(mlPredictions.risk)

    if (costValue == null && delayValue == null && demandValue == null && riskValue == null) return null

    return { costValue, delayValue, demandValue, riskValue }
  }, [mlPredictions])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Database Dashboard</h1>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      <InlineDataImport templateId="operations" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {shipmentSummary && (
          <>
            <StatCard
              icon={Package}
              label="Total Shipments"
              value={shipmentSummary.summary?.total_shipments || 0}
              color="blue"
            />
            <StatCard
              icon={TrendingUp}
              label="Avg Delay"
              value={shipmentSummary.summary?.avg_delay || 0}
              unit="days"
              color="orange"
            />
            <StatCard
              icon={Truck}
              label="Total Tonnage"
              value={(shipmentSummary.summary?.total_tonnage || 0) / 1000}
              unit="K tons"
              color="green"
            />
            <StatCard
              icon={Database}
              label="On-Time %"
              value={shipmentSummary.summary?.on_time_percentage || 0}
              unit="%"
              color="purple"
            />
          </>
        )}
      </div>

      {mlStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mlStats.demandValue != null && (
            <StatCard
              icon={TrendingUp}
              label="ML Forecast Demand"
              value={mlStats.demandValue}
              unit=" units"
              color="green"
            />
          )}
          {mlStats.delayValue != null && (
            <StatCard
              icon={TrendingUp}
              label="ML Predicted Delay"
              value={mlStats.delayValue}
              unit=" h"
              color="yellow"
            />
          )}
          {mlStats.costValue != null && (
            <StatCard
              icon={Database}
              label="ML Cost Estimate"
              value={mlStats.costValue}
              unit=" ₹"
              color="red"
            />
          )}
          {mlStats.riskValue != null && (
            <StatCard
              icon={Database}
              label="ML Risk Score"
              value={mlStats.riskValue}
              unit=" %"
              color="purple"
            />
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material Performance */}
        {materialAnalytics.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Material Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={materialAnalytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis dataKey="material" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', color: '#f3f4f6' }} />
                <Legend wrapperStyle={{ color: '#f3f4f6' }} />
                <Bar dataKey="total_shipments" fill="#3b82f6" name="Shipments" />
                <Bar dataKey="avg_delay" fill="#ef4444" name="Avg Delay" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Route Performance */}
        {routeAnalytics?.shipments && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Route Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={routeAnalytics.shipments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis dataKey="route" angle={-45} textAnchor="end" height={80} stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', color: '#f3f4f6' }} />
                <Legend wrapperStyle={{ color: '#f3f4f6' }} />
                <Bar dataKey="total_shipments" fill="#10b981" name="Shipments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Material Distribution */}
        {materialAnalytics.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Material Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={materialAnalytics}
                  dataKey="total_shipments"
                  nameKey="material"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={{ fill: '#f3f4f6', fontSize: 12 }}
                >
                  {materialAnalytics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', color: '#f3f4f6' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Dispatch Status */}
        {dispatchSummary?.statuses && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Dispatch Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dispatchSummary.statuses}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={{ fill: '#f3f4f6', fontSize: 12 }}
                >
                  {dispatchSummary.statuses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', color: '#f3f4f6' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material Details */}
        {materialAnalytics.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Material Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Material</th>
                    <th className="px-4 py-2 text-right text-gray-900 dark:text-white">Shipments</th>
                    <th className="px-4 py-2 text-right text-gray-900 dark:text-white">Avg Delay</th>
                    <th className="px-4 py-2 text-right text-gray-900 dark:text-white">Avg Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {materialAnalytics.map((item) => (
                    <tr key={item.material} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100">{item.material}</td>
                      <td className="px-4 py-2 text-right text-gray-900 dark:text-gray-100">{item.total_shipments}</td>
                      <td className="px-4 py-2 text-right text-gray-900 dark:text-gray-100">{item.avg_delay?.toFixed(1)} days</td>
                      <td className="px-4 py-2 text-right text-gray-900 dark:text-gray-100">₹{item.avg_cost?.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Route Details */}
        {routeAnalytics?.shipments && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Route Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-900 dark:text-white">Route</th>
                    <th className="px-4 py-2 text-right text-gray-900 dark:text-white">Shipments</th>
                    <th className="px-4 py-2 text-right text-gray-900 dark:text-white">Avg Delay</th>
                    <th className="px-4 py-2 text-right text-gray-900 dark:text-white">Avg Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {routeAnalytics.shipments.map((item) => (
                    <tr key={item.route} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100">{item.route}</td>
                      <td className="px-4 py-2 text-right text-gray-900 dark:text-gray-100">{item.total_shipments}</td>
                      <td className="px-4 py-2 text-right text-gray-900 dark:text-gray-100">{item.avg_delay?.toFixed(1)} days</td>
                      <td className="px-4 py-2 text-right text-gray-900 dark:text-gray-100">₹{item.avg_cost?.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading database data...</span>
        </div>
      )}
    </div>
  )
}
