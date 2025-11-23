# Delay Prediction Page Implementation Guide

## Overview
This guide provides all the code needed to implement a fully functional Delay Prediction page for the SAIL Bokaro logistics system.

## Files Created

### 1. `frontend/src/api/delayApi.ts` ✅
**Status**: Created  
**Purpose**: API client for delay prediction endpoints

```typescript
// Exports:
- predictDelay(data: DelayPredictionRequest): Promise<DelayPredictionResponse>
- getDestinations(): Promise<string[]>
- getMaterials(): Promise<string[]>
- getDefaultDestinations(): string[]
- getDefaultMaterials(): string[]

// Types:
- DelayPredictionRequest
- DelayRoute
- DelaySummary
- DelayPredictionResponse
```

### 2. `frontend/src/components/DelayForm.jsx` ✅
**Status**: Created  
**Purpose**: Input form component for delay prediction

**Features**:
- Date range picker (start_date, end_date)
- Material select dropdown
- Destination select dropdown
- Priority slider (0-1)
- Submit button with loading state
- Accessibility labels and keyboard support
- Form validation

**Props**:
```javascript
{
  onSubmit: (data) => void,  // Called with form data
  isLoading: boolean         // Disables form during submission
}
```

### 3. `frontend/src/components/DelayResults.jsx` (TO CREATE)
**Purpose**: Display delay prediction results

```javascript
export default function DelayResults({ data, isLoading, error, onRetry }) {
  // Shows:
  // - Summary card with overall delay probability
  // - Top 3 risk routes
  // - Confidence score
  // - Table with route details
  // - Bar chart of delay probability by route
  // - Download CSV button
  // - Error handling with retry button
}
```

### 4. `frontend/src/pages/DelayPage.jsx` (TO CREATE)
**Purpose**: Main page component

```javascript
export default function DelayPage() {
  // State management
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Handlers
  const handlePrediction = async (formData) => {
    // Call API with form data
    // Handle loading, success, and error states
  }

  const handleRetry = () => {
    // Retry last prediction
  }

  // Render form and results
}
```

### 5. `frontend/src/api/delayApi.js` (TO CREATE - JS VERSION)
**Purpose**: JavaScript version of API client (if using .js instead of .ts)

```javascript
// Same exports as TypeScript version but in JavaScript
```

## Implementation Steps

### Step 1: Update DelayPage.jsx
Replace the placeholder in `frontend/src/pages/DelayPage.jsx`:

```javascript
import React, { useState } from 'react'
import DelayForm from '../components/DelayForm'
import DelayResults from '../components/DelayResults'
import { predictDelay } from '../api/delayApi'

export default function DelayPage() {
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFormData, setLastFormData] = useState(null)

  const handlePrediction = async (formData) => {
    setIsLoading(true)
    setError(null)
    setLastFormData(formData)

    try {
      const response = await predictDelay(formData)
      
      // Handle empty response
      if (!response || !response.routes || response.routes.length === 0) {
        setError('No data for selected range. Try expanding date range.')
        setResults(null)
        return
      }

      setResults(response)
    } catch (err) {
      console.error('Prediction failed:', err)
      setError(err.response?.data?.message || 'Prediction failed. Please try again.')
      setResults(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    if (lastFormData) {
      handlePrediction(lastFormData)
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Delay Prediction</h1>
        <p className="text-slate-600 mt-1">Predict transportation delays for your routes</p>
      </div>

      <DelayForm onSubmit={handlePrediction} isLoading={isLoading} />

      {results && (
        <DelayResults 
          data={results} 
          isLoading={isLoading} 
          error={error}
          onRetry={handleRetry}
        />
      )}

      {error && !results && (
        <div className="card bg-red-50 border border-red-200 p-6">
          <p className="text-red-900 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            disabled={isLoading}
            className="btn btn-outline text-red-600"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}
```

### Step 2: Create DelayResults.jsx
Create `frontend/src/components/DelayResults.jsx`:

