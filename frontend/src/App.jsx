import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Layout/Sidebar'
import Navbar from './components/Layout/Navbar'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ModernDashboard from './pages/ModernDashboard'
import ForecastPage from './pages/ForecastPage'
import DelayPage from './pages/DelayPage'
import ThroughputPage from './pages/ThroughputPage'
import MinimumLoadingTimePage from './pages/MinimumLoadingTimePage'
import CostPage from './pages/CostPage'
import OptimizePage from './pages/OptimizePage'
import OptimizeResult from './pages/OptimizeResult'
import AIForecastPage from './pages/AIForecastPage'
import BlockchainPage from './pages/BlockchainPage'
import AdvancedOptimizationPage from './pages/AdvancedOptimizationPage'
import Visualization3DPage from './pages/Visualization3DPage'
import ScenarioAnalysisPage from './pages/ScenarioAnalysisPage'
import OperationsHub from './pages/OperationsHub'
import OperationsMLPage from './pages/OperationsMLPage'
import RakePlanner from './pages/RakePlanner'
import ThroughputOptimizationPage from './pages/ThroughputOptimizationPage'
import Spinner from './components/UI/Spinner'
import { useAppStore } from './store/useAppStore'
import { MLPredictionsProvider } from './context/MLPredictionsContext'
import { useAuth } from './context/AuthContext'

// New Feature Imports (10 Features)
import InventoryManagementDashboard from './features/inventory/components/InventoryDashboard'
import OrderManagementDashboard from './features/orders/components/OrderDashboard'
import RakeFormationDashboard from './features/rakeFormation/components/RakeFormationDashboard'
import ProductWagonMatrixDashboard from './features/productWagonMatrix/components/ProductWagonMatrixDashboard'
import RailRoadOptimizationDashboard from './features/railRoadOptimization/components/RailRoadOptimizationDashboard'
import CostAnalysisDashboard from './features/costAnalysis/components/CostAnalysisDashboard'
import ProductionRecommendationDashboard from './features/productionRecommendation/components/ProductionRecommendationDashboard'
import ConstraintsManagementDashboard from './features/constraintsManagement/components/ConstraintsManagementDashboard'
import ScenarioAnalysisDashboard from './features/scenarioAnalysis/components/ScenarioAnalysisDashboard'
import ReportingDashboard from './features/reporting/components/ReportingDashboard'
import MonitoringDashboard from './features/monitoring/components/MonitoringDashboard'
import CMOStockyardDashboard from './features/cmoStockyard/components/CMOStockyardDashboard'
import DataImportEnhanced from './features/dataImport/components/DataImportEnhanced'
import MaterialAvailabilityDashboard from './features/materialAvailability/components/MaterialAvailabilityDashboardSimple'
import RakeDispatchOptimization from './features/rakeDispatch/components/RakeDispatchOptimization'
import RakesPage from './pages/RakesPage'
import DecisionSupportDashboard from './features/decisionSupport/components/DecisionSupportDashboard'
import AIChat from './pages/AIChat'
import HistoricalDataPage from './pages/HistoricalDataPage'
import HistoricalDecisionsPage from './pages/HistoricalDecisionsPage'
import HistoricalDispatchPage from './pages/HistoricalDispatchPage'
import HistoryPage from './pages/HistoryPage'
import MLPage from './pages/MLPage'
import RailVsRoadPage from './pages/RailVsRoadPage'
import QualityControlPage from './pages/QualityControlPage'
import SupplyChainPage from './pages/SupplyChainPage'
import DemandPlanningPage from './pages/DemandPlanningPage'
import DemandPage from './pages/DemandPage'
import SupplierManagementPage from './pages/SupplierManagementPage'
import RiskManagementPage from './pages/RiskManagementPage'
import SustainabilityPage from './pages/SustainabilityPage'
import DatabaseDashboard from './pages/DatabaseDashboard'
import MonteCarloSimulationPage from './pages/MonteCarloSimulationPage'
import AutoOptimizerPage from './pages/AutoOptimizerPage'
import AutoAlertsPage from './pages/AutoAlertsPage'
import ConfidenceIndicatorsPage from './pages/ConfidenceIndicatorsPage'
import AutoReportPage from './pages/AutoReportPage'
import LiveProgressPage from './pages/LiveProgressPage'
import LiveDataPage from './pages/LiveDataPage'
import PolicyExecutionPage from './pages/PolicyExecutionPage'
import FeedbackLoopPage from './pages/FeedbackLoopPage'
import SAPConnectorPage from './pages/SAPConnectorPage'
import ModelRegistryPage from './pages/ModelRegistryPage'

/**
 * Main App component with routing
 */
const MainLayout = ({ children }) => (
  <div className="flex h-screen bg-slate-50">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  </div>
)

// Protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Spinner text="Checking session..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

