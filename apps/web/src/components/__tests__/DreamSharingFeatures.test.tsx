import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DreamSharingFeatures } from '../DreamSharingFeatures';
import { useDreamStore } from '../../stores/dreamStore';

vi.mock('../../stores/dreamStore', () => ({
  useDreamStore: vi.fn()
}));

const mockUseDreamStore = vi.mocked(useDreamStore);

describe('DreamSharingFeatures', () => {
  it('renders sharing interface', () => {
    mockUseDreamStore.mockReturnValue({
      dreams: [],
      isLoading: false,
      error: null,
      fetchDreams: vi.fn(),
      addDream: vi.fn(),
      updateDream: vi.fn(),
      deleteDream: vi.fn(),
    });

    render(<DreamSharingFeatures />);

    expect(screen.getByText('Share Your Dreams')).toBeInTheDocument();
    expect(screen.getByText('Community Dreams')).toBeInTheDocument();
  });

  it('displays community dreams', () => {
    mockUseDreamStore.mockReturnValue({
      dreams: [],
      isLoading: false,
      error: null,
      fetchDreams: vi.fn(),
      addDream: vi.fn(),
      updateDream: vi.fn(),
      deleteDream: vi.fn(),
    });

    render(<DreamSharingFeatures />);

    expect(screen.getByText('Flying Through Crystal Caves')).toBeInTheDocument();
    expect(screen.getByText('The Recurring Library')).toBeInTheDocument();
  });
});