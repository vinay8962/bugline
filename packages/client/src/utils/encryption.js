/**
 * Frontend Encryption Utilities
 * Handles decryption of secure API responses
 */

// Remove CryptoJS for API response decryption. Use Web Crypto API for AES-GCM.

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
    // Use Web Crypto API for AES-GCM decryption
    // Key derivation must match server: pbkdf2(secret, salt, 100000, 32, sha256)
    const secret = import.meta.env.VITE_ENCRYPTION_KEY;
    const salt = "bugline-salt";
    if (!secret) throw new Error("Encryption secret not configured");

    // Derive key using PBKDF2
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    const key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: enc.encode(salt),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    // Decode base64 values
    const ivBuffer = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
    const tagBuffer = Uint8Array.from(atob(tag), (c) => c.charCodeAt(0));
    const encryptedBuffer = Uint8Array.from(atob(encryptedData), (c) =>
      c.charCodeAt(0)
    );

    // AES-GCM expects tag to be appended to ciphertext
    const cipherWithTag = new Uint8Array(
      encryptedBuffer.length + tagBuffer.length
    );
    cipherWithTag.set(encryptedBuffer);
    cipherWithTag.set(tagBuffer, encryptedBuffer.length);
    // Decrypt
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBuffer,
        tagLength: 128,
      },
      key,
      cipherWithTag
    );
    const decoded = new TextDecoder().decode(decrypted);
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error("Failed to decrypt user data", error);
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
      tag: undefined,
    };
  } catch (error) {
    throw new Error("Authentication data could not be decrypted");
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
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  },

  getItem: (key) => {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;
      return JSON.parse(value);
    } catch (error) {
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
  },
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
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
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
  },
};

export default {
  decryptUserData,
  decryptAuthResponse,
  secureStorage,
  isEncryptedResponse,
  secureCookies,
};
