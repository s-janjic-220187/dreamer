# Testing Strategy & Configuration

## 📋 **Testing Philosophy**
> **Every feature, component, and integration point must be tested before moving to the next phase. No exceptions.**

The Dream Analysis Application follows a **Test-Driven Development (TDD)** approach where testing is integrated into every phase of development, not as an afterthought.

---

## 🧪 **Testing Standards by Phase**

### **Phase 1: Backend Infrastructure ✅ COMPLETE**
- **Status**: ✅ All requirements met
- **Coverage**: 82% automated, 100% manual validation
- **Standards Applied**: 
  - ✅ API endpoint testing (Vitest)
  - ✅ Database integration testing
  - ✅ Manual CRUD validation
  - ✅ Error handling validation

### **Phase 2: Web Application** 🎯 CURRENT
**Required Testing Setup:**
- React Testing Library + Vitest
- Playwright for E2E testing
- Component testing for all UI elements
- Integration testing for API connections
- Accessibility testing (a11y)

### **Phase 3: AI Integration** 
**Required Testing Setup:**
- Mock AI service testing
- Response validation testing
- Performance benchmarking
- Fallback mechanism testing

### **Phase 4: Mobile Application**
**Required Testing Setup:**
- React Native Testing Library
- Detox for E2E mobile testing
- Platform-specific testing
- Cross-platform synchronization testing

---

## 🎯 **Testing Categories & Requirements**

### **1. Unit Tests**
**Purpose**: Test individual functions, components, and services in isolation

**Requirements:**
- **Minimum Coverage**: 80% for business logic, 90% for critical paths
- **Framework**: Vitest (backend/utilities), React Testing Library (components)
- **Scope**: All utility functions, components, services, hooks
- **Execution**: Must pass before any commit to main branch

**Standards:**
```typescript
// Example unit test structure
describe('Component/Service Name', () => {
  describe('method/functionality', () => {
    it('should handle normal case', () => {})
    it('should handle edge cases', () => {})
    it('should handle error cases', () => {})
  })
})
```

### **2. Integration Tests**
**Purpose**: Test interactions between different parts of the application

**Requirements:**
- **Coverage**: All API endpoints, database operations, service interactions
- **Framework**: Vitest with test database, Supertest for API testing
- **Test Database**: Separate test database for each test suite
- **Execution**: Required before phase completion

**Standards:**
- Test real API calls (not mocked)
- Test database transactions and rollbacks
- Test error propagation between layers
- Test authentication and authorization flows

### **3. End-to-End (E2E) Tests**
**Purpose**: Test complete user workflows from UI to database

**Requirements:**
- **Framework**: Playwright (web), Detox (mobile)
- **Coverage**: All critical user journeys
- **Environment**: Production-like test environment
- **Execution**: Required before each release

**Critical User Journeys:**
1. **Dream Creation Flow**: Input → Validation → Save → Display
2. **Dream Analysis Flow**: Select Dream → Analyze → View Results
3. **Dream Management Flow**: Create → Edit → Delete → Search
4. **Voice Input Flow**: Activate → Record → Transcribe → Save

### **4. Performance Tests**
**Purpose**: Ensure application meets performance requirements

**Requirements:**
- **Tools**: Lighthouse (web), Profiling tools, Load testing tools
- **Metrics**: Load times, memory usage, responsiveness, throughput
- **Thresholds**: 
  - Initial load: <3 seconds
  - Interactions: <1 second
  - API responses: <500ms (95th percentile)
  - Memory usage: <100MB baseline
- **Execution**: Before optimization phases and releases

### **5. Security Tests**
**Purpose**: Ensure application is secure from common vulnerabilities

**Requirements:**
- **Scope**: Data validation, XSS prevention, CSRF protection, input sanitization
- **Tools**: Manual testing, ESLint security rules, dependency scanning
- **Coverage**: All user inputs, all API endpoints, all data storage
- **Execution**: Required before any deployment

---

## ⚙️ **Testing Configuration Files**

### **Backend Testing (Vitest + Supertest)**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
```

### **Frontend Testing (Vitest + React Testing Library)**
```typescript
// vitest.config.ts (web)
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    }
  }
})
```

### **E2E Testing (Playwright)**
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
})
```

---

## 🔄 **Testing Workflow & Automation**

### **Development Workflow**
1. **Write Tests First** (TDD approach)
2. **Implement Feature** to pass tests
3. **Run Tests Locally** before commit
4. **CI/CD Pipeline** runs all tests automatically
5. **Quality Gates** prevent merge if tests fail

### **CI/CD Integration**
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test:unit
      - run: pnpm test:integration
      - run: pnpm test:e2e
      - run: pnpm test:coverage
```

### **Test Commands**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run --reporter=verbose src/**/*.test.ts",
    "test:integration": "vitest run --reporter=verbose src/**/*.integration.test.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "pnpm test:unit && pnpm test:integration && pnpm test:e2e"
  }
}
```

