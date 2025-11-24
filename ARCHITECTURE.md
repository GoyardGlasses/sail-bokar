# SAIL Bokar - Architecture & Code Organization Guide

## 📐 Project Architecture

### Overview
```
SAIL Bokar (Supply Chain Management System)
├── Frontend (React + Vite + TypeScript)
├── Backend (FastAPI + Python)
└── Database (PostgreSQL)
```

---

## 📁 Frontend Structure

### New Feature-Based Organization

```
frontend/src/
├── features/                    # Feature modules
│   ├── forecast/               # Forecast feature
│   │   ├── api.ts              # API calls
│   │   ├── store.ts            # Zustand store
│   │   ├── types.ts            # TypeScript types
│   │   ├── hooks.ts            # Custom hooks
│   │   ├── __tests__/          # Unit tests
│   │   └── README.md           # Feature documentation
│   │
│   ├── optimization/           # Optimization feature
│   │   ├── api.ts
│   │   ├── store.ts
│   │   ├── types.ts
│   │   ├── hooks.ts
│   │   └── __tests__/
│   │
│   ├── delay/                  # Delay prediction feature
│   │   ├── api.ts
│   │   ├── store.ts
│   │   ├── types.ts
│   │   ├── hooks.ts
│   │   └── __tests__/
│   │
│   └── cost/                   # Cost prediction feature
│       ├── api.ts
│       ├── store.ts
│       ├── types.ts
│       ├── hooks.ts
│       └── __tests__/
│
├── components/                 # Shared components
│   ├── UI/                     # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Spinner.tsx
│   │
│   ├── Layout/                 # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   │
│   └── Common/                 # Common components
│       ├── ErrorBoundary.tsx
│       ├── LoadingState.tsx
│       └── NotificationCenter.tsx
│
├── pages/                      # Page components
│   ├── Dashboard.tsx
│   ├── ForecastPage.tsx
│   ├── OptimizationPage.tsx
│   └── AnalyticsPage.tsx
│
├── hooks/                      # Global hooks
│   ├── useAuth.ts
│   ├── useNotification.ts
│   └── useApi.ts
│
├── store/                      # Global state
│   ├── authStore.ts
│   ├── appStore.ts
│   └── index.ts
│
├── utils/                      # Utilities
│   ├── api.ts                  # API client
│   ├── format.ts               # Formatting utilities
│   ├── validation.ts           # Form validation
│   └── constants.ts            # Constants
│
├── types/                      # Global types
│   ├── index.ts
│   ├── api.ts
│   └── common.ts
│
├── styles/                     # Global styles
│   ├── index.css
│   └── tailwind.css
│
├── App.tsx                     # Root component
├── main.tsx                    # Entry point
└── vite-env.d.ts              # Vite types
```

---

## 🏗️ State Management Architecture

### Zustand Store Pattern

Each feature has its own Zustand store:

```typescript
// features/forecast/store.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface ForecastState {
  // State
  data: any | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setData: (data: any) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useForecastStore = create<ForecastState>()(
  devtools(
    persist(
      (set) => ({
        data: null,
        isLoading: false,
        error: null,
        setData: (data) => set({ data }),
        setIsLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        reset: () => set({ data: null, isLoading: false, error: null }),
      }),
      { name: 'forecast-store' }
    )
  )
)
```

### Global State

```typescript
// store/authStore.ts - Authentication
// store/appStore.ts - App-wide state (theme, notifications, etc.)
```

---

## 🎯 API Layer Architecture

### API Pattern

```typescript
// features/forecast/api.ts
import axios from 'axios'
import { ForecastConfig, ForecastResult } from './types'

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'

export const runForecast = async (config: ForecastConfig): Promise<ForecastResult> => {
  try {
    const response = await axios.post(`${API_BASE}/api/v1/forecasts/run`, config)
    return response.data
  } catch (error) {
    throw new Error('Failed to run forecast')
  }
}
```

### Error Handling

```typescript
// utils/api.ts
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status?: number,
    public details?: any
  ) {
    super(message)
  }
}

// Usage
try {
  const result = await runForecast(config)
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Error ${error.code}: ${error.message}`)
  }
}
```

---

## 🪝 Custom Hooks Pattern

### Feature Hooks

```typescript
// features/forecast/hooks.ts
import { useCallback } from 'react'
import { useForecastStore } from './store'
import { runForecast } from './api'

export const useRunForecast = () => {
  const { setIsLoading, setError, setData } = useForecastStore()

  const run = useCallback(async (config) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await runForecast(config)
      setData(result)
      return result
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading, setError, setData])

  return { run, isLoading: useForecastStore((state) => state.isLoading) }
}
```

### Usage in Components

```typescript
// pages/ForecastPage.tsx
import { useRunForecast } from '@/features/forecast/hooks'

export default function ForecastPage() {
  const { run, isLoading } = useRunForecast()
  
  const handleRun = async () => {
    try {
      await run(config)
    } catch (error) {
      // Error handled in hook
    }
  }
  
  return <button onClick={handleRun} disabled={isLoading}>Run</button>
}
```

---

## 🧪 Testing Architecture

### Test Structure

```
features/forecast/__tests__/
├── store.test.ts       # Store unit tests
├── api.test.ts         # API unit tests
├── hooks.test.ts       # Hook unit tests
└── integration.test.ts # Integration tests
```

### Test Pattern

```typescript
// features/forecast/__tests__/store.test.ts
import { renderHook, act } from '@testing-library/react'
import { useForecastStore } from '../store'

