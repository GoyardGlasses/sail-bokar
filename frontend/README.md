# SAIL Bokaro Frontend
## React + Tailwind + Electron Desktop Application

**SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.10+ (for backend)
- Backend running on http://localhost:8000

### Development

#### Web Development
```bash
cd frontend
npm install
npm run dev
```

Access at: http://localhost:5173

#### Electron Development
```bash
cd frontend
npm install
npm run electron-dev
```

### Production Build

#### Web Build
```bash
npm run build
npm run preview
```

#### Electron Build
```bash
npm run electron-build
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar/
│   │   │   └── Sidebar.jsx
│   │   ├── Navbar/
│   │   │   └── Navbar.jsx
│   │   ├── Cards/
│   │   │   └── KPICard.jsx
│   │   ├── Tables/
│   │   ├── Charts/
│   │   └── Loader/
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Orders/
│   │   ├── Inventory/
│   │   ├── RakePlanner/
│   │   ├── OptimizeResult/
│   │   ├── MLModels/
│   │   └── Admin/
│   ├── api/
│   │   ├── client.js
│   │   └── endpoints.js
│   ├── store/
│   │   ├── useOrdersStore.js
│   │   ├── useInventoryStore.js
│   │   └── useOptimizeStore.js
│   ├── utils/
│   │   ├── format.js
│   │   ├── constants.js
│   │   └── validation.js
│   ├── styles/
│   │   └── globals.css
│   ├── App.jsx
│   └── main.jsx
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
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **React Router v6** - Routing
- **Lucide Icons** - Icons
- **Recharts** - Charts
- **Framer Motion** - Animations
- **Electron** - Desktop app

---

## 📱 Pages

### Dashboard
- KPI cards (rakes, orders, trucks, success rate)
- Recent optimizations
- System health status

### Orders
- Order list with search & filter
- Sortable table
- Add new order
- Order status tracking

### Inventory
- Stock level heatmap
- Material inventory tracking
- Safety stock warnings

### Rake Planner
- Form to set optimization parameters
- Select orders
- Set available rakes/trucks
- Trigger optimization

### Optimization Results
- Rake allocation display
- Truck allocation display
- Cost breakdown
- KPI summary

### ML Models
- Model status display
- Load status indicators
- Version information

### Admin
- Model reload
- System metrics
- Backend health
- Logs viewer

---

## 🔌 API Integration

All API calls go through `src/api/client.js` which handles:
- Base URL configuration
- Request/response interceptors
- Error handling
- Authentication

### Endpoints Used
- `GET /meta/health` - Health check
- `GET /meta/metrics` - System metrics
- `POST /optimize/dispatch` - Optimization
- `POST /predict/*` - ML predictions
- `POST /meta/reload-models` - Admin

---

## 🎯 State Management

Using Zustand for lightweight state:
- `useOrdersStore` - Orders state
- `useInventoryStore` - Inventory state
- `useOptimizeStore` - Optimization results

---

## 🖥️ Electron Integration

### Main Process (`electron/main.js`)
- Starts backend Python process
- Creates browser window
- Handles IPC communication

### Preload Script (`electron/preload.js`)
- Secure bridge between renderer and main
- Exposes safe APIs

### Build
```bash
npm run electron-build
```

Creates installers for Windows, macOS, Linux

---

## 🔧 Configuration

### Environment Variables
Create `.env.local`:
```
VITE_API_URL=http://localhost:8000
```

### Tailwind Customization
Edit `tailwind.config.js` for colors, fonts, spacing

---

## 📦 Dependencies

### Production
- react@18.2.0
- react-router-dom@6.20.0
- zustand@4.4.0
- axios@1.6.0
- recharts@2.10.0
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
npm run electron-build
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
- Try `npm run electron-dev` for debug mode

### Styling issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Rebuild Tailwind: `npm run build`

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [TailwindCSS Docs](https://tailwindcss.com)
- [Electron Docs](https://www.electronjs.org/docs)

---

**Ready for development!**

