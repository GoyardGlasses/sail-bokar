# 🎲 MONTE CARLO SIMULATION - QUICK START GUIDE

## ⚡ 5-Minute Setup

### Step 1: Access the Page
```
Navigate to: http://localhost:5173/monte-carlo-simulation
```

### Step 2: Run a Simulation
1. Set "Number of Scenarios" to 5,000 (for quick test)
2. Click "Run Simulation"
3. Wait 2-3 minutes for results

### Step 3: View Results
- **Overview Tab**: Key metrics
- **Distribution Tab**: Cost histogram
- **Risk Tab**: Risk breakdown
- **Sensitivity Tab**: Parameter impact
- **Recommendations Tab**: Action items

---

## 📊 Understanding Results

### Average Cost
- **What it means**: Expected cost across all scenarios
- **Example**: ₹450,000
- **Use**: Budget planning baseline

### Cost Range
- **What it means**: Best and worst case costs
- **Example**: ₹380,000 - ₹520,000
- **Use**: Understand variability

### 95% Confidence Interval
- **What it means**: 95% of scenarios fall within this range
- **Example**: ₹410,000 - ₹490,000
- **Use**: Conservative budgeting (use upper bound)

### Overall Risk
- **What it means**: Probability of something going wrong
- **Example**: 11.9%
- **Use**: Risk assessment
- **Interpretation**:
  - < 10%: Low risk ✅
  - 10-30%: Medium risk ⚠️
  - > 30%: High risk ❌

---

## 🎯 5 Common Use Cases

### 1️⃣ Budget Planning
```
Question: How much budget do I need?
Action: Run simulation → Get 95% CI
Result: Use upper bound (₹490k) as budget
Benefit: 95% confidence of not exceeding budget
```

### 2️⃣ Risk Assessment
```
Question: Is my plan risky?
Action: Check risk metrics
Result: Cost Risk 15%, Delay Risk 8%, Capacity Risk 12%
Benefit: Quantified risk understanding
```

### 3️⃣ Strategy Comparison
```
Question: Which strategy is better?
Action: Run simulation on both strategies
Result: Strategy B is ₹25k cheaper with 3.5% better utilization
Benefit: Data-driven decision making
```

### 4️⃣ What-If Analysis
```
Question: What if material availability drops 20%?
Action: Run sensitivity analysis
Result: Cost increases 8%, Utilization drops 5%
Benefit: Prepare contingency plans
```

### 5️⃣ Parameter Optimization
```
Question: Which parameter should I optimize first?
Action: Run sensitivity analysis on all parameters
Result: Material Availability has highest impact (elasticity 1.8)
Benefit: Focus optimization efforts effectively
```

---

## 🔧 Customization

### Change Number of Scenarios
```
Quick test:      1,000 scenarios  (30 seconds)
Standard:        5,000 scenarios  (2-3 minutes)
Recommended:    10,000 scenarios  (5-10 minutes)
Comprehensive:  50,000 scenarios  (30-60 minutes)
```

### Change Uncertainty Parameters
```
Default: ±15% material availability
Custom:  ±20% material availability (more uncertain)

Default: ±4 hours transport delay
Custom:  ±6 hours transport delay (more uncertain)
```

---

## 📈 Interpreting Metrics

### Cost Std Dev
- **Low (< 5%)**: Stable costs, predictable
- **Medium (5-10%)**: Normal variability
- **High (> 10%)**: Highly uncertain, needs controls

### SLA Compliance
- **> 95%**: Excellent
- **90-95%**: Good
- **85-90%**: Acceptable
- **< 85%**: Needs improvement

### Utilization
- **> 85%**: Excellent
- **75-85%**: Good
- **65-75%**: Acceptable
- **< 65%**: Needs improvement

---

## 💡 Pro Tips

### Tip 1: Start Small
```
First run: 5,000 scenarios (quick)
If uncertain: Run 10,000 scenarios (detailed)
If critical: Run 50,000 scenarios (comprehensive)
```

