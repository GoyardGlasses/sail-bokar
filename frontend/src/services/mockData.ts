/**
 * Mock Data Service
 * Comprehensive mock data for all 10 new features
 */

// ============================================================================
// INVENTORY MANAGEMENT MOCK DATA
// ============================================================================

export const inventoryMockData = {
  materials: [
    { id: 'm-001', name: 'Iron Ore', quantity: 5000, unit: 'tonnes', stockyard: 'SY-01', grade: 'A', price: 2500 },
    { id: 'm-002', name: 'Coal', quantity: 3200, unit: 'tonnes', stockyard: 'SY-02', grade: 'B', price: 1800 },
    { id: 'm-003', name: 'Limestone', quantity: 2100, unit: 'tonnes', stockyard: 'SY-01', grade: 'A', price: 800 },
    { id: 'm-004', name: 'Manganese Ore', quantity: 1500, unit: 'tonnes', stockyard: 'SY-03', grade: 'C', price: 3200 },
    { id: 'm-005', name: 'Coke', quantity: 2800, unit: 'tonnes', stockyard: 'SY-02', grade: 'A', price: 4500 },
  ],
  rakes: [
    { id: 'rk-001', name: 'Rake-A1', capacity: 1000, status: 'available', location: 'SY-01', wagons: 40 },
    { id: 'rk-002', name: 'Rake-B2', capacity: 1200, status: 'in-transit', location: 'Route-1', wagons: 48 },
    { id: 'rk-003', name: 'Rake-C3', capacity: 900, status: 'loading', location: 'SY-02', wagons: 36 },
    { id: 'rk-004', name: 'Rake-D4', capacity: 1100, status: 'available', location: 'SY-03', wagons: 44 },
  ],
  loadingPoints: [
    { id: 'lp-001', name: 'LP-North', capacity: 500, utilization: 65, status: 'active' },
    { id: 'lp-002', name: 'LP-South', capacity: 600, utilization: 45, status: 'active' },
    { id: 'lp-003', name: 'LP-East', capacity: 400, utilization: 80, status: 'active' },
  ],
  sidings: [
    { id: 'sd-001', name: 'Siding-1', capacity: 3, available: 2, status: 'operational' },
    { id: 'sd-002', name: 'Siding-2', capacity: 3, available: 1, status: 'operational' },
    { id: 'sd-003', name: 'Siding-3', capacity: 2, available: 2, status: 'operational' },
  ],
}

// ============================================================================
// ORDER MANAGEMENT MOCK DATA
// ============================================================================

export const orderMockData = {
  orders: [
    { id: 'ORD-001', product: 'Iron Ore', quantity: 500, destination: 'Mumbai', priority: 'high', status: 'confirmed', deadline: '2025-11-28' },
    { id: 'ORD-002', product: 'Coal', quantity: 300, destination: 'Delhi', priority: 'medium', status: 'pending', deadline: '2025-11-30' },
    { id: 'ORD-003', product: 'Limestone', quantity: 200, destination: 'Bangalore', priority: 'low', status: 'confirmed', deadline: '2025-12-02' },
    { id: 'ORD-004', product: 'Manganese Ore', quantity: 150, destination: 'Chennai', priority: 'high', status: 'in-progress', deadline: '2025-11-27' },
    { id: 'ORD-005', product: 'Coke', quantity: 400, destination: 'Kolkata', priority: 'medium', status: 'confirmed', deadline: '2025-11-29' },
  ],
}

// ============================================================================
// RAKE FORMATION MOCK DATA
// ============================================================================

export const rakeFormationMockData = {
  plans: [
    {
      id: 'plan-001',
      date: '2025-11-24',
      rakes: [
        { rakeId: 'rk-001', composition: ['Iron Ore: 500t', 'Coal: 200t'], destination: 'Mumbai', status: 'scheduled' },
        { rakeId: 'rk-002', composition: ['Limestone: 400t', 'Coke: 300t'], destination: 'Delhi', status: 'scheduled' },
      ],
      totalCost: 125000,
      utilization: 85.5,
    },
  ],
}

// ============================================================================
// PRODUCT-WAGON MATRIX MOCK DATA
// ============================================================================

export const productWagonMockData = {
  compatibility: [
    { product: 'Iron Ore', wagon: 'Open-Top', compatible: true, capacity: 50 },
    { product: 'Iron Ore', wagon: 'Covered', compatible: false, capacity: 45 },
    { product: 'Coal', wagon: 'Open-Top', compatible: true, capacity: 50 },
    { product: 'Coal', wagon: 'Covered', compatible: true, capacity: 45 },
    { product: 'Limestone', wagon: 'Open-Top', compatible: true, capacity: 50 },
    { product: 'Coke', wagon: 'Covered', compatible: true, capacity: 45 },
  ],
}

// ============================================================================
// RAIL VS ROAD OPTIMIZATION MOCK DATA
// ============================================================================

