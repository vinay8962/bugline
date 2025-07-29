import express from "express";
import { AuthController } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Protected routes
router.get("/me", authenticateToken, AuthController.getCurrentUser);

export default router;
