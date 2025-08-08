/**
 * BugLine Widget SDK - Main Entry Point
 * Embeddable JavaScript widget for bug reporting
 */

import { ErrorCapture } from '../capture/errorCapture.js';
import { createBugReportModal } from '../ui/modal.js';
import { createFloatingButton } from '../ui/button.js';
import { ApiClient } from './api.js';
import { validateConfig, sanitizeConfig } from '../utils/validation.js';
import { generateId, debounce } from '../utils/helpers.js';

class BugLineWidget {
  constructor() {
    this.config = null;
    this.apiClient = null;
    this.errorCapture = null;
    this.modal = null;
    this.button = null;
    this.initialized = false;
    this.projectValid = false;
  }

  /**
   * Initialize the widget with configuration
   * @param {Object} config - Widget configuration
   */
  async init(config) {
    try {
      console.log('[BugLine] Initializing widget...', config);

      // Validate and sanitize configuration
      this.config = sanitizeConfig(validateConfig(config));
      
      // Initialize API client
      this.apiClient = new ApiClient(this.config.projectToken, this.config.apiUrl);
      
      // Validate project token with backend
      const validation = await this.validateProject();
      if (!validation.valid) {
        throw new Error('Invalid project token or configuration');
      }

      this.projectValid = true;
      console.log('[BugLine] Project validation successful:', validation);

      // Initialize error capture if enabled
      if (this.config.autoErrorCapture) {
        this.errorCapture = new ErrorCapture(this.config);
        this.errorCapture.onError = (errorData) => {
          this.reportError(errorData);
        };
        this.errorCapture.start();
      }

      // Initialize UI components
      await this.initializeUI();

      this.initialized = true;
      console.log('[BugLine] Widget initialized successfully');

      // Call initialization callback
      if (typeof this.config.onLoad === 'function') {
        this.config.onLoad();
      }

    } catch (error) {
      console.error('[BugLine] Initialization failed:', error);
      if (typeof this.config?.onError === 'function') {
        this.config.onError(error);
      }
      throw error;
    }
  }

