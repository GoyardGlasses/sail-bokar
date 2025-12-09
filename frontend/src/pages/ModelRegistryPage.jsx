/**
 * Model Registry & A/B Testing Dashboard - Phase 3 Feature 2
 */

import React, { useState, useEffect } from 'react'
import { GitBranch, CheckCircle, AlertCircle, TrendingUp, Plus, RefreshCw } from 'lucide-react'

export default function ModelRegistryPage() {
  const [status, setStatus] = useState(null)
  const [models, setModels] = useState([])
  const [abTests, setAbTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState(null)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    // Mock data
    const mockStatus = {
      status: 'running',
      total_models: 8,
      production_models: 5,
      active_ab_tests: 2,
      timestamp: new Date().toISOString()
    }

    const mockModels = [
      { id: 'MODEL-001', name: 'delay_prediction', version: 'v2.1', status: 'production', accuracy: 0.85, created_at: new Date().toISOString() },
      { id: 'MODEL-002', name: 'cost_prediction', version: 'v1.9', status: 'production', accuracy: 0.82, created_at: new Date().toISOString() },
      { id: 'MODEL-003', name: 'demand_forecast', version: 'v2.0', status: 'staging', accuracy: 0.88, created_at: new Date().toISOString() },
    ]

    const mockABTests = [
      { id: 'AB-001', model_name: 'delay_prediction', version_a: 'v2.0', version_b: 'v2.1', traffic_split: 0.5, status: 'running', winner: null, created_at: new Date().toISOString() },
      { id: 'AB-002', model_name: 'cost_prediction', version_a: 'v1.8', version_b: 'v1.9', traffic_split: 0.5, status: 'completed', winner: 'v1.9', created_at: new Date().toISOString() },
    ]

    try {
      const [statusRes, modelsRes, testsRes] = await Promise.all([
        fetch('/api/models/status').catch(() => null),
        fetch('/api/models/versions').catch(() => null),
        fetch('/api/models/ab-tests').catch(() => null),
      ])

      try {
        const statusData = statusRes ? await statusRes.json() : mockStatus
        const modelsData = modelsRes ? await modelsRes.json() : { models: mockModels }
        const testsData = testsRes ? await testsRes.json() : { tests: mockABTests }

        setStatus(statusData || mockStatus)
        setModels((modelsData?.models) || mockModels)
        setAbTests((testsData?.tests) || mockABTests)
      } catch {
        setStatus(mockStatus)
        setModels(mockModels)
        setAbTests(mockABTests)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setStatus(mockStatus)
      setModels(mockModels)
      setAbTests(mockABTests)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <GitBranch className="mx-auto text-blue-600 mb-4 animate-spin" size={48} />
          <p className="text-slate-600 dark:text-slate-400">Loading model registry...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Model Registry & A/B Testing
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage model versions and run A/B tests
          </p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus size={18} />
          Register Model
        </button>
      </div>

      {/* Status Cards */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Models</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{status.total_models}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Production</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{status.production_models}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Active A/B Tests</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">{status.active_ab_tests}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-2 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              Running
            </p>
          </div>
        </div>
      )}

      {/* Models */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
          Model Versions
        </h3>
        <div className="space-y-3">
          {models.map((model) => (
            <div
              key={model.id}
              className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedModel(model)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-slate-50">
                    {model.name} - {model.version}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Accuracy: {(model.accuracy * 100).toFixed(1)}%
                  </p>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-semibold ${
                  model.status === 'production'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {model.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* A/B Tests */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
          A/B Tests
        </h3>
        <div className="space-y-3">
          {abTests.map((test) => (
            <div
              key={test.id}
              className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-50">
                    {test.model_name}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {test.version_a} vs {test.version_b}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-semibold ${
                  test.status === 'running'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                }`}>
                  {test.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <p className="text-slate-600 dark:text-slate-400">
                  Traffic Split: {(test.traffic_split * 100).toFixed(0)}% / {((1 - test.traffic_split) * 100).toFixed(0)}%
                </p>
                {test.winner && (
                  <p className="text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircle size={16} />
                    Winner: {test.winner}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
