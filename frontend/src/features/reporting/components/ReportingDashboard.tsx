import React from 'react'
import { FileText } from 'lucide-react'

export default function ReportingDashboard() {
  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Reporting & Analytics</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Comprehensive reporting and analytics</p>
      </div>
      <div className="card text-center py-12">
        <FileText className="mx-auto text-slate-400 mb-4" size={48} />
        <p className="text-slate-600 dark:text-slate-400">Reporting dashboard loaded</p>
      </div>
    </div>
  )
}
