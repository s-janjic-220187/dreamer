/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dataEncryptionService } from '../../src/services/dataEncryption';

// Mock Web Crypto API
const mockCrypto = {
  subtle: {
    generateKey: vi.fn(),
    exportKey: vi.fn(),
    importKey: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
    deriveKey: vi.fn(),
  },
  getRandomValues: vi.fn((arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'crypto', {
  value: mockCrypto,
  writable: true,
});

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('DataEncryptionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockCrypto.subtle.generateKey.mockResolvedValue({
      type: 'secret',
      algorithm: { name: 'AES-GCM', length: 256 },
      extractable: true,
      usages: ['encrypt', 'decrypt'],
    });

    mockCrypto.subtle.exportKey.mockResolvedValue({
      kty: 'oct',
      k: 'mock-key-data',
      alg: 'A256GCM',
      key_ops: ['encrypt', 'decrypt'],
    });

    mockCrypto.subtle.importKey.mockResolvedValue({
      type: 'secret',
      algorithm: { name: 'AES-GCM', length: 256 },
      extractable: true,
      usages: ['encrypt', 'decrypt'],
    });

    mockCrypto.subtle.encrypt.mockResolvedValue(
      new ArrayBuffer(32) // Mock encrypted data
    );

    mockCrypto.subtle.decrypt.mockResolvedValue(
      new TextEncoder().encode('{"test":"decrypted data"}').buffer
    );

    mockCrypto.subtle.deriveKey.mockResolvedValue({
      type: 'secret',
      algorithm: { name: 'AES-GCM', length: 256 },
      extractable: false,
      usages: ['encrypt', 'decrypt'],
    });

    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should get encryption info', () => {
    const info = dataEncryptionService.getEncryptionInfo();
    
    expect(info).toEqual({
      algorithm: 'AES-GCM',
      keySize: 256,
      version: '1.0.0',
      cryptoAvailable: true,
    });
  });

  it('should create and store user key', async () => {
    const userId = 'test-user';
    
    const key = await dataEncryptionService.getOrCreateUserKey(userId);
    
    expect(mockCrypto.subtle.generateKey).toHaveBeenCalledWith(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    expect(mockCrypto.subtle.exportKey).toHaveBeenCalled();
    expect(localStorageMock.setItem).toHaveBeenCalled();
    expect(key).toBeDefined();
  });

  it('should retrieve existing user key', async () => {
    const userId = 'test-user';
    const mockKeyData = JSON.stringify({
      kty: 'oct',
      k: 'existing-key-data',
      alg: 'A256GCM',
      key_ops: ['encrypt', 'decrypt'],
    });
    
    localStorageMock.getItem.mockReturnValue(mockKeyData);
    
    const key = await dataEncryptionService.getOrCreateUserKey(userId);
    
    expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
      'jwk',
      JSON.parse(mockKeyData),
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    expect(key).toBeDefined();
  });

  it('should encrypt dream data', async () => {
    const testData = { title: 'Test Dream', content: 'Dream content' };
    const userId = 'test-user';
    
    const encryptedData = await dataEncryptionService.encryptDreamData(testData, userId);
    
    expect(encryptedData).toMatchObject({
      encryptedContent: expect.any(String),
      iv: expect.any(String),
      salt: expect.any(String),
      timestamp: expect.any(Number),
      version: '1.0.0',
    });
    expect(mockCrypto.subtle.encrypt).toHaveBeenCalled();
  });

  it('should decrypt dream data', async () => {
    const encryptedData = {
      encryptedContent: 'mock-encrypted-content',
      iv: 'mock-iv',
      salt: 'mock-salt',
      timestamp: Date.now(),
      version: '1.0.0',
    };
    const userId = 'test-user';
    
    const decryptedData = await dataEncryptionService.decryptDreamData(encryptedData, userId);
    
    expect(decryptedData).toEqual({ test: 'decrypted data' });
    expect(mockCrypto.subtle.decrypt).toHaveBeenCalled();
  });

  it('should encrypt and decrypt dream content', async () => {
    const content = 'This is a test dream content';
    const userId = 'test-user';
    
    // Mock the decrypt to return the content
    mockCrypto.subtle.decrypt.mockResolvedValue(
      new TextEncoder().encode(JSON.stringify({ content })).buffer
    );
    
    const encrypted = await dataEncryptionService.encryptDreamContent(content, userId);
    expect(encrypted.encryptedContent).toBeDefined();
    
    const decrypted = await dataEncryptionService.decryptDreamContent(encrypted, userId);
    expect(decrypted).toBe(content);
  });

  it('should encrypt entire dream object', async () => {
    const dream = {
      id: 'dream-1',
      title: 'Test Dream',
      content: 'Dream content',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mood: 'positive',
      tags: ['test'],
    };
    const userId = 'test-user';
    
    const result = await dataEncryptionService.encryptDream(dream, userId);
    
    expect(result).toMatchObject({
      id: dream.id,
      metadata: {
        id: dream.id,
        createdAt: dream.createdAt,
        updatedAt: dream.updatedAt,
      },
      encryptedData: {
        encryptedContent: expect.any(String),
        iv: expect.any(String),
        salt: expect.any(String),
        timestamp: expect.any(Number),
        version: '1.0.0',
      },
    });
  });

  it('should decrypt entire dream object', async () => {
    const originalDream = {
      id: 'dream-1',
      title: 'Test Dream',
      content: 'Dream content',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mood: 'positive',
      tags: ['test'],
    };
    
    const { id, createdAt, updatedAt, ...sensitiveData } = originalDream;
    
    // Mock decrypt to return sensitive data
    mockCrypto.subtle.decrypt.mockResolvedValue(
      new TextEncoder().encode(JSON.stringify(sensitiveData)).buffer
    );
    
    const encryptedDream = {
      id,
      metadata: { id, createdAt, updatedAt },
      encryptedData: {
        encryptedContent: 'mock-content',
        iv: 'mock-iv',
        salt: 'mock-salt',
        timestamp: Date.now(),
        version: '1.0.0',
      },
    };
    
    const decrypted = await dataEncryptionService.decryptDream(encryptedDream, 'test-user');
    
    expect(decrypted).toEqual(originalDream);
  });

  it('should check if data is encrypted', () => {
    const encryptedData = {
      encryptedContent: 'content',
      iv: 'iv',
      salt: 'salt',
    };
    
    const plainData = {
      title: 'Plain Dream',
      content: 'Plain content',
    };
    
    expect(dataEncryptionService.isEncrypted(encryptedData)).toBe(true);
    expect(dataEncryptionService.isEncrypted(plainData)).toBe(false);
    expect(dataEncryptionService.isEncrypted(null)).toBe(false);
  });

  it('should clear user keys', async () => {
    const userId = 'test-user';
    
    await dataEncryptionService.clearUserKeys(userId);
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      `dreamer_user_key_${userId}`
    );
  });

  it('should test encryption functionality', async () => {
    const userId = 'test-user';
    
    // Mock successful encryption/decryption cycle
    const testData = { test: 'encryption test', timestamp: expect.any(Number) };
    mockCrypto.subtle.decrypt.mockResolvedValue(
      new TextEncoder().encode(JSON.stringify(testData)).buffer
    );
    
    const result = await dataEncryptionService.testEncryption(userId);
    
    expect(result).toBe(true);
    expect(mockCrypto.subtle.encrypt).toHaveBeenCalled();
    expect(mockCrypto.subtle.decrypt).toHaveBeenCalled();
  });

  it('should handle encryption errors', async () => {
    const userId = 'test-user';
    mockCrypto.subtle.encrypt.mockRejectedValue(new Error('Encryption failed'));
    
    await expect(
      dataEncryptionService.encryptDreamData({ test: 'data' }, userId)
    ).rejects.toThrow('Failed to encrypt dream data');
  });

  it('should handle decryption errors', async () => {
    const encryptedData = {
      encryptedContent: 'invalid-content',
      iv: 'invalid-iv',
      salt: 'invalid-salt',
      timestamp: Date.now(),
      version: '1.0.0',
    };
    const userId = 'test-user';
    
    mockCrypto.subtle.decrypt.mockRejectedValue(new Error('Decryption failed'));
    
    await expect(
      dataEncryptionService.decryptDreamData(encryptedData, userId)
    ).rejects.toThrow('Failed to decrypt dream data');
  });

  it('should verify password change', async () => {
    const userId = 'test-user';
    const oldPassword = 'oldpass';
    const newPassword = 'newpass';
    
    const result = await dataEncryptionService.changeUserPassword(
      userId,
      oldPassword,
      newPassword
    );
    
    expect(result).toBe(true);
  });

  it('should handle key management errors', async () => {
    const userId = 'test-user';
    
    mockCrypto.subtle.generateKey.mockRejectedValue(new Error('Key generation failed'));
    
    await expect(
      dataEncryptionService.getOrCreateUserKey(userId)
    ).rejects.toThrow('Failed to manage encryption key');
  });
});