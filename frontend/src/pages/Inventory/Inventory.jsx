import React, { useState, useMemo } from 'react'
import { Search, Filter, BarChart3, LineChart as LineChartIcon, TrendingUp, AlertCircle } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Generate mock inventory data
const generateInventoryData = () => {
  const materials = ['CR Coils', 'HR Coils', 'Plates', 'Sheets']
  const materialSpecs = {
    'CR Coils': { thickness: '0.5-3.0mm', width: '600-1500mm', length: 'coil' },
    'HR Coils': { thickness: '1.2-12.7mm', width: '600-1500mm', length: 'coil' },
    'Plates': { thickness: '3-100mm', width: '1000-2000mm', length: '2000-6000mm' },
    'Sheets': { thickness: '0.4-2.0mm', width: '800-1500mm', length: '2000-4000mm' }
  }
  const locations = ['Bokaro', 'Dhanbad', 'Ranchi', 'Jamshedpur', 'Patna']
  
  const inventory = []
  materials.forEach((material, idx) => {
    locations.forEach(location => {
      const maxStock = Math.floor(Math.random() * 5000) + 2000
      const currentStock = Math.floor(maxStock * (Math.random() * 0.6 + 0.2))
      const minLevel = Math.floor(maxStock * 0.2)
      
      inventory.push({
        id: `${material.replace(/\s/g, '')}-${location}`,
        material,
        location,
        currentStock,
        minLevel,
        maxStock,
        consumed: Math.floor(Math.random() * 500) + 50,
        avgStock: Math.floor((currentStock + maxStock) / 2),
        lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
    })
  })
  return inventory
}

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [inventory] = useState(generateInventoryData())
  const [activeTab, setActiveTab] = useState('table')

  // Filter inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(item =>
      item.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [inventory, searchTerm])

  // Stock levels data
  const stockLevelData = useMemo(() => {
    const materials = {}
    inventory.forEach(item => {
      if (!materials[item.material]) {
        materials[item.material] = { material: item.material, stock: 0, minLevel: 0, maxLevel: 0 }
      }
      materials[item.material].stock += item.currentStock
      materials[item.material].minLevel += item.minLevel
      materials[item.material].maxLevel += item.maxStock
    })
    return Object.values(materials)
  }, [inventory])

  // Reorder recommendations
  const reorderData = useMemo(() => {
    return inventory
      .filter(item => item.currentStock < item.minLevel)
      .map(item => ({
        ...item,
        urgency: item.minLevel - item.currentStock,
        recommendedQty: item.maxStock - item.currentStock
      }))
      .sort((a, b) => b.urgency - a.urgency)
  }, [inventory])

  // Material turnover
  const turnoverData = useMemo(() => {
    return inventory.map(item => ({
      material: item.material,
      turnover: (item.consumed / item.avgStock).toFixed(2),
      days: (30 / (item.consumed / item.avgStock)).toFixed(1)
    }))
  }, [inventory])

  const stats = useMemo(() => {
    const total = inventory.length
    const lowStock = inventory.filter(i => i.currentStock < i.minLevel).length
    const totalStock = inventory.reduce((sum, i) => sum + i.currentStock, 0)
    const avgUtilization = (inventory.reduce((sum, i) => sum + (i.currentStock / i.maxStock), 0) / total * 100).toFixed(1)

    return { total, lowStock, totalStock, avgUtilization }
  }, [inventory])

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">📦 Inventory Management</h1>
        <p className="text-slate-600">Track and optimize inventory across all locations</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-300 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'table', label: 'Inventory Table', icon: BarChart3 },
          { id: 'stocks', label: 'Stock Levels', icon: LineChartIcon },
          { id: 'reorder', label: 'Reorder Recommendations', icon: AlertCircle },
          { id: 'turnover', label: 'Material Turnover', icon: TrendingUp },
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
          <p className="text-slate-600 text-sm">Total Items</p>
          <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Low Stock</p>
          <p className="text-3xl font-bold text-red-600">{stats.lowStock}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Total Stock</p>
          <p className="text-3xl font-bold text-blue-600">{(stats.totalStock / 1000).toFixed(1)}K T</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-slate-600 text-sm">Avg Utilization</p>
          <p className="text-3xl font-bold text-green-600">{stats.avgUtilization}%</p>
        </div>
      </div>

      {/* TAB 1: INVENTORY TABLE */}
      {activeTab === 'table' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search inventory..."
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
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Material</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Current (T)</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Min Level</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Max Level</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Utilization</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.slice(0, 15).map((item) => {
                  const utilization = ((item.currentStock / item.maxStock) * 100).toFixed(1)
                  return (
                    <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-900">{item.material}</td>
                      <td className="py-3 px-4 text-slate-700">{item.location}</td>
                      <td className="py-3 px-4 text-slate-700">{item.currentStock}</td>
                      <td className="py-3 px-4 text-slate-700">{item.minLevel}</td>
                      <td className="py-3 px-4 text-slate-700">{item.maxStock}</td>
                      <td className="py-3 px-4 text-slate-700">{utilization}%</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.currentStock < item.minLevel ? 'bg-red-100 text-red-800' :
                          item.currentStock > item.maxStock * 0.8 ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.currentStock < item.minLevel ? 'Low' : item.currentStock > item.maxStock * 0.8 ? 'Good' : 'Medium'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STOCK LEVELS */}
      {activeTab === 'stocks' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Stock Levels by Material</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stockLevelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="material" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="stock" fill="#3b82f6" name="Current Stock" />
              <Bar dataKey="minLevel" fill="#ef4444" name="Min Level" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* TAB 3: REORDER RECOMMENDATIONS */}
      {activeTab === 'reorder' && (
        <div className="space-y-4">
          {reorderData.length > 0 ? (
            reorderData.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Material</p>
                    <p className="font-semibold text-slate-900">{item.material}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Location</p>
                    <p className="font-semibold text-slate-900">{item.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Current Stock</p>
                    <p className="font-bold text-red-600">{item.currentStock}T</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Recommended Qty</p>
                    <p className="font-bold text-green-600">{item.recommendedQty}T</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Urgency</p>
                    <p className={`font-bold ${item.urgency > 500 ? 'text-red-600' : 'text-orange-600'}`}>{item.urgency}T</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-green-50 rounded-lg shadow p-6 text-center">
              <p className="text-green-700 font-semibold">✓ All inventory levels are healthy!</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MATERIAL TURNOVER */}
      {activeTab === 'turnover' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">📈 Material Turnover Analysis</h3>
            <div className="space-y-3">
              {turnoverData.slice(0, 7).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900">{item.material}</p>
                    <p className="text-xs text-slate-600">Turnover: {item.turnover}x per month</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{item.days} days</p>
                    <p className="text-xs text-slate-600">avg holding time</p>
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
