import React, { useState, useMemo, useEffect } from 'react'
import { Search, Filter, BarChart3, LineChart as LineChartIcon, TrendingUp, AlertCircle, Zap, DollarSign, Clock, Leaf } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Area, ScatterChart, Scatter } from 'recharts'
import { useMLPredictions } from '../context/MLPredictionsContext'
import { useImportedData } from '../hooks/useImportedData'
import InlineDataImport from '../features/dataImport/components/InlineDataImport'

// Generate mock rail vs road comparison data
const generateComparisonData = () => {
  const routes = [
    { route: 'Bokaro-Kolkata', distance: 450, railCost: 45000, roadCost: 52000, railTime: 8, roadTime: 12, railCO2: 120, roadCO2: 280 },
    { route: 'Bokaro-Mumbai', distance: 1200, railCost: 95000, roadCost: 135000, railTime: 24, roadTime: 36, railCO2: 280, roadCO2: 720 },
    { route: 'Bokaro-Delhi', distance: 900, railCost: 72000, roadCost: 98000, railTime: 18, roadTime: 28, railCO2: 210, roadCO2: 540 },
    { route: 'Bokaro-Chennai', distance: 1500, railCost: 120000, roadCost: 165000, railTime: 30, roadTime: 42, railCO2: 350, roadCO2: 900 },
    { route: 'Bokaro-Bangalore', distance: 1300, railCost: 104000, roadCost: 148000, railTime: 26, roadTime: 38, railCO2: 300, roadCO2: 840 },
    { route: 'Bokaro-Hyderabad', distance: 1100, railCost: 88000, roadCost: 125000, railTime: 22, roadTime: 32, railCO2: 260, roadCO2: 660 },
    { route: 'Bokaro-Pune', distance: 950, railCost: 76000, roadCost: 108000, railTime: 19, roadTime: 30, railCO2: 220, roadCO2: 570 },
    { route: 'Bokaro-Ahmedabad', distance: 1050, railCost: 84000, roadCost: 120000, railTime: 21, roadTime: 31, railCO2: 250, roadCO2: 630 },
  ]
  return routes
}

