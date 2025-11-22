# UI Component Guide - Visual Reference

## Component Architecture

```
ModernLayout
├── Sidebar
│   ├── Logo
│   └── Menu Items
├── Top Navigation
│   ├── Menu Toggle
│   ├── Search Bar
│   ├── Notifications
│   ├── Settings
│   └── User Menu
└── Main Content
    ├── Page Header
    ├── Metric Cards
    ├── Charts
    ├── Tables
    └── Other Components
```

---

## Component Specifications

### ModernLayout

**Props**: `children`

**Features**:
- Collapsible sidebar (64px collapsed, 256px expanded)
- Sticky top navigation (64px height)
- Dark theme
- Responsive breakpoints

**Usage**:
```jsx
<ModernLayout>
  <YourPageContent />
</ModernLayout>
```

---

### MetricCard

**Props**:
- `title` (string) - Card title
- `value` (string/number) - Main value
- `unit` (string, optional) - Unit of measurement
- `change` (number, optional) - Change percentage
- `trend` (string, optional) - 'up' or 'down'
- `icon` (React component, optional) - Icon to display

**Features**:
- Large value display
- Trend indicator with color
- Icon support
- Hover effects

**Usage**:
```jsx
<MetricCard
  title="Total Rakes"
  value="18"
  change={12}
  trend="up"
  icon={Truck}
/>
```

**Styling**:
- Background: `bg-slate-800`
- Border: `border-slate-700`
- Value color: `text-cyan-400`
- Hover: `hover:border-slate-600`

---

### ChartCard

**Props**:
- `title` (string) - Card title
- `subtitle` (string, optional) - Subtitle
- `children` (React node) - Chart content
- `onDownload` (function, optional) - Download handler

**Features**:
- Title and subtitle
- Download button
- Responsive container
- Consistent styling

**Usage**:
```jsx
<ChartCard
  title="Demand Forecast"
  subtitle="Historical vs Predicted"
  onDownload={() => downloadChart()}
>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      {/* chart components */}
    </LineChart>
  </ResponsiveContainer>
</ChartCard>
```

**Styling**:
- Background: `bg-slate-800`
- Border: `border-slate-700`
- Title color: `text-white`
- Subtitle color: `text-slate-400`

---

### DataTable

**Props**:
- `columns` (array) - Column definitions
- `data` (array) - Table data
- `title` (string, optional) - Table title
- `onRowClick` (function, optional) - Row click handler

**Column Definition**:
```javascript
{
  key: 'id',           // Data key
  label: 'ID',         // Column header
  sortable: true,      // Enable sorting
  render: (value, row) => <span>{value}</span> // Custom render
}
```

**Features**:
- Sortable columns
- Hover effects
- Custom cell rendering
- Click handlers
- Responsive design

**Usage**:
```jsx
<DataTable
  title="Active Rakes"
  columns={columns}
  data={data}
  onRowClick={(row) => console.log(row)}
/>
```

**Styling**:
- Background: `bg-slate-800`
- Border: `border-slate-700`
- Header: `bg-slate-900/50`
- Hover row: `hover:bg-slate-700/50`

---

## Chart Examples

### Line Chart
```jsx
<ChartCard title="Demand Forecast">
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
      <XAxis dataKey="date" stroke="#94a3b8" />
      <YAxis stroke="#94a3b8" />
      <Tooltip contentStyle={{backgroundColor: '#1e293b'}} />
      <Legend />
      <Line
        type="monotone"
        dataKey="demand"
        stroke="#06b6d4"
        strokeWidth={2}
      />
    </LineChart>
  </ResponsiveContainer>
</ChartCard>
```

### Bar Chart
```jsx
<ChartCard title="Comparison">
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
      <XAxis dataKey="name" stroke="#94a3b8" />
      <YAxis stroke="#94a3b8" />
      <Tooltip contentStyle={{backgroundColor: '#1e293b'}} />
      <Legend />
      <Bar dataKey="value" fill="#06b6d4" />
    </BarChart>
  </ResponsiveContainer>
</ChartCard>
```

### Scatter Chart
```jsx
<ChartCard title="Utilization vs Cost">
  <ResponsiveContainer width="100%" height={300}>
    <ScatterChart>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
      <XAxis dataKey="utilization" stroke="#94a3b8" />
      <YAxis dataKey="cost" stroke="#94a3b8" />
      <Tooltip contentStyle={{backgroundColor: '#1e293b'}} />
      <Scatter name="Rakes" data={data} fill="#06b6d4" />
    </ScatterChart>
  </ResponsiveContainer>
</ChartCard>
```

### Composed Chart
```jsx
<ChartCard title="Multiple Metrics">
  <ResponsiveContainer width="100%" height={300}>
    <ComposedChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
      <XAxis dataKey="date" stroke="#94a3b8" />
      <YAxis stroke="#94a3b8" />
      <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
      <Tooltip contentStyle={{backgroundColor: '#1e293b'}} />
      <Legend />
      <Bar dataKey="utilization" fill="#06b6d4" />
      <Line
        yAxisId="right"
        type="monotone"
        dataKey="cost"
        stroke="#f59e0b"
      />
    </ComposedChart>
  </ResponsiveContainer>
</ChartCard>
```

---

## Color Reference

### Primary Colors
- **Cyan**: `#06b6d4` (text-cyan-400) - Main accent
- **Sky**: `#0ea5e9` (text-sky-500) - Secondary accent
- **White**: `#ffffff` (text-white) - Text

