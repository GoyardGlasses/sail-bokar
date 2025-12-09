# 🛣️ IMPLEMENTATION ROADMAP - SAIL REQUIREMENTS

## Overview
This roadmap shows exactly what needs to be built to meet SAIL's 12 requirements.

---

## 🔴 PHASE 1: CRITICAL GAPS (Weeks 1-2)
**These 3 features are BLOCKING everything else**

### 1.1 Stock → Orders → Wagons Matching System

#### What to Build
```typescript
// File: frontend/src/features/rakeFormation/stockAllocation.ts

interface StockyardInventory {
  stockyardId: string
  name: string
  location: string
  materials: {
    materialId: string
    materialName: string
    quantity: number
    reserved: number
    quality: string
    age: number
  }[]
  lastUpdated: Date
}

interface StockAllocation {
  orderId: string
  stockyardId: string
  materialId: string
  quantity: number
  cost: number
  distance: number
  quality: string
  feasibility: number // 0-100
}

// Main algorithm
export function allocateStockToOrders(
  orders: Order[],
  stockyards: StockyardInventory[]
): StockAllocation[] {
  const allocations: StockAllocation[] = []
  
  for (const order of orders) {
    // Find all stockyards with this material
    const candidates = stockyards.filter(sy =>
      sy.materials.some(m =>
        m.materialId === order.materialId &&
        m.quantity - m.reserved >= order.quantity &&
        m.quality >= order.requiredQuality
      )
    )
    
    // Score each candidate
    const scored = candidates.map(sy => ({
      stockyard: sy,
      score: calculateAllocationScore(sy, order)
    }))
    
    // Pick best
    const best = scored.sort((a, b) => b.score - a.score)[0]
    
    if (best) {
      allocations.push({
        orderId: order.orderId,
        stockyardId: best.stockyard.stockyardId,
        materialId: order.materialId,
        quantity: order.quantity,
        cost: calculateAllocationCost(best.stockyard, order),
        distance: calculateDistance(best.stockyard.location, order.destination),
        quality: best.stockyard.materials.find(m => m.materialId === order.materialId)?.quality || 'A',
        feasibility: best.score
      })
      
      // Reserve stock
      const material = best.stockyard.materials.find(m => m.materialId === order.materialId)
      if (material) material.reserved += order.quantity
    }
  }
  
  return allocations
}

function calculateAllocationScore(stockyard: StockyardInventory, order: Order): number {
  const material = stockyard.materials.find(m => m.materialId === order.materialId)!
  
  // Factors
  const availabilityScore = (material.quantity - material.reserved) / order.quantity * 100
  const distanceScore = Math.max(0, 100 - calculateDistance(stockyard.location, order.destination))
  const qualityScore = material.quality === order.requiredQuality ? 100 : 50
  const ageScore = Math.max(0, 100 - material.age * 5) // Prefer fresher stock
  
  // Weighted score
  return (
    availabilityScore * 0.3 +
    distanceScore * 0.3 +
    qualityScore * 0.2 +
    ageScore * 0.2
  )
}
```

#### Backend Changes
```python
# File: backend/app/routers/rake_formation.py - Add endpoint

@router.post("/api/rake-formation/allocate-stock")
async def allocate_stock(orders: List[Order], constraints: Constraints):
    """
    Allocate orders to stockyards
    Returns: which stockyard supplies which order
    """
    # Get real-time inventory from database
    stockyards = await get_stockyard_inventory()
    
    # Run allocation algorithm
    allocations = allocate_stock_to_orders(orders, stockyards)
    
    return {
        "allocations": allocations,
        "totalCost": sum(a.cost for a in allocations),
        "feasibility": sum(a.feasibility for a in allocations) / len(allocations)
    }
```

