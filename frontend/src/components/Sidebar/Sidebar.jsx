import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Zap,
  BarChart3,
  Brain,
  Settings,
  ChevronDown,
} from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ShoppingCart, label: 'Orders', path: '/orders' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: Zap, label: 'Rake Planner', path: '/rake-planner' },
  { icon: BarChart3, label: 'Results', path: '/optimize-result' },
  { icon: Brain, label: 'ML Models', path: '/ml-models' },
  { icon: Settings, label: 'Admin', path: '/admin' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 bg-gradient-to-b from-primary-900 to-primary-800 text-white shadow-lg">
      <div className="p-6 border-b border-primary-700">
        <h1 className="text-2xl font-bold">SAIL Bokaro</h1>
        <p className="text-sm text-primary-200">Logistics Optimizer</p>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-primary-100 hover:bg-primary-700'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-700 bg-primary-900">
        <div className="text-xs text-primary-300">
          <p>Version 1.0.0</p>
          <p>© 2025 SAIL Bokaro</p>
        </div>
      </div>
    </aside>
  )
}
