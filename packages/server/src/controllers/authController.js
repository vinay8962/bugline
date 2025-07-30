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

// User registration
export const register = asyncHandler(async (req, res) => {
  const { email, firstName, lastName, password } = req.body;

  // Create user
  const userData = {
    email,
    firstName,
    lastName,
    password, // Will be hashed in the service
    role: "USER",
    isVerified: false
  };

  const user = await createUser(userData);

  // Send email verification
  try {
    await EmailService.sendEmailVerification(user);
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
    // Don't fail registration if email fails, but log it
  }

  // Generate JWT token
  const token = generateToken(user.id);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        global_role: user.global_role,
        email_verified: user.email_verified,
      },
      token,
    },
    message: "User registered successfully. Please check your email to verify your account.",
  });
});

// User login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Verify user credentials using the service
  const authenticatedUser = await verifyUserPassword(email, password);
  if (!authenticatedUser) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  // Generate JWT token
  const token = generateToken(authenticatedUser.id);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        full_name: authenticatedUser.full_name,
        global_role: authenticatedUser.global_role,
        email_verified: authenticatedUser.email_verified,
      },
      token,
    },
    message: "Login successful",
  });
});

// Get current user
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      global_role: user.global_role,
      email_verified: user.email_verified,
    },
  });
});

// Verify email
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = EmailService.verifyEmailToken(token);
    
    // Update user email verification status
    const user = await verifyUserEmail(decoded.userId);

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        email_verified: user.email_verified,
      },
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Resend verification email
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (user.email_verified) {
    return res.status(400).json({
      success: false,
      message: "Email already verified",
    });
  }

  try {
    await EmailService.sendEmailVerification(user);
    res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send verification email",
    });
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