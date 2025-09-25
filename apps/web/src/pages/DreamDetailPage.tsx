import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { YStack, XStack } from '@tamagui/stacks'
import { H1, H2, Paragraph } from '@tamagui/text'
import { Button } from '@tamagui/button'
import { useDreamStore } from '../stores/dreamStore'
import { useAIStore, useAIAnalysis } from '../stores/aiStore'

export function DreamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentDream, isLoading, error, fetchDreamById, deleteDream } = useDreamStore()
  const { analyzeDream, isAnalyzing } = useAIStore()
  const analysis = useAIAnalysis(id || '')

  useEffect(() => {
    // If somehow "new" gets here as ID, redirect to proper new dream page
    if (id === 'new') {
      navigate('/dreams/new', { replace: true })
      return
    }
    
    if (id) {
      fetchDreamById(id)
    }
  }, [id, fetchDreamById, navigate])

  const handleDelete = async () => {
    if (id && window.confirm('Are you sure you want to delete this dream?')) {
      await deleteDream(id)
      navigate('/dreams')
    }
  }

  const handleEdit = () => {
    navigate(`/dreams/${id}/edit`)
  }

  const handleAnalyze = async () => {
    if (currentDream) {
      await analyzeDream(currentDream)
    }
  }

  if (isLoading) {
    return (
      <YStack alignItems="center" paddingVertical="$8">
        <Paragraph color="$blue10" fontSize="$6">⟳</Paragraph>
        <Paragraph>Loading dream...</Paragraph>
      </YStack>
    )
  }

  if (error || !currentDream) {
    return (
      <YStack alignItems="center" paddingVertical="$8" space="$4">
        <Paragraph color="$red10">{error || 'Dream not found'}</Paragraph>
        <Button onPress={() => navigate('/dreams')}>
          Back to Dreams
        </Button>
      </YStack>
    )
  }

  return (
    <YStack space="$4" padding="$4">
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center">
        <Button variant="outlined" onPress={() => navigate('/dreams')}>
          ← Back to Dreams
        </Button>
        <XStack space="$2">
          <Button variant="outlined" onPress={handleEdit}>Edit</Button>
          <Button theme="red" variant="outlined" onPress={handleDelete}>Delete</Button>
        </XStack>
      </XStack>

      {/* Dream Content */}
      <YStack space="$4" padding="$4" backgroundColor="$gray1" borderRadius="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <H1 fontSize="$8">{currentDream.title}</H1>
          <Paragraph color="$gray10">
            {new Date(currentDream.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric', 
              month: 'long',
              day: 'numeric'
            })}
          </Paragraph>
        </XStack>

        <YStack space="$3">
          <H2 fontSize="$6">Dream Content</H2>
          <Paragraph fontSize="$5" lineHeight="$6">
            {currentDream.content}
          </Paragraph>
        </YStack>

        <XStack space="$4" alignItems="center">
          <YStack>
            <Paragraph fontSize="$4" fontWeight="600">Mood</Paragraph>
            <YStack 
              paddingHorizontal="$3" 
              paddingVertical="$2" 
              backgroundColor="$blue4" 
              borderRadius="$3"
            >
              <Paragraph color="$blue11" textTransform="capitalize">
                {currentDream.mood}
              </Paragraph>
            </YStack>
          </YStack>

          {currentDream.tags && currentDream.tags.length > 0 && (
            <YStack flex={1}>
              <Paragraph fontSize="$4" fontWeight="600" marginBottom="$2">Tags</Paragraph>
              <XStack space="$2" flexWrap="wrap">
                {currentDream.tags.map((tag: string) => (
                  <YStack 
                    key={tag}
                    paddingHorizontal="$3" 
                    paddingVertical="$1" 
                    backgroundColor="$gray4" 
                    borderRadius="$2"
                  >
                    <Paragraph fontSize="$3" color="$gray11">
                      {tag}
                    </Paragraph>
                  </YStack>
                ))}
              </XStack>
            </YStack>
          )}
        </XStack>

        <YStack marginTop="$4">
          <Paragraph fontSize="$3" color="$gray10">
            Created: {new Date(currentDream.createdAt).toLocaleString()}
          </Paragraph>
          {currentDream.updatedAt !== currentDream.createdAt && (
            <Paragraph fontSize="$3" color="$gray10">
              Last updated: {new Date(currentDream.updatedAt).toLocaleString()}
            </Paragraph>
          )}
        </YStack>
      </YStack>

      {/* Analysis Section */}
      <YStack space="$4" padding="$4" backgroundColor="$gray1" borderRadius="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <H2 fontSize="$7">Dream Analysis</H2>
          <Button 
            theme="blue" 
            onPress={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Dream'}
          </Button>
        </XStack>
        
        {analysis ? (
          <YStack space="$3">
            <Paragraph fontSize="$5" lineHeight="$6">
              {analysis.interpretation}
            </Paragraph>
            
            {analysis.themes && analysis.themes.length > 0 && (
              <YStack>
                <Paragraph fontSize="$4" fontWeight="600" marginBottom="$2">Themes</Paragraph>
                <XStack space="$2" flexWrap="wrap">
                  {analysis.themes.map((theme: string, index: number) => (
                    <YStack 
                      key={index}
                      paddingHorizontal="$3" 
                      paddingVertical="$1" 
                      backgroundColor="$purple4" 
                      borderRadius="$2"
                    >
                      <Paragraph fontSize="$3" color="$purple11">
                        {theme}
                      </Paragraph>
                    </YStack>
                  ))}
                </XStack>
              </YStack>
            )}

            {analysis.emotions && analysis.emotions.length > 0 && (
              <YStack>
                <Paragraph fontSize="$4" fontWeight="600" marginBottom="$2">Emotions</Paragraph>
                <XStack space="$2" flexWrap="wrap">
                  {analysis.emotions.map((emotionData: { emotion: string; intensity: number }, index: number) => (
                    <YStack 
                      key={index}
                      paddingHorizontal="$3" 
                      paddingVertical="$1" 
                      backgroundColor="$orange4" 
                      borderRadius="$2"
                    >
                      <Paragraph fontSize="$3" color="$orange11">
                        {emotionData.emotion} ({Math.round(emotionData.intensity * 100)}%)
                      </Paragraph>
                    </YStack>
                  ))}
                </XStack>
              </YStack>
            )}
          </YStack>
        ) : (
          <Paragraph color="$gray10" textAlign="center" paddingVertical="$8">
            No analysis available yet. Click "Analyze Dream" to get AI-powered insights about this dream.
          </Paragraph>
        )}
      </YStack>
    </YStack>
  )
}