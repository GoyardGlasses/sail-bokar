import React, { useState, useEffect } from 'react'
import { getMaterials } from '../api/costApi'
import { Calendar, Package, DollarSign } from 'lucide-react'

export default function CostForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    material: 'Steel Plates',
    max_cost: '',
  })

  const [materials, setMaterials] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const mats = await getMaterials()
        setMaterials(mats)
      } catch (error) {
        console.error('Failed to load options:', error)
      } finally {
        setLoadingOptions(false)
      }
    }
    loadOptions()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate dates
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      alert('Start date must be before end date')
      return
    }

    onSubmit({
      start_date: formData.start_date,
      end_date: formData.end_date,
      material: formData.material,
      max_cost: formData.max_cost ? parseInt(formData.max_cost) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Cost Prediction Form</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            <Calendar size={16} className="inline mr-2" />
            Start Date
          </label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            <Calendar size={16} className="inline mr-2" />
            End Date
          </label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Material */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            <Package size={16} className="inline mr-2" />
            Material
          </label>
          <select
            name="material"
            value={formData.material}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loadingOptions}
          >
            {materials.map(mat => (
              <option key={mat} value={mat}>{mat}</option>
            ))}
          </select>
        </div>

        {/* Max Cost (Optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            <DollarSign size={16} className="inline mr-2" />
            Max Cost Per Ton (Optional)
          </label>
          <input
            type="number"
            name="max_cost"
            value={formData.max_cost}
            onChange={handleChange}
            placeholder="e.g., 500"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Predicting...' : 'Predict Cost'}
      </button>
    </form>
  )
}