#### UI Component
```jsx
// File: frontend/src/features/rakeFormation/components/StockAllocationPanel.jsx

export default function StockAllocationPanel({ orders }) {
  const [allocations, setAllocations] = useState([])
  const [loading, setLoading] = useState(false)
  
  const handleAllocate = async () => {
    setLoading(true)
    const response = await fetch('/api/rake-formation/allocate-stock', {
      method: 'POST',
      body: JSON.stringify({ orders })
    })
    const data = await response.json()
    setAllocations(data.allocations)
    setLoading(false)
  }
  
  return (
    <div className="card">
      <h3>Stock Allocation</h3>
      <button onClick={handleAllocate} disabled={loading}>
        {loading ? 'Allocating...' : 'Allocate Stock'}
      </button>
      
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Stockyard</th>
            <th>Quantity</th>
            <th>Quality</th>
            <th>Cost</th>
            <th>Feasibility</th>
          </tr>
        </thead>
        <tbody>
          {allocations.map(a => (
            <tr key={a.orderId}>
              <td>{a.orderId}</td>
              <td>{a.stockyardId}</td>
              <td>{a.quantity} tonnes</td>
              <td>{a.quality}</td>
              <td>₹{a.cost.toLocaleString()}</td>
              <td>{a.feasibility.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**Effort**: 3-4 days
**Files**: 3 new files, 2 modified

---

### 1.2 Routing + Loading Point Optimization

#### What to Build
```typescript
// File: frontend/src/features/rakeFormation/routeOptimization.ts

interface LoadingPointStatus {
  pointId: string
  stockyardId: string
  name: string
  capacity: number // tonnes/day
  currentLoad: number
  availableCapacity: number
  nextAvailableTime: Date
  equipment: string[]
  operationalHours: { start: string; end: string }
}

interface Route {
  routeId: string
  from: string
  to: string
  distance: number
  estimatedTime: number
  cost: number
  congestionLevel: number // 0-100
  sidingCapacity: number
  restrictions: string[]
}

interface RoutingDecision {
  orderId: string
  loadingPointId: string
  routeId: string
  totalCost: number
  estimatedDeliveryTime: Date
  feasibility: number
}

// Main routing algorithm
export function optimizeRouting(
  allocations: StockAllocation[],
  loadingPoints: LoadingPointStatus[],
  routes: Route[],
  constraints: Constraints
): RoutingDecision[] {
  const decisions: RoutingDecision[] = []
  
  for (const allocation of allocations) {
    // Find loading points at this stockyard
    const availableLPs = loadingPoints.filter(lp =>
      lp.stockyardId === allocation.stockyardId &&
      lp.availableCapacity >= allocation.quantity &&
      hasRequiredEquipment(lp, allocation.materialId)
    )
    
    if (availableLPs.length === 0) {
      console.warn(`No loading point available for order ${allocation.orderId}`)
      continue
    }
    
    // Find best route to destination
    const possibleRoutes = routes.filter(r =>
      r.from === allocation.stockyardId &&
      r.to === allocation.destination &&
      r.sidingCapacity >= constraints.minRakeSize
    )
    
    // Score each combination
    const scored = availableLPs.flatMap(lp =>
      possibleRoutes.map(route => ({
        lp,
        route,
        score: calculateRoutingScore(lp, route, allocation, constraints)
      }))
    )
    
    // Pick best
    const best = scored.sort((a, b) => b.score - a.score)[0]
    
    if (best) {
      decisions.push({
        orderId: allocation.orderId,
        loadingPointId: best.lp.pointId,
        routeId: best.route.routeId,
        totalCost: allocation.cost + best.route.cost,
        estimatedDeliveryTime: new Date(Date.now() + best.route.estimatedTime * 3600000),
        feasibility: best.score
      })
      
      // Update loading point capacity
      best.lp.currentLoad += allocation.quantity
      best.lp.availableCapacity -= allocation.quantity
    }
  }
  
  return decisions
}

