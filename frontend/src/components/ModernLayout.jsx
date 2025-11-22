import React, { useState } from 'react'
import { Menu, X, Bell, Settings, LogOut, Search, ChevronDown } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

const ModernLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Operations Hub', path: '/operations-hub', icon: '🎯' },
    { label: 'Rake Planner', path: '/rake-planner', icon: '🚂' },
    { label: 'AI Forecast', path: '/ai-forecast', icon: '🤖' },
    { label: 'Blockchain', path: '/blockchain', icon: '⛓️' },
    { label: 'Advanced Optimization', path: '/advanced-optimization', icon: '⚡' },
    { label: 'Scenario Analysis', path: '/scenario-analysis', icon: '📈' },
    { label: '3D Visualization', path: '/visualization-3d', icon: '🎨' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <div
        className={clsx(
          'fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-800 transition-all duration-300 z-40',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className={clsx('flex items-center gap-3', !sidebarOpen && 'justify-center w-full')}>
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            {sidebarOpen && <span className="text-white font-bold text-lg">SAIL</span>}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="mt-8 space-y-2 px-3">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive(item.path)
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
              title={item.label}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className={clsx('flex-1 flex flex-col transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-20')}>
        {/* Top Navigation Bar */}
        <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-2 w-64">
              <Search size={18} className="text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-white placeholder-slate-500 outline-none flex-1 text-sm"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button className="text-slate-400 hover:text-white transition-colors">
              <Settings size={20} />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <ChevronDown size={16} />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 z-50">
                  <button className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 flex items-center gap-2">
                    <Settings size={16} /> Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 flex items-center gap-2">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-slate-950">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default ModernLayout
