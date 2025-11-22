# SAIL Bokaro - 5-Minute Demo Script

**For SIH25208 Judges**

---

## ⏱️ Timeline

- **0:00-0:30** - Launch & Backend Check
- **0:30-1:30** - Dashboard Overview
- **1:30-3:30** - Run Optimization
- **3:30-4:30** - View Results & Export
- **4:30-5:00** - Admin Panel & Wrap-up

---

## 🎬 Demo Steps

### Step 1: Launch Application (0:00-0:30)

**What to do:**

1. **Launch the app**
   - Windows: Click "SAIL Bokaro Optimizer" from Start Menu
   - macOS: Open Applications → SAIL Bokaro Optimizer
   - Linux: Run `./SAIL-Bokaro-Optimizer-1.0.0.AppImage`

2. **Wait for startup** (10-15 seconds)
   - Observe Electron window opening
   - Backend process starting in background
   - React frontend loading

3. **Verify backend connection**
   - Look at top navbar
   - Should show "Backend Connected" with green indicator
   - If red, click "Restart Backend" in Admin panel

**What to say:**

> "The application is a desktop app built with Electron, which wraps a React frontend and FastAPI backend. The backend starts automatically when you launch the app, and you can see the connection status in the top navbar."

---

### Step 2: Dashboard Overview (0:30-1:30)

**What to do:**

1. **Observe the dashboard**
   - 4 KPI cards visible
   - Sidebar navigation on left
   - Top navbar with health indicator

2. **Point out key metrics:**
   - **Available Rakes:** 12 (with +5% trend)
   - **Pending Orders:** 24 (with -2% trend)
   - **Trucks Available:** 18 (neutral trend)
   - **Optimization Success:** 95.2% (with +3% trend)

3. **Scroll down** to see:
   - Recent Optimizations section
   - System Health status
   - Uptime information

**What to say:**

> "The dashboard gives you a real-time overview of the system. You can see the number of available rakes and trucks, pending orders, and the success rate of our optimization engine. The system is currently healthy with good uptime."

---

### Step 3: Run Optimization (1:30-3:30)

**What to do:**

1. **Click "Optimize" in sidebar**
   - Navigate to the Optimize page
   - Form loads with input fields

2. **Set parameters:**
   - Available Rakes: `5`
   - Available Trucks: `20`
   - (Leave other fields as default)

3. **Click "Run Optimization"**
   - Observe loading spinner
   - "Running..." message appears
   - Backend processing the request

4. **Wait for completion** (30-60 seconds)
   - Optimization solves the dispatch problem
   - ML models predict delays and costs
   - Results are calculated

**What to say:**

> "Now let's run the optimization engine. I'm setting 5 available rakes and 20 trucks. When we click 'Run Optimization', the system will:
> 1. Load pending orders from the database
> 2. Run the optimization algorithm
> 3. Use ML models to predict delays and costs
> 4. Generate an optimal dispatch plan
> 
> This typically takes 30-60 seconds depending on the problem size."

---

### Step 4: View Results & Export (3:30-4:30)

**What to do:**

1. **Results page loads automatically**
   - Summary cards appear
   - Rake allocation table visible
   - Truck allocation table visible

2. **Point out summary metrics:**
   - **Total Rakes:** 1
   - **Total Trucks:** 0
   - **Total Cost:** ₹500,000
   - **Total Tonnage:** 1000 tonnes

3. **Scroll to view tables:**
   - Rake allocation with destinations, wagons, costs
   - Truck allocation (if any)

4. **Click "Export Plan"**
   - JSON file downloads
   - Can be used for further analysis

5. **Click "New Optimization"**
   - Returns to form for another run

**What to say:**

> "The optimization completed successfully! Here's what the algorithm decided:
> - 1 rake allocated to transport 1000 tonnes
> - Total estimated cost: ₹500,000
> - Estimated delay: 2.5 hours (based on ML prediction)
> 
> You can see the detailed allocation in the tables, and export the plan as JSON for integration with your systems."

---

