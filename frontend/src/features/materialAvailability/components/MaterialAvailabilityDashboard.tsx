import React, { useState, useEffect } from 'react'
import { Package, TrendingUp, AlertCircle, MapPin, Truck, Clock, DollarSign, BarChart3 } from 'lucide-react'
import { useImportedData } from '../../../hooks/useImportedData'

interface Material {
  id: string
  name: string
  quantity: number
  unit: string
  price: number
  grade: string
  stockyard: string
  location: string
  lastUpdated: string
  trend: number
  reorderPoint: number
  safetyStock: number
  leadTime: number
  supplier: string
  quality: number
}

interface AvailabilityAlert {
  id: string
  material: string
  type: 'low-stock' | 'expiring' | 'quality-issue' | 'delay'
  severity: 'critical' | 'high' | 'medium' | 'low'
  message: string
  timestamp: string
}

const mockMaterials: Material[] = [
  {
    id: 'm-001',
    name: 'Iron Ore',
    quantity: 8500,
    unit: 'tonnes',
    price: 3200,
    grade: 'Premium',
    stockyard: 'Bokaro Main',
    location: 'Bokaro Siding-1',
    lastUpdated: '2025-11-27T10:30:00Z',
    trend: 5.2,
    reorderPoint: 2000,
    safetyStock: 1500,
    leadTime: 7,
    supplier: 'Supplier A',
    quality: 4.8,
  },
  {
    id: 'm-002',
    name: 'Coking Coal',
    quantity: 5200,
    unit: 'tonnes',
    price: 4800,
    grade: 'Grade-A',
    stockyard: 'Bokaro Main',
    location: 'Bokaro Siding-2',
    lastUpdated: '2025-11-27T09:15:00Z',
    trend: -2.1,
    reorderPoint: 1500,
    safetyStock: 1000,
    leadTime: 10,
    supplier: 'Supplier B',
    quality: 4.5,
  },
  {
    id: 'm-003',
    name: 'Limestone',
    quantity: 3100,
    unit: 'tonnes',
    price: 950,
    grade: 'Industrial',
    stockyard: 'Dankuni',
    location: 'Dankuni Siding-1',
    lastUpdated: '2025-11-27T08:45:00Z',
    trend: 1.8,
    reorderPoint: 800,
    safetyStock: 500,
    leadTime: 5,
    supplier: 'Supplier C',
    quality: 4.2,
  },
  {
    id: 'm-004',
    name: 'Manganese Ore',
    quantity: 1800,
    unit: 'tonnes',
    price: 5200,
    grade: 'High-Grade',
    stockyard: 'Ranchi',
    location: 'Ranchi Siding-1',
    lastUpdated: '2025-11-27T11:00:00Z',
    trend: 8.5,
    reorderPoint: 500,
    safetyStock: 300,
    leadTime: 8,
    supplier: 'Supplier D',
    quality: 4.9,
  },
  {
    id: 'm-005',
    name: 'Pig Iron',
    quantity: 2500,
    unit: 'tonnes',
    price: 6500,
    grade: 'Premium',
    stockyard: 'Bokaro Main',
    location: 'Bokaro Siding-3',
    lastUpdated: '2025-11-27T10:00:00Z',
    trend: 3.2,
    reorderPoint: 600,
    safetyStock: 400,
    leadTime: 6,
    supplier: 'Supplier A',
    quality: 4.7,
  },
]

const mockAlerts: AvailabilityAlert[] = [
  {
    id: 'alert-001',
    material: 'Manganese Ore',
    type: 'low-stock',
    severity: 'high',
    message: 'Stock level approaching reorder point',
    timestamp: '2025-11-27T11:15:00Z',
  },
  {
    id: 'alert-002',
    material: 'Coking Coal',
    type: 'delay',
    severity: 'medium',
    message: 'Supplier shipment delayed by 2 days',
    timestamp: '2025-11-27T10:45:00Z',
  },
  {
    id: 'alert-003',
    material: 'Iron Ore',
    type: 'quality-issue',
    severity: 'low',
    message: 'Quality inspection completed - all passed',
    timestamp: '2025-11-27T09:30:00Z',
  },
]

