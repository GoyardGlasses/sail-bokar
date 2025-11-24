/**
 * Product vs Wagon Matrix Types
 * Compatibility matrix and constraint definitions
 */

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export interface Product {
  id: string
  name: string
  type: 'coal' | 'iron_ore' | 'limestone' | 'finished_goods' | 'other'
  density: number // kg/m³
  weight: number // kg per unit
  volume: number // m³ per unit
  specialHandling: string[]
  storageRequirements: string[]
  hazardous: boolean
  maxStackHeight: number // meters
}

// ============================================================================
// WAGON TYPES
// ============================================================================

export interface WagonType {
  id: string
  name: string
  capacity: number // tonnes
  volume: number // m³
  type: 'open' | 'covered' | 'tanker' | 'specialized'
  loadingEquipment: string[]
  unloadingEquipment: string[]
  maxLoadingTime: number // minutes
  costPerKm: number
  maintenanceSchedule: number // days
}

// ============================================================================
// COMPATIBILITY MATRIX
// ============================================================================

export interface Compatibility {
  productId: string
  wagonTypeId: string
  isCompatible: boolean
  efficiency: number // 0-100 (cost efficiency)
  safetyRating: number // 0-100
  utilizationRating: number // 0-100
  notes: string
  constraints: string[]
  recommendations: string[]
}

export interface CompatibilityMatrix {
  id: string
  products: Product[]
  wagonTypes: WagonType[]
  compatibilities: Compatibility[]
  lastUpdated: string
}

// ============================================================================
// CONSTRAINT TYPES
// ============================================================================

export interface ProductConstraint {
  id: string
  productId: string
  type: 'forbidden_wagon' | 'required_wagon' | 'forbidden_combination' | 'required_equipment'
  wagonTypeId?: string
  otherProductId?: string
  equipment?: string[]
  reason: string
  severity: 'critical' | 'warning' | 'info'
}

export interface WagonConstraint {
  id: string
  wagonTypeId: string
  type: 'forbidden_product' | 'required_product' | 'capacity_limit' | 'equipment_required'
  productId?: string
  maxCapacity?: number
  equipment?: string[]
  reason: string
  severity: 'critical' | 'warning' | 'info'
}

// ============================================================================
// RULE TYPES
// ============================================================================

export interface CompatibilityRule {
  id: string
  name: string
  description: string
  productTypes: string[]
  wagonTypes: string[]
  rule: 'allow' | 'forbid' | 'prefer' | 'avoid'
  priority: number // 1-10
  active: boolean
}

export interface CombinationRule {
  id: string
  name: string
  description: string
  product1Id: string
  product2Id: string
  wagonTypeId: string
  rule: 'allow' | 'forbid' | 'separate'
  reason: string
  priority: number
  active: boolean
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: string[]
}

export interface ValidationError {
  type: string
  message: string
  severity: 'critical' | 'error'
  affectedItems: string[]
}

export interface ValidationWarning {
  type: string
  message: string
  severity: 'warning' | 'info'
  affectedItems: string[]
}

// ============================================================================
// STATE TYPES
// ============================================================================

export interface ProductWagonMatrixState {
  matrix: CompatibilityMatrix | null
  products: Product[]
  wagonTypes: WagonType[]
  compatibilities: Compatibility[]
  constraints: (ProductConstraint | WagonConstraint)[]
  rules: (CompatibilityRule | CombinationRule)[]
  selectedProduct?: string
  selectedWagon?: string
  isLoading: boolean
  error: string | null
}

// ============================================================================
// ANALYSIS TYPES
// ============================================================================

export interface MatrixAnalysis {
  totalProducts: number
  totalWagons: number
  compatiblePairs: number
  incompatiblePairs: number
  compatibilityPercentage: number
  averageEfficiency: number
  averageSafety: number
  averageUtilization: number
  criticalConstraints: number
  warningConstraints: number
}

export interface ProductAnalysis {
  productId: string
  compatibleWagons: WagonType[]
  incompatibleWagons: WagonType[]
  bestWagon: WagonType | null
  worstWagon: WagonType | null
  averageEfficiency: number
  constraints: ProductConstraint[]
}

export interface WagonAnalysis {
  wagonTypeId: string
  compatibleProducts: Product[]
  incompatibleProducts: Product[]
  bestProduct: Product | null
  worstProduct: Product | null
  averageEfficiency: number
  constraints: WagonConstraint[]
}
