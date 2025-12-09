import React, { useState, useEffect } from 'react'
import ThroughputTimeline from '../components/ThroughputTimeline'
import {
  RealTimeThroughputDashboard,
  ThroughputTrendsPatterns,
  DispatchManagement,
  EquipmentTracking,
  ManpowerAnalytics,
  BottleneckDetection,
  ThroughputForecasting,
} from '../components/ThroughputAdvancedFeatures'
import {
  CostPerUnitThroughput,
  AlertsNotifications,
  ExportReporting,
  HistoricalAnalysis,
} from '../components/ThroughputAdvancedFeatures2'
import { fetchThroughputData } from '../api/throughputApi'
import { TrendingUp, Calendar, MapPin, Truck, AlertCircle, Zap, Clock, Gauge, Users, AlertTriangle, TrendingDown, DollarSign, Download, BarChart3, Brain } from 'lucide-react'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

export default function ThroughputPage() {
  const { dataImported, getPrediction } = useMLPredictions()
  const { data: importedData, isLoaded } = useImportedData()
  const [mlFuelConsumption, setMlFuelConsumption] = useState(null)
  const [mlMinLoadingTime, setMlMinLoadingTime] = useState(null)
  const [throughputData, setThroughputData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('main')
  const [mlModels] = useState({
    throughputOptimization: { name: 'Throughput Optimization', accuracy: 91.3, status: 'active' },
  })

  // Get ML prediction when data is imported
  useEffect(() => {
    if (dataImported) {
      const fuelPred = getPrediction('fuel_consumption')
      setMlFuelConsumption(fuelPred)
      const minLoadingPred = getPrediction('minimum_loading_time')
      setMlMinLoadingTime(minLoadingPred)
    }
  }, [dataImported, getPrediction])

  // Form state
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(1)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [loadingPoint, setLoadingPoint] = useState('LP1_Bokaro')

  const loadingPoints = [
    { id: 'LP1_Bokaro', label: 'LP1 - Bokaro', region: 'Region A' },
    { id: 'LP2_Dhanbad', label: 'LP2 - Dhanbad', region: 'Region A' },
    { id: 'LP3_Ranchi', label: 'LP3 - Ranchi', region: 'Region B' },
    { id: 'LP4_Jamshedpur', label: 'LP4 - Jamshedpur', region: 'Region B' },
    { id: 'LP5_Patna', label: 'LP5 - Patna', region: 'Region B' },
    { id: 'LP6_Hatia', label: 'LP6 - Hatia', region: 'Region A' },
  ]

  const handleFetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchThroughputData({
        startDate,
        endDate,
        loadingPoint,
      })
      setThroughputData(data)
    } catch (err) {
      setError('Failed to fetch throughput data: ' + err.message)
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleFetchData()
  }, [])

  useEffect(() => {
    if (!isLoaded || !importedData?.orders || !Array.isArray(importedData.orders)) return

    try {
      const orders = importedData.orders

      const start = new Date(startDate)
      const end = new Date(endDate)

      const byDate = new Map()

      orders.forEach((o) => {
        const rawDate = (o.orderDate || o.createdAt || new Date().toISOString()).toString().slice(0, 10)
        const dateObj = new Date(rawDate)
        if (Number.isNaN(dateObj.getTime())) return
        if (dateObj < start || dateObj > end) return

        const lpId = loadingPoint
        const lpField = o.loadingPointId || o.loadingPoint || null
        if (lpField && lpField !== lpId) return

        const qty = Number(o.totalQuantity ?? o.quantity ?? 0)
        if (!Number.isFinite(qty) || qty <= 0) return

        const prev = byDate.get(rawDate) || 0
        byDate.set(rawDate, prev + qty)
      })

      if (byDate.size === 0) return

      const throughputSeries = Array.from(byDate.entries())
        .sort(([d1], [d2]) => d1.localeCompare(d2))
        .map(([date, qty]) => ({
          date,
          throughput: qty,
        }))

      const totalQty = throughputSeries.reduce((sum, d) => sum + d.throughput, 0)
      const avgThroughput = totalQty / throughputSeries.length
      const peakThroughput = Math.max(...throughputSeries.map((d) => d.throughput))
      const totalDispatches = orders.length

      setThroughputData((prev) => ({
        ...(prev || {}),
        avgThroughput,
        peakThroughput,
        totalDispatches,
        throughput: throughputSeries,
      }))
    } catch (e) {
      console.error('Failed to derive throughput from imported data:', e)
    }
  }, [isLoaded, importedData, startDate, endDate, loadingPoint])

  const selectedLP = loadingPoints.find(lp => lp.id === loadingPoint)

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp size={32} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Throughput / Loading Point Analysis</h1>
        </div>
        <p className="text-slate-600">Monitor and analyze loading point throughput over time</p>
      </div>

      <InlineDataImport templateId="throughput" />

      {/* Error Message */}
      {error && (
        <div className="card p-4 bg-red-50 border-l-4 border-red-500">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Form Section */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Filter & Analyze</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              <Calendar size={16} className="inline mr-2" />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          {/* Loading Point */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              <MapPin size={16} className="inline mr-2" />
              Loading Point
            </label>
            <select
              value={loadingPoint}
              onChange={(e) => setLoadingPoint(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              {loadingPoints.map(lp => (
                <option key={lp.id} value={lp.id}>
                  {lp.label}
                </option>
              ))}
            </select>
          </div>

          {/* Analyze Button */}
          <div className="flex items-end">
            <button
              onClick={handleFetchData}
              disabled={loading}
              className="w-full btn btn-primary btn-sm"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        {[
          { id: 'main', label: 'Main Analysis', icon: TrendingUp },
          { id: 'realtime', label: 'Real-Time', icon: Zap },
          { id: 'trends', label: 'Trends', icon: BarChart3 },
          { id: 'dispatch', label: 'Dispatch', icon: Truck },
          { id: 'equipment', label: 'Equipment', icon: Gauge },
          { id: 'manpower', label: 'Manpower', icon: Users },
          { id: 'bottleneck', label: 'Bottleneck', icon: AlertTriangle },
          { id: 'forecast', label: 'Forecast', icon: TrendingUp },
          { id: 'cost', label: 'Cost/Unit', icon: DollarSign },
          { id: 'alerts', label: 'Alerts', icon: AlertCircle },
          { id: 'export', label: 'Export', icon: Download },
          { id: 'history', label: 'History', icon: Clock },
        ].map((tab) => {
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

      {/* KPI Cards */}
      {throughputData && activeTab === 'main' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-start gap-3">
              <TrendingUp size={20} className="text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-600">Average Throughput</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {(throughputData.avgThroughput / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-slate-600 mt-1">tonnes/day</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-start gap-3">
              <TrendingUp size={20} className="text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-600">Peak Throughput</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {(throughputData.peakThroughput / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-slate-600 mt-1">tonnes/day</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-start gap-3">
              <Truck size={20} className="text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-600">Total Dispatches</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {throughputData.totalDispatches.toLocaleString()}
                </p>
                <p className="text-xs text-slate-600 mt-1">in period</p>
              </div>
            </div>
          </div>

          {mlFuelConsumption && (
            <div className="card p-4">
              <div className="flex items-start gap-3">
                <Brain size={20} className="text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-600">AI Fuel Insight</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {(() => {
                      const raw = Number(
                        mlFuelConsumption.avgFuelPerDispatch ??
                          mlFuelConsumption.averageConsumption ??
                          mlFuelConsumption.fuel_per_tonne ??
                          0,
                      )
                      return raw > 0 ? raw.toFixed(1) : '—'
                    })()}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Confidence{' '}
                    {(() => {
                      const c = Number(mlFuelConsumption.confidence ?? 0)
                      if (!c) return 'N/A'
                      const pct = c <= 1 ? c * 100 : c
                      return `${pct.toFixed(0)}%`
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {mlMinLoadingTime && mlMinLoadingTime.status !== 'no_data' && (
            <div className="card p-4">
              <div className="flex items-start gap-3">
                <Clock size={20} className="text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-600">Minimum Loading Time (AI)</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {(() => {
                      const v = Number(mlMinLoadingTime.fastest_time_hours ?? 0)
                      return v > 0 ? `${v.toFixed(1)} h` : '—'
                    })()}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {mlMinLoadingTime.fastest_loading_point
                      ? `Fastest at ${mlMinLoadingTime.fastest_loading_point}`
                      : 'Based on throughput model and rake capacity'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="card p-4">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-orange-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-slate-600">Loading Point</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{selectedLP?.label}</p>
                <p className="text-xs text-slate-600 mt-1">{selectedLP?.region}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'main' && (
        <>
          {/* Timeline Chart */}
          {loading ? (
            <div className="card p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading throughput data...</p>
            </div>
          ) : throughputData ? (
            <ThroughputTimeline data={throughputData.throughput} loadingPoint={loadingPoint} />
          ) : null}
        </>
      )}

      {activeTab === 'realtime' && <RealTimeThroughputDashboard />}
      {activeTab === 'trends' && <ThroughputTrendsPatterns />}
      {activeTab === 'dispatch' && <DispatchManagement />}
      {activeTab === 'equipment' && <EquipmentTracking />}
      {activeTab === 'manpower' && <ManpowerAnalytics />}
      {activeTab === 'bottleneck' && <BottleneckDetection />}
      {activeTab === 'forecast' && <ThroughputForecasting />}
      {activeTab === 'cost' && <CostPerUnitThroughput />}
      {activeTab === 'alerts' && <AlertsNotifications />}
      {activeTab === 'export' && <ExportReporting />}
      {activeTab === 'history' && <HistoricalAnalysis />}

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-start gap-3">
            <TrendingUp size={20} className="text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-900 text-sm">Throughput Monitoring</p>
              <p className="text-xs text-slate-600 mt-1">Track daily throughput volumes and dispatch counts</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-green-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-900 text-sm">Loading Points</p>
              <p className="text-xs text-slate-600 mt-1">Analyze performance across different loading points</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-start gap-3">
            <Truck size={20} className="text-purple-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-900 text-sm">Dispatch Analytics</p>
              <p className="text-xs text-slate-600 mt-1">View dispatch counts and throughput correlation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
