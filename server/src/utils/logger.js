import morgan from "morgan";

// Custom logging utility
export class Logger {
  static info(message, data = {}) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
  }

  static error(message, error = null) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  }

  static warn(message, data = {}) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
  }

  static debug(message, data = {}) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data);
    }
  }

  // Log API requests
  static logRequest(req, res, next) {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

      if (res.statusCode >= 400) {
        Logger.error(logMessage);
      } else {
        Logger.info(logMessage);
      }
    });

    next();
  }

  // Log database operations
  static logDatabase(operation, table, duration, success = true) {
    const message = `DB ${operation} on ${table} - ${duration}ms`;

    if (success) {
      Logger.debug(message);
    } else {
      Logger.error(message);
    }
  }

  // Log authentication events
  static logAuth(event, userId, success = true) {
    const message = `AUTH ${event} for user ${userId}`;

    if (success) {
      Logger.info(message);
    } else {
      Logger.error(message);
    }
  }

  // Log business logic events
  static logBusiness(event, data = {}) {
    Logger.info(`BUSINESS ${event}`, data);
  }
}

// Morgan middleware configuration
export const morganConfig = morgan((tokens, req, res) => {
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const status = tokens.status(req, res);
  const responseTime = tokens["response-time"](req, res);
  const userAgent = tokens["user-agent"](req, res);

  return `${method} ${url} ${status} ${responseTime}ms - ${userAgent}`;
});

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  Logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
  });

  next(err);
};
