/**
 * GDPR Compliance Service
 * Handles GDPR compliance features including data export, deletion, and consent management
 */

export interface GDPRConsentRecord {
  userId: string;
  consentType: 'data_processing' | 'marketing' | 'analytics' | 'third_party_sharing';
  granted: boolean;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  version: string;
}

export interface DataExportRequest {
  userId: string;
  requestDate: string;
  completed: boolean;
  exportData?: any;
  downloadUrl?: string;
}

export interface DataDeletionRequest {
  userId: string;
  requestDate: string;
  completed: boolean;
  deletionType: 'partial' | 'complete';
  reason?: string;
}

export interface GDPRUserRights {
  dataPortability: boolean;
  rectification: boolean;
  erasure: boolean;
  restriction: boolean;
  objection: boolean;
  withdrawConsent: boolean;
}

class GDPRComplianceService {
  private readonly CONSENT_STORAGE_KEY = 'gdpr_consent_records';
  private readonly DATA_EXPORT_KEY = 'gdpr_data_exports';
  private readonly DELETION_REQUEST_KEY = 'gdpr_deletion_requests';
  private readonly COMPLIANCE_VERSION = '1.0.0';

  /**
   * Record user consent for GDPR compliance
   */
  recordConsent(
    userId: string,
    consentType: GDPRConsentRecord['consentType'],
    granted: boolean
  ): GDPRConsentRecord {
    const consentRecord: GDPRConsentRecord = {
      userId,
      consentType,
      granted,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      version: this.COMPLIANCE_VERSION
    };

    // Store consent record
    const existingRecords = this.getConsentRecords(userId);
    const updatedRecords = [
      ...existingRecords.filter(r => r.consentType !== consentType),
      consentRecord
    ];

    localStorage.setItem(
      `${this.CONSENT_STORAGE_KEY}_${userId}`,
      JSON.stringify(updatedRecords)
    );

    return consentRecord;
  }

  /**
   * Get all consent records for a user
   */
  getConsentRecords(userId: string): GDPRConsentRecord[] {
    try {
      const stored = localStorage.getItem(`${this.CONSENT_STORAGE_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get consent records:', error);
      return [];
    }
  }

  /**
   * Check if user has given specific consent
   */
  hasConsent(userId: string, consentType: GDPRConsentRecord['consentType']): boolean {
    const records = this.getConsentRecords(userId);
    const latestRecord = records
      .filter(r => r.consentType === consentType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    return latestRecord ? latestRecord.granted : false;
  }

  /**
   * Withdraw consent for specific purpose
   */
  withdrawConsent(userId: string, consentType: GDPRConsentRecord['consentType']): void {
    this.recordConsent(userId, consentType, false);
    
    // Trigger data processing changes based on withdrawn consent
    this.handleConsentWithdrawal(userId, consentType);
  }

  /**
   * Handle consequences of consent withdrawal
   */
  private handleConsentWithdrawal(userId: string, consentType: GDPRConsentRecord['consentType']): void {
    switch (consentType) {
      case 'analytics':
        // Stop analytics tracking
        this.disableAnalytics(userId);
        break;
      case 'marketing':
        // Remove from marketing communications
        this.disableMarketing(userId);
        break;
      case 'third_party_sharing':
        // Stop third-party data sharing
        this.disableThirdPartySharing(userId);
        break;
      case 'data_processing':
        // This affects core functionality - may require account suspension
        console.warn('Data processing consent withdrawn - core functionality affected');
        break;
    }
  }

  /**
   * Create comprehensive data export for user (Right to Data Portability)
   */
  async createDataExport(userId: string): Promise<DataExportRequest> {
    const exportRequest: DataExportRequest = {
      userId,
      requestDate: new Date().toISOString(),
      completed: false
    };

    try {
      // Gather all user data
      const userData = await this.gatherAllUserData(userId);
      
      // Create export package
      const exportPackage = {
        metadata: {
          userId,
          exportDate: exportRequest.requestDate,
          version: this.COMPLIANCE_VERSION,
          format: 'JSON'
        },
        personalData: {
          profile: userData.profile,
          preferences: userData.preferences,
          dreams: userData.dreams,
          analytics: userData.analytics,
          sharing: userData.sharing
        },
        consentRecords: this.getConsentRecords(userId),
        technicalData: {
          loginHistory: userData.loginHistory,
          deviceInfo: userData.deviceInfo,
          ipAddresses: userData.ipAddresses
        }
      };

      exportRequest.exportData = exportPackage;
      exportRequest.completed = true;

      // Store export request
      const existingExports = this.getDataExports(userId);
      const updatedExports = [...existingExports, exportRequest];
      localStorage.setItem(
        `${this.DATA_EXPORT_KEY}_${userId}`,
        JSON.stringify(updatedExports)
      );

      return exportRequest;
    } catch (error) {
      console.error('Failed to create data export:', error);
      throw new Error('Data export failed');
    }
  }

  /**
   * Gather all user data for export
   */
  private async gatherAllUserData(userId: string): Promise<any> {
    return {
      profile: JSON.parse(localStorage.getItem(`user_profile_${userId}`) || '{}'),
      preferences: JSON.parse(localStorage.getItem(`user_preferences_${userId}`) || '{}'),
      dreams: JSON.parse(localStorage.getItem(`dreams_${userId}`) || '[]'),
      analytics: JSON.parse(localStorage.getItem(`analytics_${userId}`) || '{}'),
      sharing: JSON.parse(localStorage.getItem(`sharing_${userId}`) || '{}'),
      loginHistory: JSON.parse(localStorage.getItem(`login_history_${userId}`) || '[]'),
      deviceInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      ipAddresses: [] // Would be populated from server logs in real implementation
    };
  }

  /**
   * Get data export history for user
   */
  getDataExports(userId: string): DataExportRequest[] {
    try {
      const stored = localStorage.getItem(`${this.DATA_EXPORT_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get data exports:', error);
      return [];
    }
  }

  /**
   * Request data deletion (Right to Erasure)
   */
  async requestDataDeletion(
    userId: string, 
    deletionType: 'partial' | 'complete',
    reason?: string
  ): Promise<DataDeletionRequest> {
    const deletionRequest: DataDeletionRequest = {
      userId,
      requestDate: new Date().toISOString(),
      completed: false,
      deletionType,
      reason
    };

    try {
      if (deletionType === 'complete') {
        await this.performCompleteDeletion(userId);
      } else {
        await this.performPartialDeletion(userId);
      }

      deletionRequest.completed = true;

      // Store deletion request record
      const existingDeletions = this.getDeletionRequests(userId);
      const updatedDeletions = [...existingDeletions, deletionRequest];
      localStorage.setItem(
        `${this.DELETION_REQUEST_KEY}_${userId}`,
        JSON.stringify(updatedDeletions)
      );

      return deletionRequest;
    } catch (error) {
      console.error('Failed to process deletion request:', error);
      throw new Error('Data deletion failed');
    }
  }

  /**
   * Perform complete data deletion
   */
  private async performCompleteDeletion(userId: string): Promise<void> {
    // Remove all user data
    const keys = Object.keys(localStorage);
    const userKeys = keys.filter(key => key.includes(userId));
    
    userKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear any cached data
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        for (const request of requests) {
          if (request.url.includes(userId)) {
            await cache.delete(request);
          }
        }
      }
    }
  }

