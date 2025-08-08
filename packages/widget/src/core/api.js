/**
 * API Client for BugLine Widget
 * Handles communication with BugLine backend
 */

export class ApiClient {
  constructor(projectToken, apiUrl = null) {
    this.projectToken = projectToken;
    this.baseUrl = apiUrl || this.getDefaultApiUrl();
    this.timeout = 10000; // 10 seconds
  }

  /**
   * Get default API URL based on environment
   */
  getDefaultApiUrl() {
    // Check if we're in development/staging based on current domain
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname.includes('dev') || hostname.includes('staging')) {
      return 'http://localhost:3000/api/v1';
    }
    
    return 'https://api.bugline.co/api/v1';
  }

  /**
   * Make authenticated request to API
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.projectToken}`
      },
      timeout: this.timeout
    };

    const requestOptions = { ...defaultOptions, ...options };
    
    // Merge headers
    if (options.headers) {
      requestOptions.headers = { ...defaultOptions.headers, ...options.headers };
    }

    try {
      console.log(`[BugLine API] ${requestOptions.method} ${url}`);
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      requestOptions.signal = controller.signal;

      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.log(`[BugLine API] Response:`, data);
      
      return data;

    } catch (error) {
      console.error(`[BugLine API] Request failed:`, error);
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      if (!navigator.onLine) {
        throw new Error('Network unavailable');
      }
      
      throw error;
    }
  }

  /**
   * Validate project token with backend
   */
  async validateToken() {
    try {
      const response = await this.makeRequest('/widgets/validate');
      
      return {
        valid: true,
        projectId: response.data.projectId,
        projectName: response.data.projectName,
        companyId: response.data.companyId,
        companyName: response.data.companyName,
        allowedDomains: response.data.allowedDomains || [],
        widgetSettings: response.data.widgetSettings || {}
      };
    } catch (error) {
      console.error('[BugLine API] Token validation failed:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Get widget configuration
   */
  async getWidgetConfig() {
    try {
      const response = await this.makeRequest('/widgets/config');
      return response.data;
    } catch (error) {
      console.error('[BugLine API] Failed to get widget config:', error);
      throw error;
    }
  }

  /**
   * Report a bug to the backend
   */
  async reportBug(bugData) {
    try {
      const response = await this.makeRequest('/widgets/bugs/report', {
        method: 'POST',
        body: JSON.stringify(bugData)
      });

      return {
        success: true,
        bugId: response.data.bugId,
        status: response.data.status,
        submittedAt: response.data.submittedAt
      };
    } catch (error) {
      console.error('[BugLine API] Bug report failed:', error);
      throw error;
    }
  }

  /**
   * Submit bug report with retry logic
   */
  async reportBugWithRetry(bugData, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[BugLine API] Bug report attempt ${attempt}/${maxRetries}`);
        return await this.reportBug(bugData);
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.message.includes('4')) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
          console.log(`[BugLine API] Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Check API health/connectivity
   */
  async checkHealth() {
    try {
      // Use a simple validation call to check connectivity
      const result = await this.validateToken();
      return {
        healthy: result.valid,
        message: result.valid ? 'API is healthy' : result.error
      };
    } catch (error) {
      return {
        healthy: false,
        message: error.message
      };
    }
  }

  /**
   * Upload file or screenshot (if supported)
   */
  async uploadFile(file, bugId) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bugId', bugId);

      const response = await this.makeRequest('/widgets/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${this.projectToken}`
          // Don't set Content-Type for FormData - browser sets it with boundary
        }
      });

      return response.data;
    } catch (error) {
      console.error('[BugLine API] File upload failed:', error);
      throw error;
    }
  }

  /**
   * Get project statistics (if allowed)
   */
  async getStats(period = '7d') {
    try {
      const response = await this.makeRequest(`/widgets/stats?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('[BugLine API] Failed to get stats:', error);
      throw error;
    }
  }

  /**
   * Update project token
   */
  updateToken(newToken) {
    this.projectToken = newToken;
  }

  /**
   * Update API base URL
   */
  updateApiUrl(newUrl) {
    this.baseUrl = newUrl;
  }

  /**
   * Sleep utility for retry logic
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      projectToken: this.projectToken ? `${this.projectToken.substring(0, 8)}...` : null,
      baseUrl: this.baseUrl,
      timeout: this.timeout
    };
  }
}

export default ApiClient;