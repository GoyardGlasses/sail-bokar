import React from 'react'
import { QualityMetricsDisplay, ShipmentTracking, DemandPlanningDashboard } from '../components/BusinessPages2'
import { CheckCircle, MapPin, TrendingUp } from 'lucide-react'

// Quality Control Page
export function QualityControlPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Quality Control</h1>
        <p className="text-slate-600 mt-1">Monitor quality metrics and defect trends</p>
      </div>

      <QualityMetricsDisplay />
    </div>
  )
}

// Supply Chain Visibility Page
export function SupplyChainPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Supply Chain Visibility</h1>
        <p className="text-slate-600 mt-1">Real-time shipment tracking and monitoring</p>
      </div>

      <ShipmentTracking />
    </div>
  )
}

// Demand Planning Page
export function DemandPlanningPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Demand Planning</h1>
        <p className="text-slate-600 mt-1">Forecast demand and plan inventory</p>
      </div>

      <DemandPlanningDashboard />
    </div>
  )
}
