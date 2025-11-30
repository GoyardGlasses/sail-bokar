# 🚀 **PHASE 2 ACTION PLAN - INVENTORY & ORDERS**

**Status:** READY TO START
**Pages:** 4
**Estimated Time:** 2 hours
**Pattern:** Reuse Phase 1 template

---

## **QUICK REFERENCE - REUSABLE TEMPLATE**

```javascript
// 1. ADD IMPORTS
import { [Icons] } from 'lucide-react'
import { [Charts] } from 'recharts'

// 2. ADD STATE
const [activeTab, setActiveTab] = useState('table')

// 3. CREATE VISUALIZATION DATA
const analysis1Data = useMemo(() => { /* aggregation logic */ }, [data])
const analysis2Data = useMemo(() => { /* aggregation logic */ }, [data])
const analysis3Data = useMemo(() => { /* aggregation logic */ }, [data])

// 4. ADD TABS
<div className="flex gap-2 border-b border-slate-300 mb-6">
  {[
    { id: 'table', label: 'Records', icon: BarChart3 },
    { id: 'analysis1', label: 'Analysis 1', icon: LineChartIcon },
    { id: 'analysis2', label: 'Analysis 2', icon: PieChartIcon },
    { id: 'analysis3', label: 'Analysis 3', icon: TrendingUp },
  ].map(tab => { /* tab button logic */ })}
</div>

// 5. CONDITIONAL RENDERING
{activeTab === 'table' && <OriginalTable />}
{activeTab === 'analysis1' && <Chart1 />}
{activeTab === 'analysis2' && <Chart2 />}
{activeTab === 'analysis3' && <Chart3 />}
```

---

## **PAGE 1: InventoryPage.jsx**

**Current State:** Static inventory table
**Enhancement:** 4 tabs with inventory analytics

### **Tab Structure:**
1. **Inventory Table** - Original table with filters
2. **Stock Levels Heatmap** - Material stock visualization
3. **Reorder Recommendations** - AI-suggested reorders
4. **Material Turnover** - Inventory rotation analysis

### **Data Functions to Create:**
```javascript
// Stock levels by material
const stockLevelData = useMemo(() => {
  const materials = {}
  inventoryData.forEach(item => {
    if (!materials[item.material]) {
      materials[item.material] = { material: item.material, stock: 0, minLevel: 0, maxLevel: 0 }
    }
    materials[item.material].stock += item.quantity
  })
  return Object.values(materials)
}, [inventoryData])

// Reorder recommendations
const reorderData = useMemo(() => {
  return inventoryData.filter(item => item.quantity < item.minLevel)
    .map(item => ({
      ...item,
      urgency: item.minLevel - item.quantity,
      recommendedQty: item.maxLevel - item.quantity
    }))
}, [inventoryData])

// Material turnover
const turnoverData = useMemo(() => {
  // Calculate turnover rate = consumed / average stock
  return inventoryData.map(item => ({
    material: item.material,
    turnover: (item.consumed / item.avgStock).toFixed(2),
    days: (30 / (item.consumed / item.avgStock)).toFixed(1)
  }))
}, [inventoryData])
```

### **Visualizations:**
- BarChart: Stock levels by material
- BarChart: Reorder recommendations (urgency)
- BarChart: Material turnover rates
- Cards: Detailed reorder info

---

## **PAGE 2: Orders.jsx**

**Current State:** Static orders table
**Enhancement:** 4 tabs with order analytics

### **Tab Structure:**
1. **Orders Table** - Original table with filters
2. **Order Pipeline** - Status distribution visualization
3. **Fulfillment Tracking** - Delivery performance
4. **Customer Patterns** - Order trends by customer

### **Data Functions to Create:**
```javascript
// Order pipeline
const pipelineData = useMemo(() => {
  const statuses = {}
  ordersData.forEach(order => {
    statuses[order.status] = (statuses[order.status] || 0) + 1
  })
  return Object.entries(statuses).map(([status, count]) => ({ status, count }))
}, [ordersData])

// Fulfillment tracking
const fulfillmentData = useMemo(() => {
  return ordersData.map(order => ({
    orderId: order.id,
    onTime: order.deliveryDate <= order.dueDate,
    daysLate: Math.max(0, order.deliveryDate - order.dueDate),
    fulfillmentRate: ((order.deliveredQty / order.orderedQty) * 100).toFixed(1)
  }))
}, [ordersData])

// Customer patterns
const customerData = useMemo(() => {
  const customers = {}
  ordersData.forEach(order => {
    if (!customers[order.customerId]) {
      customers[order.customerId] = { customerId: order.customerId, count: 0, totalValue: 0 }
    }
    customers[order.customerId].count++
    customers[order.customerId].totalValue += order.value
  })
  return Object.values(customers).sort((a, b) => b.count - a.count)
}, [ordersData])
```

### **Visualizations:**
- PieChart: Order status distribution
- BarChart: Fulfillment on-time rate
- BarChart: Customer order frequency
- Cards: Detailed order metrics

---

## **PAGE 3: RakePlanner.jsx**

**Current State:** Static rake formation table
**Enhancement:** 4 tabs with optimization analytics

### **Tab Structure:**
1. **Rake Formation Table** - Original table
2. **Optimization Suggestions** - AI recommendations
3. **Capacity Utilization** - Rake efficiency
4. **Cost-Benefit Analysis** - Financial impact

