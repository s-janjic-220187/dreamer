/**
 * Data Encryption Service
 * Implements AES-256 encryption for sensitive dream data with secure key management
 */

import CryptoJS from 'crypto-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface EncryptionConfig {
  algorithm: 'AES';
  keySize: 256;
  iterations: 10000;
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
    algorithm: 'AES',
    keySize: 256,
    iterations: 10000
  };

  private readonly ENCRYPTION_VERSION = '1.0.0';
  private readonly MASTER_KEY = 'dreamer_master_key';
  private readonly USER_KEY_PREFIX = 'user_encryption_key_';

  /**
   * Generate or retrieve user-specific encryption key
   */
  async getOrCreateUserKey(userId: string): Promise<string> {
    const keyName = `${this.USER_KEY_PREFIX}${userId}`;
    
    try {
      let userKey = await SecureStore.getItemAsync(keyName);
      
      if (!userKey) {
        // Generate new key for user
        userKey = this.generateSecureKey();
        await SecureStore.setItemAsync(keyName, userKey, {
          requireAuthentication: true,
          accessGroup: Platform.OS === 'ios' ? 'group.com.dreamer.app' : undefined,
        });
      }
      
      return userKey;
    } catch (error) {
      console.error('Error managing user encryption key:', error);
      throw new Error('Failed to manage encryption key');
    }
  }

  /**
   * Generate a cryptographically secure key
   */
  private generateSecureKey(): string {
    return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
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
      const userKey = await this.getOrCreateUserKey(userId);
      const salt = CryptoJS.lib.WordArray.random(16);
      
      // Derive key using PBKDF2
      const derivedKey = userPassword 
        ? CryptoJS.PBKDF2(userPassword, salt, { 
            keySize: this.config.keySize / 32, 
            iterations: this.config.iterations 
          })
        : CryptoJS.enc.Hex.parse(userKey);

      // Generate random IV
      const iv = CryptoJS.lib.WordArray.random(16);
      
      // Encrypt data
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(data), 
        derivedKey, 
        { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
      );

      return {
        encryptedContent: encrypted.toString(),
        iv: iv.toString(CryptoJS.enc.Hex),
        salt: salt.toString(CryptoJS.enc.Hex),
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
      const userKey = await this.getOrCreateUserKey(userId);
      const salt = CryptoJS.enc.Hex.parse(encryptedData.salt);
      
      // Derive the same key used for encryption
      const derivedKey = userPassword 
        ? CryptoJS.PBKDF2(userPassword, salt, { 
            keySize: this.config.keySize / 32, 
            iterations: this.config.iterations 
          })
        : CryptoJS.enc.Hex.parse(userKey);

      const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
      
      // Decrypt data
      const decrypted = CryptoJS.AES.decrypt(
        encryptedData.encryptedContent, 
        derivedKey, 
        { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
      );

      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      
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
    newPassword: string
  ): Promise<boolean> {
    try {
      // Verify old password by attempting to decrypt test data
      const testData = { test: 'verification' };
      const encrypted = await this.encryptDreamData(testData, userId, oldPassword);
      await this.decryptDreamData(encrypted, userId, oldPassword);
      
      // Password verification successful, update stored key
      const newKey = CryptoJS.PBKDF2(newPassword, CryptoJS.lib.WordArray.random(16), {
        keySize: this.config.keySize / 32,
        iterations: this.config.iterations
      }).toString(CryptoJS.enc.Hex);
      
      const keyName = `${this.USER_KEY_PREFIX}${userId}`;
      await SecureStore.setItemAsync(keyName, newKey, {
        requireAuthentication: true,
        accessGroup: Platform.OS === 'ios' ? 'group.com.dreamer.app' : undefined,
      });
      
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
      await SecureStore.deleteItemAsync(keyName);
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
    secureStoreAvailable: boolean 
  } {
    return {
      algorithm: this.config.algorithm,
      keySize: this.config.keySize,
      version: this.ENCRYPTION_VERSION,
      secureStoreAvailable: SecureStore.isAvailableAsync !== undefined
    };
  }
}

// Export singleton instance
export const dataEncryptionService = new DataEncryptionService();