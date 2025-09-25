import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { YStack, XStack } from '@tamagui/stacks';
import { H2, Paragraph } from '@tamagui/text';
import { Button } from '@tamagui/button';
import { Separator } from '@tamagui/separator';
import { useDreamStore } from '../stores/dreamStore';
import { DreamVisualizationCharts } from '../components/DreamVisualizationCharts';
import { AdvancedDreamSearch } from '../components/AdvancedDreamSearch';
import { DreamSharingFeatures } from '../components/DreamSharingFeatures';
import { UserPreferenceSystem } from '../components/UserPreferenceSystem';
import PrivacyControlsComponent from '../components/PrivacyControlsComponent';

export function DreamsPage() {
  const navigate = useNavigate();
  const { dreams, isLoading, error, fetchDreams } = useDreamStore();
  const [activeTab, setActiveTab] = useState('dreams');

  useEffect(() => {
    fetchDreams();
  }, [fetchDreams]);

  // Ensure dreams is always an array
  const safelyDreams = Array.isArray(dreams) ? dreams : [];

  const handleAddDream = () => {
    navigate('/dreams/new');
  };

  const handleViewDream = (dreamId: string) => {
    navigate(`/dreams/${dreamId}`);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive':
        return '$green10';
      case 'negative':
        return '$red10';
      case 'mixed':
        return '$orange10';
      default:
        return '$gray10';
    }
  };

  if (isLoading) {
    return (
      <YStack space="$4" padding="$4" flex={1} alignItems="center" justifyContent="center">
        <Paragraph color="$blue10" fontSize="$6">⟳</Paragraph>
        <Paragraph color="$gray11">Loading your dreams...</Paragraph>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack space="$4" padding="$4" flex={1}>
        <H2>My Dreams</H2>
        <YStack 
          padding="$4" 
          backgroundColor="$red2" 
          borderRadius="$4" 
          borderWidth={1} 
          borderColor="$red6"
        >
          <Paragraph color="$red11">Error: {error}</Paragraph>
          <Button 
            theme="red" 
            size="$3" 
            marginTop="$3"
            onPress={fetchDreams}
          >
            Try Again
          </Button>
        </YStack>
      </YStack>
    );
  }

  const tabs = [
    { id: 'dreams', label: 'Dreams', icon: '📖' },
    { id: 'analytics', label: 'Analytics', icon: '�' },
    { id: 'search', label: 'Search', icon: '�' },
    { id: 'sharing', label: 'Sharing', icon: '🤝' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dreams':
        return (
          <YStack space="$4">
            <H2>My Dreams</H2>
            
            <XStack justifyContent="space-between" alignItems="center">
              <Paragraph color="$gray11">
                {dreams.length === 0 
                  ? 'Start your dream journey' 
                  : `${dreams.length} dream${dreams.length === 1 ? '' : 's'} recorded`
                }
              </Paragraph>
              <Button 
                theme="blue" 
                size="$3" 
                onPress={handleAddDream}
              >
                Add New Dream
              </Button>
            </XStack>

            <Separator />

            {/* Dream List */}
            <YStack space="$3">
              {safelyDreams.length === 0 ? (
                <YStack 
                  padding="$6" 
                  alignItems="center" 
                  space="$4"
                  backgroundColor="$gray2" 
                  borderRadius="$4"
                >
                  <Paragraph fontSize="$6" color="$gray11">
                    No dreams recorded yet
                  </Paragraph>
                  <Paragraph color="$gray10" textAlign="center">
                    Start by recording your first dream and unlock the mysteries of your subconscious mind.
                  </Paragraph>
                  <Button 
                    theme="blue" 
                    size="$4"
                    onPress={handleAddDream}
                  >
                    Record Your First Dream
                  </Button>
                </YStack>
              ) : (
                safelyDreams.map((dream) => (
                  <YStack 
                    key={dream.id}
                    data-testid="dream-card"
                    padding="$4" 
                    backgroundColor="$gray2" 
                    borderRadius="$4" 
                    borderWidth={1} 
                    borderColor="$gray5"
                    hoverStyle={{
                      backgroundColor: '$gray3',
                      borderColor: '$gray6',
                    }}
                    pressStyle={{
                      backgroundColor: '$gray4',
                    }}
                    cursor="pointer"
                    onPress={() => handleViewDream(dream.id)}
                  >
                    <XStack justifyContent="space-between" alignItems="flex-start">
                      <YStack flex={1} space="$2">
                        <Paragraph fontSize="$5" fontWeight="600">
                          {dream.title}
                        </Paragraph>
                        <Paragraph color="$gray11" numberOfLines={2}>
                          {dream.content}
                        </Paragraph>
                        <XStack space="$3" alignItems="center" flexWrap="wrap">
                          <Paragraph fontSize="$2" color="$gray10">
                            {formatDate(dream.date)}
                          </Paragraph>
                          <Paragraph fontSize="$2" color={getMoodColor(dream.mood)} textTransform="capitalize">
                            {dream.mood}
                          </Paragraph>
                          {dream.tags.length > 0 && (
                            <XStack space="$1">
                              {dream.tags.slice(0, 3).map((tag, index) => (
                                <Paragraph 
                                  key={index}
                                  fontSize="$1" 
                                  color="$blue10"
                                  backgroundColor="$blue3"
                                  paddingHorizontal="$2"
                                  paddingVertical="$1"
                                  borderRadius="$2"
                                >
                                  {tag}
                                </Paragraph>
                              ))}
                              {dream.tags.length > 3 && (
                                <Paragraph fontSize="$1" color="$gray10">
                                  +{dream.tags.length - 3} more
                                </Paragraph>
                              )}
                            </XStack>
                          )}
                        </XStack>
                      </YStack>
                      <Button 
                        size="$2" 
                        chromeless
                        onPress={(e) => {
                          e.stopPropagation();
                          handleViewDream(dream.id);
                        }}
                      >
                        View
                      </Button>
                    </XStack>
                  </YStack>
                ))
              )}
            </YStack>
          </YStack>
        );
      
      case 'search':
        return <AdvancedDreamSearch />;
      
      case 'analytics':
        return <DreamVisualizationCharts />;
      
      case 'sharing':
        return <DreamSharingFeatures />;
      
      case 'preferences':
        return <UserPreferenceSystem />;
      
      case 'privacy':
        return <PrivacyControlsComponent />;
      
      default:
        return null;
    }
  };

  return (
    <YStack space="$4" padding="$4" flex={1}>
      {/* Tab Navigation */}
      <XStack 
        space="$2" 
        padding="$2" 
        backgroundColor="$gray2" 
        borderRadius="$4"
        flexWrap="wrap"
      >
        {tabs.map(tab => (
          <Button
            key={tab.id}
            size="$3"
            variant={activeTab === tab.id ? "outlined" : undefined}
            backgroundColor={activeTab === tab.id ? "$blue4" : "$gray1"}
            borderColor={activeTab === tab.id ? "$blue8" : "transparent"}
            onPress={() => setActiveTab(tab.id)}
          >
            <span style={{ marginRight: '8px' }}>{tab.icon}</span>
            {tab.label}
          </Button>
        ))}
      </XStack>

      {/* Tab Content */}
      <YStack flex={1}>
        {renderTabContent()}
      </YStack>
    </YStack>
  );
}