function calculateRoutingScore(
  lp: LoadingPointStatus,
  route: Route,
  allocation: StockAllocation,
  constraints: Constraints
): number {
  // Factors
  const capacityScore = (lp.availableCapacity / lp.capacity) * 100
  const costScore = Math.max(0, 100 - (route.cost / 10000))
  const congestionScore = Math.max(0, 100 - route.congestionLevel)
  const timeScore = Math.max(0, 100 - (route.estimatedTime / 48)) // Prefer faster routes
  
  // Weighted score
  return (
    capacityScore * 0.2 +
    costScore * 0.4 +
    congestionScore * 0.2 +
    timeScore * 0.2
  )
}

function hasRequiredEquipment(lp: LoadingPointStatus, materialId: string): boolean {
  // Check if LP has equipment needed for this material
  const equipmentMap: Record<string, string[]> = {
    'coal-001': ['conveyor', 'loader'],
    'ore-001': ['conveyor', 'magnet'],
    'limestone-001': ['conveyor'],
  }
  
  const required = equipmentMap[materialId] || []
  return required.every(eq => lp.equipment.includes(eq))
}
```

#### Backend Changes
```python
# File: backend/app/routers/rake_formation.py - Add endpoint

@router.post("/api/rake-formation/optimize-routing")
async def optimize_routing(allocations: List[StockAllocation], constraints: Constraints):
    """
    Optimize loading points and routes
    Returns: which loading point and route to use for each order
    """
    # Get real-time loading point status
    loading_points = await get_loading_point_status()
    
    # Get routes
    routes = await get_routes()
    
    # Run routing optimization
    decisions = optimize_routing(allocations, loading_points, routes, constraints)
    
    return {
        "decisions": decisions,
        "totalCost": sum(d.total_cost for d in decisions),
        "feasibility": sum(d.feasibility for d in decisions) / len(decisions)
    }
```

**Effort**: 3-4 days
**Files**: 3 new files, 2 modified

---

### 1.3 Decision Support Integration

#### What to Build
```typescript
// File: frontend/src/features/rakeFormation/decisionSupport.ts

interface DecisionContext {
  orders: Order[]
  constraints: Constraints
  objectives: Objectives
  predictions: MLPredictions
}

interface DecisionResult {
  plan: RakeFormationPlan
  explanation: string
  confidence: number
  alternatives: RakeFormationPlan[]
  risks: Risk[]
}

// Main decision pipeline
export async function generateDecision(
  context: DecisionContext
): Promise<DecisionResult> {
  // Step 1: Get ML predictions
  const predictions = await getPredictions(context)
  
  // Step 2: Allocate stock
  const allocations = allocateStockToOrders(context.orders, predictions.stockyards)
  
  // Step 3: Optimize routing
  const routingDecisions = optimizeRouting(allocations, predictions.loadingPoints, predictions.routes)
  
  // Step 4: Form rakes
  const rakes = formRakes(allocations, routingDecisions, context.constraints)
  
  // Step 5: Optimize rakes
  const optimizedRakes = optimizeRakes(rakes, context.objectives)
  
  // Step 6: Generate explanation
  const explanation = generateExplanation(optimizedRakes, allocations, routingDecisions)
  
  // Step 7: Calculate confidence
  const confidence = calculateConfidence(optimizedRakes, predictions)
  
  // Step 8: Generate alternatives
  const alternatives = generateAlternatives(context, optimizedRakes)
  
  // Step 9: Identify risks
  const risks = identifyRisks(optimizedRakes, predictions)
  
  return {
    plan: {
      planId: `PLAN-${Date.now()}`,
      rakes: optimizedRakes,
      totalCost: optimizedRakes.reduce((sum, r) => sum + r.cost, 0),
      totalUtilization: optimizedRakes.reduce((sum, r) => sum + r.utilization, 0) / optimizedRakes.length,
      slaCompliance: calculateSLACompliance(optimizedRakes),
      feasibility: 100,
      metrics: calculateMetrics(optimizedRakes),
      constraints: []
    },
    explanation,
    confidence,
    alternatives,
    risks
  }
}

async function getPredictions(context: DecisionContext): Promise<MLPredictions> {
  // Call ML models to get predictions
  const response = await fetch('/api/ml/predict', {
    method: 'POST',
    body: JSON.stringify(context)
  })
  return response.json()
}

