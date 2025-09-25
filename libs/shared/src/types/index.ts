/**
 * Core data types for Dream Analyzer application
 */

export interface Dream {
  id: string;
  title: string;
  content: string;
  date: Date;
  tags: string[];
  mood: DreamMood;
  analysis?: DreamAnalysis;
  audioPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DreamAnalysis {
  id: string;
  dreamId: string;
  interpretation: string;
  symbols: DreamSymbol[];
  themes: string[];
  emotions: string[];
  confidence: number; // 0-1 confidence score
  generatedAt: Date;
  modelUsed: string; // AI model that generated the analysis
}

export interface DreamSymbol {
  symbol: string;
  meaning: string;
  confidence: number;
  category: SymbolCategory;
}

export type DreamMood = 'positive' | 'negative' | 'neutral' | 'mixed';

export type SymbolCategory = 
  | 'people'
  | 'animals'
  | 'objects'
  | 'places'
  | 'actions'
  | 'emotions'
  | 'colors'
  | 'numbers'
  | 'nature'
  | 'abstract';

export interface DreamEntry {
  dream: Dream;
  analysis?: DreamAnalysis;
}

// API Response types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: APIError;
  timestamp: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Search and filtering types
export interface DreamSearchParams {
  query?: string;
  mood?: DreamMood[];
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'title' | 'mood';
  sortOrder?: 'asc' | 'desc';
}

export interface DreamSearchResult {
  dreams: Dream[];
  total: number;
  hasMore: boolean;
}

// AI Service types
export interface AIAnalysisRequest {
  dreamContent: string;
  dreamTitle?: string;
  previousAnalyses?: DreamAnalysis[];
  userPreferences?: UserPreferences;
}

export interface AIAnalysisResponse {
  interpretation: string;
  symbols: DreamSymbol[];
  themes: string[];
  emotions: string[];
  confidence: number;
}

// User preferences and settings
export interface UserPreferences {
  preferredAnalysisStyle: 'detailed' | 'brief' | 'symbolic';
  culturalBackground?: string;
  languagePreference: string;
  privacyLevel: 'high' | 'medium' | 'low';
  autoAnalysis: boolean;
  voiceInputEnabled: boolean;
}

// Voice recognition types
export interface VoiceRecognitionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

export interface VoiceRecognitionError {
  code: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed';
  message: string;
}

// App state types
export interface AppState {
  user: UserPreferences | null;
  dreams: Dream[];
  currentDream: Dream | null;
  isLoading: boolean;
  error: string | null;
  aiService: {
    isAvailable: boolean;
    modelLoaded: boolean;
    currentModel: string;
  };
}

// Database entity types (for Prisma)
export interface DreamEntity {
  id: string;
  title: string;
  content: string;
  date: Date;
  tags: string; // JSON string
  mood: string;
  audioPath: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalysisEntity {
  id: string;
  dreamId: string;
  interpretation: string;
  symbols: string; // JSON string
  themes: string; // JSON string
  emotions: string; // JSON string
  confidence: number;
  modelUsed: string;
  generatedAt: Date;
}