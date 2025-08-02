import { 
  createUser, 
  getUserByEmail, 
  verifyUserPassword, 
  getUserById, 
  updateUserPassword, 
  verifyUserEmail 
} from "../services/userService.js";
import { EmailService } from "../services/emailService.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { generateToken } from "../middleware/authPrisma.js";
import jwt from "jsonwebtoken";
import googleAuthService from "../services/googleAuthService.js";
import { prisma } from "../config/prisma.js";
import { sendSuccess, sendError, createPagination } from "../utils/responseHelpers.js";

// User registration
export const register = asyncHandler(async (req, res) => {
  const { email, firstName, lastName, full_name, password } = req.body;

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

  // Send email verification only for regular users (not admin/super admin)
  if (user.global_role === "USER") {
    try {
      await EmailService.sendEmailVerification(user);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails, but log it
    }
  }

  // Generate JWT token
  const token = generateToken(user.id);

  sendSuccess(res, {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      global_role: user.global_role,
      email_verified: user.email_verified,
    },
    token,
  }, "User registered successfully. Please check your email to verify your account.", 201);
});

// User login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Verify user credentials using the service
  const authenticatedUser = await verifyUserPassword(email, password);
  if (!authenticatedUser) {
    return sendError(res, "Invalid email or password", 401);
  }

  // Generate JWT token
  const token = generateToken(authenticatedUser.id);

  sendSuccess(res, {
    user: {
      id: authenticatedUser.id,
      email: authenticatedUser.email,
      full_name: authenticatedUser.full_name,
      global_role: authenticatedUser.global_role,
      email_verified: authenticatedUser.email_verified,
    },
    token,
  }, "Login successful");
});

// Get current user
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);

  sendSuccess(res, {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    global_role: user.global_role,
    email_verified: user.email_verified,
  }, "User data retrieved successfully");
});

// Verify email
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = EmailService.verifyEmailToken(token);
    
    // Update user email verification status
    const user = await verifyUserEmail(decoded.userId);

    sendSuccess(res, {
      id: user.id,
      email: user.email,
      email_verified: user.email_verified,
    }, "Email verified successfully");
  } catch (error) {
    return sendError(res, error.message, 400);
  }
});

// Resend verification email
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await getUserByEmail(email);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  if (user.email_verified) {
    return sendError(res, "Email already verified", 400);
  }

  try {
    await EmailService.sendEmailVerification(user);
    sendSuccess(res, null, "Verification email sent successfully");
  } catch (error) {
    return sendError(res, "Failed to send verification email", 500);
  }
});

// Forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await getUserByEmail(email);
  if (!user) {
    // Don't reveal if user exists or not for security
    return res.status(200).json({
      success: true,
      message: "If an account with that email exists, we've sent a password reset link",
    });
  }

  try {
    await EmailService.sendPasswordResetEmail(user);
    res.status(200).json({
      success: true,
      message: "If an account with that email exists, we've sent a password reset link",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send password reset email",
    });
  }
});

// Reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== "password_reset") {
      throw new Error("Invalid token type");
    }

    // Update user password (hashing is handled in the service)
    await updateUserPassword(decoded.userId, password);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset token",
    });
  }
});

// Google OAuth Login
export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return sendError(res, "Google ID token is required", 400);
  }

  console.log('🔑 Attempting Google login...');
  console.log('🌐 Client ID configured:', process.env.GOOGLE_CLIENT_ID);
  
  try {
    // Verify Google token
    const googleUser = await googleAuthService.verifyGoogleToken(idToken);
    
    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email }
    });

    if (user) {
      // Existing user - check role and redirect accordingly
      let responseData;
      
      if (user.global_role === 'USER') {
        // Check if user is company admin in any company
        const adminMembership = await prisma.companyUser.findFirst({
          where: { 
            user_id: user.id,
            role: 'ADMIN'
          },
          include: {
            company: true
          }
        });

        if (adminMembership) {
          // Create encrypted token for Company Admin
          const { encryptedToken, iv } = googleAuthService.createEncryptedToken({
            userId: user.id,
            email: user.email,
            role: 'ADMIN',
            companyId: adminMembership.company_id,
            timestamp: Date.now()
          });
          
          responseData = {
            user: {
              id: user.id,
              email: user.email,
              full_name: user.full_name,
              global_role: user.global_role,
              is_verified: user.is_verified
            },
            encryptedToken,
            iv,
            redirectTo: 'admin'
          };
        } else {
          // Regular user with company memberships
          const token = generateToken(user.id);
          
          responseData = {
            user: {
              id: user.id,
              email: user.email,
              full_name: user.full_name,
              global_role: user.global_role,
              is_verified: user.is_verified
            },
            token,
            redirectTo: 'dashboard'
          };
        }
      } else if (user.global_role === 'SUPER_ADMIN') {
        // Super admin gets full access
        const token = generateToken(user.id);
        
        responseData = {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            global_role: user.global_role,
            is_verified: user.is_verified
          },
          token,
          redirectTo: 'super-admin-dashboard'
        };
      }
      
      return sendSuccess(res, responseData, "Login successful");
      
    } else {
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
      
      // Create regular token for new user
      const token = generateToken(newUser.id);
      
      return sendSuccess(res, {
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          global_role: newUser.global_role,
          is_verified: newUser.is_verified
        },
        token,
        redirectTo: 'onboarding' // They need to create/join a company
      }, "Account created successfully. Please create or join a company to continue.", 201);
    }
    
  } catch (error) {
    console.error('Google login error:', error);
    return sendError(res, "Invalid Google token or authentication failed", 401);
  }
});