### Step 5: Admin Panel & Wrap-up (4:30-5:00)

**What to do:**

1. **Click "Admin" in sidebar**
   - Admin panel loads

2. **Click "Fetch Metrics"**
   - System metrics display:
     - Uptime: X seconds
     - Total optimizer runs: X
     - Success rate: X%

3. **Show "Reload Models" button**
   - Can be used to refresh ML models
   - Useful for model updates

4. **Optional: Click "ML Models"**
   - Shows list of loaded models
   - Model versions and status

**What to say:**

> "The Admin panel gives you system-level controls. You can:
> - View system metrics and uptime
> - Reload ML models without restarting the app
> - Monitor model status
> 
> This is useful for operations teams to ensure the system is running smoothly."

---

## 🎯 Key Points to Emphasize

1. **End-to-End Solution**
   - Complete desktop application
   - No external dependencies
   - Works offline

2. **Optimization Engine**
   - Solves complex logistics problems
   - Multi-modal transport (rail + road)
   - Cost and delay optimization

3. **ML Integration**
   - Demand forecasting
   - Delay prediction
   - Cost estimation
   - Mode classification

4. **User Experience**
   - Intuitive interface
   - Real-time feedback
   - Professional design
   - Responsive layout

5. **Production Ready**
   - Packaged as installers
   - Cross-platform support
   - Error handling
   - Logging & monitoring

---

## 💡 Talking Points

### On Technology Stack

> "We used modern web technologies (React, Vite, TailwindCSS) for the frontend, FastAPI for the backend, and Electron to package it as a desktop app. This gives us a beautiful, responsive UI with a powerful backend."

### On Optimization

> "The optimization engine uses linear programming to find the best dispatch plan. It considers available rakes, trucks, orders, inventory, and uses ML models to predict delays and costs."

### On ML Models

> "We trained separate ML models for demand forecasting, delay prediction, throughput prediction, and cost estimation. These models are integrated into the optimization pipeline to make better decisions."

### On Scalability

> "The system is designed to handle large-scale problems. The backend can process thousands of orders and optimize across multiple loading points and destinations."

### On Deployment

> "We provide installers for Windows, macOS, and Linux. The backend is bundled with the app, so there's no complex setup required. Just install and run."

---

## ⚠️ If Something Goes Wrong

### Backend won't start

**Solution:**
1. Click Admin in sidebar
2. Click "Restart Backend"
3. Wait 10 seconds
4. Refresh the page

### Optimization fails

**Solution:**
1. Check backend health indicator
2. Try with smaller parameters
3. Check logs: Admin → View Logs

### App is slow

**Solution:**
1. Close other applications
2. Check system resources
3. Restart the app

---

## 📊 Expected Results

### Dashboard
- All 4 KPI cards visible
- Metrics are non-zero
- Health status is green

### Optimization
- Form accepts input
- Optimization completes in < 2 minutes
- Results display correctly

### Results
- Summary cards show totals
- Tables display allocations
- Export button works

### Admin
- Metrics display correctly
- Model reload button is clickable
- No errors in logs

---

## 🎬 Demo Video Script (Optional)

If recording a video:

1. **Intro (0:00-0:15)**
   - "This is SAIL Bokaro Optimizer"
   - "A logistics optimization system for steel plant dispatch"

2. **Launch (0:15-0:45)**
   - Show app launching
   - Show backend starting
   - Show dashboard loading

3. **Features (0:45-3:00)**
   - Dashboard overview
   - Run optimization
   - Show results

4. **Outro (3:00-3:15)**
   - "Thank you for watching"
   - "Questions?"

---

## ✅ Pre-Demo Checklist

- [ ] App installed and tested
- [ ] Backend binary present
- [ ] Sample data loaded
- [ ] All pages accessible
- [ ] Optimization works
- [ ] Export functionality tested
- [ ] Admin panel accessible
- [ ] No error messages
- [ ] Performance is acceptable
- [ ] Presentation materials ready

---

**Good luck with your demo! 🚀**

