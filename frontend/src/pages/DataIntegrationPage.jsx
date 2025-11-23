import React, { useState } from 'react'
import { ConnectorManager, ETLJobsManager, DataQualityDashboard, FileUploadComponent } from '../components/DataIntegration'
import { Zap, Settings, BarChart3, Upload } from 'lucide-react'

export default function DataIntegrationPage() {
  const [activeTab, setActiveTab] = useState('connectors')

  const tabs = [
    { id: 'connectors', label: 'Connectors', icon: Settings },
    { id: 'jobs', label: 'ETL Jobs', icon: Zap },
    { id: 'quality', label: 'Quality', icon: BarChart3 },
    { id: 'upload', label: 'Upload', icon: Upload },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Data Integration & ETL</h1>
        <p className="text-slate-600 mt-1">Connect data sources and manage ETL pipelines</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'connectors' && <ConnectorManager />}
        {activeTab === 'jobs' && <ETLJobsManager />}
        {activeTab === 'quality' && <DataQualityDashboard />}
        {activeTab === 'upload' && <FileUploadComponent />}
      </div>
    </div>
  )
}
