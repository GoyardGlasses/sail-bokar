import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  AlertCircle,
  Zap,
  DollarSign,
  Truck,
  Brain,
  Settings,
  ChevronRight,
  Lightbulb,
  Layers,
  Box,
  Map,
  GitBranch,
  Package,
  ShoppingCart,
  Train,
  Grid3x3,
  Route,
  BarChart3,
  Lightbulb as Recommendation,
  Lock,
  Activity,
  FileText,
  Monitor,
  Warehouse,
  Upload,
  MessageCircle,
  Database,
  BookOpen,
  Navigation,
  Mail,
  RefreshCw,
  Clock,
  MapPin,
} from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Map, label: 'Operations Hub', path: '/operations-hub' },
  { icon: Brain, label: 'Ops ML Decisions', path: '/operations-ml' },
  { icon: TrendingUp, label: 'Demand', path: '/demand' },
  { icon: AlertCircle, label: 'Delay Prediction', path: '/delay' },
  { icon: Zap, label: 'Throughput', path: '/throughput' },
  { icon: Clock, label: 'Min Loading Time', path: '/minimum-loading-time' },
  { icon: Zap, label: 'Throughput Optimization', path: '/throughput-optimization' },
  { icon: DollarSign, label: 'Cost', path: '/cost' },
  { icon: Truck, label: 'Optimize', path: '/optimize' },
  // Advanced Features
  { icon: Lightbulb, label: 'AI Forecast', path: '/ai-forecast' },
  
  { icon: Layers, label: 'Advanced Opt', path: '/advanced-optimization' },
  
  { icon: Map, label: 'Scenario Analysis', path: '/scenario-analysis' },
  
  // DATA IMPORT SECTION
  { type: 'divider', label: '📥 DATA MANAGEMENT' },
  { icon: Upload, label: 'Data Import Center', path: '/data-import' },
  { icon: Package, label: 'Material Availability', path: '/material-availability' },
  
  // NEW 10 FEATURES SECTION
  { type: 'divider', label: '🆕 NEW FEATURES' },
  { icon: Package, label: 'Inventory Management', path: '/inventory-management' },
  { icon: Warehouse, label: 'CMO Stockyards', path: '/cmo-stockyards' },
  { icon: ShoppingCart, label: 'Order Management', path: '/order-management' },
  { icon: Train, label: 'Rakes', path: '/rakes' },
  { icon: Grid3x3, label: 'Product-Wagon Matrix', path: '/product-wagon-matrix' },
  { icon: Route, label: 'Rail vs Road', path: '/rail-vs-road' },
  { icon: Recommendation, label: 'Production Rec', path: '/production-recommendation' },
  
  // PHASE 3: QUALITY & SUPPLIER SECTION
  { type: 'divider', label: '🔍 QUALITY & SUPPLY' },
  { icon: BarChart3, label: 'Quality Control', path: '/quality-control' },
  { icon: Truck, label: 'Supply Chain', path: '/supply-chain' },
  
  
  
  // ADVANCED FEATURES SECTION

  
  // PHASE 2 FEATURES
  
  // PHASE 3 FEATURES
  { type: 'divider', label: '🏢 ENTERPRISE FEATURES' },
  { icon: Database, label: 'SAP Connector', path: '/sap-connector' },
  { icon: Brain, label: 'Decision Support', path: '/decision-support' },
  { icon: MessageCircle, label: 'AI Chatbot', path: '/ai-chatbot' },
  { icon: Database, label: 'Database Dashboard', path: '/database-dashboard' },
  { icon: BookOpen, label: 'History', path: '/history' },
]

/**
 * Sidebar - Main navigation component
 */
export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-lg flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">SAIL Bokaro</h1>
        <p className="text-sm text-slate-400">Logistics Optimizer</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          // Handle dividers
          if (item.type === 'divider') {
            return (
              <div key={item.label} className="py-3 px-4 mt-4 border-t border-slate-700">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
              </div>
            )
          }
          
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-100 hover:bg-slate-700 hover:text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} />
              <span className="font-medium flex-1">{item.label}</span>
              {isActive && <ChevronRight size={16} />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-900">
        <p className="text-xs text-slate-500">v1.0.0</p>
        <p className="text-xs text-slate-500">© 2025 SAIL Bokaro</p>
      </div>
    </aside>
  )
}
