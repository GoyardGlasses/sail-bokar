import React, { useState, useMemo } from 'react'
import { Plus, Search, Filter, TrendingUp, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Generate mock order data
const generateOrderData = () => {
  const materials = ['CR Coils', 'HR Coils', 'Plates', 'Sheets']
  const materialSpecs = {
    'CR Coils': { thickness: '0.5-3.0mm', width: '600-1500mm', length: 'coil' },
    'HR Coils': { thickness: '1.2-12.7mm', width: '600-1500mm', length: 'coil' },
    'Plates': { thickness: '3-100mm', width: '1000-2000mm', length: '2000-6000mm' },
    'Sheets': { thickness: '0.4-2.0mm', width: '800-1500mm', length: '2000-4000mm' }
  }
  const statuses = ['Pending', 'Processing', 'Dispatched', 'Delivered', 'Cancelled']
  const priorities = ['LOW', 'MEDIUM', 'HIGH']
  const customers = ['Tata Steel', 'JSW Steel', 'SAIL', 'Essar Steel', 'ArcelorMittal', 'NMDC', 'Jindal Steel']
  
  const orders = []
  for (let i = 0; i < 50; i++) {
    const orderedQty = Math.floor(Math.random() * 500) + 50
    const deliveredQty = Math.floor(orderedQty * (Math.random() * 0.3 + 0.7))
    
    orders.push({
      id: `ORD-${String(i + 1000).slice(-4)}`,
      customerId: `CUST-${String(Math.floor(Math.random() * 500) + 1).padStart(3, '0')}`,
      customerName: customers[Math.floor(Math.random() * customers.length)],
      material: materials[Math.floor(Math.random() * materials.length)],
      orderedQty,
      deliveredQty,
      destination: ['Haldia', 'Jamshedpur', 'Siliguri', 'Gaya', 'Patna'][Math.floor(Math.random() * 5)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      orderDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 500000) + 50000,
    })
  }
  return orders
}

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState('')
  const [orders] = useState(generateOrderData())
  const [activeTab, setActiveTab] = useState('table')

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.material.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [orders, searchTerm])

  // Order pipeline data
  const pipelineData = useMemo(() => {
    const statuses = {}
    orders.forEach(order => {
      statuses[order.status] = (statuses[order.status] || 0) + 1
    })
    return Object.entries(statuses).map(([status, count]) => ({ status, count }))
  }, [orders])

  // Fulfillment tracking
  const fulfillmentData = useMemo(() => {
    return orders.map(order => ({
      orderId: order.id,
      fulfillmentRate: ((order.deliveredQty / order.orderedQty) * 100).toFixed(1),
      status: order.status,
      value: order.value
    }))
  }, [orders])

  // Customer order patterns
  const customerData = useMemo(() => {
    const customers = {}
    orders.forEach(order => {
      if (!customers[order.customerName]) {
        customers[order.customerName] = { customer: order.customerName, count: 0, totalValue: 0, totalQty: 0 }
      }
      customers[order.customerName].count++
      customers[order.customerName].totalValue += order.value
      customers[order.customerName].totalQty += order.orderedQty
    })
    return Object.values(customers).sort((a, b) => b.count - a.count).slice(0, 7)
  }, [orders])

  const stats = useMemo(() => {
    const total = orders.length
    const delivered = orders.filter(o => o.status === 'Delivered').length
    const pending = orders.filter(o => o.status === 'Pending').length
    const avgFulfillment = (orders.reduce((sum, o) => sum + (o.deliveredQty / o.orderedQty), 0) / total * 100).toFixed(1)
    const totalValue = orders.reduce((sum, o) => sum + o.value, 0)

    return { total, delivered, pending, avgFulfillment, totalValue }
  }, [orders])

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">📦 Orders Management</h1>
        <p className="text-slate-600">Track and analyze all customer orders with advanced analytics</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-300 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'table', label: 'Orders Table', icon: BarChart3 },
          { id: 'pipeline', label: 'Order Pipeline', icon: LineChartIcon },
          { id: 'fulfillment', label: 'Fulfillment Tracking', icon: TrendingUp },
          { id: 'customers', label: 'Customer Patterns', icon: PieChartIcon },
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Total Orders</p>
          <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Delivered</p>
          <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Pending</p>
          <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Avg Fulfillment</p>
          <p className="text-3xl font-bold text-blue-600">{stats.avgFulfillment}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Total Value</p>
          <p className="text-3xl font-bold text-purple-600">₹{(stats.totalValue / 1000000).toFixed(1)}M</p>
        </div>
      </div>

      {/* TAB 1: ORDERS TABLE */}
      {activeTab === 'table' && (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search orders..."
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Order ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Material</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Qty (T)</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Destination</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Priority</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.slice(0, 15).map((order) => (
                    <tr key={order.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-900">{order.id}</td>
                      <td className="py-3 px-4 text-slate-700">{order.customerName}</td>
                      <td className="py-3 px-4 text-slate-700">{order.material}</td>
                      <td className="py-3 px-4 text-slate-700">{order.orderedQty}</td>
                      <td className="py-3 px-4 text-slate-700">{order.destination}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                          order.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: ORDER PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pipelineData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100}>
                {pipelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* TAB 3: FULFILLMENT TRACKING */}
      {activeTab === 'fulfillment' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">📈 Fulfillment Rate by Order</h3>
            <div className="space-y-3">
              {fulfillmentData.slice(0, 10).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900">{item.orderId}</p>
                    <p className="text-xs text-slate-600">{item.status}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-blue-500" style={{ width: `${item.fulfillmentRate}%` }} />
                    </div>
                    <span className="font-bold text-slate-900 w-12 text-right">{item.fulfillmentRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMER PATTERNS */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">👥 Top Customers by Order Count</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={customerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="customer" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Order Count" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-1 gap-3">
            {customerData.map((customer, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                <div>
                  <p className="font-semibold text-slate-900">{customer.customer}</p>
                  <p className="text-sm text-slate-600">{customer.count} orders • {customer.totalQty}T total</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">₹{(customer.totalValue / 100000).toFixed(1)}L</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
