# Dream Analyzer - Workspace Structure & Navigation Guide

## 📁 **ROOT DIRECTORY: G:\dreamer**

### **Key Configuration Files**
- `package.json` - Root workspace configuration
- `pnpm-workspace.yaml` - PNPM workspace definition
- `tsconfig.json` - TypeScript root configuration
- `TODO.md` - Master task list and progress tracking

### **Documentation**
- `README.md` - Project overview
- `ARCHITECTURE.md` - System architecture
- `IMPLEMENTATION_PLAN.md` - Development roadmap
- `WORKSPACE.md` - Workspace setup guide

---

## 🗂️ **APPS DIRECTORY: G:\dreamer\apps**

### **📱 WEB APPLICATION: G:\dreamer\apps\web**
**Primary Working Directory for Web Development**

#### **Key Web Files:**
- `package.json` - Web app dependencies
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript config for web
- `playwright.config.ts` - E2E testing config

#### **Web Source Directory: G:\dreamer\apps\web\src**
- `App.tsx` - Main React application
- `main.tsx` - Application entry point
- `components/` - React components
  - `__tests__/` - Component unit tests
- `pages/` - Page components
  - `__tests__/` - Page unit tests
- `services/` - API and AI services
  - `__tests__/` - Service unit tests
- `stores/` - Zustand state management
- `test/` - Testing setup and mocks
  - `setup.ts` - Test configuration
  - `mocks/handlers.ts` - MSW API mocks
- `types/` - TypeScript type definitions

#### **Web Testing Commands (from G:\dreamer\apps\web):**
```bash
npm test                # Run tests
npm run test:coverage   # Run with coverage
npm run test:watch     # Watch mode
npm run dev            # Start dev server
```

### **📱 MOBILE APPLICATION: G:\dreamer\apps\mobile**
**Primary Working Directory for Mobile Development**

#### **Key Mobile Files:**
- `package.json` - Mobile app dependencies
- `app.json` - Expo configuration
- `App.tsx` - Main React Native application
- `tsconfig.json` - TypeScript config for mobile

#### **Mobile Source Directory: G:\dreamer\apps\mobile\src**
- `Navigation.tsx` - React Navigation setup
- `components/` - React Native components
  - `DreamForm.tsx`
  - `DreamList.tsx`
  - `VoiceRecorder.tsx`
  - `DreamCamera.tsx`
- `screens/` - Screen components
  - `HomeScreen.tsx`
  - `DreamFormScreen.tsx`
  - `DreamDetailScreen.tsx`
  - `SettingsScreen.tsx`
- `services/` - Mobile services
  - `database.ts` - SQLite integration
  - `notifications.ts` - Push notifications
- `stores/` - Zustand state management
- `types/` - TypeScript type definitions

#### **Mobile Development Commands (from G:\dreamer\apps\mobile):**
```bash
npx expo start         # Start Expo dev server
npx expo install       # Install dependencies
pnpm start            # Alternative start command
```

### **🔧 API BACKEND: G:\dreamer\apps\api**
**Primary Working Directory for Backend Development**

#### **Key API Files:**
- `package.json` - API dependencies
- `tsconfig.json` - TypeScript config for API
- `vitest.config.ts` - Testing configuration

#### **API Source Directory: G:\dreamer\apps\api\src**
- `index.ts` - Fastify server entry point
- `routes/` - API route handlers
- `schemas/` - JSON validation schemas
- `services/` - Business logic services

#### **API Database: G:\dreamer\apps\api\prisma**
- `schema.prisma` - Database schema
- `migrations/` - Database migrations

#### **API Commands (from G:\dreamer\apps\api):**
```bash
npm run dev           # Start dev server
npm test             # Run API tests
npx prisma generate  # Generate Prisma client
```

---

## 📚 **LIBS DIRECTORY: G:\dreamer\libs**

### **Shared Libraries:**
- `shared/` - Common utilities and types
- `ui/` - Shared UI components
- `ai/` - AI processing utilities

---

## 🎯 **CRITICAL PATH NAVIGATION**

### **Most Common Working Directories:**

1. **Web Development**: `G:\dreamer\apps\web\src`
   - Components: `G:\dreamer\apps\web\src\components`
   - Tests: `G:\dreamer\apps\web\src\components\__tests__`
   - Services: `G:\dreamer\apps\web\src\services`

2. **Mobile Development**: `G:\dreamer\apps\mobile\src`
   - Components: `G:\dreamer\apps\mobile\src\components`
   - Screens: `G:\dreamer\apps\mobile\src\screens`
   - Services: `G:\dreamer\apps\mobile\src\services`

3. **API Development**: `G:\dreamer\apps\api\src`
   - Routes: `G:\dreamer\apps\api\src\routes`
   - Database: `G:\dreamer\apps\api\prisma`

4. **Testing**: 
   - Web Tests: `G:\dreamer\apps\web\src\**\__tests__`
   - API Tests: `G:\dreamer\apps\api\src\**\__tests__`

5. **Configuration**:
   - Root: `G:\dreamer`
   - Web Config: `G:\dreamer\apps\web`
   - Mobile Config: `G:\dreamer\apps\mobile`

---

## ⚠️ **COMMON NAVIGATION MISTAKES TO AVOID**

### **❌ Wrong Paths:**
- Running web commands from `G:\dreamer` instead of `G:\dreamer\apps\web`
- Running mobile commands from `G:\dreamer` instead of `G:\dreamer\apps\mobile`
- Looking for source files in root instead of `apps/*/src`

### **✅ Correct Navigation:**
- Web work: Always `cd G:\dreamer\apps\web` first
- Mobile work: Always `cd G:\dreamer\apps\mobile` first
- API work: Always `cd G:\dreamer\apps\api` first
- File operations: Use full absolute paths

---

## 🔄 **QUICK REFERENCE COMMANDS**

```bash
# Navigate to web app
cd G:\dreamer\apps\web

# Navigate to mobile app  
cd G:\dreamer\apps\mobile

# Navigate to API
cd G:\dreamer\apps\api

# Navigate to web source
cd G:\dreamer\apps\web\src

# Navigate to mobile source
cd G:\dreamer\apps\mobile\src

# Run web tests
cd G:\dreamer\apps\web && npm test

# Start mobile dev
cd G:\dreamer\apps\mobile && npx expo start

# Start API server
cd G:\dreamer\apps\api && npm run dev
```

---

*Remember: Always use the correct working directory for each operation to avoid confusion and wasted time!*