export default function MaterialAvailabilityDashboard() {
  const { data: importedData, isLoaded } = useImportedData()
  const [materials, setMaterials] = useState<Material[]>(mockMaterials)
  const [alerts, setAlerts] = useState<AvailabilityAlert[]>(mockAlerts)
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'alerts' | 'forecast'>('overview')
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isLoaded) return

    // Use imported materials if available
    if (importedData?.materials && Array.isArray(importedData.materials)) {
      const enrichedMaterials = importedData.materials.map((m: any, idx: number) => ({
        ...m,
        trend: (Math.random() - 0.5) * 10,
        reorderPoint: m.quantity * 0.2,
        safetyStock: m.quantity * 0.15,
        leadTime: Math.floor(Math.random() * 10) + 3,
        quality: 4 + Math.random(),
      }))
      setMaterials(enrichedMaterials)
    }
  }, [isLoaded, importedData])

  const filteredMaterials = materials.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.stockyard.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalValue = materials.reduce((sum, m) => sum + m.quantity * m.price, 0)
  const totalQuantity = materials.reduce((sum, m) => sum + m.quantity, 0)
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length
  const avgQuality = (materials.reduce((sum, m) => sum + m.quality, 0) / materials.length).toFixed(2)

  const getStockStatus = (material: Material) => {
    const percentage = (material.quantity / material.reorderPoint) * 100
    if (percentage < 50) return { status: 'Critical', color: 'text-red-600', bg: 'bg-red-50' }
    if (percentage < 100) return { status: 'Low', color: 'text-orange-600', bg: 'bg-orange-50' }
    if (percentage < 200) return { status: 'Optimal', color: 'text-green-600', bg: 'bg-green-50' }
    return { status: 'Excess', color: 'text-blue-600', bg: 'bg-blue-50' }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-green-100 text-green-800 border-green-300'
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Material Availability</h1>
            <p className="text-gray-600 text-sm">Real-time inventory tracking & forecasting</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Last Updated</p>
          <p className="text-lg font-semibold text-gray-900">
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Materials</p>
              <p className="text-3xl font-bold text-gray-900">{materials.length}</p>
              <p className="text-xs text-gray-500 mt-2">Active in system</p>
            </div>
            <Package className="w-12 h-12 text-blue-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Quantity</p>
              <p className="text-3xl font-bold text-gray-900">{(totalQuantity / 1000).toFixed(1)}K</p>
              <p className="text-xs text-gray-500 mt-2">tonnes</p>
            </div>
            <BarChart3 className="w-12 h-12 text-green-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Value</p>
              <p className="text-3xl font-bold text-gray-900">₹{(totalValue / 10000000).toFixed(1)}Cr</p>
              <p className="text-xs text-gray-500 mt-2">inventory value</p>
            </div>
            <DollarSign className="w-12 h-12 text-purple-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Critical Alerts</p>
              <p className="text-3xl font-bold text-gray-900">{criticalAlerts}</p>
              <p className="text-xs text-gray-500 mt-2">require attention</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-100" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 bg-white rounded-t-lg p-4">
        {(['overview', 'details', 'alerts', 'forecast'] as const).map(tab => (
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-white rounded-lg shadow p-4">
            <input
              type="text"
              placeholder="Search materials by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map(material => {
              const status = getStockStatus(material)
              return (
                <div
                  key={material.id}
                  onClick={() => setSelectedMaterial(material)}
                  className={`${status.bg} rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 ${
                    status.color.includes('red') ? 'border-red-500' :
                    status.color.includes('orange') ? 'border-orange-500' :
                    status.color.includes('green') ? 'border-green-500' :
                    'border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{material.name}</h3>
                      <p className="text-sm text-gray-600">{material.grade}</p>
                    </div>
                    <span className={`${status.color} font-semibold text-sm px-3 py-1 rounded-full`}>
                      {status.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Quantity</span>
                      <span className="font-bold text-gray-900">{material.quantity.toLocaleString()} {material.unit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Location</span>
                      <span className="text-gray-900 text-sm flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {material.location}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Unit Price</span>
                      <span className="font-semibold text-gray-900">₹{material.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Trend</span>
                      <span className={`font-semibold flex items-center gap-1 ${material.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendingUp className="w-4 h-4" /> {material.trend > 0 ? '+' : ''}{material.trend.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Quality</span>
                      <span className="font-semibold text-gray-900">⭐ {material.quality.toFixed(1)}/5</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Stock Level</span>
                      <span>{Math.round((material.quantity / material.reorderPoint) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          material.quantity < material.reorderPoint * 0.5 ? 'bg-red-500' :
                          material.quantity < material.reorderPoint ? 'bg-orange-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((material.quantity / material.reorderPoint) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-lg shadow p-6">
          {selectedMaterial ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedMaterial.name}</h2>
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 text-sm">Material ID</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedMaterial.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Grade</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedMaterial.grade}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Current Quantity</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedMaterial.quantity.toLocaleString()} {selectedMaterial.unit}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Unit Price</p>
                    <p className="text-lg font-semibold text-gray-900">₹{selectedMaterial.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Value</p>
                    <p className="text-lg font-semibold text-green-600">₹{(selectedMaterial.quantity * selectedMaterial.price).toLocaleString()}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 text-sm">Stockyard</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedMaterial.stockyard}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Location</p>
                    <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {selectedMaterial.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Supplier</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedMaterial.supplier}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Lead Time</p>
                    <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> {selectedMaterial.leadTime} days
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Quality Score</p>
                    <p className="text-lg font-semibold text-gray-900">⭐ {selectedMaterial.quality.toFixed(2)}/5</p>
                  </div>
                </div>
              </div>

              {/* Stock Analysis */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Stock Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-gray-600 text-sm">Reorder Point</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedMaterial.reorderPoint.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-gray-600 text-sm">Safety Stock</p>
                    <p className="text-2xl font-bold text-green-600">{selectedMaterial.safetyStock.toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-gray-600 text-sm">Trend</p>
                    <p className={`text-2xl font-bold ${selectedMaterial.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedMaterial.trend > 0 ? '+' : ''}{selectedMaterial.trend.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Select a material from the overview to see details</p>
            </div>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {alerts.length > 0 ? (
            alerts.map(alert => (
              <div
                key={alert.id}
                className={`rounded-lg shadow p-4 border-l-4 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold">{alert.material}</h3>
                      <p className="text-sm mt-1">{alert.message}</p>
                      <p className="text-xs mt-2 opacity-75">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold uppercase px-2 py-1 rounded">
                    {alert.type.replace('-', ' ')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No alerts at this time</p>
            </div>
          )}
        </div>
      )}

      {/* Forecast Tab */}
      {activeTab === 'forecast' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Availability Forecast</h2>
          <div className="space-y-4">
            {materials.map(material => {
              const daysUntilStockout = Math.round(material.quantity / (material.quantity * 0.1))
              const forecastStatus = daysUntilStockout < 7 ? 'critical' : daysUntilStockout < 14 ? 'warning' : 'healthy'
              
              return (
                <div key={material.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{material.name}</h3>
                      <p className="text-sm text-gray-600">{material.stockyard}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      forecastStatus === 'critical' ? 'bg-red-100 text-red-800' :
                      forecastStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {forecastStatus.charAt(0).toUpperCase() + forecastStatus.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Current Stock</p>
                      <p className="font-semibold text-gray-900">{material.quantity.toLocaleString()} {material.unit}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Estimated Stockout</p>
                      <p className="font-semibold text-gray-900">{daysUntilStockout} days</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Recommended Action</p>
                      <p className="font-semibold text-blue-600">Order {(material.reorderPoint * 1.5).toLocaleString()} units</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
