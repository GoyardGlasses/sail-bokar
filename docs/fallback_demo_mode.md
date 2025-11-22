# Offline Demo Mode Guide

## Activation
1. **Automatic Fallback**
   - System detects no internet after 5 seconds
   - Switches to offline mode automatically
   - Notification appears: "Offline Mode: Using cached data"

2. **Manual Activation**
   ```bash
   # In browser console
   localStorage.setItem('forceOffline', 'true');
   location.reload();
   ```

## Features Available Offline

### Core Functionality
- View pre-loaded dashboard
- Run optimizations with sample data
- View historical results
- Access help documentation

### Data Sources
1. **Pre-loaded Scenarios**
   - `scenario_optimal.json` (default)
   - `scenario_shortage.json`
   - `scenario_peak.json`

2. **Cached Data**
   - Last successful API response
   - Recent optimizations
   - User preferences

## Step-by-Step Demo Flow

### 1. Start in Offline Mode
```bash
# Start local server with offline flag
python -m http.server 3000 --bind 127.0.0.1
```

### 2. Access Application
- Open: `http://localhost:3000`
- Bypass login with: `?demo=true`

### 3. Load Sample Data
```javascript
// In console
localStorage.setItem('demoData', JSON.stringify(offlineData.basic));
```

### 4. Run Optimization
- Uses pre-computed results
- Simulates 2-3 second delay
- Returns cached optimal solution

## Data Files

### Sample Data Structure
```json
{
  "orders": [
    {
      "id": "ORD-1001",
      "material": "HR Coils",
      "quantity": 500,
      "destination": "Kolkata",
      "priority": "High",
      "deadline": "2025-11-23T18:00:00"
    }
  ],
  "results": {
    "status": "optimal",
    "totalCost": 1250000,
    "rakesUsed": 2,
    "utilization": "78%"
  }
}
```

### File Locations
- `./public/data/scenarios/` - Sample scenarios
- `./src/assets/offline/` - Static assets
- `./src/serviceWorker.js` - Offline caching logic

## Troubleshooting

### Common Issues
1. **Data Not Loading**
   ```javascript
   // Clear and reload
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

2. **Stale Cache**
   - Press `Ctrl+Shift+Delete`
   - Check "Cached images and files"
   - Click "Clear data"

3. **Service Worker Issues**
   ```javascript
   // Unregister service workers
   navigator.serviceWorker.getRegistrations().then(regs => {
     regs.forEach(reg => reg.unregister());
   });
   ```

## Development Notes

### Updating Offline Data
1. Export current state:
   ```javascript
   const data = {
     timestamp: new Date().toISOString(),
     state: store.getState()
   };
   localStorage.setItem('offlineBackup', JSON.stringify(data));
   ```

2. Import to another machine:
   ```javascript
   const backup = localStorage.getItem('offlineBackup');
   // Copy backup string to target machine
   const data = JSON.parse(backup);
   store.dispatch({type: 'RESTORE_STATE', payload: data.state});
   ```

### Testing Offline Mode
1. Chrome DevTools:
   - Open DevTools (F12)
   - Go to "Network" tab
   - Check "Offline" checkbox

2. Programmatic:
   ```javascript
   // Force offline mode
   Object.defineProperty(navigator, 'onLine', {
     get: () => false,
   });
   window.dispatchEvent(new Event('offline'));
   ```

## Recovery Steps

### Restore Online Mode
1. Automatic:
   - System checks connectivity every 30 seconds
   - Auto-switches when connection is restored

2. Manual Override:
   ```javascript
   localStorage.removeItem('forceOffline');
   window.location.reload(true);
   ```

### Data Sync
1. On reconnection:
   - System shows "Reconnecting..."
   - Queued actions sync automatically
   - Conflicts resolved by timestamp

2. Manual Sync:
   ```javascript
   // In console
   if (navigator.onLine) {
     store.dispatch(syncPendingActions());
   }
   ```

## Limitations
- Real-time updates disabled
- No live collaboration
- Delayed notifications
- Reduced analytics

*Last Updated: 2025-11-22*
