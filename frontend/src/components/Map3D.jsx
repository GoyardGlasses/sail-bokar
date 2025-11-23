import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Truck, AlertCircle, CheckCircle } from 'lucide-react'

export const Map3D = ({
  locations = [],
  routes = [],
  onLocationSelect = null,
  enable3D = true,
}) => {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [webglSupported, setWebglSupported] = useState(true)
  const [showMarkers, setShowMarkers] = useState(true)
  const [show3D, setShow3D] = useState(enable3D)
  const [timeSlider, setTimeSlider] = useState(0)
  const markersRef = useRef([])
  const polyinesRef = useRef([])

  // Check WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      setWebglSupported(!!gl)
    } catch (e) {
      setWebglSupported(false)
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

    // Create map
    map.current = L.map(mapContainer.current).setView([23.8, 86.5], 8)

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current)

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [])

  // Add markers
  useEffect(() => {
    if (!map.current || !showMarkers) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    locations.forEach(location => {
      const icon = getLocationIcon(location.type)
      const marker = L.marker([location.lat, location.lon], { icon })
        .bindPopup(`<strong>${location.name || location.id}</strong><br/>Type: ${location.type}`)
        .addTo(map.current)

      marker.on('click', () => {
        onLocationSelect?.(location)
      })

      markersRef.current.push(marker)
    })
  }, [locations, showMarkers, onLocationSelect])

  // Add routes
  useEffect(() => {
    if (!map.current) return

    // Clear existing polylines
    polyinesRef.current.forEach(line => line.remove())
    polyinesRef.current = []

    routes.forEach((route, idx) => {
      const fromLocation = locations.find(l => l.id === route.from)
      const toLocation = locations.find(l => l.id === route.to)

      if (fromLocation && toLocation) {
        const color = getRouteColor(route.status)
        const weight = show3D ? 3 : 2
        const opacity = timeSlider > idx * 25 ? 1 : 0.3

        const polyline = L.polyline(
          [
            [fromLocation.lat, fromLocation.lon],
            [toLocation.lat, toLocation.lon],
          ],
          {
            color,
            weight,
            opacity,
            dashArray: route.status === 'delayed' ? '5, 5' : undefined,
          }
        ).addTo(map.current)

        polyline.bindPopup(
          `<strong>${route.rake_id}</strong><br/>
           From: ${route.from}<br/>
           To: ${route.to}<br/>
           Status: ${route.status}<br/>
           Distance: ${route.distance}km<br/>
           Duration: ${route.duration}h`
        )

        polyinesRef.current.push(polyline)
      }
    })
  }, [locations, routes, show3D, timeSlider])

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Controls */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowMarkers(!showMarkers)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
              showMarkers
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <MapPin size={16} />
            Markers
          </button>

          {webglSupported && (
            <button
              onClick={() => setShow3D(!show3D)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
                show3D
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              3D Routes
            </button>
          )}

          <button
            onClick={() => {
              if (map.current) {
                map.current.fitBounds(
                  L.latLngBounds(locations.map(l => [l.lat, l.lon]))
                )
              }
            }}
            className="px-3 py-1 rounded text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            Fit Bounds
          </button>
        </div>

        {/* Time Slider */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">
            Route Animation: {timeSlider}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={timeSlider}
            onChange={(e) => setTimeSlider(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-300">On-Time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-slate-300">Delayed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-300">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-slate-300">Port</span>
          </div>
        </div>

        {!webglSupported && (
          <div className="flex items-center gap-2 p-2 bg-yellow-900 border border-yellow-700 rounded text-xs text-yellow-200">
            <AlertCircle size={14} />
            <span>WebGL not available - using 2D rendering</span>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="flex-1 bg-slate-900" />
    </div>
  )
}

function getLocationIcon(type) {
  const iconUrl = {
    loading: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    unloading: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    yard: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    port: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  }[type] || 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png'

  return L.icon({
    iconUrl,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}

function getRouteColor(status) {
  return {
    'on-time': '#10b981',
    delayed: '#eab308',
    completed: '#3b82f6',
  }[status] || '#6b7280'
}
