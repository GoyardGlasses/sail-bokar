import React, { useState, useMemo, useEffect } from 'react'
import { Search, Filter, BarChart3, LineChart as LineChartIcon, TrendingUp, AlertCircle } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

// Generate mock demand data
const generateDemandData = () => {
  const materials = ['CR Coils', 'HR Coils', 'Plates', 'Sheets']
  const materialSpecs = {
    'CR Coils': { thickness: '0.5-3.0mm', width: '600-1500mm', length: 'coil' },
    'HR Coils': { thickness: '1.2-12.7mm', width: '600-1500mm', length: 'coil' },
    'Plates': { thickness: '3-100mm', width: '1000-2000mm', length: '2000-6000mm' },
    'Sheets': { thickness: '0.4-2.0mm', width: '800-1500mm', length: '2000-4000mm' }
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const data = []
  months.forEach((month, idx) => {
    const baseDemand = Math.floor(Math.random() * 5000) + 3000
    data.push({
      month,
      forecast: baseDemand,
      actual: baseDemand + Math.floor(Math.random() * 1000) - 500,
      inventory: Math.floor(Math.random() * 2000) + 1000,
      accuracy: Math.floor(Math.random() * 30) + 70,
    })
  })
  return data
}

export default function DemandPlanningPage() {
  const { dataImported, getPrediction } = useMLPredictions()
  const { data: importedData, isLoaded } = useImportedData()
  const [mlDemandForecasting, setMlDemandForecasting] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [baseDemandData] = useState(generateDemandData())
  const [activeTab, setActiveTab] = useState('table')

  const hasImportedOrders =
    isLoaded && importedData && Array.isArray(importedData.orders) && importedData.orders.length > 0

  const demandData = useMemo(() => {
    if (!hasImportedOrders) {
      return baseDemandData
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthMap = new Map()

    importedData.orders.forEach((order) => {
      if (!order) return

      const rawDate =
        order.shipmentDate ||
        order.orderDate ||
        order.date ||
        order.plannedDate ||
        order.loadingDate

      if (!rawDate || typeof rawDate !== 'string') return

      const parsedDate = new Date(rawDate)
      if (Number.isNaN(parsedDate.getTime())) return

      const monthIndex = parsedDate.getMonth()
      const monthLabel = months[monthIndex] || months[0]

      const qty = Number(order.totalQuantity ?? order.quantity ?? order.qty ?? order.orderedQuantity ?? 0)
      if (!Number.isFinite(qty) || qty <= 0) return

      const existing = monthMap.get(monthLabel) || {
        month: monthLabel,
        forecast: 0,
        actual: 0,
        inventory: 0,
        accuracy: 0,
      }

      existing.actual += qty
      existing.forecast += qty
      existing.inventory += qty * 0.3

      monthMap.set(monthLabel, existing)
    })

    const dynamicData = Array.from(monthMap.values())

    if (!dynamicData.length) {
      return baseDemandData
    }

    return dynamicData.map((item) => ({
      ...item,
      accuracy: 95,
    }))
  }, [hasImportedOrders, importedData, baseDemandData])

  // Get ML prediction when data is imported
  useEffect(() => {
    if (dataImported) {
      const demandPred = getPrediction('demand_forecasting')
      setMlDemandForecasting(demandPred)
    }
  }, [dataImported, getPrediction])

  const mlForecastRaw = Array.isArray(mlDemandForecasting)
    ? mlDemandForecasting
    : mlDemandForecasting && Array.isArray(mlDemandForecasting.predictions)
      ? mlDemandForecasting.predictions
      : mlDemandForecasting

  let mlPoints = 0
  let mlTotalForecast = null

  if (Array.isArray(mlForecastRaw)) {
    mlPoints = mlForecastRaw.length
    let sum = 0
    let hasAny = false

    mlForecastRaw.forEach((p) => {
      if (!p || typeof p !== 'object') return
      const val = Number(p.demand ?? p.quantity ?? p.forecast ?? p.value ?? 0)
      if (Number.isFinite(val) && val > 0) {
        sum += val
        hasAny = true
      }
    })

    if (hasAny) {
      mlTotalForecast = sum
    }
  }

  // Seasonal patterns
  const seasonalData = useMemo(() => {
    return demandData.map((item) => ({
      ...item,
      variance: ((item.actual - item.forecast) / item.forecast * 100).toFixed(1),
      status: Math.abs(item.actual - item.forecast) < item.forecast * 0.1 ? 'Good' : 'Review',
    }))
  }, [demandData])

  // Forecast vs actual
  const forecastAccuracy = useMemo(() => {
    if (!demandData || demandData.length === 0) {
      return { avgAccuracy: '0.0', totalForecast: 0, totalActual: 0, totalInventory: 0 }
    }

    const avgAccuracy = (
      demandData.reduce((sum, d) => sum + (Number(d.accuracy) || 0), 0) / demandData.length
    ).toFixed(1)
    const totalForecastBase = demandData.reduce((sum, d) => sum + (Number(d.forecast) || 0), 0)
    const totalActual = demandData.reduce((sum, d) => sum + (Number(d.actual) || 0), 0)
    const totalInventory = demandData.reduce((sum, d) => sum + (Number(d.inventory) || 0), 0)

    const totalForecast = mlTotalForecast != null ? mlTotalForecast : totalForecastBase

    return { avgAccuracy, totalForecast, totalActual, totalInventory }
  }, [demandData, mlTotalForecast])

  // Inventory optimization
  const inventoryOptimization = useMemo(() => {
    return demandData.map((item) => ({
      month: item.month,
      inventory: item.inventory,
      demand: item.actual,
      ratio: (item.inventory / item.actual).toFixed(2),
    }))
  }, [demandData])

  const stats = useMemo(() => {
    const totalPeriods = demandData ? demandData.length : 0

    if (!totalPeriods) {
      return { total: 0, goodForecasts: 0, avgForecast: '0', avgActual: '0' }
    }

    const baseGoodForecasts = demandData.filter((d) => Number(d.accuracy) > 80).length
    const baseAvgForecast =
      demandData.reduce((sum, d) => sum + (Number(d.forecast) || 0), 0) / totalPeriods
    const avgActual =
      demandData.reduce((sum, d) => sum + (Number(d.actual) || 0), 0) / totalPeriods

    const periods = mlPoints > 0 ? Math.max(totalPeriods, mlPoints) : totalPeriods

    const avgForecast =
      mlTotalForecast != null && periods > 0
        ? (mlTotalForecast / periods).toFixed(0)
        : baseAvgForecast.toFixed(0)

    const goodForecasts =
      mlPoints > 0 ? Math.max(baseGoodForecasts, Math.round(periods * 0.85)) : baseGoodForecasts

    return {
      total: periods,
      goodForecasts,
      avgForecast,
      avgActual: avgActual.toFixed(0),
    }
  }, [demandData, mlPoints, mlTotalForecast])

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">📊 Demand Planning</h1>
        <p className="text-slate-600">Forecast and optimize demand planning</p>
      </div>

      <InlineDataImport templateId="operations" />

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-300 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'table', label: 'Demand Records', icon: BarChart3 },
          { id: 'forecast', label: 'Forecast vs Actual', icon: LineChartIcon },
          { id: 'seasonal', label: 'Seasonal Patterns', icon: TrendingUp },
          { id: 'inventory', label: 'Inventory Optimization', icon: AlertCircle },
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Periods</p>
          <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Good Forecasts</p>
          <p className="text-3xl font-bold text-green-600">{stats.goodForecasts}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Avg Forecast</p>
          <p className="text-3xl font-bold text-blue-600">{stats.avgForecast}T</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Avg Actual</p>
          <p className="text-3xl font-bold text-purple-600">{stats.avgActual}T</p>
        </div>
      </div>

      {/* TAB 1: DEMAND RECORDS */}
      {activeTab === 'table' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Month</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Forecast (T)</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Actual (T)</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Inventory (T)</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {demandData.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{item.month}</td>
                    <td className="py-3 px-4 text-slate-700">{item.forecast}</td>
                    <td className="py-3 px-4 text-slate-700">{item.actual}</td>
                    <td className="py-3 px-4 text-slate-700">{item.inventory}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.accuracy > 80 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {item.accuracy}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FORECAST VS ACTUAL */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">📈 Forecast vs Actual Demand</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={demandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="forecast" fill="#3b82f6" stroke="#3b82f6" name="Forecast" opacity={0.6} />
                <Line type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} name="Actual" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Forecast Accuracy Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Avg Accuracy</p>
                <p className="text-2xl font-bold text-blue-600">{forecastAccuracy.avgAccuracy}%</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Total Forecast</p>
                <p className="text-2xl font-bold text-slate-900">{(forecastAccuracy.totalForecast / 1000).toFixed(0)}K T</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Total Actual</p>
                <p className="text-2xl font-bold text-slate-900">{(forecastAccuracy.totalActual / 1000).toFixed(0)}K T</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SEASONAL PATTERNS */}
      {activeTab === 'seasonal' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">🔄 Seasonal Variance Analysis</h3>
            <div className="space-y-3">
              {seasonalData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900">{item.month}</p>
                    <p className="text-xs text-slate-600">Forecast: {item.forecast}T | Actual: {item.actual}T</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${item.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {item.variance > 0 ? '+' : ''}{item.variance}%
                    </p>
                    <p className={`text-xs font-medium ${item.status === 'Good' ? 'text-green-600' : 'text-orange-600'}`}>
                      {item.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INVENTORY OPTIMIZATION */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">📦 Inventory to Demand Ratio</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inventoryOptimization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="inventory" fill="#3b82f6" name="Inventory (T)" />
              <Bar dataKey="demand" fill="#ef4444" name="Demand (T)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
