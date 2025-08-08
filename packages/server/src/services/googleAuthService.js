import { OAuth2Client } from 'google-auth-library';

class GoogleAuthService {
  constructor() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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

}

export default new GoogleAuthService();