import React, { useState, useEffect } from 'react';

interface UserPreferences {
  // Display Preferences
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  
  // Dream Recording Preferences
  defaultMoodScale: number;
  autoSave: boolean;
  reminderEnabled: boolean;
  reminderTime: string;
  weekendReminders: boolean;
  
  // AI & Analysis Preferences
  enableAIAnalysis: boolean;
  aiInsightLevel: 'basic' | 'detailed' | 'advanced';
  patternDetection: boolean;
  emotionalAnalysis: boolean;
  symbolInterpretation: boolean;
  
  // Privacy & Sharing
  profileVisibility: 'private' | 'friends' | 'public';
  shareAnalytics: boolean;
  dataExport: boolean;
  
  // Notifications
  newInsightNotifications: boolean;
  communityUpdates: boolean;
  weeklyReports: boolean;
  emailNotifications: boolean;
  
  // Advanced Features
  experimentalFeatures: boolean;
  betaAccess: boolean;
  anonymousUsage: boolean;
}

const defaultPreferences: UserPreferences = {
  theme: 'auto',
  fontSize: 'medium',
  compactMode: false,
  defaultMoodScale: 5,
  autoSave: true,
  reminderEnabled: false,
  reminderTime: '22:00',
  weekendReminders: true,
  enableAIAnalysis: true,
  aiInsightLevel: 'detailed',
  patternDetection: true,
  emotionalAnalysis: true,
  symbolInterpretation: true,
  profileVisibility: 'private',
  shareAnalytics: false,
  dataExport: true,
  newInsightNotifications: true,
  communityUpdates: false,
  weeklyReports: true,
  emailNotifications: false,
  experimentalFeatures: false,
  betaAccess: false,
  anonymousUsage: true
};

