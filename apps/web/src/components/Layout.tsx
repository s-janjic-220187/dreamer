import { type ReactNode } from 'react'
import { XStack, YStack } from '@tamagui/stacks'
import { H1 } from '@tamagui/text'
import { Button } from '@tamagui/button'
import { Separator } from '@tamagui/separator'
import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <XStack 
        padding="$4" 
        backgroundColor="$color1"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        alignItems="center"
        justifyContent="space-between"
      >
        <H1 color="$color12" fontSize="$6">
          Dream Analyzer
        </H1>
        
        <XStack space="$2">
          <Link to="/">
            <Button 
              variant={location.pathname === '/' ? 'outlined' : undefined}
              size="$3"
            >
              Home
            </Button>
          </Link>
          <Link to="/dreams">
            <Button 
              variant={location.pathname.startsWith('/dreams') ? 'outlined' : undefined}
              size="$3"
            >
              Dreams
            </Button>
          </Link>
          <Link to="/ai-insights">
            <Button 
              variant={location.pathname === '/ai-insights' ? 'outlined' : undefined}
              size="$3"
            >
              AI Insights
            </Button>
          </Link>
        </XStack>
      </XStack>

      <Separator />

      {/* Main Content */}
      <YStack flex={1} padding="$4">
        <main role="main">
          {children}
        </main>
      </YStack>
    </YStack>
  )
}