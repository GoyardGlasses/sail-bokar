/**
 * DatabaseStatus Component
 * Shows database connection status and record count
 */

import { useEffect, useState } from 'react'
import { Database, AlertCircle, CheckCircle } from 'lucide-react'
import useDatabase from '../hooks/useDatabase'

export default function DatabaseStatus() {
  const { checkDatabaseHealth } = useDatabase()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      const health = await checkDatabaseHealth()
      setStatus(health)
      setLoading(false)
    }

    checkStatus()
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [checkDatabaseHealth])

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <Database className="w-4 h-4 text-gray-500 animate-spin" />
        <span className="text-sm text-gray-600 dark:text-gray-400">Checking database...</span>
      </div>
    )
  }

  const isConnected = status?.connected

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
      isConnected 
        ? 'bg-green-100 dark:bg-green-900' 
        : 'bg-red-100 dark:bg-red-900'
    }`}>
      {isConnected ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-700 dark:text-green-300">
            Database: {status?.records?.total || 0} records
          </span>
        </>
      ) : (
        <>
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-700 dark:text-red-300">
            Database: Disconnected
          </span>
        </>
      )}
    </div>
  )
}
