/**
 * Inventory Management Types
 * Complete type definitions for inventory system
 */

// ============================================================================
// MATERIAL INVENTORY TYPES
// ============================================================================

export interface Material {
  id: string
  name: string
  type: 'coal' | 'iron_ore' | 'limestone' | 'finished_goods' | 'other'
  density: number // kg/m³
  weight: number // kg
  volume: number // m³
  specialHandling: string[]
  storageRequirements: string[]
}

export interface MaterialInventory {
  id: string
  materialId: string
  material: Material
  stockyardId: string
  stockyardName: string
  quantity: number // in tonnes
  quantityUnit: 'tonnes' | 'units'
  dateReceived: string
  expiryDate?: string
  ageInDays: number
  quality: 'A' | 'B' | 'C' // Quality grades
  location: string // Specific location in stockyard
  status: 'available' | 'reserved' | 'damaged' | 'quarantine'
  lastUpdated: string
}

export interface MaterialAlert {
  id: string
  type: 'low_stock' | 'overstock' | 'expiry_soon' | 'quality_issue' | 'aging'
  materialId: string
  stockyardId: string
  message: string
  severity: 'critical' | 'warning' | 'info'
  createdAt: string
  resolved: boolean
}

// ============================================================================
// RAKE & WAGON INVENTORY TYPES
// ============================================================================

export interface WagonType {
  id: string
  name: string
  capacity: number // tonnes
  volume: number // m³
  type: 'open' | 'covered' | 'tanker' | 'specialized'
  compatibleMaterials: string[] // Material IDs
  loadingEquipment: string[]
  maintenanceSchedule: number // days
  costPerKm: number
}

export interface Wagon {
  id: string
  wagonTypeId: string
  wagonType: WagonType
  registrationNumber: string
  currentLocation: string
  status: 'available' | 'in_use' | 'maintenance' | 'damaged'
  lastMaintenanceDate: string
  nextMaintenanceDate: string
  currentLoad: number // tonnes
  loadingStatus: 'empty' | 'partial' | 'full'
  lastUpdated: string
}

export interface Rake {
  id: string
  rakeId: string // e.g., RAKE-001
  wagons: Wagon[]
  totalCapacity: number // tonnes
  currentLoad: number // tonnes
  utilizationPercentage: number
  status: 'available' | 'forming' | 'ready' | 'dispatched' | 'in_transit'
  assignedLoadingPoint?: string
  assignedRoute?: string
  estimatedDispatchTime?: string
  createdAt: string
  lastUpdated: string
}

export interface RakeAlert {
  id: string
  type: 'maintenance_due' | 'capacity_issue' | 'availability_issue'
  rakeId: string
  message: string
  severity: 'critical' | 'warning' | 'info'
  createdAt: string
  resolved: boolean
}

// ============================================================================
// LOADING POINT TYPES
// ============================================================================

export interface LoadingPoint {
  id: string
  name: string
  location: string
  stockyardId: string
  capacity: number // tonnes/day
  operationalHours: {
    start: string // HH:MM
    end: string // HH:MM
  }
  equipment: string[]
  compatibleWagonTypes: string[] // WagonType IDs
  currentUtilization: number // percentage
  status: 'operational' | 'maintenance' | 'closed'
  lastUpdated: string
}

export interface LoadingSchedule {
  id: string
  loadingPointId: string
  rakeId: string
  materialId: string
  scheduledTime: string
  estimatedDuration: number // minutes
  quantity: number // tonnes
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  actualStartTime?: string
  actualEndTime?: string
  createdAt: string
}

export interface LoadingPointAlert {
  id: string
  type: 'capacity_exceeded' | 'equipment_failure' | 'queue_buildup' | 'schedule_conflict'
  loadingPointId: string
  message: string
  severity: 'critical' | 'warning' | 'info'
  createdAt: string
  resolved: boolean
}

// ============================================================================
// SIDING & CAPACITY TYPES
// ============================================================================

export interface Siding {
  id: string
  name: string
  location: string
  capacity: number // number of rakes
  currentOccupancy: number
  availableSpace: number
  status: 'operational' | 'maintenance' | 'full'
  rakes: string[] // Rake IDs
  lastUpdated: string
}

export interface SidingAlert {
  id: string
  type: 'capacity_full' | 'maintenance_required'
  sidingId: string
  message: string
  severity: 'critical' | 'warning'
  createdAt: string
  resolved: boolean
}

// ============================================================================
// INVENTORY STATE TYPES
// ============================================================================

export interface InventoryState {
  // Material Inventory
  materialInventories: MaterialInventory[]
  materialAlerts: MaterialAlert[]
  
  // Rake & Wagon
  rakes: Rake[]
  wagons: Wagon[]
  wagonTypes: WagonType[]
  rakeAlerts: RakeAlert[]
  
  // Loading Points
  loadingPoints: LoadingPoint[]
  loadingSchedules: LoadingSchedule[]
  loadingPointAlerts: LoadingPointAlert[]
  
  // Sidings
  sidings: Siding[]
  sidingAlerts: SidingAlert[]
  
  // UI State
  isLoading: boolean
  error: string | null
  selectedStockyard?: string
  selectedRake?: string
  selectedLoadingPoint?: string
}

// ============================================================================
// INVENTORY SUMMARY TYPES
// ============================================================================

export interface InventorySummary {
  totalMaterialQuantity: number // tonnes
  totalRakeCapacity: number // tonnes
  totalRakeUtilization: number // percentage
  availableRakes: number
  utilizationByMaterial: Record<string, number>
  utilizationByStockyard: Record<string, number>
  criticalAlerts: number
  warningAlerts: number
}

export interface StockyardInventory {
  stockyardId: string
  stockyardName: string
  materials: MaterialInventory[]
  totalQuantity: number
  loadingPoints: LoadingPoint[]
  averageUtilization: number
  alerts: MaterialAlert[]
}

// ============================================================================
// SCENARIO TYPES FOR TESTING
// ============================================================================

export interface InventoryScenario {
  name: string
  description: string
  materials: MaterialInventory[]
  rakes: Rake[]
  wagons: Wagon[]
  loadingPoints: LoadingPoint[]
  sidings: Siding[]
  expectedOutcome: string
}
