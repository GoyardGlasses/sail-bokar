/**
 * Live Data Streaming Dashboard - Phase 2 Feature 1
 */

import React, { useState, useEffect, useMemo } from 'react'
import { Activity, Zap, TrendingUp, AlertCircle } from 'lucide-react'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

export default function LiveDataPage() {
  const [status, setStatus] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [filter, setFilter] = useState('all')

  const { data: importedData } = useImportedData()

  const datasetSummary = useMemo(() => {
    if (!importedData) return null

    const orders = Array.isArray(importedData.orders) ? importedData.orders.length : 0
    const rakes = Array.isArray(importedData.rakes) ? importedData.rakes.length : 0
    const routes = Array.isArray(importedData.routes) ? importedData.routes.length : 0

    if (!orders && !rakes && !routes) return null

    return { orders, rakes, routes }
  }, [importedData])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, []) // removed status and events from the dependency array

  const fetchData = async () => {
    try {
      const mockStatus = {
        status: 'running',
        total_events: 156,
        streams_active: 6,
        last_event: new Date().toISOString(),
        events_by_type: { shipment: 45, vehicle: 38, order: 32, alert: 25, route: 12, warehouse: 4 }
      }

      const mockEvents = [
        { id: 'EVENT-001', source_type: 'shipment', event_type: 'status_update', data: { shipment_id: 'SHIP-001', status: 'in_transit' }, timestamp: new Date().toISOString(), processed: true },
        { id: 'EVENT-002', source_type: 'vehicle', event_type: 'telemetry', data: { vehicle_id: 'VEH-001', speed: 65.5, fuel: 75 }, timestamp: new Date().toISOString(), processed: true },
        { id: 'EVENT-003', source_type: 'order', event_type: 'created', data: { order_id: 'ORD-001', tonnage: 500 }, timestamp: new Date().toISOString(), processed: true },
      ]

      try {
        const [statusRes, eventsRes] = await Promise.all([
          fetch('/api/live-data/status').catch(() => null),
          fetch('/api/live-data/events').catch(() => null),
        ])

        const statusData = statusRes ? await statusRes.json() : mockStatus
        const eventsData = eventsRes ? await eventsRes.json() : { events: mockEvents }

        setStatus(statusData || mockStatus)
        setEvents((prevEvents) => {
          const apiEvents = (eventsData?.events) || mockEvents
          if (!prevEvents || prevEvents.length === 0) return apiEvents
          const existingIds = new Set(apiEvents.map((e) => e.id))
          const extra = prevEvents.filter((e) => e && !existingIds.has(e.id))
          return [...apiEvents, ...extra]
        })
      } catch {
        setStatus(mockStatus)
        setEvents((prevEvents) => {
          if (!prevEvents || prevEvents.length === 0) return mockEvents
          const existingIds = new Set(mockEvents.map((e) => e.id))
          const extra = prevEvents.filter((e) => e && !existingIds.has(e.id))
          return [...mockEvents, ...extra]
        })
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const simulateData = async () => {
    try {
      const countInput = window.prompt('How many events to simulate?', '10')
      if (!countInput) {
        return
      }

      const parsed = parseInt(countInput, 10)
      if (!Number.isFinite(parsed) || parsed <= 0) {
        alert('Please enter a valid positive number of events')
        return
      }

      const typeInput = window.prompt(
        'Event source type (shipment, vehicle, order, alert, route, warehouse)',
        'shipment'
      )
      const normalizedType = (typeInput || '').toLowerCase().trim()
      const allowedTypes = ['shipment', 'vehicle', 'order', 'alert', 'route', 'warehouse']
      const sourceType = allowedTypes.includes(normalizedType) ? normalizedType : 'shipment'

      const requestedCount = parsed

      setSimulating(true)

      let handled = false

      // Try real API first
      try {
        const res = await fetch('/api/live-data/simulate', { method: 'POST' })
        if (res && res.ok) {
          let data = null
          try {
            data = await res.json()
          } catch (e) {
            // Ignore JSON parse errors and fall back
          }

          if (data && data.status === 'success') {
            const apiCount =
              data.events_ingested ??
              (Array.isArray(data.events) ? data.events.length : 0) ??
              0
            const totalToReport = apiCount || requestedCount
            alert(`Simulated ${totalToReport} events!`)
            // If backend returns events array, merge them into current state
            if (Array.isArray(data.events) && data.events.length > 0) {
              const now = new Date().toISOString()
              setEvents((prev) => {
                const base = prev || []
                const existingIds = new Set(base.map((e) => e.id))
                const incoming = data.events
                  .filter((e) => e && !existingIds.has(e.id))
                  .map((e, idx) => ({
                    id: e.id || `API-${Date.now()}-${idx}`,
                    source_type: e.source_type || sourceType,
                    event_type: e.event_type || 'simulated',
                    data: e.data || {},
                    timestamp: e.timestamp || now,
                    processed: e.processed ?? true,
                  }))
                return [...base, ...incoming]
              })
              setStatus((prev) => {
                const nowLocal = new Date().toISOString()
                const base = prev || {
                  status: 'running',
                  total_events: 0,
                  streams_active: 1,
                  last_event: nowLocal,
                  events_by_type: {},
                }
                const events_by_type = { ...(base.events_by_type || {}) }
                data.events.forEach((e) => {
                  const t = e.source_type || sourceType
                  events_by_type[t] = (events_by_type[t] || 0) + 1
                })
                return {
                  ...base,
                  total_events: (base.total_events || 0) + data.events.length,
                  last_event: nowLocal,
                  events_by_type,
                }
              })
            } else {
              // No events array from API, just refresh
              await fetchData()
            }
            handled = true
          }
        }
      } catch (err) {
        // Network / backend error, fall through to mock
      }

      // Mock success fallback if API didn't handle it
      if (!handled) {
        const mockCount = requestedCount
        const now = new Date().toISOString()

        const pickRandom = (arr) => {
          if (!arr || !Array.isArray(arr) || arr.length === 0) return null
          return arr[Math.floor(Math.random() * arr.length)]
        }

        const orders = importedData?.orders
        const routes = importedData?.routes
        const stockyards = importedData?.stockyards
        const rakes = importedData?.rakes
        const constraints = importedData?.constraints
        const materials = importedData?.materials

        const buildDataForType = (idx) => {
          const order = pickRandom(orders)
          const route = pickRandom(routes)
          const stockyard = pickRandom(stockyards)
          const rake = pickRandom(rakes)
          const constraint = pickRandom(constraints)
          const material = pickRandom(materials)

          switch (sourceType) {
            case 'vehicle':
              return {
                vehicle_id: rake?.id || `SIM-VEH-${idx + 1}`,
                rake_name: rake?.name,
                route_id: route?.id,
                origin: route?.origin,
                destination: route?.destination,
                speed: 60 + idx,
                fuel: 80 - idx,
              }
            case 'order':
              return {
                order_id: order?.id || `SIM-ORD-${idx + 1}`,
                product: order?.product,
                destination: order?.destination,
                tonnage: order?.quantity ?? (100 + idx * 10),
                customer: order?.customer,
              }
            case 'alert':
              return {
                alert_id: constraint?.id || material?.id || `SIM-ALERT-${idx + 1}`,
                constraint_name: constraint?.name,
                material: material?.name,
                severity: constraint?.severity || 'warning',
                message:
                  constraint?.rule ||
                  'Simulated constraint or inventory alert from imported data',
              }
            case 'route':
              return {
                route_id: route?.id || `SIM-ROUTE-${idx + 1}`,
                origin: route?.origin,
                destination: route?.destination,
                distance_km: route?.distance ?? (200 + idx * 5),
                railCost: route?.railCost,
                roadCost: route?.roadCost,
              }
            case 'warehouse':
              return {
                stockyard_id: stockyard?.id || `SIM-WH-${idx + 1}`,
                name: stockyard?.name,
                location: stockyard?.location,
                currentStock: stockyard?.currentStock,
              }
            case 'shipment':
            default:
              return {
                shipment_id: order?.id
                  ? `SHIP-${order.id}`
                  : `SIM-SHIP-${idx + 1}`,
                product: order?.product || material?.name,
                quantity: order?.quantity ?? material?.quantity,
                source_stockyard: stockyard?.name,
                destination: order?.destination,
                status: 'simulated',
              }
          }
        }

        const simulated = Array.from({ length: mockCount }, (_, i) => ({
          id: `SIM-${Date.now()}-${i}`,
          source_type: sourceType,
          event_type: 'simulated',
          data: buildDataForType(i),
          timestamp: now,
          processed: true,
        }))

        setEvents((prev) => ([...(prev || []), ...simulated]))
        setStatus((prev) => {
          const base = prev || {
            status: 'running',
            total_events: 0,
            streams_active: 1,
            last_event: now,
            events_by_type: { [sourceType]: 0 },
          }
          const events_by_type = {
            ...(base.events_by_type || {}),
            [sourceType]: (base.events_by_type?.[sourceType] || 0) + mockCount,
          }
          return {
            ...base,
            total_events: (base.total_events || 0) + mockCount,
            last_event: now,
            events_by_type,
          }
        })

        alert(`Simulated ${mockCount} ${sourceType} events!`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error simulating data')
    } finally {
      setSimulating(false)
    }
  }

  const getEventColor = (sourceType) => {
    const colors = {
      'shipment': 'bg-blue-100 text-blue-700',
      'vehicle': 'bg-green-100 text-green-700',
      'order': 'bg-purple-100 text-purple-700',
      'alert': 'bg-red-100 text-red-700',
      'route': 'bg-yellow-100 text-yellow-700',
      'warehouse': 'bg-indigo-100 text-indigo-700',
    }
    return colors[sourceType] || 'bg-slate-100 text-slate-700'
  }

  const getEventIcon = (sourceType) => {
    switch (sourceType) {
      case 'shipment':
        return <TrendingUp size={18} />
      case 'vehicle':
        return <Activity size={18} />
      case 'alert':
        return <AlertCircle size={18} />
      default:
        return <Zap size={18} />
    }
  }

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.source_type === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Activity className="mx-auto text-blue-600 mb-4 animate-spin" size={48} />
          <p className="text-slate-600 dark:text-slate-400">Loading live data...</p>
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
            Live Data Streaming
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Real-time data ingestion and event streaming
          </p>
        </div>
        <button
          onClick={simulateData}
          disabled={simulating}
          className="btn btn-primary flex items-center gap-2"
        >
          <Zap size={18} />
          {simulating ? 'Simulating...' : 'Simulate Events'}
        </button>
      </div>

      <InlineDataImport templateId="operations" />

      {datasetSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Orders in dataset</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
              {datasetSummary.orders.toLocaleString()}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Rakes / Vehicles</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
              {datasetSummary.rakes.toLocaleString()}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Routes</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
              {datasetSummary.routes.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Status Cards */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Events</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {status.total_events}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Active Streams</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {status.streams_active}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Last Event</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-50 mt-2">
              {status.last_event ? new Date(status.last_event).toLocaleTimeString() : 'N/A'}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Event Types</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              {Object.keys(status.events_by_type || {}).length}
            </p>
          </div>
        </div>
      )}

      {/* Event Type Distribution */}
      {status && status.events_by_type && (
        <div className="card">
          <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
            Events by Type
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {Object.entries(status.events_by_type).map(([type, count]) => (
              <div key={type} className="bg-slate-100 dark:bg-slate-700 rounded p-3 text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  {type.replace(/_/g, ' ')}
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                  {count}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {['all', 'shipment', 'vehicle', 'order', 'alert'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
              filter === f
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="card text-center py-8">
            <Activity className="mx-auto text-slate-400 mb-3" size={32} />
            <p className="text-slate-600 dark:text-slate-400">No events in this category</p>
          </div>
        ) : (
          filteredEvents.slice().reverse().map((event) => (
            <div
              key={event.id}
              className="card cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setSelectedEvent(event)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded ${getEventColor(event.source_type)}`}>
                  {getEventIcon(event.source_type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-50">
                        {event.source_type.toUpperCase()} - {event.event_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getEventColor(event.source_type)}`}>
                      {event.source_type}
                    </span>
                  </div>

                  {/* Event Data Preview */}
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    {Object.entries(event.data).slice(0, 2).map(([key, value]) => (
                      <p key={key}>
                        <span className="font-semibold">{key}:</span> {String(value).substring(0, 50)}
                      </p>
                    ))}
                    {Object.keys(event.data).length > 2 && (
                      <p className="text-xs mt-1">+{Object.keys(event.data).length - 2} more fields</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  Event: {selectedEvent.id}
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Source Type</p>
                    <p className="text-slate-900 dark:text-slate-50 mt-1">{selectedEvent.source_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Event Type</p>
                    <p className="text-slate-900 dark:text-slate-50 mt-1">{selectedEvent.event_type}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Timestamp</p>
                    <p className="text-slate-900 dark:text-slate-50 mt-1">
                      {new Date(selectedEvent.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Event Data</p>
                  <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded text-xs overflow-auto max-h-48">
                    {JSON.stringify(selectedEvent.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