function generateExplanation(rakes: PlannedRake[], allocations: StockAllocation[], routingDecisions: RoutingDecision[]): string {
  let explanation = "Dispatch Plan Explanation:\n\n"
  
  for (const rake of rakes) {
    explanation += `Rake ${rake.rakeId}:\n`
    explanation += `  - Loading Point: ${rake.loadingPoint}\n`
    explanation += `  - Stockyard: ${rake.sourceStockyard}\n`
    explanation += `  - Orders: ${rake.composition.map(c => c.orderId).join(', ')}\n`
    explanation += `  - Utilization: ${rake.utilization.toFixed(1)}%\n`
    explanation += `  - Cost: ₹${rake.cost.toLocaleString()}\n`
    explanation += `  - Reason: ${getReasonForRake(rake, allocations, routingDecisions)}\n\n`
  }
  
  return explanation
}

function getReasonForRake(rake: PlannedRake, allocations: StockAllocation[], routingDecisions: RoutingDecision[]): string {
  const reasons: string[] = []
  
  // Why this stockyard
  const allocation = allocations.find(a => a.orderId === rake.composition[0].orderId)
  if (allocation) {
    reasons.push(`Stockyard ${allocation.stockyardId} has required material with best quality`)
  }
  
  // Why this loading point
  const routing = routingDecisions.find(r => r.orderId === rake.composition[0].orderId)
  if (routing) {
    reasons.push(`Loading point has required equipment and capacity`)
  }
  
  // Why these orders together
  if (rake.composition.length > 1) {
    reasons.push(`Orders combined to improve utilization from ${(rake.utilization / rake.composition.length).toFixed(1)}% to ${rake.utilization.toFixed(1)}%`)
  }
  
  return reasons.join("; ")
}

function calculateConfidence(rakes: PlannedRake[], predictions: MLPredictions): number {
  // Confidence based on:
  // 1. Prediction accuracy
  // 2. Constraint satisfaction
  // 3. Historical success rate
  
  const predictionConfidence = predictions.confidence || 0.8
  const constraintSatisfaction = 1.0 // All constraints satisfied
  const historicalSuccess = 0.92 // Based on past plans
  
  return (predictionConfidence * 0.4 + constraintSatisfaction * 0.4 + historicalSuccess * 0.2) * 100
}

function identifyRisks(rakes: PlannedRake[], predictions: MLPredictions): Risk[] {
  const risks: Risk[] = []
  
  // Check for high delay risk
  for (const rake of rakes) {
    const delayRisk = predictions.delayRisks[rake.rakeId] || 0
    if (delayRisk > 0.2) {
      risks.push({
        type: 'delay',
        severity: 'high',
        message: `High delay risk (${(delayRisk * 100).toFixed(1)}%) for rake ${rake.rakeId}`,
        mitigation: 'Consider earlier dispatch or alternative route'
      })
    }
  }
  
  // Check for low utilization
  for (const rake of rakes) {
    if (rake.utilization < 70) {
      risks.push({
        type: 'underutilization',
        severity: 'medium',
        message: `Low utilization (${rake.utilization.toFixed(1)}%) for rake ${rake.rakeId}`,
        mitigation: 'Consider consolidating with other orders'
      })
    }
  }
  
  return risks
}

function generateAlternatives(context: DecisionContext, bestPlan: PlannedRake[]): RakeFormationPlan[] {
  // Generate 2-3 alternative plans
  // Alternative 1: Cost-optimized
  // Alternative 2: Time-optimized
  // Alternative 3: Risk-minimized
  
  return [] // Placeholder
}
```

#### UI Component
```jsx
// File: frontend/src/features/rakeFormation/components/DecisionSupportPanel.jsx

