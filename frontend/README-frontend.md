# SAIL Bokaro Frontend
## React + Vite + TailwindCSS + Electron

**SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.10+ (for backend)
- Backend running on http://localhost:8000

### Web Development

```bash
cd frontend
npm install
npm run dev
```

Access at: http://localhost:5173

### Electron Development

```bash
cd frontend
npm install
npm run electron:dev
```

Backend starts automatically, Electron window opens.

### Production Build

**Web:**
```bash
npm run build
npm run preview
```

**Electron:**
```bash
npm run electron:build
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.js          # Axios instance
│   │   └── endpoints.js       # API endpoints
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Sidebar.jsx
│   │   │   └── Navbar.jsx
│   │   └── UI/
│   │       ├── MetricCard.jsx
│   │       ├── Spinner.jsx
│   │       └── Modal.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── OptimizePage.jsx
│   │   ├── OptimizeResult.jsx
│   │   ├── ForecastPage.jsx
│   │   ├── DelayPage.jsx
│   │   ├── ThroughputPage.jsx
│   │   ├── CostPage.jsx
│   │   ├── ModelsPage.jsx
│   │   └── AdminPage.jsx
│   ├── store/
│   │   ├── useAppStore.js
│   │   └── useOptimizeStore.js
│   ├── utils/
│   │   ├── constants.js
│   │   └── format.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js

electron/
├── main.js
├── preload.js
└── electron-builder.yml
```

---

## 🎨 Tech Stack

- **React 18** - UI framework
- **Vite 5** - Build tool
- **TailwindCSS 3** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **React Router v6** - Routing
- **Lucide Icons** - Icons
- **Framer Motion** - Animations
- **Electron 28** - Desktop app

---

## 📱 Pages

### Dashboard
- KPI cards (rakes, orders, trucks, success rate)
- System health status
- Recent optimizations

### Optimize (Main)
- Form to set optimization parameters
- Available rakes/trucks inputs
- Run Optimization button
- Redirects to results page

### Optimization Results
- Rake allocation table
- Truck allocation table
- Cost summary cards
- Export plan button (JSON)

### ML Predictions
- Forecast page (demand)
- Delay prediction
- Throughput prediction
- Cost analysis

### Admin
- Model reload button
- System metrics display
- Backend health status

---

## 🔌 API Integration

All API calls go through `src/api/client.js`:

```javascript
// Health check
GET /meta/health

// Optimization
POST /optimize/dispatch

// Predictions
POST /predict/demand
POST /predict/delay
POST /predict/throughput
POST /predict/cost
POST /predict/mode
POST /predict/rake-availability

// Admin
GET /meta/models
POST /meta/reload-models
GET /meta/metrics
```

---

## 🎯 State Management

Using Zustand:

```javascript
// App state
import { useAppStore } from './store/useAppStore'
const { theme, setTheme, isHealthy, setIsHealthy } = useAppStore()

// Optimization state
import { useOptimizeStore } from './store/useOptimizeStore'
const { result, setResult, isRunning, setIsRunning } = useOptimizeStore()
```

---

## 🔧 Configuration

### Environment Variables

Create `.env.local`:
```
VITE_API_URL=http://localhost:8000
VITE_DEMO_MODE=false
VITE_ADMIN_TOKEN=sail-bokaro-admin-token-secret
```

### Tailwind Customization

Edit `tailwind.config.js` for colors, fonts, spacing.

---

## 🖥️ Electron Integration

### Main Process
- Starts backend Python process
- Creates browser window
- Handles IPC communication

### Preload Script
- Secure bridge between renderer and main
- Exposes safe APIs

### Build
```bash
npm run electron:build
```

Creates installers for Windows, macOS, Linux.

---

## 📦 Dependencies

### Production
- react@18.2.0
- react-router-dom@6.20.0
- zustand@4.4.0
- axios@1.6.0
- lucide-react@0.294.0
- framer-motion@10.16.0

### Dev
- vite@5.0.0
- tailwindcss@3.3.0
- electron@28.0.0
- electron-builder@24.6.0

---

## 🚀 Deployment

### Web
```bash
npm run build
# Deploy dist/ folder to hosting
```

### Electron
```bash
npm run electron:build
# Installers in dist_electron/
```

---

## 🐛 Troubleshooting

### Backend not connecting
- Ensure backend is running on http://localhost:8000
- Check VITE_API_URL in .env.local
- Check browser console for errors

### Electron won't start
- Ensure backend is running
- Check electron logs in console
- Try `npm run electron:dev` for debug mode

### Styling issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Rebuild: `npm run build`

---

## 📚 Example Payloads

### Optimization Request
```json
{
  "orders": [
    {
      "order_id": "ORD001",
      "material_type": "HR_Coils",
      "quantity_tonnes": 1000,
      "destination": "Kolkata",
      "priority": "HIGH"
    }
  ],
  "available_rakes": 5,
  "available_trucks": 20,
  "inventory": {
    "HR_Coils": 5000
  }
}
```

### Optimization Response
```json
{
  "status": "success",
  "data": {
    "rakes": [
      {
        "rake_id": "RAKE_001",
        "destination": "Kolkata",
        "tonnes": 1000,
        "wagons": 58,
        "estimated_cost": 500000
      }
    ],
    "trucks": [],
    "summary": {
      "total_cost": 500000,
      "total_tonnage": 1000,
      "total_rakes": 1,
      "total_trucks": 0
    }
  }
}
```

---

## 📖 Component Guide

### MetricCard
```jsx
<MetricCard
  title="Active Rakes"
  value="12"
  unit="rakes"
  trend={5}
  icon={Zap}
  color="primary"
/>
```

### Spinner
```jsx
<Spinner size="md" text="Loading..." />
```

### Modal
```jsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
>
  Content here
</Modal>
```

---

**Ready for development!**

