# 🚀 QUICK START - PHASE 1 (Stock → Routing → Decision)

## 5-Minute Setup

### 1. Start Backend
```bash
cd backend
python -m uvicorn app.main:app --reload
```

Expected output:
```
✓ Decision Support router registered
✓ API running on http://localhost:8000
✓ Docs available at http://localhost:8000/api/docs
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

Expected output:
```
✓ Frontend running on http://localhost:5173
✓ Ready to accept requests
```

### 3. Test Decision Support API
```bash
curl -X POST http://localhost:8000/api/decision-support/generate-decision \
  -H "Content-Type: application/json" \
  -d '{
    "orders": [
      {
        "orderId": "O1",
        "materialId": "coal-001",
        "materialName": "Coal",
        "quantity": 100,
        "destination": {"lat": 23.5, "lng": 85.3},
        "requiredDate": "2024-12-03",
        "priority": "high",
        "requiredQuality": "A",
        "cost": 50000
      }
    ],
    "stockyards": [
      {
        "stockyardId": "SY1",
        "name": "Bokaro",
        "location": "Bokaro",
        "coordinates": {"lat": 23.8, "lng": 85.2},
        "materials": [
          {
            "materialId": "coal-001",
            "materialName": "Coal",
            "quantity": 500,
            "reserved": 0,
            "quality": "A",
            "age": 2
          }
        ],
        "capacity": 1000,
        "currentLoad": 0
      }
    ],
    "loadingPoints": [
      {
        "pointId": "LP1",
        "stockyardId": "SY1",
        "name": "Loading Point 1",
        "capacity": 200,
        "currentLoad": 0,
        "equipment": ["conveyor", "loader"],
        "operationalHours": {"start": "06:00", "end": "22:00"},
        "throughput": 100
      }
    ],
    "routes": [
      {
        "routeId": "R1",
        "fromLocation": "SY1",
        "toLocation": "Destination",
        "distance": 100,
        "estimatedTime": 24,
        "cost": 500,
        "congestionLevel": 20,
        "sidingCapacity": 90,
        "restrictions": []
      }
    ],
    "constraints": {
      "minRakeSize": 55,
      "maxRakeSize": 90,
      "minOrderQty": 10,
      "maxOrderQty": 5000,
      "maxDistance": 1000,
      "minFeasibility": 50
    },
    "objectives": {
      "priority": "cost"
    }
  }'
```

Expected response:
```json
{
  "planId": "PLAN-1733145600000",
  "rakes": [
    {
      "rakeId": "RAKE-1733145600000-0",
      "loadingPointId": "LP1",
      "routeId": "R1",
      "sourceStockyard": "Bokaro",
      "destination": "Destination",
      "composition": [...],
      "totalLoad": 100,
      "utilization": 111.1,
      "cost": 50500,
      "estimatedDeliveryTime": "2024-12-04T...",
      "slaCompliance": true
    }
  ],
  "totalCost": 50500,
  "totalLoad": 100,
  "totalUtilization": 111.1,
  "slaCompliance": 100.0,
  "feasibility": 100.0,
  "confidence": 85.0,
  "explanation": "📋 DISPATCH PLAN SUMMARY...",
  "risks": [],
  "recommendations": [...]
}
```

---

## Using in React Component

### Basic Usage
```jsx
import IntegratedDecisionPanel from '@/features/rakeFormation/components/IntegratedDecisionPanel'