---

## 📊 **Testing Metrics & Reporting**

### **Required Metrics**
- **Code Coverage**: Minimum 80% (business logic 90%)
- **Test Pass Rate**: 100% before merge
- **Performance Benchmarks**: All thresholds met
- **Security Scan**: No high/critical vulnerabilities
- **Accessibility Score**: Minimum 95% (WCAG AA)

### **Quality Gates**
- ❌ **Cannot merge** if coverage < 80%
- ❌ **Cannot deploy** if E2E tests fail
- ❌ **Cannot release** if performance thresholds not met
- ❌ **Cannot deploy** if security vulnerabilities found

### **Reporting**
- **Coverage Reports**: Generated automatically, stored in `/coverage`
- **Test Reports**: HTML reports for E2E tests
- **Performance Reports**: Lighthouse CI reports
- **Security Reports**: Dependency and code security scans

---

## 🎯 **Phase-Specific Testing Requirements**

### **Phase 2.1: Web App Foundation**
**Must Complete Before Phase 2.2:**
- [ ] Component unit tests for all UI components
- [ ] Router integration tests
- [ ] State management tests (Zustand)
- [ ] Responsive design tests
- [ ] Accessibility tests
- [ ] Build process validation

### **Phase 2.2: Core Web Features**
**Must Complete Before Phase 2.3:**
- [ ] Form validation tests (all scenarios)
- [ ] API integration tests (with mock and real API)
- [ ] User interaction E2E tests
- [ ] Search functionality tests
- [ ] Performance tests (rendering, pagination)
- [ ] Error handling tests

### **Phase 2.3: Voice Recognition**
**Must Complete Before Phase 2.4:**
- [ ] Browser compatibility tests
- [ ] Permission handling tests  
- [ ] Voice API mock tests
- [ ] Fallback mechanism tests
- [ ] Audio quality validation tests

---

## 🔧 **Testing Tools & Dependencies**

### **Backend Testing Stack**
- **Vitest**: Test runner and assertion library
- **Supertest**: HTTP assertion library
- **Prisma Test Client**: Database testing utilities
- **MSW**: Mock Service Worker for API mocking

### **Frontend Testing Stack**
- **Vitest**: Test runner (faster than Jest)
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Custom DOM matchers
- **@testing-library/user-event**: User interaction simulation

### **E2E Testing Stack**
- **Playwright**: Cross-browser E2E testing
- **@playwright/test**: Playwright test runner
- **Playwright HTML Reporter**: Test result reporting

### **Additional Tools**
- **ESLint**: Code quality and security linting
- **Lighthouse CI**: Performance and accessibility testing
- **Dependabot**: Dependency vulnerability scanning
- **Codecov**: Coverage reporting and tracking

---

## 📝 **Testing Best Practices**

### **Test Organization**
```
src/
├── components/
│   ├── DreamForm/
│   │   ├── DreamForm.tsx
│   │   ├── DreamForm.test.tsx          # Unit tests
│   │   └── DreamForm.integration.test.tsx # Integration tests
├── services/
│   ├── api.ts
│   ├── api.test.ts                     # Unit tests
│   └── api.integration.test.ts         # Integration tests
├── e2e/
│   ├── dream-creation.spec.ts          # E2E tests
│   └── dream-analysis.spec.ts          # E2E tests
└── test/
    ├── setup.ts                        # Test setup
    ├── mocks.ts                        # Mock data
    └── utils.ts                        # Test utilities
```

### **Writing Good Tests**
1. **Descriptive Names**: Test names should explain what is being tested
2. **Arrange-Act-Assert**: Clear test structure
3. **Test Behavior, Not Implementation**: Focus on what, not how
4. **One Assertion Per Test**: Each test should verify one thing
5. **Independent Tests**: Tests should not depend on each other
6. **Mock External Dependencies**: Only test your own code

### **Test Data Management**
- Use factories for creating test data
- Clean up test data after each test
- Use separate test database
- Seed consistent test data for E2E tests

---

## ✅ **Phase Completion Checklist**

Before marking any phase as complete, verify:

- [ ] **All Features Implemented**: Per phase requirements
- [ ] **Unit Tests Written**: All new code covered
- [ ] **Integration Tests Passing**: All service interactions tested  
- [ ] **E2E Tests Written**: Critical user journeys covered
- [ ] **Performance Tests Pass**: All benchmarks met
- [ ] **Security Tests Complete**: No vulnerabilities found
- [ ] **Code Coverage Meets Threshold**: Minimum 80% overall
- [ ] **Documentation Updated**: Testing approach documented
- [ ] **CI/CD Pipeline Passes**: All automated tests green
- [ ] **Manual Testing Complete**: User acceptance testing done

**Only when ALL items are checked can the phase be marked as ✅ COMPLETE**

---

*This testing strategy ensures that we build a robust, reliable, and maintainable dream analysis application with confidence at every phase of development.*