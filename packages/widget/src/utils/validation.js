/**
 * Validation Utilities (Functional)
 * Configuration and data validation for the widget
 */

/**
 * Validate widget configuration
 */
export function validateConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new Error('Configuration must be an object');
  }

  // Required fields
  if (!config.projectToken) {
    throw new Error('projectToken is required');
  }

  if (typeof config.projectToken !== 'string' || config.projectToken.trim().length === 0) {
    throw new Error('projectToken must be a non-empty string');
  }

  // Validate position if provided
  if (config.position) {
    const validPositions = [
      'bottom-right', 'bottom-left', 'top-right', 
      'top-left', 'center-right', 'center-left'
    ];
    
    if (!validPositions.includes(config.position)) {
      throw new Error(`Invalid position. Must be one of: ${validPositions.join(', ')}`);
    }
  }

  // Validate autoErrorCapture if provided
  if (config.autoErrorCapture !== undefined && typeof config.autoErrorCapture !== 'boolean') {
    throw new Error('autoErrorCapture must be a boolean');
  }

  // Validate callbacks
  const callbackFields = ['onLoad', 'onError', 'onBugReported'];
  callbackFields.forEach(field => {
    if (config[field] !== undefined && typeof config[field] !== 'function') {
      throw new Error(`${field} must be a function`);
    }
  });

  // Validate apiUrl if provided
  if (config.apiUrl && typeof config.apiUrl !== 'string') {
    throw new Error('apiUrl must be a string');
  }

  if (config.apiUrl && !isValidUrl(config.apiUrl)) {
    throw new Error('apiUrl must be a valid URL');
  }

  return config;
}

/**
 * Sanitize and set defaults for widget configuration
 */
export function sanitizeConfig(config) {
  const sanitized = {
    // Required fields
    projectToken: config.projectToken.trim(),
    
    // Optional fields with defaults
    position: config.position || 'bottom-right',
    autoErrorCapture: config.autoErrorCapture !== undefined ? config.autoErrorCapture : true,
    apiUrl: config.apiUrl || null,
    
    // UI customization
    customCSS: config.customCSS || '',
    
    // Callbacks
    onLoad: config.onLoad || null,
    onError: config.onError || null,
    onBugReported: config.onBugReported || null,
    
    // Advanced options
    maxReportsPerMinute: config.maxReportsPerMinute || 5,
    enableConsoleLogging: config.enableConsoleLogging !== undefined ? config.enableConsoleLogging : true,
    reportUnhandledRejections: config.reportUnhandledRejections !== undefined ? config.reportUnhandledRejections : true
  };

  return sanitized;
}

/**
 * Validate bug report data
 */
export function validateBugReport(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Bug report data must be an object');
  }

  // Required fields
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    throw new Error('Bug title is required');
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    throw new Error('Bug description is required');
  }

  // Field length validation
  if (data.title.length > 500) {
    throw new Error('Bug title must be less than 500 characters');
  }

  if (data.description.length > 10000) {
    throw new Error('Bug description must be less than 10,000 characters');
  }

  // Optional email validation
  if (data.reporter_email && !isValidEmail(data.reporter_email)) {
    throw new Error('Invalid email format');
  }

  // Priority validation
  const validPriorities = ['low', 'medium', 'high', 'critical'];
  if (data.priority && !validPriorities.includes(data.priority)) {
    throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
  }

  return true;
}

/**
 * Sanitize bug report data
 */
export function sanitizeBugReport(data) {
  return {
    title: data.title.trim(),
    description: data.description.trim(),
    priority: data.priority || 'medium',
    reporter_email: data.reporter_email ? data.reporter_email.trim().toLowerCase() : null
  };
}

/**
 * Validate project token format
 */
