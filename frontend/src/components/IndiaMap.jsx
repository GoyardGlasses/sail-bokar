import React, { useState } from 'react'
import { MapPin, Phone, Mail, Navigation } from 'lucide-react'

export default function IndiaMap() {
  const [selectedLocation, setSelectedLocation] = useState(null)

  // Actual coordinates for key locations
  const locations = [
    {
      id: 1,
      name: 'Bokaro Steel Plant',
      type: 'Steel Plant',
      lat: 23.1815,
      lon: 86.1539,
      city: 'Bokaro, Jharkhand',
      description: 'SAIL Bokaro Steel Plant - Primary production facility',
      phone: '+91-6542-223000',
      email: 'info@bokarosteel.com',
      color: 'bg-red-500',
      icon: '🏭',
    },
    {
      id: 2,
      name: 'CMO Stockyard',
      type: 'Stockyard',
      lat: 22.5726,
      lon: 88.3639,
      city: 'Kolkata, West Bengal',
      description: 'Central Marketing Organization Stockyard - Distribution hub',
      phone: '+91-33-2248-5000',
      email: 'cmo@sailsteel.com',
      color: 'bg-blue-500',
      icon: '📦',
    },
    {
      id: 3,
      name: 'Patna Distribution Center',
      type: 'Distribution',
      lat: 25.5941,
      lon: 85.1376,
      city: 'Patna, Bihar',
      description: 'Regional distribution center',
      phone: '+91-612-2200-100',
      email: 'patna@sailsteel.com',
      color: 'bg-green-500',
      icon: '🚚',
    },
    {
      id: 4,
      name: 'Ranchi Depot',
      type: 'Depot',
      lat: 23.3441,
      lon: 85.3096,
      city: 'Ranchi, Jharkhand',
      description: 'Regional storage and dispatch depot',
      phone: '+91-651-2200-200',
      email: 'ranchi@sailsteel.com',
      color: 'bg-purple-500',
      icon: '📍',
    },
  ]

  // SVG Map of India with approximate location markers
  const mapWidth = 400
  const mapHeight = 500

  // Convert lat/lon to SVG coordinates (rough approximation for India)
  const latToY = (lat) => {
    return ((35.5 - lat) / 30) * mapHeight
  }

  const lonToX = (lon) => {
    return ((lon - 68) / 32) * mapWidth
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-700 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
          <MapPin className="inline mr-2" size={28} />
          India Logistics Network Map
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Key locations for SAIL Bokaro operations and distribution
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-slate-600 dark:to-slate-700 rounded-xl p-4 border-2 border-blue-200 dark:border-slate-600">
              <svg
                viewBox={`0 0 ${mapWidth} ${mapHeight}`}
                className="w-full h-auto"
                style={{ maxHeight: '500px' }}
              >
                {/* India outline (simplified) */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="rgba(100,116,139,0.1)"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>

                {/* Grid background */}
                <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />

                {/* Simplified India border */}
                <path
                  d="M 80 50 L 120 40 L 150 60 L 160 100 L 150 150 L 140 180 L 120 200 L 100 190 L 80 160 L 70 120 L 75 80 Z"
                  fill="rgba(59,130,246,0.1)"
                  stroke="rgba(59,130,246,0.5)"
                  strokeWidth="2"
                />

                {/* Location markers */}
                {locations.map((location) => {
                  const x = lonToX(location.lon)
                  const y = latToY(location.lat)
                  const isSelected = selectedLocation?.id === location.id

                  return (
                    <g key={location.id}>
                      {/* Pulse circle */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 20 : 15}
                        fill="none"
                        stroke={isSelected ? '#3b82f6' : '#6b7280'}
                        strokeWidth="2"
                        opacity="0.3"
                        className="animate-pulse"
                      />

                      {/* Main marker */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 12 : 8}
                        fill={
                          location.id === 1
                            ? '#ef4444'
                            : location.id === 2
                            ? '#3b82f6'
                            : location.id === 3
                            ? '#10b981'
                            : '#a855f7'
                        }
                        stroke="white"
                        strokeWidth="2"
                        className="cursor-pointer hover:opacity-80 transition-all"
                        onClick={() => setSelectedLocation(location)}
                      />

                      {/* Label */}
                      <text
                        x={x}
                        y={y - 20}
                        textAnchor="middle"
                        className="text-xs font-bold fill-slate-900 dark:fill-slate-50 pointer-events-none"
                        style={{ fontSize: '10px' }}
                      >
                        {location.name.split(' ')[0]}
                      </text>
                    </g>
                  )
                })}

                {/* Connection lines */}
                <line
                  x1={lonToX(locations[0].lon)}
                  y1={latToY(locations[0].lat)}
                  x2={lonToX(locations[1].lon)}
                  y2={latToY(locations[1].lat)}
                  stroke="rgba(59,130,246,0.3)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <line
                  x1={lonToX(locations[1].lon)}
                  y1={latToY(locations[1].lat)}
                  x2={lonToX(locations[2].lon)}
                  y2={latToY(locations[2].lat)}
                  stroke="rgba(59,130,246,0.3)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </svg>

              {/* Legend */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {locations.map((loc) => (
                  <div key={loc.id} className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        loc.id === 1
                          ? 'bg-red-500'
                          : loc.id === 2
                          ? 'bg-blue-500'
                          : loc.id === 3
                          ? 'bg-green-500'
                          : 'bg-purple-500'
                      }`}
                    ></div>
                    <span className="text-slate-700 dark:text-slate-300">{loc.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Location Details Section */}
          <div className="lg:col-span-1">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4">
                Locations
              </h3>

              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className={`w-full text-left p-3 rounded-lg transition-all border-2 ${
                    selectedLocation?.id === location.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500'
                      : 'bg-white dark:bg-slate-600 border-slate-200 dark:border-slate-500 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xl">{location.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-50 text-sm">
                        {location.name}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {location.city}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Location Details */}
        {selectedLocation && (
          <div className="mt-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-600 dark:to-slate-700 rounded-xl p-6 border-2 border-blue-200 dark:border-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3">
                  {selectedLocation.name}
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">Type:</span> {selectedLocation.type}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">Location:</span> {selectedLocation.city}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">Coordinates:</span> {selectedLocation.lat.toFixed(4)}°N,{' '}
                    {selectedLocation.lon.toFixed(4)}°E
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    {selectedLocation.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white dark:bg-slate-700 rounded-lg p-3 flex items-start gap-3">
                  <Phone size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Phone</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      {selectedLocation.phone}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-700 rounded-lg p-3 flex items-start gap-3">
                  <Mail size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Email</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-50 break-all text-sm">
                      {selectedLocation.email}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-700 rounded-lg p-3 flex items-start gap-3">
                  <Navigation size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Distance from Bokaro</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      {selectedLocation.id === 1
                        ? 'Primary Location'
                        : `~${Math.round(
                            Math.sqrt(
                              Math.pow(selectedLocation.lat - locations[0].lat, 2) +
                                Math.pow(selectedLocation.lon - locations[0].lon, 2)
                            ) * 111
                          )} km`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
