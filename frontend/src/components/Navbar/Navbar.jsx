import React from 'react'
import { Bell, User, Activity } from 'lucide-react'

export default function Navbar({ isHealthy }) {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Logistics Optimization System
          </h2>
          <div className="flex items-center gap-2">
            <Activity size={16} className={isHealthy ? 'text-green-500' : 'text-red-500'} />
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
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <User size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    </nav>
  )
}
