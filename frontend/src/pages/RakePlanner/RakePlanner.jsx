import React, { useState } from 'react'
import { optimizeDispatch } from '../../api/endpoints'
import { useOptimizeStore } from '../../store/useOptimizeStore'
import { useNavigate } from 'react-router-dom'

export default function RakePlanner() {
  const navigate = useNavigate()
  const { setOptimizationResult, setLoading, setError } = useOptimizeStore()
  const [formData, setFormData] = useState({
    orders: [],
    available_rakes: 5,
    available_trucks: 20,
    inventory: {},
  })

  const handleOptimize = async () => {
    setLoading(true)
    try {
      const result = await optimizeDispatch(formData)
      setOptimizationResult(result.data)
      navigate('/optimize-result')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Rake Planner</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Rakes
            </label>
            <input
              type="number"
              value={formData.available_rakes}
              onChange={(e) =>
                setFormData({ ...formData, available_rakes: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Trucks
            </label>
            <input
              type="number"
              value={formData.available_trucks}
              onChange={(e) =>
                setFormData({ ...formData, available_trucks: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <button
          onClick={handleOptimize}
          className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold"
        >
          Optimize Dispatch
        </button>
      </div>
    </div>
  )
}
