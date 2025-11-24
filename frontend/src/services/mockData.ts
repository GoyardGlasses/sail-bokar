/**
 * Mock Data Service - SAIL Bokaro Logistics System
 * Comprehensive realistic mock data with all combinations and scenarios
 */

// ============================================================================
// INVENTORY MANAGEMENT MOCK DATA - COMPLETE WITH ALL COMBINATIONS
// ============================================================================

export const inventoryMockData = {
  materials: [
    { id: 'm-001', name: 'Iron Ore (Pellets)', quantity: 12500, unit: 'tonnes', stockyard: 'Bokaro-Main', grade: 'Premium', price: 3200, lastUpdated: '2025-11-24 14:30', status: 'available' },
    { id: 'm-002', name: 'Coking Coal', quantity: 8400, unit: 'tonnes', stockyard: 'Bokaro-Coal', grade: 'Grade-A', price: 4800, lastUpdated: '2025-11-24 13:45', status: 'available' },
    { id: 'm-003', name: 'Limestone', quantity: 5600, unit: 'tonnes', stockyard: 'Bokaro-Main', grade: 'Industrial', price: 950, lastUpdated: '2025-11-24 15:00', status: 'available' },
    { id: 'm-004', name: 'Manganese Ore', quantity: 3200, unit: 'tonnes', stockyard: 'Bokaro-Ore', grade: 'High-Grade', price: 5200, lastUpdated: '2025-11-24 14:15', status: 'available' },
    { id: 'm-005', name: 'Dolomite', quantity: 4100, unit: 'tonnes', stockyard: 'Bokaro-Main', grade: 'Refractory', price: 1100, lastUpdated: '2025-11-24 15:30', status: 'available' },
    { id: 'm-006', name: 'Coke Breeze', quantity: 2800, unit: 'tonnes', stockyard: 'Bokaro-Coal', grade: 'Standard', price: 2400, lastUpdated: '2025-11-24 14:00', status: 'available' },
    { id: 'm-007', name: 'Sinter Ore', quantity: 6200, unit: 'tonnes', stockyard: 'Bokaro-Main', grade: 'Grade-B', price: 2800, lastUpdated: '2025-11-24 14:45', status: 'available' },
    { id: 'm-008', name: 'Flux Stone', quantity: 3800, unit: 'tonnes', stockyard: 'Bokaro-Ore', grade: 'Industrial', price: 1200, lastUpdated: '2025-11-24 15:15', status: 'available' },
  ],
  rakes: [
    { id: 'rk-001', name: 'BOKARO-001', capacity: 1200, status: 'available', location: 'Bokaro Siding-1', wagons: 48, lastMaintenance: '2025-11-20', utilization: 0 },
    { id: 'rk-002', name: 'BOKARO-002', capacity: 1200, status: 'in-transit', location: 'En-route to Mumbai', wagons: 48, lastMaintenance: '2025-11-18', utilization: 95 },
    { id: 'rk-003', name: 'BOKARO-003', capacity: 1100, status: 'loading', location: 'Bokaro Siding-2', wagons: 44, lastMaintenance: '2025-11-22', utilization: 75 },
    { id: 'rk-004', name: 'BOKARO-004', capacity: 1200, status: 'available', location: 'Bokaro Siding-3', wagons: 48, lastMaintenance: '2025-11-21', utilization: 0 },
    { id: 'rk-005', name: 'BOKARO-005', capacity: 1100, status: 'unloading', location: 'Delhi Port', wagons: 44, lastMaintenance: '2025-11-19', utilization: 88 },
    { id: 'rk-006', name: 'BOKARO-006', capacity: 1200, status: 'available', location: 'Bokaro Siding-1', wagons: 48, lastMaintenance: '2025-11-23', utilization: 0 },
  ],
  loadingPoints: [
    { id: 'lp-001', name: 'Bokaro Siding-1', capacity: 1200, utilization: 92, status: 'active', material: 'Iron Ore', throughput: 1104 },
    { id: 'lp-002', name: 'Bokaro Siding-2', capacity: 1100, utilization: 78, status: 'active', material: 'Coking Coal', throughput: 858 },
    { id: 'lp-003', name: 'Bokaro Siding-3', capacity: 1200, utilization: 65, status: 'active', material: 'Limestone', throughput: 780 },
    { id: 'lp-004', name: 'Bokaro Siding-4', capacity: 900, utilization: 88, status: 'maintenance', material: 'Manganese Ore', throughput: 792 },
    { id: 'lp-005', name: 'Bokaro Siding-5', capacity: 1000, utilization: 72, status: 'active', material: 'Dolomite', throughput: 720 },
  ],
  sidings: [
    { id: 'sd-001', name: 'Bokaro Main Siding', capacity: 5, available: 2, status: 'operational', rakes: 3, occupancy: 60 },
    { id: 'sd-002', name: 'Bokaro Coal Siding', capacity: 4, available: 1, status: 'operational', rakes: 3, occupancy: 75 },
    { id: 'sd-003', name: 'Bokaro Ore Siding', capacity: 3, available: 1, status: 'operational', rakes: 2, occupancy: 67 },
    { id: 'sd-004', name: 'Bokaro Secondary Siding', capacity: 6, available: 3, status: 'operational', rakes: 3, occupancy: 50 },
  ],
}

