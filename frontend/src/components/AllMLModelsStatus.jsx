import React from 'react'
import { Brain, CheckCircle, AlertCircle, Zap, TrendingUp, AlertTriangle, Truck, Users, Wrench, Cloud, Navigation, BarChart3 } from 'lucide-react'

export default function AllMLModelsStatus() {
  const allModels = [
    // Original 7 models
    { id: 1, name: 'Demand Forecasting', version: '2.1', status: 'active', accuracy: 94.2, type: 'regression', icon: TrendingUp, color: 'from-blue-50 to-blue-100', borderColor: 'border-blue-300', textColor: 'text-blue-600' },
    { id: 2, name: 'Rake Availability', version: '1.9', status: 'active', accuracy: 91.8, type: 'regression', icon: Truck, color: 'from-cyan-50 to-cyan-100', borderColor: 'border-cyan-300', textColor: 'text-cyan-600' },
    { id: 3, name: 'Delay Classifier', version: '1.8', status: 'active', accuracy: 89.5, type: 'classification', icon: AlertTriangle, color: 'from-red-50 to-red-100', borderColor: 'border-red-300', textColor: 'text-red-600' },
    { id: 4, name: 'Delay Regressor', version: '1.8', status: 'active', accuracy: 88.9, type: 'regression', icon: AlertTriangle, color: 'from-orange-50 to-orange-100', borderColor: 'border-orange-300', textColor: 'text-orange-600' },
    { id: 5, name: 'Throughput Optimization', version: '2.0', status: 'active', accuracy: 91.3, type: 'regression', icon: BarChart3, color: 'from-green-50 to-green-100', borderColor: 'border-green-300', textColor: 'text-green-600' },
    { id: 6, name: 'Cost Estimation', version: '1.9', status: 'active', accuracy: 92.1, type: 'regression', icon: TrendingUp, color: 'from-purple-50 to-purple-100', borderColor: 'border-purple-300', textColor: 'text-purple-600' },
    { id: 7, name: 'Mode Selection', version: '1.5', status: 'active', accuracy: 87.8, type: 'classification', icon: Truck, color: 'from-indigo-50 to-indigo-100', borderColor: 'border-indigo-300', textColor: 'text-indigo-600' },
    
    // New 10 advanced models
    { id: 8, name: 'Anomaly Detection', version: '1.0', status: 'active', accuracy: 93.5, type: 'classification', icon: AlertTriangle, color: 'from-rose-50 to-rose-100', borderColor: 'border-rose-300', textColor: 'text-rose-600' },
    { id: 9, name: 'Route Optimization', version: '1.0', status: 'active', accuracy: 90.2, type: 'regression', icon: Navigation, color: 'from-teal-50 to-teal-100', borderColor: 'border-teal-300', textColor: 'text-teal-600' },
    { id: 10, name: 'Weather Impact', version: '1.0', status: 'active', accuracy: 88.7, type: 'regression', icon: Cloud, color: 'from-sky-50 to-sky-100', borderColor: 'border-sky-300', textColor: 'text-sky-600' },
    { id: 11, name: 'Demand Clustering', version: '1.0', status: 'active', accuracy: 89.4, type: 'clustering', icon: BarChart3, color: 'from-violet-50 to-violet-100', borderColor: 'border-violet-300', textColor: 'text-violet-600' },
    { id: 12, name: 'Maintenance Prediction', version: '1.0', status: 'active', accuracy: 91.8, type: 'regression', icon: Wrench, color: 'from-amber-50 to-amber-100', borderColor: 'border-amber-300', textColor: 'text-amber-600' },
    { id: 13, name: 'Churn Prediction', version: '1.0', status: 'active', accuracy: 87.3, type: 'classification', icon: Users, color: 'from-fuchsia-50 to-fuchsia-100', borderColor: 'border-fuchsia-300', textColor: 'text-fuchsia-600' },
    { id: 14, name: 'Capacity Optimization', version: '1.0', status: 'active', accuracy: 92.6, type: 'regression', icon: BarChart3, color: 'from-lime-50 to-lime-100', borderColor: 'border-lime-300', textColor: 'text-lime-600' },
    { id: 15, name: 'Supplier Performance', version: '1.0', status: 'active', accuracy: 90.1, type: 'regression', icon: TrendingUp, color: 'from-emerald-50 to-emerald-100', borderColor: 'border-emerald-300', textColor: 'text-emerald-600' },
    { id: 16, name: 'Traffic Prediction', version: '1.0', status: 'active', accuracy: 89.9, type: 'regression', icon: Navigation, color: 'from-slate-50 to-slate-100', borderColor: 'border-slate-300', textColor: 'text-slate-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain size={28} className="text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All ML Models</h2>
          <p className="text-sm text-gray-600">17 Advanced ML Models Connected</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Models</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{allModels.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-300 rounded-lg p-4">
          <p className="text-sm text-gray-600">Active Models</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{allModels.filter(m => m.status === 'active').length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300 rounded-lg p-4">
          <p className="text-sm text-gray-600">Avg Accuracy</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">{(allModels.reduce((sum, m) => sum + m.accuracy, 0) / allModels.length).toFixed(1)}%</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-300 rounded-lg p-4">
          <p className="text-sm text-gray-600">System Status</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">✓ Ready</p>
        </div>
      </div>

      {/* All Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allModels.map((model) => {
          const Icon = model.icon
          return (
            <div
              key={model.id}
              className={`bg-gradient-to-br ${model.color} border-2 ${model.borderColor} rounded-lg p-4 hover:shadow-lg transition-all`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon size={20} className={model.textColor} />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{model.name}</p>
                    <p className="text-xs text-gray-600">v{model.version}</p>
                  </div>
                </div>
                {model.status === 'active' ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <AlertCircle size={16} className="text-red-500" />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Accuracy</span>
                  <span className="text-xs font-bold text-gray-900">{model.accuracy}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full bg-gradient-to-r ${model.color.split(' ')[1]}`}
                    style={{ width: `${model.accuracy}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-300">
                  <span className="text-xs text-gray-600">Type</span>
                  <span className="text-xs font-medium text-gray-900 capitalize">{model.type}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-300 flex items-center gap-1">
                <Zap size={12} className="text-yellow-500" />
                <span className="text-xs text-gray-600">Ready</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Model Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Core Prediction Models (7)</h3>
          <ul className="space-y-2">
            {allModels.slice(0, 7).map(model => (
              <li key={model.id} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle size={16} className="text-green-500" />
                {model.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Advanced Analytics Models (10)</h3>
          <ul className="space-y-2">
            {allModels.slice(7).map(model => (
              <li key={model.id} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle size={16} className="text-green-500" />
                {model.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