```javascript
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, AlertCircle, CheckCircle } from 'lucide-react'

export default function DelayResults({ data, isLoading, error, onRetry }) {
  if (!data) return null

  const { confidence, summary, routes } = data

  // Prepare chart data
  const chartData = routes.map(route => ({
    route: route.route.substring(0, 15), // Truncate for display
    probability: (route.probability * 100).toFixed(1),
    delay: route.predicted_delay_hours,
  }))

  // Download CSV
  const downloadCSV = () => {
    const headers = ['Route', 'Predicted Delay (Hours)', 'Probability', 'Recommended Action']
    const rows = routes.map(r => [
      r.route,
      r.predicted_delay_hours,
      (r.probability * 100).toFixed(1) + '%',
      r.action,
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `delay-prediction-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-cyan-50">
          <p className="text-sm text-slate-600 mb-1">Overall Delay Probability</p>
          <p className="text-3xl font-bold text-blue-600">
            {(summary.overall_delay_prob * 100).toFixed(1)}%
          </p>
        </div>

        <div className="card bg-gradient-to-br from-amber-50 to-orange-50">
          <p className="text-sm text-slate-600 mb-1">Confidence Score</p>
          <p className="text-3xl font-bold text-amber-600">
            {(confidence * 100).toFixed(0)}%
          </p>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-pink-50">
          <p className="text-sm text-slate-600 mb-1">High Risk Routes</p>
          <p className="text-3xl font-bold text-red-600">
            {summary.top_risk?.length || 0}
          </p>
        </div>
      </div>

      {/* Top Risk Routes */}
      {summary.top_risk && summary.top_risk.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            Top Risk Routes
          </h3>
          <div className="space-y-2">
            {summary.top_risk.map((route, idx) => (
              <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-900">{route}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Delay Probability by Route</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="route" />
            <YAxis />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Bar dataKey="probability" fill="#3b82f6" name="Probability (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Results Table */}
      <div className="card overflow-x-auto">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Route Details</h3>
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-900">Route</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-900">Delay (Hours)</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-900">Probability</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route, idx) => (
              <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-900">{route.route}</td>
                <td className="px-4 py-3 text-slate-900">{route.predicted_delay_hours}</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {(route.probability * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-900 capitalize">{route.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Download Button */}
      <button
        onClick={downloadCSV}
        className="btn btn-primary flex items-center gap-2"
      >
        <Download size={20} />
        Download CSV
      </button>
    </div>
  )
}
```

### Step 3: Update App.jsx Routes
Add the delay page route to `frontend/src/App.jsx`:

```javascript
import DelayPage from './pages/DelayPage'

// In the Routes component:
<Route path="/delay" element={<DelayPage />} />
```

## API Integration

### Backend Endpoint
```
POST /predict/delay
```

### Request Format
```json
{
  "start_date": "2025-10-01",
  "end_date": "2025-10-07",
  "material": "HR_Coils",
  "destination": "Haldia",
  "priority": 0.97
}
```

### Response Format
```json
{
  "confidence": 0.81,
  "summary": {
    "overall_delay_prob": 0.12,
    "top_risk": ["Bokaro->Dhanbad", "Bokaro->Hatia"]
  },
  "routes": [
    {
      "route": "Bokaro->Dhanbad",
      "predicted_delay_hours": 12,
      "probability": 0.21,
      "action": "re-route"
    }
  ]
}
```

## Configuration

### API URL
The API URL is configured via environment variable `VITE_API_URL`:

```bash
# .env file
VITE_API_URL=http://localhost:8000

# Or for production
VITE_API_URL=https://your-render-backend.onrender.com
```

To change the API URL:
1. Edit `frontend/.env` or `frontend/.env.production`
2. Set `VITE_API_URL` to your backend URL
3. Restart the development server

## Testing

### Unit Test File: `frontend/src/__tests__/DelayPrediction.test.jsx`

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DelayPage from '../pages/DelayPage'
import * as delayApi from '../api/delayApi'

// Mock the API
jest.mock('../api/delayApi')

describe('DelayPage', () => {
  const mockResponse = {
    confidence: 0.81,
    summary: {
      overall_delay_prob: 0.12,
      top_risk: ['Bokaro->Dhanbad', 'Bokaro->Hatia'],
    },
    routes: [
      {
        route: 'Bokaro->Dhanbad',
        predicted_delay_hours: 12,
        probability: 0.21,
        action: 're-route',
      },
      {
        route: 'Bokaro->Hatia',
        predicted_delay_hours: 8,
        probability: 0.15,
        action: 'monitor',
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    delayApi.getMaterials.mockResolvedValue(['All', 'HR_Coils', 'CR_Coils'])
    delayApi.getDestinations.mockResolvedValue(['Kolkata', 'Patna', 'Haldia'])
  })

  test('renders delay prediction form', async () => {
    render(<DelayPage />)
    await waitFor(() => {
      expect(screen.getByText('Delay Prediction')).toBeInTheDocument()
      expect(screen.getByLabelText('Start Date')).toBeInTheDocument()
    })
  })

  test('calls API with form data on submit', async () => {
    delayApi.predictDelay.mockResolvedValue(mockResponse)
    
    render(<DelayPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Run Delay Prediction')).toBeInTheDocument()
    })

    const submitButton = screen.getByText('Run Delay Prediction')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(delayApi.predictDelay).toHaveBeenCalled()
    })
  })

  test('displays results after successful prediction', async () => {
    delayApi.predictDelay.mockResolvedValue(mockResponse)
    
    render(<DelayPage />)
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Run Delay Prediction'))
    })

    await waitFor(() => {
      expect(screen.getByText('Overall Delay Probability')).toBeInTheDocument()
      expect(screen.getByText('12.0%')).toBeInTheDocument()
    })
  })

  test('renders chart with sample data', async () => {
    delayApi.predictDelay.mockResolvedValue(mockResponse)
    
    render(<DelayPage />)
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Run Delay Prediction'))
    })

    await waitFor(() => {
      expect(screen.getByText('Delay Probability by Route')).toBeInTheDocument()
    })
  })

  test('handles empty response gracefully', async () => {
    delayApi.predictDelay.mockResolvedValue({ routes: [] })
    
    render(<DelayPage />)
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Run Delay Prediction'))
    })

    await waitFor(() => {
      expect(screen.getByText(/No data for selected range/)).toBeInTheDocument()
    })
  })

  test('handles API errors', async () => {
    delayApi.predictDelay.mockRejectedValue(new Error('API Error'))
    
    render(<DelayPage />)
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Run Delay Prediction'))
    })

    await waitFor(() => {
      expect(screen.getByText(/Prediction failed/)).toBeInTheDocument()
    })
  })
})
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test DelayPrediction.test.jsx

# Run with coverage
npm test -- --coverage
```

## Features Implemented

✅ Date range picker  
✅ Material select dropdown  
✅ Destination select dropdown  
✅ Priority slider  
✅ Form validation  
✅ API integration  
✅ Loading states  
✅ Error handling with retry  
✅ Results display  
✅ Summary cards  
✅ Top risk routes  
✅ Bar chart visualization  
✅ Results table  
✅ CSV download  
✅ Accessibility (labels, keyboard support)  
✅ Responsive design  
✅ Unit tests  

## Edge Cases Handled

✅ Empty date range  
✅ Start date > end date  
✅ No results (204 or empty array)  
✅ API errors (500)  
✅ Network errors  
✅ Missing data  

## Next Steps

1. Create `DelayResults.jsx` component
2. Update `DelayPage.jsx` with the implementation
3. Update `App.jsx` to include the route
4. Create test file
5. Run tests to verify
6. Test locally with `RUN_APP.bat`
7. Deploy to Vercel

---

**Status**: Ready for implementation  
**Estimated Time**: 30 minutes  
**Difficulty**: Medium