  /**
   * Validate project token with backend
   * @returns {Promise<Object>} Validation response
   */
  async validateProject() {
    try {
      return await this.apiClient.validateToken();
    } catch (error) {
      console.error('[BugLine] Project validation failed:', error);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Initialize UI components
   */
  async initializeUI() {
    // Create floating button
    this.button = createFloatingButton({
      position: this.config.position,
      customCSS: this.config.customCSS
    });

    this.button.onClick(() => {
      this.showReportModal();
    });

    this.button.render();

    // Create modal (hidden initially)
    this.modal = createBugReportModal({
      customCSS: this.config.customCSS
    });

    this.modal.onSubmit((reportData) => {
      this.submitBugReport(reportData);
    });

    this.modal.onClose(() => {
      this.hideReportModal();
    });

    this.modal.render();
  }

  /**
   * Show the bug report modal
   */
  showReportModal() {
    if (!this.modal) return;
    this.modal.show();
  }

  /**
   * Hide the bug report modal
   */
  hideReportModal() {
    if (!this.modal) return;
    this.modal.hide();
  }

  /**
   * Report an automatic error capture
   * @param {Object} errorData - Error details
   */
  reportError = debounce((errorData) => {
    if (!this.projectValid) return;

    const bugReport = {
      title: `JavaScript Error: ${errorData.message}`,
      description: `An automatic error was captured:\n\n${errorData.message}\n\nFile: ${errorData.filename}\nLine: ${errorData.lineno}:${errorData.colno}`,
      error_details: {
        message: errorData.message,
        stack: errorData.error?.stack || 'No stack trace available',
        filename: errorData.filename,
        lineno: errorData.lineno,
        colno: errorData.colno,
        type: errorData.error?.name || 'Error'
      },
      environment: this.getEnvironmentData(),
      priority: this.getErrorPriority(errorData),
      source: 'widget_auto'
    };

    this.submitBugReport(bugReport, false); // Don't show success message for auto reports
  }, 1000);

  /**
   * Submit a bug report to the backend
   * @param {Object} reportData - Bug report data
   * @param {boolean} showSuccess - Whether to show success message
   */
  async submitBugReport(reportData, showSuccess = true) {
    try {
      console.log('[BugLine] Submitting bug report:', reportData);

      // Add environment data
      const fullReportData = {
        ...reportData,
        environment: {
          ...reportData.environment,
          ...this.getEnvironmentData()
        }
      };

      const response = await this.apiClient.reportBug(fullReportData);
      
      console.log('[BugLine] Bug report submitted successfully:', response);

      if (showSuccess && this.modal) {
        this.modal.showSuccess('Bug report submitted successfully!');
        setTimeout(() => {
          this.hideReportModal();
        }, 2000);
      }

      // Call success callback
      if (typeof this.config.onBugReported === 'function') {
        this.config.onBugReported({
          bugId: response.bugId,
          status: response.status,
          reportData: reportData
        });
      }

    } catch (error) {
      console.error('[BugLine] Bug report submission failed:', error);

      if (showSuccess && this.modal) {
        this.modal.showError('Failed to submit bug report. Please try again.');
      }

      if (typeof this.config.onError === 'function') {
        this.config.onError(error);
      }
    }
  }

  /**
   * Get current environment data
   * @returns {Object} Environment information
   */
  getEnvironmentData() {
    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      language: navigator.language || navigator.userLanguage,
      referrer: document.referrer,
      cookiesEnabled: navigator.cookieEnabled
    };
  }

  /**
   * Determine error priority based on error type
   * @param {Object} errorData - Error details
   * @returns {string} Priority level
   */
  getErrorPriority(errorData) {
    const message = errorData.message?.toLowerCase() || '';
    
    // High priority errors
    if (message.includes('network') || message.includes('fetch') || message.includes('xhr')) {
      return 'high';
    }
    
    // Critical errors
    if (message.includes('uncaught') || message.includes('syntax') || message.includes('reference')) {
      return 'critical';
    }
    
    return 'medium';
  }

  /**
   * Public API: Manually report a bug
   * @param {Object} bugData - Bug information
   */
  reportBug(bugData) {
    if (!this.initialized || !this.projectValid) {
      console.warn('[BugLine] Widget not initialized or project invalid');
      return;
    }

    const reportData = {
      title: bugData.title || 'Manual Bug Report',
      description: bugData.description || 'No description provided',
      reporter_email: bugData.reporter_email || null,
      priority: bugData.priority || 'medium',
      source: 'widget_manual',
      environment: this.getEnvironmentData()
    };

    this.submitBugReport(reportData);
  }

  /**
   * Public API: Show the report modal programmatically
   */
  show() {
    if (!this.initialized) {
      console.warn('[BugLine] Widget not initialized');
      return;
    }
    this.showReportModal();
  }

  /**
   * Public API: Hide the widget
   */
  hide() {
    if (this.button) this.button.hide();
    if (this.modal) this.modal.hide();
  }

  /**
   * Public API: Show the widget
   */
  showWidget() {
    if (this.button) this.button.show();
  }

  /**
   * Cleanup and destroy the widget
   */
  destroy() {
    if (this.errorCapture) {
      this.errorCapture.stop();
    }
    
    if (this.modal) {
      this.modal.destroy();
    }
    
    if (this.button) {
      this.button.destroy();
    }

    this.initialized = false;
    console.log('[BugLine] Widget destroyed');
  }
}

// Create global instance
const widget = new BugLineWidget();

// Global API
window.BugLine = {
  init: (config) => widget.init(config),
  reportBug: (bugData) => widget.reportBug(bugData),
  show: () => widget.show(),
  hide: () => widget.hide(),
  showWidget: () => widget.showWidget(),
  destroy: () => widget.destroy(),
  version: '1.0.0'
};

// Auto-initialize if config is available
if (window.BugLineConfig) {
  widget.init(window.BugLineConfig);
}

export default widget;