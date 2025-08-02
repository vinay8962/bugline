import morgan from "morgan";

// Functional logging utilities
export const logInfo = (message, data = {}) => {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
};

export const logError = (message, error = null) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
};

export const logWarn = (message, data = {}) => {
  console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
};

export const logDebug = (message, data = {}) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data);
  }
};

// Log API requests
export const logRequest = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

    if (res.statusCode >= 400) {
      logError(logMessage);
    } else {
      logInfo(logMessage);
    }
  });

  next();
};

// Log database operations
export const logDatabase = (operation, table, duration, success = true) => {
  const message = `DB ${operation} on ${table} - ${duration}ms`;

  if (success) {
    logDebug(message);
  } else {
    logError(message);
  }
};

// Log authentication events
export const logAuth = (event, userId, success = true) => {
  const message = `AUTH ${event} for user ${userId}`;

  if (success) {
    logInfo(message);
  } else {
    logError(message);
  }
};

// Log business logic events
export const logBusiness = (event, data = {}) => {
  logInfo(`BUSINESS ${event}`, data);
};

// Log security events
export const logSecurity = (event, data = {}) => {
  logWarn(`SECURITY ${event}`, data);
};

// Log performance metrics
export const logPerformance = (operation, duration, data = {}) => {
  const message = `PERFORMANCE ${operation} - ${duration}ms`;
  logDebug(message, data);
};

// Log user actions
export const logUserAction = (userId, action, details = {}) => {
  logInfo(`USER_ACTION ${action}`, { userId, ...details });
};

// Log system events
export const logSystem = (event, data = {}) => {
  logInfo(`SYSTEM ${event}`, data);
};

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
  logError("Unhandled error", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString(),
  });

  next(err);
};

// Request logging middleware with enhanced details
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  logDebug("Incoming request", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: req.user?.id || 'anonymous',
    body: req.method !== 'GET' ? req.body : undefined,
    query: req.query,
    headers: {
      'content-type': req.get('Content-Type'),
      'authorization': req.get('Authorization') ? 'present' : 'absent',
    }
  });

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || 'anonymous',
      contentLength: res.get('Content-Length'),
    };

    if (res.statusCode >= 400) {
      logError(`Request failed`, logData);
    } else {
      logInfo(`Request completed`, logData);
    }
  });

  next();
};
