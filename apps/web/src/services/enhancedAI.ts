/**
 * Enhanced Dream Pattern Recognition Service
 * Implements advanced AI capabilities for pattern detection and personalized insights
 */

export interface DreamPattern {
  id: string;
  type: 'recurring_symbol' | 'emotional_theme' | 'time_pattern' | 'character_pattern' | 'setting_pattern';
  name: string;
  frequency: number;
  significance: number;
  description: string;
  relatedDreams: string[];
  firstOccurrence: Date;
  lastOccurrence: Date;
  trends: {
    increasing: boolean;
    peakPeriod?: string;
    associatedMoods: string[];
  };
}

export interface PersonalizedInsight {
  id: string;
  category: 'psychological' | 'behavioral' | 'emotional' | 'spiritual' | 'predictive';
  title: string;
  description: string;
  confidence: number;
  evidence: {
    dreamIds: string[];
    patterns: string[];
    timeframe: string;
  };
  recommendations: string[];
  createdAt: Date;
}

export type DreamCategory = 
  | 'lucid' 
  | 'nightmare' 
  | 'prophetic' 
  | 'symbolic' 
  | 'recurring' 
  | 'emotional' 
  | 'adventure' 
  | 'relationship' 
  | 'work_stress' 
  | 'healing'
  | 'psychological'
  | 'wish_fulfillment'
  | 'problem_solving'
  | 'memory_processing'
  | 'creative'
  | 'emotional_release'
  | 'spiritual';

export interface DreamCategorization {
  category: DreamCategory;
  confidence: number;
  subcategories: string[];
  lucidityLevel: number;
  vividity: number;
  emotionalIntensity: number;
  symbolDensity: number;
  narrativeCoherence: number;
}

export interface LearningInsight {
  id: string;
  insight: string;
  confidence: number;
  supportingEvidence: string[];
  createdAt: Date;
}

class EnhancedAIService {
  private patterns: Map<string, DreamPattern> = new Map();
  private userProfile: {
    dominantThemes: string[];
    emotionalTendencies: string[];
    symbolPreferences: string[];
    dreamingPatterns: {
      frequency: number;
      averageLength: number;
      peakTimes: string[];
    };
  } = {
    dominantThemes: [],
    emotionalTendencies: [],
    symbolPreferences: [],
    dreamingPatterns: {
      frequency: 0,
      averageLength: 0,
      peakTimes: []
    }
  };

  /**
   * Analyze patterns across multiple dreams to identify recurring elements
   */
  async analyzePatterns(dreams: Array<{ id: string; content: string; date: Date; mood?: string; tags?: string[] }>): Promise<DreamPattern[]> {
    const patterns: DreamPattern[] = [];
    
    // Symbol Pattern Analysis
    const symbolPatterns = this.extractSymbolPatterns(dreams);
    patterns.push(...symbolPatterns);
    
    // Emotional Theme Analysis
    const emotionalPatterns = this.extractEmotionalPatterns(dreams);
    patterns.push(...emotionalPatterns);
    
    // Time-based Pattern Analysis
    const timePatterns = this.extractTimePatterns(dreams);
    patterns.push(...timePatterns);
    
    // Character Pattern Analysis
    const characterPatterns = this.extractCharacterPatterns(dreams);
    patterns.push(...characterPatterns);
    
    // Setting Pattern Analysis
    const settingPatterns = this.extractSettingPatterns(dreams);
    patterns.push(...settingPatterns);
    
    // Update patterns cache
    patterns.forEach(pattern => {
      this.patterns.set(pattern.id, pattern);
    });
    
    return patterns.sort((a, b) => b.significance - a.significance);
  }