export const UserPreferenceSystem: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState('display');

  useEffect(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem('dreamapp_preferences');
    if (saved) {
      try {
        setPreferences({ ...defaultPreferences, ...JSON.parse(saved) });
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    }
  }, []);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const savePreferences = () => {
    localStorage.setItem('dreamapp_preferences', JSON.stringify(preferences));
    setHasChanges(false);
    // In a real app, also sync to backend
    alert('Preferences saved successfully!');
  };

  const resetToDefaults = () => {
    setPreferences(defaultPreferences);
    setHasChanges(true);
  };

  const exportPreferences = () => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dream_preferences.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const sections = [
    { id: 'display', label: 'Display', icon: '🎨' },
    { id: 'recording', label: 'Dream Recording', icon: '📝' },
    { id: 'ai', label: 'AI & Analysis', icon: '🤖' },
    { id: 'privacy', label: 'Privacy & Sharing', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'advanced', label: 'Advanced', icon: '⚙️' }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'display':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4>Display Preferences</h4>
            
            {/* Theme */}
            <div>
              <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                Theme
              </label>
              <select
                value={preferences.theme}
                onChange={(e) => updatePreference('theme', e.target.value as 'light' | 'dark' | 'auto')}
                style={{ padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px' }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                Font Size
              </label>
              <select
                value={preferences.fontSize}
                onChange={(e) => updatePreference('fontSize', e.target.value as 'small' | 'medium' | 'large')}
                style={{ padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px' }}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            {/* Compact Mode */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={preferences.compactMode}
                  onChange={(e) => updatePreference('compactMode', e.target.checked)}
                />
                <span>Enable compact mode (more content per screen)</span>
              </label>
            </div>
          </div>
        );

      case 'recording':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4>Dream Recording Preferences</h4>
            
            {/* Default Mood Scale */}
            <div>
              <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                Default Mood Scale: {preferences.defaultMoodScale}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={preferences.defaultMoodScale}
                onChange={(e) => updatePreference('defaultMoodScale', parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Auto Save */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={preferences.autoSave}
                  onChange={(e) => updatePreference('autoSave', e.target.checked)}
                />
                <span>Auto-save dreams as you type</span>
              </label>
            </div>

            {/* Reminders */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  checked={preferences.reminderEnabled}
                  onChange={(e) => updatePreference('reminderEnabled', e.target.checked)}
                />
                <span>Enable daily dream recording reminders</span>
              </label>
              
              {preferences.reminderEnabled && (
                <div style={{ marginLeft: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                      Reminder Time
                    </label>
                    <input
                      type="time"
                      value={preferences.reminderTime}
                      onChange={(e) => updatePreference('reminderTime', e.target.value)}
                      style={{ padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={preferences.weekendReminders}
                        onChange={(e) => updatePreference('weekendReminders', e.target.checked)}
                      />
                      <span>Include weekend reminders</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'ai':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4>AI & Analysis Preferences</h4>
            
            {/* Enable AI Analysis */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  checked={preferences.enableAIAnalysis}
                  onChange={(e) => updatePreference('enableAIAnalysis', e.target.checked)}
                />
                <span>Enable AI-powered dream analysis</span>
              </label>
            </div>

            {preferences.enableAIAnalysis && (
              <>
                {/* AI Insight Level */}
                <div>
                  <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                    AI Insight Level
                  </label>
                  <select
                    value={preferences.aiInsightLevel}
                    onChange={(e) => updatePreference('aiInsightLevel', e.target.value as 'basic' | 'detailed' | 'advanced')}
                    style={{ padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px' }}
                  >
                    <option value="basic">Basic (simple interpretations)</option>
                    <option value="detailed">Detailed (comprehensive analysis)</option>
                    <option value="advanced">Advanced (deep psychological insights)</option>
                  </select>
                </div>

                {/* Analysis Features */}
                <div>
                  <p style={{ fontWeight: '500', marginBottom: '12px' }}>Analysis Features:</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={preferences.patternDetection}
                        onChange={(e) => updatePreference('patternDetection', e.target.checked)}
                      />
                      <span>Pattern Detection (recurring themes and symbols)</span>
                    </label>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={preferences.emotionalAnalysis}
                        onChange={(e) => updatePreference('emotionalAnalysis', e.target.checked)}
                      />
                      <span>Emotional Analysis (mood and feeling patterns)</span>
                    </label>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={preferences.symbolInterpretation}
                        onChange={(e) => updatePreference('symbolInterpretation', e.target.checked)}
                      />
                      <span>Symbol Interpretation (archetypal and personal symbols)</span>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'privacy':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4>Privacy & Sharing Preferences</h4>
            
            {/* Profile Visibility */}
            <div>
              <label style={{ fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                Profile Visibility
              </label>
              <select
                value={preferences.profileVisibility}
                onChange={(e) => updatePreference('profileVisibility', e.target.value as 'private' | 'friends' | 'public')}
                style={{ padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '4px' }}
              >
                <option value="private">Private (only you)</option>
                <option value="friends">Friends only</option>
                <option value="public">Public (community visible)</option>
              </select>
            </div>

            {/* Share Analytics */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={preferences.shareAnalytics}
                  onChange={(e) => updatePreference('shareAnalytics', e.target.checked)}
                />
                <span>Share analytics to help improve AI insights</span>
              </label>
            </div>

            {/* Data Export */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={preferences.dataExport}
                  onChange={(e) => updatePreference('dataExport', e.target.checked)}
                />
                <span>Allow data export (download your dream data)</span>
              </label>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4>Notification Preferences</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={preferences.newInsightNotifications}
                  onChange={(e) => updatePreference('newInsightNotifications', e.target.checked)}
                />
                <span>New AI insights available</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={preferences.communityUpdates}
                  onChange={(e) => updatePreference('communityUpdates', e.target.checked)}
                />
                <span>Community updates and featured dreams</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={preferences.weeklyReports}
                  onChange={(e) => updatePreference('weeklyReports', e.target.checked)}
                />
                <span>Weekly dream pattern reports</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
                />
                <span>Email notifications (for important updates only)</span>
              </label>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4>Advanced Settings</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={preferences.experimentalFeatures}
                  onChange={(e) => updatePreference('experimentalFeatures', e.target.checked)}
                />
                <span>Enable experimental features (may be unstable)</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={preferences.betaAccess}
                  onChange={(e) => updatePreference('betaAccess', e.target.checked)}
                />
                <span>Beta access (try new features before release)</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={preferences.anonymousUsage}
                  onChange={(e) => updatePreference('anonymousUsage', e.target.checked)}
                />
                <span>Anonymous usage analytics (helps improve the app)</span>
              </label>
            </div>

            {/* Export/Import Section */}
            <div style={{ 
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <h5 style={{ marginBottom: '12px' }}>Data Management</h5>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={exportPreferences}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Export Preferences
                </button>
                
                <button
                  onClick={resetToDefaults}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ffc107',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', minHeight: '600px' }}>
      {/* Sidebar */}
      <div style={{
        width: '200px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h4 style={{ marginBottom: '16px' }}>Settings</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                padding: '12px',
                textAlign: 'left',
                backgroundColor: activeSection === section.id ? '#2196F3' : 'transparent',
                color: activeSection === section.id ? '#ffffff' : '#495057',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{section.icon}</span>
              <span style={{ fontSize: '14px' }}>{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        <div style={{
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          minHeight: '500px'
        }}>
          {renderSection()}
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div style={{
            marginTop: '16px',
            padding: '16px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '14px', color: '#856404' }}>
              You have unsaved changes
            </span>
            <button
              onClick={savePreferences}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};