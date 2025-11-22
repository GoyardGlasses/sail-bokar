import React, { useEffect } from 'react'
import { Activity, Moon, Sun, LogOut } from 'lucide-react'
import { checkHealth } from '../../api/endpoints'
import { useAppStore } from '../../store/useAppStore'

/**
 * Navbar - Top navigation component
 */
export default function Navbar() {
  const { isHealthy, setIsHealthy, theme, setTheme } = useAppStore()

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        await checkHealth()
        setIsHealthy(true)
      } catch {
        setIsHealthy(false)
      }
    }

    checkBackendHealth()
    const interval = setInterval(checkBackendHealth, 30000)
    return () => clearInterval(interval)
  }, [setIsHealthy])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Logistics Optimization System
          </h2>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100">
            <Activity size={16} className={isHealthy ? 'text-green-600' : 'text-red-600'} />
            <span className="text-sm font-medium">
              {isHealthy ? (
                <span className="text-green-600">Backend Connected</span>
              ) : (
                <span className="text-red-600">Backend Offline</span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon size={20} className="text-slate-600" />
            ) : (
              <Sun size={20} className="text-slate-600" />
            )}
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Logout">
            <LogOut size={20} className="text-slate-600" />
          </button>
        </div>
      </div>
    </nav>
  )
}
