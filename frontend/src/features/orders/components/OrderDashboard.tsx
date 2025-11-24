/**
 * Order Management Dashboard
 * Complete order management system with creation, tracking, and matching
 */

import React, { useState, useEffect } from 'react'
import {
  ShoppingCart,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  MapPin,
  DollarSign,
  Truck,
  AlertCircle,
} from 'lucide-react'
import { useOrderStore } from '../store'
import { Order, OrderStatus, OrderPriority } from '../types'

export default function OrderDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'tracking' | 'matching' | 'alerts'>('orders')
  const [showForm, setShowForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<string | undefined>()
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<OrderPriority | 'all'>('all')

  // Get data from store
  const {
    orders,
    alerts,
    getOrderSummary,
    getOrdersByStatusCount,
    getOrdersByPriorityCount,
    getTotalAlerts,
    getCriticalAlerts,
    addOrder,
    updateOrder,
    removeOrder,
  } = useOrderStore()

  const summary = getOrderSummary()
  const statusCount = getOrdersByStatusCount()
  const priorityCount = getOrdersByPriorityCount()
  const totalAlerts = getTotalAlerts()
  const criticalAlerts = getCriticalAlerts()

  // Mock data for demonstration
  const mockOrders: Order[] = [
    {
      id: 'ord-001',
      orderId: 'ORD-001',
      customerId: 'cust-001',
      customer: {
        id: 'cust-001',
        name: 'Steel Industries Ltd',
        email: 'orders@steel.com',
        phone: '+91-9876543210',
        location: 'Kolkata',
        creditLimit: 5000000,
        rating: 4.5,
      },
      items: [
        {
          id: 'item-001',
          materialId: 'coal-001',
          materialName: 'Coal',
          quantity: 500,
          quantityUnit: 'tonnes',
          destination: 'Kolkata',
          priority: 'high',
        },
      ],
      totalQuantity: 500,
      orderDate: '2025-11-24',
      requiredDeliveryDate: '2025-11-26',
      sla: 48,
      priority: 'high',
      status: 'allocated',
      fulfillmentMode: 'rail',
      estimatedCost: 125000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ord-002',
      orderId: 'ORD-002',
      customerId: 'cust-002',
      customer: {
        id: 'cust-002',
        name: 'Cement Corp',
        email: 'procurement@cement.com',
        phone: '+91-9876543211',
        location: 'Mumbai',
        creditLimit: 3000000,
        rating: 4.0,
      },
      items: [
        {
          id: 'item-002',
          materialId: 'limestone-001',
          materialName: 'Limestone',
          quantity: 300,
          quantityUnit: 'tonnes',
          destination: 'Mumbai',
          priority: 'medium',
        },
      ],
      totalQuantity: 300,
      orderDate: '2025-11-23',
      requiredDeliveryDate: '2025-11-28',
      sla: 120,
      priority: 'medium',
      status: 'loading',
      fulfillmentMode: 'rail',
      estimatedCost: 75000,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'ord-003',
      orderId: 'ORD-003',
      customerId: 'cust-003',
      customer: {
        id: 'cust-003',
        name: 'Mining Solutions',
        email: 'supply@mining.com',
        phone: '+91-9876543212',
        location: 'Ranchi',
        creditLimit: 2000000,
        rating: 3.8,
      },
      items: [
        {
          id: 'item-003',
          materialId: 'iron-001',
          materialName: 'Iron Ore',
          quantity: 800,
          quantityUnit: 'tonnes',
          destination: 'Jamshedpur',
          priority: 'urgent',
        },
      ],
      totalQuantity: 800,
      orderDate: '2025-11-24',
      requiredDeliveryDate: '2025-11-25',
      sla: 24,
      priority: 'urgent',
      status: 'pending',
      fulfillmentMode: 'rail',
      estimatedCost: 200000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ord-004',
      orderId: 'ORD-004',
      customerId: 'cust-001',
      customer: {
        id: 'cust-001',
        name: 'Steel Industries Ltd',
        email: 'orders@steel.com',
        phone: '+91-9876543210',
        location: 'Kolkata',
        creditLimit: 5000000,
        rating: 4.5,
      },
      items: [
        {
          id: 'item-004',
          materialId: 'coal-001',
          materialName: 'Coal',
          quantity: 400,
          quantityUnit: 'tonnes',
          destination: 'Howrah',
          priority: 'medium',
        },
      ],
      totalQuantity: 400,
      orderDate: '2025-11-20',
      requiredDeliveryDate: '2025-11-24',
      sla: 96,
      priority: 'medium',
      status: 'dispatched',
      fulfillmentMode: 'rail',
      estimatedCost: 100000,
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      updatedAt: new Date(Date.now() - 345600000).toISOString(),
    },
  ]

  // Initialize with mock data
  useEffect(() => {
    if (orders.length === 0) {
      mockOrders.forEach((o) => addOrder(o))
    }
  }, [])

  // Filter orders
  const filteredOrders = mockOrders.filter((o) => {
    const statusMatch = filterStatus === 'all' || o.status === filterStatus
    const priorityMatch = filterPriority === 'all' || o.priority === filterPriority
    return statusMatch && priorityMatch
  })

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'allocated':
        return 'bg-blue-100 text-blue-800'
      case 'loading':
        return 'bg-purple-100 text-purple-800'
      case 'dispatched':
        return 'bg-indigo-100 text-indigo-800'
      case 'in_transit':
        return 'bg-cyan-100 text-cyan-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: OrderPriority) => {
    switch (priority) {
      case 'low':
        return 'text-gray-600'
      case 'medium':
        return 'text-yellow-600'
      case 'high':
        return 'text-orange-600'
      case 'urgent':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Order Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Create, track, and manage customer orders
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Create Order
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="text-blue-600" size={24} />
            <span className="text-sm text-slate-600 dark:text-slate-400">Total Orders</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {summary.totalOrders}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {summary.pendingOrders} pending
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="text-green-600" size={24} />
            <span className="text-sm text-slate-600 dark:text-slate-400">Delivered</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {summary.deliveredOrders}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {summary.onTimeDeliveryRate}% on-time
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-purple-600" size={24} />
            <span className="text-sm text-slate-600 dark:text-slate-400">Total Value</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            ₹{(summary.totalValue / 100000).toFixed(1)}L
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {summary.totalQuantity.toLocaleString()} tonnes
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-indigo-600" size={24} />
            <span className="text-sm text-slate-600 dark:text-slate-400">SLA Compliance</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {summary.slaComplianceRate}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {summary.averageDeliveryTime}h avg delivery
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-red-600" size={24} />
            <span className="text-sm text-slate-600 dark:text-slate-400">Alerts</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{summary.criticalAlerts}</p>
          <p className="text-xs text-slate-500 mt-1">
            {totalAlerts} total alerts
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'orders', label: 'Orders', icon: ShoppingCart },
          { id: 'tracking', label: 'Tracking', icon: MapPin },
          { id: 'matching', label: 'Matching', icon: TrendingUp },
          { id: 'alerts', label: `Alerts (${totalAlerts})`, icon: AlertCircle },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`px-4 py-2 font-medium flex items-center gap-2 border-b-2 transition ${
              activeTab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-50"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="allocated">Allocated</option>
                <option value="loading">Loading</option>
                <option value="dispatched">Dispatched</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-50"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div key={order.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-slate-900 dark:text-slate-50">
                          {order.orderId}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-700 ${getPriorityColor(order.priority)}`}>
                          {order.priority}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {order.customer.name} → {order.items[0]?.destination}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-slate-50">
                        ₹{order.estimatedCost.toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {order.totalQuantity} tonnes
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">Required Delivery</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {new Date(order.requiredDeliveryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">SLA</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {order.sla} hours
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">Mode</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {order.fulfillmentMode}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 btn btn-sm btn-outline flex items-center justify-center gap-1">
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button className="flex-1 btn btn-sm btn-outline flex items-center justify-center gap-1 text-red-600">
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-slate-50">{order.orderId}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-slate-600 dark:text-slate-400" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Order Date: {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-slate-600 dark:text-slate-400" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Destination: {order.items[0]?.destination}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-slate-600 dark:text-slate-400" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Required by: {new Date(order.requiredDeliveryDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between text-xs">
                    {['pending', 'allocated', 'loading', 'dispatched', 'delivered'].map((status, idx) => (
                      <div key={status} className="text-center">
                        <div
                          className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                            order.status === status || 
                            ['pending', 'allocated', 'loading', 'dispatched', 'delivered'].indexOf(order.status) >= idx
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <p className="capitalize text-slate-600 dark:text-slate-400">{status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Matching Tab */}
        {activeTab === 'matching' && (
          <div className="space-y-4">
            {filteredOrders.filter((o) => o.status === 'pending').map((order) => (
              <div key={order.id} className="card">
                <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-3">
                  {order.orderId} - Matching Analysis
                </h3>

                <div className="space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                      Recommended Stockyard
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Bokaro Stockyard - 500 tonnes available, ₹125,000 cost
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Rail Option</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">₹125,000</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">48 hours</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Road Option</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">₹150,000</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">36 hours</p>
                    </div>
                  </div>

                  <button className="w-full btn btn-primary">Allocate Order</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {criticalAlerts.length === 0 ? (
              <div className="card text-center py-8">
                <CheckCircle className="mx-auto text-green-600 mb-3" size={32} />
                <p className="text-slate-600 dark:text-slate-400">No critical alerts</p>
              </div>
            ) : (
              criticalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="card border-l-4 border-red-600 bg-red-50 dark:bg-red-900/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-red-900 dark:text-red-200">{alert.message}</p>
                      <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                        Order: {alert.orderId}
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button className="btn btn-sm btn-outline text-red-600">Resolve</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
