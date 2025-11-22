# Modern UI - Quick Start Guide

## Installation & Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will be available at: `http://localhost:5173`

---

## Access the Modern Pages

### Dashboard
```
http://localhost:5173/dashboard
```
- View metrics and KPIs
- See demand forecasts
- Check rake utilization trends
- Review active rakes table

### Operations Hub
```
http://localhost:5173/operations-hub
```
- Interactive yard map
- Rake utilization scatter chart
- Empty rake turnaround analysis
- AI Decision Assistant chatbot

### Rake Planner
```
http://localhost:5173/rake-planner
```
- Optimization parameters
- Dispatch plan generation
- Before/after comparison
- Predicted rakes forecast

---

## Features Overview

### 1. Modern Layout
- Dark theme with cyan accents
- Collapsible sidebar
- Top navigation bar
- Responsive design

### 2. Metric Cards
- Large value display
- Trend indicators
- Icon support
- Hover effects

### 3. Charts
- Line charts (forecasts)
- Bar charts (comparisons)
- Scatter charts (analysis)
- Composed charts (multiple metrics)

### 4. Data Tables
- Sortable columns
- Hover effects
- Custom rendering
- Responsive layout

### 5. Interactive Elements
- Search bar
- Notifications
- User menu
- Chat interface

---

## Customization Guide

### Change Theme Colors

Edit `frontend/src/components/ModernLayout.jsx`:
```javascript
// Change sidebar color
className="bg-slate-900" // Change this
// to
className="bg-blue-900" // Your color
```

### Add New Menu Items

In `ModernLayout.jsx`, update the `menuItems` array:
```javascript
const menuItems = [
  { label: 'New Page', path: '/new-page', icon: '🆕' },
  // ... other items
]
```

### Update Mock Data

In each page (e.g., `ModernDashboard.jsx`):
```javascript
useEffect(() => {
  // Replace this mock data
  const mockData = { ... }
  
  // With API call
  // fetchDashboardData().then(data => setDashboardData(data))
}, [])
```

### Connect to Backend

Example for Dashboard:
```javascript
import axios from 'axios'

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/dashboard')
      setDashboardData(response.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }
  
  fetchData()
}, [])
```

---

## Component Usage Examples

### MetricCard
```javascript
<MetricCard
  title="Total Rakes"
  value="18"
  change={12}
  icon={Truck}
  trend="up"
/>
```

### ChartCard
```javascript
<ChartCard 
  title="Demand Forecast"
  subtitle="Predicted vs Historical"
  onDownload={() => downloadChart()}
>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      {/* chart components */}
    </LineChart>
  </ResponsiveContainer>
</ChartCard>
```

### DataTable
```javascript
<DataTable
  title="Active Rakes"
  columns={[
    { key: 'id', label: 'Rake ID', sortable: true },
    { key: 'cost', label: 'Cost', sortable: true },
  ]}
  data={rakeData}
  onRowClick={(row) => console.log(row)}
/>
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5173 | xargs kill -9
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Styling Issues
```bash
# Rebuild Tailwind CSS
npm run build
```

---

## Performance Tips

1. **Lazy Load Charts**: Use React.lazy() for heavy components
2. **Memoize Components**: Use React.memo() for expensive renders
3. **Optimize Images**: Compress and use WebP format
4. **Code Splitting**: Use React Router's lazy loading
5. **Debounce Search**: Add debounce to search input

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ModernLayout.jsx
│   │   ├── MetricCard.jsx
│   │   ├── ChartCard.jsx
│   │   └── DataTable.jsx
│   ├── pages/
│   │   ├── ModernDashboard.jsx
│   │   ├── OperationsHub.jsx
│   │   └── RakePlanner.jsx
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── tailwind.config.js
```

---

## API Integration Checklist

- [ ] Update backend endpoints in components
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success notifications
- [ ] Test with real data
- [ ] Optimize performance
- [ ] Add caching
- [ ] Handle edge cases

---

## Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Netlify
```bash
npm run build
# Then drag 'dist' folder to Netlify
```

---

## Support

For issues or questions:
1. Check the console for errors
2. Review the component props
3. Verify API endpoints
4. Check network tab in DevTools

---

## Next Steps

1. ✅ Modern UI created
2. ⏳ Connect to backend APIs
3. ⏳ Add real-time updates
4. ⏳ Implement authentication
5. ⏳ Add more features
6. ⏳ Deploy to production

---

**Version**: 1.0  
**Last Updated**: November 22, 2025  
**Status**: Ready for Development
