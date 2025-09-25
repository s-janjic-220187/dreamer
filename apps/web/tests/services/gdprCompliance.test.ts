/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { gdprComplianceService } from '../../src/services/gdprCompliance';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock navigator
const navigatorMock = {
  userAgent: 'Mozilla/5.0 (Test Browser)',
  language: 'en-US',
};

// Mock caches API
const cachesMock = {
  keys: vi.fn(),
  open: vi.fn(),
};

const cacheMock = {
  keys: vi.fn(),
  delete: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(window, 'navigator', {
  value: navigatorMock,
  writable: true,
});

Object.defineProperty(window, 'caches', {
  value: cachesMock,
  writable: true,
});

// Mock Intl
Object.defineProperty(global, 'Intl', {
  value: {
    DateTimeFormat: vi.fn(() => ({
      resolvedOptions: () => ({ timeZone: 'America/New_York' }),
    })),
  },
  writable: true,
});

describe('GDPRComplianceService', () => {
  const testUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    cachesMock.keys.mockResolvedValue([]);
    cachesMock.open.mockResolvedValue(cacheMock);
    cacheMock.keys.mockResolvedValue([]);
  });

  describe('Consent Management', () => {
    it('should record user consent', () => {
      const consentRecord = gdprComplianceService.recordConsent(
        testUserId,
        'data_processing',
        true
      );

      expect(consentRecord).toMatchObject({
        userId: testUserId,
        consentType: 'data_processing',
        granted: true,
        timestamp: expect.any(String),
        userAgent: 'Mozilla/5.0 (Test Browser)',
        version: '1.0.0',
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `gdpr_consent_records_${testUserId}`,
        expect.any(String)
      );
    });

    it('should get consent records for user', () => {
      const mockRecords = [
        {
          userId: testUserId,
          consentType: 'data_processing',
          granted: true,
          timestamp: '2024-01-01T00:00:00.000Z',
          version: '1.0.0',
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockRecords));

      const records = gdprComplianceService.getConsentRecords(testUserId);

      expect(records).toEqual(mockRecords);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        `gdpr_consent_records_${testUserId}`
      );
    });

    it('should return empty array when no consent records exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const records = gdprComplianceService.getConsentRecords(testUserId);

      expect(records).toEqual([]);
    });

    it('should check if user has specific consent', () => {
      const mockRecords = [
        {
          userId: testUserId,
          consentType: 'data_processing',
          granted: true,
          timestamp: '2024-01-01T00:00:00.000Z',
          version: '1.0.0',
        },
        {
          userId: testUserId,
          consentType: 'marketing',
          granted: false,
          timestamp: '2024-01-01T00:00:00.000Z',
          version: '1.0.0',
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockRecords));

      expect(gdprComplianceService.hasConsent(testUserId, 'data_processing')).toBe(true);
      expect(gdprComplianceService.hasConsent(testUserId, 'marketing')).toBe(false);
      expect(gdprComplianceService.hasConsent(testUserId, 'analytics')).toBe(false);
    });

    it('should get latest consent when multiple records exist', () => {
      const mockRecords = [
        {
          userId: testUserId,
          consentType: 'marketing',
          granted: true,
          timestamp: '2024-01-01T00:00:00.000Z',
          version: '1.0.0',
        },
        {
          userId: testUserId,
          consentType: 'marketing',
          granted: false,
          timestamp: '2024-01-02T00:00:00.000Z',
          version: '1.0.0',
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockRecords));

      expect(gdprComplianceService.hasConsent(testUserId, 'marketing')).toBe(false);
    });

    it('should withdraw consent', () => {
      gdprComplianceService.withdrawConsent(testUserId, 'analytics');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `gdpr_consent_records_${testUserId}`,
        expect.stringContaining('"granted":false')
      );

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `analytics_disabled_${testUserId}`,
        'true'
      );
    });
  });

  describe('Data Export (Right to Data Portability)', () => {
    it('should create data export', async () => {
      // Mock user data in localStorage
      localStorageMock.getItem.mockImplementation((key) => {
        if (key.includes('profile')) return '{"name":"Test User"}';
        if (key.includes('preferences')) return '{"theme":"dark"}';
        if (key.includes('dreams')) return '[{"id":"1","title":"Test Dream"}]';
        if (key.includes('analytics')) return '{"views":10}';
        if (key.includes('sharing')) return '{"shared":5}';
        if (key.includes('login_history')) return '[{"date":"2024-01-01"}]';
        return null;
      });

      const exportRequest = await gdprComplianceService.createDataExport(testUserId);

      expect(exportRequest).toMatchObject({
        userId: testUserId,
        requestDate: expect.any(String),
        completed: true,
        exportData: {
          metadata: {
            userId: testUserId,
            exportDate: expect.any(String),
            version: '1.0.0',
            format: 'JSON',
          },
          personalData: {
            profile: { name: 'Test User' },
            preferences: { theme: 'dark' },
            dreams: [{ id: '1', title: 'Test Dream' }],
            analytics: { views: 10 },
            sharing: { shared: 5 },
          },
          consentRecords: [],
          technicalData: {
            loginHistory: [{ date: '2024-01-01' }],
            deviceInfo: {
              userAgent: 'Mozilla/5.0 (Test Browser)',
              language: 'en-US',
              timezone: 'America/New_York',
            },
            ipAddresses: [],
          },
        },
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `gdpr_data_exports_${testUserId}`,
        expect.any(String)
      );
    });

    it('should get data export history', () => {
      const mockExports = [
        {
          userId: testUserId,
          requestDate: '2024-01-01T00:00:00.000Z',
          completed: true,
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockExports));

      const exports = gdprComplianceService.getDataExports(testUserId);

      expect(exports).toEqual(mockExports);
    });

    it('should handle data export errors', async () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      await expect(
        gdprComplianceService.createDataExport(testUserId)
      ).rejects.toThrow('Data export failed');
    });
  });

  describe('Data Deletion (Right to Erasure)', () => {
    it('should request complete data deletion', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'gdpr_deletion_requests_test-user-123') return '[]';
        return null;
      });

      // Mock localStorage keys
      Object.defineProperty(window.localStorage, 'length', {
        value: 3,
        writable: true,
      });

      const mockKeys = [
        `dreams_${testUserId}`,
        `profile_${testUserId}`,
        `other_key`,
      ];

      // Mock Object.keys to return the localStorage keys
      vi.spyOn(Object, 'keys').mockReturnValue(mockKeys);

      cachesMock.keys.mockResolvedValue(['cache1']);
      cachesMock.open.mockResolvedValue(cacheMock);
      cacheMock.keys.mockResolvedValue([
        { url: `https://example.com/api/${testUserId}/data` },
      ]);

      const deletionRequest = await gdprComplianceService.requestDataDeletion(
        testUserId,
        'complete',
        'User requested account deletion'
      );

      expect(deletionRequest).toMatchObject({
        userId: testUserId,
        requestDate: expect.any(String),
        completed: true,
        deletionType: 'complete',
        reason: 'User requested account deletion',
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(`dreams_${testUserId}`);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(`profile_${testUserId}`);
      expect(cacheMock.delete).toHaveBeenCalled();
    });

    it('should request partial data deletion', async () => {
      localStorageMock.getItem.mockReturnValue('[]');

      const deletionRequest = await gdprComplianceService.requestDataDeletion(
        testUserId,
        'partial'
      );

      expect(deletionRequest).toMatchObject({
        userId: testUserId,
        deletionType: 'partial',
        completed: true,
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(`dreams_${testUserId}`);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(`analytics_${testUserId}`);
    });

    it('should get deletion request history', () => {
      const mockDeletions = [
        {
          userId: testUserId,
          requestDate: '2024-01-01T00:00:00.000Z',
          completed: true,
          deletionType: 'partial',
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockDeletions));

      const deletions = gdprComplianceService.getDeletionRequests(testUserId);

      expect(deletions).toEqual(mockDeletions);
    });
  });

  describe('Other GDPR Rights', () => {
    it('should get user rights', () => {
      const rights = gdprComplianceService.getUserRights(testUserId);

      expect(rights).toEqual({
        dataPortability: true,
        rectification: true,
        erasure: true,
        restriction: true,
        objection: true,
        withdrawConsent: true,
      });
    });

    it('should rectify user data', () => {
      const newData = { name: 'Updated Name', email: 'new@example.com' };
      const result = gdprComplianceService.rectifyUserData(testUserId, 'profile', newData);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `profile_${testUserId}`,
        JSON.stringify(newData)
      );
    });

    it('should restrict data processing', () => {
      const result = gdprComplianceService.restrictDataProcessing(testUserId, true);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `data_restriction_${testUserId}`,
        expect.stringContaining('"restricted":true')
      );
    });

    it('should check if data processing is restricted', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ userId: testUserId, restricted: true })
      );

      const isRestricted = gdprComplianceService.isDataProcessingRestricted(testUserId);

      expect(isRestricted).toBe(true);
    });

    it('should return false when no restriction exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const isRestricted = gdprComplianceService.isDataProcessingRestricted(testUserId);

      expect(isRestricted).toBe(false);
    });
  });

  describe('Compliance Reporting', () => {
    it('should generate compliance report', () => {
      // Mock consent records
      const mockConsent = [
        {
          userId: testUserId,
          consentType: 'data_processing',
          granted: true,
          timestamp: '2024-01-01T00:00:00.000Z',
          version: '1.0.0',
        },
      ];

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === `gdpr_consent_records_${testUserId}`) {
          return JSON.stringify(mockConsent);
        }
        if (key === `gdpr_data_exports_${testUserId}`) {
          return JSON.stringify([{ requestDate: '2024-01-01' }]);
        }
        if (key === `gdpr_deletion_requests_${testUserId}`) {
          return JSON.stringify([]);
        }
        if (key === `data_restriction_${testUserId}`) {
          return JSON.stringify({ restricted: false });
        }
        return null;
      });

      const report = gdprComplianceService.generateComplianceReport(testUserId);

      expect(report).toMatchObject({
        userId: testUserId,
        reportDate: expect.any(String),
        consentStatus: {
          dataProcessing: true,
          marketing: false,
          analytics: false,
          thirdPartySharing: false,
        },
        dataExports: 1,
        deletionRequests: 0,
        dataProcessingRestricted: false,
        userRights: {
          dataPortability: true,
          rectification: true,
          erasure: true,
          restriction: true,
          objection: true,
          withdrawConsent: true,
        },
        complianceVersion: '1.0.0',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors in consent records', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const records = gdprComplianceService.getConsentRecords(testUserId);

      expect(records).toEqual([]);
    });

    it('should handle localStorage errors in data exports', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const exports = gdprComplianceService.getDataExports(testUserId);

      expect(exports).toEqual([]);
    });

    it('should handle rectification errors', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = gdprComplianceService.rectifyUserData(testUserId, 'profile', {});

      expect(result).toBe(false);
    });

    it('should handle restriction check errors', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const isRestricted = gdprComplianceService.isDataProcessingRestricted(testUserId);

      expect(isRestricted).toBe(false);
    });
  });
});