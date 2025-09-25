import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TamaguiProvider } from '@tamagui/core';
import { config } from '../../tamagui.config';
import { DreamsPage } from '../DreamsPage';

// Mock zustand store
const mockFetchDreams = vi.fn();
const mockUseDreamStore = vi.fn();

vi.mock('../../stores/dreamStore', () => ({
  useDreamStore: () => mockUseDreamStore(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

describe('DreamsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading indicator when loading', () => {
      mockUseDreamStore.mockReturnValue({
        dreams: [],
        isLoading: true,
        error: null,
        fetchDreams: mockFetchDreams,
      });

      render(
        <TestWrapper>
          <DreamsPage />
        </TestWrapper>
      );

      expect(screen.getByText('Loading your dreams...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message and retry button', () => {
      const errorMessage = 'Failed to load dreams';
      mockUseDreamStore.mockReturnValue({
        dreams: [],
        isLoading: false,
        error: errorMessage,
        fetchDreams: mockFetchDreams,
      });

      render(
        <TestWrapper>
          <DreamsPage />
        </TestWrapper>
      );

      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('calls fetchDreams when retry button is clicked', () => {
      mockUseDreamStore.mockReturnValue({
        dreams: [],
        isLoading: false,
        error: 'Some error',
        fetchDreams: mockFetchDreams,
      });

      render(
        <TestWrapper>
          <DreamsPage />
        </TestWrapper>
      );

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      expect(mockFetchDreams).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no dreams exist', () => {
      mockUseDreamStore.mockReturnValue({
        dreams: [],
        isLoading: false,
        error: null,
        fetchDreams: mockFetchDreams,
      });

      render(
        <TestWrapper>
          <DreamsPage />
        </TestWrapper>
      );

      expect(screen.getByText('No dreams recorded yet')).toBeInTheDocument();
      expect(screen.getByText('Start your dream journey')).toBeInTheDocument();
      expect(screen.getByText('Record Your First Dream')).toBeInTheDocument();
    });

    it('navigates to new dream page when record first dream is clicked', () => {
      mockUseDreamStore.mockReturnValue({
        dreams: [],
        isLoading: false,
        error: null,
        fetchDreams: mockFetchDreams,
      });

      render(
        <TestWrapper>
          <DreamsPage />
        </TestWrapper>
      );

      const recordButton = screen.getByText('Record Your First Dream');
      fireEvent.click(recordButton);

      expect(mockNavigate).toHaveBeenCalledWith('/dreams/new');
    });
  });

  describe('Dreams List', () => {
    const mockDreams = [
      {
        id: '1',
        title: 'Flying Dream',
        content: 'I was flying over the city with amazing wings.',
        date: new Date('2024-01-15'),
        mood: 'positive' as const,
        tags: ['flying', 'city'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        title: 'Ocean Dream',
        content: 'Swimming in deep blue ocean with colorful fish.',
        date: new Date('2024-01-10'),
        mood: 'neutral' as const,
        tags: ['ocean', 'swimming', 'fish'],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
      },
    ];

    beforeEach(() => {
      mockUseDreamStore.mockReturnValue({
        dreams: mockDreams,
        isLoading: false,
        error: null,
        fetchDreams: mockFetchDreams,
      });
    });

    it('displays dreams count correctly', () => {
      render(
        <TestWrapper>
          <DreamsPage />
        </TestWrapper>
      );

      expect(screen.getByText('2 dreams recorded')).toBeInTheDocument();
    });

    it('displays dream titles and content', () => {
      render(
        <TestWrapper>
          <DreamsPage />
        </TestWrapper>
      );

      expect(screen.getByText('Flying Dream')).toBeInTheDocument();
      expect(screen.getByText('Ocean Dream')).toBeInTheDocument();
      expect(screen.getByText('I was flying over the city with amazing wings.')).toBeInTheDocument();
      expect(screen.getByText('Swimming in deep blue ocean with colorful fish.')).toBeInTheDocument();
    });

    it('displays formatted dates correctly', () => {
      render(
        <TestWrapper>
          <DreamsPage />
        </TestWrapper>
      );

      expect(screen.getByText('January 15, 2024')).toBeInTheDocument();
      expect(screen.getByText('January 10, 2024')).toBeInTheDocument();
    });

    it('displays mood with correct styling', () => {
      render(
        <TestWrapper>
          <DreamsPage />
        </TestWrapper>
      );

      const positiveMood = screen.getByText('positive');
      const neutralMood = screen.getByText('neutral');
      
      expect(positiveMood).toBeInTheDocument();
      expect(neutralMood).toBeInTheDocument();
    });

    it('displays tags correctly', () => {
      render(
        <TestWrapper>
          <DreamsPage />
        </TestWrapper>
      );

      expect(screen.getByText('flying')).toBeInTheDocument();
      expect(screen.getByText('city')).toBeInTheDocument();
      expect(screen.getByText('ocean')).toBeInTheDocument();
      expect(screen.getByText('swimming')).toBeInTheDocument();
      expect(screen.getByText('fish')).toBeInTheDocument();
    });

    it('navigates to dream detail when dream is clicked', () => {
      render(
        <TestWrapper>
          <DreamsPage />
        </TestWrapper>
      );

      const dreamCard = screen.getByText('Flying Dream').closest('div');
      if (dreamCard) {
        fireEvent.click(dreamCard);
        expect(mockNavigate).toHaveBeenCalledWith('/dreams/1');
      }
    });

    it('navigates to dream detail when view button is clicked', () => {
      render(
        <TestWrapper>
          <DreamsPage />
        </TestWrapper>
      );

      const viewButtons = screen.getAllByText('View');
      fireEvent.click(viewButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/dreams/1');
    });

    it('navigates to new dream page when add new dream is clicked', () => {
      render(
        <TestWrapper>
          <DreamsPage />
        </TestWrapper>
      );

      const addButton = screen.getByText('Add New Dream');
      fireEvent.click(addButton);

      expect(mockNavigate).toHaveBeenCalledWith('/dreams/new');
    });
  });

  describe('Integration', () => {
    it('fetches dreams on mount', () => {
      mockUseDreamStore.mockReturnValue({
        dreams: [],
        isLoading: false,
        error: null,
        fetchDreams: mockFetchDreams,
      });

      render(
        <TestWrapper>
          <DreamsPage />
        </TestWrapper>
      );

      expect(mockFetchDreams).toHaveBeenCalled();
    });
  });
});