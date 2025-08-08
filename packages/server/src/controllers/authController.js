import { 
  createUser, 
  getUserByEmail, 
  updateUserPassword, 
  verifyUserEmail,
  getUserWithCompanyContext 
} from "../services/userService.js";
import { EmailService } from "../services/emailService.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { generateToken } from "../middleware/authPrisma.js";
import jwt from "jsonwebtoken";
import googleAuthService from "../services/googleAuthService.js";
import { prisma } from "../config/prisma.js";
import { sendSuccess, sendError } from "../utils/responseHelpers.js";
import { 
  logInfo, 
  logError, 
  logAuth, 
  logUserAction, 
  logSecurity,
  logPerformance 
} from "../utils/logger.js";

// User registration
export const register = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { email, firstName, lastName, full_name, password } = req.body;

  logInfo("User registration attempt", { email, hasPassword: !!password });

  // Create user
  const userData = {
    email,
    firstName,
    lastName,
    full_name: full_name || `${firstName || ''} ${lastName || ''}`.trim(),
    password, // Will be hashed in the service
    global_role: "USER",
    email_verified: false // Regular users need email verification
  };

  const user = await createUser(userData);
  logAuth("User registered", user.id, true);

  // Send email verification only for regular users (not admin/super admin)
  if (user.global_role === "USER") {
    try {
      await EmailService.sendEmailVerification(user);
      logInfo("Email verification sent", { userId: user.id, email: user.email });
    } catch (emailError) {
      logError("Failed to send verification email", emailError);
      // Don't fail registration if email fails, but log it
    }
  }

  // Generate JWT token
  const token = generateToken(user.id);

  const duration = Date.now() - startTime;
  logPerformance("User registration", duration, { userId: user.id });

  // Create plain response for authentication
  const responseData = {
    user,
    token,
    redirectTo: 'dashboard'
  };

  sendSuccess(res, responseData, "User registered successfully. Please check your email to verify your account.", 201);
});



// Verify email
export const verifyEmail = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { token } = req.body;

  logInfo("Email verification attempt", { hasToken: !!token });

  try {
    const decoded = EmailService.verifyEmailToken(token);
    logInfo("Email token verified", { userId: decoded.userId });
    
    // Update user email verification status
    const user = await verifyUserEmail(decoded.userId);
    logAuth("Email verified", user.id, true);
    logUserAction(user.id, "email_verified", { email: user.email });

    const duration = Date.now() - startTime;
    logPerformance("Email verification", duration, { userId: user.id });

    sendSuccess(res, {
      user
    }, "Email verified successfully");
  } catch (error) {
    const duration = Date.now() - startTime;
    logError("Email verification failed", { error: error.message, duration });
    return sendError(res, error.message, 400);
  }
});

// Resend verification email
export const resendVerification = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { email } = req.body;

  logInfo("Resend verification email attempt", { email });

  const user = await getUserByEmail(email);
  if (!user) {
    logSecurity("Resend verification failed - user not found", { email });
    return sendError(res, "User not found", 404);
  }

  if (user.email_verified) {
    logInfo("Resend verification failed - email already verified", { email, userId: user.id });
    return sendError(res, "Email already verified", 400);
  }

  try {
    await EmailService.sendEmailVerification(user);
    logInfo("Verification email resent", { userId: user.id, email });
    logUserAction(user.id, "verification_email_resent", { email });

    const duration = Date.now() - startTime;
    logPerformance("Resend verification email", duration, { userId: user.id });

    sendSuccess(res, null, "Verification email sent successfully");
  } catch (error) {
    const duration = Date.now() - startTime;
    logError("Failed to resend verification email", { error: error.message, userId: user.id, duration });
    return sendError(res, "Failed to send verification email", 500);
  }
});

// Forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { email } = req.body;

  logInfo("Forgot password request", { email });

  const user = await getUserByEmail(email);
  if (!user) {
    // Don't reveal if user exists or not for security
    logSecurity("Forgot password - user not found", { email });
    const duration = Date.now() - startTime;
    logPerformance("Forgot password", duration, { email, userFound: false });
    
    return res.status(200).json({
      success: true,
      message: "If an account with that email exists, we've sent a password reset link",
    });
  }

  try {
    await EmailService.sendPasswordResetEmail(user);
    logInfo("Password reset email sent", { userId: user.id, email });
    logUserAction(user.id, "password_reset_requested", { email });

    const duration = Date.now() - startTime;
    logPerformance("Forgot password", duration, { userId: user.id, userFound: true });

    res.status(200).json({
      success: true,
      message: "If an account with that email exists, we've sent a password reset link",
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError("Failed to send password reset email", { error: error.message, userId: user.id, duration });
    return res.status(500).json({
      success: false,
      message: "Failed to send password reset email",
    });
  }
});

// Reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { token, password } = req.body;

  logInfo("Password reset attempt", { hasToken: !!token, hasPassword: !!password });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== "password_reset") {
      logSecurity("Password reset failed - invalid token type", { tokenType: decoded.type });
      throw new Error("Invalid token type");
    }

    logInfo("Password reset token verified", { userId: decoded.userId });

    // Update user password (hashing is handled in the service)
    await updateUserPassword(decoded.userId, password);
    logAuth("Password reset", decoded.userId, true);
    logUserAction(decoded.userId, "password_reset", { tokenType: decoded.type });

    const duration = Date.now() - startTime;
    logPerformance("Password reset", duration, { userId: decoded.userId });

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError("Password reset failed", { error: error.message, duration });
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset token",
    });
  }
});

// Google OAuth Login
export const googleLogin = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const { idToken } = req.body;

  logInfo("Google OAuth login attempt", { hasIdToken: !!idToken });

  if (!idToken) {
    logSecurity("Google login failed - missing ID token");
    return sendError(res, "Google ID token is required", 400);
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('🔑 Attempting Google login...');
    console.log('🌐 Client ID configured:', !!process.env.GOOGLE_CLIENT_ID);
  }
  
  try {
    // Verify Google token
    const googleUser = await googleAuthService.verifyGoogleToken(idToken);
    logInfo("Google token verified", { email: googleUser.email, googleId: googleUser.googleId });
    
    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { email: googleUser.email }
    });

    if (user) {
      logInfo("Google login - existing user found", { userId: user.id, email: user.email, role: user.global_role });
      
      // Existing user - check role and redirect accordingly
      let responseData;
      
      if (user.global_role === 'USER') {
        // Get user with company context using service
        const { user: enrichedUser, companyContext } = await getUserWithCompanyContext(user.id);
        
        if (Object.keys(companyContext).length > 0) {
          logInfo("Google login - user with company role", { 
            userId: user.id, 
            companyId: companyContext.companyId, 
            role: companyContext.companyRole 
          });
        } else {
          logInfo("Google login - regular user", { userId: user.id });
        }
        
        // Create JWT token for API authentication
        const token = generateToken(user.id);
        
        // Create plain response with company context merged into user
        responseData = {
          user: {
            ...enrichedUser,
            ...companyContext
          },
          token,
          redirectTo: 'dashboard'
        };
      } else if (user.global_role === 'SUPER_ADMIN') {
        logInfo("Google login - super admin", { userId: user.id });
        
        // Super admin gets full access
        const token = generateToken(user.id);
        responseData = {
          user,
          token,
          redirectTo: 'dashboard'
        };
      }
      
      logAuth("Google login successful", user.id, true);
      logUserAction(user.id, "google_login", { 
        email: user.email, 
        role: user.global_role, 
        redirectTo: responseData.redirectTo 
      });
      
      const duration = Date.now() - startTime;
      logPerformance("Google login", duration, { userId: user.id, redirectTo: responseData.redirectTo });
      
      return sendSuccess(res, responseData, "Login successful");
      
    } else {
      logInfo("Google login - creating new user", { email: googleUser.email });
      
      // New user - Create as regular USER, they'll create/join companies later
      const newUser = await prisma.user.create({
        data: {
          email: googleUser.email,
          full_name: googleUser.name,
          google_id: googleUser.googleId,
          profile_picture: googleUser.picture,
          global_role: 'USER',
          email_verified: googleUser.emailVerified,
          is_verified: true // Google users are auto-verified
        }
      });
      
      logAuth("Google user created", newUser.id, true);
      logUserAction(newUser.id, "google_user_created", { 
        email: newUser.email, 
        googleId: googleUser.googleId 
      });
      
      // Create regular token for new user
      const token = generateToken(newUser.id);
      
      const duration = Date.now() - startTime;
      logPerformance("Google user creation", duration, { userId: newUser.id });
      
      // Create plain response for new user
      const responseData = {
        user: newUser,
        token,
        redirectTo: 'dashboard'
      };
      
      return sendSuccess(res, responseData, "Account created successfully. Please create or join a company to continue.", 201);
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logError("Google login failed", { error: error.message, duration });
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Google login error:', error);
    }
    return sendError(res, "Invalid Google token or authentication failed", 401);
  }
});