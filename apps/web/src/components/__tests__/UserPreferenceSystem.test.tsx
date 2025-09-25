import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserPreferenceSystem } from '../UserPreferenceSystem';

describe('UserPreferenceSystem', () => {
  it('renders settings sidebar and main content', () => {
    render(<UserPreferenceSystem />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Display')).toBeInTheDocument();
    expect(screen.getByText('Dream Recording')).toBeInTheDocument();
    expect(screen.getByText('AI & Analysis')).toBeInTheDocument();
    expect(screen.getByText('Privacy & Sharing')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
  });

  it('displays display preferences by default', () => {
    render(<UserPreferenceSystem />);

    expect(screen.getByText('Display Preferences')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Font Size')).toBeInTheDocument();
  });
});