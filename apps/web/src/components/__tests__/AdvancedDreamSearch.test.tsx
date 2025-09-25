import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TamaguiProvider } from '@tamagui/core';
import { config } from '../../tamagui.config';
import AdvancedDreamSearch from '../AdvancedDreamSearch';

// Mock the dream store
vi.mock('../../stores/dreamStore', () => ({
  useDreams: vi.fn(() => [
    {
      id: '1',
      title: 'Flying Dream',
      content: 'I was flying over the city with great happiness',
      date: new Date().toISOString(),
      mood: 'positive',
      tags: ['flying', 'city'],
    },
    {
      id: '2', 
      title: 'Water Nightmare',
      content: 'I was drowning in dark water and felt very scared',
      date: new Date().toISOString(),
      mood: 'negative',
      tags: ['water', 'scary'],
    }
  ]),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <TamaguiProvider config={config}>
      {component}
    </TamaguiProvider>
  );
};

describe('AdvancedDreamSearch', () => {
  it('renders search component correctly', () => {
    renderWithProvider(<AdvancedDreamSearch />);
    
    expect(screen.getByText('🔍 Advanced Dream Search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search dreams with natural language/)).toBeInTheDocument();
  });

  it('shows filter toggle button', () => {
    renderWithProvider(<AdvancedDreamSearch />);
    
    expect(screen.getByText('Show Filters')).toBeInTheDocument();
  });

  it('displays search state initially', () => {
    renderWithProvider(<AdvancedDreamSearch />);
    
    // Should show searching state initially due to debounce
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('renders without errors with empty query', () => {
    renderWithProvider(<AdvancedDreamSearch />);
    
    // Should not crash and should show the component
    expect(screen.getByText('🔍 Advanced Dream Search')).toBeInTheDocument();
  });
});