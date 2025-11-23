import React, { useEffect, useRef, useState } from 'react'
import { MapPin, AlertCircle, Zap } from 'lucide-react'

export const Map3D = ({
  locations = [],
  routes = [],
  onLocationSelect = null,
  enable3D = true,
}) => {
  const canvasRef = useRef(null)
  const [webglSupported, setWebglSupported] = useState(true)
  const [showMarkers, setShowMarkers] = useState(true)
  const [show3D, setShow3D] = useState(enable3D)
  const [timeSlider, setTimeSlider] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [hoveredLocation, setHoveredLocation] = useState(null)

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

  // Draw map
  useEffect(() => {
    if (!canvasRef.current || locations.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Calculate bounds
    const lats = locations.map(l => l.lat)
    const lons = locations.map(l => l.lon)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLon = Math.min(...lons)
    const maxLon = Math.max(...lons)

    // Calculate scale
    const latRange = maxLat - minLat || 1
    const lonRange = maxLon - minLon || 1
    const scale = Math.min(
      (canvas.width * 0.8) / (lonRange * 111),
      (canvas.height * 0.8) / (latRange * 111)
    ) * zoom

    // Center point
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const centerLat = (minLat + maxLat) / 2
    const centerLon = (minLon + maxLon) / 2

    // Convert lat/lon to canvas coordinates
    const latLonToCanvas = (lat, lon) => {
      const x = centerX + (lon - centerLon) * 111 * scale + pan.x
      const y = centerY - (lat - centerLat) * 111 * scale + pan.y
      return { x, y }
    }

    // Draw grid
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 0.5
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Draw routes
    routes.forEach((route, idx) => {
      const fromLoc = locations.find(l => l.id === route.from)
      const toLoc = locations.find(l => l.id === route.to)

      if (fromLoc && toLoc) {
        const from = latLonToCanvas(fromLoc.lat, fromLoc.lon)
        const to = latLonToCanvas(toLoc.lat, toLoc.lon)

        // Route line
        ctx.strokeStyle = getRouteColor(route.status)
        ctx.lineWidth = show3D ? 3 : 2
        ctx.globalAlpha = timeSlider > idx * 25 ? 1 : 0.3

        if (route.status === 'delayed') {
          ctx.setLineDash([5, 5])
        } else {
          ctx.setLineDash([])
        }

        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.stroke()

        ctx.globalAlpha = 1
        ctx.setLineDash([])

        // Route label
        const midX = (from.x + to.x) / 2
        const midY = (from.y + to.y) / 2
        ctx.fillStyle = '#f1f5f9'
        ctx.font = 'bold 10px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(route.rake_id, midX, midY - 5)
      }
    })

    // Draw markers
    if (showMarkers) {
      locations.forEach(location => {
        const pos = latLonToCanvas(location.lat, location.lon)
        const isHovered = hoveredLocation?.id === location.id

        // Marker circle
        ctx.fillStyle = getMarkerColor(location.type)
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, isHovered ? 10 : 8, 0, Math.PI * 2)
        ctx.fill()

        // Marker border
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, isHovered ? 10 : 8, 0, Math.PI * 2)
        ctx.stroke()

        // Label
        if (isHovered) {
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 12px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(location.name || location.id, pos.x, pos.y - 20)
        }
      })
    }

    // Draw title
    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('Supply Chain Route Map', 10, 25)
  }, [locations, routes, showMarkers, show3D, timeSlider, zoom, pan, hoveredLocation])

  // Handle canvas click
  const handleCanvasClick = (e) => {
    if (!canvasRef.current || locations.length === 0) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    // Calculate bounds
    const lats = locations.map(l => l.lat)
    const lons = locations.map(l => l.lon)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLon = Math.min(...lons)
    const maxLon = Math.max(...lons)

    const latRange = maxLat - minLat || 1
    const lonRange = maxLon - minLon || 1
    const scale = Math.min(
      (canvas.width * 0.8) / (lonRange * 111),
      (canvas.height * 0.8) / (latRange * 111)
    ) * zoom

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const centerLat = (minLat + maxLat) / 2
    const centerLon = (minLon + maxLon) / 2

    // Check which location was clicked
    locations.forEach(location => {
      const x = centerX + (location.lon - centerLon) * 111 * scale + pan.x
      const y = centerY - (location.lat - centerLat) * 111 * scale + pan.y

      const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2)
      if (distance < 15) {
        onLocationSelect?.(location)
      }
    })
  }

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
              <Zap size={16} />
              3D Routes
            </button>
          )}

          <button
            onClick={() => {
              setZoom(1)
              setPan({ x: 0, y: 0 })
            }}
            className="px-3 py-1 rounded text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            Reset View
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

        {/* Zoom Control */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">
            Zoom: {(zoom * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
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
            <span>Using 2D canvas rendering</span>
          </div>
        )}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={(e) => {
          if (!canvasRef.current || locations.length === 0) return

          const canvas = canvasRef.current
          const rect = canvas.getBoundingClientRect()
          const mouseX = e.clientX - rect.left
          const mouseY = e.clientY - rect.top

          // Calculate bounds
          const lats = locations.map(l => l.lat)
          const lons = locations.map(l => l.lon)
          const minLat = Math.min(...lats)
          const maxLat = Math.max(...lats)
          const minLon = Math.min(...lons)
          const maxLon = Math.max(...lons)

          const latRange = maxLat - minLat || 1
          const lonRange = maxLon - minLon || 1
          const scale = Math.min(
            (canvas.width * 0.8) / (lonRange * 111),
            (canvas.height * 0.8) / (latRange * 111)
          ) * zoom

          const centerX = canvas.width / 2
          const centerY = canvas.height / 2
          const centerLat = (minLat + maxLat) / 2
          const centerLon = (minLon + maxLon) / 2

          // Check which location is hovered
          let found = null
          locations.forEach(location => {
            const x = centerX + (location.lon - centerLon) * 111 * scale + pan.x
            const y = centerY - (location.lat - centerLat) * 111 * scale + pan.y

            const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2)
            if (distance < 15) {
              found = location
            }
          })

          setHoveredLocation(found)
          canvas.style.cursor = found ? 'pointer' : 'default'
        }}
        onMouseLeave={() => setHoveredLocation(null)}
        className="flex-1 bg-slate-900 cursor-default"
      />
    </div>
  )
}

function getMarkerColor(type) {
  return {
    loading: '#10b981',
    unloading: '#3b82f6',
    yard: '#eab308',
    port: '#ef4444',
  }[type] || '#6b7280'
}

function getRouteColor(status) {
  return {
    'on-time': '#10b981',
    delayed: '#eab308',
    completed: '#3b82f6',
  }[status] || '#6b7280'
}
