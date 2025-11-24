/**
 * CMO Stockyard Management Dashboard
 * Manages Central Marketing Organization stockyards across multiple locations
 */

import React, { useState, useEffect } from 'react'
import {
  MapPin,
  Truck,
  BarChart3,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
} from 'lucide-react'
import { cmoStockyardsMockData } from '../../../services/mockData'

export default function CMOStockyardDashboard() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<any>({})

  // Use mock data with dynamic capabilities
  const [stockyards, setStockyards] = useState(cmoStockyardsMockData.stockyards)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dynamic_cmoStockyards')
      if (stored) setStockyards(JSON.parse(stored))
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('dynamic_cmoStockyards', JSON.stringify(stockyards))
  }, [stockyards])

  // Calculate metrics
  const totalStockyards = stockyards.length
  const totalCapacity = stockyards.reduce((sum: number, s: any) => sum + s.capacity, 0)
  const totalDemand = stockyards.reduce((sum: number, s: any) => sum + s.expectedDemand, 0)
  const avgUtilization = (stockyards.reduce((sum: number, s: any) => sum + s.utilization, 0) / stockyards.length).toFixed(1)

  // Form handlers
  const handleAddClick = () => {
    setFormData({})
    setEditingIndex(null)
    setShowAddForm(true)
  }

  const handleEditClick = (index: number) => {
    setFormData({ ...stockyards[index] })
    setEditingIndex(index)
    setShowAddForm(true)
  }

  const handleSubmit = () => {
    if (editingIndex !== null) {
      const updated = [...stockyards]
      updated[editingIndex] = formData
      setStockyards(updated)
    } else {
      setStockyards([...stockyards, formData])
    }
    setShowAddForm(false)
    setFormData({})
    setEditingIndex(null)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setFormData({})
    setEditingIndex(null)
  }

  const handleDelete = (index: number) => {
    setStockyards(stockyards.filter((_: any, i: number) => i !== index))
  }

  const handleReset = () => {
    setStockyards(cmoStockyardsMockData.stockyards)
    localStorage.removeItem('dynamic_cmoStockyards')
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          CMO Stockyards Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Central Marketing Organization stockyards across India
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Stockyards</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{totalStockyards}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Capacity</p>
          <p className="text-2xl font-bold text-blue-600">{totalCapacity.toLocaleString()}t</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Expected Demand</p>
          <p className="text-2xl font-bold text-green-600">{totalDemand.toLocaleString()}t/day</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Avg Utilization</p>
          <p className="text-2xl font-bold text-orange-600">{avgUtilization}%</p>
        </div>
      </div>

      {/* Add/Reset Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Add Stockyard
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
        >
          Reset to Mock Data
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card border-2 border-blue-500 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                Code
              </label>
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., DANKUNI"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Stockyard name"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Location"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                Distance (km)
              </label>
              <input
                type="number"
                value={formData.distance || ''}
                onChange={(e) => setFormData({ ...formData, distance: parseFloat(e.target.value) })}
                placeholder="Distance"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                Expected Demand (t/day)
              </label>
              <input
                type="number"
                value={formData.expectedDemand || ''}
                onChange={(e) => setFormData({ ...formData, expectedDemand: parseFloat(e.target.value) })}
                placeholder="Demand"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                Capacity (t)
              </label>
              <input
                type="number"
                value={formData.capacity || ''}
                onChange={(e) => setFormData({ ...formData, capacity: parseFloat(e.target.value) })}
                placeholder="Capacity"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                Utilization (%)
              </label>
              <input
                type="number"
                value={formData.utilization || ''}
                onChange={(e) => setFormData({ ...formData, utilization: parseFloat(e.target.value) })}
                placeholder="Utilization"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
                Status
              </label>
              <select
                value={formData.status || 'operational'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
              >
                <option value="operational">Operational</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Check size={16} />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-slate-50 rounded-lg hover:bg-slate-400 dark:hover:bg-slate-700 transition"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stockyards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stockyards.map((stockyard: any, index: number) => (
          <div key={stockyard.id} className="card hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-50">{stockyard.name}</p>
                <p className="text-xs text-slate-500 font-mono">{stockyard.code}</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  stockyard.status === 'operational'
                    ? 'bg-green-100 text-green-700'
                    : stockyard.status === 'maintenance'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                }`}
              >
                {stockyard.status}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <MapPin size={14} />
                <span>{stockyard.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Truck size={14} />
                <span>{stockyard.distance}km from Bokaro</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <BarChart3 size={14} />
                <span>{stockyard.expectedDemand.toLocaleString()}t/day demand</span>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-sm border-t border-slate-200 dark:border-slate-700 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Capacity</span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">
                  {stockyard.capacity.toLocaleString()}t
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Utilization</span>
                <span
                  className={`font-semibold ${
                    stockyard.utilization > 75
                      ? 'text-orange-600'
                      : stockyard.utilization > 50
                        ? 'text-blue-600'
                        : 'text-green-600'
                  }`}
                >
                  {stockyard.utilization}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    stockyard.utilization > 75
                      ? 'bg-orange-500'
                      : stockyard.utilization > 50
                        ? 'bg-blue-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${stockyard.utilization}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEditClick(index)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition text-sm"
              >
                <Edit2 size={14} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(index)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition text-sm"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {stockyards.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">No stockyards added yet</p>
          <button
            onClick={handleAddClick}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add First Stockyard
          </button>
        </div>
      )}
    </div>
  )
}
