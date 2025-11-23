import React from 'react'
import { Wrench } from 'lucide-react'

export default function MaintenanceAlerts() {
  const items = [
    { id: 1, equipment: 'Truck Fleet A', risk: 78, failure: '15 days', ignored: '₹45,000', preventive: '₹8,000' },
    { id: 2, equipment: 'Loading Equipment LP1', risk: 62, failure: '25 days', ignored: '₹32,000', preventive: '₹5,500' },
    { id: 3, equipment: 'Truck Fleet B', risk: 45, failure: '45 days', ignored: '₹28,000', preventive: '₹3,200' },
  ]

  const getRiskLevel = (r) => r > 70 ? 'Critical' : r > 50 ? 'High' : 'Medium'
  const getRiskColor = (r) => r > 70 ? 'text-red-600' : r > 50 ? 'text-orange-600' : 'text-yellow-600'

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Predictive Maintenance</h2>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="card border-l-4 border-red-500 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Wrench size={18} className="text-red-600" />
                  {item.equipment}
                </h3>
                <p className={`text-sm font-bold mt-1 ${getRiskColor(item.risk)}`}>{getRiskLevel(item.risk)} Risk</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">{item.risk}%</p>
                <p className="text-xs text-slate-500">Risk Score</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-200">
              <div><p className="text-xs text-slate-500">Est. Failure</p><p className="text-sm font-bold text-slate-900">{item.failure}</p></div>
              <div><p className="text-xs text-slate-500">Cost if Ignored</p><p className="text-sm font-bold text-red-600">{item.ignored}</p></div>
              <div><p className="text-xs text-slate-500">Preventive Cost</p><p className="text-sm font-bold text-green-600">{item.preventive}</p></div>
            </div>

            <button className="mt-3 btn btn-sm btn-primary">Schedule Maintenance</button>
          </div>
        ))}
      </div>
    </div>
  )
}