// ============================================================================
// ORDER MANAGEMENT MOCK DATA
// ============================================================================

export const orderMockData = {
  orders: [
    { id: 'ORD-2025-001', product: 'Iron Ore (Pellets)', quantity: 1200, destination: 'Tata Steel - Jamshedpur', priority: 'high', status: 'in-progress', deadline: '2025-11-26', customer: 'Tata Steel', rakeAssigned: 'BOKARO-002', value: 3840000 },
    { id: 'ORD-2025-002', product: 'Coking Coal', quantity: 800, destination: 'JSW Steel - Bellary', priority: 'high', status: 'confirmed', deadline: '2025-11-27', customer: 'JSW Steel', rakeAssigned: null, value: 3840000 },
    { id: 'ORD-2025-003', product: 'Limestone', quantity: 600, destination: 'SAIL - Durgapur', priority: 'medium', status: 'confirmed', deadline: '2025-11-29', customer: 'SAIL Durgapur', rakeAssigned: 'BOKARO-003', value: 570000 },
    { id: 'ORD-2025-004', product: 'Manganese Ore', quantity: 400, destination: 'Vedanta - Lanjigarh', priority: 'high', status: 'pending', deadline: '2025-11-28', customer: 'Vedanta', rakeAssigned: null, value: 2080000 },
    { id: 'ORD-2025-005', product: 'Dolomite', quantity: 500, destination: 'ArcelorMittal - Hazira', priority: 'medium', status: 'confirmed', deadline: '2025-11-30', customer: 'ArcelorMittal', rakeAssigned: 'BOKARO-004', value: 550000 },
    { id: 'ORD-2025-006', product: 'Coke Breeze', quantity: 350, destination: 'RINL - Vizag', priority: 'low', status: 'confirmed', deadline: '2025-12-02', customer: 'RINL', rakeAssigned: null, value: 840000 },
    { id: 'ORD-2025-007', product: 'Sinter Ore', quantity: 900, destination: 'NMDC - Hyderabad', priority: 'medium', status: 'confirmed', deadline: '2025-11-28', customer: 'NMDC', rakeAssigned: 'BOKARO-005', value: 2520000 },
    { id: 'ORD-2025-008', product: 'Flux Stone', quantity: 450, destination: 'Essar Steel - Hazira', priority: 'low', status: 'pending', deadline: '2025-12-01', customer: 'Essar Steel', rakeAssigned: null, value: 540000 },
  ],
}

// ============================================================================
// RAKE FORMATION MOCK DATA
// ============================================================================

export const rakeFormationMockData = {
  plans: [
    {
      id: 'PLAN-2025-001',
      date: '2025-11-24',
      rakes: [
        { rakeId: 'BOKARO-001', composition: ['Iron Ore (Pellets): 1200t'], destination: 'Tata Steel - Jamshedpur', status: 'scheduled', cost: 48000, distance: 320 },
        { rakeId: 'BOKARO-003', composition: ['Limestone: 600t', 'Dolomite: 500t'], destination: 'SAIL - Durgapur', status: 'scheduled', cost: 42000, distance: 280 },
      ],
      totalCost: 90000,
      utilization: 91.7,
      estimatedDelivery: '2025-11-26',
    },
  ],
}

// ============================================================================
// PRODUCT-WAGON MATRIX MOCK DATA
// ============================================================================

export const productWagonMockData = {
  compatibility: [
    { product: 'Iron Ore (Pellets)', wagon: 'Open-Top 25T', compatible: true, capacity: 25, notes: 'Preferred for ore' },
    { product: 'Iron Ore (Pellets)', wagon: 'Covered 20T', compatible: false, capacity: 20, notes: 'Not suitable - dust loss' },
    { product: 'Coking Coal', wagon: 'Covered 20T', compatible: true, capacity: 20, notes: 'Must be covered' },
    { product: 'Coking Coal', wagon: 'Open-Top 25T', compatible: false, capacity: 25, notes: 'Weather damage risk' },
    { product: 'Limestone', wagon: 'Open-Top 25T', compatible: true, capacity: 25, notes: 'Standard transport' },
    { product: 'Manganese Ore', wagon: 'Open-Top 25T', compatible: true, capacity: 25, notes: 'High value - secure' },
    { product: 'Dolomite', wagon: 'Open-Top 25T', compatible: true, capacity: 25, notes: 'Refractory grade' },
    { product: 'Coke Breeze', wagon: 'Covered 20T', compatible: true, capacity: 20, notes: 'Dust control needed' },
  ],
}

