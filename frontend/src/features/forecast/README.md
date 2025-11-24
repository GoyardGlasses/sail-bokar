# Forecast Feature

Complete forecast feature with TypeScript, Zustand state management, and comprehensive testing.

## 📁 Structure

```
forecast/
├── api.ts              # API calls with error handling
├── store.ts            # Zustand state management
├── types.ts            # TypeScript interfaces
├── hooks.ts            # Custom React hooks
├── __tests__/          # Unit tests
│   ├── store.test.ts
│   ├── api.test.ts
│   └── hooks.test.ts
└── README.md           # This file
```

## 🚀 Quick Start

### Import Store
```typescript
import { useForecastStore } from '@/features/forecast/store'

function MyComponent() {
  const { forecastData, isLoading, error } = useForecastStore()
  return <div>{forecastData?.id}</div>
}
```

### Use Hooks
```typescript
import { useRunForecast } from '@/features/forecast/hooks'

function ForecastComponent() {
  const { run, isLoading } = useRunForecast()
  
  const handleRun = async () => {
    try {
      const result = await run({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        selectedModels: ['XGBoost'],
        confidence: 0.95,
        includeSeasonality: true
      })
      console.log('Forecast result:', result)
    } catch (error) {
      console.error('Forecast failed:', error)
    }
  }
  
  return <button onClick={handleRun} disabled={isLoading}>Run Forecast</button>
}
```

## 📚 API Reference

### Store Actions

#### `setForecastData(data: ForecastResult)`
Set forecast data in store.

#### `setIsLoading(loading: boolean)`
Set loading state.

#### `setError(error: string | null)`
Set error message.

#### `setSelectedModel(model: string)`
Set selected ML model.

#### `clearForecast()`
Clear forecast data and error.

#### `resetState()`
Reset all state to initial values.

### Hooks

#### `useRunForecast()`
Run forecast with configuration.

```typescript
const { run, isLoading } = useRunForecast()
const result = await run(config)
```

#### `useForecastHistory()`
Fetch forecast history.

```typescript
const { fetch, isLoading } = useForecastHistory()
const history = await fetch(limit)
```

#### `useForecast(id: string)`
Get forecast by ID.

```typescript
const { fetch, isLoading } = useForecast('forecast-123')
const forecast = await fetch()
```

#### `useDeleteForecast()`
Delete forecast.

```typescript
const { remove, isLoading } = useDeleteForecast()
await remove('forecast-123')
```

#### `useExportForecast()`
Export forecast to CSV or JSON.

```typescript
const { export: exportForecast, isLoading } = useExportForecast()
await exportForecast('forecast-123', 'csv')
```

## 🧪 Testing

Run tests:
```bash
npm test -- forecast
```

Test coverage:
```bash
npm test -- forecast --coverage
```

## 📝 Types

All TypeScript types are in `types.ts`:

- `MLModel` - ML model definition
- `ForecastConfig` - Forecast configuration
- `ForecastResult` - Forecast result
- `ForecastState` - Store state
- `ForecastResponse` - API response
- `ForecastError` - Error object

## 🔄 State Flow

```
Component
   ↓
Hook (useRunForecast)
   ↓
API (runForecast)
   ↓
Store (useForecastStore)
   ↓
Component (re-render)
```

## 🛠️ Development

### Add New Hook

1. Create hook in `hooks.ts`
2. Use store actions
3. Add error handling
4. Add tests in `__tests__/hooks.test.ts`

### Add New API Call

1. Add function in `api.ts`
2. Add types in `types.ts`
3. Add error handling
4. Add tests in `__tests__/api.test.ts`

## 📊 Performance

- Store uses Zustand middleware for devtools and persistence
- Hooks use `useCallback` to prevent unnecessary re-renders
- API calls use axios with proper error handling
- Memoization for expensive computations

## 🔐 Error Handling

All errors follow this pattern:

```typescript
interface ForecastError {
  code: string        // Error code for identification
  message: string     // User-friendly message
  details?: any       // Additional error details
}
```

## 🚀 Best Practices

1. Always use hooks instead of direct store access
2. Handle errors in try-catch blocks
3. Show loading states to users
4. Clear errors when starting new operations
5. Reset state when navigating away
6. Use TypeScript types for all data

## 📦 Dependencies

- `zustand` - State management
- `axios` - HTTP client
- `@testing-library/react` - Testing utilities
- `@types/jest` - Jest types

## 🔗 Related Features

- Optimization Feature
- Delay Prediction Feature
- Cost Prediction Feature
