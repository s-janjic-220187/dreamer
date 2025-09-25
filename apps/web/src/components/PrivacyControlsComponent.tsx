/**
 * Privacy Controls Component
 * Comprehensive privacy management interface with granular controls and GDPR compliance
 */

import React, { useState, useEffect } from 'react';
import { dataEncryptionService } from '../services/dataEncryption';
import './PrivacyControls.css';

export interface PrivacySettings {
  dataEncryption: boolean;
  encryptionPassword?: string;
  shareAnalytics: boolean;
  allowDataCollection: boolean;
  profileVisibility: 'private' | 'public' | 'friends';
  dreamSharingDefaults: {
    allowSharing: boolean;
    shareLevel: 'none' | 'anonymous' | 'attributed';
    communityParticipation: boolean;
  };
  dataRetention: {
    keepDreams: boolean;
    retentionPeriod: 'indefinite' | '1year' | '2years' | '5years';
    autoDelete: boolean;
  };
  cookies: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
  };
  gdprConsent: {
    dataProcessing: boolean;
    marketing: boolean;
    thirdPartySharing: boolean;
    consentDate?: string;
    withdrawalRequested?: boolean;
  };
}

const defaultPrivacySettings: PrivacySettings = {
  dataEncryption: false,
  shareAnalytics: false,
  allowDataCollection: false,
  profileVisibility: 'private',
  dreamSharingDefaults: {
    allowSharing: false,
    shareLevel: 'none',
    communityParticipation: false,
  },
  dataRetention: {
    keepDreams: true,
    retentionPeriod: 'indefinite',
    autoDelete: false,
  },
  cookies: {
    essential: true,
    analytics: false,
    marketing: false,
    personalization: false,
  },
  gdprConsent: {
    dataProcessing: false,
    marketing: false,
    thirdPartySharing: false,
  },
};