### **Data Functions to Create:**
```javascript
// Optimization suggestions
const optimizationData = useMemo(() => {
  return rakeData.map(rake => ({
    rakeId: rake.id,
    currentUtilization: (rake.loadedWagons / rake.totalWagons) * 100,
    potentialSavings: rake.costPerWagon * (rake.totalWagons - rake.loadedWagons),
    suggestion: rake.loadedWagons < rake.totalWagons * 0.7 ? 'Consolidate' : 'Dispatch'
  }))
}, [rakeData])

// Capacity utilization
const utilizationData = useMemo(() => {
  const grouped = {}
  rakeData.forEach(rake => {
    const utilization = Math.round((rake.loadedWagons / rake.totalWagons) * 100 / 10) * 10
    grouped[utilization] = (grouped[utilization] || 0) + 1
  })
  return Object.entries(grouped).map(([util, count]) => ({ utilization: util + '%', count }))
}, [rakeData])

// Cost-benefit
const costBenefitData = useMemo(() => {
  return rakeData.map(rake => ({
    rakeId: rake.id,
    totalCost: rake.costPerWagon * rake.totalWagons,
    revenueGenerated: rake.loadedWagons * rake.revenuePerWagon,
    profit: (rake.loadedWagons * rake.revenuePerWagon) - (rake.costPerWagon * rake.totalWagons)
  }))
}, [rakeData])
```

### **Visualizations:**
- BarChart: Optimization suggestions
- BarChart: Capacity utilization distribution
- BarChart: Cost vs revenue by rake
- Cards: Detailed rake metrics

---

## **PAGE 4: ThroughputPage.jsx**

**Current State:** Static throughput table
**Enhancement:** 4 tabs with capacity analytics

### **Tab Structure:**
1. **Throughput Table** - Original table
2. **Capacity Monitoring** - Real-time capacity
3. **Bottleneck Identification** - Constraint analysis
4. **Performance Trends** - Historical analysis

### **Data Functions to Create:**
```javascript
// Capacity monitoring
const capacityData = useMemo(() => {
  return throughputData.map(item => ({
    station: item.station,
    currentCapacity: item.currentThroughput,
    maxCapacity: item.maxThroughput,
    utilizationRate: (item.currentThroughput / item.maxThroughput * 100).toFixed(1),
    available: item.maxThroughput - item.currentThroughput
  }))
}, [throughputData])

// Bottleneck identification
const bottleneckData = useMemo(() => {
  return throughputData
    .filter(item => (item.currentThroughput / item.maxThroughput) > 0.8)
    .map(item => ({
      station: item.station,
      utilizationRate: (item.currentThroughput / item.maxThroughput * 100).toFixed(1),
      severity: (item.currentThroughput / item.maxThroughput) > 0.95 ? 'Critical' : 'High'
    }))
}, [throughputData])

// Performance trends
const trendData = useMemo(() => {
  return throughputData.map(item => ({
    station: item.station,
    avgThroughput: item.avgThroughput,
    peakThroughput: item.peakThroughput,
    efficiency: (item.avgThroughput / item.peakThroughput * 100).toFixed(1)
  }))
}, [throughputData])
```

### **Visualizations:**
- BarChart: Capacity utilization by station
- BarChart: Bottleneck severity
- BarChart: Performance trends
- Cards: Detailed capacity metrics

---

## **IMPLEMENTATION CHECKLIST**

### **For Each Page:**
- [ ] Read current page structure
- [ ] Add imports (icons + charts)
- [ ] Add activeTab state
- [ ] Create 3 visualization data functions
- [ ] Add tab navigation (4 tabs)
- [ ] Wrap table in {activeTab === 'table'}
- [ ] Add Tab 2 visualization
- [ ] Add Tab 3 visualization
- [ ] Add Tab 4 visualization
- [ ] Test all tabs
- [ ] Commit with clear message

---

## **ESTIMATED TIME PER PAGE**

| Page | Time |
|------|------|
| InventoryPage | 30 mins |
| Orders | 30 mins |
| RakePlanner | 30 mins |
| ThroughputPage | 30 mins |
| **TOTAL** | **2 hours** |

---

## **COMMIT MESSAGES**

```bash
# After InventoryPage
git commit -m "Phase 2.1: Enhance InventoryPage with 4 tabs - Records, Stock Levels, Reorder Recommendations, Material Turnover"

# After Orders
git commit -m "Phase 2.2: Enhance Orders with 4 tabs - Records, Pipeline, Fulfillment, Customer Patterns"

# After RakePlanner
git commit -m "Phase 2.3: Enhance RakePlanner with 4 tabs - Formation, Optimization, Capacity, Cost-Benefit"

# After ThroughputPage
git commit -m "Phase 2.4: Enhance ThroughputPage with 4 tabs - Records, Capacity, Bottlenecks, Trends"

# Final
git commit -m "Phase 2 COMPLETE: All 4 inventory & orders pages enhanced with 16 tabs and 12 visualizations"
```

---

## **NEXT AFTER PHASE 2**

Once Phase 2 is complete:
- Phase 3: Quality & Supplier (6 pages, 3 hours)
- Phase 4: Optimization (3 pages, 1.5 hours)
- Phase 5: Utility (6 pages, 2.5 hours)

**Total Remaining:** 7 hours

---

## **READY TO START!**

Pattern is proven. Template is ready. Let's accelerate! 🚀
