import express from "express";
import {
  register,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  googleLogin
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validate, authSchemas } from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.post("/register", validate(authSchemas.register), register);
router.post("/google-login", validate(authSchemas.googleLogin), googleLogin); // New Google OAuth endpoint
router.post("/verify-email", validate(authSchemas.verifyEmail), verifyEmail);
router.post("/resend-verification", validate(authSchemas.resendVerification), resendVerification);
router.post("/forgot-password", validate(authSchemas.forgotPassword), forgotPassword);
router.post("/reset-password", validate(authSchemas.resetPassword), resetPassword);

// Protected routes
// Current user endpoint moved to /api/v1/users/me

export default router;