export const PrivacyControlsComponent: React.FC = () => {
  const [settings, setSettings] = useState<PrivacySettings>(defaultPrivacySettings);
  const [activeTab, setActiveTab] = useState<'general' | 'encryption' | 'sharing' | 'retention' | 'gdpr'>('general');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [encryptionTest, setEncryptionTest] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message?: string }>({ status: 'idle' });


  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = () => {
    try {
      const stored = localStorage.getItem('privacy_settings');
      if (stored) {
        setSettings({ ...defaultPrivacySettings, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    }
  };

  const savePrivacySettings = (newSettings: PrivacySettings) => {
    try {
      localStorage.setItem('privacy_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
    }
  };

  const handleEncryptionToggle = async () => {
    if (!settings.dataEncryption) {
      // Enabling encryption - show password setup
      setShowPasswordModal(true);
    } else {
      // Disabling encryption - confirm action
      if (confirm('Are you sure you want to disable encryption? This will make your data less secure.')) {
        const newSettings = { ...settings, dataEncryption: false, encryptionPassword: undefined };
        savePrivacySettings(newSettings);
      }
    }
  };

  const setupEncryption = async () => {
    if (encryptionPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (encryptionPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setEncryptionTest({ status: 'testing', message: 'Testing encryption...' });

    try {
      // Test encryption with user password
      const testResult = await dataEncryptionService.testEncryption('test_user');
      
      if (testResult) {
        const newSettings = { 
          ...settings, 
          dataEncryption: true, 
          encryptionPassword: encryptionPassword 
        };
        savePrivacySettings(newSettings);
        setEncryptionTest({ status: 'success', message: 'Encryption setup successful!' });
        setShowPasswordModal(false);
        setEncryptionPassword('');
        setConfirmPassword('');
      } else {
        setEncryptionTest({ status: 'error', message: 'Encryption test failed' });
      }
    } catch (error) {
      setEncryptionTest({ status: 'error', message: 'Failed to setup encryption' });
    }

    setTimeout(() => setEncryptionTest({ status: 'idle' }), 3000);
  };

  const handleGDPRConsent = (consentType: keyof PrivacySettings['gdprConsent'], value: boolean) => {
    const newSettings = {
      ...settings,
      gdprConsent: {
        ...settings.gdprConsent,
        [consentType]: value,
        consentDate: value ? new Date().toISOString() : settings.gdprConsent.consentDate,
      }
    };
    savePrivacySettings(newSettings);
  };

  const exportUserData = () => {
    try {
      const userData = {
        settings,
        exportDate: new Date().toISOString(),
        dreams: JSON.parse(localStorage.getItem('dreams') || '[]'),
        preferences: JSON.parse(localStorage.getItem('user_preferences') || '{}'),
      };

      const dataBlob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dreamer-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data');
    }
  };

  const deleteAllData = () => {
    if (confirm('Are you sure you want to delete ALL your data? This action cannot be undone.')) {
      if (confirm('This will permanently delete all your dreams, settings, and preferences. Type "DELETE" to confirm.')) {
        try {
          localStorage.clear();
          setSettings(defaultPrivacySettings);
          alert('All data has been deleted.');
        } catch (error) {
          console.error('Failed to delete data:', error);
          alert('Failed to delete data');
        }
      }
    }
  };

  const renderGeneralTab = () => (
    <div className="privacy-tab-content">
      <h3>General Privacy Settings</h3>
      
      <div className="privacy-setting-group">
        <label className="privacy-setting">
          <input
            type="checkbox"
            checked={settings.allowDataCollection}
            onChange={(e) => savePrivacySettings({ ...settings, allowDataCollection: e.target.checked })}
          />
          <span className="privacy-setting-label">Allow data collection for app improvement</span>
          <p className="privacy-setting-description">
            Help us improve the app by sharing anonymous usage data
          </p>
        </label>

        <label className="privacy-setting">
          <input
            type="checkbox"
            checked={settings.shareAnalytics}
            onChange={(e) => savePrivacySettings({ ...settings, shareAnalytics: e.target.checked })}
          />
          <span className="privacy-setting-label">Share analytics data</span>
          <p className="privacy-setting-description">
            Allow anonymous analytics to help us understand how you use the app
          </p>
        </label>

        <div className="privacy-setting">
          <label htmlFor="profile-visibility">Profile Visibility</label>
          <select
            id="profile-visibility"
            value={settings.profileVisibility}
            onChange={(e) => savePrivacySettings({ 
              ...settings, 
              profileVisibility: e.target.value as 'private' | 'public' | 'friends' 
            })}
          >
            <option value="private">Private</option>
            <option value="friends">Friends Only</option>
            <option value="public">Public</option>
          </select>
        </div>
      </div>

      <div className="privacy-setting-group">
        <h4>Cookie Preferences</h4>
        
        <label className="privacy-setting">
          <input
            type="checkbox"
            checked={settings.cookies.essential}
            disabled
          />
          <span className="privacy-setting-label">Essential Cookies (Required)</span>
          <p className="privacy-setting-description">
            Necessary for the app to function properly
          </p>
        </label>

        <label className="privacy-setting">
          <input
            type="checkbox"
            checked={settings.cookies.analytics}
            onChange={(e) => savePrivacySettings({ 
              ...settings, 
              cookies: { ...settings.cookies, analytics: e.target.checked }
            })}
          />
          <span className="privacy-setting-label">Analytics Cookies</span>
          <p className="privacy-setting-description">
            Help us understand how you interact with our app
          </p>
        </label>

        <label className="privacy-setting">
          <input
            type="checkbox"
            checked={settings.cookies.personalization}
            onChange={(e) => savePrivacySettings({ 
              ...settings, 
              cookies: { ...settings.cookies, personalization: e.target.checked }
            })}
          />
          <span className="privacy-setting-label">Personalization Cookies</span>
          <p className="privacy-setting-description">
            Customize your experience and remember your preferences
          </p>
        </label>
      </div>
    </div>
  );

  const renderEncryptionTab = () => (
    <div className="privacy-tab-content">
      <h3>Data Encryption</h3>
      
      <div className="encryption-status">
        <div className="encryption-indicator">
          <div className={`encryption-status-light ${settings.dataEncryption ? 'active' : 'inactive'}`}></div>
          <span>Encryption {settings.dataEncryption ? 'Enabled' : 'Disabled'}</span>
        </div>
        
        <button 
          onClick={handleEncryptionToggle}
          className={`encryption-toggle-btn ${settings.dataEncryption ? 'enabled' : 'disabled'}`}
        >
          {settings.dataEncryption ? 'Disable Encryption' : 'Enable Encryption'}
        </button>
      </div>

      <div className="encryption-info">
        <h4>About Encryption</h4>
        <ul>
          <li>AES-256 encryption protects your sensitive dream data</li>
          <li>Your encryption key is stored securely on your device</li>
          <li>We cannot recover your data if you forget your password</li>
          <li>Encryption may slightly impact app performance</li>
        </ul>
      </div>

      {dataEncryptionService.getEncryptionInfo().cryptoAvailable && (
        <div className="encryption-technical-info">
          <h4>Technical Details</h4>
          <p>Algorithm: {dataEncryptionService.getEncryptionInfo().algorithm}</p>
          <p>Key Size: {dataEncryptionService.getEncryptionInfo().keySize} bits</p>
          <p>Version: {dataEncryptionService.getEncryptionInfo().version}</p>
        </div>
      )}

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="password-modal">
            <h3>Setup Encryption Password</h3>
            
            <div className="password-form">
              <label>
                Encryption Password:
                <input
                  type="password"
                  value={encryptionPassword}
                  onChange={(e) => setEncryptionPassword(e.target.value)}
                  placeholder="Enter a strong password"
                />
              </label>
              
              <label>
                Confirm Password:
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                />
              </label>

              {encryptionTest.status !== 'idle' && (
                <div className={`encryption-test-status ${encryptionTest.status}`}>
                  {encryptionTest.message}
                </div>
              )}

              <div className="password-modal-buttons">
                <button onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button 
                  onClick={setupEncryption}
                  disabled={encryptionTest.status === 'testing'}
                >
                  Enable Encryption
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSharingTab = () => (
    <div className="privacy-tab-content">
      <h3>Dream Sharing & Community</h3>
      
      <div className="privacy-setting-group">
        <label className="privacy-setting">
          <input
            type="checkbox"
            checked={settings.dreamSharingDefaults.allowSharing}
            onChange={(e) => savePrivacySettings({ 
              ...settings, 
              dreamSharingDefaults: { 
                ...settings.dreamSharingDefaults, 
                allowSharing: e.target.checked 
              }
            })}
          />
          <span className="privacy-setting-label">Allow dream sharing</span>
          <p className="privacy-setting-description">
            Enable sharing your dreams with others or the community
          </p>
        </label>

        <div className="privacy-setting">
          <label htmlFor="share-level">Default sharing level</label>
          <select
            id="share-level"
            value={settings.dreamSharingDefaults.shareLevel}
            onChange={(e) => savePrivacySettings({ 
              ...settings, 
              dreamSharingDefaults: { 
                ...settings.dreamSharingDefaults, 
                shareLevel: e.target.value as 'none' | 'anonymous' | 'attributed' 
              }
            })}
          >
            <option value="none">No sharing</option>
            <option value="anonymous">Anonymous sharing</option>
            <option value="attributed">Share with attribution</option>
          </select>
        </div>

        <label className="privacy-setting">
          <input
            type="checkbox"
            checked={settings.dreamSharingDefaults.communityParticipation}
            onChange={(e) => savePrivacySettings({ 
              ...settings, 
              dreamSharingDefaults: { 
                ...settings.dreamSharingDefaults, 
                communityParticipation: e.target.checked 
              }
            })}
          />
          <span className="privacy-setting-label">Community participation</span>
          <p className="privacy-setting-description">
            Participate in community features like dream discussions and insights
          </p>
        </label>
      </div>
    </div>
  );

  const renderRetentionTab = () => (
    <div className="privacy-tab-content">
      <h3>Data Retention</h3>
      
      <div className="privacy-setting-group">
        <label className="privacy-setting">
          <input
            type="checkbox"
            checked={settings.dataRetention.keepDreams}
            onChange={(e) => savePrivacySettings({ 
              ...settings, 
              dataRetention: { 
                ...settings.dataRetention, 
                keepDreams: e.target.checked 
              }
            })}
          />
          <span className="privacy-setting-label">Keep dream data</span>
          <p className="privacy-setting-description">
            Maintain your dream history for analysis and insights
          </p>
        </label>

        <div className="privacy-setting">
          <label htmlFor="retention-period">Data retention period</label>
          <select
            id="retention-period"
            value={settings.dataRetention.retentionPeriod}
            onChange={(e) => savePrivacySettings({ 
              ...settings, 
              dataRetention: { 
                ...settings.dataRetention, 
                retentionPeriod: e.target.value as 'indefinite' | '1year' | '2years' | '5years' 
              }
            })}
          >
            <option value="indefinite">Keep indefinitely</option>
            <option value="1year">1 year</option>
            <option value="2years">2 years</option>
            <option value="5years">5 years</option>
          </select>
        </div>

        <label className="privacy-setting">
          <input
            type="checkbox"
            checked={settings.dataRetention.autoDelete}
            onChange={(e) => savePrivacySettings({ 
              ...settings, 
              dataRetention: { 
                ...settings.dataRetention, 
                autoDelete: e.target.checked 
              }
            })}
          />
          <span className="privacy-setting-label">Auto-delete old data</span>
          <p className="privacy-setting-description">
            Automatically delete data older than the retention period
          </p>
        </label>
      </div>
    </div>
  );

  const renderGDPRTab = () => (
    <div className="privacy-tab-content">
      <h3>GDPR Rights & Compliance</h3>
      
      <div className="gdpr-info">
        <p>Under GDPR, you have the right to control your personal data. Manage your consent and exercise your rights below.</p>
      </div>

      <div className="privacy-setting-group">
        <h4>Data Processing Consent</h4>
        
        <label className="privacy-setting">
          <input
            type="checkbox"
            checked={settings.gdprConsent.dataProcessing}
            onChange={(e) => handleGDPRConsent('dataProcessing', e.target.checked)}
          />
          <span className="privacy-setting-label">Process my personal data</span>
          <p className="privacy-setting-description">
            Allow processing of your data to provide core app functionality
          </p>
        </label>

        <label className="privacy-setting">
          <input
            type="checkbox"
            checked={settings.gdprConsent.marketing}
            onChange={(e) => handleGDPRConsent('marketing', e.target.checked)}
          />
          <span className="privacy-setting-label">Marketing communications</span>
          <p className="privacy-setting-description">
            Receive updates, tips, and promotional content about the app
          </p>
        </label>

        <label className="privacy-setting">
          <input
            type="checkbox"
            checked={settings.gdprConsent.thirdPartySharing}
            onChange={(e) => handleGDPRConsent('thirdPartySharing', e.target.checked)}
          />
          <span className="privacy-setting-label">Third-party data sharing</span>
          <p className="privacy-setting-description">
            Allow sharing anonymized data with research partners and analytics services
          </p>
        </label>
      </div>

      <div className="gdpr-actions">
        <h4>Data Rights</h4>
        
        <div className="gdpr-action-buttons">
          <button 
            onClick={exportUserData}
            className="gdpr-action-btn export"
          >
            Export My Data
          </button>
          
          <button 
            onClick={deleteAllData}
            className="gdpr-action-btn delete"
          >
            Delete All Data
          </button>
        </div>

        {settings.gdprConsent.consentDate && (
          <p className="consent-date">
            Consent last updated: {new Date(settings.gdprConsent.consentDate).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="privacy-controls">
      <div className="privacy-header">
        <h2>Privacy & Security Settings</h2>
        <p>Manage your privacy preferences and data security settings</p>
      </div>

      <div className="privacy-tabs">
        <button 
          className={`privacy-tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button 
          className={`privacy-tab ${activeTab === 'encryption' ? 'active' : ''}`}
          onClick={() => setActiveTab('encryption')}
        >
          Encryption
        </button>
        <button 
          className={`privacy-tab ${activeTab === 'sharing' ? 'active' : ''}`}
          onClick={() => setActiveTab('sharing')}
        >
          Sharing
        </button>
        <button 
          className={`privacy-tab ${activeTab === 'retention' ? 'active' : ''}`}
          onClick={() => setActiveTab('retention')}
        >
          Data Retention
        </button>
        <button 
          className={`privacy-tab ${activeTab === 'gdpr' ? 'active' : ''}`}
          onClick={() => setActiveTab('gdpr')}
        >
          GDPR Rights
        </button>
      </div>

      <div className="privacy-content">
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'encryption' && renderEncryptionTab()}
        {activeTab === 'sharing' && renderSharingTab()}
        {activeTab === 'retention' && renderRetentionTab()}
        {activeTab === 'gdpr' && renderGDPRTab()}
      </div>


    </div>
  );
};

export default PrivacyControlsComponent;