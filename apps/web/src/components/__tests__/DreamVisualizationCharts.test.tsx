import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DreamVisualizationCharts } from '../DreamVisualizationCharts';
import { useDreamStore } from '../../stores/dreamStore';

// Mock the dream store
vi.mock('../../stores/dreamStore', () => ({
  useDreamStore: vi.fn()
}));

const mockUseDreamStore = vi.mocked(useDreamStore);

describe('DreamVisualizationCharts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no dreams', () => {
    mockUseDreamStore.mockReturnValue({
      dreams: [],
      isLoading: false,
      error: null,
      fetchDreams: vi.fn(),
      addDream: vi.fn(),
      updateDream: vi.fn(),
      deleteDream: vi.fn(),
    });

    render(<DreamVisualizationCharts />);

    expect(screen.getByText('Dream Visualization')).toBeInTheDocument();
    expect(screen.getByText('Start recording dreams to see your patterns and insights')).toBeInTheDocument();
  });

  it('renders charts when dreams are available', () => {
    mockUseDreamStore.mockReturnValue({
      dreams: [{
        id: '1',
        title: 'Flying Dream',
        content: 'I was flying through the clouds',
        mood: 8,
        tags: ['flying'],
        createdAt: new Date().toISOString(),
        date: new Date()
      }],
      isLoading: false,
      error: null,
      fetchDreams: vi.fn(),
      addDream: vi.fn(),
      updateDream: vi.fn(),
      deleteDream: vi.fn(),
    });

    render(<DreamVisualizationCharts />);

    expect(screen.getByText('Dream Activity (Last 30 Days)')).toBeInTheDocument();
    expect(screen.getByText('Dream Categories')).toBeInTheDocument();
  });


});