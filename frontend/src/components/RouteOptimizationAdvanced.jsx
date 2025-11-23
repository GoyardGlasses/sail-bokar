import React, { useState } from 'react'
import { Route } from 'lucide-react'

export default function RouteOptimization() {
  const [goal, setGoal] = useState('balanced')
  const [optimized, setOptimized] = useState(null)

  const routes = [
    { route: 'Bokaro->Kolkata', cost: 1200, time: 8, risk: 0.12, efficiency: 85 },
    { route: 'Bokaro->Hatia', cost: 950, time: 6, risk: 0.15, efficiency: 78 },
    { route: 'Bokaro->Dhanbad', cost: 800, time: 4, risk: 0.21, efficiency: 65 },
    { route: 'Bokaro->Patna', cost: 1100, time: 7, risk: 0.08, efficiency: 92 },
    { route: 'Bokaro->Ranchi', cost: 900, time: 5, risk: 0.10, efficiency: 88 },
  ]

  const handleOptimize = () => {
    let sorted = [...routes]
    if (goal === 'cost') sorted.sort((a, b) => a.cost - b.cost)
    else if (goal === 'time') sorted.sort((a, b) => a.time - b.time)
    else if (goal === 'safety') sorted.sort((a, b) => a.risk - b.risk)
    else sorted.sort((a, b) => b.efficiency - a.efficiency)
    setOptimized(sorted)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Route Optimization</h2>

      <div className="card space-y-4">
        <h3 className="font-bold text-slate-900">Select Optimization Goal</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { id: 'cost', label: 'Minimize Cost', icon: '💰' },
            { id: 'time', label: 'Minimize Time', icon: '⏱️' },
            { id: 'safety', label: 'Maximize Safety', icon: '🛡️' },
            { id: 'balanced', label: 'Balanced', icon: '⚖️' },
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => setGoal(g.id)}
              className={`p-3 rounded-lg border-2 transition-all ${goal === g.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
            >
              <span className="text-2xl">{g.icon}</span>
              <p className="text-sm font-medium text-slate-900 mt-1">{g.label}</p>
            </button>
          ))}
        </div>
        <button onClick={handleOptimize} className="w-full btn btn-primary">
          <Route size={18} className="inline mr-2" />
          Optimize Routes
        </button>
      </div>

      {optimized && (
        <div className="card">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Optimized Ranking</h3>
          <div className="space-y-3">
            {optimized.map((r, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-2 ${idx === 0 ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-green-600 text-white' : 'bg-slate-200'}`}>{idx + 1}</span>
                  <h4 className="font-bold text-slate-900">{r.route}</h4>
                  {idx === 0 && <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-bold">RECOMMENDED</span>}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div><p className="text-xs text-slate-500">Cost</p><p className="text-lg font-bold">₹{r.cost}</p></div>
                  <div><p className="text-xs text-slate-500">Time</p><p className="text-lg font-bold">{r.time}h</p></div>
                  <div><p className="text-xs text-slate-500">Risk</p><p className="text-lg font-bold">{(r.risk * 100).toFixed(0)}%</p></div>
                  <div><p className="text-xs text-slate-500">Efficiency</p><p className="text-lg font-bold">{r.efficiency}%</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