export default function RailVsRoadPage() {
  const { dataImported, getPrediction, lastUpdated } = useMLPredictions()
  const { data: importedData, isLoaded } = useImportedData()
  const [mlPredictions, setMlPredictions] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [baseComparisonData] = useState(generateComparisonData())
  const [activeTab, setActiveTab] = useState('table')

  const hasImportedOrders =
    isLoaded && importedData && Array.isArray(importedData.orders) && importedData.orders.length > 0

  const comparisonData = useMemo(() => {
    if (!hasImportedOrders) {
      return baseComparisonData
    }

    const routesMap = new Map()

    importedData.orders.forEach((order, index) => {
      if (!order) return

      const origin =
        order.origin ||
        order.source ||
        order.loadingPoint ||
        order.loading_point ||
        'Bokaro'

      const destination =
        order.destination ||
        order.dest ||
        order.unloadingPoint ||
        order.unloading_point ||
        order.customerLocation ||
        'Destination'

      const routeLabel =
        order.routeName || (origin && destination ? `${origin}-${destination}` : `Route ${index + 1}`)

      let distance = Number(
        order.distance ??
          order.routeDistance ??
          order.km ??
          order.distanceKm ??
          order.plannedDistance ??
          0
      )

      if (!Number.isFinite(distance) || distance <= 0) {
        distance = 400 + index * 80
      }

      const qty = Number(order.totalQuantity ?? order.quantity ?? order.qty ?? 0)

      let baseCost = Number(
        order.cost ??
          order.totalCost ??
          order.estimatedCost ??
          order.freight ??
          order.freightCost ??
          0
      )

      if ((!Number.isFinite(baseCost) || baseCost <= 0) && Number.isFinite(qty) && qty > 0) {
        baseCost = qty * 800
      }

      const existing = routesMap.get(routeLabel) || {
        route: routeLabel,
        totalDistance: 0,
        totalCost: 0,
        count: 0,
      }

      existing.totalDistance += distance
      existing.totalCost += baseCost
      existing.count += 1

      routesMap.set(routeLabel, existing)
    })

    const fromImported = Array.from(routesMap.values()).map((r, index) => {
      const avgDistance = r.count > 0 ? r.totalDistance / r.count : 400 + index * 80
      const railCost = r.totalCost > 0 ? r.totalCost : 60000 + index * 10000
      const roadCost = railCost * 1.25
      const railTime = Math.max(6, avgDistance / 50)
      const roadTime = railTime * 1.5
      const railCO2 = avgDistance * 0.3
      const roadCO2 = avgDistance * 0.7

      return {
        route: r.route,
        distance: Math.round(avgDistance),
        railCost: Math.round(railCost),
        roadCost: Math.round(roadCost),
        railTime: Math.round(railTime),
        roadTime: Math.round(roadTime),
        railCO2: Math.round(railCO2),
        roadCO2: Math.round(roadCO2),
      }
    })

    return fromImported.length ? fromImported : baseComparisonData
  }, [hasImportedOrders, importedData, baseComparisonData])

  // Keep ML route and cost optimization predictions in sync with latest pipeline outputs
  useEffect(() => {
    if (!getPrediction) return
    const predictions = {
      route: getPrediction('route_optimization'),
      cost: getPrediction('cost_optimization'),
    }
    setMlPredictions(predictions)
  }, [lastUpdated, getPrediction])

  // Filter data
  const filteredData = useMemo(() => {
    return comparisonData.filter(item =>
      item.route.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [comparisonData, searchTerm])

  // Cost comparison data
  const costData = useMemo(() => {
    return comparisonData.map(item => ({
      route: item.route.split('-')[1],
      Rail: item.railCost,
      Road: item.roadCost,
      savings: item.roadCost - item.railCost
    }))
  }, [comparisonData])

  // Time comparison data
  const timeData = useMemo(() => {
    return comparisonData.map(item => ({
      route: item.route.split('-')[1],
      Rail: item.railTime,
      Road: item.roadTime,
      timeSaved: item.roadTime - item.railTime
    }))
  }, [comparisonData])

  // Environmental impact
  const environmentalData = useMemo(() => {
    return comparisonData.map(item => ({
      route: item.route.split('-')[1],
      Rail: item.railCO2,
      Road: item.roadCO2,
      reduction: ((item.roadCO2 - item.railCO2) / item.roadCO2 * 100).toFixed(1)
    }))
  }, [comparisonData])

  // Efficiency scatter plot
  const efficiencyData = useMemo(() => {
    return comparisonData.map(item => ({
      route: item.route,
      costEfficiency: item.railCost / item.distance,
      timeEfficiency: item.railTime / item.distance,
      co2Efficiency: item.railCO2 / item.distance,
      mode: 'Rail'
    })).concat(
      comparisonData.map(item => ({
        route: item.route,
        costEfficiency: item.roadCost / item.distance,
        timeEfficiency: item.roadTime / item.distance,
        co2Efficiency: item.roadCO2 / item.distance,
        mode: 'Road'
      }))
    )
  }, [comparisonData])

  // Mode selection recommendation
  const recommendations = useMemo(() => {
    return comparisonData.map(item => {
      const costSavings = ((item.roadCost - item.railCost) / item.roadCost * 100).toFixed(1)
      const timeSavings = ((item.roadTime - item.railTime) / item.roadTime * 100).toFixed(1)
      const co2Reduction = ((item.roadCO2 - item.railCO2) / item.roadCO2 * 100).toFixed(1)
      
      let recommendation = 'Rail'
      let reason = []
      
      if (costSavings > 20) reason.push(`${costSavings}% cost savings`)
      if (co2Reduction > 50) reason.push(`${co2Reduction}% lower emissions`)
      if (item.distance > 800) reason.push('Long distance optimal')
      
      return {
        route: item.route,
        recommendation,
        reason: reason.join(' • '),
        costSavings,
        timeSavings,
        co2Reduction
      }
    })
  }, [comparisonData])

  const stats = useMemo(() => {
    if (!comparisonData || comparisonData.length === 0) {
      return {
        totalRailCost: 0,
        totalRoadCost: 0,
        totalRailCO2: 0,
        totalRoadCO2: 0,
        avgCostSavings: '0.0',
        avgCO2Reduction: '0.0',
      }
    }

    const totalRailCostBase = comparisonData.reduce(
      (sum, d) => sum + (Number(d.railCost) || 0),
      0
    )
    const totalRoadCost = comparisonData.reduce(
      (sum, d) => sum + (Number(d.roadCost) || 0),
      0
    )
    const totalRailCO2 = comparisonData.reduce(
      (sum, d) => sum + (Number(d.railCO2) || 0),
      0
    )
    const totalRoadCO2 = comparisonData.reduce(
      (sum, d) => sum + (Number(d.roadCO2) || 0),
      0
    )

    let totalRailCost = totalRailCostBase

    const costModel = mlPredictions.cost
    if (costModel && typeof costModel === 'object') {
      const mlSavings = Number(
        costModel.total_savings ??
          costModel.cost_savings ??
          costModel.savings ??
          costModel.estimated_savings ??
          0
      )
      if (Number.isFinite(mlSavings) && mlSavings > 0) {
        totalRailCost = Math.max(0, totalRailCost - mlSavings)
      }
    }

    const routeModel = mlPredictions.route
    if (routeModel && typeof routeModel === 'object') {
      const mlSavingPct = Number(
        routeModel.average_savings_pct ??
          routeModel.savings_pct ??
          routeModel.cost_reduction_pct ??
          routeModel.time_reduction_pct ??
          0
      )
      if (Number.isFinite(mlSavingPct) && mlSavingPct > 0 && mlSavingPct < 100) {
        totalRailCost = totalRailCost * (1 - mlSavingPct / 100)
      }
    }

    const avgCostSavings =
      totalRoadCost > 0
        ? (((totalRoadCost - totalRailCost) / totalRoadCost) * 100).toFixed(1)
        : '0.0'
    const avgCO2Reduction =
      totalRoadCO2 > 0
        ? (((totalRoadCO2 - totalRailCO2) / totalRoadCO2) * 100).toFixed(1)
        : '0.0'

    return { totalRailCost, totalRoadCost, totalRailCO2, totalRoadCO2, avgCostSavings, avgCO2Reduction }
  }, [comparisonData, mlPredictions])

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">🚂 Rail vs Road Analysis</h1>
        <p className="text-slate-600">Compare cost, time, and environmental impact of rail vs road transportation</p>
      </div>

      <InlineDataImport templateId="operations" />

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-300 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'table', label: 'Comparison Table', icon: BarChart3 },
          { id: 'cost', label: 'Cost Analysis', icon: DollarSign },
          { id: 'time', label: 'Time Comparison', icon: Clock },
          { id: 'environmental', label: 'Environmental Impact', icon: Leaf },
          { id: 'efficiency', label: 'Efficiency Metrics', icon: Zap },
          { id: 'recommendations', label: 'Recommendations', icon: TrendingUp },
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Total Routes</p>
          <p className="text-3xl font-bold text-slate-800">{comparisonData.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Avg Cost Savings (Rail)</p>
          <p className="text-3xl font-bold text-green-600">{stats.avgCostSavings}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Avg CO2 Reduction (Rail)</p>
          <p className="text-3xl font-bold text-blue-600">{stats.avgCO2Reduction}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Total Potential Savings</p>
          <p className="text-3xl font-bold text-purple-600">₹{((stats.totalRoadCost - stats.totalRailCost) / 100000).toFixed(1)}L</p>
        </div>
      </div>

      {/* TAB 1: COMPARISON TABLE */}
      {activeTab === 'table' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
              <Filter size={20} />
              Filter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Route</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Distance</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Rail Cost</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Road Cost</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Rail Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Road Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Rail CO2</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Road CO2</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, idx) => {
                  const costSavings = ((item.roadCost - item.railCost) / item.roadCost * 100).toFixed(1)
                  return (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-900">{item.route}</td>
                      <td className="py-3 px-4 text-slate-700">{item.distance} km</td>
                      <td className="py-3 px-4 text-slate-700">₹{(item.railCost / 1000).toFixed(0)}K</td>
                      <td className="py-3 px-4 text-slate-700">₹{(item.roadCost / 1000).toFixed(0)}K</td>
                      <td className="py-3 px-4 text-slate-700">{item.railTime}h</td>
                      <td className="py-3 px-4 text-slate-700">{item.roadTime}h</td>
                      <td className="py-3 px-4 text-slate-700">{item.railCO2} kg</td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">{item.roadCO2} kg</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COST ANALYSIS */}
      {activeTab === 'cost' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">💰 Cost Comparison by Route</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                <Legend />
                <Bar dataKey="Rail" fill="#3b82f6" name="Rail Cost" />
                <Bar dataKey="Road" fill="#ef4444" name="Road Cost" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {comparisonData.map((item, idx) => {
              const savings = item.roadCost - item.railCost
              const savingsPercent = ((savings / item.roadCost) * 100).toFixed(1)
              return (
                <div key={idx} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow border-l-4 border-green-500">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-slate-600">Route</p>
                      <p className="font-semibold text-slate-900">{item.route}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Rail Cost</p>
                      <p className="font-bold text-blue-600">₹{(item.railCost / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Road Cost</p>
                      <p className="font-bold text-red-600">₹{(item.roadCost / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Savings</p>
                      <p className="font-bold text-green-600">₹{(savings / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Savings %</p>
                      <p className="font-bold text-green-600">{savingsPercent}%</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TIME COMPARISON */}
      {activeTab === 'time' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">⏱️ Delivery Time Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" />
                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `${value}h`} />
                <Legend />
                <Bar dataKey="Rail" fill="#3b82f6" name="Rail Time" />
                <Bar dataKey="Road" fill="#f59e0b" name="Road Time" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Time Savings Analysis</h3>
            <div className="space-y-3">
              {comparisonData.map((item, idx) => {
                const timeDiff = item.roadTime - item.railTime
                const timeSavingsPercent = ((timeDiff / item.roadTime) * 100).toFixed(1)
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">{item.route}</p>
                      <p className="text-xs text-slate-600">Rail: {item.railTime}h | Road: {item.roadTime}h</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{timeDiff}h faster</p>
                      <p className="text-xs text-slate-600">{timeSavingsPercent}% reduction</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ENVIRONMENTAL IMPACT */}
      {activeTab === 'environmental' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">🌍 Carbon Emissions Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={environmentalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" />
                <YAxis label={{ value: 'CO2 (kg)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `${value} kg`} />
                <Legend />
                <Bar dataKey="Rail" fill="#10b981" name="Rail CO2" />
                <Bar dataKey="Road" fill="#ef4444" name="Road CO2" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-lg shadow p-6">
              <h4 className="font-bold text-green-900 mb-3">✓ Environmental Benefits of Rail</h4>
              <div className="space-y-2">
                <p className="text-sm text-green-800">• Average CO2 reduction: {stats.avgCO2Reduction}%</p>
                <p className="text-sm text-green-800">• Total CO2 saved: {(stats.totalRoadCO2 - stats.totalRailCO2).toFixed(0)} kg</p>
                <p className="text-sm text-green-800">• Equivalent to {((stats.totalRoadCO2 - stats.totalRailCO2) / 21).toFixed(0)} trees planted</p>
                <p className="text-sm text-green-800">• Rail is 60-70% more efficient than road</p>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg shadow p-6">
              <h4 className="font-bold text-orange-900 mb-3">⚠️ Road Transportation Impact</h4>
              <div className="space-y-2">
                <p className="text-sm text-orange-800">• Higher fuel consumption per tonne</p>
                <p className="text-sm text-orange-800">• Increased air pollution</p>
                <p className="text-sm text-orange-800">• Road wear and maintenance costs</p>
                <p className="text-sm text-orange-800">• Congestion and traffic delays</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EFFICIENCY METRICS */}
      {activeTab === 'efficiency' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">📈 Cost Efficiency (₹/km)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="costEfficiency" name="Cost per km (₹)" />
                <YAxis dataKey="co2Efficiency" name="CO2 per km (kg)" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Rail" data={efficiencyData.filter(d => d.mode === 'Rail')} fill="#3b82f6" />
                <Scatter name="Road" data={efficiencyData.filter(d => d.mode === 'Road')} fill="#ef4444" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg shadow p-4">
              <p className="text-sm text-blue-600 font-semibold">Rail Efficiency</p>
              <p className="text-2xl font-bold text-blue-900">Best</p>
              <p className="text-xs text-blue-700 mt-2">Lower cost per km, minimal emissions</p>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow p-4">
              <p className="text-sm text-yellow-600 font-semibold">Hybrid Approach</p>
              <p className="text-2xl font-bold text-yellow-900">Optimal</p>
              <p className="text-xs text-yellow-700 mt-2">Rail for long distances, road for last-mile</p>
            </div>
            <div className="bg-red-50 rounded-lg shadow p-4">
              <p className="text-sm text-red-600 font-semibold">Road Only</p>
              <p className="text-2xl font-bold text-red-900">Costly</p>
              <p className="text-xs text-red-700 mt-2">Higher costs and environmental impact</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-600">Route</p>
                  <p className="font-semibold text-slate-900">{rec.route}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Recommendation</p>
                  <p className="font-bold text-blue-600 text-lg">🚂 {rec.recommendation}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Cost Savings</p>
                  <p className="font-bold text-green-600">{rec.costSavings}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">CO2 Reduction</p>
                  <p className="font-bold text-green-600">{rec.co2Reduction}%</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-3">💡 {rec.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
