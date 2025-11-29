import React, { useState } from 'react'
import { Brain, BarChart3, AlertCircle, MessageSquare, Activity } from 'lucide-react'
import MLDashboard from '../components/MLDashboard'
import PredictionsDisplay from '../components/PredictionsDisplay'
import FeedbackForm from '../components/FeedbackForm'
import AlertsDisplay from '../components/AlertsDisplay'
import ModelStatusComponent from '../components/ModelStatusComponent'

export default function MLPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  // Default predictions data
  const defaultPredictions = {
    delay: '2.5 days',
    cost: '₹45,000',
    demand: '850 tonnes',
    quality: '98%',
    fuel: '250 liters',
    route: 'Bokaro-Kolkata',
    cost_opt: '₹40,500',
    time_opt: '18 hours',
    vehicle: 'Truck-003',
    material: 'CR Coils',
    risk: '15%',
    decision: 'Dispatch Now',
    anomaly: 'No Anomalies',
    supplier: '4.8/5',
    scenario: 'Optimistic',
    maintenance: 'No Issues',
    satisfaction: '4.7/5'
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Brain },
    { id: 'predictions', label: 'Predictions', icon: BarChart3 },
    { id: 'status', label: 'Model Status', icon: Activity },
    { id: 'alerts', label: 'Alerts', icon: AlertCircle },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ]

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Brain size={32} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">ML Models Center</h1>
        </div>
        <p className="text-slate-600">Manage, monitor, and interact with all 17 ML models</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'dashboard' && (
          <div>
            <MLDashboard />
          </div>
        )}
        {activeTab === 'predictions' && (
          <div>
            <PredictionsDisplay predictions={defaultPredictions} loading={false} />
          </div>
        )}
        {activeTab === 'status' && (
          <div>
            <ModelStatusComponent />
          </div>
        )}
        {activeTab === 'alerts' && (
          <div>
            <AlertsDisplay />
          </div>
        )}
        {activeTab === 'feedback' && (
          <div>
            <FeedbackForm />
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-3">💡 How to Use ML Models</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <span className="font-semibold">1. Dashboard:</span> View real-time predictions and model performance
          </p>
          <p>
            <span className="font-semibold">2. Predictions:</span> See detailed predictions from all 17 models with confidence scores
          </p>
          <p>
            <span className="font-semibold">3. Model Status:</span> Check health and accuracy of each model
          </p>
          <p>
            <span className="font-semibold">4. Alerts:</span> Monitor system alerts and model warnings
          </p>
          <p>
            <span className="font-semibold">5. Feedback:</span> Provide feedback to help models improve
          </p>
        </div>
      </div>
    </div>
  )
}
