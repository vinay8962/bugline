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
import { specs, swaggerUi } from "./config/swagger.js";
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

// CORS configuration with dynamic origin for widget support
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      // Default allowed origins
      const allowedOrigins = [
        process.env.CORS_ORIGIN || "http://localhost:5173",
        "http://localhost:5001", // Allow Swagger UI requests
        "https://cdn.jsdelivr.net", // CDN for widget hosting
      ];
      
      // Check if origin is in default allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // For widget requests, origin validation is handled in widget auth middleware
      // Allow all origins for widget endpoints - security is managed by project tokens
      if (origin) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Origin"],
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

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'BugLine API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
}));

// API JSON specification endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// API routes
app.use("/", routes);

logSystem("Routes and API documentation configured");

// Global error handling middleware (must be last)
app.use(errorLogger);
app.use(errorHandler);

logSystem("Error handling middleware configured");

export { app, PORT };
