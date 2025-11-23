/**
 * RouteComparison Component
 * Compare 2-3 routes side-by-side with charts and recommendations
 */

import React, { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'

const ROUTE_OPTIONS = [
  'Bokaro->Kolkata',
  'Bokaro->Hatia',
  'Bokaro->Dhanbad',
  'Bokaro->Patna',
  'Bokaro->Ranchi',
  'Bokaro->Durgapur',
  'Bokaro->Haldia',
]

export default function RouteComparison({ onCompare, isLoading }) {
  const [selectedRoutes, setSelectedRoutes] = useState(['Bokaro->Kolkata', 'Bokaro->Hatia'])
  const [comparisonData, setComparisonData] = useState(null)

  // Mock comparison data generator
  const generateComparison = (routes) => {
    const predictions = routes.map((route) => {
      const delayHours = Math.floor(Math.random() * 15) + 1
      const probability = Math.random() * 0.25 + 0.05
      const safetyScore = (1 - probability) * 100

      return {
        route,
        delayHours,
        probability: parseFloat(probability.toFixed(2)),
        safetyScore: parseFloat(safetyScore.toFixed(1)),
        costPerTonne: Math.floor(Math.random() * 500) + 1000,
        reliability: Math.floor(Math.random() * 30) + 70,
      }
    })

    // Determine best route
    const bestRoute = predictions.reduce((best, current) =>
      current.probability < best.probability ? current : best
    )

    return {
      predictions,
      bestRoute: bestRoute.route,
      savings: Math.floor(Math.random() * 5000) + 1000,
    }
  }

  const handleRouteChange = (index, value) => {
    const newRoutes = [...selectedRoutes]
    newRoutes[index] = value
    setSelectedRoutes(newRoutes)
  }

  const handleAddRoute = () => {
    if (selectedRoutes.length < 3) {
      setSelectedRoutes([...selectedRoutes, ROUTE_OPTIONS[0]])
    }
  }

  const handleRemoveRoute = (index) => {
    setSelectedRoutes(selectedRoutes.filter((_, i) => i !== index))
  }

  const handleCompare = () => {
    const data = generateComparison(selectedRoutes)
    setComparisonData(data)
  }

  const comparisonChartData = useMemo(() => {
    if (!comparisonData) return []
    return comparisonData.predictions.map((p) => ({
      name: p.route.split('->')[1], // Just destination
      'Delay (h)': p.delayHours,
      'Risk %': p.probability * 100,
      'Safety Score': p.safetyScore,
    }))
  }, [comparisonData])

  const radarData = useMemo(() => {
    if (!comparisonData) return []
    return [
      { metric: 'Safety', ...Object.fromEntries(comparisonData.predictions.map((p) => [p.route.split('->')[1], p.safetyScore])) },
      { metric: 'Reliability', ...Object.fromEntries(comparisonData.predictions.map((p) => [p.route.split('->')[1], p.reliability])) },
      { metric: 'Cost Efficiency', ...Object.fromEntries(comparisonData.predictions.map((p) => [p.route.split('->')[1], 100 - (p.costPerTonne / 1500) * 100])) },
    ]
  }, [comparisonData])

  return (
    <div className="space-y-6">
      {/* Route Selection */}
      <div className="card space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Compare Routes</h2>
        <p className="text-slate-600 text-sm">Select 2-3 routes to compare side-by-side</p>

        <div className="space-y-3">
          {selectedRoutes.map((route, idx) => (
            <div key={idx} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Route {idx + 1}
                </label>
                <select
                  value={route}
                  onChange={(e) => handleRouteChange(idx, e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  {ROUTE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              {selectedRoutes.length > 2 && (
                <button
                  onClick={() => handleRemoveRoute(idx)}
                  disabled={isLoading}
                  className="btn btn-outline text-red-600 disabled:opacity-50 px-3"
                  aria-label="Remove route"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCompare}
            disabled={isLoading || selectedRoutes.length < 2}
            className="flex-1 btn btn-primary disabled:opacity-50"
            aria-label="Compare selected routes"
          >
            {isLoading ? 'Comparing...' : 'Compare Routes'}
          </button>
          {selectedRoutes.length < 3 && (
            <button
              onClick={handleAddRoute}
              disabled={isLoading}
              className="btn btn-outline disabled:opacity-50"
              aria-label="Add another route"
            >
              + Add Route
            </button>
          )}
        </div>
      </div>

      {/* Comparison Results */}
      {comparisonData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparisonData.predictions.map((pred, idx) => {
              const isBest = pred.route === comparisonData.bestRoute
              return (
                <div
                  key={idx}
                  className={`card border-2 transition-all ${
                    isBest ? 'border-green-500 bg-green-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-slate-600">{pred.route}</p>
                      {isBest && (
                        <div className="flex items-center gap-1 mt-1 text-green-600">
                          <CheckCircle size={16} />
                          <span className="text-xs font-bold">BEST OPTION</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-500">Delay Hours</p>
                      <p className="text-2xl font-bold text-slate-900">{pred.delayHours}h</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Risk Probability</p>
                      <p className="text-lg font-bold text-orange-600">{(pred.probability * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Safety Score</p>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${pred.safetyScore}%` }}
                        />
                      </div>
                      <p className="text-sm font-medium text-slate-900 mt-1">{pred.safetyScore}%</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart - Delay vs Risk */}
            <div className="card">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Delay & Risk Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Delay (h)" fill="#ef4444" name="Delay Hours" />
                  <Bar yAxisId="right" dataKey="Risk %" fill="#f97316" name="Risk %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Safety Score Comparison */}
            <div className="card">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Safety Score Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Safety Score" fill="#22c55e" name="Safety Score %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Comparison Table */}
          <div className="card">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Detailed Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-slate-900">Route</th>
                    <th className="px-4 py-2 text-left text-slate-900">Delay (h)</th>
                    <th className="px-4 py-2 text-left text-slate-900">Risk %</th>
                    <th className="px-4 py-2 text-left text-slate-900">Safety</th>
                    <th className="px-4 py-2 text-left text-slate-900">Reliability</th>
                    <th className="px-4 py-2 text-left text-slate-900">Cost/Tonne</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.predictions.map((pred, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-slate-200 ${
                        pred.route === comparisonData.bestRoute ? 'bg-green-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-2 font-medium text-slate-900">
                        {pred.route}
                        {pred.route === comparisonData.bestRoute && (
                          <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                            Best
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-slate-600">{pred.delayHours}h</td>
                      <td className="px-4 py-2 text-slate-600">{(pred.probability * 100).toFixed(1)}%</td>
                      <td className="px-4 py-2 text-slate-600">{pred.safetyScore}%</td>
                      <td className="px-4 py-2 text-slate-600">{pred.reliability}%</td>
                      <td className="px-4 py-2 text-slate-600">₹{pred.costPerTonne}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendation */}
          <div className="card bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Recommendation</h3>
                <p className="text-blue-800 mb-2">
                  <strong>{comparisonData.bestRoute}</strong> is the best option with the lowest delay risk and highest safety score.
                </p>
                <p className="text-sm text-blue-700">
                  Potential savings: <strong>₹{comparisonData.savings.toLocaleString()}</strong> by choosing this route.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
