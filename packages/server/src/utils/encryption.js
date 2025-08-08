/**
 * Encryption Utilities for Secure Data Transmission
 * Uses AES-256-GCM for authenticated encryption
 */

import crypto from "crypto";

// Encryption configuration
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits

/**
 * Generate encryption key from environment secret
 * @returns {Buffer} 256-bit encryption key
 */
const getEncryptionKey = () => {
  const secret = process.env.ENCRYPTION_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Encryption secret not configured");
  }
  // Derive a consistent key from the secret
  return crypto.pbkdf2Sync(
    secret,
    "bugline-salt",
    100000,
    KEY_LENGTH,
    "sha256"
  );
};

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param {any} data - Data to encrypt
 * @returns {Object} { encryptedData, iv, tag }
 */
export const encrypt = (data) => {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(JSON.stringify(data), "utf8", "base64");
    encrypted += cipher.final("base64");
    const tag = cipher.getAuthTag().toString("base64");
    return {
      encryptedData: encrypted,
      iv: iv.toString("base64"),
      tag,
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

/**
 * Decrypt sensitive data using AES-256-GCM
 * @param {string} encryptedData - Base64 encrypted data
 * @param {string} iv - Base64 initialization vector
 * @param {string} tag - Base64 authentication tag
 * @returns {any} Decrypted data
 */
export const decrypt = (encryptedData, iv, tag) => {
  try {
    const key = getEncryptionKey();
    const ivBuffer = Buffer.from(iv, "base64");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
    decipher.setAuthTag(Buffer.from(tag, "base64"));
    let decrypted = decipher.update(encryptedData, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

/**
 * Create encrypted token for sensitive data
 * @param {any} payload - Data to encrypt
 * @returns {Object} { token, iv, tag }
 */
export const createEncryptedToken = (payload) => {
  const { encryptedData, iv, tag } = encrypt(payload);
  return {
    token: encryptedData,
    iv,
    tag,
  };
};

/**
 * Verify and decrypt encrypted token
 * @param {string} token - Encrypted token
 * @param {string} iv - Initialization vector
 * @param {string} tag - Authentication tag
 * @returns {any} Decrypted payload
 */
export const verifyEncryptedToken = (token, iv, tag) => {
  return decrypt(token, iv, tag);
};

/**
 * Hash sensitive data (one-way)
 * @param {string} data - Data to hash
 * @returns {string} SHA-256 hash
 */
export const hashData = (data) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

/**
 * Generate secure random token
 * @param {number} length - Token length in bytes (default: 32)
 * @returns {string} Random token in hex format
 */
export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Encrypt user data for API response
 * @param {Object} userData - User data to encrypt
 * @returns {Object} Encrypted response format
 */
export const encryptUserData = (userData) => {
  // Only encrypt sensitive fields
  const sensitiveData = {
    id: userData.id,
    email: userData.email,
    full_name: userData.full_name,
    global_role: userData.global_role,
    email_verified: userData.email_verified,
    is_verified: userData.is_verified,
    profile_picture: userData.profile_picture,
    created_at: userData.created_at,
  };
  return createEncryptedToken(sensitiveData);
};

/**
 * Create secure authentication response
 * @param {Object} user - User object
 * @param {string} token - JWT token
 * @param {string} redirectTo - Redirect destination
 * @param {Object} adminContext - Admin context data (companyId, role, etc.)
 * @returns {Object} Secure response format
 */
export const createSecureAuthResponse = (
  user,
  token,
  redirectTo,
  adminContext = {}
) => {
  // Create comprehensive user data including admin context
  const userData = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    global_role: user.global_role,
    email_verified: user.email_verified,
    is_verified: user.is_verified,
    profile_picture: user.profile_picture,
    created_at: user.created_at,
    ...(adminContext.companyId && {
      companyId: adminContext.companyId,
      companyRole: adminContext.companyRole,
    }),
    ...adminContext,
  };
  // Encrypt the combined user data
  const encryptedUser = createEncryptedToken(userData);
  return {
    encryptedUser: encryptedUser.token,
    iv: encryptedUser.iv,
    tag: encryptedUser.tag,
    token, // JWT for API authentication
    redirectTo,
  };
};

/**
 * Validate encryption environment
 * @returns {boolean} True if encryption is properly configured
 */
export const validateEncryptionConfig = () => {
  try {
    const secret = process.env.ENCRYPTION_SECRET || process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      return false;
    }
    // Test encryption/decryption
    const testData = { test: "data" };
    const encrypted = encrypt(testData);
    const decrypted = decrypt(
      encrypted.encryptedData,
      encrypted.iv,
      encrypted.tag
    );
    return JSON.stringify(testData) === JSON.stringify(decrypted);
  } catch (error) {
    return false;
  }
};

export default {
  encrypt,
  decrypt,
  createEncryptedToken,
  verifyEncryptedToken,
  hashData,
  generateSecureToken,
  encryptUserData,
};
