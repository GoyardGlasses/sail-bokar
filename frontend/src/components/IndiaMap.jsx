import React, { useEffect, useRef, useState } from 'react'
import { MapPin, Phone, Mail, Navigation } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export default function IndiaMap() {
  const mapContainer = useRef(null)
  const map = useRef(null)
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
      color: '#ef4444',
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
      color: '#3b82f6',
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
      color: '#10b981',
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
      color: '#a855f7',
      icon: '📍',
    },
  ]

  useEffect(() => {
    if (map.current) return

    // Initialize map
    map.current = L.map(mapContainer.current).setView([23.5, 86], 6)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current)

    // Add markers for each location
    locations.forEach((location) => {
      const marker = L.circleMarker([location.lat, location.lon], {
        radius: 10,
        fillColor: location.color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .bindPopup(
          `<div class="font-bold">${location.name}</div><div class="text-sm">${location.city}</div>`
        )
        .addTo(map.current)

      marker.on('click', () => setSelectedLocation(location))
    })

    // Draw lines connecting locations
    const polyline = L.polyline(
      locations.map((loc) => [loc.lat, loc.lon]),
      {
        color: '#3b82f6',
        weight: 2,
        opacity: 0.5,
        dashArray: '5, 5',
      }
    ).addTo(map.current)

    // Fit bounds to show all markers
    const group = new L.featureGroup(
      locations.map((loc) => L.latLng(loc.lat, loc.lon))
    )
    map.current.fitBounds(group.getBounds().pad(0.1))

    return () => {
      // Cleanup
    }
  }, [])

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
            <div
              ref={mapContainer}
              className="rounded-xl border-2 border-blue-200 dark:border-slate-600 overflow-hidden"
              style={{ height: '500px', width: '100%' }}
            />
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
