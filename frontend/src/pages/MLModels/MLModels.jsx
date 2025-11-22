import React, { useEffect, useState } from 'react'
import { getModels } from '../../api/endpoints'
import { Brain, CheckCircle, AlertCircle } from 'lucide-react'

export default function MLModels() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await getModels()
        setModels(data.data.models || [])
      } catch (error) {
        console.error('Failed to fetch models:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">ML Models</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-3">
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading models...</p>
          ) : models.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No models available</p>
          ) : (
            models.map((model, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Brain className="text-primary-600" size={24} />
                  <div>
                    <p className="font-medium text-gray-900">{model.name}</p>
                    <p className="text-sm text-gray-600">v{model.version}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {model.status === 'loaded' ? (
                    <>
                      <CheckCircle className="text-green-500" size={20} />
                      <span className="text-sm text-green-600">Loaded</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="text-red-500" size={20} />
                      <span className="text-sm text-red-600">Failed</span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
