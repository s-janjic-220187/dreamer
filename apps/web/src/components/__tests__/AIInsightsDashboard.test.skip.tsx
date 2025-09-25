import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from '@tamagui/core';
import { config } from '../../tamagui.config';
import { AIInsightsDashboard } from '../AIInsightsDashboard';
import type { AIInsight } from '../../services/ai';

// Mock Zustand stores with proper vi.mocked
vi.mock('../../stores/aiStore', () => ({
  useAIStore: vi.fn(),
  useAIInsights: vi.fn(),
  useAILoading: vi.fn(),
  useAIError: vi.fn(),
}));

vi.mock('../../stores/dreamStore', () => ({
  useDreamStore: vi.fn(),
}));

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config}>
      {children}
    </TamaguiProvider>
  );
}

describe('AIInsightsDashboard', () => {
  const mockInsights: AIInsight[] = [
    {
      type: 'pattern',
      title: 'Recurring Flying Dreams',
      description: 'You often dream about flying, which suggests a desire for freedom and transcendence.',
      confidence: 0.85,
      relatedDreams: ['dream-1', 'dream-2', 'dream-3'],
    },
    {
      type: 'symbol',
      title: 'Water Symbolism',
      description: 'Water appears frequently in your dreams, representing emotional depth and cleansing.',
      confidence: 0.78,
      relatedDreams: ['dream-4', 'dream-5'],
    },
    {
      type: 'emotion',
      title: 'Anxiety Patterns',
      description: 'Recent dreams show increased anxiety levels. Consider stress management techniques.',
      confidence: 0.92,
      relatedDreams: ['dream-6'],
    },
    {
      type: 'suggestion',
      title: 'Dream Journaling Benefits',
      description: 'Keeping a consistent dream journal could help improve dream recall and analysis.',
      confidence: 0.75,
    },
  ];

  const mockDreams = [
    { id: 'dream-1', title: 'Flying Over Mountains', content: 'I was soaring...', mood: 'positive', tags: ['flying'] },
    { id: 'dream-2', title: 'Ocean Dream', content: 'Deep blue waters...', mood: 'peaceful', tags: ['water'] },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAIStore.mockReturnValue({
      loadPersonalizedInsights: mockLoadPersonalizedInsights,
      getPatternInsights: mockGetPatternInsights,
    });
    
    mockUseAIInsights.mockReturnValue(mockInsights);
    
    mockUseAILoading.mockReturnValue({
      isLoadingInsights: false,
    });
    
    mockUseAIError.mockReturnValue(null);
    
    mockUseDreamStore.mockReturnValue({
      dreams: mockDreams,
    });
  });

  it('renders AI insights dashboard with insights', () => {
    render(
      <TestWrapper>
        <AIInsightsDashboard />
      </TestWrapper>
    );

    expect(screen.getByText('AI Insights Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Recurring Flying Dreams')).toBeInTheDocument();
    expect(screen.getByText('Water Symbolism')).toBeInTheDocument();
    expect(screen.getByText('Anxiety Patterns')).toBeInTheDocument();
    expect(screen.getByText('Dream Journaling Benefits')).toBeInTheDocument();
  });

  it('displays different insight types with appropriate icons', () => {
    render(
      <TestWrapper>
        <AIInsightsDashboard />
      </TestWrapper>
    );

    // Check for pattern insight
    expect(screen.getByText('🔄 Pattern')).toBeInTheDocument();
    
    // Check for symbol insight
    expect(screen.getByText('🔮 Symbol')).toBeInTheDocument();
    
    // Check for emotion insight
    expect(screen.getByText('💭 Emotion')).toBeInTheDocument();
    
    // Check for suggestion insight
    expect(screen.getByText('💡 Suggestion')).toBeInTheDocument();
  });

  it('shows confidence levels for insights', () => {
    render(
      <TestWrapper>
        <AIInsightsDashboard />
      </TestWrapper>
    );

    expect(screen.getByText('85% confidence')).toBeInTheDocument();
    expect(screen.getByText('78% confidence')).toBeInTheDocument();
    expect(screen.getByText('92% confidence')).toBeInTheDocument();
    expect(screen.getByText('75% confidence')).toBeInTheDocument();
  });

  it('displays related dreams count when available', () => {
    render(
      <TestWrapper>
        <AIInsightsDashboard />
      </TestWrapper>
    );

    expect(screen.getByText('3 related dreams')).toBeInTheDocument();
    expect(screen.getByText('2 related dreams')).toBeInTheDocument();
    expect(screen.getByText('1 related dream')).toBeInTheDocument();
  });

  it('shows loading state when insights are being loaded', () => {
    mockUseAILoading.mockReturnValue({
      isLoadingInsights: true,
    });

    render(
      <TestWrapper>
        <AIInsightsDashboard />
      </TestWrapper>
    );

    expect(screen.getByText('Loading AI Insights...')).toBeInTheDocument();
    expect(screen.getByText(/Analyzing your dream patterns/)).toBeInTheDocument();
  });

  it('shows empty state when no insights are available', () => {
    mockUseAIInsights.mockReturnValue([]);

    render(
      <TestWrapper>
        <AIInsightsDashboard />
      </TestWrapper>
    );

    expect(screen.getByText('No Insights Yet')).toBeInTheDocument();
    expect(screen.getByText(/Record more dreams/)).toBeInTheDocument();
    expect(screen.getByText('Generate Insights')).toBeInTheDocument();
  });

  it('displays error message when there is an error', () => {
    mockUseAIError.mockReturnValue('Failed to load insights');

    render(
      <TestWrapper>
        <AIInsightsDashboard />
      </TestWrapper>
    );

    expect(screen.getByText('Error Loading Insights')).toBeInTheDocument();
    expect(screen.getByText('Failed to load insights')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('calls loadPersonalizedInsights when generate insights button is clicked', () => {
    mockUseAIInsights.mockReturnValue([]);

    render(
      <TestWrapper>
        <AIInsightsDashboard />
      </TestWrapper>
    );

    const generateButton = screen.getByText('Generate Insights');
    fireEvent.click(generateButton);

    expect(mockLoadPersonalizedInsights).toHaveBeenCalledTimes(1);
  });

  it('calls loadPersonalizedInsights when retry button is clicked', () => {
    mockUseAIError.mockReturnValue('Failed to load insights');

    render(
      <TestWrapper>
        <AIInsightsDashboard />
      </TestWrapper>
    );

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    expect(mockLoadPersonalizedInsights).toHaveBeenCalledTimes(1);
  });

  it('filters and sorts insights by confidence', () => {
    render(
      <TestWrapper>
        <AIInsightsDashboard />
      </TestWrapper>
    );

    // Get all confidence scores and verify they're sorted (descending)
    const confidenceElements = screen.getAllByText(/\d+% confidence/);
    expect(confidenceElements[0]).toHaveTextContent('92% confidence'); // Anxiety Patterns
    expect(confidenceElements[1]).toHaveTextContent('85% confidence'); // Flying Dreams
    expect(confidenceElements[2]).toHaveTextContent('78% confidence'); // Water Symbolism
    expect(confidenceElements[3]).toHaveTextContent('75% confidence'); // Dream Journaling
  });

  it('handles insights without related dreams', () => {
    const insightsWithoutRelated = [
      {
        type: 'suggestion' as const,
        title: 'Test Insight',
        description: 'Test description',
        confidence: 0.8,
      },
    ];
    
    mockUseAIInsights.mockReturnValue(insightsWithoutRelated);

    render(
      <TestWrapper>
        <AIInsightsDashboard />
      </TestWrapper>
    );

    expect(screen.getByText('Test Insight')).toBeInTheDocument();
    expect(screen.queryByText(/related dream/)).not.toBeInTheDocument();
  });

  it('refreshes insights on mount', () => {
    render(
      <TestWrapper>
        <AIInsightsDashboard />
      </TestWrapper>
    );

    // Should call loadPersonalizedInsights on mount
    expect(mockLoadPersonalizedInsights).toHaveBeenCalledTimes(1);
  });

  it('shows refresh button for manual refresh', () => {
    render(
      <TestWrapper>
        <AIInsightsDashboard />
      </TestWrapper>
    );

    const refreshButton = screen.getByText('Refresh Insights');
    fireEvent.click(refreshButton);

    expect(mockLoadPersonalizedInsights).toHaveBeenCalledTimes(2); // Once on mount, once on click
  });
});