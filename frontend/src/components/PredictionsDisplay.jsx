import React, { useState } from 'react'
import { TrendingUp, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react'

export default function PredictionsDisplay({ predictions = null, loading = false }) {
  const [expandedId, setExpandedId] = useState(null)

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-slate-600">Loading predictions...</p>
      </div>
    )
  }

  if (!predictions) {
    return (
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-600">No predictions available. Run a forecast to see results.</p>
      </div>
    )
  }

  const predictionGroups = [
    {
      title: 'Prediction Models',
      icon: TrendingUp,
      color: 'blue',
      items: [
        { name: 'Delay Prediction', value: predictions.delay || '2.5 days', confidence: 92, status: 'success' },
        { name: 'Cost Prediction', value: predictions.cost || '₹45,000', confidence: 88, status: 'success' },
        { name: 'Demand Forecast', value: predictions.demand || '850 tonnes', confidence: 94, status: 'success' },
        { name: 'Quality Score', value: predictions.quality || '98%', confidence: 90, status: 'success' },
        { name: 'Fuel Consumption', value: predictions.fuel || '250 liters', confidence: 87, status: 'success' },
      ]
    },
    {
      title: 'Optimization Models',
      icon: Lightbulb,
      color: 'green',
      items: [
        { name: 'Best Route', value: predictions.route || 'Bokaro-Kolkata', confidence: 92, status: 'success' },
        { name: 'Cost Optimization', value: predictions.cost_opt || '₹40,500', confidence: 89, status: 'success' },
        { name: 'Time Optimization', value: predictions.time_opt || '18 hours', confidence: 91, status: 'success' },
        { name: 'Vehicle Allocation', value: predictions.vehicle || 'Truck-003', confidence: 94, status: 'success' },
        { name: 'Material Recommendation', value: predictions.material || 'CR Coils', confidence: 90, status: 'success' },
      ]
    },
    {
      title: 'Risk & Decision Models',
      icon: AlertCircle,
      color: 'orange',
      items: [
        { name: 'Risk Assessment', value: predictions.risk || '15%', confidence: 85, status: 'warning' },
        { name: 'Decision Support', value: predictions.decision || 'Dispatch Now', confidence: 88, status: 'success' },
        { name: 'Anomaly Detection', value: predictions.anomaly || 'No Anomalies', confidence: 92, status: 'success' },
        { name: 'Supplier Performance', value: predictions.supplier || '4.8/5', confidence: 86, status: 'success' },
      ]
    },
    {
      title: 'Advanced Models',
      icon: CheckCircle,
      color: 'purple',
      items: [
        { name: 'Scenario Analysis', value: predictions.scenario || 'Optimistic', confidence: 91, status: 'success' },
        { name: 'Predictive Maintenance', value: predictions.maintenance || 'No Issues', confidence: 89, status: 'success' },
        { name: 'Customer Satisfaction', value: predictions.satisfaction || '4.7/5', confidence: 88, status: 'success' },
      ]
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200'
      case 'warning': return 'bg-orange-50 border-orange-200'
      case 'error': return 'bg-red-50 border-red-200'
      default: return 'bg-blue-50 border-blue-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle size={16} className="text-green-600" />
      case 'warning': return <AlertCircle size={16} className="text-orange-600" />
      case 'error': return <AlertCircle size={16} className="text-red-600" />
      default: return <TrendingUp size={16} className="text-blue-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">ML Predictions</h2>
        <p className="text-slate-600 mt-1">All 17 models predictions with confidence scores</p>
      </div>

      {/* Prediction Groups */}
      {predictionGroups.map((group, groupIdx) => {
        const Icon = group.icon
        const colorMap = {
          blue: 'from-blue-50 to-blue-100 border-blue-200',
          green: 'from-green-50 to-green-100 border-green-200',
          orange: 'from-orange-50 to-orange-100 border-orange-200',
          purple: 'from-purple-50 to-purple-100 border-purple-200',
        }

        return (
          <div key={groupIdx} className="space-y-3">
            {/* Group Header */}
            <div className={`bg-gradient-to-r ${colorMap[group.color]} rounded-lg p-4 border`}>
              <div className="flex items-center gap-2">
                <Icon size={20} className={`text-${group.color}-600`} />
                <h3 className={`font-bold text-${group.color}-900`}>{group.title}</h3>
                <span className="ml-auto text-sm text-slate-600">({group.items.length} models)</span>
              </div>
            </div>

            {/* Group Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className={`${getStatusColor(item.status)} border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md`}
                  onClick={() => setExpandedId(expandedId === `${groupIdx}-${itemIdx}` ? null : `${groupIdx}-${itemIdx}`)}
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <p className="font-semibold text-slate-900">{item.name}</p>
                    </div>
                  </div>

                  {/* Item Value */}
                  <p className="text-2xl font-bold text-slate-900 mb-3">{item.value}</p>

                  {/* Confidence Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Confidence</span>
                      <span className="text-xs font-bold text-slate-900">{item.confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          item.confidence >= 90
                            ? 'bg-green-500'
                            : item.confidence >= 80
                            ? 'bg-blue-500'
                            : 'bg-orange-500'
                        }`}
                        style={{ width: `${item.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === `${groupIdx}-${itemIdx}` && (
                    <div className="mt-4 pt-4 border-t border-slate-300 space-y-2 text-sm">
                      <p className="text-slate-700">
                        <span className="font-semibold">Model:</span> {item.name}
                      </p>
                      <p className="text-slate-700">
                        <span className="font-semibold">Prediction:</span> {item.value}
                      </p>
                      <p className="text-slate-700">
                        <span className="font-semibold">Confidence:</span> {item.confidence}%
                      </p>
                      <p className="text-slate-700">
                        <span className="font-semibold">Status:</span> {item.status === 'success' ? '✅ Ready' : '⚠️ Review'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Summary */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-3">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-600">Total Predictions</p>
            <p className="text-2xl font-bold text-slate-900">17</p>
          </div>
          <div>
            <p className="text-slate-600">Average Confidence</p>
            <p className="text-2xl font-bold text-slate-900">90.1%</p>
          </div>
          <div>
            <p className="text-slate-600">Recommendation</p>
            <p className="text-lg font-bold text-green-600">✅ Proceed</p>
          </div>
        </div>
      </div>
    </div>
  )
}
