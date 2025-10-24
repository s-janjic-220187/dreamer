import type {
    AIAnalysisRequest,
    AIInsight,
    Dream,
    DreamAnalysis
} from '@dreamer/shared';

import type {
    DreamSymbol,
    SymbolCategory
} from '@dreamer/shared';

export interface OpenAIAnalysisResponse {
    interpretation: string;
    themes: string[];
    symbols: Array<{
        symbol: string;
        meaning: string;
        confidence: number;
        category: SymbolCategory;
    }>;
    emotions: string[];
    patterns: string[];
    suggestions: string[];
}

// Extended DreamAnalysis interface for AI service
export interface ExtendedDreamAnalysis extends Omit<DreamAnalysis, 'generatedAt' | 'modelUsed'> {
    patterns: string[];
    suggestions: string[];
    createdAt: Date;
}

import env from '../config/env';

export class AIService {
    private openaiApiKey: string | null;
    private openaiBaseUrl: string;

    constructor() {
        this.openaiApiKey = env.OPENAI_API_KEY;
        this.openaiBaseUrl = 'https://api.openai.com/v1';
    }

    /**
     * Analyze a dream using OpenAI API
     */
    async analyzeDream(request: AIAnalysisRequest): Promise<ExtendedDreamAnalysis> {
        try {
            // Try OpenAI API first if available
            if (this.openaiApiKey) {
                return await this.analyzeWithOpenAI(request);
            }

            // Fallback to enhanced local analysis
            return await this.generateEnhancedLocalAnalysis(request);
        } catch (error) {
            console.error('AI analysis failed:', error);
            // Always fallback to local analysis if AI service fails
            return await this.generateEnhancedLocalAnalysis(request);
        }
    }

