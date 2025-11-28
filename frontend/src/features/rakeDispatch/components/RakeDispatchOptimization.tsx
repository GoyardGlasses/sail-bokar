import React, { useState, useEffect } from 'react'
import {
  Truck,
  AlertCircle,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Zap,
  BarChart3,
  Package,
  Route,
  Calendar,
  Users,
} from 'lucide-react'

interface Rake {
  id: string
  name: string
  capacity: number
  currentLoad: number
  destination: string
  status: 'available' | 'in-transit' | 'scheduled' | 'maintenance'
  eta?: string
  cost: number
  utilization: number
  lastLocation?: string
  progress?: number
}

interface Order {
  id: string
  product: string
  quantity: number
  destination: string
  priority: 'high' | 'medium' | 'low'
  deadline: string
  customer: string
  status: 'pending' | 'assigned' | 'dispatched' | 'delivered'
}

interface DispatchPlan {
  rakeId: string
  rakeName: string
  orders: Order[]
  totalLoad: number
  utilization: number
  cost: number
  costPerTonne: number
  eta: string
  dispatchTime: string
  backload?: {
    quantity: number
    source: string
    revenue: number
  }
}

const mockRakes: Rake[] = [
  {
    id: 'rk-001',
    name: 'BOKARO-001',
    capacity: 1200,
    currentLoad: 1200,
    destination: 'Jamshedpur',
    status: 'scheduled',
    utilization: 100,
    cost: 150000,
    eta: '2h',
  },
  {
    id: 'rk-002',
    name: 'BOKARO-002',
    capacity: 1200,
    currentLoad: 936,
    destination: 'Jamshedpur',
    status: 'scheduled',
    utilization: 78,
    cost: 138000,
    eta: '4h',
  },
  {
    id: 'rk-003',
    name: 'BOKARO-003',
    capacity: 1100,
    currentLoad: 1100,
    destination: 'Durgapur',
    status: 'scheduled',
    utilization: 100,
    cost: 125000,
    eta: '6h',
    backload: { quantity: 500, source: 'Durgapur', revenue: 75000 },
  },
  {
    id: 'rk-004',
    name: 'BOKARO-004',
    capacity: 1200,
    currentLoad: 400,
    destination: 'Bellary',
    status: 'scheduled',
    utilization: 33,
    cost: 185000,
    eta: '24h',
  },
  {
    id: 'rk-005',
    name: 'BOKARO-005',
    capacity: 1200,
    currentLoad: 1020,
    destination: 'Jamshedpur',
    status: 'in-transit',
    utilization: 85,
    cost: 150000,
    eta: '8h',
    lastLocation: '120 km from Bokaro',
    progress: 37.5,
  },
]

const mockOrders: Order[] = [
  {
    id: 'ord-001',
    product: 'Iron Ore',
    quantity: 1200,
    destination: 'Jamshedpur',
    priority: 'high',
    deadline: '2025-11-26',
    customer: 'Tata Steel',
    status: 'assigned',
  },
  {
    id: 'ord-002',
    product: 'Coking Coal',
    quantity: 800,
    destination: 'Jamshedpur',
    priority: 'high',
    deadline: '2025-11-27',
    customer: 'JSW Steel',
    status: 'assigned',
  },
  {
    id: 'ord-003',
    product: 'Limestone',
    quantity: 600,
    destination: 'Durgapur',
    priority: 'medium',
    deadline: '2025-11-29',
    customer: 'SAIL Durgapur',
    status: 'assigned',
  },
]

