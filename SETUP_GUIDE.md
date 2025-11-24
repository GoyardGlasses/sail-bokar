# SAIL Bokar - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL 12+
- Python 3.9+

---

## 📦 Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Install Testing Dependencies

```bash
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  vitest \
  @vitest/ui \
  jsdom \
  @types/jest
```

### 3. Install TypeScript & Types

```bash
npm install --save-dev \
  typescript \
  @types/react \
  @types/react-dom \
  @types/node
```

### 4. Environment Setup

Create `.env.local`:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_APP_NAME=SAIL Bokar
VITE_APP_VERSION=1.0.0
```

### 5. Run Development Server

```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🧪 Testing Setup

### Configure Vitest

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Create Test Setup

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})
```

### Update package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext ts,tsx"
  }
}
```

### Run Tests

```bash
# Run all tests
npm test

# Run specific feature tests
npm test -- forecast

# Run with UI
npm test:ui

# Generate coverage report
npm test:coverage

# Watch mode
npm test -- --watch
```

---

## 🗄️ Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Setup Database

```bash
# Create database
createdb sail_bokar

# Run migrations
psql sail_bokar < database/schema.sql

# Verify tables
psql sail_bokar -c "\dt"
```

### 3. Environment Setup

Create `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost/sail_bokar
JWT_SECRET=your_secret_key_here
API_PORT=8000
API_HOST=127.0.0.1
ENVIRONMENT=development
```

### 4. Run Backend

```bash
python main.py
```

Backend runs on: `http://127.0.0.1:8000`
API Docs: `http://127.0.0.1:8000/api/docs`

---

## 🏗️ Project Structure

### Frontend Structure

```
frontend/
├── src/
│   ├── features/              # Feature modules
│   │   ├── forecast/
│   │   ├── optimization/
│   │   ├── delay/
│   │   └── cost/
│   ├── components/            # Shared components
│   ├── pages/                 # Page components
│   ├── hooks/                 # Global hooks
│   ├── store/                 # Global state
│   ├── utils/                 # Utilities
│   ├── types/                 # Global types
│   ├── styles/                # Global styles
│   ├── test/                  # Test setup
│   ├── App.tsx
│   └── main.tsx
├── public/                    # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

### Backend Structure

```
backend/
├── database/
│   └── schema.sql             # Database schema
├── models.py                  # SQLAlchemy models
├── routers/
│   ├── auth.py
│   ├── forecast.py
│   ├── optimization.py
│   └── complete_api.py
├── utils/
│   ├── auth.py
│   └── validation.py
├── main.py                    # FastAPI app
├── requirements.txt
└── .env
```

---

## 🔧 Configuration Files

### TypeScript Configuration

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Vite Configuration

`vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
      },
    },
  },
})
```

---

## 📝 Code Quality

### ESLint Setup

```bash
npm install --save-dev eslint eslint-plugin-react eslint-plugin-react-hooks
```

`.eslintrc.json`:

```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

### Prettier Setup

```bash
npm install --save-dev prettier
```

`.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## 🚀 Development Workflow

### 1. Create New Feature

```bash
# Create feature folder
mkdir -p src/features/myfeature

# Create core files
touch src/features/myfeature/{types.ts,api.ts,store.ts,hooks.ts,README.md}

# Create tests
mkdir src/features/myfeature/__tests__
touch src/features/myfeature/__tests__/{store.test.ts,api.test.ts,hooks.test.ts}
```

### 2. Write Types First

```typescript
// src/features/myfeature/types.ts
export interface MyData {
  id: string
  name: string
}

export interface MyState {
  data: MyData | null
  isLoading: boolean
  error: string | null
}
```

### 3. Create Store

```typescript
// src/features/myfeature/store.ts
import { create } from 'zustand'

export const useMyStore = create<MyState>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  setData: (data) => set({ data }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))
```

### 4. Create API

```typescript
// src/features/myfeature/api.ts
import axios from 'axios'
import { MyData } from './types'

export const fetchData = async (): Promise<MyData> => {
  const response = await axios.get('/api/v1/myfeature')
  return response.data
}
```

### 5. Create Hooks

```typescript
// src/features/myfeature/hooks.ts
import { useCallback } from 'react'
import { useMyStore } from './store'
import { fetchData } from './api'

export const useFetchData = () => {
  const { setData, setIsLoading, setError } = useMyStore()

  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchData()
      setData(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [setData, setIsLoading, setError])

  return { fetch }
}
```

### 6. Write Tests

```typescript
// src/features/myfeature/__tests__/store.test.ts
import { renderHook, act } from '@testing-library/react'
import { useMyStore } from '../store'

describe('My Store', () => {
  it('should set data', () => {
    const { result } = renderHook(() => useMyStore())
    const data = { id: '1', name: 'Test' }

    act(() => {
      result.current.setData(data)
    })

    expect(result.current.data).toEqual(data)
  })
})
```

### 7. Run Tests

```bash
npm test -- myfeature
```

---

## 🐛 Debugging

### Frontend Debugging

1. **Browser DevTools**
   - Open DevTools (F12)
   - Go to Sources tab
   - Set breakpoints

2. **React DevTools**
   - Install React DevTools extension
   - Inspect component state

3. **Zustand DevTools**
   - Store is integrated with Redux DevTools
   - Open Redux DevTools extension

### Backend Debugging

```python
# Add breakpoints in Python
import pdb; pdb.set_trace()

# Or use logging
import logging
logging.debug("Debug message")
```

---

## 📊 Performance Monitoring

### Frontend

```bash
# Build analysis
npm run build -- --analyze

# Bundle size
npm install --save-dev rollup-plugin-visualizer
```

### Backend

```python
# Add timing middleware
from fastapi import Request
import time

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

---

## 🚀 Deployment

### Frontend Deployment (Netlify)

```bash
# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Backend Deployment (Heroku)

```bash
# Create Procfile
echo "web: gunicorn main:app" > Procfile

# Deploy
heroku create sail-bokar
git push heroku main
```

---

## 📞 Troubleshooting

### Port Already in Use

```bash
# Find process using port 5173
lsof -i :5173

# Kill process
kill -9 <PID>
```

### Database Connection Error

```bash
# Check PostgreSQL status
pg_isready

# Check connection string
psql $DATABASE_URL
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

---

## ✅ Verification Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL running
- [ ] Frontend dependencies installed
- [ ] Backend dependencies installed
- [ ] Database created and migrated
- [ ] Environment variables configured
- [ ] Frontend runs on http://localhost:5173
- [ ] Backend runs on http://127.0.0.1:8000
- [ ] Tests pass
- [ ] No TypeScript errors
- [ ] No ESLint errors

---

**Last Updated**: November 24, 2025
**Version**: 1.0.0
