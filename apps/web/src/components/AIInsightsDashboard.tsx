import { useEffect } from 'react';
import { YStack, XStack } from '@tamagui/stacks';
import { H2, H3, H4, Paragraph } from '@tamagui/text';
import { Button } from '@tamagui/button';
import { Separator } from '@tamagui/separator';
import { useAIStore, useAIInsights, useJournalPrompts, useAILoading } from '../stores/aiStore';
import { useDreams } from '../stores/dreamStore';

export function AIInsightsDashboard() {
  const { loadPersonalizedInsights, generateJournalPrompts } = useAIStore();
  const insights = useAIInsights();
  const journalPrompts = useJournalPrompts();
  const { isLoadingInsights } = useAILoading();
  const dreams = useDreams();

  useEffect(() => {
    // Load insights when component mounts
    loadPersonalizedInsights();
    if (journalPrompts.length === 0) {
      generateJournalPrompts();
    }
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern':
        return '📈';
      case 'symbol':
        return '🔮';
      case 'emotion':
        return '💭';
      case 'suggestion':
        return '💡';
      default:
        return '✨';
    }
  };



  if (isLoadingInsights) {
    return (
      <YStack space="$4" padding="$4" flex={1}>
        <H2>AI Insights</H2>
        <YStack space="$4" alignItems="center" justifyContent="center" flex={1}>
          <Paragraph fontSize="$6" color="$blue10">⟳</Paragraph>
          <Paragraph color="$gray11">Loading your personalized insights...</Paragraph>
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack space="$4" padding="$4" flex={1}>
      <H2>AI Insights</H2>

      {dreams.length === 0 ? (
        <YStack 
          space="$4" 
          padding="$6" 
          alignItems="center" 
          backgroundColor="$gray2" 
          borderRadius="$4"
        >
          <Paragraph fontSize="$6">🌙</Paragraph>
          <Paragraph fontSize="$5" fontWeight="600" textAlign="center">
            Start Your Dream Journey
          </Paragraph>
          <Paragraph color="$gray11" textAlign="center">
            Record your first dream to unlock AI-powered insights and patterns.
          </Paragraph>
        </YStack>
      ) : (
        <>
          {/* Dream Statistics */}
          <YStack space="$3" padding="$4" backgroundColor="$blue2" borderRadius="$4" borderWidth={1} borderColor="$blue6">
            <H3 color="$blue11">📊 Your Dream Statistics</H3>
            <XStack justifyContent="space-between" flexWrap="wrap" gap="$4">
              <YStack alignItems="center" space="$1">
                <Paragraph fontSize="$6" fontWeight="600" color="$blue11">
                  {dreams.length}
                </Paragraph>
                <Paragraph fontSize="$2" color="$blue10">
                  Total Dreams
                </Paragraph>
              </YStack>
              <YStack alignItems="center" space="$1">
                <Paragraph fontSize="$6" fontWeight="600" color="$blue11">
                  {insights.filter(i => i.type === 'pattern').length}
                </Paragraph>
                <Paragraph fontSize="$2" color="$blue10">
                  Patterns Found
                </Paragraph>
              </YStack>
              <YStack alignItems="center" space="$1">
                <Paragraph fontSize="$6" fontWeight="600" color="$blue11">
                  {new Set(dreams.flatMap(d => d.tags)).size}
                </Paragraph>
                <Paragraph fontSize="$2" color="$blue10">
                  Unique Themes
                </Paragraph>
              </YStack>
            </XStack>
          </YStack>

          {/* AI Insights */}
          {insights.length > 0 ? (
            <YStack space="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <H3>✨ Personalized Insights</H3>
                <Button 
                  size="$2" 
                  variant="outlined" 
                  onPress={loadPersonalizedInsights}
                  disabled={isLoadingInsights}
                >
                  Refresh
                </Button>
              </XStack>
              
              <YStack space="$3">
                {insights.map((insight, index) => (
                  <YStack 
                    key={index}
                    space="$3" 
                    padding="$4" 
                    backgroundColor="$gray2" 
                    borderRadius="$4"
                    borderWidth={1}
                    borderColor="$gray6"
                  >
                    <XStack alignItems="center" space="$3">
                      <Paragraph fontSize="$5">
                        {getInsightIcon(insight.type)}
                      </Paragraph>
                      <YStack flex={1}>
                        <H4>{insight.title}</H4>
                        <Paragraph color="$gray11" fontSize="$3">
                          {insight.type.toUpperCase()} • {Math.round(insight.confidence * 100)}% confidence
                        </Paragraph>
                      </YStack>
                    </XStack>
                    
                    <Paragraph color="$gray12">
                      {insight.description}
                    </Paragraph>
                    
                    {insight.relatedDreams && insight.relatedDreams.length > 0 && (
                      <XStack alignItems="center" space="$2">
                        <Paragraph fontSize="$2" color="$gray10">
                          Related dreams: {insight.relatedDreams.length}
                        </Paragraph>
                      </XStack>
                    )}
                  </YStack>
                ))}
              </YStack>
            </YStack>
          ) : (
            <YStack space="$3" padding="$4" backgroundColor="$gray2" borderRadius="$4">
              <H3>✨ AI Insights</H3>
              <Paragraph color="$gray11">
                Keep recording dreams to discover patterns and get personalized insights!
              </Paragraph>
              <Button 
                theme="blue" 
                size="$3" 
                onPress={loadPersonalizedInsights}
                disabled={isLoadingInsights}
              >
                Generate Insights
              </Button>
            </YStack>
          )}

          {/* Journal Prompts */}
          {journalPrompts.length > 0 && (
            <YStack space="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <H3>📝 Dream Journal Prompts</H3>
                <Button 
                  size="$2" 
                  variant="outlined" 
                  onPress={() => generateJournalPrompts()}
                >
                  New Prompts
                </Button>
              </XStack>
              
              <YStack space="$2">
                {journalPrompts.map((prompt, index) => (
                  <YStack 
                    key={index}
                    padding="$3" 
                    backgroundColor="$green2" 
                    borderRadius="$3"
                    borderWidth={1}
                    borderColor="$green6"
                  >
                    <XStack alignItems="flex-start" space="$2">
                      <Paragraph color="$green10" fontWeight="600">
                        {index + 1}.
                      </Paragraph>
                      <Paragraph color="$green11" flex={1}>
                        {prompt}
                      </Paragraph>
                    </XStack>
                  </YStack>
                ))}
              </YStack>
            </YStack>
          )}
        </>
      )}

      {/* Action Buttons */}
      <Separator />
      
      <XStack space="$3" justifyContent="center" flexWrap="wrap">
        <Button 
          theme="blue" 
          size="$3"
          onPress={loadPersonalizedInsights}
          disabled={isLoadingInsights}
        >
          {isLoadingInsights ? 'Loading...' : 'Refresh Insights'}
        </Button>
        
        <Button 
          variant="outlined" 
          size="$3"
          onPress={() => generateJournalPrompts(5)}
        >
          More Prompts
        </Button>
      </XStack>
    </YStack>
  );
}