/**
 * Shared library exports for Dream Analyzer
 */

// Types
export * from './types';

// Validation schemas (selective export to avoid conflicts)
export {
  dreamMoodSchema,
  symbolCategorySchema,
  dreamSymbolSchema,
  dreamAnalysisSchema,
  dreamSchema,
  createDreamSchema,
  updateDreamSchema,
  dreamSearchParamsSchema,
  aiAnalysisRequestSchema,
  aiAnalysisResponseSchema,
  userPreferencesSchema,
  voiceRecognitionResultSchema,
  apiResponseSchema,
  dreamResponseSchema,
  dreamListResponseSchema,
  analysisResponseSchema,
  searchResponseSchema,
  // Type inference helpers with different names to avoid conflicts
  type CreateDreamInput,
  type UpdateDreamInput,
} from './schemas';

// Utilities
export * from './utils';

// Constants
export const APP_NAME = 'Dream Analyzer';
export const APP_VERSION = '0.1.0';
export const DEFAULT_LANGUAGE = 'en';
export const MAX_DREAM_LENGTH = 5000;
export const MAX_TITLE_LENGTH = 200;
export const MIN_DREAM_LENGTH = 10;
export const DEFAULT_ANALYSIS_CONFIDENCE_THRESHOLD = 0.7;

// AI Model constants
export const AI_MODELS = {
  OLLAMA_LLAMA: 'llama3.1:8b',
  OLLAMA_MISTRAL: 'mistral:7b',
  TRANSFORMERS_GPT2: 'gpt2',
  TRANSFORMERS_DISTILBERT: 'distilbert-base-uncased',
} as const;

// Dream categories for better organization
export const DREAM_CATEGORIES = [
  'Nightmares',
  'Lucid Dreams',
  'Recurring Dreams',
  'Prophetic Dreams',
  'Healing Dreams',
  'Creative Dreams',
  'Anxiety Dreams',
  'Adventure Dreams',
  'Relationship Dreams',
  'Work Dreams',
] as const;

// Common dream symbols with basic meanings
export const COMMON_SYMBOLS = {
  water: 'Emotions, subconscious, purification',
  flying: 'Freedom, ambition, escape from limitations',
  falling: 'Loss of control, insecurity, letting go',
  animals: 'Instincts, natural wisdom, primal emotions',
  house: 'Self, psyche, different aspects of personality',
  death: 'Transformation, end of a phase, new beginnings',
  car: 'Direction in life, personal drive, control',
  snake: 'Transformation, healing, hidden knowledge',
  fire: 'Passion, destruction, purification, energy',
  mirror: 'Self-reflection, self-awareness, truth',
} as const;