export default function RakeDispatchOptimization() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'dispatch' | 'tracking' | 'analytics'>('dashboard')
  const [rakes, setRakes] = useState<Rake[]>(mockRakes)
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [dispatchPlans, setDispatchPlans] = useState<DispatchPlan[]>([])

  useEffect(() => {
    // Calculate dispatch plans
    const plans: DispatchPlan[] = rakes
      .filter(r => r.status === 'scheduled')
      .map(rake => ({
        rakeId: rake.id,
        rakeName: rake.name,
        orders: orders.filter(o => o.destination === rake.destination && o.status === 'assigned'),
        totalLoad: rake.currentLoad,
        utilization: rake.utilization,
        cost: rake.cost,
        costPerTonne: rake.cost / (rake.currentLoad || 1),
        eta: rake.eta || '0h',
        dispatchTime: new Date(Date.now() + parseInt(rake.eta || '0') * 3600000).toLocaleTimeString(),
        backload: rake.backload,
      }))
    setDispatchPlans(plans)
  }, [rakes, orders])

  const totalCapacity = rakes.reduce((sum, r) => sum + r.capacity, 0)
  const totalLoad = rakes.reduce((sum, r) => sum + r.currentLoad, 0)
  const avgUtilization = Math.round((totalLoad / totalCapacity) * 100)
  const emptyRakes = rakes.filter(r => r.currentLoad === 0).length
  const totalCost = rakes.reduce((sum, r) => sum + r.cost, 0)
  const backloadRevenue = rakes.reduce((sum, r) => sum + (r.backload?.revenue || 0), 0)
  const netCost = totalCost - backloadRevenue

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rake Dispatch Optimization</h1>
            <p className="text-gray-600 text-sm">Zero-Empty-Rakes Logistics Platform</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">System Status</p>
          <p className="text-lg font-semibold text-green-600">✅ Optimal</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Capacity</p>
              <p className="text-3xl font-bold text-gray-900">{(totalCapacity / 1000).toFixed(1)}K</p>
              <p className="text-xs text-gray-500 mt-2">tonnes</p>
            </div>
            <Package className="w-12 h-12 text-blue-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Utilization</p>
              <p className="text-3xl font-bold text-gray-900">{avgUtilization}%</p>
              <p className="text-xs text-green-600 mt-2">↑ 5% vs last week</p>
            </div>
            <BarChart3 className="w-12 h-12 text-green-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Empty Rakes</p>
              <p className="text-3xl font-bold text-gray-900">{emptyRakes}</p>
              <p className="text-xs text-green-600 mt-2">✅ Target: 0</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Net Cost</p>
              <p className="text-3xl font-bold text-gray-900">₹{(netCost / 100000).toFixed(1)}L</p>
              <p className="text-xs text-green-600 mt-2">↓ 39% vs industry</p>
            </div>
            <DollarSign className="w-12 h-12 text-purple-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Backload Revenue</p>
              <p className="text-3xl font-bold text-gray-900">₹{(backloadRevenue / 100000).toFixed(1)}L</p>
              <p className="text-xs text-green-600 mt-2">↑ 68% utilization</p>
            </div>
            <TrendingUp className="w-12 h-12 text-orange-100" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 bg-white rounded-t-lg p-4">
        {(['dashboard', 'dispatch', 'tracking', 'analytics'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Rake Status Board */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Rake Status Board</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rakes.map(rake => (
                <div key={rake.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{rake.name}</h3>
                      <p className="text-sm text-gray-600">{rake.destination}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      rake.status === 'available' ? 'bg-green-100 text-green-800' :
                      rake.status === 'in-transit' ? 'bg-blue-100 text-blue-800' :
                      rake.status === 'scheduled' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {rake.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Capacity</span>
                        <span className="font-semibold">{rake.utilization}%</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            rake.utilization < 50 ? 'bg-red-500' :
                            rake.utilization < 80 ? 'bg-orange-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${rake.utilization}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {rake.currentLoad} / {rake.capacity} tonnes
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">ETA: {rake.eta}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">₹{(rake.cost / 1000).toFixed(0)}K</span>
                    </div>

                    {rake.backload && (
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <p className="text-xs font-semibold text-green-800">
                          ✅ Backload: {rake.backload.quantity}T
                        </p>
                        <p className="text-xs text-green-700">
                          Revenue: ₹{(rake.backload.revenue / 1000).toFixed(0)}K
                        </p>
                      </div>
                    )}

                    {rake.progress !== undefined && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-xs font-semibold text-blue-800">
                          Progress: {rake.progress}%
                        </p>
                        <p className="text-xs text-blue-700">{rake.lastLocation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Tab */}
      {activeTab === 'dispatch' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dispatch Plans</h2>
            {dispatchPlans.map(plan => (
              <div key={plan.rakeId} className="border border-gray-200 rounded-lg p-6 mb-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.rakeName}</h3>
                    <p className="text-sm text-gray-600">→ {plan.orders[0]?.destination || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Dispatch Time</p>
                    <p className="text-lg font-semibold text-gray-900">{plan.dispatchTime}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Load</p>
                    <p className="text-2xl font-bold text-gray-900">{plan.totalLoad}T</p>
                    <p className="text-xs text-gray-500">Utilization: {plan.utilization}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Cost</p>
                    <p className="text-2xl font-bold text-gray-900">₹{(plan.cost / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-500">₹{plan.costPerTonne.toFixed(0)}/T</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">ETA</p>
                    <p className="text-2xl font-bold text-gray-900">{plan.eta}</p>
                    <p className="text-xs text-gray-500">Estimated</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Status</p>
                    <p className={`text-2xl font-bold ${plan.utilization >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                      {plan.utilization >= 80 ? '✅ Optimal' : '⚠️ Hold'}
                    </p>
                  </div>
                </div>

                {plan.orders.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Orders Assigned:</p>
                    <div className="space-y-2">
                      {plan.orders.map(order => (
                        <div key={order.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <div>
                            <p className="font-semibold text-gray-900">{order.product}</p>
                            <p className="text-sm text-gray-600">{order.customer}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{order.quantity}T</p>
                            <p className={`text-xs font-semibold ${
                              order.priority === 'high' ? 'text-red-600' :
                              order.priority === 'medium' ? 'text-orange-600' :
                              'text-green-600'
                            }`}>
                              {order.priority.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {plan.backload && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-green-900">Return Load Matched</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-green-700">Quantity</p>
                        <p className="font-bold text-green-900">{plan.backload.quantity}T</p>
                      </div>
                      <div>
                        <p className="text-green-700">Source</p>
                        <p className="font-bold text-green-900">{plan.backload.source}</p>
                      </div>
                      <div>
                        <p className="text-green-700">Revenue</p>
                        <p className="font-bold text-green-900">₹{(plan.backload.revenue / 1000).toFixed(0)}K</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Dispatch Now
                  </button>
                  <button className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tracking Tab */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Rake Tracking</h2>
            {rakes.filter(r => r.status === 'in-transit').map(rake => (
              <div key={rake.id} className="border border-gray-200 rounded-lg p-6 mb-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{rake.name}</h3>
                    <p className="text-sm text-gray-600">{rake.lastLocation}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    IN-TRANSIT
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">{rake.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${rake.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Current Load</p>
                    <p className="text-2xl font-bold text-gray-900">{rake.currentLoad}T</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Utilization</p>
                    <p className="text-2xl font-bold text-green-600">{rake.utilization}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">ETA</p>
                    <p className="text-2xl font-bold text-gray-900">{rake.eta}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Status</p>
                    <p className="text-2xl font-bold text-green-600">✅ On Schedule</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">On-Time Delivery</span>
                  <span className="text-2xl font-bold text-green-600">96%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cost Savings</span>
                  <span className="text-2xl font-bold text-green-600">39%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg Turnaround</span>
                  <span className="text-2xl font-bold text-gray-900">48h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Empty Rakes</span>
                  <span className="text-2xl font-bold text-green-600">0%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cost Analysis</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Cost</span>
                  <span className="text-2xl font-bold text-gray-900">₹{(totalCost / 100000).toFixed(1)}L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Backload Revenue</span>
                  <span className="text-2xl font-bold text-green-600">₹{(backloadRevenue / 100000).toFixed(1)}L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Net Cost</span>
                  <span className="text-2xl font-bold text-blue-600">₹{(netCost / 100000).toFixed(1)}L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cost per Tonne</span>
                  <span className="text-2xl font-bold text-gray-900">₹76</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
