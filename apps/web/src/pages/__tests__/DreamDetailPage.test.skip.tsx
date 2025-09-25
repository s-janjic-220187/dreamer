import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Zustand stores - must be hoisted
vi.mock('../../stores/dreamStore', () => ({
  useDreamStore: vi.fn(() => ({
    currentDream: null,
    isLoading: false,
    fetchDreamById: vi.fn(),
    deleteDream: vi.fn(),
  })),
}));

vi.mock('../../stores/aiStore', () => ({
  useAIStore: vi.fn(() => ({
    analyses: {},
    isAnalyzing: false,
    analyzeDream: vi.fn(),
  })),
}));

// Mock react-router-dom - must be hoisted
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: '1' }),
  };
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TamaguiProvider } from '@tamagui/core';
import { config } from '../../tamagui.config';
import { DreamDetailPage } from '../DreamDetailPage';

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </TamaguiProvider>
  );
}

describe('DreamDetailPage', () => {
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

  const mockAnalysis = {
    id: 'analysis-1',
    dreamId: '1',
    interpretation: 'This dream represents your desire for freedom and transcendence.',
    themes: ['freedom', 'transcendence', 'nature'],
    symbols: [
      { name: 'flying', meaning: 'desire for freedom and escape from limitations' },
      { name: 'mountains', meaning: 'obstacles to overcome or goals to achieve' },
      { name: 'golden wings', meaning: 'spiritual elevation and divine connection' }
    ],
    emotions: [
      { emotion: 'joy', intensity: 0.8 },
      { emotion: 'freedom', intensity: 0.9 }
    ],
    createdAt: new Date('2024-01-15'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: '1' });
    
    mockUseDreamStore.mockReturnValue({
      currentDream: mockDream,
      isLoading: false,
      fetchDreamById: mockFetchDreamById,
      deleteDream: mockDeleteDream,
    });
    
    mockUseAIStore.mockReturnValue({
      analyses: { '1': mockAnalysis },
      isAnalyzing: false,
      analyzeDream: mockAnalyzeDream,
    });
  });

  it('renders dream details correctly', async () => {
    render(
      <TestWrapper>
        <DreamDetailPage />
      </TestWrapper>
    );

    expect(screen.getByText('Flying Dream')).toBeInTheDocument();
    expect(screen.getByText('I was flying over beautiful mountains with golden wings.')).toBeInTheDocument();
    expect(screen.getByText('positive')).toBeInTheDocument();
    expect(screen.getByText('#flying')).toBeInTheDocument();
    expect(screen.getByText('#mountains')).toBeInTheDocument();
    expect(screen.getByText('#wings')).toBeInTheDocument();
  });

  it('shows loading state when fetching dream', () => {
    mockUseDreamStore.mockReturnValue({
      currentDream: null,
      isLoading: true,
      fetchDreamById: vi.fn(),
      deleteDream: vi.fn(),
    });

    render(
      <TestWrapper>
        <DreamDetailPage />
      </TestWrapper>
    );

    expect(screen.getByText('Loading dream...')).toBeInTheDocument();
  });

  it('shows dream not found message when dream does not exist', () => {
    mockUseDreamStore.mockReturnValue({
      currentDream: null,
      isLoading: false,
      fetchDreamById: vi.fn(),
      deleteDream: vi.fn(),
    });

    render(
      <TestWrapper>
        <DreamDetailPage />
      </TestWrapper>
    );

    expect(screen.getByText('Dream not found')).toBeInTheDocument();
  });

  it('displays AI analysis when available', () => {
    render(
      <TestWrapper>
        <DreamDetailPage />
      </TestWrapper>
    );

    expect(screen.getByText('Dream Analysis')).toBeInTheDocument();
    expect(screen.getByText('This dream represents your desire for freedom and transcendence.')).toBeInTheDocument();
    expect(screen.getByText('freedom')).toBeInTheDocument();
    expect(screen.getByText('transcendence')).toBeInTheDocument();
  });

  it('allows requesting AI analysis when not available', () => {
    mockUseAIStore.mockReturnValue({
      analyses: {},
      isAnalyzing: false,
      analyzeDream: vi.fn(),
    });

    render(
      <TestWrapper>
        <DreamDetailPage />
      </TestWrapper>
    );

    const analyzeButton = screen.getByText('Analyze Dream');
    expect(analyzeButton).toBeInTheDocument();

    fireEvent.click(analyzeButton);
    expect(mockAnalyzeDream).toHaveBeenCalledWith(mockDream);
  });

  it('shows analyzing state during AI analysis', () => {
    mockUseAIStore.mockReturnValue({
      analyses: {},
      isAnalyzing: true,
      analyzeDream: vi.fn(),
    });

    render(
      <TestWrapper>
        <DreamDetailPage />
      </TestWrapper>
    );

    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  });

  it('navigates to edit page when edit button is clicked', () => {
    render(
      <TestWrapper>
        <DreamDetailPage />
      </TestWrapper>
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dreams/1/edit');
  });

  it('handles dream deletion', async () => {
    mockDeleteDream.mockResolvedValue(undefined);

    render(
      <TestWrapper>
        <DreamDetailPage />
      </TestWrapper>
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteDream).toHaveBeenCalledWith('1');
      expect(mockNavigate).toHaveBeenCalledWith('/dreams');
    });
  });

  it('formats date correctly', () => {
    render(
      <TestWrapper>
        <DreamDetailPage />
      </TestWrapper>
    );

    // Should display the formatted date
    expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
  });
});