/**
 * AI Service for Dream Analysis
 * Provides dream interpretation, pattern analysis, and insights
 */

export interface DreamAnalysis {
  id: string;
  dreamId: string;
  interpretation: string;
  themes: string[];
  symbols: Array<{
    symbol: string;
    meaning: string;
    confidence: number;
  }>;
  emotions: Array<{
    emotion: string;
    intensity: number;
  }>;
  patterns: string[];
  suggestions: string[];
  createdAt: Date;
}

export interface AIAnalysisRequest {
  dreamContent: string;
  dreamTitle?: string;
  mood?: string;
  tags?: string[];
  previousAnalyses?: DreamAnalysis[];
}

export interface AIInsight {
  type: 'pattern' | 'symbol' | 'emotion' | 'suggestion';
  title: string;
  description: string;
  confidence: number;
  relatedDreams?: string[];
}

class AIService {
  private baseUrl: string;
  private apiKey: string | null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_AI_API_URL || 'http://localhost:3001/api/v1';
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
  }

  /**
   * Analyze a single dream for interpretation and insights
   */
  async analyzeDream(request: AIAnalysisRequest): Promise<DreamAnalysis> {
    try {
      // Try to use the API endpoint first
      try {
        const response = await fetch(`${this.baseUrl}/ai/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
          },
          body: JSON.stringify(request),
        });

        if (response.ok) {
          const analysis = await response.json();
          return {
            ...analysis,
            createdAt: new Date(analysis.createdAt),
          };
        }
      } catch (apiError) {
        console.log('API endpoint not available, using fallback analysis');
      }

      // Fallback to local analysis using enhanced AI service
      return await this.generateFallbackAnalysis(request);
    } catch (error) {
      console.error('Dream analysis failed:', error);
      throw new Error('Failed to analyze dream. Please try again later.');
    }
  }

  /**
   * Get insights across multiple dreams to identify patterns
   */
  async getPatternInsights(dreamIds: string[]): Promise<AIInsight[]> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/patterns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify({ dreamIds }),
      });

      if (!response.ok) {
        throw new Error(`Pattern analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Pattern analysis failed:', error);
      throw new Error('Failed to analyze patterns. Please try again later.');
    }
  }

  /**
   * Get personalized dream insights and suggestions
   */
  async getPersonalizedInsights(): Promise<AIInsight[]> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/insights`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Insights failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Insights failed:', error);
      throw new Error('Failed to get insights. Please try again later.');
    }
  }

  /**
   * Generate dream journal prompts based on user's dream history
   */
  async generateJournalPrompts(count: number = 3): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/prompts?count=${count}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Prompt generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.prompts;
    } catch (error) {
      console.error('Prompt generation failed:', error);
      throw new Error('Failed to generate prompts. Please try again later.');
    }
  }

  /**
   * Fallback analysis using client-side rules when AI service is unavailable
   */
  async generateFallbackAnalysis(request: AIAnalysisRequest): Promise<DreamAnalysis> {
    const dreamText = request.dreamContent.toLowerCase();
    
    // Simple keyword-based analysis
    const themes = this.extractThemes(dreamText);
    const symbols = this.extractSymbols(dreamText);
    const emotions = this.extractEmotions(dreamText, request.mood);
    
    return {
      id: `fallback-${Date.now()}`,
      dreamId: 'unknown',
      interpretation: this.generateBasicInterpretation(themes, symbols, emotions),
      themes,
      symbols,
      emotions,
      patterns: [],
      suggestions: this.generateBasicSuggestions(themes, emotions),
      createdAt: new Date(),
    };
  }

  private extractThemes(text: string): string[] {
    const themeKeywords = {
      'relationships': ['family', 'friend', 'love', 'partner', 'relationship', 'marriage'],
      'work': ['job', 'work', 'boss', 'office', 'career', 'colleague'],
      'travel': ['travel', 'journey', 'road', 'car', 'plane', 'destination'],
      'nature': ['water', 'forest', 'mountain', 'ocean', 'tree', 'animal'],
      'fear': ['fear', 'scared', 'afraid', 'anxiety', 'worry', 'panic'],
      'growth': ['learn', 'grow', 'change', 'transform', 'evolve'],
    };

    const foundThemes: string[] = [];
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        foundThemes.push(theme);
      }
    }
    return foundThemes;
  }

  private extractSymbols(text: string): Array<{ symbol: string; meaning: string; confidence: number }> {
    const symbolMeanings = {
      'water': 'Emotions, subconscious, cleansing, or life changes',
      'flying': 'Freedom, ambition, or desire to escape limitations',
      'falling': 'Loss of control, anxiety, or fear of failure',
      'house': 'Self, security, or different aspects of your personality',
      'car': 'Life direction, control, or personal drive',
      'death': 'Transformation, ending of a phase, or new beginnings',
      'baby': 'New beginnings, innocence, or potential for growth',
      'fire': 'Passion, transformation, or destruction and renewal',
    };

    const foundSymbols: Array<{ symbol: string; meaning: string; confidence: number }> = [];
    for (const [symbol, meaning] of Object.entries(symbolMeanings)) {
      if (text.includes(symbol)) {
        foundSymbols.push({
          symbol,
          meaning,
          confidence: 0.7, // Basic confidence for fallback analysis
        });
      }
    }
    return foundSymbols;
  }

  private extractEmotions(text: string, mood?: string): Array<{ emotion: string; intensity: number }> {
    const emotionKeywords = {
      'joy': ['happy', 'joy', 'excited', 'elated', 'cheerful'],
      'fear': ['scared', 'afraid', 'terrified', 'anxious', 'worried'],
      'anger': ['angry', 'mad', 'furious', 'irritated', 'frustrated'],
      'sadness': ['sad', 'depressed', 'melancholy', 'grief', 'sorrow'],
      'surprise': ['surprised', 'shocked', 'amazed', 'astonished'],
      'peace': ['calm', 'peaceful', 'serene', 'tranquil', 'relaxed'],
    };

    const foundEmotions: Array<{ emotion: string; intensity: number }> = [];
    
    // Add mood-based emotion if provided
    if (mood && mood !== 'neutral') {
      let moodEmotion = '';
      switch (mood) {
        case 'positive':
          moodEmotion = 'joy';
          break;
        case 'negative':
          moodEmotion = 'sadness';
          break;
        case 'mixed':
          foundEmotions.push({ emotion: 'confusion', intensity: 0.6 });
          break;
      }
      if (moodEmotion) {
        foundEmotions.push({ emotion: moodEmotion, intensity: 0.8 });
      }
    }

    // Extract emotions from text
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > 0) {
        foundEmotions.push({
          emotion,
          intensity: Math.min(0.9, 0.3 + (matches * 0.2)),
        });
      }
    }

    return foundEmotions;
  }

  private generateBasicInterpretation(themes: string[], symbols: Array<{ symbol: string; meaning: string; confidence: number }>, emotions: Array<{ emotion: string; intensity: number }>): string {
    let interpretation = "This dream appears to reflect ";
    
    if (emotions.length > 0) {
      const dominantEmotion = emotions.sort((a, b) => b.intensity - a.intensity)[0];
      interpretation += `${dominantEmotion.emotion} `;
    }
    
    if (themes.length > 0) {
      interpretation += `related to ${themes.join(', ')}. `;
    }
    
    if (symbols.length > 0) {
      interpretation += `The presence of symbols like ${symbols.map(s => s.symbol).join(', ')} suggests themes of transformation and personal growth.`;
    }
    
    return interpretation || "This dream contains personal symbols that may be meaningful to your current life situation.";
  }

  private generateBasicSuggestions(themes: string[], emotions: Array<{ emotion: string; intensity: number }>): string[] {
    const suggestions = [
      "Consider keeping a regular dream journal to track patterns over time.",
      "Reflect on how the emotions in your dream relate to your waking life.",
    ];
    
    if (themes.includes('fear') || emotions.some(e => e.emotion === 'fear')) {
      suggestions.push("Practice relaxation techniques before bed to promote more peaceful dreams.");
    }
    
    if (themes.includes('relationships')) {
      suggestions.push("Consider how your relationships are reflected in your dreams and what they might be telling you.");
    }
    
    return suggestions;
  }
}

export const aiService = new AIService();