export default function MyPage() {
  const orders = [
    {
      orderId: 'O1',
      materialId: 'coal-001',
      materialName: 'Coal',
      quantity: 100,
      destination: { lat: 23.5, lng: 85.3 },
      requiredDate: '2024-12-03',
      priority: 'high',
      requiredQuality: 'A',
      cost: 50000
    }
  ]

  const stockyards = [
    {
      stockyardId: 'SY1',
      name: 'Bokaro',
      location: 'Bokaro',
      coordinates: { lat: 23.8, lng: 85.2 },
      materials: [
        {
          materialId: 'coal-001',
          materialName: 'Coal',
          quantity: 500,
          reserved: 0,
          quality: 'A',
          age: 2
        }
      ],
      capacity: 1000,
      currentLoad: 0
    }
  ]

  const loadingPoints = [
    {
      pointId: 'LP1',
      stockyardId: 'SY1',
      name: 'Loading Point 1',
      capacity: 200,
      currentLoad: 0,
      equipment: ['conveyor', 'loader'],
      operationalHours: { start: '06:00', end: '22:00' },
      throughput: 100
    }
  ]

  const routes = [
    {
      routeId: 'R1',
      fromLocation: 'SY1',
      toLocation: 'Destination',
      distance: 100,
      estimatedTime: 24,
      cost: 500,
      congestionLevel: 20,
      sidingCapacity: 90,
      restrictions: []
    }
  ]

  const constraints = {
    minRakeSize: 55,
    maxRakeSize: 90,
    minOrderQty: 10,
    maxOrderQty: 5000,
    maxDistance: 1000,
    minFeasibility: 50
  }

  const objectives = {
    priority: 'cost'
  }

  return (
    <IntegratedDecisionPanel
      orders={orders}
      stockyards={stockyards}
      loadingPoints={loadingPoints}
      routes={routes}
      constraints={constraints}
      objectives={objectives}
    />
  )
}
```

---

## Using Programmatically

### Stock Allocation
```typescript
import { allocateStockToOrders } from '@/features/rakeFormation/stockAllocation'

const result = allocateStockToOrders(orders, stockyards, constraints)

console.log('Allocations:', result.allocations)
console.log('Total Cost:', result.totalCost)
console.log('Average Feasibility:', result.averageFeasibility)
console.log('Unallocated Orders:', result.unallocatedOrders)
console.log('Warnings:', result.warnings)
```

### Routing Optimization
```typescript
import { optimizeRouting } from '@/features/rakeFormation/routeOptimization'

const result = optimizeRouting(allocations, loadingPoints, routes, constraints)

console.log('Routing Decisions:', result.decisions)
console.log('Total Cost:', result.totalCost)
console.log('Average Feasibility:', result.averageFeasibility)
console.log('Unrouted Orders:', result.unroutedOrders)
```

### Decision Generation
```typescript
import { generateDecision } from '@/features/rakeFormation/decisionSupport'

const decision = await generateDecision({
  orders,
  stockyards,
  loadingPoints,
  routes,
  constraints,
  objectives
})

console.log('Plan ID:', decision.plan.planId)
console.log('Confidence:', decision.confidence)
console.log('Explanation:', decision.explanation)
console.log('Risks:', decision.risks)
console.log('Recommendations:', decision.recommendations)
console.log('Alternatives:', decision.alternatives)
```

### Constraint Validation
```typescript
import { validatePlan } from '@/features/rakeFormation/constraintEnforcement'

const validation = validatePlan(decision.plan.rakes, constraints)

console.log('Is Valid:', validation.isValid)
console.log('Hard Violations:', validation.hardViolations)
console.log('Soft Violations:', validation.softViolations)
console.log('Total Penalty:', validation.totalPenalty)
console.log('Feasibility Score:', validation.feasibilityScore)
```

### Daily Plan Execution
```typescript
import { generateDailyPlan, submitPlanForApproval, approvePlan } from '@/features/rakeFormation/dailyPlanExecution'

// Generate plan
const plan = await generateDailyPlan(
  orders, stockyards, loadingPoints, routes,
  constraints, objectives
)

// Submit for approval
const pendingPlan = submitPlanForApproval(plan)

// Approve plan
const approvedPlan = approvePlan(pendingPlan, 'admin@company.com')

// Start execution
const executingPlan = startPlanExecution(approvedPlan)
```

---

## Common Scenarios

### Scenario 1: Generate Dispatch Plan for Today
```typescript
const today = new Date().toISOString().split('T')[0]

