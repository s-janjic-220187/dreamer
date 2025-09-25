import { useEffect, useState } from 'react';
import { YStack, XStack } from '@tamagui/stacks';
import { H3, H4, Paragraph } from '@tamagui/text';
import { Button } from '@tamagui/button';
import { Separator } from '@tamagui/separator';
import { useAIStore, useAIAnalysis, useAILoading } from '../stores/aiStore';
import type { Dream } from '../services/api';

interface DreamAnalysisComponentProps {
  dream: Dream;
}

export function DreamAnalysisComponent({ dream }: DreamAnalysisComponentProps) {
  const { analyzeDream } = useAIStore();
  const analysis = useAIAnalysis(dream.id);
  const { isAnalyzing } = useAILoading();
  const [hasRequestedAnalysis, setHasRequestedAnalysis] = useState(false);

  const handleAnalyze = async () => {
    setHasRequestedAnalysis(true);
    await analyzeDream(dream);
  };

  // Auto-analyze if not done yet
  useEffect(() => {
    if (!analysis && !hasRequestedAnalysis && !isAnalyzing) {
      handleAnalyze();
    }
  }, [dream.id, analysis, hasRequestedAnalysis, isAnalyzing]);

  if (isAnalyzing) {
    return (
      <YStack space="$4" padding="$4" backgroundColor="$gray2" borderRadius="$4">
        <XStack alignItems="center" space="$2">
          <Paragraph fontSize="$6" color="$blue10">⟳</Paragraph>
          <H3>Analyzing Your Dream...</H3>
        </XStack>
        <Paragraph color="$gray11">
          Our AI is interpreting the symbols, themes, and emotions in your dream. This may take a moment.
        </Paragraph>
      </YStack>
    );
  }

  if (!analysis) {
    return (
      <YStack space="$4" padding="$4" backgroundColor="$gray2" borderRadius="$4">
        <H3>Dream Analysis</H3>
        <Paragraph color="$gray11">
          Get AI-powered insights into your dream's meaning, symbols, and themes.
        </Paragraph>
        <Button 
          theme="blue" 
          size="$4" 
          onPress={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze This Dream'}
        </Button>
      </YStack>
    );
  }

  const getMoodColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'joy':
      case 'peace':
        return '$green10';
      case 'fear':
      case 'anger':
        return '$red10';
      case 'sadness':
        return '$blue10';
      case 'surprise':
        return '$orange10';
      default:
        return '$gray10';
    }
  };

  return (
    <YStack space="$4">
      {/* Main Interpretation */}
      <YStack space="$3" padding="$4" backgroundColor="$blue2" borderRadius="$4" borderWidth={1} borderColor="$blue6">
        <H3 color="$blue11">✨ Dream Interpretation</H3>
        <Paragraph fontSize="$4" lineHeight="$6">
          {analysis.interpretation}
        </Paragraph>
      </YStack>

      {/* Themes */}
      {analysis.themes.length > 0 && (
        <YStack space="$3" padding="$4" backgroundColor="$gray2" borderRadius="$4">
          <H4>🎭 Themes</H4>
          <XStack flexWrap="wrap" gap="$2">
            {analysis.themes.map((theme, index) => (
              <YStack
                key={index}
                paddingHorizontal="$3"
                paddingVertical="$2"
                backgroundColor="$purple3"
                borderRadius="$3"
                borderWidth={1}
                borderColor="$purple6"
              >
                <Paragraph fontSize="$3" color="$purple11" textTransform="capitalize">
                  {theme}
                </Paragraph>
              </YStack>
            ))}
          </XStack>
        </YStack>
      )}

      {/* Symbols */}
      {analysis.symbols.length > 0 && (
        <YStack space="$3" padding="$4" backgroundColor="$gray2" borderRadius="$4">
          <H4>🔮 Symbols & Meanings</H4>
          <YStack space="$3">
            {analysis.symbols.map((symbol, index) => (
              <YStack key={index} space="$2">
                <XStack alignItems="center" space="$2">
                  <Paragraph fontSize="$4" fontWeight="600" textTransform="capitalize">
                    {symbol.symbol}
                  </Paragraph>
                  <Paragraph fontSize="$2" color="$gray10">
                    ({Math.round(symbol.confidence * 100)}% confidence)
                  </Paragraph>
                </XStack>
                <Paragraph color="$gray11" fontSize="$3">
                  {symbol.meaning}
                </Paragraph>
                {index < analysis.symbols.length - 1 && <Separator />}
              </YStack>
            ))}
          </YStack>
        </YStack>
      )}

      {/* Emotions */}
      {analysis.emotions.length > 0 && (
        <YStack space="$3" padding="$4" backgroundColor="$gray2" borderRadius="$4">
          <H4>💭 Emotional Landscape</H4>
          <YStack space="$2">
            {analysis.emotions
              .sort((a, b) => b.intensity - a.intensity)
              .map((emotion, index) => (
                <XStack key={index} alignItems="center" space="$3">
                  <Paragraph 
                    fontSize="$4" 
                    fontWeight="600" 
                    color={getMoodColor(emotion.emotion)}
                    textTransform="capitalize"
                  >
                    {emotion.emotion}
                  </Paragraph>
                  <YStack flex={1} height="$1" backgroundColor="$gray5" borderRadius="$1">
                    <YStack
                      height="$1"
                      width={`${emotion.intensity * 100}%`}
                      backgroundColor={getMoodColor(emotion.emotion)}
                      borderRadius="$1"
                    />
                  </YStack>
                  <Paragraph fontSize="$2" color="$gray10">
                    {Math.round(emotion.intensity * 100)}%
                  </Paragraph>
                </XStack>
              ))}
          </YStack>
        </YStack>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <YStack space="$3" padding="$4" backgroundColor="$green2" borderRadius="$4" borderWidth={1} borderColor="$green6">
          <H4 color="$green11">💡 Insights & Suggestions</H4>
          <YStack space="$2">
            {analysis.suggestions.map((suggestion, index) => (
              <XStack key={index} alignItems="flex-start" space="$2">
                <Paragraph color="$green10">•</Paragraph>
                <Paragraph color="$green11" flex={1}>
                  {suggestion}
                </Paragraph>
              </XStack>
            ))}
          </YStack>
        </YStack>
      )}

      {/* Re-analyze Button */}
      <XStack justifyContent="center">
        <Button 
          variant="outlined" 
          size="$3" 
          onPress={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Re-analyze Dream'}
        </Button>
      </XStack>
    </YStack>
  );
}