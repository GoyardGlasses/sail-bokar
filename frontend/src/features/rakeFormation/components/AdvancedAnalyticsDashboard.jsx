import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  PieChart,
  LineChart,
  Award,
} from 'lucide-react'

/**
 * Advanced Analytics Dashboard Component
 * Displays comprehensive analytics and KPIs
 */
export default function AdvancedAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('kpi')
  const [timeRange, setTimeRange] = useState('30days')
  const [kpis, setKpis] = useState([])
  const [routeAnalytics, setRouteAnalytics] = useState([])
  const [costAnalytics, setCostAnalytics] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAnalytics()
  }, [timeRange, activeTab])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Simulate loading analytics data
      await new Promise((resolve) => setTimeout(resolve, 500))

      setKpis([
        {
          name: 'On-Time Delivery',
          value: 96.5,
          target: 95,
          unit: '%',
          trend: 'up',
          change: 2.5,
        },
        {
          name: 'Cost per Tonne',
          value: 78,
          target: 85,
          unit: '₹',
          trend: 'down',
          change: -7,
        },
        {
          name: 'Rake Utilization',
          value: 91.2,
          target: 85,
          unit: '%',
          trend: 'up',
          change: 6.2,
        },
        {
          name: 'Empty Rakes',
          value: 2.1,
          target: 5,
          unit: '%',
          trend: 'down',
          change: -2.9,
        },
        {
          name: 'Customer Satisfaction',
          value: 4.7,
          target: 4.5,
          unit: '/5',
          trend: 'up',
          change: 0.2,
        },
        {
          name: 'NPS Score',
          value: 68,
          target: 60,
          unit: 'pts',
          trend: 'up',
          change: 8,
        },
      ])

      setRouteAnalytics([
        {
          route: 'Bokaro-Dhanbad',
          shipments: 45,
          avgCost: 750,
          onTime: 98,
          risk: 12,
        },
        {
          route: 'Bokaro-Kolkata',
          shipments: 38,
          avgCost: 1150,
          onTime: 94,
          risk: 18,
        },
        {
          route: 'Bokaro-Ranchi',
          shipments: 52,
          avgCost: 850,
          onTime: 97,
          risk: 8,
        },
        {
          route: 'Bokaro-Hatia',
          shipments: 35,
          avgCost: 920,
          onTime: 92,
          risk: 25,
        },
      ])

      setCostAnalytics({
        totalCost: 1450000,
        avgCostPerTonne: 78,
        breakdown: {
          Transport: 55,
          Loading: 15,
          Toll: 8,
          Insurance: 5,
          Handling: 7,
          Other: 10,
        },
        trend: -12,
        savings: 217500,
      })

      setRecommendations([
        {
          title: 'Optimize Low-Performing Routes',
          description: 'Routes Bokaro-Hatia and Bokaro-Kolkata have on-time % below 95%',
          impact: '5-10% improvement',
          priority: 'high',
        },
        {
          title: 'Reduce Empty Rakes',
          description: 'Implement better load consolidation to reduce empty rakes from 2.1% to <1%',
          impact: '₹50-100L annual savings',
          priority: 'high',
        },
        {
          title: 'Expand Cost Optimization',
          description: 'Current cost is 7% below target. Expand optimization to more routes.',
          impact: '5-8% additional savings',
          priority: 'medium',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend) => {
    return trend === 'up' ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />
    )
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Advanced Analytics Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive analytics and performance insights
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex gap-2">
          {[
            { id: 'kpi', label: 'KPIs' },
            { id: 'routes', label: 'Routes' },
            { id: 'costs', label: 'Costs' },
            { id: 'recommendations', label: 'Recommendations' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading analytics...</p>
          </div>
        ) : activeTab === 'kpi' ? (
          <KPIView kpis={kpis} getTrendIcon={getTrendIcon} />
        ) : activeTab === 'routes' ? (
          <RouteAnalyticsView routes={routeAnalytics} />
        ) : activeTab === 'costs' ? (
          <CostAnalyticsView cost={costAnalytics} />
        ) : (
          <RecommendationsView
            recommendations={recommendations}
            getPriorityColor={getPriorityColor}
          />
        )}
      </div>
    </div>
  )
}

/**
 * KPI View Component
 */
function KPIView({ kpis, getTrendIcon }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-blue-200 dark:border-gray-600"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {kpi.name}
            </h3>
            {getTrendIcon(kpi.trend)}
          </div>

          <div className="mb-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {kpi.value}
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                {kpi.unit}
              </span>
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Target: {kpi.target} {kpi.unit}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${Math.min(100, (kpi.value / kpi.target) * 100)}%` }}
              ></div>
            </div>
            <span
              className={`text-xs font-semibold ${
                kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {kpi.trend === 'up' ? '+' : ''}{kpi.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Route Analytics View
 */
function RouteAnalyticsView({ routes }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Route
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Shipments
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Avg Cost
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
              On-Time %
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Risk Score
            </th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                {route.route}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {route.shipments}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                ₹{route.avgCost}
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    route.onTime >= 95
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {route.onTime}%
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    route.risk < 15
                      ? 'bg-green-100 text-green-800'
                      : route.risk < 25
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {route.risk}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Cost Analytics View
 */
function CostAnalyticsView({ cost }) {
  if (!cost) return null

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Cost</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{(cost.totalCost / 100000).toFixed(1)}L
          </p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Cost/Tonne</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{cost.avgCostPerTonne}</p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Savings Achieved</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{(cost.savings / 100000).toFixed(1)}L
          </p>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Cost Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(cost.breakdown).map(([category, percentage]) => (
            <div key={category}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">{category}</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Cost Trend (vs last period)</span>
          <span className="text-lg font-bold text-green-600">{cost.trend}%</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Costs are decreasing - optimization working well
        </p>
      </div>
    </div>
  )
}

/**
 * Recommendations View
 */
function RecommendationsView({ recommendations, getPriorityColor }) {
  return (
    <div className="space-y-4">
      {recommendations.map((rec, idx) => (
        <div
          key={idx}
          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h3>
            <span className={`px-2 py-1 text-xs font-semibold rounded ${getPriorityColor(rec.priority)}`}>
              {rec.priority.toUpperCase()}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{rec.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-500">
              Expected Impact: {rec.impact}
            </span>
            <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
              View Details →
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