describe('Forecast Store', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useForecastStore())
    act(() => {
      result.current.reset()
    })
  })

  it('should set forecast data', () => {
    const { result } = renderHook(() => useForecastStore())
    const mockData = { id: '1' }

    act(() => {
      result.current.setData(mockData)
    })

    expect(result.current.data).toEqual(mockData)
  })
})
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific feature
npm test -- forecast

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## 📝 TypeScript Types

### Type Organization

```typescript
// features/forecast/types.ts
export interface MLModel {
  id: number
  name: string
  accuracy: number
}

export interface ForecastConfig {
  startDate: string
  endDate: string
  selectedModels: string[]
}

export interface ForecastResult {
  id: string
  predictions: number[]
  accuracy: number
}

// Global types
// types/api.ts
export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export interface ApiError {
  code: string
  message: string
  details?: any
}
```

### Type Safety Best Practices

1. **Always define types for API responses**
   ```typescript
   const response = await axios.get<ForecastResult>('/api/forecast')
   ```

2. **Use strict null checks**
   ```typescript
   // tsconfig.json
   {
     "compilerOptions": {
       "strictNullChecks": true
     }
   }
   ```

3. **Use discriminated unions for state**
   ```typescript
   type ForecastState = 
     | { status: 'idle'; data: null }
     | { status: 'loading'; data: null }
     | { status: 'success'; data: ForecastResult }
     | { status: 'error'; data: null; error: string }
   ```

---

## 📚 Documentation Standards

### Feature README

Each feature should have a README.md with:

```markdown
# Feature Name

## 📁 Structure
- File organization

## 🚀 Quick Start
- Basic usage examples

## 📚 API Reference
- All exported functions

## 🧪 Testing
- How to run tests

## 📝 Types
- TypeScript interfaces

## 🔄 State Flow
- How data flows through the feature

## 🛠️ Development
- How to extend the feature

## 📊 Performance
- Performance considerations

## 🔐 Error Handling
- Error handling patterns

## 🚀 Best Practices
- Do's and don'ts

## 📦 Dependencies
- Required packages

## 🔗 Related Features
- Links to related features
```

### Code Comments

```typescript
/**
 * Run forecast with given configuration
 * @param config - Forecast configuration
 * @returns Promise with forecast result
 * @throws ApiError if forecast fails
 */
export const runForecast = async (config: ForecastConfig): Promise<ForecastResult> => {
  // Implementation
}
```

---

## 🔄 Data Flow

### Complete Data Flow Example

```
User Action (Click Button)
    ↓
Component Handler
    ↓
Custom Hook (useRunForecast)
    ↓
Store Action (setIsLoading)
    ↓
API Call (runForecast)
    ↓
HTTP Request
    ↓
Backend Processing
    ↓
HTTP Response
    ↓
Store Update (setData, setError)
    ↓
Component Re-render
    ↓
User Sees Result
```

---

## 🚀 Development Workflow

### Creating a New Feature

1. **Create feature folder**
   ```bash
   mkdir -p src/features/myfeature
   ```

2. **Create core files**
   - `types.ts` - TypeScript interfaces
   - `api.ts` - API calls
   - `store.ts` - Zustand store
   - `hooks.ts` - Custom hooks
   - `README.md` - Documentation

3. **Create tests**
   ```bash
   mkdir src/features/myfeature/__tests__
   ```
   - `store.test.ts`
   - `api.test.ts`
   - `hooks.test.ts`

4. **Create components** (if needed)
   ```bash
   mkdir src/features/myfeature/components
   ```

5. **Export from index**
   ```typescript
   // src/features/myfeature/index.ts
   export * from './api'
   export * from './store'
   export * from './hooks'
   export * from './types'
   ```

---

## 📊 Performance Optimization

### Code Splitting

```typescript
// pages/ForecastPage.tsx
import { lazy, Suspense } from 'react'

const ForecastChart = lazy(() => import('@/components/ForecastChart'))

export default function ForecastPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ForecastChart />
    </Suspense>
  )
}
```

### Memoization

```typescript
import { useMemo, useCallback } from 'react'

export const useExpensiveComputation = (data: any[]) => {
  return useMemo(() => {
    return data.map(item => expensiveOperation(item))
  }, [data])
}
```

### Pagination

```typescript
const [page, setPage] = useState(1)
const { data } = useForecastHistory(page, PAGE_SIZE)
```

---

## 🔐 Security Best Practices

1. **Never commit secrets**
   ```bash
   # .env.local (not committed)
   VITE_API_KEY=secret_key
   ```

2. **Validate all inputs**
   ```typescript
   import { z } from 'zod'
   
   const configSchema = z.object({
     startDate: z.string().date(),
     endDate: z.string().date(),
   })
   
   const config = configSchema.parse(userInput)
   ```

3. **Sanitize API responses**
   ```typescript
   import DOMPurify from 'dompurify'
   
   const cleanHtml = DOMPurify.sanitize(apiResponse.html)
   ```

---

## 📦 Dependencies

### Core
- `react` - UI framework
- `react-dom` - DOM rendering
- `vite` - Build tool
- `typescript` - Type safety

### State Management
- `zustand` - State management
- `zustand/middleware` - Devtools, persist

### HTTP
- `axios` - HTTP client

### Testing
- `vitest` - Test runner
- `@testing-library/react` - React testing
- `@testing-library/jest-dom` - DOM matchers

### Styling
- `tailwindcss` - Utility CSS
- `postcss` - CSS processing

---

## 🚀 Deployment

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

### Deploy to Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## 📞 Support & Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Last Updated**: November 24, 2025
**Version**: 1.0.0
