/**
 * Zod validation schemas for Dream Analyzer
 */

import { z } from 'zod';

// Base schemas
export const dreamMoodSchema = z.enum(['positive', 'negative', 'neutral', 'mixed']);

export const symbolCategorySchema = z.enum([
  'people',
  'animals', 
  'objects',
  'places',
  'actions',
  'emotions',
  'colors',
  'numbers',
  'nature',
  'abstract'
]);

// Dream schemas
export const dreamSymbolSchema = z.object({
  symbol: z.string().min(1).max(100),
  meaning: z.string().min(1).max(500),
  confidence: z.number().min(0).max(1),
  category: symbolCategorySchema,
});

export const dreamAnalysisSchema = z.object({
  id: z.string().uuid(),
  dreamId: z.string().uuid(),
  interpretation: z.string().min(10).max(2000),
  symbols: z.array(dreamSymbolSchema),
  themes: z.array(z.string().min(1).max(50)),
  emotions: z.array(z.string().min(1).max(50)),
  confidence: z.number().min(0).max(1),
  generatedAt: z.date(),
  modelUsed: z.string().min(1).max(100),
});

export const dreamSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  content: z.string().min(10).max(5000),
  date: z.date(),
  tags: z.array(z.string().min(1).max(50)),
  mood: dreamMoodSchema,
  analysis: dreamAnalysisSchema.optional(),
  audioPath: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// API request/response schemas
export const createDreamSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10).max(5000),
  date: z.date().optional().default(() => new Date()),
  tags: z.array(z.string().min(1).max(50)).default([]),
  mood: dreamMoodSchema.default('neutral'),
  audioPath: z.string().optional(),
});

export const updateDreamSchema = createDreamSchema.partial().extend({
  id: z.string().uuid(),
});

export const dreamSearchParamsSchema = z.object({
  query: z.string().optional(),
  mood: z.array(dreamMoodSchema).optional(),
  tags: z.array(z.string()).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  sortBy: z.enum(['date', 'title', 'mood']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// AI service schemas
export const aiAnalysisRequestSchema = z.object({
  dreamContent: z.string().min(10).max(5000),
  dreamTitle: z.string().min(1).max(200).optional(),
  previousAnalyses: z.array(dreamAnalysisSchema).optional(),
  userPreferences: z.object({
    preferredAnalysisStyle: z.enum(['detailed', 'brief', 'symbolic']).default('detailed'),
    culturalBackground: z.string().optional(),
    languagePreference: z.string().default('en'),
    privacyLevel: z.enum(['high', 'medium', 'low']).default('high'),
  }).optional(),
});

export const aiAnalysisResponseSchema = z.object({
  interpretation: z.string().min(10).max(2000),
  symbols: z.array(dreamSymbolSchema),
  themes: z.array(z.string().min(1).max(50)),
  emotions: z.array(z.string().min(1).max(50)),
  confidence: z.number().min(0).max(1),
});

// User preferences schema
export const userPreferencesSchema = z.object({
  preferredAnalysisStyle: z.enum(['detailed', 'brief', 'symbolic']).default('detailed'),
  culturalBackground: z.string().optional(),
  languagePreference: z.string().default('en'),
  privacyLevel: z.enum(['high', 'medium', 'low']).default('high'),
  autoAnalysis: z.boolean().default(true),
  voiceInputEnabled: z.boolean().default(true),
});

// Voice recognition schemas
export const voiceRecognitionResultSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1),
  isFinal: z.boolean(),
});

// API response wrapper schema
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.unknown()).optional(),
    }).optional(),
    timestamp: z.string().datetime(),
  });

// Export common response types
export const dreamResponseSchema = apiResponseSchema(dreamSchema);
export const dreamListResponseSchema = apiResponseSchema(z.array(dreamSchema));
export const analysisResponseSchema = apiResponseSchema(dreamAnalysisSchema);
export const searchResponseSchema = apiResponseSchema(z.object({
  dreams: z.array(dreamSchema),
  total: z.number(),
  hasMore: z.boolean(),
}));

// Type inference helpers
export type CreateDreamInput = z.infer<typeof createDreamSchema>;
export type UpdateDreamInput = z.infer<typeof updateDreamSchema>;
export type DreamSearchParams = z.infer<typeof dreamSearchParamsSchema>;
export type AIAnalysisRequest = z.infer<typeof aiAnalysisRequestSchema>;
export type AIAnalysisResponse = z.infer<typeof aiAnalysisResponseSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type VoiceRecognitionResult = z.infer<typeof voiceRecognitionResultSchema>;