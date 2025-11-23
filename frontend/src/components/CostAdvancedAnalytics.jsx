import React, { useState } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts'
import { TrendingUp, TrendingDown, AlertCircle, Zap, Target, Eye, Bell, FileText, Database, Brain } from 'lucide-react'

// ============ COST OPTIMIZATION & RECOMMENDATIONS ============
export function CostOptimization() {
  const [selectedRecommendation, setSelectedRecommendation] = useState(0)

  const recommendations = [
    {
      title: 'Switch to Route B',
      savings: '12%',
      amount: '₹114/ton',
      description: 'Kolkata to Jamshedpur via NH2 instead of NH6',
      impact: 'High',
      difficulty: 'Easy',
      timeframe: 'Immediate',
    },
    {
      title: 'Bulk Order Discount',
      savings: '8%',
      amount: '₹76/ton',
      description: 'Order 500+ tons to unlock supplier discount',
      impact: 'Medium',
      difficulty: 'Medium',
      timeframe: '1-2 weeks',
    },
    {
      title: 'Consolidate Shipments',
      savings: '15%',
      amount: '₹142/ton',
      description: 'Combine 3 small shipments into 1 large shipment',
      impact: 'High',
      difficulty: 'Medium',
      timeframe: '2-3 weeks',
    },
  ]

  const current = recommendations[selectedRecommendation]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Cost Optimization & Recommendations</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-sm text-slate-600 mb-4">Available Recommendations</p>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <button
                key={i}
                onClick={() => setSelectedRecommendation(i)}
                className={`w-full text-left p-3 rounded border-2 transition-all ${
                  selectedRecommendation === i
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="font-medium text-slate-900">{rec.title}</p>
                <p className="text-sm text-green-600 font-bold">{rec.savings} savings</p>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-4 bg-gradient-to-br from-green-50 to-emerald-50">
          <p className="text-sm text-slate-600 mb-3">Selected Recommendation</p>
          <div className="space-y-3">
            <div>
              <p className="text-2xl font-bold text-slate-900">{current.title}</p>
              <p className="text-sm text-slate-600 mt-1">{current.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded">
                <p className="text-xs text-slate-600">Potential Savings</p>
                <p className="text-lg font-bold text-green-600">{current.savings}</p>
              </div>
              <div className="bg-white p-2 rounded">
                <p className="text-xs text-slate-600">Per Tonne</p>
                <p className="text-lg font-bold text-slate-900">{current.amount}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2 rounded text-center">
                <p className="text-slate-600">Impact</p>
                <p className="font-bold text-slate-900">{current.impact}</p>
              </div>
              <div className="bg-white p-2 rounded text-center">
                <p className="text-slate-600">Difficulty</p>
                <p className="font-bold text-slate-900">{current.difficulty}</p>
              </div>
              <div className="bg-white p-2 rounded text-center">
                <p className="text-slate-600">Timeframe</p>
                <p className="font-bold text-slate-900">{current.timeframe}</p>
              </div>
            </div>
            <button className="w-full btn btn-primary btn-sm">Implement Recommendation</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ COST FORECASTING & TRENDS ============
export function CostForecastingTrends() {
  const forecastData = [
    { month: 'Jan', actual: 950, forecast: 945, trend: 'stable' },
    { month: 'Feb', actual: 960, forecast: 955, trend: 'up' },
    { month: 'Mar', actual: 970, forecast: 975, trend: 'up' },
    { month: 'Apr', actual: 965, forecast: 980, trend: 'down' },
    { month: 'May', actual: 985, forecast: 990, trend: 'up' },
    { month: 'Jun', actual: 1000, forecast: 1005, trend: 'up' },
  ]

  const volatility = 8.5
  const elasticity = -0.65

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Cost Forecasting & Trends</h3>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={forecastData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(v) => `₹${Math.round(v)}`} />
          <Legend />
          <Area type="monotone" dataKey="forecast" fill="#e0e7ff" stroke="none" opacity={0.3} name="Forecast Range" />
          <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual Cost" />
          <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-sm text-slate-600 mb-2">Cost Volatility Index</p>
          <p className="text-3xl font-bold text-orange-600">{volatility}%</p>
          <p className="text-xs text-slate-600 mt-2">Moderate volatility detected</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-600 mb-2">Price Elasticity</p>
          <p className="text-3xl font-bold text-slate-900">{elasticity}</p>
          <p className="text-xs text-slate-600 mt-2">Elastic demand (sensitive to price)</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-600 mb-2">Trend Direction</p>
          <div className="flex items-center gap-2">
            <TrendingUp size={24} className="text-red-600" />
            <div>
              <p className="text-lg font-bold text-slate-900">Upward</p>
              <p className="text-xs text-slate-600">+5.3% next month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ SCENARIO PLANNING ============
export function ScenarioPlanning() {
  const [scenarios] = useState([
    { name: 'Base Case', fuelPrice: 100, distance: 500, demurrage: 50, cost: 950 },
    { name: 'Optimistic', fuelPrice: 85, distance: 450, demurrage: 30, cost: 780 },
    { name: 'Pessimistic', fuelPrice: 120, distance: 550, demurrage: 70, cost: 1150 },
  ])

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Scenario Planning & What-If Analysis</h3>

      <div className="card p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-3 py-2 text-left font-bold">Scenario</th>
              <th className="px-3 py-2 text-right font-bold">Fuel Price</th>
              <th className="px-3 py-2 text-right font-bold">Distance</th>
              <th className="px-3 py-2 text-right font-bold">Demurrage</th>
              <th className="px-3 py-2 text-right font-bold">Total Cost</th>
              <th className="px-3 py-2 text-right font-bold">vs Base</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s, i) => (
              <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-3 py-2 font-medium text-slate-900">{s.name}</td>
                <td className="px-3 py-2 text-right text-slate-600">₹{s.fuelPrice}</td>
                <td className="px-3 py-2 text-right text-slate-600">{s.distance}km</td>
                <td className="px-3 py-2 text-right text-slate-600">₹{s.demurrage}</td>
                <td className="px-3 py-2 text-right font-bold text-slate-900">₹{s.cost}</td>
                <td className={`px-3 py-2 text-right font-bold ${s.cost < scenarios[0].cost ? 'text-green-600' : 'text-red-600'}`}>
                  {s.cost < scenarios[0].cost ? '-' : '+'}{Math.abs(s.cost - scenarios[0].cost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============ BENCHMARKING & COMPARISON ============
export function Benchmarking() {
  const benchmarkData = [
    { category: 'Your Cost', value: 950, color: '#3b82f6' },
    { category: 'Industry Avg', value: 920, color: '#10b981' },
    { category: 'Best in Class', value: 850, color: '#f59e0b' },
    { category: 'Competitor A', value: 980, color: '#ef4444' },
    { category: 'Competitor B', value: 910, color: '#8b5cf6' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Benchmarking & Comparison</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={benchmarkData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip formatter={(v) => `₹${Math.round(v)}`} />
          <Bar dataKey="value" fill="#3b82f6">
            {benchmarkData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 bg-red-50">
          <p className="text-sm text-slate-600 mb-2">Your Performance</p>
          <p className="text-2xl font-bold text-red-600">3.3% Above Average</p>
          <p className="text-xs text-slate-600 mt-2">Room for improvement</p>
        </div>
        <div className="card p-4 bg-blue-50">
          <p className="text-sm text-slate-600 mb-2">Gap to Best</p>
          <p className="text-2xl font-bold text-blue-600">₹100/ton</p>
          <p className="text-xs text-slate-600 mt-2">10.5% difference</p>
        </div>
        <div className="card p-4 bg-green-50">
          <p className="text-sm text-slate-600 mb-2">Rank</p>
          <p className="text-2xl font-bold text-green-600">3rd of 5</p>
          <p className="text-xs text-slate-600 mt-2">Mid-tier performer</p>
        </div>
      </div>
    </div>
  )
}

// ============ COST ALLOCATION & BREAKDOWN ============
export function CostAllocation() {
  const allocationData = [
    { name: 'Transportation', value: 45, color: '#3b82f6' },
    { name: 'Fuel', value: 25, color: '#10b981' },
    { name: 'Handling', value: 15, color: '#f59e0b' },
    { name: 'Demurrage', value: 10, color: '#ef4444' },
    { name: 'Other', value: 5, color: '#8b5cf6' },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Cost Allocation & Breakdown</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={allocationData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name} ${value}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {allocationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${v}%`} />
          </PieChart>
        </ResponsiveContainer>

        <div className="space-y-2">
          {allocationData.map((item, i) => (
            <div key={i} className="card p-3">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium text-slate-900">{item.name}</p>
                <p className="font-bold text-slate-900">{item.value}%</p>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full" style={{ width: `${item.value}%`, backgroundColor: item.color }}></div>
              </div>
              <p className="text-xs text-slate-600 mt-1">₹{Math.round(950 * item.value / 100)}/ton</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