export const railRoadMockData = {
  routes: [
    { id: 'route-001', origin: 'Bokaro', destination: 'Mumbai', rail: { cost: 45000, time: 48, capacity: 1000 }, road: { cost: 65000, time: 36, capacity: 500 } },
    { id: 'route-002', origin: 'Bokaro', destination: 'Delhi', rail: { cost: 35000, time: 36, capacity: 1000 }, road: { cost: 55000, time: 24, capacity: 500 } },
    { id: 'route-003', origin: 'Bokaro', destination: 'Bangalore', rail: { cost: 52000, time: 60, capacity: 1000 }, road: { cost: 72000, time: 48, capacity: 500 } },
  ],
}

// ============================================================================
// COST ANALYSIS MOCK DATA
// ============================================================================

export const costAnalysisMockData = {
  breakdowns: [
    {
      id: 'cb-001',
      orderId: 'ORD-001',
      components: [
        { name: 'Material Cost', amount: 50000, percentage: 40 },
        { name: 'Labor Cost', amount: 25000, percentage: 20 },
        { name: 'Transport Cost', amount: 37500, percentage: 30 },
        { name: 'Overhead', amount: 12500, percentage: 10 },
      ],
      totalCost: 125000,
      costPerUnit: 250,
    },
    {
      id: 'cb-002',
      orderId: 'ORD-002',
      components: [
        { name: 'Material Cost', amount: 30000, percentage: 40 },
        { name: 'Labor Cost', amount: 15000, percentage: 20 },
        { name: 'Transport Cost', amount: 22500, percentage: 30 },
        { name: 'Overhead', amount: 7500, percentage: 10 },
      ],
      totalCost: 75000,
      costPerUnit: 250,
    },
  ],
}

// ============================================================================
// PRODUCTION RECOMMENDATION MOCK DATA
// ============================================================================

export const productionMockData = {
  demands: [
    { id: 'd-001', product: 'Iron Ore', forecastedDemand: 5000, confidence: 0.92, trend: 'increasing' },
    { id: 'd-002', product: 'Coal', forecastedDemand: 3200, confidence: 0.88, trend: 'stable' },
    { id: 'd-003', product: 'Limestone', forecastedDemand: 2100, confidence: 0.85, trend: 'decreasing' },
  ],
  recommendations: [
    { id: 'rec-001', product: 'Iron Ore', recommendedProduction: 5500, reason: 'High demand trend', priority: 'high' },
    { id: 'rec-002', product: 'Coal', recommendedProduction: 3200, reason: 'Stable demand', priority: 'medium' },
  ],
}

// ============================================================================
// CONSTRAINTS MANAGEMENT MOCK DATA
// ============================================================================

export const constraintsMockData = {
  constraints: [
    { id: 'c-001', name: 'Min Rake Size', type: 'capacity', rule: 'Minimum 300 tonnes', severity: 'critical' },
    { id: 'c-002', name: 'Loading Point Capacity', type: 'capacity', rule: 'Max 500 tonnes', severity: 'high' },
    { id: 'c-003', name: 'Siding Availability', type: 'resource', rule: '8 sidings available', severity: 'high' },
  ],
  violations: [
    { id: 'v-001', constraint: 'Min Rake Size', severity: 'warning', message: 'Rake RK-045 below minimum' },
  ],
}

// ============================================================================
// SCENARIO ANALYSIS MOCK DATA
// ============================================================================

export const scenarioMockData = {
  scenarios: [
    { id: 's-001', name: 'Base Case', description: 'Current baseline', utilization: 68.5, cost: 950, onTime: 92.3 },
    { id: 's-002', name: 'Optimized Fleet', description: 'With 20% more rakes', utilization: 85.2, cost: 890, onTime: 96.8 },
    { id: 's-003', name: 'Cost Reduction', description: 'Focus on cost', utilization: 72.1, cost: 820, onTime: 89.5 },
  ],
}

// ============================================================================
// REPORTING MOCK DATA
// ============================================================================

export const reportingMockData = {
  reports: [
    { id: 'r-001', name: 'Weekly Operations Summary', type: 'summary', format: 'pdf', size: '2.4 MB', generatedAt: '2025-11-24' },
    { id: 'r-002', name: 'Rake Utilization Report', type: 'detailed', format: 'excel', size: '1.8 MB', generatedAt: '2025-11-23' },
    { id: 'r-003', name: 'Cost Analysis Deep Dive', type: 'technical', format: 'html', size: '3.2 MB', generatedAt: '2025-11-22' },
  ],
}

// ============================================================================
// MONITORING MOCK DATA
// ============================================================================

export const monitoringMockData = {
  kpis: {
    on_time_rate: 0.923,
    demurrage_savings_monthly_inr: 240000,
    cost_per_ton: 950,
    rake_utilization: 0.685,
    system_uptime_pct: 99.7,
  },
  alerts: [
    { id: 'a-001', severity: 'P2', title: 'High API Latency', message: 'Average latency 2500ms exceeds threshold' },
    { id: 'a-002', severity: 'P1', title: 'Inventory Sync Failure', message: 'Sync success ratio 98.5% below 99%' },
  ],
}

export default {
  inventoryMockData,
  orderMockData,
  rakeFormationMockData,
  productWagonMockData,
  railRoadMockData,
  costAnalysisMockData,
  productionMockData,
  constraintsMockData,
  scenarioMockData,
  reportingMockData,
  monitoringMockData,
}