export function validateProjectToken(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Basic format validation (adjust based on your token format)
  // This is a simple example - adjust regex based on your actual token format
  const tokenRegex = /^[a-zA-Z0-9_-]{20,}$/;
  return tokenRegex.test(token);
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate URL format
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate domain format
 */
export function isValidDomain(domain) {
  if (!domain || typeof domain !== 'string') {
    return false;
  }

  // Allow wildcard subdomains (*.example.com) and regular domains
  const domainRegex = /^(\*\.)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
  return domainRegex.test(domain);
}

/**
 * Validate environment data
 */
export function validateEnvironmentData(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Check for required environment fields
  const requiredFields = ['userAgent', 'url', 'timestamp'];
  const hasRequiredFields = requiredFields.every(field => 
    data[field] && typeof data[field] === 'string'
  );

  if (!hasRequiredFields) {
    return false;
  }

  // Validate timestamp format
  const timestamp = new Date(data.timestamp);
  if (isNaN(timestamp.getTime())) {
    return false;
  }

  // Validate URL
  if (!isValidUrl(data.url)) {
    return false;
  }

  return true;
}

/**
 * Sanitize environment data
 */
export function sanitizeEnvironmentData(data) {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const sanitized = {};
  
  // String fields to sanitize
  const stringFields = ['userAgent', 'url', 'language', 'referrer'];
  stringFields.forEach(field => {
    if (data[field] && typeof data[field] === 'string') {
      sanitized[field] = data[field].substring(0, 1000); // Limit length
    }
  });

  // Timestamp
  if (data.timestamp) {
    const timestamp = new Date(data.timestamp);
    if (!isNaN(timestamp.getTime())) {
      sanitized.timestamp = timestamp.toISOString();
    }
  }

  // Viewport (if valid object with width/height)
  if (data.viewport && typeof data.viewport === 'object') {
    const { width, height } = data.viewport;
    if (typeof width === 'number' && typeof height === 'number') {
      sanitized.viewport = { width, height };
    }
  }

  // Boolean fields
  const booleanFields = ['cookiesEnabled'];
  booleanFields.forEach(field => {
    if (typeof data[field] === 'boolean') {
      sanitized[field] = data[field];
    }
  });

  return sanitized;
}

/**
 * Validate error details
 */
export function validateErrorDetails(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // At least message should be present
  return Boolean(data.message && typeof data.message === 'string');
}

/**
 * Sanitize error details
 */
export function sanitizeErrorDetails(data) {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const sanitized = {};
  
  // String fields to sanitize
  const stringFields = ['message', 'stack', 'filename', 'type'];
  stringFields.forEach(field => {
    if (data[field] && typeof data[field] === 'string') {
      sanitized[field] = data[field].substring(0, 5000); // Limit length
    }
  });

  // Number fields
  const numberFields = ['lineno', 'colno'];
  numberFields.forEach(field => {
    if (typeof data[field] === 'number' && !isNaN(data[field])) {
      sanitized[field] = Math.max(0, Math.floor(data[field]));
    }
  });

  return sanitized;
}

/**
 * Check if current domain is allowed
 */
export function isDomainAllowed(allowedDomains, currentDomain = null) {
  if (!Array.isArray(allowedDomains) || allowedDomains.length === 0) {
    return true; // No restrictions
  }

  const domain = currentDomain || window.location.hostname;
  
  return allowedDomains.some(allowedDomain => {
    // Support wildcard subdomains (*.example.com)
    if (allowedDomain.startsWith('*.')) {
      const baseDomain = allowedDomain.substring(2);
      return domain === baseDomain || domain.endsWith('.' + baseDomain);
    }
    
    return domain === allowedDomain;
  });
}

/**
 * Rate limiting check (simple client-side implementation)
 */
export function checkRateLimit(key, limit = 5, windowMs = 60000) {
  const now = Date.now();
  const storageKey = `bugline_rate_${key}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    const requests = stored ? JSON.parse(stored) : [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
    
    // Check if we're at the limit
    if (validRequests.length >= limit) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    localStorage.setItem(storageKey, JSON.stringify(validRequests));
    
    return true;
  } catch (error) {
    // If localStorage fails, allow the request
    console.warn('[BugLine] Rate limiting check failed:', error);
    return true;
  }
}

export default {
  validateConfig,
  sanitizeConfig,
  validateBugReport,
  sanitizeBugReport,
  validateProjectToken,
  isValidEmail,
  isValidUrl,
  isValidDomain,
  validateEnvironmentData,
  sanitizeEnvironmentData,
  validateErrorDetails,
  sanitizeErrorDetails,
  isDomainAllowed,
  checkRateLimit
};