import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { aiService, type DreamAnalysis, type AIInsight } from '../services/ai';
import type { Dream } from '../services/api';

interface AIStore {
  // State
  analyses: Record<string, DreamAnalysis>;
  insights: AIInsight[];
  journalPrompts: string[];
  isAnalyzing: boolean;
  isLoadingInsights: boolean;
  error: string | null;

  // Actions
  setAnalyzing: (analyzing: boolean) => void;
  setLoadingInsights: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAnalyses: (analyses: Record<string, DreamAnalysis>) => void;
  setInsights: (insights: AIInsight[]) => void;
  setJournalPrompts: (prompts: string[]) => void;
  
  // Async actions
  analyzeDream: (dream: Dream) => Promise<DreamAnalysis | null>;
  getPatternInsights: (dreamIds: string[]) => Promise<void>;
  loadPersonalizedInsights: () => Promise<void>;
  generateJournalPrompts: (count?: number) => Promise<void>;
  clearAnalysis: (dreamId: string) => void;
}

export const useAIStore = create<AIStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      analyses: {},
      insights: [],
      journalPrompts: [],
      isAnalyzing: false,
      isLoadingInsights: false,
      error: null,

      // Synchronous actions
      setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
      setLoadingInsights: (loading) => set({ isLoadingInsights: loading }),
      setError: (error) => set({ error }),
      setAnalyses: (analyses) => set({ analyses }),
      setInsights: (insights) => set({ insights }),
      setJournalPrompts: (prompts) => set({ journalPrompts: prompts }),

      // Async actions
      analyzeDream: async (dream: Dream) => {
        try {
          set({ isAnalyzing: true, error: null });
          
          const analysis = await aiService.analyzeDream({
            dreamContent: dream.content,
            dreamTitle: dream.title,
            mood: dream.mood,
            tags: dream.tags,
          });
          
          // Update analysis with dream ID
          analysis.dreamId = dream.id;
          
          const { analyses } = get();
          set({ 
            analyses: { ...analyses, [dream.id]: analysis },
            isAnalyzing: false 
          });
          
          return analysis;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to analyze dream';
          set({ error: errorMessage, isAnalyzing: false });
          
          // Try fallback analysis
          try {
            const fallbackAnalysis = await aiService.generateFallbackAnalysis({
              dreamContent: dream.content,
              dreamTitle: dream.title,
              mood: dream.mood,
              tags: dream.tags,
            });
            
            fallbackAnalysis.dreamId = dream.id;
            const { analyses } = get();
            set({ analyses: { ...analyses, [dream.id]: fallbackAnalysis } });
            
            return fallbackAnalysis;
          } catch {
            return null;
          }
        }
      },

      getPatternInsights: async (dreamIds: string[]) => {
        try {
          set({ isLoadingInsights: true, error: null });
          const insights = await aiService.getPatternInsights(dreamIds);
          set({ insights, isLoadingInsights: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to get pattern insights';
          set({ error: errorMessage, isLoadingInsights: false });
        }
      },

      loadPersonalizedInsights: async () => {
        try {
          set({ isLoadingInsights: true, error: null });
          const insights = await aiService.getPersonalizedInsights();
          set({ insights, isLoadingInsights: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load insights';
          set({ error: errorMessage, isLoadingInsights: false });
        }
      },

      generateJournalPrompts: async (count = 3) => {
        try {
          set({ error: null });
          const prompts = await aiService.generateJournalPrompts(count);
          set({ journalPrompts: prompts });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to generate prompts';
          set({ error: errorMessage });
        }
      },

      clearAnalysis: (dreamId: string) => {
        const { analyses } = get();
        const newAnalyses = { ...analyses };
        delete newAnalyses[dreamId];
        set({ analyses: newAnalyses });
      },
    }),
    {
      name: 'ai-store',
    }
  )
);

// Selector hooks
export const useAIAnalysis = (dreamId: string) => useAIStore((state) => state.analyses[dreamId]);
export const useAIInsights = () => useAIStore((state) => state.insights);
export const useJournalPrompts = () => useAIStore((state) => state.journalPrompts);
export const useAILoading = () => useAIStore((state) => ({ 
  isAnalyzing: state.isAnalyzing, 
  isLoadingInsights: state.isLoadingInsights 
}));
export const useAIError = () => useAIStore((state) => state.error);