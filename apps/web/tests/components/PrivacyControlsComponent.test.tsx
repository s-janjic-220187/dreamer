/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PrivacyControlsComponent from '../../src/components/PrivacyControlsComponent';
import { dataEncryptionService } from '../../src/services/dataEncryption';

// Mock the services
vi.mock('../../src/services/dataEncryption');
vi.mock('../../src/services/gdprCompliance');

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window.confirm and alert
Object.defineProperty(window, 'confirm', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window, 'alert', {
  value: vi.fn(),
  writable: true,
});

// Mock URL and Blob for data export
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  },
  writable: true,
});

Object.defineProperty(window, 'Blob', {
  value: class MockBlob {
    constructor(content: any[], options?: any) {
      this.content = content;
      this.type = options?.type || '';
    }
    content: any[];
    type: string;
  },
  writable: true,
});

const mockDataEncryptionService = dataEncryptionService as any;

describe('PrivacyControlsComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Setup default mock implementations
    mockDataEncryptionService.testEncryption = vi.fn().mockResolvedValue(true);
    mockDataEncryptionService.getEncryptionInfo = vi.fn().mockReturnValue({
      algorithm: 'AES-GCM',
      keySize: 256,
      version: '1.0.0',
      cryptoAvailable: true,
    });

    (window.confirm as any).mockReturnValue(true);
  });

  it('should render privacy controls with all tabs', () => {
    render(<PrivacyControlsComponent />);
    
    expect(screen.getByText('Privacy & Security Settings')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Encryption')).toBeInTheDocument();
    expect(screen.getByText('Sharing')).toBeInTheDocument();
    expect(screen.getByText('Data Retention')).toBeInTheDocument();
    expect(screen.getByText('GDPR Rights')).toBeInTheDocument();
  });

  it('should show general privacy settings by default', () => {
    render(<PrivacyControlsComponent />);
    
    expect(screen.getByText('General Privacy Settings')).toBeInTheDocument();
    expect(screen.getByText('Allow data collection for app improvement')).toBeInTheDocument();
    expect(screen.getByText('Share analytics data')).toBeInTheDocument();
    expect(screen.getByText('Cookie Preferences')).toBeInTheDocument();
  });

  it('should switch between tabs', async () => {
    const user = userEvent.setup();
    render(<PrivacyControlsComponent />);
    
    // Click on Encryption tab
    await user.click(screen.getByText('Encryption'));
    expect(screen.getByText('Data Encryption')).toBeInTheDocument();
    
    // Click on GDPR tab
    await user.click(screen.getByText('GDPR Rights'));
    expect(screen.getByText('GDPR Rights & Compliance')).toBeInTheDocument();
  });

  it('should load existing privacy settings from localStorage', () => {
    const mockSettings = {
      allowDataCollection: true,
      shareAnalytics: true,
      profileVisibility: 'public',
    };
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings));
    
    render(<PrivacyControlsComponent />);
    
    const dataCollectionCheckbox = screen.getByLabelText(/Allow data collection/);
    const analyticsCheckbox = screen.getByLabelText(/Share analytics data/);
    
    expect(dataCollectionCheckbox).toBeChecked();
    expect(analyticsCheckbox).toBeChecked();
  });

  it('should save privacy settings changes', async () => {
    const user = userEvent.setup();
    render(<PrivacyControlsComponent />);
    
    const dataCollectionCheckbox = screen.getByLabelText(/Allow data collection/);
    await user.click(dataCollectionCheckbox);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'privacy_settings',
      expect.stringContaining('"allowDataCollection":true')
    );
  });

  describe('Encryption Tab', () => {
    it('should show encryption status and controls', async () => {
      const user = userEvent.setup();
      render(<PrivacyControlsComponent />);
      
      await user.click(screen.getByText('Encryption'));
      
      expect(screen.getByText('Data Encryption')).toBeInTheDocument();
      expect(screen.getByText('Encryption Disabled')).toBeInTheDocument();
      expect(screen.getByText('Enable Encryption')).toBeInTheDocument();
      expect(screen.getByText('About Encryption')).toBeInTheDocument();
    });

    it('should show password modal when enabling encryption', async () => {
      const user = userEvent.setup();
      render(<PrivacyControlsComponent />);
      
      await user.click(screen.getByText('Encryption'));
      await user.click(screen.getByText('Enable Encryption'));
      
      expect(screen.getByText('Setup Encryption Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter a strong password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    });

    it('should validate password requirements', async () => {
      const user = userEvent.setup();
      render(<PrivacyControlsComponent />);
      
      await user.click(screen.getByText('Encryption'));
      await user.click(screen.getByText('Enable Encryption'));
      
      const passwordInput = screen.getByPlaceholderText('Enter a strong password');
      const confirmInput = screen.getByPlaceholderText('Confirm your password');
      
      await user.type(passwordInput, 'short');
      await user.type(confirmInput, 'short');
      await user.click(screen.getByText('Enable Encryption'));
      
      expect(window.alert).toHaveBeenCalledWith('Password must be at least 8 characters long');
    });

    it('should validate password confirmation', async () => {
      const user = userEvent.setup();
      render(<PrivacyControlsComponent />);
      
      await user.click(screen.getByText('Encryption'));
      await user.click(screen.getByText('Enable Encryption'));
      
      const passwordInput = screen.getByPlaceholderText('Enter a strong password');
      const confirmInput = screen.getByPlaceholderText('Confirm your password');
      
      await user.type(passwordInput, 'password123');
      await user.type(confirmInput, 'different123');
      await user.click(screen.getByText('Enable Encryption'));
      
      expect(window.alert).toHaveBeenCalledWith('Passwords do not match');
    });

    it('should setup encryption successfully', async () => {
      const user = userEvent.setup();
      render(<PrivacyControlsComponent />);
      
      await user.click(screen.getByText('Encryption'));
      await user.click(screen.getByText('Enable Encryption'));
      
      const passwordInput = screen.getByPlaceholderText('Enter a strong password');
      const confirmInput = screen.getByPlaceholderText('Confirm your password');
      
      await user.type(passwordInput, 'strongpassword123');
      await user.type(confirmInput, 'strongpassword123');
      await user.click(screen.getByText('Enable Encryption'));
      
      await waitFor(() => {
        expect(mockDataEncryptionService.testEncryption).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'privacy_settings',
          expect.stringContaining('"dataEncryption":true')
        );
      });
    });

    it('should show encryption technical info', async () => {
      const user = userEvent.setup();
      render(<PrivacyControlsComponent />);
      
      await user.click(screen.getByText('Encryption'));
      
      expect(screen.getByText('Technical Details')).toBeInTheDocument();
      expect(screen.getByText('Algorithm: AES-GCM')).toBeInTheDocument();
      expect(screen.getByText('Key Size: 256 bits')).toBeInTheDocument();
    });

    it('should confirm before disabling encryption', async () => {
      const user = userEvent.setup();
      
      // Start with encryption enabled
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ dataEncryption: true })
      );
      
      render(<PrivacyControlsComponent />);
      
      await user.click(screen.getByText('Encryption'));
      await user.click(screen.getByText('Disable Encryption'));
      
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to disable encryption? This will make your data less secure.'
      );
    });
  });

  describe('Sharing Tab', () => {
    it('should show sharing controls', async () => {
      const user = userEvent.setup();
      render(<PrivacyControlsComponent />);
      
      await user.click(screen.getByText('Sharing'));
      
      expect(screen.getByText('Dream Sharing & Community')).toBeInTheDocument();
      expect(screen.getByText('Allow dream sharing')).toBeInTheDocument();
      expect(screen.getByText('Default sharing level')).toBeInTheDocument();
      expect(screen.getByText('Community participation')).toBeInTheDocument();
    });

    it('should update sharing preferences', async () => {
      const user = userEvent.setup();
      render(<PrivacyControlsComponent />);
      
      await user.click(screen.getByText('Sharing'));
      
      const sharingCheckbox = screen.getByLabelText(/Allow dream sharing/);
      await user.click(sharingCheckbox);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'privacy_settings',
        expect.stringContaining('"allowSharing":true')
      );
    });
  });

  describe('Data Retention Tab', () => {
    it('should show retention settings', async () => {
      const user = userEvent.setup();
      render(<PrivacyControlsComponent />);
      
      await user.click(screen.getByText('Data Retention'));
      
      expect(screen.getByText('Data Retention')).toBeInTheDocument();
      expect(screen.getByText('Keep dream data')).toBeInTheDocument();
      expect(screen.getByText('Data retention period')).toBeInTheDocument();
      expect(screen.getByText('Auto-delete old data')).toBeInTheDocument();
    });

    it('should update retention preferences', async () => {
      const user = userEvent.setup();
      render(<PrivacyControlsComponent />);
      
      await user.click(screen.getByText('Data Retention'));
      
      const keepDataCheckbox = screen.getByLabelText(/Keep dream data/);
      await user.click(keepDataCheckbox);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'privacy_settings',
        expect.stringContaining('"keepDreams":false')
      );
    });
  });

  describe('GDPR Rights Tab', () => {
    it('should show GDPR compliance controls', async () => {
      const user = userEvent.setup();
      render(<PrivacyControlsComponent />);
      
      await user.click(screen.getByText('GDPR Rights'));
      
      expect(screen.getByText('GDPR Rights & Compliance')).toBeInTheDocument();
      expect(screen.getByText('Data Processing Consent')).toBeInTheDocument();
      expect(screen.getByText('Process my personal data')).toBeInTheDocument();
      expect(screen.getByText('Marketing communications')).toBeInTheDocument();
      expect(screen.getByText('Export My Data')).toBeInTheDocument();
      expect(screen.getByText('Delete All Data')).toBeInTheDocument();
    });

    it('should record GDPR consent', async () => {
      const user = userEvent.setup();
      render(<PrivacyControlsComponent />);
      
      await user.click(screen.getByText('GDPR Rights'));
      
      const processingCheckbox = screen.getByLabelText(/Process my personal data/);
      await user.click(processingCheckbox);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'privacy_settings',
        expect.stringContaining('"dataProcessing":true')
      );
    });

    it('should export user data', async () => {
      const user = userEvent.setup();
      
      // Mock document methods
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
      
      render(<PrivacyControlsComponent />);
      
      await user.click(screen.getByText('GDPR Rights'));
      await user.click(screen.getByText('Export My Data'));
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.click).toHaveBeenCalled();
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should confirm before deleting all data', async () => {
      const user = userEvent.setup();
      render(<PrivacyControlsComponent />);
      
      await user.click(screen.getByText('GDPR Rights'));
      await user.click(screen.getByText('Delete All Data'));
      
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete ALL your data? This action cannot be undone.'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      expect(() => render(<PrivacyControlsComponent />)).not.toThrow();
    });

    it('should handle encryption test failure', async () => {
      const user = userEvent.setup();
      mockDataEncryptionService.testEncryption.mockResolvedValue(false);
      
      render(<PrivacyControlsComponent />);
      
      await user.click(screen.getByText('Encryption'));
      await user.click(screen.getByText('Enable Encryption'));
      
      const passwordInput = screen.getByPlaceholderText('Enter a strong password');
      const confirmInput = screen.getByPlaceholderText('Confirm your password');
      
      await user.type(passwordInput, 'strongpassword123');
      await user.type(confirmInput, 'strongpassword123');
      await user.click(screen.getByText('Enable Encryption'));
      
      await waitFor(() => {
        expect(screen.getByText('Encryption test failed')).toBeInTheDocument();
      });
    });

    it('should handle data export errors', async () => {
      const user = userEvent.setup();
      
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      render(<PrivacyControlsComponent />);
      
      await user.click(screen.getByText('GDPR Rights'));
      await user.click(screen.getByText('Export My Data'));
      
      expect(window.alert).toHaveBeenCalledWith('Failed to export data');
    });
  });

  describe('Cookie Preferences', () => {
    it('should show cookie controls', () => {
      render(<PrivacyControlsComponent />);
      
      expect(screen.getByText('Cookie Preferences')).toBeInTheDocument();
      expect(screen.getByText('Essential Cookies (Required)')).toBeInTheDocument();
      expect(screen.getByText('Analytics Cookies')).toBeInTheDocument();
      expect(screen.getByText('Personalization Cookies')).toBeInTheDocument();
    });

    it('should not allow disabling essential cookies', () => {
      render(<PrivacyControlsComponent />);
      
      const essentialCheckbox = screen.getByLabelText(/Essential Cookies/);
      expect(essentialCheckbox).toBeDisabled();
      expect(essentialCheckbox).toBeChecked();
    });

    it('should update cookie preferences', async () => {
      const user = userEvent.setup();
      render(<PrivacyControlsComponent />);
      
      const analyticsCheckbox = screen.getByLabelText(/Analytics Cookies/);
      await user.click(analyticsCheckbox);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'privacy_settings',
        expect.stringContaining('"analytics":true')
      );
    });
  });
});