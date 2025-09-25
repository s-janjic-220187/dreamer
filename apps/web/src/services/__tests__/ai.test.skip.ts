import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiService } from '../ai';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AIService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeDream', () => {
    it('should handle API request correctly', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          id: '1',
          dreamId: 'dream-1',
          interpretation: 'Test interpretation',
          themes: ['flying'],
          symbols: [{ name: 'wings', meaning: 'freedom' }],
          emotions: [{ emotion: 'joy', intensity: 0.8 }],
          createdAt: new Date().toISOString()
        })
      };
      
      mockFetch.mockResolvedValueOnce(mockResponse);

      const request = {
        dreamContent: 'I was flying',
        dreamTitle: 'Flying Dream',
        mood: 'positive',
        tags: ['flying']
      };

      const result = await aiService.analyzeDream(request);

      expect(result).toBeDefined();
      expect(result.themes).toContain('flying');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai/analyze'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should handle API failure gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = {
        dreamContent: 'I was flying',
        dreamTitle: 'Flying Dream'
      };

      await expect(aiService.analyzeDream(request)).rejects.toThrow('Failed to analyze dream');
    });
  });

  describe('getPatternInsights', () => {
    it('should fetch pattern insights for given dream IDs', async () => {
      const mockInsights = [
        {
          type: 'pattern' as const,
          title: 'Flying Dreams',
          description: 'You often dream about flying',
          confidence: 0.8
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockInsights
      });

      const result = await aiService.getPatternInsights(['dream-1', 'dream-2']);

      expect(result).toEqual(mockInsights);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai/patterns'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ dreamIds: ['dream-1', 'dream-2'] })
        })
      );
    });

    it('should handle empty dream IDs array', async () => {
      const result = await aiService.getPatternInsights([]);
      expect(result).toEqual([]);
    });
  });

  describe('generateJournalPrompts', () => {
    it('should generate specified number of prompts', async () => {
      const mockPrompts = ['Prompt 1', 'Prompt 2', 'Prompt 3'];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ prompts: mockPrompts })
      });

      const result = await aiService.generateJournalPrompts(3);

      expect(result).toEqual(mockPrompts);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai/journal-prompts'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ count: 3 })
        })
      );
    });
  });
});