### Background Colors
- **Slate-950**: `#0f172a` - Main background
- **Slate-900**: `#0f172a` - Sidebar
- **Slate-800**: `#1e293b` - Cards
- **Slate-700**: `#334155` - Borders

### Status Colors
- **Green**: `#22c55e` (text-green-400) - Success
- **Yellow**: `#f59e0b` (text-yellow-400) - Warning
- **Red**: `#ef4444` (text-red-400) - Error

### Text Colors
- **White**: `#ffffff` - Headings
- **Slate-300**: `#cbd5e1` - Body text
- **Slate-400**: `#94a3b8` - Labels
- **Slate-500**: `#64748b` - Secondary text

---

## Spacing & Sizing

### Padding
- Cards: `p-6` (24px)
- Sections: `p-4` (16px)
- Compact: `p-2` (8px)

### Margins
- Between sections: `mb-6` (24px)
- Between cards: `gap-4` (16px)
- Between elements: `gap-2` (8px)

### Heights
- Top nav: `h-16` (64px)
- Sidebar: `w-64` (256px) / `w-20` (80px)
- Charts: `height={300}` (300px)
- Cards: Auto height

### Border Radius
- Cards: `rounded-xl` (12px)
- Buttons: `rounded-lg` (8px)
- Inputs: `rounded-lg` (8px)

---

## Typography

### Headings
- Page title: `text-3xl font-bold text-white`
- Section title: `text-lg font-semibold text-white`
- Card title: `text-lg font-semibold text-white`

### Body Text
- Regular: `text-sm text-slate-300`
- Label: `text-sm font-medium text-slate-400`
- Small: `text-xs text-slate-500`

### Values
- Large metric: `text-3xl font-bold text-cyan-400`
- Regular metric: `text-lg font-bold text-cyan-400`

---

## Responsive Breakpoints

### Tailwind Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Grid Layouts
- Mobile: `grid-cols-1`
- Tablet: `md:grid-cols-2`
- Desktop: `lg:grid-cols-4`

### Sidebar
- Desktop: Visible (256px)
- Tablet: Collapsible
- Mobile: Hidden with menu button

---

## Interactive States

### Hover
- Cards: `hover:border-slate-600`
- Buttons: `hover:bg-cyan-600`
- Rows: `hover:bg-slate-700/50`
- Links: `hover:text-cyan-400`

### Focus
- Inputs: `focus:ring-2 focus:ring-cyan-500`
- Buttons: `focus:outline-none`

### Active
- Menu items: `bg-cyan-500 text-white`
- Tabs: `text-cyan-400 border-b-2 border-cyan-400`

### Disabled
- Buttons: `opacity-50 cursor-not-allowed`
- Inputs: `opacity-50 cursor-not-allowed`

---

## Animation & Transitions

### Transitions
- Duration: `duration-200` or `duration-300`
- Easing: `ease-in-out`
- Properties: `transition-all`, `transition-colors`

### Hover Effects
```css
transition-all duration-200
hover:border-slate-600
hover:shadow-lg
```

### Sidebar Toggle
```css
transition-all duration-300
w-64 /* expanded */
w-20 /* collapsed */
```

---

## Accessibility

### Semantic HTML
- Use `<button>` for buttons
- Use `<table>` for tables
- Use `<nav>` for navigation
- Use `<main>` for main content

### ARIA Labels
- `title` attribute for tooltips
- `aria-label` for icon buttons
- `aria-expanded` for collapsible items

### Keyboard Navigation
- Tab through interactive elements
- Enter to activate buttons
- Arrow keys for navigation

---

## Performance Tips

1. **Lazy Load Charts**: Use React.lazy() for heavy components
2. **Memoize Components**: Use React.memo() for expensive renders
3. **Optimize Images**: Compress and use WebP format
4. **Code Splitting**: Use React Router's lazy loading
5. **Debounce Search**: Add debounce to search input
6. **Virtual Scrolling**: For large tables, use react-window

---

## Customization Examples

### Change Primary Color
Replace `cyan-400` with your color:
```jsx
// From
stroke="#06b6d4"
// To
stroke="#3b82f6" // blue-500
```

### Add Custom Font
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
}
```

### Add Dark Mode Toggle
```jsx
const [darkMode, setDarkMode] = useState(true)

return (
  <div className={darkMode ? 'dark' : 'light'}>
    {/* content */}
  </div>
)
```

---

## Component Hierarchy

```
App
├── ModernLayout
│   ├── Sidebar
│   │   ├── Logo
│   │   └── Menu Items
│   ├── TopNav
│   │   ├── Search
│   │   ├── Notifications
│   │   └── User Menu
│   └── MainContent
│       ├── PageHeader
│       ├── MetricCards
│       │   └── MetricCard (multiple)
│       ├── ChartCards
│       │   ├── ChartCard
│       │   │   └── Recharts Component
│       │   └── ChartCard (multiple)
│       └── DataTables
│           └── DataTable (multiple)
```

---

## File Organization

```
frontend/src/
├── components/
│   ├── ModernLayout.jsx
│   ├── MetricCard.jsx
│   ├── ChartCard.jsx
│   └── DataTable.jsx
├── pages/
│   ├── ModernDashboard.jsx
│   ├── OperationsHub.jsx
│   └── RakePlanner.jsx
├── App.jsx
└── main.jsx
```

---

**Last Updated**: November 22, 2025  
**Version**: 1.0  
**Status**: Complete
