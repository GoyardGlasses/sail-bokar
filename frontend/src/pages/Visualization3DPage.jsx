import React, { useState, useEffect } from 'react'
import { Box, Map, Activity, Zap, Brain, AlertCircle, MapPin } from 'lucide-react'
import axios from 'axios'
import { Map3D } from '../components/Map3D'
import { Warehouse3D } from '../components/Warehouse3D'
import { Network3D } from '../components/Network3D'
import { Heatmap3D } from '../components/Heatmap3D'
import { getRouteData, getAssistantSuggestion, getMockRouteData } from '../api/mapApi'

const API_BASE = 'http://127.0.0.1:8000'

export default function Visualization3DPage() {
  const [warehouseData, setWarehouseData] = useState(null)
  const [networkData, setNetworkData] = useState(null)
  const [heatmapData, setHeatmapData] = useState(null)
  const [trackingData, setTrackingData] = useState(null)
  const [routeData, setRouteData] = useState(null)
  const [assistantSuggestion, setAssistantSuggestion] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedView, setSelectedView] = useState('warehouse')

  useEffect(() => {
    fetchVisualizationData()
  }, [selectedView])

  const fetchVisualizationData = async () => {
    setLoading(true)
    try {
      // Use mock data for all views to avoid API errors
      if (selectedView === 'warehouse') {
        setWarehouseData({ status: 'ok', capacity: 85 })
      } else if (selectedView === 'network') {
        setNetworkData({ status: 'ok', nodes: 12 })
      } else if (selectedView === 'heatmap') {
        setHeatmapData({ status: 'ok', regions: 8 })
      } else if (selectedView === 'tracking') {
        setTrackingData({ status: 'ok', shipments: 45 })
      } else if (selectedView === 'routes') {
        const data = await getRouteData()
        setRouteData(data)
      }
    } catch (error) {
      console.error('Error fetching visualization data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSelect = async (location) => {
    setSelectedLocation(location)
    try {
      const suggestion = await getAssistantSuggestion(location.id)
      setAssistantSuggestion(suggestion)
    } catch (error) {
      console.error('Error fetching suggestion:', error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Box className="w-8 h-8 text-cyan-600" />
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
            { id: 'tracking', label: 'Shipment Tracking', icon: '📍' },
            { id: 'routes', label: 'Route Visualization', icon: '🗺️' }
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Capacity</p>
              <p className="text-lg font-bold text-gray-900">85%</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Status</p>
              <p className="text-lg font-bold text-gray-900">Operational</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Shipments</p>
              <p className="text-lg font-bold text-gray-900">45</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-gray-600 text-sm">Efficiency</p>
              <p className="text-lg font-bold text-gray-900">92%</p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
            <Warehouse3D />
          </div>
        </div>
      )}

      {/* Network 3D View */}
      {selectedView === 'network' && networkData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Total Nodes</p>
              <p className="text-3xl font-bold text-gray-900">7</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Total Edges</p>
              <p className="text-3xl font-bold text-gray-900">8</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Total Distance</p>
              <p className="text-3xl font-bold text-gray-900">2,450 km</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Network Efficiency</p>
              <p className="text-3xl font-bold text-gray-900">94.5%</p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
            <Network3D />
          </div>
        </div>
      )}

      {/* Demand Heatmap */}
      {selectedView === 'heatmap' && heatmapData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['Kolkata', 'Patna', 'Ranchi', 'Durgapur', 'Haldia'].map((city, idx) => (
              <div key={idx} className="rounded-lg p-4 bg-gradient-to-br from-red-100 to-orange-100">
                <p className="font-semibold text-gray-900">{city}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{75 + idx * 3}</p>
                <p className="text-xs text-gray-600 mt-2">Accuracy: 92%</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
            <Heatmap3D />
          </div>
        </div>
      )}

      {/* Shipment Tracking */}
      {selectedView === 'tracking' && trackingData && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Active Shipments (45)</h2>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">SHP-{String(i).padStart(5, '0')}</p>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      IN TRANSIT
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Bokaro → Kolkata</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${60 + i * 5}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{60 + i * 5}% Complete</span>
                    <span>ETA: {12 - i}h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg shadow p-12 text-center">
            <Map className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Real-Time Shipment Tracking Map</p>
            <p className="text-gray-500 text-sm mt-2">Live GPS tracking</p>
          </div>
        </div>
      )}

      {/* Route Visualization */}
      {selectedView === 'routes' && routeData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen">
            {/* Map Container */}
            <div className="lg:col-span-2 rounded-lg shadow overflow-hidden">
              <Map3D
                locations={routeData.locations}
                routes={routeData.routes}
                onLocationSelect={handleLocationSelect}
                enable3D={true}
              />
            </div>

            {/* Decision Assistant Box */}
            <div className="bg-white rounded-lg shadow p-6 overflow-y-auto">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Route Assistant</h3>
              </div>

              {selectedLocation ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">Selected Location</p>
                    <p className="text-lg font-bold text-blue-600 mt-1">{selectedLocation.name || selectedLocation.id}</p>
                    <p className="text-xs text-blue-700 mt-2">Type: {selectedLocation.type}</p>
                    <p className="text-xs text-blue-700">Coordinates: {selectedLocation.lat.toFixed(2)}, {selectedLocation.lon.toFixed(2)}</p>
                  </div>

                  {assistantSuggestion && (
                    <>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="text-sm font-medium text-green-900 mb-2">AI Recommendation</p>
                        <p className="text-sm text-green-800">{assistantSuggestion.suggestion}</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">Recommendations:</p>
                        {assistantSuggestion.recommendations.map((rec, idx) => (
                          <div key={idx} className="flex gap-2 p-2 bg-gray-50 rounded">
                            <span className="text-green-600 font-bold">✓</span>
                            <span className="text-sm text-gray-700">{rec}</span>
                          </div>
                        ))}
                      </div>

                      <div className={`p-3 rounded-lg ${
                        assistantSuggestion.riskLevel === 'low' ? 'bg-green-100 border border-green-300' :
                        assistantSuggestion.riskLevel === 'medium' ? 'bg-yellow-100 border border-yellow-300' :
                        'bg-red-100 border border-red-300'
                      }`}>
                        <p className="text-xs font-medium text-gray-700">Risk Level</p>
                        <p className={`text-sm font-bold mt-1 ${
                          assistantSuggestion.riskLevel === 'low' ? 'text-green-700' :
                          assistantSuggestion.riskLevel === 'medium' ? 'text-yellow-700' :
                          'text-red-700'
                        }`}>
                          {assistantSuggestion.riskLevel.toUpperCase()}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click on a location on the map to get AI-powered route recommendations</p>
                </div>
              )}

              {/* Route Statistics */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <p className="text-sm font-medium text-gray-900">Route Statistics</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 rounded p-2">
                    <p className="text-xs text-gray-600">Total Locations</p>
                    <p className="text-lg font-bold text-gray-900">{routeData.locations.length}</p>
                  </div>
                  <div className="bg-slate-50 rounded p-2">
                    <p className="text-xs text-gray-600">Active Routes</p>
                    <p className="text-lg font-bold text-gray-900">{routeData.routes.length}</p>
                  </div>
                  <div className="bg-green-50 rounded p-2">
                    <p className="text-xs text-gray-600">On-Time</p>
                    <p className="text-lg font-bold text-green-600">{routeData.routes.filter(r => r.status === 'on-time').length}</p>
                  </div>
                  <div className="bg-yellow-50 rounded p-2">
                    <p className="text-xs text-gray-600">Delayed</p>
                    <p className="text-lg font-bold text-yellow-600">{routeData.routes.filter(r => r.status === 'delayed').length}</p>
                  </div>
                </div>
              </div>
            </div>
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
