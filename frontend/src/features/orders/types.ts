/**
 * Order Management Types
 * Complete type definitions for order management system
 */

// ============================================================================
// ORDER TYPES
// ============================================================================

export type OrderStatus = 'pending' | 'allocated' | 'loading' | 'dispatched' | 'in_transit' | 'delivered' | 'cancelled'
export type OrderPriority = 'low' | 'medium' | 'high' | 'urgent'
export type FulfillmentMode = 'rail' | 'road' | 'mixed'

export interface OrderItem {
  id: string
  materialId: string
  materialName: string
  quantity: number // tonnes
  quantityUnit: 'tonnes' | 'units'
  destination: string
  priority: OrderPriority
  specialRequirements?: string[]
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  location: string
  creditLimit: number
  rating: number // 1-5
}

export interface Order {
  id: string
  orderId: string // e.g., ORD-001
  customerId: string
  customer: Customer
  items: OrderItem[]
  totalQuantity: number // tonnes
  orderDate: string
  requiredDeliveryDate: string
  sla: number // hours
  priority: OrderPriority
  status: OrderStatus
  fulfillmentMode: FulfillmentMode
  estimatedCost: number
  actualCost?: number
  assignedRakes?: string[] // Rake IDs
  assignedTrucks?: string[] // Truck IDs
  loadingPointId?: string
  dispatchDate?: string
  deliveryDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OrderAllocation {
  id: string
  orderId: string
  order: Order
  stockyardId: string
  stockyardName: string
  materialId: string
  materialName: string
  allocatedQuantity: number
  allocationDate: string
  status: 'allocated' | 'loading' | 'loaded' | 'dispatched'
  rakeId?: string
  truckId?: string
  loadingScheduleId?: string
}

export interface OrderTracking {
  orderId: string
  order: Order
  currentStatus: OrderStatus
  statusHistory: {
    status: OrderStatus
    timestamp: string
    location?: string
    notes?: string
  }[]
  estimatedDelivery: string
  actualDelivery?: string
  delayDays: number
  slaCompliance: boolean
  trackingUrl?: string
}

export interface OrderFeasibility {
  orderId: string
  isFeasible: boolean
  feasibilityScore: number // 0-100
  availableStockyards: {
    stockyardId: string
    stockyardName: string
    availableQuantity: number
    distance: number
    cost: number
  }[]
  recommendedStockyard: {
    stockyardId: string
    stockyardName: string
    reason: string
  }
  constraints: {
    constraint: string
    severity: 'critical' | 'warning' | 'info'
    resolution?: string
  }[]
  railVsRoadAnalysis: {
    mode: 'rail' | 'road'
    cost: number
    time: number // hours
    feasibility: number // 0-100
  }[]
  recommendedMode: 'rail' | 'road'
}

export interface OrderAlert {
  id: string
  type: 'sla_risk' | 'inventory_shortage' | 'capacity_issue' | 'delay_warning' | 'cost_overrun'
  orderId: string
  message: string
  severity: 'critical' | 'warning' | 'info'
  createdAt: string
  resolved: boolean
}

// ============================================================================
// ORDER MATCHING TYPES
// ============================================================================

export interface OrderMatchingRequest {
  orderId: string
  materialId: string
  quantity: number
  destination: string
  requiredDate: string
  priority: OrderPriority
}

export interface OrderMatchingResult {
  orderId: string
  matchingScore: number // 0-100
  possibleAllocations: {
    stockyardId: string
    stockyardName: string
    availableQuantity: number
    quality: string
    age: number // days
    cost: number
    distance: number
    estimatedDelivery: string
  }[]
  bestMatch: {
    stockyardId: string
    stockyardName: string
    quantity: number
    cost: number
    estimatedDelivery: string
  }
  alternativeMatches: {
    stockyardId: string
    stockyardName: string
    quantity: number
    cost: number
    estimatedDelivery: string
  }[]
}

// ============================================================================
// ORDER ANALYTICS TYPES
// ============================================================================

export interface OrderAnalytics {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  onTimeDeliveryPercentage: number
  averageDeliveryTime: number // hours
  averageOrderValue: number
  totalOrderValue: number
  slaCompliancePercentage: number
  delayedOrders: number
  costOverrunOrders: number
}

export interface OrderMetrics {
  date: string
  ordersCreated: number
  ordersCompleted: number
  ordersDelayed: number
  totalQuantity: number
  totalCost: number
  averageCost: number
  slaCompliance: number
}

// ============================================================================
// ORDER STATE TYPES
// ============================================================================

export interface OrderState {
  orders: Order[]
  allocations: OrderAllocation[]
  tracking: OrderTracking[]
  feasibilities: OrderFeasibility[]
  alerts: OrderAlert[]
  analytics: OrderAnalytics | null
  metrics: OrderMetrics[]
  
  isLoading: boolean
  error: string | null
  selectedOrder?: string
  filterStatus?: OrderStatus
  filterPriority?: OrderPriority
}

// ============================================================================
// ORDER SUMMARY TYPES
// ============================================================================

export interface OrderSummary {
  totalOrders: number
  pendingOrders: number
  allocatedOrders: number
  loadingOrders: number
  dispatchedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  totalQuantity: number
  totalValue: number
  onTimeDeliveryRate: number
  slaComplianceRate: number
  averageDeliveryTime: number
  criticalAlerts: number
}

export interface OrdersByPriority {
  low: number
  medium: number
  high: number
  urgent: number
}

export interface OrdersByStatus {
  pending: number
  allocated: number
  loading: number
  dispatched: number
  in_transit: number
  delivered: number
  cancelled: number
}

// ============================================================================
// SCENARIO TYPES FOR TESTING
// ============================================================================

export interface OrderScenario {
  name: string
  description: string
  orders: Order[]
  expectedOutcome: string
  testCases: {
    description: string
    input: any
    expectedOutput: any
  }[]
}
