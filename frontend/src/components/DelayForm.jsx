/**
 * DelayForm Component
 * Form for inputting delay prediction parameters
 */

import React, { useState, useEffect } from 'react'
import { Calendar, Package, MapPin, Zap } from 'lucide-react'
import { getMaterials, getDestinations } from '../api/delayApi'

export default function DelayForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    route: 'Bokaro->Kolkata',
    tonnes_dispatched: 500,
    material_type: 'HR_Coils',
    weather_condition: 'Clear',
  })

  const [materials, setMaterials] = useState([])
  const [destinations, setDestinations] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true)
      try {
        const [mats, dests] = await Promise.all([getMaterials(), getDestinations()])
        setMaterials(mats)
        setDestinations(dests)
      } catch (error) {
        console.error('Failed to load form options:', error)
      } finally {
        setLoadingOptions(false)
      }
    }

    loadOptions()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'priority' ? parseFloat(value) : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate dates
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      alert('Start date must be before end date')
      return
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Delay Prediction Parameters</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Route */}
        <div>
          <label htmlFor="route" className="block text-sm font-medium text-slate-900 mb-2">
            <MapPin className="inline mr-2" size={16} />
            Route (e.g., Bokaro->Kolkata)
          </label>
          <input
            type="text"
            id="route"
            name="route"
            value={formData.route}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="e.g., Bokaro->Kolkata"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            aria-label="Route for delay prediction"
          />
        </div>

        {/* Tonnes Dispatched */}
        <div>
          <label htmlFor="tonnes_dispatched" className="block text-sm font-medium text-slate-900 mb-2">
            <Package className="inline mr-2" size={16} />
            Tonnes Dispatched
          </label>
          <input
            type="number"
            id="tonnes_dispatched"
            name="tonnes_dispatched"
            value={formData.tonnes_dispatched}
            onChange={handleChange}
            disabled={isLoading}
            min="0"
            step="10"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            aria-label="Tonnes dispatched"
          />
        </div>

        {/* Material Type */}
        <div>
          <label htmlFor="material_type" className="block text-sm font-medium text-slate-900 mb-2">
            <Package className="inline mr-2" size={16} />
            Material Type
          </label>
          <select
            id="material_type"
            name="material_type"
            value={formData.material_type}
            onChange={handleChange}
            disabled={isLoading || loadingOptions}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            aria-label="Material type for delay prediction"
          >
            {materials.map((mat) => (
              <option key={mat} value={mat}>
                {mat}
              </option>
            ))}
          </select>
        </div>

        {/* Weather Condition */}
        <div>
          <label htmlFor="weather_condition" className="block text-sm font-medium text-slate-900 mb-2">
            <Zap className="inline mr-2" size={16} />
            Weather Condition
          </label>
          <select
            id="weather_condition"
            name="weather_condition"
            value={formData.weather_condition}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            aria-label="Weather condition"
          >
            <option value="Clear">Clear</option>
            <option value="Rainy">Rainy</option>
            <option value="Cloudy">Cloudy</option>
            <option value="Foggy">Foggy</option>
            <option value="Stormy">Stormy</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || loadingOptions}
        className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        aria-label="Run delay prediction"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Predicting...
          </>
        ) : (
          <>
            <Zap size={20} />
            Run Delay Prediction
          </>
        )}
      </button>
    </form>
  )
}
