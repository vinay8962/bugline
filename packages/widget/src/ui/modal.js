/**
 * Bug Report Modal Component (Functional)
 * Creates a modal dialog for bug reporting
 */

export function createBugReportModal(options = {}) {
  const config = {
    customCSS: '',
    zIndex: 20000,
    ...options
  };

  let modalElement = null;
  let overlayElement = null;
  let submitHandler = null;
  let closeHandler = null;
  let isVisible = false;

  /**
   * Get modal HTML structure
   */
  function getModalHTML() {
    return `
      <div class="bugline-modal-content">
        <div class="bugline-modal-header">
          <h3>Report a Bug</h3>
          <button type="button" class="bugline-close-btn" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <form class="bugline-form">
          <div class="bugline-form-group">
            <label for="bugline-title">Bug Title *</label>
            <input 
              type="text" 
              id="bugline-title" 
              name="title" 
              placeholder="Brief description of the issue"
              required 
              maxlength="500"
            />
          </div>

          <div class="bugline-form-group">
            <label for="bugline-description">Description *</label>
            <textarea 
              id="bugline-description" 
              name="description" 
              placeholder="Please provide detailed information about the bug, including steps to reproduce..."
              required 
              rows="5"
              maxlength="10000"
            ></textarea>
          </div>

          <div class="bugline-form-group">
            <label for="bugline-email">Your Email (optional)</label>
            <input 
              type="email" 
              id="bugline-email" 
              name="reporter_email" 
              placeholder="your.email@example.com"
            />
            <small>We'll only use this to follow up on your bug report</small>
          </div>

          <div class="bugline-form-group">
            <label for="bugline-priority">Priority</label>
            <select id="bugline-priority" name="priority">
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div class="bugline-form-actions">
            <button type="button" class="bugline-btn bugline-btn-secondary" id="bugline-cancel">
              Cancel
            </button>
            <button type="submit" class="bugline-btn bugline-btn-primary" id="bugline-submit">
              Submit Bug Report
            </button>
          </div>
        </form>

        <div class="bugline-message" id="bugline-message" style="display: none;"></div>
      </div>
    `;
  }

  /**
   * Get modal CSS styles
   */
  function getModalStyles() {
    return `
      /* Modal Overlay */
      .bugline-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: ${config.zIndex};
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .bugline-modal-overlay.show {
        opacity: 1;
        visibility: visible;
      }

      /* Modal Content */
      .bugline-modal-content {
        background: white;
        border-radius: 12px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        transform: scale(0.9) translateY(20px);
        transition: transform 0.3s ease;
      }

      .bugline-modal-overlay.show .bugline-modal-content {
        transform: scale(1) translateY(0);
      }

      /* Header */
      .bugline-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px 24px 16px;
        border-bottom: 1px solid #e5e7eb;
      }

      .bugline-modal-header h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #111827;
      }

      .bugline-close-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        color: #6b7280;
        border-radius: 6px;
        transition: all 0.2s ease;
      }

      .bugline-close-btn:hover {
        background: #f3f4f6;
        color: #374151;
      }

      /* Form */
      .bugline-form {
        padding: 24px;
      }

      .bugline-form-group {
        margin-bottom: 20px;
      }

      .bugline-form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #374151;
        font-size: 14px;
      }

      .bugline-form-group input,
      .bugline-form-group textarea,
      .bugline-form-group select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.2s ease;
        font-family: inherit;
        box-sizing: border-box;
      }

      .bugline-form-group input:focus,
      .bugline-form-group textarea:focus,
      .bugline-form-group select:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .bugline-form-group textarea {
        resize: vertical;
        min-height: 100px;
      }

      .bugline-form-group small {
        display: block;
        margin-top: 4px;
        color: #6b7280;
        font-size: 12px;
      }

      /* Form Actions */
      .bugline-form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;
      }

      .bugline-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
      }

      .bugline-btn-primary {
        background: #6366f1;
        color: white;
      }

      .bugline-btn-primary:hover {
        background: #4f46e5;
      }

      .bugline-btn-primary:disabled {
        background: #9ca3af;
        cursor: not-allowed;
      }

      .bugline-btn-secondary {
        background: #f3f4f6;
        color: #374151;
      }

      .bugline-btn-secondary:hover {
        background: #e5e7eb;
      }

      /* Message */
      .bugline-message {
        margin: 16px 24px 24px;
        padding: 12px 16px;
        border-radius: 6px;
        font-size: 14px;
      }

      .bugline-message.success {
        background: #d1fae5;
        color: #065f46;
        border: 1px solid #a7f3d0;
      }

      .bugline-message.error {
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #fecaca;
      }

      /* Mobile Responsive */
      @media (max-width: 640px) {
        .bugline-modal-content {
          width: 95vw;
          margin: 10px;
        }
        
        .bugline-form-actions {
          flex-direction: column;
        }
        
        .bugline-btn {
          width: 100%;
        }
      }
    `;
  }

  /**
   * Inject CSS styles into document
   */
  function injectStyles() {
    const existingStyle = document.getElementById('bugline-modal-styles');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'bugline-modal-styles';
    style.textContent = getModalStyles() + config.customCSS;
    document.head.appendChild(style);
  }

  /**
   * Handle form submission
   */
  function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Validate required fields
    if (!data.title?.trim()) {
      showMessage('Please enter a bug title', 'error');
      return;
    }
    
    if (!data.description?.trim()) {
      showMessage('Please provide a bug description', 'error');
      return;
    }

    // Validate email if provided
    if (data.reporter_email && !isValidEmail(data.reporter_email)) {
      showMessage('Please enter a valid email address', 'error');
      return;
    }

    // Clean up data
    const reportData = {
      title: data.title.trim(),
      description: data.description.trim(),
      priority: data.priority || 'medium',
      reporter_email: data.reporter_email?.trim() || null
    };

    // Disable submit button
    const submitBtn = modalElement.querySelector('#bugline-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    // Call submit handler
    if (typeof submitHandler === 'function') {
      submitHandler(reportData);
    }
  }

  /**
   * Validate email format
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Show message to user
   */
  function showMessage(message, type = 'info') {
    const messageEl = modalElement.querySelector('#bugline-message');
    messageEl.textContent = message;
    messageEl.className = `bugline-message ${type}`;
    messageEl.style.display = 'block';

    // Reset submit button
    const submitBtn = modalElement.querySelector('#bugline-submit');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Bug Report';
  }

  /**
   * Clear message
   */
  function clearMessage() {
    const messageEl = modalElement.querySelector('#bugline-message');
    messageEl.style.display = 'none';
  }

  /**
   * Reset form
   */
  function resetForm() {
    const form = modalElement.querySelector('.bugline-form');
    form.reset();
    clearMessage();
  }

  /**
   * Add event listeners
   */
  function addEventListeners() {
    // Form submission
    const form = modalElement.querySelector('.bugline-form');
    form.addEventListener('submit', handleSubmit);

    // Close button
    const closeBtn = modalElement.querySelector('.bugline-close-btn');
    closeBtn.addEventListener('click', hide);

    // Cancel button
    const cancelBtn = modalElement.querySelector('#bugline-cancel');
    cancelBtn.addEventListener('click', hide);

    // Click outside to close
    overlayElement.addEventListener('click', (e) => {
      if (e.target === overlayElement) {
        hide();
      }
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isVisible) {
        hide();
      }
    });
  }

  /**
   * Create and render the modal
   */
  function render() {
    if (modalElement) {
      console.warn('[BugLine] Modal already rendered');
      return;
    }

    // Inject styles
    injectStyles();

    // Create overlay
    overlayElement = document.createElement('div');
    overlayElement.className = 'bugline-modal-overlay';
    overlayElement.setAttribute('data-bugline-widget', 'modal');

    // Create modal
    modalElement = document.createElement('div');
    modalElement.innerHTML = getModalHTML();

    // Append modal to overlay
    overlayElement.appendChild(modalElement.firstElementChild);
    modalElement = overlayElement.querySelector('.bugline-modal-content');

    // Add event listeners
    addEventListeners();

    // Append to body
    document.body.appendChild(overlayElement);

    console.log('[BugLine] Modal rendered');
  }

  /**
   * Show the modal
   */
  function show() {
    if (!overlayElement || isVisible) return;

    isVisible = true;
    overlayElement.classList.add('show');
    resetForm();

    // Focus first input
    setTimeout(() => {
      const titleInput = modalElement.querySelector('#bugline-title');
      titleInput.focus();
    }, 300);
  }

  /**
   * Hide the modal
   */
  function hide() {
    if (!overlayElement || !isVisible) return;

    isVisible = false;
    overlayElement.classList.remove('show');

    // Call close handler
    if (typeof closeHandler === 'function') {
      closeHandler();
    }
  }

  /**
   * Destroy the modal
   */
  function destroy() {
    if (!overlayElement) return;

    hide();
    
    setTimeout(() => {
      if (overlayElement && overlayElement.parentNode) {
        overlayElement.parentNode.removeChild(overlayElement);
      }
      overlayElement = null;
      modalElement = null;
    }, 300);

    console.log('[BugLine] Modal destroyed');
  }

  // Public API
  return {
    render,
    show,
    hide,
    destroy,
    showSuccess: (message) => showMessage(message, 'success'),
    showError: (message) => showMessage(message, 'error'),
    onSubmit: (handler) => { submitHandler = handler; },
    onClose: (handler) => { closeHandler = handler; },
    isVisible: () => isVisible
  };
}

export default createBugReportModal;