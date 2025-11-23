import React from 'react'
import { AlertTriangle } from 'lucide-react'

export default function AnomalyDetection() {
  const anomalies = [
    { id: 1, type: 'Delay Spike', route: 'Bokaro->Dhanbad', severity: 'High', desc: 'Unusual delay pattern', date: '2025-11-23', cause: 'Equipment failure', action: 'Investigate immediately' },
    { id: 2, type: 'Prediction Drift', route: 'All Routes', severity: 'Medium', desc: 'Model accuracy declining', date: '2025-11-22', cause: 'Data distribution change', action: 'Retrain model' },
    { id: 3, type: 'Route Anomaly', route: 'Bokaro->Kolkata', severity: 'Low', desc: 'Performance degradation', date: '2025-11-21', cause: 'Weather pattern change', action: 'Monitor closely' },
  ]

  const severityColor = {
    High: 'bg-red-50 border-red-200 text-red-900',
    Medium: 'bg-orange-50 border-orange-200 text-orange-900',
    Low: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Anomaly Detection</h2>

      <div className="space-y-4">
        {anomalies.map((a) => (
          <div key={a.id} className={`card border-2 p-4 ${severityColor[a.severity]}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={18} />
                  <h3 className="font-bold">{a.type}</h3>
                </div>
                <p className="text-sm">{a.desc}</p>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded bg-white">{a.severity}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-current border-opacity-20">
              <div><p className="text-xs opacity-75">Route</p><p className="font-bold">{a.route}</p></div>
              <div><p className="text-xs opacity-75">Root Cause</p><p className="font-bold">{a.cause}</p></div>
              <div><p className="text-xs opacity-75">Recommended Action</p><p className="font-bold">{a.action}</p></div>
            </div>

            <p className="text-xs opacity-75 mt-3">{a.date}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
