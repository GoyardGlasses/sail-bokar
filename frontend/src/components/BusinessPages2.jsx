import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts'
import { AlertCircle, TrendingUp, MapPin } from 'lucide-react'
import { getDefectData, getQualityMetrics, getSupplierQuality, getShipments, getSupplyChainMetrics, getDemandForecast, getSeasonalFactors, getDemandAccuracy } from '../api/businessPagesApi2'

// ============ QUALITY CONTROL COMPONENTS ============
export function QualityMetricsDisplay() {
  const [metrics, setMetrics] = useState(null)
  const [defects, setDefects] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [metricsData, defectData, supplierData] = await Promise.all([
        getQualityMetrics(),
        getDefectData(30),
        getSupplierQuality(),
      ])
      setMetrics(metricsData)
      setDefects(defectData)
      setSuppliers(supplierData)
    } catch (error) {
      console.error('Failed to load quality data:', error)
    } finally {
      setLoading(false)
    }
  }

  const defectsByType = defects.reduce((acc, d) => {
    const existing = acc.find(x => x.type === d.type)
    if (existing) {
      existing.count += d.count
    } else {
      acc.push({ type: d.type, count: d.count })
    }
    return acc
  }, [])

  return (
    <div className="space-y-6">
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card text-center">
            <p className="text-sm text-slate-600">AQL</p>
            <p className="text-3xl font-bold text-slate-900">{metrics.aql}%</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">LTPD</p>
            <p className="text-3xl font-bold text-slate-900">{metrics.ltpd}%</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Acceptance</p>
            <p className="text-3xl font-bold text-green-600">{metrics.acceptance}%</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Rejection</p>
            <p className="text-3xl font-bold text-red-600">{metrics.rejection}%</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Trend</p>
            <p className="text-lg font-bold text-blue-600">{metrics.trend}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-4">
            <h3 className="font-bold text-slate-900 mb-4">Defects by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={defectsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-4">
            <h3 className="font-bold text-slate-900 mb-4">Supplier Quality</h3>
            <div className="space-y-2">
              {suppliers.map((supplier, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <div>
                    <p className="font-medium text-slate-900">{supplier.supplier}</p>
                    <p className="text-xs text-slate-600">Defects: {supplier.defects}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{supplier.quality}%</p>
                    <p className={`text-xs ${supplier.trend === 'up' ? 'text-green-600' : supplier.trend === 'down' ? 'text-red-600' : 'text-slate-600'}`}>
                      {supplier.trend}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ SUPPLY CHAIN VISIBILITY COMPONENTS ============
export function ShipmentTracking() {
  const [shipments, setShipments] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [shipmentsData, metricsData] = await Promise.all([
        getShipments(),
        getSupplyChainMetrics(),
      ])
      setShipments(shipmentsData)
      setMetrics(metricsData)
    } catch (error) {
      console.error('Failed to load shipment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    'In Transit': 'bg-blue-100 text-blue-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Delayed': 'bg-red-100 text-red-800',
    'At Risk': 'bg-yellow-100 text-yellow-800',
  }

  return (
    <div className="space-y-6">
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card text-center">
            <p className="text-sm text-slate-600">On-Time Delivery</p>
            <p className="text-3xl font-bold text-green-600">{metrics.onTimeDelivery}%</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Avg Delay</p>
            <p className="text-3xl font-bold text-slate-900">{metrics.avgDelay}h</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Active</p>
            <p className="text-3xl font-bold text-slate-900">{metrics.activeShipments}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Delayed</p>
            <p className="text-3xl font-bold text-red-600">{metrics.delayedShipments}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">At Risk</p>
            <p className="text-3xl font-bold text-yellow-600">{metrics.atRiskShipments}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="px-4 py-2 text-left font-bold text-slate-900">Shipment</th>
                <th className="px-4 py-2 text-left font-bold text-slate-900">Route</th>
                <th className="px-4 py-2 text-left font-bold text-slate-900">Status</th>
                <th className="px-4 py-2 text-right font-bold text-slate-900">Progress</th>
                <th className="px-4 py-2 text-left font-bold text-slate-900">ETA</th>
                <th className="px-4 py-2 text-right font-bold text-slate-900">Risk</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((ship) => (
                <tr key={ship.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-900">{ship.id}</td>
                  <td className="px-4 py-2 text-slate-600">{ship.origin} → {ship.destination}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[ship.status]}`}>
                      {ship.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden mx-auto">
                      <div className="h-full bg-blue-500" style={{ width: `${ship.progress}%` }}></div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{ship.eta}</td>
                  <td className="px-4 py-2 text-right">
                    <span className={`font-bold ${ship.riskScore > 70 ? 'text-red-600' : ship.riskScore > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {ship.riskScore}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ============ DEMAND PLANNING COMPONENTS ============
export function DemandPlanningDashboard() {
  const [forecast, setForecast] = useState([])
  const [seasonal, setSeasonal] = useState([])
  const [accuracy, setAccuracy] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [forecastData, seasonalData, accuracyData] = await Promise.all([
        getDemandForecast(12),
        getSeasonalFactors(),
        getDemandAccuracy(),
      ])
      setForecast(forecastData)
      setSeasonal(seasonalData)
      setAccuracy(accuracyData)
    } catch (error) {
      console.error('Failed to load demand data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {accuracy && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card text-center">
            <p className="text-sm text-slate-600">MAE</p>
            <p className="text-3xl font-bold text-slate-900">{accuracy.mae}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">RMSE</p>
            <p className="text-3xl font-bold text-slate-900">{accuracy.rmse}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">MAPE</p>
            <p className="text-3xl font-bold text-slate-900">{accuracy.mape}%</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Accuracy</p>
            <p className="text-3xl font-bold text-green-600">{accuracy.accuracy}%</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-600">Trend</p>
            <p className="text-lg font-bold text-blue-600">{accuracy.trend}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-4">
            <h3 className="font-bold text-slate-900 mb-4">12-Month Forecast</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} interval={1} />
                <YAxis />
                <Tooltip formatter={(v) => Math.round(v)} />
                <Area type="monotone" dataKey="lower" fill="#dbeafe" stroke="none" />
                <Area type="monotone" dataKey="upper" fill="#fee2e2" stroke="none" />
                <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} />
                {forecast.some(d => d.actual) && <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} />}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-4">
            <h3 className="font-bold text-slate-900 mb-4">Seasonal Factors</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={seasonal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => v.toFixed(2)} />
                <Bar dataKey="factor" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
