import express from "express";
import { AuthController } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validate, authSchemas } from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.post("/register", validate(authSchemas.register), AuthController.register);
router.post("/login", validate(authSchemas.login), AuthController.login);
router.post("/verify-email", validate(authSchemas.verifyEmail), AuthController.verifyEmail);
router.post("/resend-verification", validate(authSchemas.resendVerification), AuthController.resendVerification);
router.post("/forgot-password", validate(authSchemas.forgotPassword), AuthController.forgotPassword);
router.post("/reset-password", validate(authSchemas.resetPassword), AuthController.resetPassword);

// Protected routes
router.get("/me", authenticateToken, AuthController.getCurrentUser);

export default router;
