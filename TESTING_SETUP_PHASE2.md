# Web Application Testing Configuration Setup

## 📋 **Phase 2 Testing Prerequisites**

Before starting Phase 2 development, we need to establish comprehensive testing infrastructure for the web application.

---

## ⚙️ **Required Testing Dependencies**

### **Frontend Testing Stack**
```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.4",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^14.5.1",
    "@vitest/coverage-v8": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "jsdom": "^23.0.1",
    "playwright": "^1.40.0",
    "@playwright/test": "^1.40.0",
    "vitest": "^1.0.0",
    "msw": "^2.0.8",
    "happy-dom": "^12.10.3"
  }
}
```

### **Configuration Files to Create**

#### **1. Vitest Configuration (apps/web/vitest.config.ts)**
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        'dist/',
        'build/'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../libs/shared/src')
    }
  }
})
```

#### **2. Playwright Configuration (apps/web/playwright.config.ts)**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: 'http://127.0.0.1:5173', // Vite dev server
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox', 
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],

  webServer: {
    command: 'pnpm dev',
    port: 5173,
    reuseExistingServer: !process.env.CI
  }
})
```

#### **3. Test Setup File (apps/web/src/test/setup.ts)**
```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

// Setup MSW server for API mocking
export const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))
```

#### **4. API Mocks (apps/web/src/test/mocks/handlers.ts)**
```typescript
import { http, HttpResponse } from 'msw'
import type { Dream } from '@shared/types'

const mockDreams: Dream[] = [
  {
    id: '1',
    title: 'Flying Dream',
    content: 'I was flying over mountains',
    date: new Date().toISOString(),
    mood: 'positive',
    tags: ['flying', 'mountains'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export const handlers = [
  // Get dreams
  http.get('/api/v1/dreams', () => {
    return HttpResponse.json({
      success: true,
      data: {
        dreams: mockDreams,
        total: mockDreams.length,
        hasMore: false
      },
      timestamp: new Date().toISOString()
    })
  }),

  // Create dream
  http.post('/api/v1/dreams', async ({ request }) => {
    const dreamData = await request.json() as Partial<Dream>
    const newDream: Dream = {
      id: Date.now().toString(),
      ...dreamData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as Dream

    return HttpResponse.json({
      success: true,
      data: newDream,
      timestamp: new Date().toISOString()
    })
  }),

  // Get dream by ID
  http.get('/api/v1/dreams/:id', ({ params }) => {
    const dream = mockDreams.find(d => d.id === params.id)
    if (!dream) {
      return new HttpResponse(null, { status: 404 })
    }
    return HttpResponse.json({
      success: true,
      data: dream,
      timestamp: new Date().toISOString()
    })
  }),

  // Update dream
  http.put('/api/v1/dreams/:id', async ({ params, request }) => {
    const updates = await request.json()
    const dreamIndex = mockDreams.findIndex(d => d.id === params.id)
    
    if (dreamIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    const updatedDream = {
      ...mockDreams[dreamIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    mockDreams[dreamIndex] = updatedDream

    return HttpResponse.json({
      success: true,
      data: updatedDream,
      timestamp: new Date().toISOString()
    })
  }),

  // Delete dream
  http.delete('/api/v1/dreams/:id', ({ params }) => {
    const dreamIndex = mockDreams.findIndex(d => d.id === params.id)
    if (dreamIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    
    mockDreams.splice(dreamIndex, 1)
    return new HttpResponse(null, { status: 204 })
  })
]
```

#### **5. Test Utilities (apps/web/src/test/utils.tsx)**
```typescript
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { TamaguiProvider } from '@tamagui/core'
import { config } from '../tamagui.config'

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <TamaguiProvider config={config}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </TamaguiProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Custom matchers
export const mockApiResponse = (data: any, success = true) => ({
  success,
  data,
  timestamp: new Date().toISOString()
})

// Test data factories
export const createMockDream = (overrides?: Partial<Dream>): Dream => ({
  id: 'test-dream-id',
  title: 'Test Dream',
  content: 'This is a test dream content',
  date: new Date().toISOString(),
  mood: 'neutral',
  tags: ['test'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
})
```

---

## 📝 **Package.json Scripts for Web App**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:unit": "vitest run src/**/*.test.{ts,tsx}",
    "test:integration": "vitest run src/**/*.integration.test.{ts,tsx}",
    "test:e2e": "playwright test", 
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:all": "pnpm test:unit && pnpm test:integration && pnpm test:e2e",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext ts,tsx --fix"
  }
}
```

---

## 🧪 **Testing Folder Structure**

```
apps/web/
├── src/
│   ├── components/
│   │   ├── DreamForm/
│   │   │   ├── DreamForm.tsx
│   │   │   ├── DreamForm.test.tsx
│   │   │   └── DreamForm.integration.test.tsx
│   │   └── DreamList/
│   │       ├── DreamList.tsx
│   │       ├── DreamList.test.tsx
│   │       └── DreamList.integration.test.tsx
│   ├── hooks/
│   │   ├── useDreams.ts
│   │   └── useDreams.test.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── api.test.ts
│   │   └── api.integration.test.ts
│   ├── stores/
│   │   ├── dreamStore.ts
│   │   └── dreamStore.test.ts
│   └── test/
│       ├── setup.ts
│       ├── utils.tsx
│       └── mocks/
│           ├── handlers.ts
│           └── data.ts
├── e2e/
│   ├── dream-creation.spec.ts
│   ├── dream-management.spec.ts
│   ├── dream-analysis.spec.ts
│   └── voice-input.spec.ts
├── coverage/
├── playwright-report/
├── test-results/
├── vitest.config.ts
└── playwright.config.ts
```

---

## 🎯 **Testing Checklist for Phase 2.1**

### **Setup Phase (Before Development)**
- [ ] Install all testing dependencies
- [ ] Create Vitest configuration
- [ ] Create Playwright configuration  
- [ ] Set up test utilities and mocks
- [ ] Configure CI/CD for automated testing
- [ ] Create initial test folder structure

### **Development Phase (During Implementation)**
- [ ] Write unit tests for each component
- [ ] Write integration tests for API connections
- [ ] Write E2E tests for user workflows
- [ ] Maintain minimum 80% code coverage
- [ ] Run tests continuously during development

### **Completion Phase (Before Phase 2.2)**
- [ ] All components have unit tests
- [ ] All API integrations have integration tests
- [ ] Critical user journeys have E2E tests
- [ ] Performance benchmarks established
- [ ] Accessibility tests passing
- [ ] All tests passing in CI/CD pipeline

---

## 🚀 **Next Steps**

1. **Create Web Application**: Initialize React + Vite + TypeScript project
2. **Install Testing Dependencies**: Add all testing packages
3. **Setup Testing Configuration**: Create all config files
4. **Implement First Component**: With corresponding tests
5. **Establish Testing Workflow**: TDD approach for all features

**Testing is now fully integrated into our development process. Every feature will be tested before marking any phase as complete!**