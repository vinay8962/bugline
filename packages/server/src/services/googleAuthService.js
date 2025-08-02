import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

class GoogleAuthService {
  constructor() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-32-char-key-for-development';
  }

  // Verify Google ID Token
  async verifyGoogleToken(idToken) {
    try {
      console.log('🔍 Verifying token with Client ID:', process.env.GOOGLE_CLIENT_ID);
      
      const ticket = await this.client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
        // Add clock tolerance for slight time differences
        clockSkewTolerance: 300, // 5 minutes tolerance
      });

      const payload = ticket.getPayload();
      console.log('✅ Token verified successfully for user:', payload.email);
      
      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified
      };
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      console.error('📋 Full error:', error);
      throw new Error('Invalid Google token');
    }
  }

  // Create encrypted token for Company Admins
  createEncryptedToken(userData) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(this.encryptionKey.slice(0, 64), 'hex'); // Ensure 32 bytes
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(userData), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encryptedToken: encrypted,
      iv: iv.toString('hex')
    };
  }

  // Decrypt admin token
  decryptToken(encryptedToken, iv) {
    try {
      const algorithm = 'aes-256-cbc';
      const key = Buffer.from(this.encryptionKey.slice(0, 64), 'hex'); // Ensure 32 bytes
      const ivBuffer = Buffer.from(iv, 'hex');
      
      const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
      let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error('Invalid encrypted token');
    }
  }
}

export default new GoogleAuthService();