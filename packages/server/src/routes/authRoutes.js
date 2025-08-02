import express from "express";
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  googleLogin
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validate, authSchemas } from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.post("/register", validate(authSchemas.register), register);
router.post("/login", validate(authSchemas.login), login);
router.post("/google-login", googleLogin); // New Google OAuth endpoint
router.post("/verify-email", validate(authSchemas.verifyEmail), verifyEmail);
router.post("/resend-verification", validate(authSchemas.resendVerification), resendVerification);
router.post("/forgot-password", validate(authSchemas.forgotPassword), forgotPassword);
router.post("/reset-password", validate(authSchemas.resetPassword), resetPassword);

// Protected routes
router.get("/me", authenticateToken, getCurrentUser);

export default router;
