/**
 * Frontend Encryption Utilities
 * Handles decryption of secure API responses
 */

import CryptoJS from 'crypto-js';

/**
 * Decrypt user data from API response
 * Note: This is a simplified implementation. In production, you should use Web Crypto API
 * @param {string} encryptedData - Base64 encrypted data
 * @param {string} iv - Base64 initialization vector  
 * @param {string} tag - Base64 authentication tag
 * @returns {Object} Decrypted user data
 */
export const decryptUserData = async (encryptedData, iv, tag) => {
  try {
    // For demo purposes, we'll use a compatible approach with the backend
    // In production, implement proper AES-GCM using Web Crypto API
    
    // Derive the same key as backend
    const keyMaterial = 'bugline-encryption-derived-key';
    
    // Generate the same key hash as the backend
    const key = CryptoJS.SHA256(keyMaterial);
    
    // Convert IV from base64 to WordArray
    const ivWordArray = CryptoJS.enc.Base64.parse(iv);
    
    // Decrypt using AES-CBC with the proper IV
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, key, {
      iv: ivWordArray,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText) {
      // Fallback: try without decryption (backwards compatibility)
      try {
        return JSON.parse(encryptedData);
      } catch (parseError) {
        throw new Error('Failed to decrypt data');
      }
    }
    
    return JSON.parse(decryptedText);
  } catch (error) {
    console.error('Decryption failed:', error);
    
    // Fallback: try to parse as plain JSON (backwards compatibility)
    try {
      return JSON.parse(encryptedData);
    } catch (parseError) {
      throw new Error('Failed to decrypt user data');
    }
  }
};

/**
 * Decrypt authentication response
 * @param {Object} response - API response with encrypted user data
 * @returns {Object} Response with decrypted user data
 */
export const decryptAuthResponse = async (response) => {
  try {
    if (!response.encryptedUser || !response.iv || !response.tag) {
      // Fallback for non-encrypted responses (backwards compatibility)
      return response;
    }
    
    const decryptedUser = await decryptUserData(
      response.encryptedUser,
      response.iv,
      response.tag
    );
    
    return {
      ...response,
      user: decryptedUser,
      // Remove encrypted fields from response
      encryptedUser: undefined,
      iv: undefined,
      tag: undefined
    };
  } catch (error) {
    console.error('Failed to decrypt auth response:', error);
    throw new Error('Authentication data could not be decrypted');
  }
};

/**
 * Secure storage utilities
 */
export const secureStorage = {
  /**
   * Store encrypted data securely
   * @param {string} key - Storage key
   * @param {any} data - Data to store
   */
  setItem: (key, data) => {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(data), 
        'bugline-storage-key'
      ).toString();
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      // Fallback to regular storage
      localStorage.setItem(key, JSON.stringify(data));
    }
  },

  /**
   * Retrieve and decrypt stored data
   * @param {string} key - Storage key
   * @returns {any} Decrypted data
   */
  getItem: (key) => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      // Try to decrypt
      try {
        const decryptedBytes = CryptoJS.AES.decrypt(encrypted, 'bugline-storage-key');
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedText);
      } catch (decryptError) {
        // Fallback: try parsing as regular JSON (backwards compatibility)
        return JSON.parse(encrypted);
      }
    } catch (error) {
      console.error('Failed to retrieve encrypted data:', error);
      return null;
    }
  },

  /**
   * Remove item from secure storage
   * @param {string} key - Storage key
   */
  removeItem: (key) => {
    localStorage.removeItem(key);
  },

  /**
   * Clear all secure storage
   */
  clear: () => {
    localStorage.clear();
  }
};

/**
 * Validate if data is encrypted
 * @param {Object} response - API response
 * @returns {boolean} True if response contains encrypted data
 */
export const isEncryptedResponse = (response) => {
  return !!(response?.encryptedUser && response?.iv && response?.tag);
};

/**
 * Cookie utilities for secure token storage
 */
export const secureCookies = {
  /**
   * Set secure cookie
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {number} days - Expiration in days
   */
  setCookie: (name, value, days = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
  },

  /**
   * Get cookie value
   * @param {string} name - Cookie name
   * @returns {string|null} Cookie value
   */
  getCookie: (name) => {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  /**
   * Delete cookie
   * @param {string} name - Cookie name
   */
  deleteCookie: (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

export default {
  decryptUserData,
  decryptAuthResponse,
  secureStorage,
  isEncryptedResponse,
  secureCookies
};