// ============================================================================
// RAIL VS ROAD OPTIMIZATION MOCK DATA
// ============================================================================

export const railRoadMockData = {
  routes: [
    { id: 'route-001', origin: 'Bokaro', destination: 'Tata Steel - Jamshedpur', distance: 320, rail: { cost: 48000, time: 48, capacity: 1200, costPerTon: 40 }, road: { cost: 72000, time: 24, capacity: 500, costPerTon: 144 }, recommendation: 'Rail (60% cheaper)' },
    { id: 'route-002', origin: 'Bokaro', destination: 'SAIL - Durgapur', distance: 280, rail: { cost: 42000, time: 36, capacity: 1200, costPerTon: 35 }, road: { cost: 68000, time: 20, capacity: 500, costPerTon: 136 }, recommendation: 'Rail (38% cheaper)' },
    { id: 'route-003', origin: 'Bokaro', destination: 'JSW Steel - Bellary', distance: 850, rail: { cost: 125000, time: 96, capacity: 1200, costPerTon: 104 }, road: { cost: 185000, time: 48, capacity: 500, costPerTon: 370 }, recommendation: 'Rail (32% cheaper)' },
    { id: 'route-004', origin: 'Bokaro', destination: 'ArcelorMittal - Hazira', distance: 920, rail: { cost: 138000, time: 108, capacity: 1200, costPerTon: 115 }, road: { cost: 195000, time: 52, capacity: 500, costPerTon: 390 }, recommendation: 'Rail (29% cheaper)' },
  ],
}

// ============================================================================
// COST ANALYSIS MOCK DATA
// ============================================================================

export const costAnalysisMockData = {
  breakdowns: [
    {
      id: 'cb-ORD-2025-001',
      orderId: 'ORD-2025-001',
      product: 'Iron Ore (Pellets)',
      quantity: 1200,
      components: [
        { name: 'Material Cost (₹2,700/t)', amount: 3240000, percentage: 35 },
        { name: 'Rail Transport (₹40/t)', amount: 48000, percentage: 0.5 },
        { name: 'Loading/Unloading', amount: 360000, percentage: 4 },
        { name: 'Handling & Demurrage', amount: 540000, percentage: 6 },
        { name: 'Overhead & Admin', amount: 2052000, percentage: 22 },
        { name: 'Profit Margin (15%)', amount: 1620000, percentage: 17.5 },
      ],
      totalCost: 8100000,
      costPerUnit: 6750,
      margin: 1620000,
    },
    {
      id: 'cb-ORD-2025-002',
      orderId: 'ORD-2025-002',
      product: 'Coking Coal',
      quantity: 800,
      components: [
        { name: 'Material Cost (₹4,200/t)', amount: 3360000, percentage: 40 },
        { name: 'Rail Transport (₹52.5/t)', amount: 42000, percentage: 0.5 },
        { name: 'Loading/Unloading', amount: 240000, percentage: 3 },
        { name: 'Handling & Demurrage', amount: 360000, percentage: 4.3 },
        { name: 'Overhead & Admin', amount: 1560000, percentage: 18.6 },
        { name: 'Profit Margin (15%)', amount: 1260000, percentage: 15 },
      ],
      totalCost: 6822000,
      costPerUnit: 8527.5,
      margin: 1260000,
    },
  ],
}

// ============================================================================
// PRODUCTION RECOMMENDATION MOCK DATA
// ============================================================================

export const productionMockData = {
  demands: [
    { id: 'd-001', product: 'Iron Ore (Pellets)', forecastedDemand: 28000, confidence: 0.94, trend: 'increasing', monthlyGrowth: 3.2, source: 'Tata Steel + JSW' },
    { id: 'd-002', product: 'Coking Coal', forecastedDemand: 18000, confidence: 0.91, trend: 'stable', monthlyGrowth: 0.5, source: 'SAIL + ArcelorMittal' },
    { id: 'd-003', product: 'Limestone', forecastedDemand: 12000, confidence: 0.88, trend: 'decreasing', monthlyGrowth: -1.2, source: 'Multiple customers' },
    { id: 'd-004', product: 'Manganese Ore', forecastedDemand: 8000, confidence: 0.85, trend: 'increasing', monthlyGrowth: 2.8, source: 'Vedanta + RINL' },
  ],
  recommendations: [
    { id: 'rec-001', product: 'Iron Ore (Pellets)', recommendedProduction: 30000, reason: 'High demand + 3.2% growth trend', priority: 'high', potentialRevenue: 202500000 },
    { id: 'rec-002', product: 'Coking Coal', recommendedProduction: 18500, reason: 'Stable demand, maintain capacity', priority: 'medium', potentialRevenue: 157725000 },
    { id: 'rec-003', product: 'Limestone', recommendedProduction: 11500, reason: 'Declining trend, optimize production', priority: 'medium', potentialRevenue: 10925000 },
  ],
}

