import React from 'react'
import { Brain, CheckCircle, AlertCircle, Zap } from 'lucide-react'

export default function MLModelsStatus({ models = [] }) {
  if (!models || models.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <Brain size={24} className="text-blue-600" />
        ML Models Status
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {models.map((model, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain size={20} className="text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{model.name}</p>
                  <p className="text-xs text-gray-600">v{model.version}</p>
                </div>
              </div>
              {model.status === 'active' || model.status === 'loaded' ? (
                <CheckCircle size={18} className="text-green-500" />
              ) : (
                <AlertCircle size={18} className="text-red-500" />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Accuracy</span>
                <span className="text-xs font-bold text-gray-900">{model.accuracy}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full"
                  style={{ width: `${model.accuracy}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-600">Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {model.status === 'active' ? 'Active' : 'Loaded'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Type</span>
                <span className="text-xs font-medium text-gray-900 capitalize">{model.type}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-blue-200 flex items-center gap-1">
              <Zap size={14} className="text-yellow-500" />
              <span className="text-xs text-gray-600">Ready for predictions</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
