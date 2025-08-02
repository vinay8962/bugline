import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import dotenv from "dotenv";
import "express-async-errors";

import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { 
  logInfo, 
  logSystem, 
  logSecurity, 
  requestLogger, 
  errorLogger, 
  morganConfig 
} from "./utils/logger.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Log application startup
logSystem("Application starting", { 
  port: PORT, 
  environment: process.env.NODE_ENV || 'development',
  nodeVersion: process.version 
});

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

logSystem("Security middleware configured");

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

logSystem("CORS middleware configured");

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logSecurity("Rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path
    });
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP, please try again later.",
    });
  }
});

app.use(limiter);

logSystem("Rate limiting middleware configured");

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Enhanced logging middleware
app.use(requestLogger);

// Morgan logging for HTTP requests
app.use(morganConfig);

// API routes
app.use("/", routes);

logSystem("Routes configured");

// Global error handling middleware (must be last)
app.use(errorLogger);
app.use(errorHandler);

logSystem("Error handling middleware configured");

export { app, PORT };
