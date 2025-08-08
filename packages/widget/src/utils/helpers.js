/**
 * Helper Utilities (Functional)
 * Common utility functions for the widget
 */

/**
 * Generate a unique ID
 */
export function generateId(prefix = 'bugline') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Debounce function to limit rapid calls
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(this, args);
  };
}

/**
 * Throttle function to limit execution frequency
 */
export function throttle(func, limit) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Deep clone an object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * Merge objects deeply
 */
export function deepMerge(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * Check if value is an object
 */
export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Get current timestamp in ISO format
 */
export function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp, options = {}) {
  const date = new Date(timestamp);
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    return date.toLocaleDateString(undefined, formatOptions);
  } catch (error) {
    return date.toString();
  }
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Truncate text to specified length
 */
export function truncateText(text, maxLength, suffix = '...') {
  if (!text || typeof text !== 'string' || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to camelCase
 */
export function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Check if code is running in development mode
 */
export function isDevelopment() {
  return window.location.hostname === 'localhost' || 
         window.location.hostname.includes('dev') ||
         window.location.hostname.includes('staging');
}

/**
 * Get browser information
 */
export function getBrowserInfo() {
  const ua = navigator.userAgent;
  
  // Simple browser detection
  const browsers = {
    chrome: /Chrome/i,
    firefox: /Firefox/i,
    safari: /Safari/i,
    edge: /Edge/i,
    opera: /Opera/i
  };
  
  let browser = 'unknown';
  for (const [name, regex] of Object.entries(browsers)) {
    if (regex.test(ua)) {
      browser = name;
      break;
    }
  }
  
  return {
    userAgent: ua,
    browser,
    isMobile: /Mobile|Android|iPhone|iPad/i.test(ua),
    isTablet: /iPad|Tablet/i.test(ua),
    language: navigator.language || navigator.userLanguage || 'en'
  };
}

/**
 * Get screen information
 */
export function getScreenInfo() {
  return {
    width: window.screen.width,
    height: window.screen.height,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
    colorDepth: window.screen.colorDepth,
    pixelDepth: window.screen.pixelDepth,
    orientation: screen.orientation?.angle || 0
  };
}

/**
 * Get viewport information
 */
export function getViewportInfo() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.scrollX || window.pageXOffset,
    scrollY: window.scrollY || window.pageYOffset
  };
}

/**
 * Check if element is visible in viewport
 */
export function isElementVisible(element) {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const viewport = getViewportInfo();
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= viewport.height &&
    rect.right <= viewport.width
  );
}

/**
 * Wait for DOM to be ready
 */
export function domReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

/**
 * Create a promise that resolves after specified delay
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry(fn, options = {}) {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    shouldRetry = () => true
  } = options;
  
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }
      
      const delay = Math.min(
        initialDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );
      
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Parse URL parameters
 */
export function parseUrlParams(url = window.location.href) {
  const urlObj = new URL(url);
  const params = {};
  
  for (const [key, value] of urlObj.searchParams) {
    params[key] = value;
  }
  
  return params;
}

/**
 * Build URL with parameters
 */
export function buildUrl(baseUrl, params = {}) {
  const url = new URL(baseUrl);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });
  
  return url.toString();
}

/**
 * Local storage wrapper with error handling
 */
export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`[BugLine] Failed to read from localStorage: ${error.message}`);
      return defaultValue;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`[BugLine] Failed to write to localStorage: ${error.message}`);
      return false;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`[BugLine] Failed to remove from localStorage: ${error.message}`);
      return false;
    }
  },
  
  clear() {
    try {
      // Only clear BugLine-related keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('bugline_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.warn(`[BugLine] Failed to clear localStorage: ${error.message}`);
      return false;
    }
  }
};

/**
 * Event emitter for widget communication
 */
export function createEventEmitter() {
  const events = {};
  
  return {
    on(event, callback) {
      if (!events[event]) {
        events[event] = [];
      }
      events[event].push(callback);
      
      // Return unsubscribe function
      return () => {
        const index = events[event].indexOf(callback);
        if (index > -1) {
          events[event].splice(index, 1);
        }
      };
    },
    
    off(event, callback) {
      if (!events[event]) return;
      
      const index = events[event].indexOf(callback);
      if (index > -1) {
        events[event].splice(index, 1);
      }
    },
    
    emit(event, ...args) {
      if (!events[event]) return;
      
      events[event].forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`[BugLine] Event callback error:`, error);
        }
      });
    },
    
    once(event, callback) {
      const unsubscribe = this.on(event, (...args) => {
        unsubscribe();
        callback(...args);
      });
      return unsubscribe;
    }
  };
}

/**
 * Performance measurement utilities
 */
export const performance = {
  mark(name) {
    try {
      window.performance.mark(`bugline-${name}`);
    } catch (error) {
      // Fallback for browsers without performance.mark
      console.time(`bugline-${name}`);
    }
  },
  
  measure(name, startMark) {
    try {
      const measureName = `bugline-${name}`;
      const startMarkName = `bugline-${startMark}`;
      
      window.performance.measure(measureName, startMarkName);
      const measure = window.performance.getEntriesByName(measureName)[0];
      
      return {
        name,
        duration: measure.duration,
        startTime: measure.startTime
      };
    } catch (error) {
      // Fallback
      console.timeEnd(`bugline-${startMark}`);
      return { name, duration: 0, startTime: 0 };
    }
  }
};

export default {
  generateId,
  debounce,
  throttle,
  deepClone,
  deepMerge,
  isObject,
  getCurrentTimestamp,
  formatTimestamp,
  escapeHtml,
  truncateText,
  toKebabCase,
  toCamelCase,
  isDevelopment,
  getBrowserInfo,
  getScreenInfo,
  getViewportInfo,
  isElementVisible,
  domReady,
  sleep,
  retry,
  parseUrlParams,
  buildUrl,
  storage,
  createEventEmitter,
  performance
};