import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the AI store - must be hoisted
vi.mock('../../stores/aiStore', () => ({
  useAIStore: vi.fn(() => ({
    analyzeDream: vi.fn(),
  })),
  useAIAnalysis: vi.fn(() => null),
  useAILoading: vi.fn(() => ({
    isAnalyzing: false,
  })),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TamaguiProvider } from '@tamagui/core';
import { config } from '../../tamagui.config';
import { DreamAnalysisComponent } from '../DreamAnalysisComponent';
import type { DreamAnalysis } from '../../services/ai';

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config}>
      {children}
    </TamaguiProvider>
  );
}

describe('DreamAnalysisComponent', () => {
  const mockDream = {
    id: '1',
    title: 'Flying Dream',
    content: 'I was flying over beautiful mountains with golden wings.',
    mood: 'positive' as const,
    tags: ['flying', 'mountains', 'wings'],
    date: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  };

  const mockAnalysis: DreamAnalysis = {
    id: 'analysis-1',
    dreamId: '1',
    interpretation: 'This dream represents your subconscious desires for freedom and adventure.',
    themes: ['freedom', 'adventure', 'transformation'],
    symbols: [
      { symbol: 'flying', meaning: 'desire for freedom and escape from limitations', confidence: 0.9 },
      { symbol: 'ocean', meaning: 'emotional depth and unconscious mind', confidence: 0.8 },
      { symbol: 'golden light', meaning: 'spiritual awakening and enlightenment', confidence: 0.85 }
    ],
    emotions: [
      { emotion: 'joy', intensity: 0.8 },
      { emotion: 'excitement', intensity: 0.7 },
      { emotion: 'wonder', intensity: 0.9 }
    ],
    patterns: ['transformation', 'spiritual growth'],
    suggestions: ['Consider keeping a dream journal', 'Explore meditation practices'],
    createdAt: new Date('2024-01-15'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAIStore.mockReturnValue({
      analyzeDream: mockAnalyzeDream,
    });
    
    mockUseAIAnalysis.mockReturnValue(mockAnalysis);
    
    mockUseAILoading.mockReturnValue({
      isAnalyzing: false,
    });
  });

  it('renders dream analysis with interpretation', () => {
    render(
      <TestWrapper>
        <DreamAnalysisComponent dream={mockDream} />
      </TestWrapper>
    );

    expect(screen.getByText('✨ Dream Interpretation')).toBeInTheDocument();
    expect(screen.getByText('This dream represents your subconscious desires for freedom and adventure.')).toBeInTheDocument();
  });

  it('displays themes correctly', () => {
    render(
      <TestWrapper>
        <DreamAnalysisComponent dream={mockDream} />
      </TestWrapper>
    );

    expect(screen.getByText('🎭 Themes')).toBeInTheDocument();
    expect(screen.getByText('freedom')).toBeInTheDocument();
    expect(screen.getByText('adventure')).toBeInTheDocument();
    expect(screen.getByText('transformation')).toBeInTheDocument();
  });

  it('displays symbols with their meanings and confidence', () => {
    render(
      <TestWrapper>
        <DreamAnalysisComponent dream={mockDream} />
      </TestWrapper>
    );

    expect(screen.getByText('🔮 Symbols & Meanings')).toBeInTheDocument();
    
    // Check symbols
    expect(screen.getByText('flying')).toBeInTheDocument();
    expect(screen.getByText('desire for freedom and escape from limitations')).toBeInTheDocument();
    expect(screen.getByText('(90% confidence)')).toBeInTheDocument();
  });

  it('displays emotions with intensity bars', () => {
    render(
      <TestWrapper>
        <DreamAnalysisComponent dream={mockDream} />
      </TestWrapper>
    );

    expect(screen.getByText('💭 Emotional Landscape')).toBeInTheDocument();
    expect(screen.getByText('joy')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('wonder')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('displays suggestions when available', () => {
    render(
      <TestWrapper>
        <DreamAnalysisComponent dream={mockDream} />
      </TestWrapper>
    );

    expect(screen.getByText('💡 Insights & Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Consider keeping a dream journal')).toBeInTheDocument();
    expect(screen.getByText('Explore meditation practices')).toBeInTheDocument();
  });

  it('shows analyzing state', () => {
    mockUseAILoading.mockReturnValue({
      isAnalyzing: true,
    });

    render(
      <TestWrapper>
        <DreamAnalysisComponent dream={mockDream} />
      </TestWrapper>
    );

    expect(screen.getByText('Analyzing Your Dream...')).toBeInTheDocument();
    expect(screen.getByText(/Our AI is interpreting the symbols/)).toBeInTheDocument();
  });

  it('shows analyze button when no analysis exists', () => {
    mockUseAIAnalysis.mockReturnValue(null);
    mockUseAILoading.mockReturnValue({
      isAnalyzing: false,
    });

    render(
      <TestWrapper>
        <DreamAnalysisComponent dream={mockDream} />
      </TestWrapper>
    );

    expect(screen.getByText('Dream Analysis')).toBeInTheDocument();
    expect(screen.getByText('Analyze This Dream')).toBeInTheDocument();
  });

  it('calls analyzeDream when analyze button is clicked', async () => {
    mockUseAIAnalysis.mockReturnValue(null);
    mockUseAILoading.mockReturnValue({
      isAnalyzing: false,
    });

    render(
      <TestWrapper>
        <DreamAnalysisComponent dream={mockDream} />
      </TestWrapper>
    );

    const analyzeButton = screen.getByText('Analyze This Dream');
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(mockAnalyzeDream).toHaveBeenCalledWith(mockDream);
    });
  });

  it('allows re-analyzing existing dream', () => {
    render(
      <TestWrapper>
        <DreamAnalysisComponent dream={mockDream} />
      </TestWrapper>
    );

    const reAnalyzeButton = screen.getByText('Re-analyze Dream');
    fireEvent.click(reAnalyzeButton);

    expect(mockAnalyzeDream).toHaveBeenCalledWith(mockDream);
  });

  it('handles empty arrays gracefully', () => {
    const emptyAnalysis = {
      ...mockAnalysis,
      themes: [],
      symbols: [],
      emotions: [],
      suggestions: [],
    };
    
    mockUseAIAnalysis.mockReturnValue(emptyAnalysis);

    render(
      <TestWrapper>
        <DreamAnalysisComponent dream={mockDream} />
      </TestWrapper>
    );

    // Should still render main interpretation
    expect(screen.getByText('✨ Dream Interpretation')).toBeInTheDocument();
    
    // Should not render empty sections
    expect(screen.queryByText('🎭 Themes')).not.toBeInTheDocument();
    expect(screen.queryByText('🔮 Symbols & Meanings')).not.toBeInTheDocument();
    expect(screen.queryByText('💭 Emotional Landscape')).not.toBeInTheDocument();
    expect(screen.queryByText('💡 Insights & Suggestions')).not.toBeInTheDocument();
  });
});