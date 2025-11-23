/**
 * MaterialComparison Component
 * Compare same route with different materials to find safest/most cost-effective option
 */

import React, { useState, useMemo } from 'react'
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { TrendingDown, DollarSign, Shield } from 'lucide-react'

const MATERIALS = ['HR_Coils', 'CR_Coils', 'Plates', 'Wire_Rods', 'TMT_Bars', 'Pig_Iron', 'Billets']

export default function MaterialComparison({ onCompare, isLoading }) {
  const [route, setRoute] = useState('Bokaro->Kolkata')
  const [tonnes, setTonnes] = useState(500)
  const [weather, setWeather] = useState('Clear')
  const [comparisonData, setComparisonData] = useState(null)

  // Mock material comparison data
  const generateMaterialComparison = (route, tonnes, weather) => {
    const materials = MATERIALS.map((material) => {
      // Base metrics
      const delayHours = Math.floor(Math.random() * 12) + 2
      const probability = Math.random() * 0.2 + 0.05
      const costPerTonne = Math.floor(Math.random() * 600) + 800
      const reliability = Math.floor(Math.random() * 25) + 75
      const safetyScore = (1 - probability) * 100

      // Calculate composite score
      const compositeScore = (safetyScore * 0.4 + reliability * 0.3 + (100 - (costPerTonne / 1400) * 100) * 0.3)

      return {
        material,
        delayHours,
        probability: parseFloat(probability.toFixed(2)),
        costPerTonne,
        reliability,
        safetyScore: parseFloat(safetyScore.toFixed(1)),
        compositeScore: parseFloat(compositeScore.toFixed(1)),
        totalCost: Math.floor(costPerTonne * tonnes),
      }
    })

    // Find best options
    const safest = materials.reduce((best, current) =>
      current.probability < best.probability ? current : best
    )
    const mostCostEffective = materials.reduce((best, current) =>
      current.costPerTonne < best.costPerTonne ? current : best
    )
    const bestOverall = materials.reduce((best, current) =>
      current.compositeScore > best.compositeScore ? current : best
    )

    return {
      materials,
      safest: safest.material,
      mostCostEffective: mostCostEffective.material,
      bestOverall: bestOverall.material,
      costSavings: mostCostEffective.totalCost - safest.totalCost,
    }
  }

  const handleCompare = () => {
    const data = generateMaterialComparison(route, tonnes, weather)
    setComparisonData(data)
  }

  const chartData = useMemo(() => {
    if (!comparisonData) return []
    return comparisonData.materials.map((m) => ({
      material: m.material,
      'Delay (h)': m.delayHours,
      'Risk %': m.probability * 100,
      'Cost/Tonne': m.costPerTonne,
      'Safety': m.safetyScore,
    }))
  }, [comparisonData])

  const costVsSafetyData = useMemo(() => {
    if (!comparisonData) return []
    return comparisonData.materials.map((m) => ({
      material: m.material,
      cost: m.costPerTonne,
      safety: m.safetyScore,
      size: m.reliability,
    }))
  }, [comparisonData])

  const radarData = useMemo(() => {
    if (!comparisonData) return []
    return [
      {
        metric: 'Safety',
        ...Object.fromEntries(comparisonData.materials.map((m) => [m.material.split('_')[0], m.safetyScore])),
      },
      {
        metric: 'Reliability',
        ...Object.fromEntries(comparisonData.materials.map((m) => [m.material.split('_')[0], m.reliability])),
      },
      {
        metric: 'Cost Efficiency',
        ...Object.fromEntries(comparisonData.materials.map((m) => [m.material.split('_')[0], 100 - (m.costPerTonne / 1400) * 100])),
      },
    ]
  }, [comparisonData])

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="card space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Material Comparison</h2>
        <p className="text-slate-600 text-sm">Compare all materials for the same route to find the best option</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Route</label>
            <input
              type="text"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Tonnes Dispatched</label>
            <input
              type="number"
              value={tonnes}
              onChange={(e) => setTonnes(parseFloat(e.target.value))}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Weather Condition</label>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option>Clear</option>
              <option>Rainy</option>
              <option>Cloudy</option>
              <option>Foggy</option>
              <option>Stormy</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={isLoading}
          className="w-full btn btn-primary disabled:opacity-50"
          aria-label="Compare materials"
        >
          {isLoading ? 'Comparing...' : 'Compare All Materials'}
        </button>
      </div>

      {/* Results */}
      {comparisonData && (
        <>
          {/* Recommendation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card border-2 border-green-500 bg-green-50">
              <div className="flex items-start gap-3 mb-3">
                <Shield className="text-green-600 flex-shrink-0" size={24} />
                <div>
                  <p className="text-sm font-medium text-green-600">Safest Option</p>
                  <p className="text-2xl font-bold text-green-900">{comparisonData.safest}</p>
                </div>
              </div>
              <p className="text-xs text-green-700">
                Lowest delay risk and highest safety score
              </p>
            </div>

            <div className="card border-2 border-blue-500 bg-blue-50">
              <div className="flex items-start gap-3 mb-3">
                <DollarSign className="text-blue-600 flex-shrink-0" size={24} />
                <div>
                  <p className="text-sm font-medium text-blue-600">Most Cost-Effective</p>
                  <p className="text-2xl font-bold text-blue-900">{comparisonData.mostCostEffective}</p>
                </div>
              </div>
              <p className="text-xs text-blue-700">
                Lowest cost per tonne
              </p>
            </div>

            <div className="card border-2 border-purple-500 bg-purple-50">
              <div className="flex items-start gap-3 mb-3">
                <TrendingDown className="text-purple-600 flex-shrink-0" size={24} />
                <div>
                  <p className="text-sm font-medium text-purple-600">Best Overall</p>
                  <p className="text-2xl font-bold text-purple-900">{comparisonData.bestOverall}</p>
                </div>
              </div>
              <p className="text-xs text-purple-700">
                Best balance of safety, reliability & cost
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delay & Risk by Material */}
            <div className="card">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Delay & Risk by Material</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="material" angle={-45} textAnchor="end" height={80} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Delay (h)" fill="#ef4444" name="Delay Hours" />
                  <Bar yAxisId="right" dataKey="Risk %" fill="#f97316" name="Risk %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Cost vs Safety Scatter */}
            <div className="card">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Cost vs Safety Trade-off</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cost" name="Cost per Tonne (₹)" />
                  <YAxis dataKey="safety" name="Safety Score (%)" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter
                    name="Materials"
                    data={costVsSafetyData}
                    fill="#3b82f6"
                    shape="circle"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Comparison Table */}
          <div className="card">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Detailed Material Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-slate-900">Material</th>
                    <th className="px-4 py-2 text-left text-slate-900">Delay (h)</th>
                    <th className="px-4 py-2 text-left text-slate-900">Risk %</th>
                    <th className="px-4 py-2 text-left text-slate-900">Safety</th>
                    <th className="px-4 py-2 text-left text-slate-900">Reliability</th>
                    <th className="px-4 py-2 text-left text-slate-900">Cost/Tonne</th>
                    <th className="px-4 py-2 text-left text-slate-900">Total Cost</th>
                    <th className="px-4 py-2 text-left text-slate-900">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.materials
                    .sort((a, b) => b.compositeScore - a.compositeScore)
                    .map((mat, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-slate-200 ${
                          mat.material === comparisonData.bestOverall ? 'bg-purple-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-4 py-2 font-medium text-slate-900">
                          {mat.material}
                          {mat.material === comparisonData.bestOverall && (
                            <span className="ml-2 text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
                              Best
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-slate-600">{mat.delayHours}h</td>
                        <td className="px-4 py-2 text-slate-600">{(mat.probability * 100).toFixed(1)}%</td>
                        <td className="px-4 py-2 text-slate-600">{mat.safetyScore}%</td>
                        <td className="px-4 py-2 text-slate-600">{mat.reliability}%</td>
                        <td className="px-4 py-2 text-slate-600">₹{mat.costPerTonne}</td>
                        <td className="px-4 py-2 text-slate-600">₹{mat.totalCost.toLocaleString()}</td>
                        <td className="px-4 py-2 font-bold text-slate-900">{mat.compositeScore}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost Savings Analysis */}
          <div className="card bg-green-50 border border-green-200">
            <h3 className="font-bold text-green-900 mb-2">Cost Savings Analysis</h3>
            <p className="text-green-800">
              By choosing <strong>{comparisonData.mostCostEffective}</strong> over{' '}
              <strong>{comparisonData.safest}</strong>, you can save{' '}
              <strong>₹{Math.abs(comparisonData.costSavings).toLocaleString()}</strong> per shipment.
            </p>
            <p className="text-sm text-green-700 mt-2">
              However, <strong>{comparisonData.safest}</strong> offers better safety with lower delay risk.
              Choose based on your priority: cost vs. safety.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
