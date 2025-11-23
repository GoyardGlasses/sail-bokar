/**
 * DelayForm Component
 * Form for inputting delay prediction parameters
 */

import React, { useState, useEffect } from 'react'
import { Calendar, Package, MapPin, Zap } from 'lucide-react'
import { getMaterials, getDestinations } from '../api/delayApi'

export const DelayFormData = {
  start_date: '',
  end_date: '',
  material: '',
  destination: '',
  priority: 0,
}

export default function DelayForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState<DelayFormData>({
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    material: 'All',
    destination: 'Kolkata',
    priority: 0.5,
  })

  const [materials, setMaterials] = useState<string[]>([])
  const [destinations, setDestinations] = useState<string[]>([])
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'priority' ? parseFloat(value) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
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
        {/* Start Date */}
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-slate-900 mb-2">
            <Calendar className="inline mr-2" size={16} />
            Start Date
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            aria-label="Start date for delay prediction"
          />
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-slate-900 mb-2">
            <Calendar className="inline mr-2" size={16} />
            End Date
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            aria-label="End date for delay prediction"
          />
        </div>

        {/* Material Select */}
        <div>
          <label htmlFor="material" className="block text-sm font-medium text-slate-900 mb-2">
            <Package className="inline mr-2" size={16} />
            Material Type
          </label>
          <select
            id="material"
            name="material"
            value={formData.material}
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

        {/* Destination Select */}
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-slate-900 mb-2">
            <MapPin className="inline mr-2" size={16} />
            Destination
          </label>
          <select
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            disabled={isLoading || loadingOptions}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            aria-label="Destination for delay prediction"
          >
            {destinations.map((dest) => (
              <option key={dest} value={dest}>
                {dest}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Priority Slider */}
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-slate-900 mb-2">
          <Zap className="inline mr-2" size={16} />
          Priority Level: {(formData.priority * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          id="priority"
          name="priority"
          min="0"
          max="1"
          step="0.01"
          value={formData.priority}
          onChange={handleChange}
          disabled={isLoading}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          aria-label="Priority level slider"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
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
