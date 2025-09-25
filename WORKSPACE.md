# Dream Analyzer - Development Workspace

This workspace is configured for the **Dream Analyzer** project - a cross-platform dream interpretation application.

## � **CRITICAL - WORKING DIRECTORIES**

**⚠️ Always navigate to correct directory before running commands!**

### **Web Development:**
```bash
cd G:\dreamer\apps\web          # Web app commands
npm test                        # Run web tests
npm run dev                     # Start web dev server
npm run test:coverage          # Test coverage
```

### **Mobile Development:**
```bash
cd G:\dreamer\apps\mobile       # Mobile app commands  
npx expo start                  # Start Expo dev server
npx expo install               # Install mobile deps
```

### **API Development:**
```bash
cd G:\dreamer\apps\api          # API commands
npm run dev                     # Start API server
npm test                        # Run API tests
npx prisma generate            # Generate Prisma client
```

### **Root Level (Workspace):**
```bash
cd G:\dreamer                   # Root workspace
pnpm install                    # Install all dependencies
```

## 🏗️ Architecture Overview

**Monorepo Structure:**
- `apps/web/` - React web application
- `apps/mobile/` - React Native mobile app  
- `apps/api/` - Node.js Fastify backend
- `libs/shared/` - Shared TypeScript logic
- `libs/ui/` - Universal UI components
- `libs/ai/` - AI processing services

## 🎯 Key Features
- **Dream Analysis**: AI-powered interpretation using local models
- **Voice Input**: Speech-to-text for dream entry
- **Dream Journal**: Timeline with search and filtering
- **Cross-Platform**: Web browser + Android app
- **Privacy-First**: All processing happens locally

## 🔧 Technology Stack
- **Frontend**: React + React Native + TypeScript
- **Backend**: Node.js + Fastify + Prisma + SQLite
- **AI**: Ollama (Llama 3.1) + Transformers.js fallback
- **UI**: Tamagui universal components
- **Tools**: Vite + Nx + pnpm

## 📚 Documentation
- **README.md** - Project overview and features
- **ARCHITECTURE.md** - Technical architecture decisions
- **IMPLEMENTATION_PLAN.md** - Development roadmap
- **.copilot-instructions.md** - Coding guidelines for AI assistance

## 🚀 Development Status
**MAJOR PROGRESS ACHIEVED:**
- ✅ **Phase 1-3**: Backend, Web App, AI Integration Complete
- ✅ **Phase 4.1-4.3**: Complete Mobile App with Advanced Features  
- ✅ **Phase 6.1-6.2**: Testing Infrastructure (100% test pass rate)

**Current Status**: Ready for deployment and final optimization phases.

## 📍 **NAVIGATION MEMORY FOR AI ASSISTANT**

**Most Common File Paths:**
- Web components: `G:\dreamer\apps\web\src\components\`
- Web tests: `G:\dreamer\apps\web\src\components\__tests__\`
- Mobile components: `G:\dreamer\apps\mobile\src\components\`
- Mobile screens: `G:\dreamer\apps\mobile\src\screens\`
- API routes: `G:\dreamer\apps\api\src\routes\`
- Shared types: `G:\dreamer\libs\shared\src\`

**Command Execution Rules:**
1. Web commands → `cd G:\dreamer\apps\web` first
2. Mobile commands → `cd G:\dreamer\apps\mobile` first  
3. API commands → `cd G:\dreamer\apps\api` first
4. File operations → Use full absolute paths
5. Tests → Always run from respective app directory

---
*This workspace uses GitHub Copilot with project-specific context for enhanced development assistance.*