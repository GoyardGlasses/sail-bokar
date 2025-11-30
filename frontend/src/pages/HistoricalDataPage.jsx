import React, { useState, useMemo } from 'react'
import { Download, Upload, Filter, Search, TrendingUp, Calendar, MapPin, Package, DollarSign, AlertCircle, BarChart3, LineChart as LineChartIcon, Eye, TrendingDown, Zap } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ComposedChart, Area } from 'recharts'

// Realistic mock historical data
const generateHistoricalData = () => {
  const routes = ['bokaro-dhanbad', 'bokaro-hatia', 'bokaro-kolkata', 'bokaro-patna', 'bokaro-ranchi', 'bokaro-durgapur', 'bokaro-haldia']
  const materials = ['cr_coils', 'hr_coils', 'plates', 'wire_rods', 'tmt_bars', 'pig_iron', 'billets']
  const statuses = ['delivered', 'delayed', 'on-time', 'cancelled']
  
  const data = []
  const startDate = new Date('2023-01-01')
  
  for (let i = 0; i < 500; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    const route = routes[Math.floor(Math.random() * routes.length)]
    const material = materials[Math.floor(Math.random() * materials.length)]
    const tonnage = Math.floor(Math.random() * 100) + 10
    const plannedDays = Math.floor(Math.random() * 10) + 3
    const actualDays = plannedDays + Math.floor(Math.random() * 5) - 1
    const delayDays = Math.max(0, actualDays - plannedDays)
    const costPerTonne = Math.floor(Math.random() * 500) + 200
    const totalCost = tonnage * costPerTonne
    const weather = ['clear', 'rainy', 'foggy', 'stormy'][Math.floor(Math.random() * 4)]
    const trafficLevel = ['low', 'medium', 'high', 'very-high'][Math.floor(Math.random() * 4)]
    
    // Determine status based on delay
    let status = 'on-time'
    if (delayDays > 3) status = 'delayed'
    else if (delayDays === 0) status = 'on-time'
    else if (Math.random() > 0.95) status = 'cancelled'
    
    // Calculate risk based on multiple factors
    const routeRiskMap = {
      'bokaro-dhanbad': 85,
      'bokaro-hatia': 35,
      'bokaro-kolkata': 12,
      'bokaro-patna': 8,
      'bokaro-ranchi': 10,
      'bokaro-durgapur': 15,
      'bokaro-haldia': 25,
    }
    
    const materialRiskMap = {
      'cr_coils': 15,
      'hr_coils': 22,
      'plates': 28,
      'wire_rods': 18,
      'tmt_bars': 20,
      'pig_iron': 32,
      'billets': 19,
    }
    
    const baseRisk = (routeRiskMap[route] + materialRiskMap[material]) / 2
    const weatherRisk = weather === 'stormy' ? 20 : weather === 'rainy' ? 10 : 0
    const trafficRisk = trafficLevel === 'very-high' ? 15 : trafficLevel === 'high' ? 8 : 0
    const riskScore = Math.min(100, baseRisk + weatherRisk + trafficRisk)
    
    data.push({
      id: i + 1,
      date: date.toISOString().split('T')[0],
      route,
      material,
      tonnage,
      plannedDays,
      actualDays,
      delayDays,
      status,
      costPerTonne,
      totalCost,
      weather,
      trafficLevel,
      riskScore: Math.round(riskScore),
      accuracy: Math.round(Math.random() * 20 + 80), // 80-100% accuracy
    })
  }
  
  return data.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export default function HistoricalDataPage() {
  const [historicalData] = useState(generateHistoricalData())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRoute, setFilterRoute] = useState('all')
  const [filterMaterial, setFilterMaterial] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('table')
  const [selectedRoute, setSelectedRoute] = useState(null)

  // Filter data
  const filteredData = useMemo(() => {
    return historicalData.filter(item => {
      const matchesSearch = 
        item.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toString().includes(searchTerm)
      
      const matchesRoute = filterRoute === 'all' || item.route === filterRoute
      const matchesMaterial = filterMaterial === 'all' || item.material === filterMaterial
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus
      
      return matchesSearch && matchesRoute && matchesMaterial && matchesStatus
    })
  }, [searchTerm, filterRoute, filterMaterial, filterStatus, historicalData])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Statistics
  const stats = useMemo(() => {
    const total = historicalData.length
    const onTime = historicalData.filter(d => d.status === 'on-time').length
    const delayed = historicalData.filter(d => d.status === 'delayed').length
    const avgDelay = (historicalData.reduce((sum, d) => sum + d.delayDays, 0) / total).toFixed(2)
    const avgCost = (historicalData.reduce((sum, d) => sum + d.totalCost, 0) / total).toFixed(0)
    const avgAccuracy = (historicalData.reduce((sum, d) => sum + d.accuracy, 0) / total).toFixed(1)
    
    return { total, onTime, delayed, avgDelay, avgCost, avgAccuracy }
  }, [historicalData])

  // Time-series data for trend analysis
  const timeSeriesData = useMemo(() => {
    const grouped = {}
    historicalData.forEach(item => {
      const date = item.date.substring(0, 7) // YYYY-MM
      if (!grouped[date]) {
        grouped[date] = { date, count: 0, delayDays: 0, cost: 0, riskScore: 0, onTime: 0 }
      }
      grouped[date].count++
      grouped[date].delayDays += item.delayDays
      grouped[date].cost += item.totalCost
      grouped[date].riskScore += item.riskScore
      if (item.status === 'on-time') grouped[date].onTime++
    })
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date)).map(d => ({
      ...d,
      avgDelay: (d.delayDays / d.count).toFixed(1),
      avgCost: (d.cost / d.count).toFixed(0),
      avgRisk: (d.riskScore / d.count).toFixed(1),
      onTimeRate: ((d.onTime / d.count) * 100).toFixed(1)
    }))
  }, [historicalData])

  // Anomaly detection
  const anomalies = useMemo(() => {
    const avgDelay = stats.avgDelay
    return historicalData.filter(d => d.delayDays > avgDelay * 2).slice(0, 10)
  }, [historicalData, stats.avgDelay])

  // Route performance
  const routePerformance = useMemo(() => {
    const routes = {}
    historicalData.forEach(item => {
      if (!routes[item.route]) {
        routes[item.route] = { route: item.route, count: 0, delayDays: 0, cost: 0, riskScore: 0, onTime: 0 }
      }
      routes[item.route].count++
      routes[item.route].delayDays += item.delayDays
      routes[item.route].cost += item.totalCost
      routes[item.route].riskScore += item.riskScore
      if (item.status === 'on-time') routes[item.route].onTime++
    })
    return Object.values(routes).map(r => ({
      ...r,
      avgDelay: (r.delayDays / r.count).toFixed(1),
      avgCost: (r.cost / r.count).toFixed(0),
      avgRisk: (r.riskScore / r.count).toFixed(1),
      onTimeRate: ((r.onTime / r.count) * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count)
  }, [historicalData])

  const routes = ['bokaro-dhanbad', 'bokaro-hatia', 'bokaro-kolkata', 'bokaro-patna', 'bokaro-ranchi', 'bokaro-durgapur', 'bokaro-haldia']
  const materials = ['cr_coils', 'hr_coils', 'plates', 'wire_rods', 'tmt_bars', 'pig_iron', 'billets']

  const getStatusColor = (status) => {
    switch(status) {
      case 'on-time': return 'bg-green-100 text-green-800'
      case 'delayed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getRiskColor = (risk) => {
    if (risk < 20) return 'text-green-600'
    if (risk < 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">📊 Historical Data Repository</h1>
        <p className="text-slate-600">Complete record of all shipments, routes, and logistics operations with advanced analytics</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-300 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'table', label: 'Data Table', icon: BarChart3 },
          { id: 'trends', label: 'Trend Analysis', icon: LineChartIcon },
          { id: 'anomalies', label: 'Anomalies', icon: AlertCircle },
          { id: 'routes', label: 'Route Performance', icon: MapPin },
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Records</p>
              <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">On-Time</p>
              <p className="text-3xl font-bold text-green-600">{stats.onTime}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Delayed</p>
              <p className="text-3xl font-bold text-red-600">{stats.delayed}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Avg Delay</p>
              <p className="text-3xl font-bold text-slate-800">{stats.avgDelay}d</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Avg Cost</p>
              <p className="text-3xl font-bold text-slate-800">₹{stats.avgCost}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Avg Accuracy</p>
              <p className="text-3xl font-bold text-slate-800">{stats.avgAccuracy}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* TAB 1: DATA TABLE */}
      {activeTab === 'table' && (
        <>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-bold text-slate-800">Filters & Search</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Route, material, ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Route</label>
            <select
              value={filterRoute}
              onChange={(e) => {
                setFilterRoute(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Routes</option>
              {routes.map(route => (
                <option key={route} value={route}>{route}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Material</label>
            <select
              value={filterMaterial}
              onChange={(e) => {
                setFilterMaterial(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Materials</option>
              {materials.map(material => (
                <option key={material} value={material}>{material}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="on-time">On-Time</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Items/Page</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Route</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Material</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Tonnage</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Planned</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Actual</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Delay</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Cost</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Risk</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-sm text-slate-600">#{item.id}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{item.date}</td>
                  <td className="px-6 py-3 text-sm text-slate-700 font-medium">{item.route}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{item.material}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{item.tonnage}T</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{item.plannedDays}d</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{item.actualDays}d</td>
                  <td className="px-6 py-3 text-sm font-semibold text-red-600">{item.delayDays}d</td>
                  <td className="px-6 py-3 text-sm text-slate-600">₹{item.totalCost}</td>
                  <td className={`px-6 py-3 text-sm font-semibold ${getRiskColor(item.riskScore)}`}>{item.riskScore}%</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} records
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white'
                        : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-bold text-slate-800">Data Export</h2>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
            <Download size={18} />
            Export as CSV
          </button>
          <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
            <Download size={18} />
            Export as JSON
          </button>
          <button className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2">
            <Upload size={18} />
            Import Data
          </button>
        </div>
      </div>
        </>
      )}

      {/* TAB 2: TREND ANALYSIS */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">📈 Delay Trends Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="avgDelay" fill="#fecaca" stroke="#dc2626" name="Avg Delay (days)" />
                <Line type="monotone" dataKey="onTimeRate" stroke="#16a34a" strokeWidth={2} name="On-Time Rate (%)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">💰 Cost Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgCost" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">⚠️ Risk Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgRisk" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANOMALIES */}
      {activeTab === 'anomalies' && (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="text-red-600" size={24} />
              <h3 className="text-lg font-bold text-red-900">🚨 Detected Anomalies</h3>
            </div>
            <p className="text-sm text-red-700 mb-4">Found {anomalies.length} shipments with delays exceeding 2x average</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {anomalies.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Route</p>
                    <p className="font-semibold text-slate-900">{item.route}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Material</p>
                    <p className="font-semibold text-slate-900">{item.material}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Delay</p>
                    <p className="font-bold text-red-600">{item.delayDays} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Risk Score</p>
                    <p className={`font-bold ${getRiskColor(item.riskScore)}`}>{item.riskScore}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Date</p>
                    <p className="font-semibold text-slate-900">{item.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ROUTE PERFORMANCE */}
      {activeTab === 'routes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">🗺️ Route Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={routePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="onTimeRate" fill="#10b981" name="On-Time Rate (%)" />
                <Bar dataKey="avgDelay" fill="#ef4444" name="Avg Delay (days)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {routePerformance.map((route, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Route</p>
                    <p className="font-semibold text-slate-900">{route.route}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Shipments</p>
                    <p className="font-bold text-blue-600">{route.count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">On-Time Rate</p>
                    <p className={`font-bold ${route.onTimeRate > 80 ? 'text-green-600' : 'text-red-600'}`}>{route.onTimeRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Avg Delay</p>
                    <p className="font-semibold text-slate-900">{route.avgDelay}d</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Avg Cost</p>
                    <p className="font-semibold text-slate-900">₹{route.avgCost}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Avg Risk</p>
                    <p className={`font-bold ${getRiskColor(route.avgRisk)}`}>{route.avgRisk}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
