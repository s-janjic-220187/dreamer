import React, { type ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { TamaguiProvider } from '@tamagui/core'
// @ts-ignore - tamagui config may not be found during tests
import { config } from '../tamagui.config'

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <TamaguiProvider config={config}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </TamaguiProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// API response utilities
export const mockApiResponse = (data: any, success = true) => ({
  success,
  data,
  timestamp: new Date().toISOString()
})

// Test data factories
export const createMockDream = (overrides?: Partial<any>) => ({
  id: 'test-dream-id',
  title: 'Test Dream',
  content: 'This is a test dream content',
  date: new Date().toISOString(),
  mood: 'neutral',
  tags: ['test'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
})

// User event helpers
export { default as userEvent } from '@testing-library/user-event'