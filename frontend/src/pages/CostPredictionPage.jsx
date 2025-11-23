import React, { useState } from 'react'
import CostForm from '../components/CostForm'
import CostResults from '../components/CostResults'
import { predictCost } from '../api/costApi'
import { DollarSign, TrendingUp } from 'lucide-react'

export default function CostPredictionPage() {
  const [costData, setCostData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handlePredictCost = async (formData) => {
    setLoading(true)
    setError(null)
    try {
      const result = await predictCost(formData)
      setCostData(result)
    } catch (err) {
      setError('Failed to predict cost: ' + err.message)
      console.error('Prediction error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <DollarSign size={32} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Cost Per Tonne Prediction</h1>
        </div>
        <p className="text-slate-600">Predict logistics costs and analyze cost drivers by destination</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card p-4 bg-red-50 border-l-4 border-red-500">
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form - Left Side */}
        <div className="lg:col-span-1">
          <CostForm onSubmit={handlePredictCost} isLoading={loading} />
        </div>

        {/* Results - Right Side */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="card p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Predicting cost...</p>
            </div>
          ) : (
            <CostResults data={costData} />
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-start gap-3">
            <DollarSign size={20} className="text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-900 text-sm">Average Cost</p>
              <p className="text-xs text-slate-600 mt-1">Predicted average cost per tonne based on historical data</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-start gap-3">
            <TrendingUp size={20} className="text-green-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-900 text-sm">Total Cost</p>
              <p className="text-xs text-slate-600 mt-1">Total estimated cost for the selected period</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-start gap-3">
            <DollarSign size={20} className="text-purple-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-900 text-sm">Cost Drivers</p>
              <p className="text-xs text-slate-600 mt-1">Breakdown of factors affecting total cost</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
