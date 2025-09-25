import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TamaguiProvider } from '@tamagui/core';
import { config } from '../../tamagui.config';
import DreamPatternAnalysis from '../DreamPatternAnalysis';
import { EnhancedDreamDashboard } from '../EnhancedDreamDashboard';

// Mock the enhanced AI service
vi.mock('../../services/enhancedAI', () => ({
  enhancedAIService: {
    analyzePatterns: vi.fn().mockResolvedValue([]),
    generatePersonalizedInsights: vi.fn().mockResolvedValue([]),
    categorizeDream: vi.fn().mockResolvedValue([
      {
        category: 'emotional',
        confidence: 0.8,
        subcategories: ['processing'],
        lucidityLevel: 0.3,
        vividity: 0.7,
        emotionalIntensity: 0.6,
        symbolDensity: 0.4,
        narrativeCoherence: 0.8,
      }
    ]),
    generateLearningInsights: vi.fn().mockResolvedValue([]),
  },
}));

// Mock the dream store with proper path
vi.mock('../../stores/dreamStore', () => ({
  useDreams: vi.fn(() => []),
  useDreamStore: vi.fn(),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <TamaguiProvider config={config}>
      {component}
    </TamaguiProvider>
  );
};

describe('Enhanced AI Components', () => {
  describe('DreamPatternAnalysis', () => {
    it('shows message when no dreams are available', () => {
      renderWithProvider(<DreamPatternAnalysis />);
      
      expect(screen.getByText('Pattern Analysis')).toBeInTheDocument();
      expect(screen.getByText(/Record at least 2 dreams/)).toBeInTheDocument();
    });

    it('renders component with Tamagui elements', () => {
      renderWithProvider(<DreamPatternAnalysis />);
      
      // Test that the component renders basic structure
      expect(screen.getByText('Pattern Analysis')).toBeInTheDocument();
    });
  });

  describe('EnhancedDreamDashboard', () => {
    it('shows welcome message when no dreams are available', () => {
      renderWithProvider(<EnhancedDreamDashboard />);
      
      expect(screen.getByText('Enhanced Dream Dashboard')).toBeInTheDocument();
      expect(screen.getByText(/Start recording your dreams/)).toBeInTheDocument();
    });

    it('renders component structure', () => {
      renderWithProvider(<EnhancedDreamDashboard />);
      
      // Test that the component renders basic structure
      expect(screen.getByText('Enhanced Dream Dashboard')).toBeInTheDocument();
    });
  });
});