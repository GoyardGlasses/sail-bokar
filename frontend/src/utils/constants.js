/**
 * Application constants
 */

export const MATERIALS = [
  'HR_Coils',
  'CR_Coils',
  'Plates',
  'Wire_Rods',
  'TMT_Bars',
  'Pig_Iron',
  'Billets',
]

export const DESTINATIONS = [
  'Kolkata',
  'Patna',
  'Ranchi',
  'Durgapur',
  'Haldia',
]

export const LOADING_POINTS = [
  'LP1',
  'LP2',
  'LP3',
]

export const PRIORITIES = [
  { value: 'HIGH', label: 'High', color: 'danger' },
  { value: 'MEDIUM', label: 'Medium', color: 'warning' },
  { value: 'LOW', label: 'Low', color: 'success' },
]

export const TRANSPORT_MODES = [
  { value: 'RAIL', label: 'Rail' },
  { value: 'ROAD', label: 'Road' },
]

export const SOLVER_STATUSES = {
  OPTIMAL: 'Optimal',
  FEASIBLE: 'Feasible',
  INFEASIBLE: 'Infeasible',
  MODEL_INVALID: 'Model Invalid',
  UNKNOWN: 'Unknown',
}

export const STOCKYARDS = {
  BOKARO: { lat: 23.1815, lng: 85.2273, name: 'Bokaro Plant' },
  CMO: { lat: 22.5726, lng: 88.3639, name: 'CMO Stockyard' },
  KOLKATA: { lat: 22.5726, lng: 88.3639, name: 'Kolkata' },
  PATNA: { lat: 25.5941, lng: 85.1376, name: 'Patna' },
  RANCHI: { lat: 23.3441, lng: 85.3096, name: 'Ranchi' },
}

export const API_TIMEOUT = 30000 // 30 seconds
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'
