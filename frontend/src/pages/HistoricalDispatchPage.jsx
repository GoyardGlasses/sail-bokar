import React, { useState, useMemo } from 'react'
import { Search, Filter, MapPin, Truck, Package, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, TrendingUp, Navigation, Zap, Users, Gauge, BarChart3, LineChart as LineChartIcon, Award, Fuel } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Area } from 'recharts'

// Generate realistic mock dispatch data
const generateDispatchData = () => {
  const routes = ['bokaro-dhanbad', 'bokaro-hatia', 'bokaro-kolkata', 'bokaro-patna', 'bokaro-ranchi', 'bokaro-durgapur', 'bokaro-haldia']
  const materials = ['cr_coils', 'hr_coils', 'plates', 'wire_rods', 'tmt_bars', 'pig_iron', 'billets']
  const vehicles = ['Truck-001', 'Truck-002', 'Truck-003', 'Truck-004', 'Truck-005', 'Truck-006', 'Truck-007', 'Truck-008', 'Truck-009', 'Truck-010']
  const drivers = ['Driver Rajesh', 'Driver Amit', 'Driver Priya', 'Driver Vikram', 'Driver Neha', 'Driver Arjun', 'Driver Deepak', 'Driver Sanjay']
  const reasons = [
    'Optimal cost-time balance',
    'Lowest cost route',
    'Fastest delivery',
    'Safest route',
    'Weather conditions',
    'Traffic avoidance',
    'Customer preference',
    'Fuel efficiency',
    'Vehicle availability',
    'Driver expertise',
    'Toll optimization',
    'Regulatory compliance',
  ]
  const statuses = ['delivered', 'in-transit', 'delayed', 'diverted', 'completed']
  const dispatchTypes = ['standard', 'express', 'economy', 'premium', 'emergency']

  const data = []
  const startDate = new Date('2023-01-01')

  for (let i = 0; i < 400; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)

    const route = routes[Math.floor(Math.random() * routes.length)]
    const material = materials[Math.floor(Math.random() * materials.length)]
    const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)]
    const driver = drivers[Math.floor(Math.random() * drivers.length)]
    const reason = reasons[Math.floor(Math.random() * reasons.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const dispatchType = dispatchTypes[Math.floor(Math.random() * dispatchTypes.length)]

    const tonnage = Math.floor(Math.random() * 100) + 10
    const orderId = `ORD-${String(i + 1000).slice(-4)}`
    const customerId = `CUST-${String(Math.floor(Math.random() * 500) + 1).padStart(3, '0')}`
    const customerName = ['Tata Steel', 'JSW Steel', 'SAIL', 'Essar Steel', 'ArcelorMittal', 'NMDC', 'Jindal Steel'][Math.floor(Math.random() * 7)]

    // Route details
    const routeDistances = {
      'bokaro-dhanbad': 85,
      'bokaro-hatia': 120,
      'bokaro-kolkata': 180,
      'bokaro-patna': 150,
      'bokaro-ranchi': 95,
      'bokaro-durgapur': 110,
      'bokaro-haldia': 220,
    }

    const distance = routeDistances[route]
    const plannedDays = Math.ceil(distance / 50)
    const actualDays = plannedDays + Math.floor(Math.random() * 4) - 1
    const delayDays = Math.max(0, actualDays - plannedDays)

    // Cost calculation
    const baseCost = distance * 5
    const materialCost = tonnage * (Math.random() * 100 + 50)
    const totalCost = baseCost + materialCost
    const costOptimization = Math.floor(Math.random() * 30) - 10 // -10% to +20%

    // Dispatch details
    const dispatchTime = `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
    const expectedDelivery = new Date(date)
    expectedDelivery.setDate(expectedDelivery.getDate() + plannedDays)
    const actualDelivery = new Date(date)
    actualDelivery.setDate(actualDelivery.getDate() + actualDays)

    // Waypoints
    const waypoints = [
      'Bokaro (Start)',
      `${route.split('-')[1].charAt(0).toUpperCase() + route.split('-')[1].slice(1)} (End)`,
    ]

    // Stops
    const numStops = Math.floor(Math.random() * 3) + 1
    const stops = []
    for (let j = 0; j < numStops; j++) {
      stops.push({
        location: ['Dhanbad Checkpoint', 'Ranchi Hub', 'Patna Station', 'Kolkata Port', 'Durgapur Center'][Math.floor(Math.random() * 5)],
        time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        reason: ['Fuel refill', 'Driver rest', 'Toll plaza', 'Inspection', 'Load verification'][Math.floor(Math.random() * 5)],
      })
    }

    // Incidents
    const incidents = []
    if (Math.random() > 0.8) {
      incidents.push({
        type: ['Traffic delay', 'Weather issue', 'Vehicle breakdown', 'Documentation delay'][Math.floor(Math.random() * 4)],
        duration: Math.floor(Math.random() * 8) + 1,
        resolved: Math.random() > 0.3,
      })
    }

    // Quality metrics
    const temperatureVariation = Math.floor(Math.random() * 5) - 2
    const humidityVariation = Math.floor(Math.random() * 10) - 5
    const damagePercentage = Math.random() > 0.95 ? Math.floor(Math.random() * 5) + 1 : 0
    const qualityScore = Math.max(0, 100 - damagePercentage - Math.abs(temperatureVariation) - Math.abs(humidityVariation))

    // Fuel metrics
    const fuelConsumed = (distance / 5) + Math.floor(Math.random() * 10)
    const fuelCost = fuelConsumed * 85

    // Customer satisfaction
    const satisfaction = Math.floor(Math.random() * 40) + 60 // 60-100%

    data.push({
      id: i + 1,
      orderId,
      customerId,
      customerName,
      date: date.toISOString().split('T')[0],
      dispatchTime,
      route,
      material,
      tonnage,
      vehicle,
      driver,
      reason,
      status,
      dispatchType,
      distance,
      plannedDays,
      actualDays,
      delayDays,
      expectedDelivery: expectedDelivery.toISOString().split('T')[0],
      actualDelivery: actualDelivery.toISOString().split('T')[0],
      totalCost,
      costOptimization,
      fuelConsumed,
      fuelCost,
      waypoints,
      stops,
      incidents,
      temperatureVariation,
      humidityVariation,
      damagePercentage,
      qualityScore,
      satisfaction,
      notes: `Order dispatched via ${route} using ${vehicle}. Driver: ${driver}. Reason: ${reason}. Status: ${status}.`,
    })
  }

  return data.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export default function HistoricalDispatchPage() {
  const [dispatchData] = useState(generateDispatchData())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRoute, setFilterRoute] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDispatchType, setFilterDispatchType] = useState('all')
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedId, setExpandedId] = useState(null)
  const [activeTab, setActiveTab] = useState('table')

  // Filter data
  const filteredData = useMemo(() => {
    return dispatchData.filter(item => {
      const matchesSearch =
        item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.driver.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRoute = filterRoute === 'all' || item.route === filterRoute
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus
      const matchesDispatchType = filterDispatchType === 'all' || item.dispatchType === filterDispatchType

      return matchesSearch && matchesRoute && matchesStatus && matchesDispatchType
    })
  }, [searchTerm, filterRoute, filterStatus, filterDispatchType, dispatchData])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Statistics
  const stats = useMemo(() => {
    const total = dispatchData.length
    const delivered = dispatchData.filter(d => d.status === 'delivered').length
    const delayed = dispatchData.filter(d => d.delayDays > 0).length
    const avgDelay = (dispatchData.reduce((sum, d) => sum + d.delayDays, 0) / total).toFixed(2)
    const totalFuelConsumed = dispatchData.reduce((sum, d) => sum + d.fuelConsumed, 0).toFixed(0)
    const avgQuality = (dispatchData.reduce((sum, d) => sum + d.qualityScore, 0) / total).toFixed(1)
    const avgSatisfaction = (dispatchData.reduce((sum, d) => sum + d.satisfaction, 0) / total).toFixed(1)

    return { total, delivered, delayed, avgDelay, totalFuelConsumed, avgQuality, avgSatisfaction }
  }, [dispatchData])

  // Route performance
  const routePerformance = useMemo(() => {
    const routes = {}
    dispatchData.forEach(d => {
      if (!routes[d.route]) {
        routes[d.route] = { route: d.route, count: 0, delayDays: 0, avgQuality: 0, avgSatisfaction: 0, totalCost: 0 }
      }
      routes[d.route].count++
      routes[d.route].delayDays += d.delayDays
      routes[d.route].avgQuality += d.qualityScore
      routes[d.route].avgSatisfaction += d.satisfaction
      routes[d.route].totalCost += d.totalCost
    })
    return Object.values(routes).map(r => ({
      ...r,
      avgDelay: (r.delayDays / r.count).toFixed(1),
      avgQuality: (r.avgQuality / r.count).toFixed(1),
      avgSatisfaction: (r.avgSatisfaction / r.count).toFixed(1),
      avgCost: (r.totalCost / r.count).toFixed(0)
    })).sort((a, b) => b.count - a.count)
  }, [dispatchData])

  // Driver performance
  const driverPerformance = useMemo(() => {
    const drivers = {}
    dispatchData.forEach(d => {
      if (!drivers[d.driver]) {
        drivers[d.driver] = { driver: d.driver, count: 0, delayDays: 0, avgQuality: 0, avgSatisfaction: 0, incidents: 0 }
      }
      drivers[d.driver].count++
      drivers[d.driver].delayDays += d.delayDays
      drivers[d.driver].avgQuality += d.qualityScore
      drivers[d.driver].avgSatisfaction += d.satisfaction
      if (d.incidents.length > 0) drivers[d.driver].incidents++
    })
    return Object.values(drivers).map(d => ({
      ...d,
      avgDelay: (d.delayDays / d.count).toFixed(1),
      avgQuality: (d.avgQuality / d.count).toFixed(1),
      avgSatisfaction: (d.avgSatisfaction / d.count).toFixed(1),
      incidentRate: ((d.incidents / d.count) * 100).toFixed(1)
    })).sort((a, b) => b.avgSatisfaction - a.avgSatisfaction)
  }, [dispatchData])

  // Dispatch type analysis
  const dispatchTypeAnalysis = useMemo(() => {
    const types = {}
    dispatchData.forEach(d => {
      if (!types[d.dispatchType]) {
        types[d.dispatchType] = { type: d.dispatchType, count: 0, avgCost: 0, avgTime: 0, avgQuality: 0 }
      }
      types[d.dispatchType].count++
      types[d.dispatchType].avgCost += d.totalCost
      types[d.dispatchType].avgTime += d.actualDays
      types[d.dispatchType].avgQuality += d.qualityScore
    })
    return Object.values(types).map(t => ({
      ...t,
      avgCost: (t.avgCost / t.count).toFixed(0),
      avgTime: (t.avgTime / t.count).toFixed(1),
      avgQuality: (t.avgQuality / t.count).toFixed(1)
    }))
  }, [dispatchData])

  const routes = [...new Set(dispatchData.map(d => d.route))]
  const statuses = ['delivered', 'in-transit', 'delayed', 'diverted', 'completed']
  const dispatchTypes = ['standard', 'express', 'economy', 'premium', 'emergency']

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'in-transit': return 'bg-blue-100 text-blue-800'
      case 'delayed': return 'bg-red-100 text-red-800'
      case 'diverted': return 'bg-orange-100 text-orange-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDispatchTypeColor = (type) => {
    switch(type) {
      case 'express': return 'bg-red-50 border-red-300'
      case 'premium': return 'bg-purple-50 border-purple-300'
      case 'economy': return 'bg-green-50 border-green-300'
      case 'emergency': return 'bg-orange-50 border-orange-300'
      default: return 'bg-blue-50 border-blue-300'
    }
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">🚚 Historical Dispatch & Routes</h1>
        <p className="text-slate-600">Complete record of all dispatches with advanced analytics and performance tracking</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-300 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'table', label: 'Dispatch Records', icon: BarChart3 },
          { id: 'routes', label: 'Route Performance', icon: MapPin },
          { id: 'drivers', label: 'Driver Performance', icon: Award },
          { id: 'types', label: 'Dispatch Types', icon: LineChartIcon },
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Dispatches</p>
              <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <Truck className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Delivered</p>
              <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
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
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Fuel Used</p>
              <p className="text-3xl font-bold text-slate-800">{stats.totalFuelConsumed}L</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Avg Quality</p>
              <p className="text-3xl font-bold text-slate-800">{stats.avgQuality}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Satisfaction</p>
              <p className="text-3xl font-bold text-slate-800">{stats.avgSatisfaction}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-pink-500" />
          </div>
        </div>
      </div>

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
                placeholder="Order, Customer, Route..."
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
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Dispatch Type</label>
            <select
              value={filterDispatchType}
              onChange={(e) => {
                setFilterDispatchType(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {dispatchTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
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
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dispatch Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {paginatedData.map((dispatch, idx) => (
          <div key={idx} className={`rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all hover:shadow-xl border-l-4 ${getDispatchTypeColor(dispatch.dispatchType)}`}>
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(dispatch.status)}`}>
                      {dispatch.status}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {dispatch.dispatchType.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{dispatch.orderId}</h3>
                  <p className="text-sm text-slate-600">{dispatch.customerName}</p>
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === dispatch.id ? null : dispatch.id)}
                  className="text-blue-500 hover:text-blue-700 font-bold text-lg"
                >
                  {expandedId === dispatch.id ? '−' : '+'}
                </button>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-600">Route</p>
                    <p className="text-sm font-semibold text-slate-800">{dispatch.route}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-xs text-slate-600">Vehicle</p>
                    <p className="text-sm font-semibold text-slate-800">{dispatch.vehicle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-slate-600">Driver</p>
                    <p className="text-sm font-semibold text-slate-800">{dispatch.driver}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-xs text-slate-600">Tonnage</p>
                    <p className="text-sm font-semibold text-slate-800">{dispatch.tonnage}T</p>
                  </div>
                </div>
              </div>

              {/* Reason & Dates */}
              <div className="mb-4">
                <p className="text-xs text-slate-600 mb-1">Reason for Route Selection:</p>
                <p className="text-sm font-semibold text-blue-600 bg-blue-50 p-2 rounded">{dispatch.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div>
                  <p className="text-xs text-slate-600">Dispatch Date</p>
                  <p className="font-semibold text-slate-800">{dispatch.date}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Dispatch Time</p>
                  <p className="font-semibold text-slate-800">{dispatch.dispatchTime}</p>
                </div>
              </div>

              {/* Delivery Timeline */}
              <div className="bg-slate-50 p-3 rounded mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="text-xs text-slate-600">Expected Delivery</p>
                    <p className="text-sm font-semibold text-slate-800">{dispatch.expectedDelivery}</p>
                  </div>
                  <Navigation className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-600">Actual Delivery</p>
                    <p className={`text-sm font-semibold ${dispatch.delayDays > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {dispatch.actualDelivery}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Planned: {dispatch.plannedDays}d</span>
                  <span className="text-slate-600">Actual: {dispatch.actualDays}d</span>
                  <span className={dispatch.delayDays > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                    Delay: {dispatch.delayDays}d
                  </span>
                </div>
              </div>

              {/* Cost & Quality */}
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-green-50 p-2 rounded">
                  <p className="text-xs text-slate-600">Total Cost</p>
                  <p className="font-semibold text-slate-800">₹{dispatch.totalCost.toFixed(0)}</p>
                </div>
                <div className={`p-2 rounded ${dispatch.costOptimization < 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
                  <p className="text-xs text-slate-600">Cost Optimization</p>
                  <p className={`font-semibold ${dispatch.costOptimization < 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {dispatch.costOptimization > 0 ? '+' : ''}{dispatch.costOptimization}%
                  </p>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === dispatch.id && (
                <div className="border-t border-slate-200 pt-4 space-y-4">
                  {/* Quality Metrics */}
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm font-semibold text-slate-800 mb-2">Quality Metrics:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-slate-600">Quality Score</p>
                        <p className="font-semibold text-slate-800">{dispatch.qualityScore}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Damage</p>
                        <p className={`font-semibold ${dispatch.damagePercentage > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {dispatch.damagePercentage}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Temperature Var.</p>
                        <p className="font-semibold text-slate-800">{dispatch.temperatureVariation}°C</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Humidity Var.</p>
                        <p className="font-semibold text-slate-800">{dispatch.humidityVariation}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Fuel Metrics */}
                  <div className="bg-yellow-50 p-3 rounded">
                    <p className="text-sm font-semibold text-slate-800 mb-2">Fuel Metrics:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-slate-600">Fuel Consumed</p>
                        <p className="font-semibold text-slate-800">{dispatch.fuelConsumed.toFixed(1)}L</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Fuel Cost</p>
                        <p className="font-semibold text-slate-800">₹{dispatch.fuelCost.toFixed(0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Distance</p>
                        <p className="font-semibold text-slate-800">{dispatch.distance}km</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Mileage</p>
                        <p className="font-semibold text-slate-800">{(dispatch.distance / dispatch.fuelConsumed).toFixed(2)}km/L</p>
                      </div>
                    </div>
                  </div>

                  {/* Stops */}
                  {dispatch.stops.length > 0 && (
                    <div className="bg-purple-50 p-3 rounded">
                      <p className="text-sm font-semibold text-slate-800 mb-2">Stops ({dispatch.stops.length}):</p>
                      <div className="space-y-2">
                        {dispatch.stops.map((stop, i) => (
                          <div key={i} className="text-sm bg-white p-2 rounded border border-purple-200">
                            <p className="font-semibold text-slate-800">{stop.location}</p>
                            <p className="text-xs text-slate-600">Time: {stop.time} | Reason: {stop.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Incidents */}
                  {dispatch.incidents.length > 0 && (
                    <div className="bg-red-50 p-3 rounded">
                      <p className="text-sm font-semibold text-slate-800 mb-2">Incidents ({dispatch.incidents.length}):</p>
                      <div className="space-y-2">
                        {dispatch.incidents.map((incident, i) => (
                          <div key={i} className="text-sm bg-white p-2 rounded border border-red-200">
                            <p className="font-semibold text-red-600">{incident.type}</p>
                            <p className="text-xs text-slate-600">Duration: {incident.duration}h | Status: {incident.resolved ? 'Resolved' : 'Pending'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer Satisfaction */}
                  <div className="bg-pink-50 p-3 rounded">
                    <p className="text-sm font-semibold text-slate-800 mb-2">Customer Satisfaction:</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-pink-500 h-2 rounded-full"
                          style={{ width: `${dispatch.satisfaction}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{dispatch.satisfaction}%</span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="bg-slate-100 p-3 rounded">
                    <p className="text-xs text-slate-600 mb-1">Notes:</p>
                    <p className="text-sm text-slate-800">{dispatch.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow px-6 py-4 flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} dispatches
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
  )
}
