/**
 * Product vs Wagon Matrix Dashboard
 * Compatibility matrix visualization and management
 */

import React, { useState } from 'react'
import {
  Grid3x3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Settings,
  Plus,
  Trash2,
  Edit2,
} from 'lucide-react'

export default function ProductWagonMatrixDashboard() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'products' | 'wagons' | 'constraints'>('matrix')
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddWagon, setShowAddWagon] = useState(false)

  // Mock data
  const mockProducts: Product[] = [
    {
      id: 'coal-001',
      name: 'Coal',
      type: 'coal',
      density: 1400,
      weight: 1400,
      volume: 1,
      specialHandling: ['dust_control'],
      storageRequirements: ['covered'],
      hazardous: false,
      maxStackHeight: 5,
    },
    {
      id: 'iron-001',
      name: 'Iron Ore',
      type: 'iron_ore',
      density: 2500,
      weight: 2500,
      volume: 1,
      specialHandling: [],
      storageRequirements: ['open'],
      hazardous: false,
      maxStackHeight: 8,
    },
    {
      id: 'limestone-001',
      name: 'Limestone',
      type: 'limestone',
      density: 2700,
      weight: 2700,
      volume: 1,
      specialHandling: [],
      storageRequirements: ['open'],
      hazardous: false,
      maxStackHeight: 6,
    },
  ]

  const mockWagons: WagonType[] = [
    {
      id: 'wagon-open-001',
      name: 'Open Wagon 30T',
      capacity: 30,
      volume: 35,
      type: 'open',
      loadingEquipment: ['conveyor', 'loader'],
      unloadingEquipment: ['dumper'],
      maxLoadingTime: 120,
      costPerKm: 50,
      maintenanceSchedule: 30,
    },
    {
      id: 'wagon-covered-001',
      name: 'Covered Wagon 25T',
      capacity: 25,
      volume: 28,
      type: 'covered',
      loadingEquipment: ['conveyor'],
      unloadingEquipment: ['manual'],
      maxLoadingTime: 180,
      costPerKm: 60,
      maintenanceSchedule: 30,
    },
    {
      id: 'wagon-tanker-001',
      name: 'Tanker 20T',
      capacity: 20,
      volume: 22,
      type: 'tanker',
      loadingEquipment: ['pump'],
      unloadingEquipment: ['pump'],
      maxLoadingTime: 90,
      costPerKm: 70,
      maintenanceSchedule: 15,
    },
  ]

  const mockCompatibilities: Compatibility[] = [
    {
      productId: 'coal-001',
      wagonTypeId: 'wagon-covered-001',
      isCompatible: true,
      efficiency: 95,
      safetyRating: 98,
      utilizationRating: 92,
      notes: 'Excellent compatibility',
      constraints: [],
      recommendations: ['Use for long-distance transport'],
    },
    {
      productId: 'coal-001',
      wagonTypeId: 'wagon-open-001',
      isCompatible: false,
      efficiency: 30,
      safetyRating: 20,
      utilizationRating: 40,
      notes: 'Dust exposure risk',
      constraints: ['dust_control_required'],
      recommendations: ['Not recommended for coal transport'],
    },
    {
      productId: 'iron-001',
      wagonTypeId: 'wagon-open-001',
      isCompatible: true,
      efficiency: 98,
      safetyRating: 99,
      utilizationRating: 95,
      notes: 'Perfect match',
      constraints: [],
      recommendations: ['Preferred option'],
    },
    {
      productId: 'limestone-001',
      wagonTypeId: 'wagon-open-001',
      isCompatible: true,
      efficiency: 92,
      safetyRating: 95,
      utilizationRating: 90,
      notes: 'Good compatibility',
      constraints: [],
      recommendations: ['Standard option'],
    },
  ]

  const analysis = { 
    totalCompatibilities: 9, 
    compatiblePairs: 8, 
    incompatibilities: 1, 
    utilizationScore: 88.9,
    totalProducts: mockProducts.length,
    totalWagons: mockWagons.length,
    compatibilityPercentage: 88.9,
    averageEfficiency: 91.5,
    criticalConstraints: 1
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Product vs Wagon Matrix
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Compatibility rules and constraints
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddProduct(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Product
          </button>
          <button
            onClick={() => setShowAddWagon(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Wagon
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Products</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {analysis.totalProducts}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Wagon Types</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {analysis.totalWagons}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Compatible</p>
          <p className="text-2xl font-bold text-green-600">
            {analysis.compatibilityPercentage.toFixed(0)}%
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Avg Efficiency</p>
          <p className="text-2xl font-bold text-blue-600">
            {analysis.averageEfficiency.toFixed(0)}%
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400">Critical Issues</p>
          <p className="text-2xl font-bold text-red-600">
            {analysis.criticalConstraints}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'matrix', label: 'Matrix', icon: Grid3x3 },
          { id: 'products', label: 'Products', icon: TrendingUp },
          { id: 'wagons', label: 'Wagons', icon: Settings },
          { id: 'constraints', label: 'Constraints', icon: AlertTriangle },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`px-4 py-2 font-medium flex items-center gap-2 border-b-2 transition ${
              activeTab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 dark:text-slate-400'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Matrix Tab */}
        {activeTab === 'matrix' && (
          <div className="card overflow-x-auto">
            <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">
              Compatibility Matrix
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-50">
                    Product
                  </th>
                  {mockWagons.map((wagon) => (
                    <th
                      key={wagon.id}
                      className="text-center py-3 px-4 font-semibold text-slate-900 dark:text-slate-50"
                    >
                      {wagon.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-50">
                      {product.name}
                    </td>
                    {mockWagons.map((wagon) => {
                      const compat = mockCompatibilities.find(
                        (c) => c.productId === product.id && c.wagonTypeId === wagon.id
                      )
                      return (
                        <td key={wagon.id} className="text-center py-3 px-4">
                          {compat ? (
                            <div className="flex flex-col items-center gap-1">
                              {compat.isCompatible ? (
                                <CheckCircle className="text-green-600" size={20} />
                              ) : (
                                <XCircle className="text-red-600" size={20} />
                              )}
                              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                {compat.efficiency}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {mockProducts.map((product) => {
              const analysis = analyzeProduct(product.id)
              return (
                <div key={product.id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-50">
                        {product.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {product.type} • Density: {product.density} kg/m³
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Compatible Wagons
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {analysis.compatibleWagons.length}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                      <p className="text-slate-600 dark:text-slate-400">Avg Efficiency</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {analysis.averageEfficiency.toFixed(0)}%
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                      <p className="text-slate-600 dark:text-slate-400">Constraints</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {analysis.constraints.length}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Wagons Tab */}
        {activeTab === 'wagons' && (
          <div className="space-y-4">
            {mockWagons.map((wagon) => {
              const analysis = analyzeWagon(wagon.id)
              return (
                <div key={wagon.id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-50">
                        {wagon.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {wagon.type} • Capacity: {wagon.capacity}T • Cost: ₹{wagon.costPerKm}/km
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Compatible Products
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {analysis.compatibleProducts.length}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                      <p className="text-slate-600 dark:text-slate-400">Avg Efficiency</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {analysis.averageEfficiency.toFixed(0)}%
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                      <p className="text-slate-600 dark:text-slate-400">Constraints</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {analysis.constraints.length}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Constraints Tab */}
        {activeTab === 'constraints' && (
          <div className="space-y-4">
            {constraints.length === 0 ? (
              <div className="card text-center py-8">
                <CheckCircle className="mx-auto text-green-600 mb-3" size={32} />
                <p className="text-slate-600 dark:text-slate-400">No constraints defined</p>
              </div>
            ) : (
              constraints.map((constraint) => (
                <div key={constraint.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {constraint.type}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {constraint.reason}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        constraint.severity === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {constraint.severity}
                    </span>
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