export default function App() {
  const { theme } = useAppStore()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <MLPredictionsProvider>
      <Router>
        <Routes>
          {/* Standalone Pages */}
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/landing"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Main App Layout */}
          <Route path="/*" element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                <Route path="/dashboard" element={<ModernDashboard />} />
                <Route path="/operations-hub" element={<OperationsHub />} />
                <Route path="/operations-ml" element={<OperationsMLPage />} />
                <Route path="/rakes" element={<RakesPage />} />
                <Route path="/rake-planner" element={<RakesPage />} />
                <Route path="/forecast" element={<DemandPage />} />
                <Route path="/demand" element={<DemandPage />} />
                <Route path="/delay" element={<DelayPage />} />
                <Route path="/throughput" element={<ThroughputPage />} />
                <Route path="/minimum-loading-time" element={<MinimumLoadingTimePage />} />
                <Route path="/throughput-optimization" element={<ThroughputOptimizationPage />} />
                <Route path="/cost" element={<CostPage />} />
                <Route path="/optimize" element={<OptimizePage />} />
                <Route path="/optimize-result" element={<OptimizeResult />} />
                <Route path="/ai-forecast" element={<AIForecastPage />} />
                <Route path="/blockchain" element={<BlockchainPage />} />
                <Route path="/advanced-optimization" element={<AdvancedOptimizationPage />} />
                <Route path="/visualization-3d" element={<Visualization3DPage />} />
                <Route path="/scenario-analysis" element={<ScenarioAnalysisPage />} />
                
                {/* Data Import */}
                <Route path="/data-import" element={<DataImportEnhanced />} />
                <Route path="/material-availability" element={<MaterialAvailabilityDashboard />} />
                
                {/* New 10 Features */}
                <Route path="/inventory-management" element={<InventoryManagementDashboard />} />
                <Route path="/cmo-stockyards" element={<CMOStockyardDashboard />} />
                <Route path="/order-management" element={<OrderManagementDashboard />} />
                <Route path="/rake-formation" element={<RakesPage />} />
                <Route path="/product-wagon-matrix" element={<ProductWagonMatrixDashboard />} />
                <Route path="/rail-road-optimization" element={<RailRoadOptimizationDashboard />} />
                <Route path="/cost-analysis" element={<CostPage />} />
                <Route path="/production-recommendation" element={<ProductionRecommendationDashboard />} />
                <Route path="/constraints-management" element={<ConstraintsManagementDashboard />} />
                <Route path="/scenario-analysis-advanced" element={<ScenarioAnalysisDashboard />} />
                <Route path="/reporting" element={<ReportingDashboard />} />
                <Route path="/monitoring" element={<MonitoringDashboard />} />
                
                {/* Advanced Features */}
                <Route path="/rake-dispatch" element={<RakesPage />} />
                <Route path="/decision-support" element={<DecisionSupportDashboard />} />
                <Route path="/ai-chatbot" element={<AIChat />} />
                <Route path="/database-dashboard" element={<DatabaseDashboard />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/historical-data" element={<HistoricalDataPage />} />
                <Route path="/historical-decisions" element={<HistoricalDecisionsPage />} />
                <Route path="/historical-dispatch" element={<HistoricalDispatchPage />} />
                <Route path="/ml-center" element={<MLPage />} />
                
                {/* Phase 2-3 Enhanced Pages */}
                <Route path="/rail-vs-road" element={<RailVsRoadPage />} />
                <Route path="/quality-control" element={<QualityControlPage />} />
                <Route path="/supply-chain" element={<SupplyChainPage />} />
                <Route path="/demand-planning" element={<DemandPage />} />
                <Route path="/supplier-management" element={<SupplierManagementPage />} />
                <Route path="/risk-management" element={<RiskManagementPage />} />
                <Route path="/sustainability" element={<SustainabilityPage />} />
                
                {/* Advanced Simulation & Analysis */}
                <Route path="/monte-carlo-simulation" element={<MonteCarloSimulationPage />} />
                
                {/* Phase 1: Auto-Optimizer */}
                <Route path="/auto-optimizer" element={<AutoOptimizerPage />} />
                
                {/* Phase 1: Auto-Alerts */}
                <Route path="/auto-alerts" element={<AutoAlertsPage />} />
                
                {/* Phase 1: Confidence Indicators */}
                <Route path="/confidence-indicators" element={<ConfidenceIndicatorsPage />} />
                
                {/* Phase 1: Auto-Report */}
                <Route path="/auto-report" element={<AutoReportPage />} />
                
                {/* Phase 1: Live Progress */}
                <Route path="/live-progress" element={<LiveProgressPage />} />
                
                {/* Phase 2: Live Data */}
                <Route path="/live-data" element={<LiveDataPage />} />
                
                {/* Phase 2: Policy Execution */}
                <Route path="/policy-execution" element={<PolicyExecutionPage />} />
                
                {/* Phase 2: Feedback Loop */}
                <Route path="/feedback-loop" element={<FeedbackLoopPage />} />
                
                {/* Phase 3: SAP Connector */}
                <Route path="/sap-connector" element={<SAPConnectorPage />} />
                
                {/* Phase 3: Model Registry */}
                <Route path="/model-registry" element={<ModelRegistryPage />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </MLPredictionsProvider>
  )
}