// ============================================================================
// CONSTRAINTS MANAGEMENT MOCK DATA
// ============================================================================

export const constraintsMockData = {
  constraints: [
    { id: 'c-001', name: 'Minimum Rake Size', type: 'capacity', rule: 'Min 300 tonnes per rake', severity: 'critical', status: 'active', impact: 'Prevents underutilization' },
    { id: 'c-002', name: 'Loading Point Capacity', type: 'capacity', rule: 'Max 1200 tonnes per loading point', severity: 'high', status: 'active', impact: 'Prevents bottlenecks' },
    { id: 'c-003', name: 'Siding Availability', type: 'resource', rule: '5 sidings available for operations', severity: 'high', status: 'active', impact: 'Limits concurrent operations' },
    { id: 'c-004', name: 'Wagon Maintenance', type: 'maintenance', rule: 'Maintenance every 30 days', severity: 'medium', status: 'active', impact: 'Reduces available fleet' },
  ],
  violations: [
    { id: 'v-001', constraint: 'Minimum Rake Size', severity: 'warning', message: 'Rake BOKARO-005 at 950t (below 1100t capacity)', resolution: 'Consolidate with next batch' },
  ],
}

// ============================================================================
// SCENARIO ANALYSIS MOCK DATA
// ============================================================================

export const scenarioMockData = {
  scenarios: [
    { id: 's-001', name: 'Current Operations', description: 'Baseline - current fleet & processes', utilization: 72.5, costPerTon: 6750, onTime: 91.2, monthlyRevenue: 450000000 },
    { id: 's-002', name: 'Optimized Fleet (+2 Rakes)', description: 'Add 2 rakes, improve scheduling', utilization: 85.3, costPerTon: 6200, onTime: 96.8, monthlyRevenue: 520000000 },
    { id: 's-003', name: 'Cost Reduction (Consolidation)', description: 'Consolidate orders, reduce demurrage', utilization: 78.9, costPerTon: 5850, onTime: 93.5, monthlyRevenue: 485000000 },
    { id: 's-004', name: 'Premium Service (Express)', description: 'Premium pricing, guaranteed delivery', utilization: 68.0, costPerTon: 7500, onTime: 99.2, monthlyRevenue: 580000000 },
  ],
}

// ============================================================================
// REPORTING MOCK DATA
// ============================================================================

export const reportingMockData = {
  reports: [
    { id: 'r-001', name: 'Weekly Operations Summary (Nov 24)', type: 'summary', format: 'pdf', size: '2.4 MB', generatedAt: '2025-11-24 16:00', status: 'completed', metrics: '5 rakes, 6 orders, 92% utilization' },
    { id: 'r-002', name: 'Rake Utilization Report (Nov 2025)', type: 'detailed', format: 'excel', size: '1.8 MB', generatedAt: '2025-11-23 10:30', status: 'completed', metrics: '72.5% avg utilization, 15 completed routes' },
    { id: 'r-003', name: 'Cost Analysis Deep Dive (Nov 24)', type: 'technical', format: 'html', size: '3.2 MB', generatedAt: '2025-11-24 14:00', status: 'completed', metrics: '₹6,750/ton avg cost, ₹12.9M total revenue' },
    { id: 'r-004', name: 'Customer Performance Report', type: 'summary', format: 'pdf', size: '1.6 MB', generatedAt: '2025-11-22 09:00', status: 'completed', metrics: '6 customers, 100% on-time delivery' },
  ],
}

// ============================================================================
// MONITORING MOCK DATA
// ============================================================================

export const monitoringMockData = {
  kpis: {
    on_time_rate: 0.912,
    demurrage_savings_monthly_inr: 2400000,
    cost_per_ton: 6750,
    rake_utilization: 0.725,
    system_uptime_pct: 99.7,
    total_orders_processed: 6,
    total_rakes_active: 5,
    revenue_monthly: 450000000,
  },
  alerts: [
    { id: 'a-001', severity: 'P2', title: 'High API Latency', message: 'Average latency 2500ms exceeds 2000ms threshold', timestamp: '2025-11-24 15:45' },
    { id: 'a-002', severity: 'P1', title: 'Siding Capacity Alert', message: 'Bokaro Main Siding at 80% capacity, only 1 slot available', timestamp: '2025-11-24 14:30' },
    { id: 'a-003', severity: 'P3', title: 'Maintenance Due', message: 'Rake BOKARO-005 maintenance due in 3 days', timestamp: '2025-11-24 10:00' },
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
