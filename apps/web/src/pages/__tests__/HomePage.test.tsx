import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TamaguiProvider } from '@tamagui/core';
import { config } from '../../tamagui.config';
import { HomePage } from '../HomePage';

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

describe('HomePage', () => {
  it('renders welcome message and main content', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByText('Welcome to Dream Analyzer')).toBeInTheDocument();
    expect(screen.getByText('Unlock the meaning behind your dreams')).toBeInTheDocument();
    expect(screen.getByText(/Our AI-powered dream analysis/)).toBeInTheDocument();
  });

  it('displays navigation buttons', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByText('Start Analyzing Dreams')).toBeInTheDocument();
    expect(screen.getByText('View Dream Journal')).toBeInTheDocument();
  });

  it('displays features section', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('🎤 Voice Recording')).toBeInTheDocument();
    expect(screen.getByText('🤖 AI Analysis')).toBeInTheDocument();
    expect(screen.getByText('📚 Dream Journal')).toBeInTheDocument();
    expect(screen.getByText('🔒 Privacy First')).toBeInTheDocument();
  });

  it('has correct navigation links', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const analyzeLink = screen.getByRole('link', { name: /start analyzing dreams/i });
    const journalLink = screen.getByRole('link', { name: /view dream journal/i });

    expect(analyzeLink).toHaveAttribute('href', '/dreams');
    expect(journalLink).toHaveAttribute('href', '/dreams');
  });

  it('renders feature descriptions correctly', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByText(/Record your dreams using voice-to-text/)).toBeInTheDocument();
    expect(screen.getByText(/Get detailed interpretations using advanced AI/)).toBeInTheDocument();
    expect(screen.getByText(/Keep track of your dreams and see patterns/)).toBeInTheDocument();
    expect(screen.getByText(/All processing happens locally/)).toBeInTheDocument();
  });
});