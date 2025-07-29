import { UserService } from "../services/userService.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthController {
  // User registration
  static register = asyncHandler(async (req, res) => {
    const { email, full_name, password } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userData = {
      email,
      full_name,
      password_hash: hashedPassword,
      global_role: "user",
      email_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const user = await UserService.createUser(userData);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

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
      message: "User registered successfully",
    });
  });

  // User login
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Get user by email
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
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
      message: "Login successful",
    });
  });

  // Get current user
  static getCurrentUser = asyncHandler(async (req, res) => {
    const user = await UserService.getUserById(req.user.id);

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
}
