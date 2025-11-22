# Judge Flow Guide for SAIL Bokaro Evaluation

## Quick Start (2 minutes)
1. **Access the System**
   - Open: [http://localhost:3000](http://localhost:3000) (or provided URL)
   - Use Judge credentials:
     - Username: `judge@example.com`
     - Password: `sailbokaro2025`

2. **Initial Dashboard**
   - View the main dashboard with KPIs
   - Check system status (should be green)
   - Note the "Last Updated" timestamp (should be < 1 min)

## Step-by-Step Evaluation (8 minutes)

### 1. Basic Functionality Test (2 min)
- **Action**: Click "Run Quick Demo"
- **Expected**:
  - Optimization completes in < 10 seconds
  - Results show 5-10 orders
  - Cost breakdown appears
  - No error messages

### 2. Data Inspection (1 min)
- **Action**: Click "View Orders"
- **Check**:
  - 10-15 sample orders
  - Different materials (HR Coils, Plates, etc.)
  - Multiple destinations
  - Priority levels assigned

### 3. Run Optimization (2 min)
- **Action**: 
  1. Click "New Optimization"
  2. Select all orders
  3. Click "Run"
- **Verify**:
  - Progress bar appears
  - Completion in < 15 seconds
  - Results panel updates

### 4. Results Analysis (2 min)
- **Check**:
  - Gantt chart shows schedule
  - Rake utilization > 75%
  - Cost breakdown makes sense
  - No overlapping allocations

### 5. Scenario Testing (1 min)
- **Action**: 
  1. Click "Scenarios"
  2. Select "Rake Shortage"
- **Verify**:
  - System suggests alternatives
  - Cost impact shown
  - Priority orders still met

## Expected Outputs

### Sample Optimization Result
```json
{
  "status": "optimal",
  "total_orders": 12,
  "total_tonnes": 4850,
  "rakes_used": 3,
  "trucks_used": 2,
  "total_cost": 1,28,75,000,
  "savings_vs_manual": "23%",
  "utilization": "82%"
}
```

### Performance Benchmarks
| Metric | Expected | Actual |
|--------|----------|--------|
| Optimization Time | < 15s | |
| Memory Usage | < 500MB | |
| Page Load | < 2s | |
| Data Refresh | < 1s | |

## Troubleshooting

### Common Issues
1. **Slow Performance**
   - Refresh the page
   - Check network status
   - Try with fewer orders

2. **Login Issues**
   - Clear browser cache
   - Try incognito mode
   - Use backup credentials:
     - User: `backup_judge@example.com`
     - Pass: `sail2025!`

3. **Data Not Loading**
   - Click "Reset Demo Data"
   - Check console for errors
   - Switch to offline mode

### Quick Fixes
- Press `Ctrl+Shift+R` to hard refresh
- Click "?" for help
- Use pre-loaded scenario: `DEMO_OPTIMAL`

## Evaluation Criteria

### Technical (40%)
- [ ] Optimization algorithm efficiency
- [ ] ML model accuracy
- [ ] System responsiveness
- [ ] Error handling

### Usability (30%)
- [ ] Intuitive interface
- [ ] Clear visualizations
- [ ] Helpful error messages
- [ ] Documentation quality

### Business Value (30%)
- [ ] Cost savings potential
- [ ] Operational efficiency
- [ ] Scalability
- [ ] Innovation factor

## Sample Questions for Team
1. How does the system handle real-time disruptions?
2. What's the maximum order volume supported?
3. How are the ML models trained and validated?
4. What security measures are in place?
5. How does this compare to existing solutions?

## Time Management
| Section | Time |
|---------|------|
| System Access | 0:00-0:30 |
| Basic Test | 0:30-2:30 |
| Data Review | 2:30-3:30 |
| Optimization | 3:30-5:30 |
| Scenario Test | 5:30-6:30 |
| Q&A | 6:30-8:00 |

## Notes Section


---
**Judging Guidelines**
- Focus on technical merit and innovation
- Consider practical applicability
- Evaluate completeness of solution
- Assess team's understanding
- Note any unique features

*End of Judge Flow Guide*
