import React from 'react'
import { Lightbulb } from 'lucide-react'

export default function RecommendationsEngine() {
  const recommendations = [
    { id: 1, title: 'Switch Route', description: 'Bokaro->Dhanbad to Bokaro->Hatia', reason: 'Reduces risk 85% → 35%', impact: 'High', savings: '₹15,000', confidence: 92 },
    { id: 2, title: 'Optimal Dispatch Time', description: '6:00 AM instead of 2:00 PM', reason: 'Better weather', impact: 'Medium', savings: '₹8,500', confidence: 78 },
    { id: 3, title: 'Material Change', description: 'Use CR_Coils instead of HR_Coils', reason: 'Better for weather', impact: 'Medium', savings: '₹5,200', confidence: 85 },
    { id: 4, title: 'Reduce Quantity', description: '400 tonnes instead of 500', reason: 'Lower delay risk', impact: 'Low', savings: '₹3,000', confidence: 88 },
  ]

  const impactColor = { High: 'text-red-600 bg-red-50', Medium: 'text-orange-600 bg-orange-50', Low: 'text-green-600 bg-green-50' }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">AI Recommendations</h2>
      <p className="text-slate-600 text-sm">Smart suggestions to optimize shipments</p>
      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div key={rec.id} className="card border-l-4 border-blue-500 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb size={18} className="text-blue-600" />
                  <h3 className="font-bold text-slate-900">{rec.title}</h3>
                </div>
                <p className="text-sm text-slate-600">{rec.description}</p>
              </div>
              <div className="text-right ml-4">
                <p className={`text-xs font-bold px-2 py-1 rounded ${impactColor[rec.impact]}`}>{rec.impact} Impact</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-200">
              <div><p className="text-xs text-slate-500">Reason</p><p className="text-sm font-medium text-slate-900">{rec.reason}</p></div>
              <div><p className="text-xs text-slate-500">Savings</p><p className="text-sm font-bold text-green-600">{rec.savings}</p></div>
              <div><p className="text-xs text-slate-500">Confidence</p><div className="w-full bg-slate-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${rec.confidence}%` }} /></div><p className="text-xs font-bold text-slate-900 mt-1">{rec.confidence}%</p></div>
            </div>
            <button className="mt-3 btn btn-sm btn-primary">Accept</button>
          </div>
        ))}
      </div>
    </div>
  )
}
