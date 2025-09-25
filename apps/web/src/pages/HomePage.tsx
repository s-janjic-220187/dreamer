import { YStack } from '@tamagui/stacks'
import { H1, H2, Paragraph } from '@tamagui/text'
import { Button } from '@tamagui/button'
import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <YStack space="$4" alignItems="center" paddingVertical="$8">
      <YStack space="$2" alignItems="center" maxWidth={600}>
        <H1 textAlign="center" fontSize="$10">
          Welcome to Dream Analyzer
        </H1>
        
        <H2 textAlign="center" fontSize="$6" color="$gray11">
          Unlock the meaning behind your dreams
        </H2>
        
        <Paragraph textAlign="center" fontSize="$5" color="$gray10" marginTop="$4">
          Our AI-powered dream analysis helps you understand the symbols, themes, and meanings 
          in your dreams. Record your dreams with voice or text, and get personalized interpretations.
        </Paragraph>
      </YStack>

      <YStack space="$3" alignItems="center" marginTop="$6">
        <Link to="/dreams">
          <Button size="$5" theme="blue">
            Start Analyzing Dreams
          </Button>
        </Link>
        
        <Link to="/dreams">
          <Button size="$4" variant="outlined">
            View Dream Journal
          </Button>
        </Link>
      </YStack>

      <YStack space="$4" marginTop="$8" maxWidth={800}>
        <H2 fontSize="$7" textAlign="center">
          Features
        </H2>
        
        <YStack space="$3">
          <YStack space="$2" padding="$4" backgroundColor="$gray2" borderRadius="$4">
            <H2 fontSize="$5">🎤 Voice Recording</H2>
            <Paragraph>Record your dreams using voice-to-text for quick and easy entry</Paragraph>
          </YStack>
          
          <YStack space="$2" padding="$4" backgroundColor="$gray2" borderRadius="$4">
            <H2 fontSize="$5">🤖 AI Analysis</H2>
            <Paragraph>Get detailed interpretations using advanced AI dream analysis</Paragraph>
          </YStack>
          
          <YStack space="$2" padding="$4" backgroundColor="$gray2" borderRadius="$4">
            <H2 fontSize="$5">📚 Dream Journal</H2>
            <Paragraph>Keep track of your dreams and see patterns over time</Paragraph>
          </YStack>
          
          <YStack space="$2" padding="$4" backgroundColor="$gray2" borderRadius="$4">
            <H2 fontSize="$5">🔒 Privacy First</H2>
            <Paragraph>All processing happens locally - your dreams stay private</Paragraph>
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  )
}