  /**
   * Generate personalized insights based on user's dream history and patterns
   */
  async generatePersonalizedInsights(dreams: Array<{ id: string; content: string; date: Date; mood?: string; tags?: string[] }>): Promise<PersonalizedInsight[]> {
    const insights: PersonalizedInsight[] = [];
    
    // Update user profile
    this.updateUserProfile(dreams);
    
    // Psychological Insights
    const psychologicalInsights = await this.generatePsychologicalInsights(dreams);
    insights.push(...psychologicalInsights);
    
    // Behavioral Insights
    const behavioralInsights = await this.generateBehavioralInsights(dreams);
    insights.push(...behavioralInsights);
    
    // Emotional Insights
    const emotionalInsights = await this.generateEmotionalInsights(dreams);
    insights.push(...emotionalInsights);
    
    // Predictive Insights
    const predictiveInsights = await this.generatePredictiveInsights(dreams);
    insights.push(...predictiveInsights);
    
    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Categorize dreams into meaningful groups
   */
  async categorizeDream(dreamContent: string, mood?: string, _tags?: string[]): Promise<DreamCategorization[]> {
    // Analyze dream content to determine categories
    const categories: DreamCategorization[] = [];
    
    // Check for different dream categories
    if (this.containsKeywords(dreamContent, ['aware', 'control', 'realize', 'dream'])) {
      categories.push({
        category: 'lucid',
        confidence: 0.8,
        subcategories: ['awareness', 'control'],
        lucidityLevel: this.calculateLucidityLevel(dreamContent),
        vividity: this.calculateVividity(dreamContent),
        emotionalIntensity: this.calculateEmotionalIntensity(dreamContent, mood),
        symbolDensity: this.calculateSymbolDensity(dreamContent),
        narrativeCoherence: this.calculateNarrativeCoherence(dreamContent),
      });
    }
    
    if (this.containsKeywords(dreamContent, ['chase', 'fear', 'terror', 'scared', 'monster'])) {
      categories.push({
        category: 'nightmare',
        confidence: 0.9,
        subcategories: ['anxiety', 'fear'],
        lucidityLevel: this.calculateLucidityLevel(dreamContent),
        vividity: this.calculateVividity(dreamContent),
        emotionalIntensity: this.calculateEmotionalIntensity(dreamContent, mood),
        symbolDensity: this.calculateSymbolDensity(dreamContent),
        narrativeCoherence: this.calculateNarrativeCoherence(dreamContent),
      });
    }
    
    if (this.containsKeywords(dreamContent, ['symbol', 'meaning', 'sign', 'represent'])) {
      categories.push({
        category: 'symbolic',
        confidence: 0.7,
        subcategories: ['metaphor', 'archetypal'],
        lucidityLevel: this.calculateLucidityLevel(dreamContent),
        vividity: this.calculateVividity(dreamContent),
        emotionalIntensity: this.calculateEmotionalIntensity(dreamContent, mood),
        symbolDensity: this.calculateSymbolDensity(dreamContent),
        narrativeCoherence: this.calculateNarrativeCoherence(dreamContent),
      });
    }
    
    // Check for psychological processing dreams
    const psychScore = this.calculatePsychologicalScore(dreamContent);
    if (psychScore > 0.3) {
      categories.push({
        category: 'psychological',
        confidence: Math.min(0.9, psychScore + 0.2),
        subcategories: ['processing', 'introspection'],
        lucidityLevel: this.calculateLucidityLevel(dreamContent),
        vividity: this.calculateVividity(dreamContent),
        emotionalIntensity: this.calculateEmotionalIntensity(dreamContent, mood),
        symbolDensity: this.calculateSymbolDensity(dreamContent),
        narrativeCoherence: this.calculateNarrativeCoherence(dreamContent),
      });
    }

    // Check for wish fulfillment dreams
    const wishScore = this.calculateWishFulfillmentScore(dreamContent);
    if (wishScore > 0.25) {
      categories.push({
        category: 'wish_fulfillment',
        confidence: Math.min(0.85, wishScore + 0.3),
        subcategories: ['desire', 'aspiration'],
        lucidityLevel: this.calculateLucidityLevel(dreamContent),
        vividity: this.calculateVividity(dreamContent),
        emotionalIntensity: this.calculateEmotionalIntensity(dreamContent, mood),
        symbolDensity: this.calculateSymbolDensity(dreamContent),
        narrativeCoherence: this.calculateNarrativeCoherence(dreamContent),
      });
    }

    // Check for problem-solving dreams
    const problemScore = this.calculateProblemSolvingScore(dreamContent);
    if (problemScore > 0.3) {
      categories.push({
        category: 'problem_solving',
        confidence: Math.min(0.8, problemScore + 0.2),
        subcategories: ['resolution', 'insight'],
        lucidityLevel: this.calculateLucidityLevel(dreamContent),
        vividity: this.calculateVividity(dreamContent),
        emotionalIntensity: this.calculateEmotionalIntensity(dreamContent, mood),
        symbolDensity: this.calculateSymbolDensity(dreamContent),
        narrativeCoherence: this.calculateNarrativeCoherence(dreamContent),
      });
    }

    // Check for memory processing dreams
    const memoryScore = this.calculateMemoryScore(dreamContent);
    if (memoryScore > 0.25) {
      categories.push({
        category: 'memory_processing',
        confidence: Math.min(0.75, memoryScore + 0.25),
        subcategories: ['remembrance', 'nostalgia'],
        lucidityLevel: this.calculateLucidityLevel(dreamContent),
        vividity: this.calculateVividity(dreamContent),
        emotionalIntensity: this.calculateEmotionalIntensity(dreamContent, mood),
        symbolDensity: this.calculateSymbolDensity(dreamContent),
        narrativeCoherence: this.calculateNarrativeCoherence(dreamContent),
      });
    }

    // Check for creative dreams
    const creativityScore = this.calculateCreativityScore(dreamContent);
    if (creativityScore > 0.2) {
      categories.push({
        category: 'creative',
        confidence: Math.min(0.8, creativityScore + 0.3),
        subcategories: ['inspiration', 'artistic'],
        lucidityLevel: this.calculateLucidityLevel(dreamContent),
        vividity: this.calculateVividity(dreamContent),
        emotionalIntensity: this.calculateEmotionalIntensity(dreamContent, mood),
        symbolDensity: this.calculateSymbolDensity(dreamContent),
        narrativeCoherence: this.calculateNarrativeCoherence(dreamContent),
      });
    }

    // Check for emotional release dreams
    const emotionalScore = this.calculateEmotionalReleaseScore(dreamContent);
    if (emotionalScore > 0.25) {
      categories.push({
        category: 'emotional_release',
        confidence: Math.min(0.85, emotionalScore + 0.25),
        subcategories: ['catharsis', 'expression'],
        lucidityLevel: this.calculateLucidityLevel(dreamContent),
        vividity: this.calculateVividity(dreamContent),
        emotionalIntensity: this.calculateEmotionalIntensity(dreamContent, mood),
        symbolDensity: this.calculateSymbolDensity(dreamContent),
        narrativeCoherence: this.calculateNarrativeCoherence(dreamContent),
      });
    }

    // Check for spiritual dreams
    const spiritualScore = this.calculateSpiritualScore(dreamContent);
    if (spiritualScore > 0.2) {
      categories.push({
        category: 'spiritual',
        confidence: Math.min(0.9, spiritualScore + 0.3),
        subcategories: ['transcendence', 'enlightenment'],
        lucidityLevel: this.calculateLucidityLevel(dreamContent),
        vividity: this.calculateVividity(dreamContent),
        emotionalIntensity: this.calculateEmotionalIntensity(dreamContent, mood),
        symbolDensity: this.calculateSymbolDensity(dreamContent),
        narrativeCoherence: this.calculateNarrativeCoherence(dreamContent),
      });
    }

    // Default to emotional if no specific category found
    if (categories.length === 0) {
      categories.push({
        category: 'emotional',
        confidence: 0.6,
        subcategories: ['processing', 'general'],
        lucidityLevel: this.calculateLucidityLevel(dreamContent),
        vividity: this.calculateVividity(dreamContent),
        emotionalIntensity: this.calculateEmotionalIntensity(dreamContent, mood),
        symbolDensity: this.calculateSymbolDensity(dreamContent),
        narrativeCoherence: this.calculateNarrativeCoherence(dreamContent),
      });
    }
    
    return categories;
  }

  /**
   * Generate learning insights from dream patterns
   */
  async generateLearningInsights(dreams: Array<{ id: string; content: string; date: Date; mood?: string; tags?: string[] }>): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];
    
