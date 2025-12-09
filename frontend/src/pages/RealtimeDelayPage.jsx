/**
 * Real-Time Delay Updates Dashboard - Phase 3 Feature 3
 */

import React, { useState, useEffect } from 'react'
import { MapPin, AlertCircle, TrendingUp, RefreshCw, CheckCircle } from 'lucide-react'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

export default function RealtimeDelayPage() {
  const { dataImported, getPrediction } = useMLPredictions()
  const [mlDelayPrediction, setMlDelayPrediction] = useState(null)
  const [status, setStatus] = useState(null)
  const [shipments, setShipments] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedShipment, setSelectedShipment] = useState(null)

  const { data: importedData, isLoaded } = useImportedData()

  // Get ML prediction when data is imported
  useEffect(() => {
    if (dataImported) {
      const delayPred = getPrediction('delay_prediction')
      setMlDelayPrediction(delayPred)
    }
  }, [dataImported, getPrediction])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    // Mock data
    const mockStatus = {
      status: 'tracking',
      total_shipments: 45,
      on_time: 38,
      delayed: 5,
      delivered: 2,
      timestamp: new Date().toISOString()
    }

    const mockShipments = [
      { id: 'SHIP-001', destination: 'Kolkata', status: 'in_transit', progress: 65, estimated_delay: 0, current_location: 'Dhanbad', lat: 23.8103, lon: 86.4304 },
      { id: 'SHIP-002', destination: 'Patna', status: 'in_transit', progress: 45, estimated_delay: 2.5, current_location: 'Gaya', lat: 24.7955, lon: 84.9994 },
      { id: 'SHIP-003', destination: 'Ranchi', status: 'delayed', progress: 30, estimated_delay: 4.2, current_location: 'Hazaribagh', lat: 24.1467, lon: 85.3533 },
      { id: 'SHIP-004', destination: 'Durgapur', status: 'on_time', progress: 85, estimated_delay: -0.5, current_location: 'Asansol', lat: 23.6839, lon: 86.9641 },
    ]

    const mockAlerts = [
      { id: 'ALERT-001', shipment_id: 'SHIP-003', type: 'delay_warning', severity: 'high', message: 'Shipment delayed by 4.2 hours', created_at: new Date().toISOString() },
      { id: 'ALERT-002', shipment_id: 'SHIP-002', type: 'delay_warning', severity: 'medium', message: 'Potential delay detected', created_at: new Date().toISOString() },
    ]

    try {
      const [statusRes, shipmentsRes, alertsRes] = await Promise.all([
        fetch('/api/tracking/status').catch(() => null),
        fetch('/api/tracking/shipments').catch(() => null),
        fetch('/api/tracking/alerts').catch(() => null),
      ])

      try {
        const statusData = statusRes ? await statusRes.json() : mockStatus
        const shipmentsData = shipmentsRes ? await shipmentsRes.json() : { shipments: mockShipments }
        const alertsData = alertsRes ? await alertsRes.json() : { alerts: mockAlerts }

        setStatus(statusData || mockStatus)
        setShipments((shipmentsData?.shipments) || mockShipments)
        setAlerts((alertsData?.alerts) || mockAlerts)
      } catch {
        setStatus(mockStatus)
        setShipments(mockShipments)
        setAlerts(mockAlerts)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setStatus(mockStatus)
      setShipments(mockShipments)
      setAlerts(mockAlerts)
      setLoading(false)
    }
  }

  const hasImportedRoutes =
    isLoaded && importedData && Array.isArray(importedData.routes) && importedData.routes.length > 0

  const hasImportedOrders =
    isLoaded && importedData && Array.isArray(importedData.orders) && importedData.orders.length > 0

  let datasetShipments = 0
  let datasetTonnage = 0

  if (hasImportedRoutes) {
    importedData.routes.forEach((r) => {
      const qty = Number(r.tonnage ?? r.quantity ?? r.totalQuantity ?? 0)
      if (Number.isFinite(qty) && qty > 0) {
        datasetTonnage += qty
      }
    })
    datasetShipments = importedData.routes.length
  } else if (hasImportedOrders) {
    importedData.orders.forEach((o) => {
      const qty = Number(o.totalQuantity ?? o.quantity ?? 0)
      if (Number.isFinite(qty) && qty > 0) {
        datasetTonnage += qty
      }
    })
    datasetShipments = importedData.orders.length
  }

  const mlDelaySource = Array.isArray(mlDelayPrediction) ? mlDelayPrediction[0] : mlDelayPrediction

  const mlAvgDelayMinutes =
    mlDelaySource && typeof mlDelaySource === 'object'
      ? (() => {
          const candidates = [
            mlDelaySource.avg_delay_minutes,
            mlDelaySource.average_delay,
            mlDelaySource.expected_delay,
            mlDelaySource.mean_delay,
            mlDelaySource.delay_minutes,
          ]
          for (const c of candidates) {
            const n = Number(c)
            if (Number.isFinite(n)) return n
          }
          return null
        })()
      : null

  const mlOnTimeProbability =
    mlDelaySource && typeof mlDelaySource === 'object'
      ? (() => {
          const raw =
            typeof mlDelaySource.on_time_probability === 'number'
              ? mlDelaySource.on_time_probability
              : typeof mlDelaySource.on_time_prob === 'number'
                ? mlDelaySource.on_time_prob
                : typeof mlDelaySource.on_time_confidence === 'number'
                  ? mlDelaySource.on_time_confidence
                  : typeof mlDelaySource.confidence === 'number'
                    ? mlDelaySource.confidence
                    : null
          if (raw == null) return null
          return raw <= 1 ? raw * 100 : raw
        })()
      : null

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_time':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
      case 'delayed':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
      case 'in_transit':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
      case 'delivered':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <MapPin className="mx-auto text-blue-600 mb-4 animate-spin" size={48} />
          <p className="text-slate-600 dark:text-slate-400">Loading tracking data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Real-Time Shipment Tracking
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Live tracking and delay predictions
          </p>
        </div>
        <button onClick={fetchData} className="btn btn-secondary flex items-center gap-2">
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <InlineDataImport templateId="delay" />

      {(datasetShipments > 0 || mlAvgDelayMinutes !== null || mlOnTimeProbability !== null) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {datasetShipments > 0 && (
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">Dataset Shipments</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-2">
                {datasetShipments.toLocaleString()}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {datasetTonnage > 0
                  ? `${datasetTonnage.toLocaleString()}T total tonnage`
                  : 'No tonnage field detected'}
              </p>
            </div>
          )}

          {mlAvgDelayMinutes !== null && (
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">ML Avg Delay</p>
              <p className="text-2xl font-bold text-amber-400 mt-2">
                {mlAvgDelayMinutes.toFixed(1)} min
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">From delay_prediction model</p>
            </div>
          )}

          {mlOnTimeProbability !== null && (
            <div className="card">
              <p className="text-sm text-slate-600 dark:text-slate-400">On-Time Probability</p>
              <p className="text-2xl font-bold text-green-400 mt-2">
                {mlOnTimeProbability.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Higher is better, based on ML outputs</p>
            </div>
          )}
        </div>
      )}

      {/* Status Cards */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Shipments</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{status.total_shipments}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">On Time</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{status.on_time}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Delayed</p>
            <p className="text-2xl font-bold text-red-600 mt-2">{status.delayed}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Delivered</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-2">{status.delivered}</p>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="card border-l-4 border-red-500">
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-red-600" />
            Active Alerts ({alerts.length})
          </h3>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
                <p className="text-sm font-semibold text-red-700 dark:text-red-200">{alert.message}</p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                  Shipment: {alert.shipment_id}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shipments */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
          Active Shipments
        </h3>
        <div className="space-y-3">
          {shipments.map((shipment) => (
            <div
              key={shipment.id}
              className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedShipment(shipment)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-slate-50">
                    {shipment.id} → {shipment.destination}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Current Location: {shipment.current_location}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(shipment.status)}`}>
                  {shipment.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-slate-600 dark:text-slate-400">Progress</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">{shipment.progress}%</p>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${shipment.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <p className="text-slate-600 dark:text-slate-400">
                  Estimated Delay: {shipment.estimated_delay > 0 ? '+' : ''}{shipment.estimated_delay.toFixed(1)}h
                </p>
                {shipment.estimated_delay <= 0 && (
                  <CheckCircle size={16} className="text-green-600" />
                )}
                {shipment.estimated_delay > 2 && (
                  <AlertCircle size={16} className="text-red-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipment Details Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                Shipment Details: {selectedShipment.id}
              </h3>
              <button
                onClick={() => setSelectedShipment(null)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Destination</p>
                  <p className="text-slate-900 dark:text-slate-50 mt-1">{selectedShipment.destination}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Status</p>
                  <p className="text-slate-900 dark:text-slate-50 mt-1">{selectedShipment.status}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Current Location</p>
                  <p className="text-slate-900 dark:text-slate-50 mt-1">{selectedShipment.current_location}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Progress</p>
                  <p className="text-slate-900 dark:text-slate-50 mt-1">{selectedShipment.progress}%</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Estimated Delay</p>
                  <p className="text-slate-900 dark:text-slate-50 mt-1">{selectedShipment.estimated_delay.toFixed(1)} hours</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Coordinates</p>
                  <p className="text-slate-900 dark:text-slate-50 mt-1">{selectedShipment.lat.toFixed(4)}, {selectedShipment.lon.toFixed(4)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