  /**
   * Perform partial data deletion (keeping essential data)
   */
  private async performPartialDeletion(userId: string): Promise<void> {
    // Remove sensitive data but keep essential records
    const sensitiveKeys = [
      `dreams_${userId}`,
      `analytics_${userId}`,
      `sharing_${userId}`,
      `login_history_${userId}`
    ];

    sensitiveKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Get deletion request history
   */
  getDeletionRequests(userId: string): DataDeletionRequest[] {
    try {
      const stored = localStorage.getItem(`${this.DELETION_REQUEST_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get deletion requests:', error);
      return [];
    }
  }

  /**
   * Get user's GDPR rights status
   */
  getUserRights(_userId: string): GDPRUserRights {
    return {
      dataPortability: true,
      rectification: true,
      erasure: true,
      restriction: true,
      objection: true,
      withdrawConsent: true
    };
  }

  /**
   * Rectify user data (Right to Rectification)
   */
  rectifyUserData(userId: string, dataType: string, newData: any): boolean {
    try {
      const key = `${dataType}_${userId}`;
      localStorage.setItem(key, JSON.stringify(newData));
      
      // Log rectification for audit trail
      this.logDataRectification(userId, dataType);
      
      return true;
    } catch (error) {
      console.error('Failed to rectify user data:', error);
      return false;
    }
  }

  /**
   * Restrict data processing (Right to Restriction)
   */
  restrictDataProcessing(userId: string, restricted: boolean): boolean {
    try {
      const restrictionData = {
        userId,
        restricted,
        timestamp: new Date().toISOString(),
        reason: 'User requested processing restriction'
      };

      localStorage.setItem(
        `data_restriction_${userId}`,
        JSON.stringify(restrictionData)
      );

      return true;
    } catch (error) {
      console.error('Failed to set data processing restriction:', error);
      return false;
    }
  }

  /**
   * Check if data processing is restricted
   */
  isDataProcessingRestricted(userId: string): boolean {
    try {
      const stored = localStorage.getItem(`data_restriction_${userId}`);
      if (!stored) return false;

      const restrictionData = JSON.parse(stored);
      return restrictionData.restricted;
    } catch (error) {
      console.error('Failed to check data processing restriction:', error);
      return false;
    }
  }

  /**
   * Generate GDPR compliance report
   */
  generateComplianceReport(userId: string): any {
    return {
      userId,
      reportDate: new Date().toISOString(),
      consentStatus: {
        dataProcessing: this.hasConsent(userId, 'data_processing'),
        marketing: this.hasConsent(userId, 'marketing'),
        analytics: this.hasConsent(userId, 'analytics'),
        thirdPartySharing: this.hasConsent(userId, 'third_party_sharing')
      },
      dataExports: this.getDataExports(userId).length,
      deletionRequests: this.getDeletionRequests(userId).length,
      dataProcessingRestricted: this.isDataProcessingRestricted(userId),
      userRights: this.getUserRights(userId),
      complianceVersion: this.COMPLIANCE_VERSION
    };
  }

  // Helper methods for consent withdrawal consequences
  private disableAnalytics(userId: string): void {
    localStorage.setItem(`analytics_disabled_${userId}`, 'true');
  }

  private disableMarketing(userId: string): void {
    localStorage.setItem(`marketing_disabled_${userId}`, 'true');
  }

  private disableThirdPartySharing(userId: string): void {
    localStorage.setItem(`third_party_disabled_${userId}`, 'true');
  }

  private logDataRectification(userId: string, dataType: string): void {
    const logEntry = {
      userId,
      action: 'data_rectification',
      dataType,
      timestamp: new Date().toISOString()
    };

    const existingLogs = JSON.parse(localStorage.getItem(`audit_log_${userId}`) || '[]');
    existingLogs.push(logEntry);
    localStorage.setItem(`audit_log_${userId}`, JSON.stringify(existingLogs));
  }
}

// Export singleton instance
export const gdprComplianceService = new GDPRComplianceService();