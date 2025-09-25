# Dream Analyzer - Cross-Platform Dream Interpretation App

A comprehensive application that analyzes dreams using AI and provides symbolic interpretations. Works on both web browsers and Android devices.

> 🧪 **Test-Driven Development**: This project follows comprehensive testing standards with integrated testing at every development phase.

## 🌟 Features

- **Dream Input**: Voice-to-text and manual text input
- **AI Analysis**: Intelligent dream interpretation using open-source AI models
- **Dream Journal**: Save dreams with timestamps and references
- **Cross-Platform**: Web app and Android application
- **Offline Capability**: Local AI processing for privacy
- **Search & Filter**: Find past dreams and analyses

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────┐
│             Frontend Layer              │
├─────────────────┬───────────────────────┤
│   Web App       │    Android App        │
│   (React)       │    (React Native)     │
└─────────────────┴───────────────────────┘
┌─────────────────────────────────────────┐
│          Shared Business Logic          │
│         (TypeScript/JavaScript)         │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│             Backend Layer               │
├─────────────────┬───────────────────────┤
│   API Server    │    Local Storage      │
│   (Node.js/     │    (SQLite/IndexedDB) │
│    Express)     │                       │
└─────────────────┴───────────────────────┘
┌─────────────────────────────────────────┐
│            AI/ML Layer                  │
├─────────────────┬───────────────────────┤
│  Local AI Model │   Voice Recognition   │
│  (Ollama/       │   (Web Speech API/    │
│   Transformers) │    React Native Voice)│
└─────────────────┴───────────────────────┘
```

## 🛠 Technology Stack

### Frontend
- **Web**: React + TypeScript + Vite
- **Mobile**: React Native + TypeScript
- **UI Framework**: Tamagui (universal components)
- **State Management**: Zustand
- **Routing**: React Router (web) / React Navigation (mobile)

### Backend
- **API Server**: Node.js + Express + TypeScript
- **Database**: SQLite (local) + Prisma ORM
- **File Storage**: Local filesystem

### AI/ML
- **Text Analysis**: Ollama (local) or Hugging Face Transformers
- **Voice Recognition**: 
  - Web: Web Speech API
  - Mobile: React Native Voice
- **Model**: Llama 2/3 or CodeLlama for dream interpretation

### Development Tools
- **Monorepo**: Nx or Turborepo
- **Package Manager**: pnpm
- **Bundler**: Vite (web) + Metro (React Native)
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier + TypeScript

## 📱 Platform-Specific Features

### Web App
- Progressive Web App (PWA) capabilities
- Offline functionality with service workers
- Responsive design for desktop and mobile browsers
- Web Share API for sharing dreams

### Android App
- Native Android features integration
- Background sync capabilities
- Push notifications for dream reminders
- Device storage optimization

## 🔒 Privacy & Security

- **Local Processing**: AI analysis runs locally (no data sent to external servers)
- **Data Encryption**: Dreams stored with encryption
- **User Control**: Export/import functionality
- **No Tracking**: Complete privacy-first approach

## 📊 Data Models

### Dream Entry
```typescript
interface Dream {
  id: string;
  title: string;
  content: string;
  date: Date;
  tags: string[];
  mood: 'positive' | 'negative' | 'neutral';
  analysis: DreamAnalysis;
  audioPath?: string;
}
```

### Dream Analysis
```typescript
interface DreamAnalysis {
  id: string;
  dreamId: string;
  interpretation: string;
  symbols: Symbol[];
  themes: string[];
  confidence: number;
  generatedAt: Date;
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd dreamer

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### Development
```bash
# Start API server only
pnpm dev:api

# Start web app only (when implemented)
pnpm dev:web

# Build all packages
pnpm build
```

## 🧪 Testing

This project follows a comprehensive **Test-Driven Development (TDD)** approach with integrated testing at every phase.

### Testing Commands
```bash
# Run all tests
pnpm test:all

# Unit tests only
pnpm test:unit

# Integration tests only
pnpm test:integration

# End-to-end tests only
pnpm test:e2e

# Test with coverage
pnpm test:coverage

# Watch mode for development
pnpm test:watch
```

### Testing Documentation
- **[Testing Strategy](./TESTING_STRATEGY.md)** - Comprehensive testing approach
- **[Phase 2 Testing Setup](./TESTING_SETUP_PHASE2.md)** - Web app testing configuration
- **[Testing Report](./TESTING_REPORT.md)** - Phase 1 testing results

### Development Documentation
- **[Development Log](./DEVELOPMENT_LOG.md)** - Complete development history and implementation details
- **[Implementation Plan](./IMPLEMENTATION_PLAN.md)** - Detailed development phases and setup
- **[Architecture](./ARCHITECTURE.md)** - System architecture and design decisions

### Testing Standards
- **Minimum Coverage**: 80% (business logic 90%)
- **Quality Gates**: All tests must pass before merge
- **Testing Types**: Unit, Integration, E2E, Performance, Security
- **Frameworks**: Vitest, React Testing Library, Playwright

## 📚 Documentation

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed development phases and setup instructions.

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details.