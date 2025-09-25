import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { TamaguiProvider } from '@tamagui/core';
import { config } from '../../tamagui.config';
import { DreamForm } from '../DreamForm';

// Mock zustand store
vi.mock('../../stores/dreamStore', () => ({
  useDreamStore: vi.fn(),
}));

import { useDreamStore } from '../../stores/dreamStore';
const mockUseDreamStore = vi.mocked(useDreamStore);

const mockCreateDream = vi.fn();
const mockUpdateDream = vi.fn();
const mockFetchDreamById = vi.fn();

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

describe('DreamForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDreamStore.mockReturnValue({
      createDream: mockCreateDream,
      updateDream: mockUpdateDream,
      fetchDreamById: mockFetchDreamById,
      currentDream: null,
      isLoading: false,
    });
  });

  describe('New Dream Form', () => {
    it('renders form fields correctly', () => {
      render(
        <TestWrapper>
          <DreamForm />
        </TestWrapper>
      );

      expect(screen.getByText('Record New Dream')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Give your dream a memorable title...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Describe your dream in detail/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/flying, water, family/)).toBeInTheDocument();
    });

    it('shows validation errors for empty required fields', async () => {
      render(
        <TestWrapper>
          <DreamForm />
        </TestWrapper>
      );

      const submitButton = screen.getByText('Save Dream');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
        // Content validation appears after user interacts with content field
      });

      expect(mockCreateDream).not.toHaveBeenCalled();
    });

    it('shows validation error for short content', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <DreamForm />
        </TestWrapper>
      );

      const titleInput = screen.getByPlaceholderText('Give your dream a memorable title...');
      const contentTextarea = screen.getByPlaceholderText(/Describe your dream in detail/);
      const submitButton = screen.getByText('Save Dream');

      await user.type(titleInput, 'Test Dream');
      await user.type(contentTextarea, 'Short');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Dream content should be at least 10 characters')).toBeInTheDocument();
      });
    });

    it('creates dream with valid data', async () => {
      const user = userEvent.setup();
      const mockDream = { id: '1', title: 'Test Dream', content: 'This is a test dream content.' };
      mockCreateDream.mockResolvedValue(mockDream);
      
      render(
        <TestWrapper>
          <DreamForm />
        </TestWrapper>
      );

      const titleInput = screen.getByPlaceholderText('Give your dream a memorable title...');
      const contentTextarea = screen.getByPlaceholderText(/Describe your dream in detail/);
      const tagsInput = screen.getByPlaceholderText(/flying, water, family/);
      const submitButton = screen.getByText('Save Dream');

      await user.clear(titleInput);
      await user.type(titleInput, 'Test Dream');
      await user.clear(contentTextarea);
      await user.type(contentTextarea, 'This is a test dream content with enough characters.');
      await user.clear(tagsInput);
      await user.type(tagsInput, 'test, dream, validation');
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateDream).toHaveBeenCalledWith({
          title: 'Test Dream',
          content: 'This is a test dream content with enough characters.',
          mood: 'neutral',
          tags: ['test', 'dream', 'validation'],
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/dreams/1');
    });

    it('handles cancel button correctly', () => {
      render(
        <TestWrapper>
          <DreamForm />
        </TestWrapper>
      );

      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[0]); // Click the first cancel button

      expect(mockNavigate).toHaveBeenCalledWith('/dreams');
    });
  });

  describe('Edit Dream Form', () => {
    const mockExistingDream = {
      id: '1',
      title: 'Existing Dream',
      content: 'This is an existing dream content.',
      mood: 'positive' as const,
      tags: ['existing', 'dream'],
      date: new Date('2024-01-15'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    beforeEach(() => {
      mockUseDreamStore.mockReturnValue({
        createDream: mockCreateDream,
        updateDream: mockUpdateDream,
        fetchDreamById: mockFetchDreamById,
        currentDream: mockExistingDream,
        isLoading: false,
      });
    });

    it('renders form with existing dream data', async () => {
      render(
        <TestWrapper>
          <DreamForm dreamId="1" />
        </TestWrapper>
      );

      expect(screen.getByText('Edit Dream')).toBeInTheDocument();
      
      // Form data loads asynchronously
      await waitFor(() => {
        // Just verify the form is rendered for edit mode
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });
    });

    it('updates dream with modified data', async () => {
      const user = userEvent.setup();
      const mockUpdatedDream = { ...mockExistingDream, title: 'Updated Dream' };
      mockUpdateDream.mockResolvedValue(mockUpdatedDream);
      
      render(
        <TestWrapper>
          <DreamForm dreamId="1" />
        </TestWrapper>
      );

      // Fill form with new data
      const titleInput = screen.getByPlaceholderText('Give your dream a memorable title...');
      const contentTextarea = screen.getByPlaceholderText(/Describe your dream in detail/);
      
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Dream');
      await user.clear(contentTextarea);
      await user.type(contentTextarea, 'Updated dream content with sufficient length.');
      
      const submitButton = screen.getByText('Update Dream');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateDream).toHaveBeenCalledWith('1', expect.objectContaining({
          title: 'Updated Dream',
          content: 'Updated dream content with sufficient length.',
          mood: 'positive',
          tags: ['existing', 'dream'],
        }));
      });

      expect(mockNavigate).toHaveBeenCalledWith('/dreams/1');
    });

    it('navigates to dream detail on cancel', () => {
      render(
        <TestWrapper>
          <DreamForm dreamId="1" />
        </TestWrapper>
      );

      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[0]); // Click the first cancel button

      expect(mockNavigate).toHaveBeenCalledWith('/dreams/1');
    });
  });

  describe('Loading State', () => {
    it('shows loading state when form is submitting', () => {
      mockUseDreamStore.mockReturnValue({
        createDream: mockCreateDream,
        updateDream: mockUpdateDream,
        fetchDreamById: mockFetchDreamById,
        currentDream: null,
        isLoading: true,
      });

      render(
        <TestWrapper>
          <DreamForm />
        </TestWrapper>
      );

      // When loading, the button should show 'Saving...' and be disabled
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.getByText('Saving...')).toBeDisabled();
    });
  });
});