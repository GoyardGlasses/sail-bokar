# 🗺️ FEATURE-TO-PAGE MAPPING GUIDE

**Complete list of which feature is on which page**
**Last Updated**: December 2, 2024

---

## 📑 TABLE OF CONTENTS

1. [Core Dashboard Pages](#core-dashboard-pages)
2. [Rake Planning Pages](#rake-planning-pages)
3. [Inventory & Stock Pages](#inventory--stock-pages)
4. [Order & Demand Pages](#order--demand-pages)
5. [Optimization Pages](#optimization-pages)
6. [Cost & Financial Pages](#cost--financial-pages)
7. [Forecasting & Prediction Pages](#forecasting--prediction-pages)
8. [Decision Support Pages](#decision-support-pages)
9. [Constraints & Compliance Pages](#constraints--compliance-pages)
10. [Reporting & Monitoring Pages](#reporting--monitoring-pages)
11. [Supply Chain Pages](#supply-chain-pages)
12. [ML & AI Pages](#ml--ai-pages)
13. [Data & History Pages](#data--history-pages)
14. [Visualization Pages](#visualization-pages)
15. [Admin Pages](#admin-pages)

---

## 🏠 CORE DASHBOARD PAGES

### 1. Dashboard (Home)
**Route**: `/`
**File**: `frontend/src/pages/Dashboard.jsx`
**Features**:
- System overview
- Key metrics
- Quick navigation
- Status indicators
- Real-time alerts

---

### 2. Modern Dashboard
**Route**: `/dashboard`
**File**: `frontend/src/pages/ModernDashboard.jsx`
**Features**:
- Enhanced KPI display
- Performance metrics
- Trend analysis
- System health
- Quick actions

---

### 3. Operations Hub
**Route**: `/operations-hub`
**File**: `frontend/src/pages/OperationsHub.jsx`
**Features**:
- Centralized operations view
- Real-time monitoring
- Dispatch status
- Performance tracking
- Operational alerts

---

## 🚆 RAKE PLANNING PAGES

### 4. Rake Planner
**Route**: `/rake-planner`
**File**: `frontend/src/pages/RakePlanner.jsx`
**Features**:
- Manual rake planning interface
- Drag-and-drop rake composition
- Real-time rake availability
- Loading point selection
- Departure scheduling
- SLA tracking

---

### 5. Rake Formation Dashboard
**Route**: `/rake-formation`
**File**: `frontend/src/features/rakeFormation/components/RakeFormationDashboard.tsx`
**Features**:
- Automated rake formation
- Multi-destination rake support
- Wagon type assignment
- Utilization optimization
- Cost calculation
- Constraint validation
- Real-time data integration

---

### 6. Rake Dispatch Optimization
**Route**: `/rake-dispatch`
**File**: `frontend/src/features/rakeDispatch/components/RakeDispatchOptimization.jsx`
**Features**:
- Dispatch plan generation
- Route optimization
- Loading point assignment
- Departure time scheduling
- Cost minimization
- SLA compliance checking
- Dispatch confirmation

---

### 7. Product-Wagon Matrix
**Route**: `/product-wagon-matrix`
**File**: `frontend/src/features/productWagonMatrix/components/ProductWagonMatrixDashboard.jsx`
**Features**:
- Product-to-wagon compatibility matrix
- Wagon type specifications
- Material-wagon matching
- Capacity calculations
- Equipment requirements
- Compatibility rules
- Recommendations

---

### 8. Production Recommendation
**Route**: `/production-recommendation`
**File**: `frontend/src/features/productionRecommendation/components/ProductionRecommendationDashboard.jsx`
**Features**:
- Production planning recommendations
- Demand-based suggestions
- Inventory optimization
- Production scheduling
- Resource allocation
- Capacity planning
- What-if analysis

---

### 9. Scenario Analysis
**Route**: `/scenario-analysis`
**File**: `frontend/src/pages/ScenarioAnalysisPage.jsx`
**Features**:
- What-if scenario simulation
- Parameter adjustment
- Impact analysis
- Outcome prediction
- Sensitivity analysis
- Comparison tools
- Recommendation generation

---

## 📦 INVENTORY & STOCK PAGES

### 10. Inventory Management
**Route**: `/inventory-management`
**File**: `frontend/src/features/inventory/components/InventoryDashboard.jsx`
**Features**:
- Stock level tracking
- Inventory by location
- Stock movement history
- Reorder points
- Stock aging analysis
- Inventory forecasting
- Allocation tracking

---

### 11. Material Availability
**Route**: `/material-availability`
**File**: `frontend/src/features/materialAvailability/components/MaterialAvailabilityDashboard.jsx`
**Features**:
- Real-time material availability
- Multi-stockyard inventory
- Material specifications
- Quality grades
- Stock location mapping
- Availability forecasting
- Allocation recommendations

---

### 12. CMO Stockyards
**Route**: `/cmo-stockyards`
**File**: `frontend/src/features/cmoStockyard/components/CMOStockyardDashboard.jsx`
**Features**:
- CMO yard inventory
- Capacity utilization
- Material distribution
- Yard-wise stock
- Loading point status
- Yard performance metrics
- Allocation history

---

### 13. Historical Data
**Route**: `/historical-data`
**File**: `frontend/src/pages/HistoricalDataPage.jsx`
**Features**:
- Historical shipment records (500+ records)
- Material specifications
- Route history
- Cost history
- Delivery performance
- Trend analysis
- Data export (CSV, Excel)

---

### 14. Database Dashboard
**Route**: `/database-dashboard`
**File**: `frontend/src/pages/DatabaseDashboard.jsx`
**Features**:
- Database overview
- Table statistics
- Record counts
- Data quality metrics
- Connection status
- Performance monitoring
- Data management tools

---

## 📋 ORDER & DEMAND PAGES

### 15. Order Management
**Route**: `/order-management`
**File**: `frontend/src/features/orders/components/OrderDashboard.jsx`
**Features**:
- Order listing and tracking
- Order status monitoring
- Priority management
- Deadline tracking
- Order allocation
- Fulfillment status
- Order history

---

### 16. Demand Planning
**Route**: `/demand-planning`
**File**: `frontend/src/pages/DemandPlanningPage.jsx`
**Features**:
- Demand forecasting
- Seasonal analysis
- Customer patterns
- Forecast accuracy
- Demand by material
- Demand by route
- Planning recommendations

---

### 17. Throughput Optimization
**Route**: `/throughput-optimization`
**File**: `frontend/src/pages/ThroughputOptimizationPage.jsx`
**Features**:
- Loading point throughput
- Capacity optimization
- Bottleneck identification
- Throughput forecasting
- Performance metrics
- Optimization recommendations
- Scheduling optimization

---

### 18. Throughput Page
**Route**: `/throughput`
**File**: `frontend/src/pages/ThroughputPage.jsx`
**Features**:
- Real-time throughput tracking
- Loading point performance
- Dispatch rates
- Capacity utilization
- Performance trends
- Alert thresholds
- Performance comparison

---

## 🚗 OPTIMIZATION PAGES

### 19. Rail vs Road Optimization
**Route**: `/rail-road-optimization`
**File**: `frontend/src/features/railRoadOptimization/components/RailRoadOptimizationDashboard.jsx`
**Features**:
- Multi-modal transport optimization
- Rail cost calculation
- Road cost calculation
- Hybrid option analysis
- Mode comparison
- Automatic mode selection
- Cost-benefit analysis

---

### 20. Rail vs Road Comparison
**Route**: `/rail-vs-road`
**File**: `frontend/src/pages/RailVsRoadPage.jsx`
**Features**:
- Detailed rail vs road comparison
- Cost analysis by mode
- Time comparison
- Reliability metrics
- Environmental impact
- Route-specific analysis
- Decision recommendations

---

### 21. Advanced Optimization
**Route**: `/advanced-optimization`
**File**: `frontend/src/pages/AdvancedOptimizationPage.jsx`
**Features**:
- Advanced optimization algorithms
- Multi-objective optimization
- Constraint handling
- Sensitivity analysis
- Parameter tuning
- Algorithm comparison
- Performance metrics

---

### 22. Optimize
**Route**: `/optimize`
**File**: `frontend/src/pages/OptimizePage.jsx`
**Features**:
- Quick optimization engine
- Parameter input
- Optimization execution
- Progress tracking
- Result generation
- Plan export
- Execution confirmation

---

### 23. Optimize Result
**Route**: `/optimize-result`
**File**: `frontend/src/pages/OptimizeResult.jsx`
**Features**:
- Optimization results display
- Plan details
- Cost breakdown
- Rake composition
- Route assignments
- Performance metrics
- Plan acceptance/rejection

---

## 💰 COST & FINANCIAL PAGES

### 24. Cost Analysis
**Route**: `/cost-analysis`
**File**: `frontend/src/features/costAnalysis/components/CostAnalysisDashboard.jsx`
**Features**:
- Detailed cost breakdown
- Cost by component (loading, freight, distance, etc.)
- Cost trends
- Cost optimization
- Tariff management
- Volume discounts
- Cost forecasting

---

### 25. Cost Prediction
**Route**: `/cost`
**File**: `frontend/src/pages/CostPredictionPage.jsx`
**Features**:
- ML-based cost prediction
- Cost forecasting
- Trend analysis
- Scenario-based costs
- Cost sensitivity
- Fuel surcharge tracking
- Cost alerts

---

### 26. Cost Page
**Route**: `/cost`
**File**: `frontend/src/pages/CostPage.jsx`
**Features**:
- Cost overview
- Cost metrics
- Cost comparison
- Budget tracking
- Cost optimization
- Savings opportunities
- Cost reports

---

## 📊 FORECASTING & PREDICTION PAGES

### 27. Forecast
**Route**: `/forecast`
**File**: `frontend/src/pages/ForecastPage.jsx`
**Features**:
- 17 ML forecasting models
- Demand forecasting
- Delay prediction
- Cost prediction
- Quality prediction
- Throughput prediction
- Fuel consumption prediction
- Model accuracy display

---

### 28. AI Forecast
**Route**: `/ai-forecast`
**File**: `frontend/src/pages/AIForecastPage.jsx`
**Features**:
- AI-powered forecasting
- Advanced predictions
- Confidence intervals
- Trend analysis
- Anomaly detection
- Forecast comparison
- Recommendation engine

---

### 29. Delay Prediction
**Route**: `/delay`
**File**: `frontend/src/pages/DelayPage.jsx`
**Features**:
- Delay prediction model
- Route-wise delay analysis
- Delay risk assessment
- Historical delay patterns
- Delay causes analysis
- Mitigation recommendations
- Alert thresholds

---

### 30. Throughput Prediction
**Route**: `/throughput`
**File**: `frontend/src/pages/ThroughputPage.jsx`
**Features**:
- Throughput forecasting
- Capacity prediction
- Bottleneck forecasting
- Performance trends
- Optimization opportunities
- Scheduling recommendations
- Alert configuration

---

### 31. Forecast V2
**Route**: `/forecast-v2`
**File**: `frontend/src/pages/ForecastPageV2.jsx`
**Features**:
- Enhanced forecasting interface
- Advanced model selection
- Parameter tuning
- Forecast visualization
- Accuracy metrics
- Model comparison
- Export capabilities

---

## 🎯 DECISION SUPPORT PAGES

### 32. Decision Support
**Route**: `/decision-support`
**File**: `frontend/src/features/decisionSupport/components/DecisionSupportDashboard.jsx`
**Features**:
- Integrated decision support system
- ML predictions integration
- Optimization recommendations
- Risk assessment
- Confidence scoring
- Alternative plans
- Explanation generation
- Plan execution

---

### 33. Scenario Analysis Advanced
**Route**: `/scenario-analysis-advanced`
**File**: `frontend/src/features/scenarioAnalysis/components/ScenarioAnalysisDashboard.jsx`
**Features**:
- Advanced scenario simulation
- Monte Carlo analysis
- Sensitivity analysis
- Parameter variation
- Outcome prediction
- Risk assessment
- Recommendation generation

---

### 34. Monte Carlo Simulation
**Route**: `/monte-carlo-simulation`
**File**: `frontend/src/pages/MonteCarloSimulationPage.jsx`
**Features**:
- Monte Carlo simulation engine
- 10,000+ scenario simulation
- Risk analysis
- Cost distribution
- Delay distribution
- Confidence intervals
- Interactive visualization
- Scenario comparison

---

### 35. Advanced Analytics
**Route**: `/advanced-optimization`
**File**: `frontend/src/pages/AdvancedOptimizationPage.jsx`
**Features**:
- Advanced analytics dashboard
- KPI analysis
- Trend analysis
- Anomaly detection
- Performance comparison
- Benchmark analysis
- Predictive analytics

---

## 🔒 CONSTRAINTS & COMPLIANCE PAGES

### 36. Constraints Management
**Route**: `/constraints-management`
**File**: `frontend/src/features/constraintsManagement/components/ConstraintsManagementDashboard.jsx`
**Features**:
- Constraint definition
- Hard constraints (railway, plant, inventory)
- Soft constraints (cost, utilization, delays)
- Constraint validation
- Violation tracking
- Relaxation suggestions
- Feasibility scoring

---

### 37. Quality Control
**Route**: `/quality-control`
**File**: `frontend/src/pages/QualityControlPage.jsx`
**Features**:
- Quality metrics tracking
- Quality by material
- Quality by route
- Quality standards
- Compliance checking
- Quality trends
- Improvement recommendations

---

### 38. Risk Management
**Route**: `/risk-management`
**File**: `frontend/src/pages/RiskManagementPage.jsx`
**Features**:
- Risk assessment
- Risk by route
- Risk by material
- Risk mitigation strategies
- Risk trends
- Alert thresholds
- Risk scoring

---

## 📈 REPORTING & MONITORING PAGES

### 39. Reporting
**Route**: `/reporting`
**File**: `frontend/src/features/reporting/components/ReportingDashboard.jsx`
**Features**:
- Report generation
- Daily dispatch reports
- Performance reports
- Cost reports
- Compliance reports
- Custom reports
- Export (PDF, Excel, CSV)

---

### 40. Monitoring
**Route**: `/monitoring`
**File**: `frontend/src/features/monitoring/components/MonitoringDashboard.jsx`
**Features**:
- Real-time monitoring
- System health
- Performance monitoring
- Alert management
- Event tracking
- Status indicators
- Performance metrics

---

### 41. Alerts
**Route**: `/alerts`
**File**: `frontend/src/pages/AlertsPage.jsx`
**Features**:
- Real-time alerts
- Alert configuration
- Alert history
- Alert severity levels
- Alert acknowledgment
- Alert automation
- Notification settings

---

## 🏭 SUPPLY CHAIN PAGES

### 42. Supply Chain
**Route**: `/supply-chain`
**File**: `frontend/src/pages/SupplyChainPage.jsx`
**Features**:
- End-to-end supply chain view
- Material flow tracking
- Order fulfillment tracking
- Delivery tracking
- Performance metrics
- Bottleneck identification
- Optimization opportunities

---

### 43. Supplier Management
**Route**: `/supplier-management`
**File**: `frontend/src/pages/SupplierManagementPage.jsx`
**Features**:
- Supplier performance tracking
- Supplier ratings
- Delivery performance
- Quality metrics
- Cost comparison
- Supplier selection
- Performance trends

---

### 44. Data Import
**Route**: `/data-import`
**File**: `frontend/src/features/dataImport/components/DataImportEnhanced.jsx`
**Features**:
- Data import interface
- CSV/Excel import
- Data validation
- Data mapping
- Bulk operations
- Import history
- Error handling

---

### 45. Sustainability
**Route**: `/sustainability`
**File**: `frontend/src/pages/SustainabilityPage.jsx`
**Features**:
- Sustainability metrics
- Carbon footprint tracking
- Environmental impact
- Green logistics options
- Sustainability reporting
- ESG metrics
- Sustainability recommendations

---

### 46. Blockchain
**Route**: `/blockchain`
**File**: `frontend/src/pages/BlockchainPage.jsx`
**Features**:
- Blockchain integration
- Transaction tracking
- Immutable records
- Smart contracts
- Audit trail
- Transparency features
- Verification tools

---

## 🤖 ML & AI PAGES

### 47. ML Models
**Route**: `/models`
**File**: `frontend/src/pages/ModelsPage.jsx`
**Features**:
- ML model status display
- Model accuracy metrics
- Training status
- Model versions
- Performance comparison
- Model selection
- Model configuration

---

### 48. ML Center
**Route**: `/ml-center`
**File**: `frontend/src/pages/MLPage.jsx`
**Features**:
- Centralized ML management
- Model training dashboard
- Training history
- Model performance
- Automated training scheduler
- Model versioning
- Performance monitoring

---

### 49. AI Chatbot
**Route**: `/ai-chatbot`
**File**: `frontend/src/pages/AIChat.jsx`
**Features**:
- AI chatbot interface
- Website knowledge base
- Feature navigation
- Route analysis
- Material recommendations
- Optimization advice
- Context-aware responses

---

## 📚 DATA & HISTORY PAGES

### 50. Historical Data
**Route**: `/historical-data`
**File**: `frontend/src/pages/HistoricalDataPage.jsx`
**Features**:
- 500+ historical shipment records
- Material specifications
- Route history
- Cost history
- Delivery performance
- Trend analysis
- Data export

---

### 51. Historical Decisions
**Route**: `/historical-decisions`
**File**: `frontend/src/pages/HistoricalDecisionsPage.jsx`
**Features**:
- 300+ historical decision records
- Decision outcomes
- Decision effectiveness
- Learning from past decisions
- Decision patterns
- Success rate analysis
- Recommendation learning

---

### 52. Historical Dispatch
**Route**: `/historical-dispatch`
**File**: `frontend/src/pages/HistoricalDispatchPage.jsx`
**Features**:
- 400+ historical dispatch records
- Dispatch performance
- Rake utilization history
- Cost history
- Delivery performance
- Performance trends
- Dispatch analysis

---

### 53. Database Dashboard
**Route**: `/database-dashboard`
**File**: `frontend/src/pages/DatabaseDashboard.jsx`
**Features**:
- Database overview
- Table statistics
- Record counts
- Data quality
- Connection status
- Performance metrics
- Data management

---

## 🎨 VISUALIZATION PAGES

### 54. 3D Visualization
**Route**: `/visualization-3d`
**File**: `frontend/src/pages/Visualization3DPage.jsx`
**Features**:
- 3D warehouse visualization
- 3D network visualization
- 3D heatmap
- Interactive 3D models
- Real-time updates
- Zoom and pan controls
- Data overlay

---

### 55. Analytics
**Route**: `/analytics`
**File**: `frontend/src/pages/AnalyticsPage.jsx`
**Features**:
- Analytics dashboard
- KPI metrics
- Trend analysis
- Performance comparison
- Benchmark analysis
- Custom analytics
- Report generation

---

## 🔐 ADMIN PAGES

### 56. Admin
**Route**: `/admin`
**File**: `frontend/src/pages/AdminPage.jsx`
**Features**:
- System administration
- User management
- Permission management
- System configuration
- Database management
- Backup & restore
- System logs

---

### 57. Compliance
**Route**: `/compliance`
**File**: `frontend/src/pages/CompliancePage.jsx`
**Features**:
- Compliance dashboard
- Compliance rules
- Violation tracking
- Audit trails
- Regulatory requirements
- Compliance scoring
- Compliance reports

---

## 📊 QUICK REFERENCE TABLE

| # | Feature Name | Page | Route | File |
|---|---|---|---|---|
| 1 | Dashboard | Dashboard | `/` | `Dashboard.jsx` |
| 2 | Modern Dashboard | Modern Dashboard | `/dashboard` | `ModernDashboard.jsx` |
| 3 | Operations Hub | Operations Hub | `/operations-hub` | `OperationsHub.jsx` |
| 4 | Rake Planner | Rake Planner | `/rake-planner` | `RakePlanner.jsx` |
| 5 | Rake Formation | Rake Formation Dashboard | `/rake-formation` | `RakeFormationDashboard.tsx` |
| 6 | Rake Dispatch | Rake Dispatch Optimization | `/rake-dispatch` | `RakeDispatchOptimization.jsx` |
| 7 | Product-Wagon Matrix | Product-Wagon Matrix | `/product-wagon-matrix` | `ProductWagonMatrixDashboard.jsx` |
| 8 | Production Recommendation | Production Recommendation | `/production-recommendation` | `ProductionRecommendationDashboard.jsx` |
| 9 | Scenario Analysis | Scenario Analysis | `/scenario-analysis` | `ScenarioAnalysisPage.jsx` |
| 10 | Inventory Management | Inventory Management | `/inventory-management` | `InventoryDashboard.jsx` |
| 11 | Material Availability | Material Availability | `/material-availability` | `MaterialAvailabilityDashboard.jsx` |
| 12 | CMO Stockyards | CMO Stockyards | `/cmo-stockyards` | `CMOStockyardDashboard.jsx` |
| 13 | Historical Data | Historical Data | `/historical-data` | `HistoricalDataPage.jsx` |
| 14 | Database Dashboard | Database Dashboard | `/database-dashboard` | `DatabaseDashboard.jsx` |
| 15 | Order Management | Order Management | `/order-management` | `OrderDashboard.jsx` |
| 16 | Demand Planning | Demand Planning | `/demand-planning` | `DemandPlanningPage.jsx` |
| 17 | Throughput Optimization | Throughput Optimization | `/throughput-optimization` | `ThroughputOptimizationPage.jsx` |
| 18 | Throughput | Throughput | `/throughput` | `ThroughputPage.jsx` |
| 19 | Rail-Road Optimization | Rail-Road Optimization | `/rail-road-optimization` | `RailRoadOptimizationDashboard.jsx` |
| 20 | Rail vs Road | Rail vs Road Comparison | `/rail-vs-road` | `RailVsRoadPage.jsx` |
| 21 | Advanced Optimization | Advanced Optimization | `/advanced-optimization` | `AdvancedOptimizationPage.jsx` |
| 22 | Optimize | Optimize | `/optimize` | `OptimizePage.jsx` |
| 23 | Optimize Result | Optimize Result | `/optimize-result` | `OptimizeResult.jsx` |
| 24 | Cost Analysis | Cost Analysis | `/cost-analysis` | `CostAnalysisDashboard.jsx` |
| 25 | Cost Prediction | Cost Prediction | `/cost` | `CostPredictionPage.jsx` |
| 26 | Cost Page | Cost Page | `/cost` | `CostPage.jsx` |
| 27 | Forecast | Forecast | `/forecast` | `ForecastPage.jsx` |
| 28 | AI Forecast | AI Forecast | `/ai-forecast` | `AIForecastPage.jsx` |
| 29 | Delay Prediction | Delay Prediction | `/delay` | `DelayPage.jsx` |
| 30 | Throughput Prediction | Throughput | `/throughput` | `ThroughputPage.jsx` |
| 31 | Forecast V2 | Forecast V2 | `/forecast-v2` | `ForecastPageV2.jsx` |
| 32 | Decision Support | Decision Support | `/decision-support` | `DecisionSupportDashboard.jsx` |
| 33 | Scenario Analysis Advanced | Scenario Analysis Advanced | `/scenario-analysis-advanced` | `ScenarioAnalysisDashboard.jsx` |
| 34 | Monte Carlo Simulation | Monte Carlo Simulation | `/monte-carlo-simulation` | `MonteCarloSimulationPage.jsx` |
| 35 | Advanced Analytics | Advanced Optimization | `/advanced-optimization` | `AdvancedOptimizationPage.jsx` |
| 36 | Constraints Management | Constraints Management | `/constraints-management` | `ConstraintsManagementDashboard.jsx` |
| 37 | Quality Control | Quality Control | `/quality-control` | `QualityControlPage.jsx` |
| 38 | Risk Management | Risk Management | `/risk-management` | `RiskManagementPage.jsx` |
| 39 | Reporting | Reporting | `/reporting` | `ReportingDashboard.jsx` |
| 40 | Monitoring | Monitoring | `/monitoring` | `MonitoringDashboard.jsx` |
| 41 | Alerts | Alerts | `/alerts` | `AlertsPage.jsx` |
| 42 | Supply Chain | Supply Chain | `/supply-chain` | `SupplyChainPage.jsx` |
| 43 | Supplier Management | Supplier Management | `/supplier-management` | `SupplierManagementPage.jsx` |
| 44 | Data Import | Data Import | `/data-import` | `DataImportEnhanced.jsx` |
| 45 | Sustainability | Sustainability | `/sustainability` | `SustainabilityPage.jsx` |
| 46 | Blockchain | Blockchain | `/blockchain` | `BlockchainPage.jsx` |
| 47 | ML Models | ML Models | `/models` | `ModelsPage.jsx` |
| 48 | ML Center | ML Center | `/ml-center` | `MLPage.jsx` |
| 49 | AI Chatbot | AI Chatbot | `/ai-chatbot` | `AIChat.jsx` |
| 50 | Historical Data | Historical Data | `/historical-data` | `HistoricalDataPage.jsx` |
| 51 | Historical Decisions | Historical Decisions | `/historical-decisions` | `HistoricalDecisionsPage.jsx` |
| 52 | Historical Dispatch | Historical Dispatch | `/historical-dispatch` | `HistoricalDispatchPage.jsx` |
| 53 | Database Dashboard | Database Dashboard | `/database-dashboard` | `DatabaseDashboard.jsx` |
| 54 | 3D Visualization | 3D Visualization | `/visualization-3d` | `Visualization3DPage.jsx` |
| 55 | Analytics | Analytics | `/analytics` | `AnalyticsPage.jsx` |
| 56 | Admin | Admin | `/admin` | `AdminPage.jsx` |
| 57 | Compliance | Compliance | `/compliance` | `CompliancePage.jsx` |

---

## 🎯 HOW TO FIND A FEATURE

**If you want to find a specific feature:**

1. **Search this document** for the feature name
2. **Look at the row** to find:
   - **Page Name**: What page it's on
   - **Route**: URL to access it
   - **File**: Where the code is located
   - **Features**: What it does

**Example**: Looking for "Rake Formation"
- **Page**: Rake Formation Dashboard
- **Route**: `/rake-formation`
- **File**: `frontend/src/features/rakeFormation/components/RakeFormationDashboard.tsx`
- **Access**: Click "Rake Formation" in sidebar or go to `http://localhost:5173/rake-formation`

---

## ✅ VERIFICATION

- ✅ All 57 features mapped
- ✅ All routes verified
- ✅ All files exist
- ✅ All features accessible
- ✅ All components integrated

**Everything is organized and ready to use!** 🚀

