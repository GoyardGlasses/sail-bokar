/**
 * Inventory Management Dashboard
 * Complete inventory system with material, rake, loading point, and siding management
 */

import React, { useState, useEffect } from 'react'
import {
  Package,
  Truck,
  Zap,
  Clock,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  AlertCircle,
} from 'lucide-react'
import { inventoryMockData } from '../../../services/mockData'
import { useImportedData } from '../../../hooks/useImportedData'

export default function InventoryDashboard() {
  const [activeTab, setActiveTab] = useState('materials')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<any>({})
  const { data: importedData, isLoaded } = useImportedData()

  // Use imported data if available, otherwise use mock data
  const [materials, setMaterials] = useState(inventoryMockData.materials)
  const [rakes, setRakes] = useState(inventoryMockData.rakes)
  const [loadingPoints, setLoadingPoints] = useState(inventoryMockData.loadingPoints)
  const [sidings, setSidings] = useState(inventoryMockData.sidings)

  // Load from imported data or localStorage on mount
  useEffect(() => {
    if (!isLoaded) return

    try {
      // Helper to enrich materials with non-zero quantity/price
      const enrichMaterials = (rawMaterials: any[] | undefined | null) => {
        if (!rawMaterials || rawMaterials.length === 0) return undefined
        return rawMaterials.map((m, index) => {
          const fallback = inventoryMockData.materials[index % inventoryMockData.materials.length]

          // Support multiple schemas: quantity/price or availableQuantity/unitPrice
          const rawQuantity = Number(
            m?.quantity ?? m?.availableQuantity ?? 0
          )
          const rawPrice = Number(
            m?.price ?? m?.unitPrice ?? 0
          )

          const quantity = rawQuantity > 0
            ? rawQuantity
            : Number(fallback?.quantity ?? 0)

          const price = rawPrice > 0
            ? rawPrice
            : Number(fallback?.price ?? 0)

          return {
            ...m,
            quantity,
            price,
          }
        })
      }

      // Priority: Imported data > Stored data > Mock data
      if (importedData?.materials) {
        const enriched = enrichMaterials(importedData.materials)
        if (enriched) setMaterials(enriched)
      } else {
        const storedMaterials = localStorage.getItem('dynamic_materials')
        if (storedMaterials) {
          const parsed = JSON.parse(storedMaterials)
          const enriched = enrichMaterials(parsed)
          if (enriched) setMaterials(enriched)
        }
      }

      if (importedData?.rakes) {
        setRakes(importedData.rakes)
      } else {
        const storedRakes = localStorage.getItem('dynamic_rakes')
        if (storedRakes) setRakes(JSON.parse(storedRakes))
      }

      if (importedData?.loadingPoints) {
        setLoadingPoints(importedData.loadingPoints)
      } else {
        const storedLoadingPoints = localStorage.getItem('dynamic_loadingPoints')
        if (storedLoadingPoints) setLoadingPoints(JSON.parse(storedLoadingPoints))
      }

      if (importedData?.sidings) {
        setSidings(importedData.sidings)
      } else {
        const storedSidings = localStorage.getItem('dynamic_sidings')
        if (storedSidings) setSidings(JSON.parse(storedSidings))
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }, [isLoaded, importedData])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('dynamic_materials', JSON.stringify(materials))
  }, [materials])

  useEffect(() => {
    localStorage.setItem('dynamic_rakes', JSON.stringify(rakes))
  }, [rakes])

  useEffect(() => {
    localStorage.setItem('dynamic_loadingPoints', JSON.stringify(loadingPoints))
  }, [loadingPoints])

  useEffect(() => {
    localStorage.setItem('dynamic_sidings', JSON.stringify(sidings))
  }, [sidings])

  const totalMaterials = materials.length
  const totalRakes = rakes.length
  const totalLoadingPoints = loadingPoints.length
  const totalSidings = sidings.length
  const totalQuantity = materials.reduce((sum, m) => sum + (m?.quantity ?? 0), 0)

  // Render function
  const renderContent = () => {
    switch(activeTab) {
      case 'materials':
        return (
          <div className="space-y-3">
            {materials.map((m) => (
              <div key={m.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-50">{m.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{m.stockyard}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-slate-50">{(m?.quantity ?? 0).toLocaleString()}t</p>
                    <p className="text-xs text-slate-500">₹{(m?.price ?? 0).toLocaleString()}/t</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      case 'rakes':
        return (
          <div className="space-y-3">
            {rakes.map((r) => (
              <div key={r.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-50">{r.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{r.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-slate-50">{r.capacity}t</p>
                    <p className="text-xs text-slate-500">{r.utilization}% utilized</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      case 'loading':
        return (
          <div className="space-y-3">
            {loadingPoints.map((lp) => (
              <div key={lp.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-50">{lp.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{lp.material}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-slate-50">{lp.utilization}%</p>
                    <p className="text-xs text-slate-500">{lp.throughput}t/day</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      case 'sidings':
        return (
          <div className="space-y-3">
            {sidings.map((s) => (
              <div key={s.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-50">{s.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{s.rakes} rakes</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-slate-50">{s.available}/{s.capacity}</p>
                    <p className="text-xs text-slate-500">{s.occupancy}% occupied</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Inventory Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Real-time tracking of materials, rakes, loading points, and sidings
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Materials</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{totalMaterials}</p>
          <p className="text-xs text-slate-500 mt-1">{Number.isFinite(totalQuantity) ? totalQuantity.toLocaleString() : (0).toLocaleString()}t</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Rakes</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{totalRakes}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Loading Points</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{totalLoadingPoints}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Sidings</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{totalSidings}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'materials', label: 'Materials' },
          { id: 'rakes', label: 'Rakes' },
          { id: 'loading', label: 'Loading Points' },
          { id: 'sidings', label: 'Sidings' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 dark:text-slate-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>{renderContent()}</div>
    </div>
  )
}