const plan = await generateDailyPlan(
  orders.filter(o => o.requiredDate === today),
  stockyards,
  loadingPoints,
  routes,
  constraints,
  objectives
)

console.log(`Generated plan with ${plan.rakes.length} rakes`)
console.log(`Total cost: ₹${plan.totalCost}`)
console.log(`Total utilization: ${plan.totalUtilization}%`)
```

### Scenario 2: Find Best Stockyard for Order
```typescript
import { allocateStockToOrders } from '@/features/rakeFormation/stockAllocation'

const result = allocateStockToOrders([order], stockyards, constraints)
const allocation = result.allocations[0]

console.log(`Order ${order.orderId}`)
console.log(`Best Stockyard: ${allocation.stockyardName}`)
console.log(`Distance: ${allocation.distance}km`)
console.log(`Cost: ₹${allocation.cost}`)
console.log(`Feasibility: ${allocation.feasibility}%`)
```

### Scenario 3: Check Constraint Violations
```typescript
import { validatePlan, suggestConstraintRelaxation } from '@/features/rakeFormation/constraintEnforcement'

const validation = validatePlan(rakes, constraints)

if (!validation.isValid) {
  console.log('Hard Violations:')
  for (const v of validation.hardViolations) {
    console.log(`  - ${v.message}`)
    console.log(`    Fix: ${v.fixSuggestion}`)
  }

  // Get relaxation suggestions
  const suggestions = suggestConstraintRelaxation(validation.hardViolations)
  console.log('Suggested Relaxations:')
  for (const s of suggestions) {
    console.log(`  - ${s.constraint}: ${s.impact}`)
  }
}
```

### Scenario 4: Compare Alternative Plans
```typescript
const decision = await generateDecision(context)

console.log('Main Plan:')
console.log(`  Cost: ₹${decision.plan.totalCost}`)
console.log(`  Utilization: ${decision.plan.totalUtilization}%`)

console.log('Alternative Plans:')
for (const alt of decision.alternatives) {
  console.log(`  ${alt.name}:`)
  console.log(`    Cost: ₹${alt.totalCost}`)
  console.log(`    Utilization: ${alt.avgUtilization}%`)
}
```

---

## Debugging

### Enable Logging
```typescript
// In your component
const handleGenerateDecision = async () => {
  console.log('📊 Generating decision...')
  console.log('Orders:', orders)
  console.log('Stockyards:', stockyards)
  console.log('Loading Points:', loadingPoints)
  console.log('Routes:', routes)

  try {
    const decision = await generateDecision(context)
    console.log('✅ Decision generated:', decision)
  } catch (error) {
    console.error('❌ Error:', error)
  }
}
```

### Check API Response
```bash
# Check if API is running
curl http://localhost:8000/api/decision-support/health

# Check service status
curl http://localhost:8000/api/decision-support/status

# Check API docs
open http://localhost:8000/api/docs
```

### Validate Data
```typescript
// Check if orders have required fields
orders.forEach(o => {
  if (!o.orderId || !o.materialId || !o.quantity) {
    console.error('Invalid order:', o)
  }
})

// Check if stockyards have materials
stockyards.forEach(sy => {
  if (!sy.materials || sy.materials.length === 0) {
    console.warn('Stockyard has no materials:', sy.name)
  }
})
```

---

## Performance Tips

1. **Batch Operations**: Process multiple orders together instead of one at a time
2. **Cache Results**: Store allocation results to avoid recalculation
3. **Limit Constraints**: Use only necessary constraints to speed up validation
4. **Pagination**: For large datasets, process in batches of 100-200 orders

---

## Next Steps

1. ✅ Test the system with sample data
2. ✅ Integrate with your database
3. ✅ Add real cost data
4. ✅ Implement ML models (Phase 2)
5. ✅ Add application features (Phase 3)

---

## Support

For issues or questions:
1. Check `PHASE_1_COMPLETION_GUIDE.md` for detailed documentation
2. Review API docs at `http://localhost:8000/api/docs`
3. Check console logs for error messages
4. Verify data format matches expected schema