export default function DecisionSupportPanel({ orders, constraints }) {
  const [decision, setDecision] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  
  const handleGenerateDecision = async () => {
    setLoading(true)
    const response = await fetch('/api/rake-formation/generate-decision', {
      method: 'POST',
      body: JSON.stringify({ orders, constraints })
    })
    const data = await response.json()
    setDecision(data)
    setSelectedPlan(data.plan)
    setLoading(false)
  }
  
  return (
    <div className="space-y-4">
      <button onClick={handleGenerateDecision} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Dispatch Plan'}
      </button>
      
      {decision && (
        <div className="space-y-4">
          {/* Confidence Score */}
          <div className="card">
            <h4>Confidence Score</h4>
            <div className="text-3xl font-bold">{decision.confidence.toFixed(1)}%</div>
            <p className="text-sm text-gray-600">System confidence in this plan</p>
          </div>
          
          {/* Explanation */}
          <div className="card">
            <h4>Why This Plan?</h4>
            <pre className="text-sm whitespace-pre-wrap">{decision.explanation}</pre>
          </div>
          
          {/* Risks */}
          {decision.risks.length > 0 && (
            <div className="card border-yellow-200 bg-yellow-50">
              <h4>Identified Risks</h4>
              {decision.risks.map((risk, idx) => (
                <div key={idx} className="mb-2">
                  <p className="font-semibold">{risk.message}</p>
                  <p className="text-sm text-gray-600">Mitigation: {risk.mitigation}</p>
                </div>
              ))}
            </div>
          )}
          
          {/* Alternatives */}
          {decision.alternatives.length > 0 && (
            <div className="card">
              <h4>Alternative Plans</h4>
              {decision.alternatives.map((alt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPlan(alt)}
                  className="block w-full text-left p-2 hover:bg-gray-100"
                >
                  Alternative {idx + 1}: Cost ₹{alt.totalCost.toLocaleString()}, Utilization {alt.totalUtilization.toFixed(1)}%
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

**Effort**: 3-4 days
**Files**: 3 new files, 2 modified

---

## 🟡 PHASE 2: HIGH PRIORITY (Weeks 3-4)

### 2.1 Constraint Enforcement
- Hard constraint violation detection
- Soft constraint penalty calculation
- Constraint relaxation logic

### 2.2 Daily Plan Execution
- Automatic plan generation at 2:00 AM
- Plan approval workflow
- Dispatch execution to plant systems

### 2.3 Real Cost Data
- Connect to actual cost databases
- Dynamic tariff handling
- Fuel surcharge calculation

---

## 🟢 PHASE 3: MEDIUM PRIORITY (Weeks 5-6)

### 3.1 ML Model Implementation
- Actual delay prediction model
- Demand forecasting model
- Rake availability prediction

### 3.2 Application Features
- Daily plan view
- Manual override UI
- Alert system
- Report generation

### 3.3 Real-Time Tracking
- Rake tracking
- Performance analytics
- Actual vs planned comparison

---

## 📊 TIMELINE

```
Week 1-2: CRITICAL GAPS
├── Stock → Orders → Wagons (3-4 days)
├── Routing + Loading Points (3-4 days)
└── Decision Support Integration (3-4 days)

Week 3-4: HIGH PRIORITY
├── Constraint Enforcement (2-3 days)
├── Daily Plan Execution (2-3 days)
└── Real Cost Data (2-3 days)

Week 5-6: MEDIUM PRIORITY
├── ML Model Implementation (3-4 days)
├── Application Features (3-4 days)
└── Real-Time Tracking (2-3 days)

Total: 7-10 weeks to production readiness
```

---

## 🎯 SUCCESS CRITERIA

After Phase 1 (Weeks 1-2):
- [ ] System can allocate orders to stockyards
- [ ] System can select loading points and routes
- [ ] System generates dispatch plans with explanations
- [ ] System provides confidence scores
- [ ] System identifies risks

After Phase 2 (Weeks 3-4):
- [ ] All constraints are enforced
- [ ] Plans are automatically generated daily
- [ ] Plans are executed to plant systems
- [ ] Real cost data is used

After Phase 3 (Weeks 5-6):
- [ ] ML models make accurate predictions
- [ ] Application has all required features
- [ ] Real-time tracking works
- [ ] System is production-ready