    /**
     * Analyze using OpenAI API
     */
    private async analyzeWithOpenAI(request: AIAnalysisRequest): Promise<ExtendedDreamAnalysis> {
        const prompt = this.createAnalysisPrompt(request);

        const response = await fetch(`${this.openaiBaseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.openaiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert dream analyst. Provide detailed, psychological interpretations of dreams in JSON format.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No response from OpenAI');
        }

        // Parse the JSON response
        const analysisData = JSON.parse(content) as OpenAIAnalysisResponse;

        return {
            id: `ai-${Date.now()}`,
            dreamId: request.dreamId || 'unknown',
            interpretation: analysisData.interpretation,
            themes: analysisData.themes,
            symbols: analysisData.symbols,
            emotions: analysisData.emotions,
            confidence: 0.85, // High confidence for AI analysis
            patterns: analysisData.patterns,
            suggestions: analysisData.suggestions,
            createdAt: new Date(),
        };
    }

    /**
     * Generate enhanced local analysis when AI service is unavailable
     */
    private async generateEnhancedLocalAnalysis(request: AIAnalysisRequest): Promise<ExtendedDreamAnalysis> {
        const dreamText = request.dreamContent.toLowerCase();

        // Enhanced analysis using sophisticated algorithms
        const themes = this.extractThemes(dreamText);
        const symbols = this.extractSymbols(dreamText);
        const emotions = this.extractEmotions(dreamText, request.mood);
        const patterns = this.identifyPatterns(dreamText, request.previousAnalyses);
        const suggestions = this.generateSuggestions(themes, emotions, symbols);

        return {
            id: `local-${Date.now()}`,
            dreamId: request.dreamId || 'unknown',
            interpretation: this.generateInterpretation(themes, symbols, emotions, patterns),
            confidence: 0.75, // Good confidence for local analysis
            themes,
            symbols,
            emotions,
            patterns,
            suggestions,
            createdAt: new Date(),
        };
    }

    /**
     * Create structured prompt for OpenAI
     */
    private createAnalysisPrompt(request: AIAnalysisRequest): string {
        return `
    Analyze this dream and provide a JSON response with the following structure:
    {
      "interpretation": "detailed psychological interpretation",
      "themes": ["theme1", "theme2", "theme3"],
      "symbols": [{"symbol": "symbolName", "meaning": "symbolic meaning", "confidence": 0.8}],
      "emotions": [{"emotion": "emotionName", "intensity": 0.7}],
      "patterns": ["pattern1", "pattern2"],
      "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
    }

    Dream Title: ${request.dreamTitle || 'Untitled'}
    Dream Content: ${request.dreamContent}
    Dreamer's Mood: ${request.mood || 'neutral'}
    Dream Tags: ${request.tags?.join(', ') || 'none'}

    Focus on psychological insights, symbolic meanings, and practical suggestions for personal growth.
    `;
    }

    /**
     * Extract themes from dream content
     */
    private extractThemes(dreamText: string): string[] {
        const themeKeywords = {
            'transformation': ['change', 'transform', 'evolve', 'metamorphosis', 'butterfly', 'cocoon'],
            'freedom': ['flying', 'soar', 'escape', 'liberate', 'free', 'wings', 'bird'],
            'fear': ['scared', 'afraid', 'terror', 'nightmare', 'anxious', 'panic'],
            'relationships': ['family', 'friend', 'love', 'partner', 'mother', 'father', 'child'],
            'achievement': ['success', 'win', 'accomplish', 'goal', 'victory', 'triumph'],
            'loss': ['death', 'gone', 'lost', 'missing', 'disappeared', 'farewell'],
            'nature': ['forest', 'ocean', 'mountain', 'tree', 'animal', 'earth', 'sky'],
            'journey': ['travel', 'path', 'road', 'journey', 'destination', 'adventure'],
            'conflict': ['fight', 'war', 'battle', 'struggle', 'argument', 'conflict'],
            'healing': ['medicine', 'doctor', 'heal', 'recovery', 'wellness', 'cure']
        };

        const themes: string[] = [];

        for (const [theme, keywords] of Object.entries(themeKeywords)) {
            if (keywords.some(keyword => dreamText.includes(keyword))) {
                themes.push(theme);
            }
        }

        return themes.length > 0 ? themes : ['personal-reflection'];
    }

    /**
     * Extract symbols from dream content
     */
    private extractSymbols(dreamText: string): DreamSymbol[] {
        const symbolMeanings = {
            'water': { meaning: 'Emotions, subconscious, purification', confidence: 0.9, category: 'nature' as SymbolCategory },
            'flying': { meaning: 'Freedom, transcendence, breaking limitations', confidence: 0.9, category: 'actions' as SymbolCategory },
            'house': { meaning: 'Self, psyche, different aspects of personality', confidence: 0.8, category: 'places' as SymbolCategory },
            'animals': { meaning: 'Instincts, natural impulses, aspects of self', confidence: 0.8, category: 'animals' as SymbolCategory },
            'death': { meaning: 'Transformation, end of a phase, new beginnings', confidence: 0.7, category: 'abstract' as SymbolCategory },
            'fire': { meaning: 'Passion, transformation, destruction and renewal', confidence: 0.8, category: 'nature' as SymbolCategory },
            'bridge': { meaning: 'Transition, connection, overcoming obstacles', confidence: 0.8, category: 'objects' as SymbolCategory },
            'mirror': { meaning: 'Self-reflection, truth, self-awareness', confidence: 0.7, category: 'objects' as SymbolCategory },
            'door': { meaning: 'Opportunities, transitions, new possibilities', confidence: 0.7, category: 'objects' as SymbolCategory },
            'car': { meaning: 'Direction in life, personal drive, control', confidence: 0.6, category: 'objects' as SymbolCategory }
        };

        const symbols: DreamSymbol[] = [];

        for (const [symbol, data] of Object.entries(symbolMeanings)) {
            if (dreamText.includes(symbol)) {
                symbols.push({
                    symbol,
                    meaning: data.meaning,
                    confidence: data.confidence,
                    category: data.category
                });
            }
        }

        return symbols;
    }

    /**
     * Extract emotions from dream content and mood
     */
    private extractEmotions(dreamText: string, mood?: string): string[] {
        const emotionKeywords = {
            'joy': ['happy', 'joy', 'excited', 'delighted', 'cheerful'],
            'fear': ['scared', 'afraid', 'terrified', 'anxious', 'worried'],
            'anger': ['angry', 'furious', 'rage', 'annoyed', 'frustrated'],
            'sadness': ['sad', 'depressed', 'melancholy', 'grief', 'sorrow'],
            'love': ['love', 'affection', 'tenderness', 'caring', 'compassion'],
            'curiosity': ['curious', 'wonder', 'explore', 'discover', 'investigate'],
            'peace': ['calm', 'peaceful', 'serene', 'tranquil', 'relaxed']
        };

        const emotions: string[] = [];

        // Extract emotions from text
        for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            if (keywords.some(keyword => dreamText.includes(keyword))) {
                emotions.push(emotion);
            }
        }

        // Add emotion based on mood if provided
        if (mood && !emotions.includes(mood)) {
            emotions.push(mood);
        }

        return emotions.length > 0 ? emotions : ['neutral'];
    }

    /**
     * Identify patterns across dreams
     */
    private identifyPatterns(dreamText: string, previousAnalyses?: DreamAnalysis[]): string[] {
        const patterns: string[] = [];

        if (!previousAnalyses || previousAnalyses.length === 0) {
            return patterns;
        }

        // Check for recurring themes
        const currentThemes = this.extractThemes(dreamText);
        const previousThemes = previousAnalyses.flatMap(a => a.themes);

        for (const theme of currentThemes) {
            if (previousThemes.filter(pt => pt === theme).length >= 2) {
                patterns.push(`recurring-${theme}`);
            }
        }

        // Check for recurring symbols
        const currentSymbols = this.extractSymbols(dreamText).map(s => s.symbol);
        const previousSymbols = previousAnalyses.flatMap(a => a.symbols.map(s => s.symbol));

        for (const symbol of currentSymbols) {
            if (previousSymbols.filter(ps => ps === symbol).length >= 2) {
                patterns.push(`recurring-${symbol}-symbol`);
            }
        }

        return patterns;
    }

    /**
     * Generate suggestions based on analysis
     */
    private generateSuggestions(themes: string[], emotions: string[], symbols: DreamSymbol[]): string[] {
        const suggestions: string[] = [];

        // Theme-based suggestions
        if (themes.includes('fear')) {
            suggestions.push('Consider exploring what fears in your waking life might be manifesting in your dreams');
        }
        if (themes.includes('transformation')) {
            suggestions.push('This dream may indicate you\'re ready for positive changes in your life');
        }
        if (themes.includes('relationships')) {
            suggestions.push('Reflect on your current relationships and how they might be affecting your subconscious');
        }

        // Emotion-based suggestions
        if (emotions.includes('fear')) {
            suggestions.push('Practice relaxation techniques before sleep to reduce anxiety dreams');
        }
        if (emotions.includes('joy')) {
            suggestions.push('This positive dream energy can be channeled into your daily activities');
        }

        // Symbol-based suggestions
        if (symbols.some(s => s.symbol === 'flying')) {
            suggestions.push('Flying dreams often represent a desire for freedom - consider what restrictions you want to overcome');
        }
        if (symbols.some(s => s.symbol === 'water')) {
            suggestions.push('Water in dreams relates to emotions - pay attention to your emotional well-being');
        }

        // General suggestions
        suggestions.push('Keep a dream journal to track patterns and recurring themes');
        suggestions.push('Consider what recent life events might have influenced this dream');

        return suggestions.slice(0, 4); // Limit to 4 suggestions
    }

    /**
     * Generate comprehensive interpretation
     */
    private generateInterpretation(themes: string[], symbols: DreamSymbol[], emotions: string[], patterns: string[]): string {
        let interpretation = 'This dream appears to represent ';

        // Add emotional context
        if (emotions.length > 0) {
            const dominantEmotion = emotions[0]; // First emotion found
            interpretation += `${dominantEmotion} feelings and `;
        }

        // Add thematic analysis
        if (themes.length > 0) {
            interpretation += `themes related to ${themes.slice(0, 2).join(' and ')}. `;
        }

        // Add symbolic interpretation
        if (symbols.length > 0) {
            const primarySymbol = symbols.sort((a, b) => b.confidence - a.confidence)[0];
            interpretation += `The presence of ${primarySymbol.symbol} suggests ${primarySymbol.meaning.toLowerCase()}. `;
        }

        // Add pattern analysis
        if (patterns.length > 0) {
            interpretation += `This dream shows recurring patterns that may indicate ongoing psychological themes or life situations that need attention. `;
        }

        // Add concluding insight
        interpretation += 'Consider how these dream elements might relate to your current life circumstances and personal growth journey.';

        return interpretation;
    }

    /**
     * Analyze patterns across multiple dreams
     */
    async getPatternInsights(dreams: Dream[]): Promise<AIInsight[]> {
        const insights: AIInsight[] = [];

        if (dreams.length < 2) {
            return insights;
        }

        // Analyze theme patterns
        const allThemes = dreams.flatMap(dream => {
            if (dream.analysis) {
                return dream.analysis.themes;
            }
            return this.extractThemes(dream.content.toLowerCase());
        });

        const themeFrequency = this.getFrequencyMap(allThemes);
        const recurringThemes = Object.entries(themeFrequency)
            .filter(([_, count]) => count >= 2)
            .sort(([, a], [, b]) => b - a);

        if (recurringThemes.length > 0) {
            const [topTheme, count] = recurringThemes[0];
            insights.push({
                type: 'pattern',
                title: `Recurring Theme: ${topTheme}`,
                description: `This theme appears in ${count} of your recent dreams, suggesting it's significant in your current life`,
                confidence: Math.min(0.9, count / dreams.length),
                relatedDreams: dreams.filter(d =>
                    d.analysis?.themes.includes(topTheme) ||
                    this.extractThemes(d.content.toLowerCase()).includes(topTheme)
                ).map(d => d.id)
            });
        }

        // Analyze emotional patterns
        const emotions = dreams.flatMap(dream => {
            if (dream.analysis) {
                return dream.analysis.emotions; // emotions are already strings
            }
            return [dream.mood];
        });

        const emotionFrequency = this.getFrequencyMap(emotions);
        const dominantEmotion = Object.entries(emotionFrequency)
            .sort(([, a], [, b]) => b - a)[0];

        if (dominantEmotion) {
            const [emotion, count] = dominantEmotion;
            insights.push({
                type: 'emotion',
                title: `Emotional Pattern: ${emotion}`,
                description: `${emotion} emotions are prominent in your dreams, reflecting your current emotional state`,
                confidence: count / dreams.length,
                relatedDreams: dreams.filter(d => d.mood === emotion || d.analysis?.emotions.includes(emotion)).map(d => d.id)
            });
        }

        return insights;
    }

    /**
     * Get personalized insights based on user's dream history
     */
    async getPersonalizedInsights(dreams: Dream[]): Promise<AIInsight[]> {
        const insights: AIInsight[] = [];

        if (dreams.length === 0) {
            return insights;
        }

        // Dream frequency analysis
        const dreamDates = dreams.map(d => new Date(d.date)).sort((a, b) => a.getTime() - b.getTime());
        if (dreamDates.length >= 3) {
            const daysBetweenDreams = this.calculateAverageDaysBetween(dreamDates);

            if (daysBetweenDreams <= 2) {
                insights.push({
                    type: 'suggestion',
                    title: 'High Dream Activity',
                    description: 'You\'re experiencing frequent vivid dreams. This could indicate increased creativity or emotional processing.',
                    confidence: 0.7
                });
            } else if (daysBetweenDreams >= 7) {
                insights.push({
                    type: 'suggestion',
                    title: 'Infrequent Dream Recall',
                    description: 'Consider keeping a dream journal by your bed to improve dream recall and gain more insights.',
                    confidence: 0.6
                });
            }
        }

        // Content richness analysis
        const avgContentLength = dreams.reduce((sum, dream) => sum + dream.content.length, 0) / dreams.length;
        if (avgContentLength > 200) {
            insights.push({
                type: 'suggestion',
                title: 'Rich Dream Content',
                description: 'Your dreams are detailed and complex, indicating active subconscious processing. This is excellent for self-discovery.',
                confidence: 0.8
            });
        }

        return insights;
    }

    /**
     * Helper method to get frequency map
     */
    private getFrequencyMap(items: string[]): Record<string, number> {
        return items.reduce((freq, item) => {
            freq[item] = (freq[item] || 0) + 1;
            return freq;
        }, {} as Record<string, number>);
    }

    /**
     * Calculate average days between dreams
     */
    private calculateAverageDaysBetween(dates: Date[]): number {
        if (dates.length < 2) return 0;

        let totalDays = 0;
        for (let i = 1; i < dates.length; i++) {
            const diffTime = dates[i].getTime() - dates[i - 1].getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            totalDays += diffDays;
        }

        return totalDays / (dates.length - 1);
    }
}

export const aiService = new AIService();