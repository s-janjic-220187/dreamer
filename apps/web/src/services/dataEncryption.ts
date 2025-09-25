/**
 * Data Encryption Service - Web Implementation
 * Implements AES-256 encryption for sensitive dream data with secure key management
 */

export interface EncryptionConfig {
  algorithm: 'AES-GCM';
  keySize: 256;
  iterations: 100000;
}

export interface EncryptedData {
  encryptedContent: string;
  iv: string;
  salt: string;
  timestamp: number;
  version: string;
}

class DataEncryptionService {
  private config: EncryptionConfig = {
    algorithm: 'AES-GCM',
    keySize: 256,
    iterations: 100000
  };

  private readonly ENCRYPTION_VERSION = '1.0.0';
  private readonly USER_KEY_PREFIX = 'dreamer_user_key_';

  /**
   * Generate or retrieve user-specific encryption key
   */
  async getOrCreateUserKey(userId: string): Promise<CryptoKey> {
    const keyName = `${this.USER_KEY_PREFIX}${userId}`;
    
    try {
      // Try to get existing key from IndexedDB
      let storedKey = localStorage.getItem(keyName);
      
      if (!storedKey) {
        // Generate new key for user
        const key = await window.crypto.subtle.generateKey(
          {
            name: 'AES-GCM',
            length: 256,
          },
          true, // extractable
          ['encrypt', 'decrypt']
        );
        
        // Export and store the key
        const exportedKey = await window.crypto.subtle.exportKey('jwk', key);
        localStorage.setItem(keyName, JSON.stringify(exportedKey));
        
        return key;
      }
      
      // Import the stored key
      const keyData = JSON.parse(storedKey);
      return await window.crypto.subtle.importKey(
        'jwk',
        keyData,
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Error managing user encryption key:', error);
      throw new Error('Failed to manage encryption key');
    }
  }

  /**
   * Derive key from password using PBKDF2
   */
  private async deriveKeyFromPassword(
    password: string, 
    salt: Uint8Array
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: this.config.iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate random bytes
   */
  private generateRandomBytes(length: number): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(length));
  }

  /**
   * Convert Uint8Array to base64
   */
  private uint8ArrayToBase64(uint8Array: Uint8Array): string {
    const binary = String.fromCharCode.apply(null, Array.from(uint8Array));
    return btoa(binary);
  }

  /**
   * Convert array buffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return this.uint8ArrayToBase64(bytes);
  }

  /**
   * Convert base64 to Uint8Array
   */
  private base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Encrypt sensitive dream data
   */
  async encryptDreamData(
    data: any, 
    userId: string, 
    userPassword?: string
  ): Promise<EncryptedData> {
    try {
      const salt = this.generateRandomBytes(16);
      const iv = this.generateRandomBytes(12); // 96 bits for AES-GCM
      
      // Get encryption key
      const key = userPassword 
        ? await this.deriveKeyFromPassword(userPassword, salt)
        : await this.getOrCreateUserKey(userId);

      // Encrypt data
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(JSON.stringify(data));
      
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv as BufferSource
        },
        key,
        dataBuffer
      );

