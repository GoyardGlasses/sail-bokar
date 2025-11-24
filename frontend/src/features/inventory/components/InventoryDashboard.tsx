/**
 * Inventory Management Dashboard
 * Complete inventory system with material, rake, loading point, and siding management
 */

import React, { useState, useEffect } from 'react'
import {
  Package,
  Truck,
  AlertTriangle,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
} from 'lucide-react'
import { useInventoryStore } from '../store'
import {
  MaterialInventory,
  Rake,
  LoadingPoint,
  Siding,
  InventorySummary,
} from '../types'

export default function InventoryDashboard() {
  const [activeTab, setActiveTab] = useState<
    'materials' | 'rakes' | 'loading' | 'sidings' | 'alerts'
  >('materials')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedStockyard, setSelectedStockyard] = useState<string>('all')

  // Get data from store
  const {
    materialInventories,
    rakes,
    loadingPoints,
    sidings,
    materialAlerts,
    rakeAlerts,
    loadingPointAlerts,
    sidingAlerts,
    getInventorySummary,
    getTotalAlerts,
    getCriticalAlerts,
    addMaterialInventory,
    addRake,
    addLoadingPoint,
    addSiding,
  } = useInventoryStore()

  const summary = getInventorySummary()
  const totalAlerts = getTotalAlerts()
  const criticalAlerts = getCriticalAlerts()

  // Mock data for demonstration
  const mockMaterials: MaterialInventory[] = [
    {
      id: 'mat-001',
      materialId: 'coal-001',
      material: {
        id: 'coal-001',
        name: 'Coal',
        type: 'coal',
        density: 1300,
        weight: 1300,
        volume: 1,
        specialHandling: ['dust_control', 'weather_protection'],
        storageRequirements: ['covered', 'ventilated'],
      },
      stockyardId: 'sy-001',
      stockyardName: 'Bokaro Stockyard',
      quantity: 5000,
      quantityUnit: 'tonnes',
      dateReceived: '2025-11-20',
      ageInDays: 4,
      quality: 'A',
      location: 'Section A1',
      status: 'available',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'mat-002',
      materialId: 'iron-001',
      material: {
        id: 'iron-001',
        name: 'Iron Ore',
        type: 'iron_ore',
        density: 2500,
        weight: 2500,
        volume: 1,
        specialHandling: [],
        storageRequirements: ['dry'],
      },
      stockyardId: 'sy-001',
      stockyardName: 'Bokaro Stockyard',
      quantity: 8000,
      quantityUnit: 'tonnes',
      dateReceived: '2025-11-15',
      ageInDays: 9,
      quality: 'A',
      location: 'Section B2',
      status: 'available',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'mat-003',
      materialId: 'limestone-001',
      material: {
        id: 'limestone-001',
        name: 'Limestone',
        type: 'limestone',
        density: 2700,
        weight: 2700,
        volume: 1,
        specialHandling: [],
        storageRequirements: ['dry'],
      },
      stockyardId: 'sy-002',
      stockyardName: 'CMO Stockyard',
      quantity: 3500,
      quantityUnit: 'tonnes',
      dateReceived: '2025-11-18',
      ageInDays: 6,
      quality: 'B',
      location: 'Section C1',
      status: 'available',
      lastUpdated: new Date().toISOString(),
    },
  ]

  const mockRakes: Rake[] = [
    {
      id: 'rake-001',
      rakeId: 'RAKE-001',
      wagons: [],
      totalCapacity: 2000,
      currentLoad: 1800,
      utilizationPercentage: 90,
      status: 'ready',
      assignedLoadingPoint: 'LP-001',
      assignedRoute: 'Bokaro-Kolkata',
      estimatedDispatchTime: '2025-11-25 14:00',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'rake-002',
      rakeId: 'RAKE-002',
      wagons: [],
      totalCapacity: 2000,
      currentLoad: 1200,
      utilizationPercentage: 60,
      status: 'forming',
      assignedLoadingPoint: 'LP-002',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'rake-003',
      rakeId: 'RAKE-003',
      wagons: [],
      totalCapacity: 2000,
      currentLoad: 0,
      utilizationPercentage: 0,
      status: 'available',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    },
  ]

  const mockLoadingPoints: LoadingPoint[] = [
    {
      id: 'lp-001',
      name: 'Loading Point 1',
      location: 'Bokaro Stockyard',
      stockyardId: 'sy-001',
      capacity: 500,
      operationalHours: { start: '06:00', end: '22:00' },
      equipment: ['conveyor', 'loader', 'weighing_scale'],
      compatibleWagonTypes: ['open', 'covered'],
      currentUtilization: 85,
      status: 'operational',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'lp-002',
      name: 'Loading Point 2',
      location: 'CMO Stockyard',
      stockyardId: 'sy-002',
      capacity: 400,
      operationalHours: { start: '06:00', end: '20:00' },
      equipment: ['conveyor', 'loader'],
      compatibleWagonTypes: ['open'],
      currentUtilization: 60,
      status: 'operational',
      lastUpdated: new Date().toISOString(),
    },
  ]

  const mockSidings: Siding[] = [
    {
      id: 'siding-001',
      name: 'Siding A',
      location: 'Bokaro',
      capacity: 10,
      currentOccupancy: 8,
      availableSpace: 2,
      status: 'operational',
      rakes: ['RAKE-001', 'RAKE-002'],
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'siding-002',
      name: 'Siding B',
      location: 'CMO',
      capacity: 8,
      currentOccupancy: 5,
      availableSpace: 3,
      status: 'operational',
      rakes: ['RAKE-003'],
      lastUpdated: new Date().toISOString(),
    },
  ]

  // Initialize with mock data on first load
  useEffect(() => {
    if (materialInventories.length === 0) {
      mockMaterials.forEach((m) => addMaterialInventory(m))
    }
  }, [])

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Inventory Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Real-time tracking of materials, rakes, loading points, and sidings
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Inventory Item
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-blue-600" size={24} />
            <span className="text-sm text-slate-600 dark:text-slate-400">Total Material</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {summary.totalMaterialQuantity.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">tonnes</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="text-green-600" size={24} />
            <span className="text-sm text-slate-600 dark:text-slate-400">Available Rakes</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {summary.availableRakes}
          </p>
          <p className="text-xs text-slate-500 mt-1">out of {rakes.length}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-purple-600" size={24} />
            <span className="text-sm text-slate-600 dark:text-slate-400">Utilization</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {summary.totalRakeUtilization}%
          </p>
          <p className="text-xs text-slate-500 mt-1">rake capacity</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="text-orange-600" size={24} />
            <span className="text-sm text-slate-600 dark:text-slate-400">Warnings</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {summary.warningAlerts}
          </p>
          <p className="text-xs text-slate-500 mt-1">active alerts</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-red-600" size={24} />
            <span className="text-sm text-slate-600 dark:text-slate-400">Critical</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{summary.criticalAlerts}</p>
          <p className="text-xs text-slate-500 mt-1">urgent alerts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'materials', label: 'Materials', icon: Package },
          { id: 'rakes', label: 'Rakes & Wagons', icon: Truck },
          { id: 'loading', label: 'Loading Points', icon: Zap },
          { id: 'sidings', label: 'Sidings', icon: Clock },
          { id: 'alerts', label: `Alerts (${totalAlerts})`, icon: AlertTriangle },
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
        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <select
                value={selectedStockyard}
                onChange={(e) => setSelectedStockyard(e.target.value)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-50"
              >
                <option value="all">All Stockyards</option>
                <option value="sy-001">Bokaro Stockyard</option>
                <option value="sy-002">CMO Stockyard</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockMaterials.map((material) => (
                <div key={material.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-50">
                        {material.material.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {material.stockyardName}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        material.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {material.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Quantity</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-50">
                        {material.quantity.toLocaleString()} tonnes
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Quality</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-50">
                        Grade {material.quality}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Age</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-50">
                        {material.ageInDays} days
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 btn btn-sm btn-outline flex items-center justify-center gap-1">
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button className="flex-1 btn btn-sm btn-outline flex items-center justify-center gap-1 text-red-600">
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rakes Tab */}
        {activeTab === 'rakes' && (
          <div className="space-y-4">
            {mockRakes.map((rake) => (
              <div key={rake.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-50">{rake.rakeId}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {rake.assignedRoute || 'Not assigned'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      rake.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : rake.status === 'ready'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {rake.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Capacity Utilization
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-50">
                        {rake.utilizationPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${rake.utilizationPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {rake.currentLoad} / {rake.totalCapacity} tonnes
                    </p>
                  </div>

                  {rake.estimatedDispatchTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-slate-600 dark:text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        Dispatch: {rake.estimatedDispatchTime}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading Points Tab */}
        {activeTab === 'loading' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockLoadingPoints.map((point) => (
              <div key={point.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-50">{point.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{point.location}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      point.status === 'operational'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {point.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Utilization
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-50">
                        {point.currentUtilization}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          point.currentUtilization > 80 ? 'bg-red-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${point.currentUtilization}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Capacity</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-50">
                      {point.capacity} tonnes/day
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Hours</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-50">
                      {point.operationalHours.start} - {point.operationalHours.end}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1 flex-wrap">
                  {point.equipment.map((eq) => (
                    <span
                      key={eq}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-700 dark:text-slate-300"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sidings Tab */}
        {activeTab === 'sidings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockSidings.map((siding) => (
              <div key={siding.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-50">{siding.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{siding.location}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      siding.availableSpace > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {siding.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Occupancy
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-50">
                        {siding.currentOccupancy} / {siding.capacity}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(siding.currentOccupancy / siding.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Available Space
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-50">
                      {siding.availableSpace} rakes
                    </span>
                  </div>
                </div>

                <div className="text-sm">
                  <p className="text-slate-600 dark:text-slate-400 mb-2">Current Rakes:</p>
                  <div className="flex gap-1 flex-wrap">
                    {siding.rakes.map((rake) => (
                      <span
                        key={rake}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                      >
                        {rake}
                      </span>
                    ))}
                  </div>
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
                        Created: {new Date(alert.createdAt).toLocaleString()}
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
