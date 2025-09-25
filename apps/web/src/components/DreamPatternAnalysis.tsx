import React, { useEffect, useState } from 'react';
import { YStack, XStack } from '@tamagui/stacks';
import { H2, H3, H4, Paragraph } from '@tamagui/text';
import { Button } from '@tamagui/button';
import { enhancedAIService, type DreamPattern, type PersonalizedInsight } from '../services/enhancedAI';
import { useDreams } from '../stores/dreamStore';
import type { Dream } from '../services/api';

export const DreamPatternAnalysis: React.FC = () => {
  const dreams = useDreams();
  const [patterns, setPatterns] = useState<DreamPattern[]>([]);
  const [insights, setInsights] = useState<PersonalizedInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzePatterns = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      // Prepare dream data for analysis
      const dreamData = dreams.map((dream: Dream) => ({
        id: dream.id,
        content: dream.content,
        date: new Date(dream.date),
        mood: dream.mood,
        tags: dream.tags
      }));

      // Analyze patterns and generate insights
      const [patternsResult, insightsResult] = await Promise.all([
        enhancedAIService.analyzePatterns(dreamData),
        enhancedAIService.generatePersonalizedInsights(dreamData)
      ]);

      setPatterns(patternsResult);
      setInsights(insightsResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze patterns');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (dreams.length >= 2) {
      analyzePatterns();
    }
  }, [dreams.length]);

  const getPatternIcon = (type: DreamPattern['type']) => {
    const icons = {
      recurring_symbol: '🔮',
      emotional_theme: '💭',
      time_pattern: '⏰',
      character_pattern: '👥',
      setting_pattern: '🏞️'
    };
    return icons[type] || '📊';
  };

  const getInsightIcon = (category: PersonalizedInsight['category']) => {
    const icons = {
      psychological: '🧠',
      behavioral: '🎯',
      emotional: '❤️',
      spiritual: '✨',
      predictive: '🔮'
    };
    return icons[category] || '💡';
  };

  if (dreams.length < 2) {
    return (
      <YStack padding="$4" marginVertical="$2" backgroundColor="$gray1" borderRadius="$4">
        <YStack alignItems="center" space="$3">
          <H3>Pattern Analysis</H3>
          <Paragraph textAlign="center" color="$gray10">
            Record at least 2 dreams to discover patterns in your dream world.
          </Paragraph>
          <Paragraph fontSize="$2" color="$gray8" textAlign="center">
            Patterns help reveal recurring themes, symbols, and insights from your subconscious mind.
          </Paragraph>
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack space="$4">
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center">
        <YStack>
          <H2>Dream Pattern Analysis</H2>
          <Paragraph color="$gray10">
            Discovering patterns across {dreams.length} dreams
          </Paragraph>
        </YStack>
        <Button
          size="$3"
          onPress={analyzePatterns}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
        </Button>
      </XStack>

      {error && (
        <YStack padding="$3" backgroundColor="$red2" borderRadius="$4">
          <Paragraph color="$red10">Error: {error}</Paragraph>
        </YStack>
      )}

      {/* Patterns Section */}
      {patterns.length > 0 && (
        <YStack space="$3">
          <H3>🔍 Discovered Patterns</H3>
          {patterns.map((pattern) => (
            <YStack key={pattern.id} padding="$4" borderWidth={1} borderRadius="$4" backgroundColor="$background">
              <YStack space="$3">
                <XStack justifyContent="space-between" alignItems="flex-start">
                  <XStack space="$2" alignItems="center" flex={1}>
                    <Paragraph fontSize="$4">{getPatternIcon(pattern.type)}</Paragraph>
                    <YStack flex={1}>
                      <H4>{pattern.name}</H4>
                      <Paragraph fontSize="$2" color="$gray10" textTransform="capitalize">
                        {pattern.type.replace('_', ' ')}
                      </Paragraph>
                    </YStack>
                  </XStack>
                  <YStack alignItems="flex-end" space="$1">
                    <YStack 
                      padding="$1" 
                      paddingHorizontal="$2" 
                      backgroundColor="$blue9"
                      borderRadius="$2"
                    >
                      <Paragraph fontSize="$1" color="white" fontWeight="600">
                        {Math.round(pattern.significance * 100)}% significance
                      </Paragraph>
                    </YStack>
                    <Paragraph fontSize="$1" color="$gray8">
                      {Math.round(pattern.frequency * 100)}% frequency
                    </Paragraph>
                  </YStack>
                </XStack>

                <Paragraph fontSize="$3">
                  {pattern.description}
                </Paragraph>

                <XStack justifyContent="space-between" alignItems="center">
                  <Paragraph fontSize="$2" color="$gray8">
                    {pattern.relatedDreams.length} related dreams
                  </Paragraph>
                  <XStack space="$2">
                    <Paragraph fontSize="$1" color="$gray8">
                      First: {pattern.firstOccurrence.toLocaleDateString()}
                    </Paragraph>
                    <Paragraph fontSize="$1" color="$gray8">
                      Latest: {pattern.lastOccurrence.toLocaleDateString()}
                    </Paragraph>
                  </XStack>
                </XStack>

                {pattern.trends.increasing && (
                  <YStack padding="$2" backgroundColor="$blue2" borderRadius="$2">
                    <Paragraph fontSize="$2" color="$blue10">
                      📈 This pattern is increasing in frequency
                    </Paragraph>
                  </YStack>
                )}
              </YStack>
            </YStack>
          ))}
        </YStack>
      )}

      {/* Personalized Insights Section */}
      {insights.length > 0 && (
        <YStack space="$3">
          <H3>💡 Personalized Insights</H3>
          {insights.map((insight) => (
            <YStack key={insight.id} padding="$4" borderWidth={1} borderRadius="$4" backgroundColor="$background">
              <YStack space="$3">
                <XStack justifyContent="space-between" alignItems="flex-start">
                  <XStack space="$2" alignItems="center" flex={1}>
                    <Paragraph fontSize="$4">{getInsightIcon(insight.category)}</Paragraph>
                    <YStack flex={1}>
                      <H4>{insight.title}</H4>
                      <Paragraph fontSize="$2" color="$gray10" textTransform="capitalize">
                        {insight.category} insight
                      </Paragraph>
                    </YStack>
                  </XStack>
                  <YStack 
                    padding="$1" 
                    paddingHorizontal="$2" 
                    backgroundColor="$green9"
                    borderRadius="$2"
                  >
                    <Paragraph fontSize="$1" color="white" fontWeight="600">
                      {Math.round(insight.confidence * 100)}% confidence
                    </Paragraph>
                  </YStack>
                </XStack>

                <Paragraph fontSize="$3">
                  {insight.description}
                </Paragraph>

                {insight.recommendations.length > 0 && (
                  <YStack space="$2">
                    <Paragraph fontSize="$3" fontWeight="600" color="$blue10">
                      💡 Recommendations:
                    </Paragraph>
                    {insight.recommendations.map((rec, index) => (
                      <XStack key={index} space="$2" alignItems="flex-start">
                        <Paragraph fontSize="$2" color="$blue9">•</Paragraph>
                        <Paragraph fontSize="$2" flex={1} color="$gray11">
                          {rec}
                        </Paragraph>
                      </XStack>
                    ))}
                  </YStack>
                )}

                <XStack justifyContent="space-between" alignItems="center">
                  <Paragraph fontSize="$2" color="$gray8">
                    Based on {insight.evidence.dreamIds.length} dreams
                  </Paragraph>
                  <Paragraph fontSize="$1" color="$gray8">
                    {insight.evidence.timeframe.replace('_', ' ')}
                  </Paragraph>
                </XStack>
              </YStack>
            </YStack>
          ))}
        </YStack>
      )}

      {/* No patterns message */}
      {!isAnalyzing && patterns.length === 0 && insights.length === 0 && (
        <YStack padding="$4" backgroundColor="$gray2" borderRadius="$4">
          <YStack alignItems="center" space="$3">
            <Paragraph fontSize="$4">🔍</Paragraph>
            <H4>No Clear Patterns Yet</H4>
            <Paragraph textAlign="center" color="$gray10">
              Keep recording your dreams! Patterns become clearer with more dream entries.
              Try to record dreams regularly for at least a week to see meaningful patterns.
            </Paragraph>
          </YStack>
        </YStack>
      )}

      {/* Pattern Analysis Stats */}
      {patterns.length > 0 && (
        <YStack padding="$3" backgroundColor="$blue1" borderRadius="$4">
          <YStack space="$2">
            <Paragraph fontSize="$3" fontWeight="600" color="$blue11">
              📊 Analysis Summary
            </Paragraph>
            <XStack justifyContent="space-between">
              <Paragraph fontSize="$2" color="$blue10">
                Patterns Found: {patterns.length}
              </Paragraph>
              <Paragraph fontSize="$2" color="$blue10">
                Dreams Analyzed: {dreams.length}
              </Paragraph>
            </XStack>
            <XStack justifyContent="space-between">
              <Paragraph fontSize="$2" color="$blue10">
                Insights Generated: {insights.length}
              </Paragraph>
              <Paragraph fontSize="$2" color="$blue10">
                Most Common: {patterns[0]?.type.replace('_', ' ') || 'None'}
              </Paragraph>
            </XStack>
          </YStack>
        </YStack>
      )}
    </YStack>
  );
};

export default DreamPatternAnalysis;