import React, { useState, useEffect } from 'react'
import { Box, Map, Activity } from 'lucide-react'
import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000'

export default function Visualization3DPage() {
  const [warehouseData, setWarehouseData] = useState(null)
  const [networkData, setNetworkData] = useState(null)
  const [heatmapData, setHeatmapData] = useState(null)
  const [trackingData, setTrackingData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedView, setSelectedView] = useState('warehouse')

  useEffect(() => {
    fetchVisualizationData()
  }, [selectedView])

  const fetchVisualizationData = async () => {
    setLoading(true)
    try {
      if (selectedView === 'warehouse') {
        const response = await axios.get(`${API_BASE}/visualization/warehouse/3d/WH_001`)
        setWarehouseData(response.data.data)
      } else if (selectedView === 'network') {
        const response = await axios.get(`${API_BASE}/visualization/network/3d`)
        setNetworkData(response.data.data)
      } else if (selectedView === 'heatmap') {
        const response = await axios.get(`${API_BASE}/visualization/heatmap/demand`)
        setHeatmapData(response.data.data)
      } else if (selectedView === 'tracking') {
        const response = await axios.get(`${API_BASE}/visualization/shipment-tracking/3d`)
        setTrackingData(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching visualization data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cube className="w-8 h-8 text-cyan-600" />
          <h1 className="text-3xl font-bold text-gray-900">3D Supply Chain Visualization</h1>
        </div>
        <p className="text-gray-600">Interactive Network & Warehouse Views</p>
      </div>

      {/* View Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4 flex-wrap">
          {[
            { id: 'warehouse', label: 'Warehouse 3D', icon: '📦' },
            { id: 'network', label: 'Network Map', icon: '🌐' },
            { id: 'heatmap', label: 'Demand Heatmap', icon: '🔥' },
            { id: 'tracking', label: 'Shipment Tracking', icon: '📍' }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedView === view.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {view.icon} {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Warehouse 3D View */}
      {selectedView === 'warehouse' && warehouseData && (
        <div className="space-y-6">
          {/* Warehouse Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{warehouseData.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Dimensions</p>
                <p className="text-lg font-bold text-gray-900">
                  {warehouseData.dimensions.length}m × {warehouseData.dimensions.width}m × {warehouseData.dimensions.height}m
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Current Utilization</p>
                <p className="text-lg font-bold text-gray-900">{warehouseData.utilization.current}%</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Target Utilization</p>
                <p className="text-lg font-bold text-gray-900">{warehouseData.utilization.target}%</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">Efficiency</p>
                <p className="text-lg font-bold text-gray-900">{warehouseData.utilization.efficiency}%</p>
              </div>
            </div>
          </div>

          {/* 3D Visualization Placeholder */}
          <div className="bg-gray-900 rounded-lg shadow p-12 text-center">
            <Cube className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">3D Warehouse Visualization</p>
            <p className="text-gray-500 text-sm mt-2">Interactive 3D view powered by Three.js</p>
            <p className="text-gray-600 text-sm mt-4">
              {warehouseData.locations.length} racks | {warehouseData.shipments.length} active shipments
            </p>
          </div>

          {/* Locations Grid */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Warehouse Locations</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {warehouseData.locations.slice(0, 8).map(loc => (
                <div key={loc.id} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900">{loc.name}</p>
                  <p className="text-sm text-gray-600 mt-2">Stock: {loc.current_stock}/{loc.capacity}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(loc.current_stock / loc.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Network 3D View */}
      {selectedView === 'network' && networkData && (
        <div className="space-y-6">
          {/* Network Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Total Nodes</p>
              <p className="text-3xl font-bold text-gray-900">{networkData.network_metrics.total_nodes}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Total Edges</p>
              <p className="text-3xl font-bold text-gray-900">{networkData.network_metrics.total_edges}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Total Distance</p>
              <p className="text-3xl font-bold text-gray-900">{networkData.network_metrics.total_distance} km</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Network Efficiency</p>
              <p className="text-3xl font-bold text-gray-900">{networkData.network_metrics.network_efficiency.toFixed(1)}%</p>
            </div>
          </div>

          {/* Network Visualization */}
          <div className="bg-gray-900 rounded-lg shadow p-12 text-center">
            <Map className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Supply Chain Network Map</p>
            <p className="text-gray-500 text-sm mt-2">Interactive network graph with real-time shipment tracking</p>
          </div>

          {/* Nodes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Network Nodes</h3>
            <div className="space-y-2">
              {networkData.nodes.map(node => (
                <div key={node.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{node.name}</p>
                    <p className="text-sm text-gray-600">{node.type.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Stock: {node.current_stock}/{node.capacity}</p>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(node.current_stock / node.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Demand Heatmap */}
      {selectedView === 'heatmap' && heatmapData && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Demand Intensity by Destination</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {heatmapData.destinations.map((dest, idx) => (
                <div key={idx} className="rounded-lg p-4" style={{
                  backgroundColor: `hsl(${120 - (dest.demand_intensity / 100) * 120}, 100%, 85%)`
                }}>
                  <p className="font-semibold text-gray-900">{dest.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{dest.demand_intensity}</p>
                  <p className="text-xs text-gray-600 mt-2">Accuracy: {dest.forecast_accuracy}%</p>
                  <p className="text-xs text-gray-600">Trend: {dest.trend}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap Visualization */}
          <div className="bg-gray-900 rounded-lg shadow p-12 text-center">
            <Activity className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Demand Heatmap Visualization</p>
            <p className="text-gray-500 text-sm mt-2">Geographic distribution of demand intensity</p>
          </div>
        </div>
      )}

      {/* Shipment Tracking */}
      {selectedView === 'tracking' && trackingData && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Active Shipments</h2>
            <div className="space-y-2">
              {trackingData.shipments.map(ship => (
                <div key={ship.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">{ship.id}</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      ship.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      ship.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {ship.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{ship.origin} → {ship.destination}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${ship.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{ship.progress}% Complete</span>
                    <span>ETA: {ship.eta_hours}h</span>
                  </div>
                  {ship.anomaly && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                      ⚠️ Anomaly detected - Possible delay
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Map */}
          <div className="bg-gray-900 rounded-lg shadow p-12 text-center">
            <Map className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Real-Time Shipment Tracking Map</p>
            <p className="text-gray-500 text-sm mt-2">Live GPS tracking with route visualization</p>
          </div>
        </div>
      )}

      {/* 3D Technology Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">3D Visualization Technology</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">Three.js</h3>
            <p className="text-sm text-gray-600">WebGL-based 3D graphics library for interactive visualizations</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">Cesium.js</h3>
            <p className="text-sm text-gray-600">Geospatial 3D mapping for global supply chain networks</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">D3.js</h3>
            <p className="text-sm text-gray-600">Data-driven documents for complex network visualizations</p>
          </div>
        </div>
      </div>
    </div>
  )
}