### Tip 2: Use Upper Bound for Budgeting
```
95% CI: ₹410k - ₹490k
Budget: ₹490k (upper bound)
Reason: 95% confidence of not exceeding
```

### Tip 3: Monitor Actual vs Predicted
```
Predicted: ₹450k
Actual: ₹460k
Variance: 2.2% (acceptable)
Action: Continue monitoring, adjust if > 10%
```

### Tip 4: Re-run Monthly
```
Week 1: Run initial simulation
Week 4: Run with new data
Compare: See if predictions are accurate
Adjust: Update uncertainty parameters if needed
```

### Tip 5: Use Sensitivity for Optimization
```
Run sensitivity analysis
Identify high-impact parameters
Focus optimization there
Expected improvement: 15-25% ROI
```

---

## 🚀 Common Workflows

### Workflow 1: Budget Planning
```
1. Run simulation with 10,000 scenarios
2. Get 95% confidence interval
3. Use upper bound as budget
4. Done! You have 95% confidence
```

### Workflow 2: Risk Assessment
```
1. Run simulation
2. Check risk metrics
3. If cost risk > 30%: Implement cost controls
4. If delay risk > 15%: Add buffer time
5. If capacity risk > 25%: Increase capacity
```

### Workflow 3: Strategy Comparison
```
1. Run simulation on Strategy A
2. Run simulation on Strategy B
3. Compare results
4. Choose better strategy
5. Quantify expected benefits
```

### Workflow 4: Parameter Optimization
```
1. Run sensitivity analysis on each parameter
2. Identify high-impact parameters
3. Focus optimization efforts there
4. Re-run simulation to verify improvement
5. Track ROI
```

---

## 📊 Sample Results

### Typical Output
```
Scenarios: 10,000
Success Rate: 95%

Average Cost: ₹450,000
Cost Range: ₹380,000 - ₹520,000
Std Dev: ₹35,000 (7.8%)

Average Utilization: 82.5%
Average SLA Compliance: 94.2%

Overall Risk: 11.9%
  - Cost Risk: 15.3%
  - Delay Risk: 8.5%
  - Capacity Risk: 12.1%

95% Confidence Intervals:
  - Cost: [₹410k, ₹490k]
  - Utilization: [75.2%, 89.8%]
  - SLA: [88.5%, 99.1%]
```

---

## ✅ Checklist Before Using

- [ ] Backend is running (`python -m uvicorn app.main:app --reload`)
- [ ] Frontend is running (`npm run dev`)
- [ ] Database is connected (if using real data)
- [ ] You have historical data for uncertainty parameters
- [ ] You understand your business constraints

---

## 🆘 Troubleshooting

### Simulation is too slow
**Solution**: Reduce scenarios from 10,000 to 5,000

### Results seem unrealistic
**Solution**: Check uncertainty parameters against historical data

### High variability in results
**Solution**: Increase scenarios or adjust parameters

### Memory issues
**Solution**: Run in batches or use fewer scenarios

### API not responding
**Solution**: Check backend is running on port 8000

---

## 📞 Need Help?

### Documentation
- Full guide: `MONTE_CARLO_SIMULATION_GUIDE.md`
- Implementation: `MONTE_CARLO_IMPLEMENTATION_SUMMARY.md`
- Code: `frontend/src/features/rakeFormation/monteCarloSimulation.ts`

### Examples
- 5 use cases in the page component
- Sample code in the guide
- Real-world scenarios in visualization

---

## 🎓 Learning Path

### Beginner (15 minutes)
1. Read this quick start guide
2. Run a simulation with 5,000 scenarios
3. View results in Overview tab
4. Understand key metrics

### Intermediate (1 hour)
1. Read the full guide
2. Run simulations with 10,000 scenarios
3. Explore all 5 tabs
4. Try sensitivity analysis

### Advanced (2+ hours)
1. Study the code
2. Customize uncertainty parameters
3. Compare multiple strategies
4. Integrate with your workflows

---

**Status**: ✅ Ready to Use
**Time to First Result**: 5-10 minutes
**Difficulty**: Beginner-friendly
**Support**: Full documentation included