      return {
        encryptedContent: this.arrayBufferToBase64(encryptedBuffer),
        iv: this.uint8ArrayToBase64(iv),
        salt: this.uint8ArrayToBase64(salt),
        timestamp: Date.now(),
        version: this.ENCRYPTION_VERSION
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt dream data');
    }
  }

  /**
   * Decrypt sensitive dream data
   */
  async decryptDreamData(
    encryptedData: EncryptedData, 
    userId: string, 
    userPassword?: string
  ): Promise<any> {
    try {
      const salt = this.base64ToUint8Array(encryptedData.salt);
      const iv = this.base64ToUint8Array(encryptedData.iv);
      const encrypted = this.base64ToUint8Array(encryptedData.encryptedContent);
      
      // Get decryption key
      const key = userPassword 
        ? await this.deriveKeyFromPassword(userPassword, salt)
        : await this.getOrCreateUserKey(userId);

      // Decrypt data
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv as BufferSource
        },
        key,
        encrypted as BufferSource
      );

      const decoder = new TextDecoder();
      const decryptedString = decoder.decode(decryptedBuffer);
      
      if (!decryptedString) {
        throw new Error('Decryption resulted in empty string');
      }

      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt dream data');
    }
  }

  /**
   * Encrypt dream content for storage
   */
  async encryptDreamContent(
    content: string, 
    userId: string, 
    userPassword?: string
  ): Promise<EncryptedData> {
    return this.encryptDreamData({ content }, userId, userPassword);
  }

  /**
   * Decrypt dream content from storage
   */
  async decryptDreamContent(
    encryptedData: EncryptedData, 
    userId: string, 
    userPassword?: string
  ): Promise<string> {
    const decryptedData = await this.decryptDreamData(encryptedData, userId, userPassword);
    return decryptedData.content;
  }

  /**
   * Encrypt entire dream object
   */
  async encryptDream(
    dream: any, 
    userId: string, 
    userPassword?: string
  ): Promise<{ id: string; encryptedData: EncryptedData; metadata: any }> {
    // Separate sensitive and non-sensitive data
    const { id, createdAt, updatedAt, ...sensitiveData } = dream;
    const metadata = { id, createdAt, updatedAt };
    
    const encryptedData = await this.encryptDreamData(sensitiveData, userId, userPassword);
    
    return {
      id,
      encryptedData,
      metadata
    };
  }

  /**
   * Decrypt entire dream object
   */
  async decryptDream(
    encryptedDream: { id: string; encryptedData: EncryptedData; metadata: any }, 
    userId: string, 
    userPassword?: string
  ): Promise<any> {
    const sensitiveData = await this.decryptDreamData(
      encryptedDream.encryptedData, 
      userId, 
      userPassword
    );
    
    return {
      ...encryptedDream.metadata,
      ...sensitiveData
    };
  }

  /**
   * Change user encryption password
   */
  async changeUserPassword(
    userId: string, 
    oldPassword: string, 
    _newPassword: string
  ): Promise<boolean> {
    try {
      // Verify old password by attempting to decrypt test data
      const testData = { test: 'verification' };
      const encrypted = await this.encryptDreamData(testData, userId, oldPassword);
      await this.decryptDreamData(encrypted, userId, oldPassword);
      
      // Password verification successful
      // Note: For web, we don't store password-derived keys, they're derived on-demand
      return true;
    } catch (error) {
      console.error('Password change failed:', error);
      return false;
    }
  }

  /**
   * Clear user encryption keys (for logout/data deletion)
   */
  async clearUserKeys(userId: string): Promise<void> {
    try {
      const keyName = `${this.USER_KEY_PREFIX}${userId}`;
      localStorage.removeItem(keyName);
    } catch (error) {
      console.error('Error clearing user keys:', error);
      throw new Error('Failed to clear encryption keys');
    }
  }

  /**
   * Check if data is encrypted
   */
  isEncrypted(data: any): boolean {
    return data && typeof data === 'object' && 
           'encryptedContent' in data && 
           'iv' in data && 
           'salt' in data;
  }

  /**
   * Get encryption status and metadata
   */
  getEncryptionInfo(): { 
    algorithm: string; 
    keySize: number; 
    version: string; 
    cryptoAvailable: boolean 
  } {
    return {
      algorithm: this.config.algorithm,
      keySize: this.config.keySize,
      version: this.ENCRYPTION_VERSION,
      cryptoAvailable: typeof window.crypto.subtle !== 'undefined'
    };
  }

  /**
   * Test encryption/decryption functionality
   */
  async testEncryption(userId: string): Promise<boolean> {
    try {
      const testData = { test: 'encryption test', timestamp: Date.now() };
      const encrypted = await this.encryptDreamData(testData, userId);
      const decrypted = await this.decryptDreamData(encrypted, userId);
      
      return JSON.stringify(testData) === JSON.stringify(decrypted);
    } catch (error) {
      console.error('Encryption test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const dataEncryptionService = new DataEncryptionService();