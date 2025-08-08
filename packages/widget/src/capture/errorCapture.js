/**
 * Error Capture Module
 * Automatically captures JavaScript errors and unhandled promise rejections
 */

export class ErrorCapture {
  constructor(config = {}) {
    this.config = config;
    this.onError = null;
    this.isCapturing = false;
    this.capturedErrors = new Set(); // Prevent duplicate reporting
    this.errorBuffer = [];
    this.maxBufferSize = 100;

    // Bind methods to preserve context
    this.handleWindowError = this.handleWindowError.bind(this);
    this.handleUnhandledRejection = this.handleUnhandledRejection.bind(this);
  }

  /**
   * Start capturing errors
   */
  start() {
    if (this.isCapturing) {
      console.warn('[BugLine] ErrorCapture already started');
      return;
    }

    this.isCapturing = true;
    
    // Capture uncaught JavaScript errors
    window.addEventListener('error', this.handleWindowError, true);
    
    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection, true);
    
    console.log('[BugLine] Error capture started');
  }

  /**
   * Stop capturing errors
   */
  stop() {
    if (!this.isCapturing) {
      return;
    }

    this.isCapturing = false;
    
    // Remove event listeners
    window.removeEventListener('error', this.handleWindowError, true);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection, true);
    
    // Clear error buffer
    this.capturedErrors.clear();
    this.errorBuffer = [];
    
    console.log('[BugLine] Error capture stopped');
  }

  /**
   * Handle window.onerror events
   */
  handleWindowError(event) {
    try {
      const errorData = this.extractErrorData(event);
      
      // Skip if error already captured (prevent duplicates)
      const errorSignature = this.createErrorSignature(errorData);
      if (this.capturedErrors.has(errorSignature)) {
        return;
      }

      // Skip certain errors that shouldn't be reported
      if (this.shouldSkipError(errorData)) {
        return;
      }

      // Add to captured errors set
      this.capturedErrors.add(errorSignature);
      this.addToBuffer(errorData);

      // Report the error
      if (typeof this.onError === 'function') {
        this.onError(errorData);
      }

    } catch (captureError) {
      console.error('[BugLine] Error in error capture:', captureError);
    }
  }

  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection(event) {
    try {
      const errorData = {
        message: event.reason?.message || String(event.reason) || 'Unhandled Promise Rejection',
        filename: 'Promise',
        lineno: 0,
        colno: 0,
        error: event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        type: 'unhandledrejection',
        timestamp: new Date().toISOString()
      };

      // Create error signature
      const errorSignature = this.createErrorSignature(errorData);
      if (this.capturedErrors.has(errorSignature)) {
        return;
      }

      // Skip certain promise rejections
      if (this.shouldSkipError(errorData)) {
        return;
      }

      this.capturedErrors.add(errorSignature);
      this.addToBuffer(errorData);

      // Report the error
      if (typeof this.onError === 'function') {
        this.onError(errorData);
      }

    } catch (captureError) {
      console.error('[BugLine] Error in promise rejection capture:', captureError);
    }
  }

  /**
   * Extract error data from error event
   */
  extractErrorData(event) {
    return {
      message: event.message || 'Unknown error',
      filename: event.filename || 'Unknown file',
      lineno: event.lineno || 0,
      colno: event.colno || 0,
      error: event.error,
      type: event.error?.name || 'Error',
      timestamp: new Date().toISOString(),
      stack: event.error?.stack || 'No stack trace available',
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  /**
   * Create a unique signature for error deduplication
   */
  createErrorSignature(errorData) {
    return `${errorData.message}:${errorData.filename}:${errorData.lineno}:${errorData.colno}`;
  }

  /**
   * Determine if error should be skipped
   */
  shouldSkipError(errorData) {
    const message = errorData.message?.toLowerCase() || '';
    const filename = errorData.filename?.toLowerCase() || '';

    // Skip errors from browser extensions
    if (filename.includes('extension://') || filename.includes('moz-extension://')) {
      return true;
    }

    // Skip common non-actionable errors
    const skipPatterns = [
      'script error',
      'non-error promise rejection',
      'loading chunk',
      'network error',
      'fetch error',
      'cancelled'
    ];

    return skipPatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Add error to buffer for analysis
   */
  addToBuffer(errorData) {
    this.errorBuffer.push(errorData);
    
    // Maintain buffer size limit
    if (this.errorBuffer.length > this.maxBufferSize) {
      this.errorBuffer.shift(); // Remove oldest error
    }
  }

  /**
   * Get recent errors from buffer
   */
  getRecentErrors(limit = 10) {
    return this.errorBuffer.slice(-limit);
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      totalCaptured: this.capturedErrors.size,
      recentErrors: this.errorBuffer.length,
      errorsByType: {}
    };

    // Count errors by type
    this.errorBuffer.forEach(error => {
      const type = error.type || 'Unknown';
      stats.errorsByType[type] = (stats.errorsByType[type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear captured errors and buffer
   */
  clearBuffer() {
    this.capturedErrors.clear();
    this.errorBuffer = [];
  }

  /**
   * Manually report an error
   */
  reportError(error, context = {}) {
    if (!this.isCapturing || typeof this.onError !== 'function') {
      return;
    }

    const errorData = {
      message: error.message || String(error),
      filename: context.filename || 'Manual Report',
      lineno: context.lineno || 0,
      colno: context.colno || 0,
      error: error instanceof Error ? error : new Error(String(error)),
      type: error.name || 'ManualError',
      timestamp: new Date().toISOString(),
      stack: error.stack || 'No stack trace available',
      userAgent: navigator.userAgent,
      url: window.location.href,
      context
    };

    this.onError(errorData);
  }
}

export default ErrorCapture;