    // Analyze frequency patterns
    const frequencyInsight = this.analyzeDreamFrequency(dreams);
    if (frequencyInsight) insights.push(frequencyInsight);
    
    // Analyze mood patterns
    const moodInsight = this.analyzeMoodPatterns(dreams);
    if (moodInsight) insights.push(moodInsight);
    
    // Analyze content themes
    const themeInsight = this.analyzeContentThemes(dreams);
    if (themeInsight) insights.push(themeInsight);
    
    return insights;
  }

  /**
   * Helper method to check if content contains keywords
   */
  private containsKeywords(content: string, keywords: string[]): boolean {
    const lowerContent = content.toLowerCase();
    return keywords.some(keyword => lowerContent.includes(keyword.toLowerCase()));
  }

  /**
   * Analyze dream frequency patterns
   */
  private analyzeDreamFrequency(dreams: Array<{ date: Date }>): LearningInsight | null {
    if (dreams.length < 3) return null;
    
    const dreamDates = dreams.map(d => d.date);
    const daysBetween = this.calculateAverageDaysBetween(dreamDates);
    
    return {
      id: `frequency-${Date.now()}`,
      insight: `You tend to record dreams every ${Math.round(daysBetween)} days on average`,
      confidence: 0.8,
      supportingEvidence: [`${dreams.length} dreams recorded`],
      createdAt: new Date()
    };
  }

  /**
   * Analyze mood patterns in dreams
   */
  private analyzeMoodPatterns(dreams: Array<{ mood?: string }>): LearningInsight | null {
    const moods = dreams.filter(d => d.mood).map(d => d.mood!);
    if (moods.length < 2) return null;
    
    const moodCounts = moods.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dominantMood = Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0];
    
    return {
      id: `mood-${Date.now()}`,
      insight: `Your dreams are predominantly ${dominantMood[0]} (${Math.round(dominantMood[1] / moods.length * 100)}% of the time)`,
      confidence: 0.7,
      supportingEvidence: [`${dominantMood[1]} out of ${moods.length} dreams`],
      createdAt: new Date()
    };
  }

  /**
   * Analyze content themes
   */
  private analyzeContentThemes(dreams: Array<{ content: string }>): LearningInsight | null {
    if (dreams.length < 2) return null;
    
    const commonWords = this.extractCommonThemes(dreams.map(d => d.content));
    
    if (commonWords.length > 0) {
      return {
        id: `themes-${Date.now()}`,
        insight: `Common themes in your dreams include: ${commonWords.slice(0, 3).join(', ')}`,
        confidence: 0.6,
        supportingEvidence: [`Found in multiple dreams`],
        createdAt: new Date()
      };
    }
    
    return null;
  }

  /**
   * Calculate average days between dreams
   */
  private calculateAverageDaysBetween(dates: Date[]): number {
    if (dates.length < 2) return 0;
    
    const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
    let totalDays = 0;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const diff = sortedDates[i].getTime() - sortedDates[i-1].getTime();
      totalDays += diff / (1000 * 60 * 60 * 24);
    }
    
    return totalDays / (sortedDates.length - 1);
  }

  /**
   * Extract common themes from dream content
   */
  private extractCommonThemes(contents: string[]): string[] {
    const wordCounts: Record<string, number> = {};
    const commonWords = ['water', 'flying', 'house', 'family', 'friend', 'school', 'work', 'car', 'animal', 'death'];
    
    contents.forEach(content => {
      const lowerContent = content.toLowerCase();
      commonWords.forEach(word => {
        if (lowerContent.includes(word)) {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      });
    });
    
    return Object.entries(wordCounts)
      .filter(([, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a)
      .map(([word]) => word);
  }

  /**
   * Learn from user feedback to improve future analyses
   */
  async learnFromFeedback(dreamId: string, analysisId: string, feedback: {
    accuracyRating: number;
    relevantSymbols: string[];
    missedSymbols: string[];
    interpretationFeedback: string;
  }): Promise<void> {
    // Store feedback for machine learning improvement
    const feedbackData = {
      dreamId,
      analysisId,
      feedback,
      timestamp: new Date(),
    };
    
    // In a real implementation, this would update ML models
    // For now, we'll store it for future use
    if (typeof localStorage !== 'undefined') {
      const existingFeedback = JSON.parse(localStorage.getItem('dreamAnalysisFeedback') || '[]');
      existingFeedback.push(feedbackData);
      localStorage.setItem('dreamAnalysisFeedback', JSON.stringify(existingFeedback));
    }
    
    // Update symbol meanings based on user feedback
    this.updateSymbolMeanings(feedback);
  }

  // Private helper methods

  private extractSymbolPatterns(dreams: Array<{ id: string; content: string; date: Date }>): DreamPattern[] {
    const symbolCounts = new Map<string, { count: number; dreamIds: string[]; dates: Date[] }>();
    const commonSymbols = ['water', 'flying', 'falling', 'house', 'car', 'animal', 'fire', 'death', 'baby', 'school'];
    
    dreams.forEach(dream => {
      const content = dream.content.toLowerCase();
      commonSymbols.forEach(symbol => {
        if (content.includes(symbol)) {
          const existing = symbolCounts.get(symbol) || { count: 0, dreamIds: [], dates: [] };
          existing.count++;
          existing.dreamIds.push(dream.id);
          existing.dates.push(dream.date);
          symbolCounts.set(symbol, existing);
        }
      });
    });

    const patterns: DreamPattern[] = [];
    symbolCounts.forEach((data, symbol) => {
      if (data.count >= 2) { // Only patterns that appear at least twice
        const frequency = data.count / dreams.length;
        const significance = frequency * Math.log(data.count); // Higher for more frequent patterns
        
        patterns.push({
          id: `symbol-${symbol}`,
          type: 'recurring_symbol',
          name: `Recurring ${symbol} symbol`,
          frequency,
          significance,
          description: `The ${symbol} symbol appears in ${data.count} of your dreams, suggesting ${this.getSymbolMeaning(symbol)}`,
          relatedDreams: data.dreamIds,
          firstOccurrence: new Date(Math.min(...data.dates.map(d => d.getTime()))),
          lastOccurrence: new Date(Math.max(...data.dates.map(d => d.getTime()))),
          trends: {
            increasing: this.calculateTrend(data.dates),
            associatedMoods: ['neutral'], // Would be calculated from actual mood data
          }
        });
      }
    });

    return patterns;
  }

  private extractEmotionalPatterns(dreams: Array<{ id: string; content: string; date: Date; mood?: string }>): DreamPattern[] {
    const emotionWords = {
      anxiety: ['anxious', 'worried', 'scared', 'afraid', 'nervous', 'panic'],
      joy: ['happy', 'excited', 'joyful', 'elated', 'cheerful', 'delighted'],
      sadness: ['sad', 'depressed', 'grief', 'sorrow', 'melancholy'],
      anger: ['angry', 'furious', 'mad', 'irritated', 'frustrated'],
      love: ['love', 'affection', 'caring', 'tender', 'warm'],
      confusion: ['confused', 'lost', 'uncertain', 'bewildered'],
    };

    const emotionCounts = new Map<string, { count: number; dreamIds: string[]; dates: Date[] }>();
    
    dreams.forEach(dream => {
      const content = dream.content.toLowerCase();
      Object.entries(emotionWords).forEach(([emotion, words]) => {
        if (words.some(word => content.includes(word))) {
          const existing = emotionCounts.get(emotion) || { count: 0, dreamIds: [], dates: [] };
          existing.count++;
          existing.dreamIds.push(dream.id);
          existing.dates.push(dream.date);
          emotionCounts.set(emotion, existing);
        }
      });
    });

    const patterns: DreamPattern[] = [];
    emotionCounts.forEach((data, emotion) => {
      if (data.count >= 2) {
        const frequency = data.count / dreams.length;
        const significance = frequency * 1.2; // Emotional patterns are highly significant
        
        patterns.push({
          id: `emotion-${emotion}`,
          type: 'emotional_theme',
          name: `Recurring ${emotion} theme`,
          frequency,
          significance,
          description: `Your dreams frequently contain ${emotion} themes, appearing in ${data.count} dreams. This may reflect your emotional processing patterns.`,
          relatedDreams: data.dreamIds,
          firstOccurrence: new Date(Math.min(...data.dates.map(d => d.getTime()))),
          lastOccurrence: new Date(Math.max(...data.dates.map(d => d.getTime()))),
          trends: {
            increasing: this.calculateTrend(data.dates),
            associatedMoods: [emotion],
          }
        });
      }
    });

    return patterns;
  }

  private extractTimePatterns(dreams: Array<{ id: string; content: string; date: Date }>): DreamPattern[] {
    // Analyze patterns by day of week, time of year, etc.
    const dayOfWeekCounts = new Map<string, number>();
    const monthCounts = new Map<string, number>();
    
    dreams.forEach(dream => {
      const dayOfWeek = dream.date.toLocaleDateString('en-US', { weekday: 'long' });
      const month = dream.date.toLocaleDateString('en-US', { month: 'long' });
      
      dayOfWeekCounts.set(dayOfWeek, (dayOfWeekCounts.get(dayOfWeek) || 0) + 1);
      monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
    });

    const patterns: DreamPattern[] = [];
    
    // Check for day-of-week patterns
    const maxDayCount = Math.max(...dayOfWeekCounts.values());
    const avgDayCount = dreams.length / 7;
    
    dayOfWeekCounts.forEach((count, day) => {
      if (count > avgDayCount * 1.5) { // 50% above average
        patterns.push({
          id: `time-day-${day}`,
          type: 'time_pattern',
          name: `${day} dreaming pattern`,
          frequency: count / dreams.length,
          significance: (count / maxDayCount) * 0.8,
          description: `You tend to have more memorable dreams on ${day}s (${count} dreams). This might relate to your weekly routine.`,
          relatedDreams: dreams.filter(d => d.date.toLocaleDateString('en-US', { weekday: 'long' }) === day).map(d => d.id),
          firstOccurrence: dreams[0].date,
          lastOccurrence: dreams[dreams.length - 1].date,
          trends: {
            increasing: false,
            associatedMoods: ['neutral'],
          }
        });
      }
    });

    return patterns;
  }

  private extractCharacterPatterns(dreams: Array<{ id: string; content: string; date: Date }>): DreamPattern[] {
    const characterTypes = {
      'family': ['mother', 'father', 'sister', 'brother', 'family', 'parent'],
      'friends': ['friend', 'buddy', 'pal', 'companion'],
      'strangers': ['stranger', 'unknown person', 'someone'],
      'authority': ['teacher', 'boss', 'police', 'authority'],
      'romantic': ['partner', 'lover', 'boyfriend', 'girlfriend', 'spouse'],
    };

    const characterCounts = new Map<string, { count: number; dreamIds: string[] }>();
    
    dreams.forEach(dream => {
      const content = dream.content.toLowerCase();
      Object.entries(characterTypes).forEach(([type, keywords]) => {
        if (keywords.some(keyword => content.includes(keyword))) {
          const existing = characterCounts.get(type) || { count: 0, dreamIds: [] };
          existing.count++;
          existing.dreamIds.push(dream.id);
          characterCounts.set(type, existing);
        }
      });
    });

    const patterns: DreamPattern[] = [];
    characterCounts.forEach((data, type) => {
      if (data.count >= 2) {
        patterns.push({
          id: `character-${type}`,
          type: 'character_pattern',
          name: `${type} character pattern`,
          frequency: data.count / dreams.length,
          significance: (data.count / dreams.length) * 0.9,
          description: `${type} characters frequently appear in your dreams, suggesting these relationships are important in your subconscious processing.`,
          relatedDreams: data.dreamIds,
          firstOccurrence: dreams[0].date,
          lastOccurrence: dreams[dreams.length - 1].date,
          trends: {
            increasing: false,
            associatedMoods: ['neutral'],
          }
        });
      }
    });

    return patterns;
  }

  private extractSettingPatterns(dreams: Array<{ id: string; content: string; date: Date }>): DreamPattern[] {
    const settings = {
      'home': ['home', 'house', 'bedroom', 'kitchen', 'living room'],
      'school': ['school', 'classroom', 'university', 'college'],
      'work': ['work', 'office', 'workplace', 'job'],
      'nature': ['forest', 'mountain', 'ocean', 'beach', 'park'],
      'transportation': ['car', 'train', 'plane', 'bus', 'vehicle'],
      'public': ['store', 'restaurant', 'mall', 'street', 'city'],
    };

    const settingCounts = new Map<string, { count: number; dreamIds: string[] }>();
    
    dreams.forEach(dream => {
      const content = dream.content.toLowerCase();
      Object.entries(settings).forEach(([setting, keywords]) => {
        if (keywords.some(keyword => content.includes(keyword))) {
          const existing = settingCounts.get(setting) || { count: 0, dreamIds: [] };
          existing.count++;
          existing.dreamIds.push(dream.id);
          settingCounts.set(setting, existing);
        }
      });
    });

    const patterns: DreamPattern[] = [];
    settingCounts.forEach((data, setting) => {
      if (data.count >= 2) {
        patterns.push({
          id: `setting-${setting}`,
          type: 'setting_pattern',
          name: `${setting} setting pattern`,
          frequency: data.count / dreams.length,
          significance: (data.count / dreams.length) * 0.7,
          description: `Your dreams often take place in ${setting} settings, which may reflect your relationship with these environments.`,
          relatedDreams: data.dreamIds,
          firstOccurrence: dreams[0].date,
          lastOccurrence: dreams[dreams.length - 1].date,
          trends: {
            increasing: false,
            associatedMoods: ['neutral'],
          }
        });
      }
    });

    return patterns;
  }

  // Helper methods for calculations

  private calculateTrend(dates: Date[]): boolean {
    if (dates.length < 3) return false;
    
    const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
    const firstHalf = sortedDates.slice(0, Math.floor(sortedDates.length / 2));
    const secondHalf = sortedDates.slice(Math.floor(sortedDates.length / 2));
    
    return secondHalf.length > firstHalf.length;
  }

  private getSymbolMeaning(symbol: string): string {
    const meanings: Record<string, string> = {
      'water': 'emotional processing and subconscious exploration',
      'flying': 'desire for freedom and transcendence',
      'falling': 'feelings of loss of control or anxiety',
      'house': 'different aspects of your psyche and personal security',
      'car': 'life direction and personal control',
      'animal': 'instinctual nature and primal emotions',
      'fire': 'passion, transformation, or purification',
      'death': 'endings, transformations, and new beginnings',
      'baby': 'new beginnings and potential for growth',
      'school': 'learning experiences and personal development',
    };
    
    return meanings[symbol] || 'personal significance and symbolic meaning';
  }

  // Scoring methods for categorization

  private calculatePsychologicalScore(content: string): number {
    const indicators = ['family', 'childhood', 'memory', 'emotion', 'fear', 'anxiety', 'relationship'];
    return this.calculateWordScore(content, indicators);
  }

  private calculateWishFulfillmentScore(content: string): number {
    const indicators = ['want', 'wish', 'desire', 'dream', 'hope', 'perfect', 'ideal', 'fantasy'];
    return this.calculateWordScore(content, indicators);
  }

  private calculateProblemSolvingScore(content: string): number {
    const indicators = ['solve', 'figure', 'understand', 'realize', 'discover', 'find', 'answer'];
    return this.calculateWordScore(content, indicators);
  }

  private calculateMemoryScore(content: string): number {
    const indicators = ['remember', 'past', 'childhood', 'old', 'familiar', 'recognize', 'recall'];
    return this.calculateWordScore(content, indicators);
  }

  private calculateCreativityScore(content: string): number {
    const indicators = ['create', 'art', 'music', 'color', 'beautiful', 'imagine', 'creative', 'new'];
    return this.calculateWordScore(content, indicators);
  }

  private calculateEmotionalReleaseScore(content: string): number {
    const indicators = ['cry', 'scream', 'laugh', 'angry', 'sad', 'release', 'express', 'feel'];
    return this.calculateWordScore(content, indicators);
  }

  private calculateSpiritualScore(content: string): number {
    const indicators = ['spiritual', 'divine', 'light', 'energy', 'soul', 'meditation', 'peace', 'transcend'];
    return this.calculateWordScore(content, indicators);
  }

  private calculateWordScore(content: string, words: string[]): number {
    const lowerContent = content.toLowerCase();
    const matches = words.filter(word => lowerContent.includes(word)).length;
    return matches / words.length;
  }

  private calculateLucidityLevel(content: string): number {
    const lucidIndicators = ['realized', 'aware', 'conscious', 'control', 'knew it was a dream'];
    return this.calculateWordScore(content, lucidIndicators);
  }

  private calculateVividity(content: string): number {
    const vividIndicators = ['bright', 'clear', 'detailed', 'vivid', 'sharp', 'intense', 'realistic'];
    return this.calculateWordScore(content, vividIndicators);
  }

  private calculateEmotionalIntensity(content: string, mood?: string): number {
    const intensityWords = ['extremely', 'very', 'intense', 'overwhelming', 'powerful', 'strong'];
    const baseScore = this.calculateWordScore(content, intensityWords);
    
    // Adjust based on mood
    const moodMultiplier = mood === 'negative' ? 1.2 : mood === 'positive' ? 1.1 : 1.0;
    return Math.min(1.0, baseScore * moodMultiplier);
  }

  private calculateSymbolDensity(content: string): number {
    const commonSymbols = ['water', 'fire', 'animal', 'house', 'car', 'tree', 'sky', 'door', 'key', 'mirror'];
    return this.calculateWordScore(content, commonSymbols);
  }

  private calculateNarrativeCoherence(content: string): number {
    // Simple heuristic based on narrative indicators
    const narrativeWords = ['then', 'next', 'after', 'before', 'suddenly', 'finally', 'first', 'later'];
    const coherenceScore = this.calculateWordScore(content, narrativeWords);
    
    // Adjust for length - longer dreams tend to be more coherent if they have good flow
    const lengthFactor = Math.min(1.0, content.length / 500);
    return coherenceScore * lengthFactor;
  }

  // Insight generation methods

  private async generatePsychologicalInsights(dreams: Array<{ id: string; content: string; date: Date; mood?: string }>): Promise<PersonalizedInsight[]> {
    const insights: PersonalizedInsight[] = [];
    
    // Analyze recurring themes for psychological patterns
    const themes = this.extractThemes(dreams);
    if (themes.anxiety && themes.anxiety.length > dreams.length * 0.3) {
      insights.push({
        id: 'psych-anxiety-pattern',
        category: 'psychological',
        title: 'Recurring Anxiety Processing',
        description: 'Your dreams show a consistent pattern of anxiety processing, which is a natural psychological function. This suggests your subconscious is actively working through stress and concerns.',
        confidence: 0.8,
        evidence: {
          dreamIds: themes.anxiety,
          patterns: ['anxiety_symbols', 'stress_scenarios'],
          timeframe: 'last_30_days'
        },
        recommendations: [
          'Consider stress management techniques like meditation or deep breathing',
          'Keep a waking anxiety journal to complement your dream journal',
          'Practice relaxation exercises before bed'
        ],
        createdAt: new Date()
      });
    }
    
    return insights;
  }

  private async generateBehavioralInsights(_dreams: Array<{ id: string; content: string; date: Date }>): Promise<PersonalizedInsight[]> {
    // Implementation for behavioral insights
    // TODO: Analyze behavioral patterns from dream content
    return [];
  }

  private async generateEmotionalInsights(_dreams: Array<{ id: string; content: string; date: Date }>): Promise<PersonalizedInsight[]> {
    // Implementation for emotional insights
    // TODO: Analyze emotional patterns and provide personalized insights
    return [];
  }

  private async generatePredictiveInsights(_dreams: Array<{ id: string; content: string; date: Date }>): Promise<PersonalizedInsight[]> {
    // Implementation for predictive insights
    // TODO: Provide predictive insights based on historical patterns
    return [];
  }

  private extractThemes(dreams: Array<{ id: string; content: string; date: Date }>): Record<string, string[]> {
    const themes: Record<string, string[]> = {
      anxiety: [],
      joy: [],
      relationships: [],
      work: [],
      nature: []
    };

    dreams.forEach(dream => {
      const content = dream.content.toLowerCase();
      
      // Check for anxiety themes
      if (['worry', 'stress', 'fear', 'panic', 'anxious'].some(word => content.includes(word))) {
        themes.anxiety.push(dream.id);
      }
      
      // Add other theme detection logic...
    });

    return themes;
  }

  private updateUserProfile(dreams: Array<{ id: string; content: string; date: Date; mood?: string }>): void {
    // Update the user profile based on dream analysis
    // This would be more sophisticated in a real implementation
    this.userProfile.dreamingPatterns.frequency = dreams.length;
    this.userProfile.dreamingPatterns.averageLength = dreams.reduce((sum, dream) => sum + dream.content.length, 0) / dreams.length;
  }

  private updateSymbolMeanings(_feedback: { accuracyRating: number; relevantSymbols: string[]; missedSymbols: string[] }): void {
    // Update symbol interpretation based on user feedback
    // TODO: Implement machine learning updates in a real system
  }
}

export const enhancedAIService = new EnhancedAIService();