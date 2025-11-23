import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts'
import { AlertCircle, TrendingUp, Package, Zap } from 'lucide-react'
import { getCostData, getCostOptimizations, getThroughputData, getEquipmentStatus, getInventoryData, getABCAnalysis, getReorderRecommendations, getInventoryTrends } from '../api/businessPagesApi'

// ============ COST PREDICTION COMPONENTS ============
export function CostBreakdown() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const costData = await getCostData(30)
      const grouped = costData.reduce((acc, item) => {
        const existing = acc.find(d => d.category === item.category)
        if (existing) {
          existing.cost += item.cost
          existing.budget += item.budget
        } else {
          acc.push({ ...item })
        }
        return acc
      }, [])
      setData(grouped)
    } catch (error) {
      console.error('Failed to load cost data:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalCost = data.reduce((sum, d) => sum + d.cost, 0)
  const totalBudget = data.reduce((sum, d) => sum + d.budget, 0)
  const variance = totalBudget - totalCost

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-sm text-slate-600">Total Cost</p>
          <p className="text-3xl font-bold text-slate-900">${(totalCost / 1000).toFixed(1)}K</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-slate-600">Total Budget</p>
          <p className="text-3xl font-bold text-slate-900">${(totalBudget / 1000).toFixed(1)}K</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-slate-600">Variance</p>
          <p className={`text-3xl font-bold ${variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${(variance / 1000).toFixed(1)}K
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-4">
            <h3 className="font-bold text-slate-900 mb-4">Cost by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data} dataKey="cost" nameKey="category" cx="50%" cy="50%" outerRadius={80}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `$${(v / 1000).toFixed(1)}K`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-4">
            <h3 className="font-bold text-slate-900 mb-4">Cost vs Budget</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(v) => `$${(v / 1000).toFixed(1)}K`} />
                <Legend />
                <Bar dataKey="cost" fill="#3b82f6" name="Actual" />
                <Bar dataKey="budget" fill="#10b981" name="Budget" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

export function CostOptimizations() {
  const [optimizations, setOptimizations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOptimizations()
  }, [])

  const loadOptimizations = async () => {
    try {
      const data = await getCostOptimizations()
      setOptimizations(data)
    } catch (error) {
      console.error('Failed to load optimizations:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Cost Optimization Recommendations</h3>
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {optimizations.map((opt) => (
            <div key={opt.id} className="card p-4 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-900">{opt.title}</p>
                  <p className="text-sm text-slate-600">Effort: {opt.effort}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">${(opt.savings / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-slate-600">Potential Savings</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============ THROUGHPUT PREDICTION COMPONENTS ============
export function ThroughputAnalysis() {
  const [data, setData] = useState([])
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [throughputData, equipmentData] = await Promise.all([
        getThroughputData(30),
        getEquipmentStatus(),
      ])
      setData(throughputData)
      setEquipment(equipmentData)
    } catch (error) {
      console.error('Failed to load throughput data:', error)
    } finally {
      setLoading(false)
    }
  }

  const avgUtilization = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.utilization, 0) / data.length) : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-sm text-slate-600">Avg Utilization</p>
          <p className="text-3xl font-bold text-slate-900">{avgUtilization}%</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-slate-600">Equipment Online</p>
          <p className="text-3xl font-bold text-slate-900">{equipment.filter(e => e.status === 'Operational').length}/{equipment.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-slate-600">Bottlenecks</p>
          <p className="text-3xl font-bold text-slate-900">{data.filter(d => d.bottleneck !== 'None').length}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card p-4">
            <h3 className="font-bold text-slate-900 mb-4">Capacity Utilization Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} interval={Math.floor(data.length / 5)} />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="utilization" fill="#dbeafe" stroke="#3b82f6" />
                <Line type="monotone" dataKey="utilization" stroke="#3b82f6" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-4">
            <h3 className="font-bold text-slate-900 mb-4">Equipment Status</h3>
            <div className="space-y-2">
              {equipment.map((eq) => (
                <div key={eq.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <div>
                    <p className="font-medium text-slate-900">{eq.name}</p>
                    <p className="text-xs text-slate-600">{eq.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{eq.efficiency}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ INVENTORY MANAGEMENT COMPONENTS ============
export function InventoryDashboard() {
  const [items, setItems] = useState([])
  const [abc, setAbc] = useState(null)
  const [reorder, setReorder] = useState([])
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [itemsData, abcData, reorderData, trendsData] = await Promise.all([
        getInventoryData(),
        getABCAnalysis(),
        getReorderRecommendations(),
        getInventoryTrends(30),
      ])
      setItems(itemsData)
      setAbc(abcData)
      setReorder(reorderData)
      setTrends(trendsData)
    } catch (error) {
      console.error('Failed to load inventory data:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalValue = items.reduce((sum, item) => sum + item.value, 0)
  const stockOutRisk = items.filter(item => item.quantity < item.reorderPoint).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-sm text-slate-600">Total Items</p>
          <p className="text-3xl font-bold text-slate-900">{items.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-slate-600">Total Value</p>
          <p className="text-3xl font-bold text-slate-900">${(totalValue / 1000).toFixed(0)}K</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-slate-600">Stock-Out Risk</p>
          <p className={`text-3xl font-bold ${stockOutRisk > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {stockOutRisk}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-slate-600">Avg Days Stock</p>
          <p className="text-3xl font-bold text-slate-900">
            {Math.round(items.reduce((sum, i) => sum + i.daysOfStock, 0) / items.length)}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ABC Analysis */}
          {abc && (
            <div className="card p-4">
              <h3 className="font-bold text-slate-900 mb-4">ABC Analysis</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'A Items', value: abc.A.percentage },
                      { name: 'B Items', value: abc.B.percentage },
                      { name: 'C Items', value: abc.C.percentage },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    <Cell fill="#ef4444" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Inventory Trend */}
          {trends.length > 0 && (
            <div className="card p-4">
              <h3 className="font-bold text-slate-900 mb-4">Inventory Value Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} interval={Math.floor(trends.length / 5)} />
                  <YAxis />
                  <Tooltip formatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Line type="monotone" dataKey="totalValue" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Reorder Recommendations */}
      {reorder.length > 0 && (
        <div className="card p-4">
          <h3 className="font-bold text-slate-900 mb-4">Reorder Recommendations</h3>
          <div className="space-y-2">
            {reorder.map((item, idx) => (
              <div key={idx} className={`p-3 rounded border-l-4 ${
                item.status === 'URGENT' ? 'bg-red-50 border-red-500' :
                item.status === 'SOON' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-600">{item.sku}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    item.status === 'URGENT' ? 'bg-red-200 text-red-800' :
                    item.status === 'SOON' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
