import React, { useState } from 'react'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function FeedbackForm({ shipmentId = null, onSubmitSuccess = null }) {
  const [formData, setFormData] = useState({
    shipment_id: shipmentId || '',
    model_name: '',
    predicted_value: '',
    actual_value: '',
    feedback_type: 'accuracy',
    comments: '',
    rating: 5,
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const models = [
    'Delay Prediction Model',
    'Cost Prediction Model',
    'Demand Forecasting Model',
    'Quality Prediction Model',
    'Fuel Consumption Model',
    'Route Optimization Model',
    'Cost Optimization Model',
    'Time Optimization Model',
    'Vehicle Allocation Model',
    'Material Recommendation Model',
    'Risk Assessment Model',
    'Decision Support Model',
    'Anomaly Detection Model',
    'Supplier Performance Model',
    'Scenario Analysis Model',
    'Predictive Maintenance Model',
    'Customer Satisfaction Model',
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/ml/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      const data = await response.json()
      setSuccess(true)

      // Reset form
      setFormData({
        shipment_id: shipmentId || '',
        model_name: '',
        predicted_value: '',
        actual_value: '',
        feedback_type: 'accuracy',
        comments: '',
        rating: 5,
      })

      // Call success callback
      if (onSubmitSuccess) {
        onSubmitSuccess(data)
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Model Feedback</h2>
        <p className="text-slate-600 mt-1">Help us improve our ML models by providing feedback</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Feedback submitted successfully!</p>
            <p className="text-sm text-green-700">Thank you for helping us improve our models.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600" />
          <div>
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shipment ID */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Shipment ID
          </label>
          <input
            type="text"
            name="shipment_id"
            value={formData.shipment_id}
            onChange={handleChange}
            placeholder="e.g., ORD-5001"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Model Name *
          </label>
          <select
            name="model_name"
            value={formData.model_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a model...</option>
            {models.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        {/* Predicted vs Actual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Predicted Value *
            </label>
            <input
              type="text"
              name="predicted_value"
              value={formData.predicted_value}
              onChange={handleChange}
              placeholder="e.g., 2.5 days"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Actual Value *
            </label>
            <input
              type="text"
              name="actual_value"
              value={formData.actual_value}
              onChange={handleChange}
              placeholder="e.g., 2.2 days"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Feedback Type */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Feedback Type
          </label>
          <select
            name="feedback_type"
            value={formData.feedback_type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="accuracy">Accuracy Issue</option>
            <option value="improvement">Improvement Suggestion</option>
            <option value="bug">Bug Report</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Model Rating (1-5 stars)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                className={`text-2xl transition-colors ${
                  star <= formData.rating ? 'text-yellow-400' : 'text-slate-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Comments
          </label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            placeholder="Share any additional feedback or observations..."
            rows="4"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors flex items-center justify-center gap-2"
          >
            <Send size={18} />
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
          <button
            type="reset"
            className="px-6 py-3 bg-slate-200 text-slate-900 font-medium rounded-lg hover:bg-slate-300 transition-colors"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">💡 Tip:</span> Your feedback helps us improve model accuracy. The more feedback you provide, the better our models become!
        </p>
      </div>
    </div>
  )
}
