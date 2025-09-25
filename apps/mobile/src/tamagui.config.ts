// Tamagui configuration for React Native
// This will be properly configured once dependencies are installed

export const theme = {
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6', 
    background: '#1a1a2e',
    surface: '#16213e',
    text: '#ffffff',
    textSecondary: '#94a3b8',
    accent: '#f59e0b',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16
  }
}

export type Theme = typeof theme