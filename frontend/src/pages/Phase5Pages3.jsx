import React from 'react'
import { SupplierScorecard, RiskDashboard, SustainabilityDashboard } from '../components/BusinessPages3'
import { Users, AlertTriangle, Leaf } from 'lucide-react'

// Supplier Management Page
export function SupplierManagementPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Supplier Management</h1>
        <p className="text-slate-600 mt-1">Monitor supplier performance and contracts</p>
      </div>

      <SupplierScorecard />
    </div>
  )
}

// Risk Management Page
export function RiskManagementPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Risk Management</h1>
        <p className="text-slate-600 mt-1">Identify and mitigate supply chain risks</p>
      </div>

      <RiskDashboard />
    </div>
  )
}

// Sustainability Page
export function SustainabilityPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Sustainability</h1>
        <p className="text-slate-600 mt-1">Track environmental and ESG metrics</p>
      </div>

      <SustainabilityDashboard />
    </div>
  )
}
