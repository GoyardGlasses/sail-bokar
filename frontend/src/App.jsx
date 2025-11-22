import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Layout/Sidebar'
import Navbar from './components/Layout/Navbar'
import Dashboard from './pages/Dashboard'
import ForecastPage from './pages/ForecastPage'
import DelayPage from './pages/DelayPage'
import ThroughputPage from './pages/ThroughputPage'
import CostPage from './pages/CostPage'
import OptimizePage from './pages/OptimizePage'
import OptimizeResult from './pages/OptimizeResult'
import ModelsPage from './pages/ModelsPage'
import AdminPage from './pages/AdminPage'
import AIForecastPage from './pages/AIForecastPage'
import BlockchainPage from './pages/BlockchainPage'
import AdvancedOptimizationPage from './pages/AdvancedOptimizationPage'
import Visualization3DPage from './pages/Visualization3DPage'
import ScenarioAnalysisPage from './pages/ScenarioAnalysisPage'
import ModernDashboard from './pages/ModernDashboard'
import OperationsHub from './pages/OperationsHub'
import RakePlanner from './pages/RakePlanner'
import Spinner from './components/UI/Spinner'
import { useAppStore } from './store/useAppStore'

/**
 * Main App component with routing
 */
export default function App() {
  const { theme } = useAppStore()

  useEffect(() => {
    // Apply theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <Router>
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<ModernDashboard />} />
              <Route path="/operations-hub" element={<OperationsHub />} />
              <Route path="/rake-planner" element={<RakePlanner />} />
              <Route path="/forecast" element={<ForecastPage />} />
              <Route path="/delay" element={<DelayPage />} />
              <Route path="/throughput" element={<ThroughputPage />} />
              <Route path="/cost" element={<CostPage />} />
              <Route path="/optimize" element={<OptimizePage />} />
              <Route path="/optimize-result" element={<OptimizeResult />} />
              <Route path="/models" element={<ModelsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/ai-forecast" element={<AIForecastPage />} />
              <Route path="/blockchain" element={<BlockchainPage />} />
              <Route path="/advanced-optimization" element={<AdvancedOptimizationPage />} />
              <Route path="/visualization-3d" element={<Visualization3DPage />} />
              <Route path="/scenario-analysis" element={<ScenarioAnalysisPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}
