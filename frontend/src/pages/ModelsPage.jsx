import React, { useEffect, useState } from 'react'
import { getModels } from '../api/endpoints'
import { Brain, CheckCircle, AlertCircle } from 'lucide-react'
import Spinner from '../components/UI/Spinner'

export default function ModelsPage() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await getModels()
        setModels(data.data?.models || [])
      } catch (error) {
        console.error('Failed to fetch models:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">ML Models</h1>

      {loading ? (
        <div className="card flex items-center justify-center py-12">
          <Spinner text="Loading models..." />
        </div>
      ) : (
        <div className="card">
          <div className="space-y-3">
            {models.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No models available</p>
            ) : (
              models.map((model, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="text-blue-600" size={24} />
                    <div>
                      <p className="font-medium text-slate-900">{model.name}</p>
                      <p className="text-sm text-slate-600">v{model.version}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {model.status === 'loaded' ? (
                      <>
                        <CheckCircle className="text-green-600" size={20} />
                        <span className="text-sm text-green-600 font-medium">Loaded</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="text-red-600" size={20} />
                        <span className="text-sm text-red-600 font-medium">Failed</span>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
