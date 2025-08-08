/**
 * Bug Report Modal Component (Functional)
 * Creates a modal dialog for bug reporting
 */

export function createBugReportModal(options = {}) {
  const config = {
    customCSS: "",
    zIndex: 20000,
    ...options,
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
      <div class="bg-white rounded-xl shadow-2xl max-w-lg w-[90vw] max-h-[90vh] overflow-y-auto relative transform scale-90 translate-y-5 transition duration-300">
        <div class="flex justify-between items-center px-6 pt-6 pb-4 border-b border-gray-200">
          <h3 class="m-0 text-xl font-semibold text-gray-900">Report a Bug</h3>
          <button type="button" class="bg-transparent border-none cursor-pointer p-2 text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-700 transition" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <form class="px-6 py-6">
          <div class="mb-5">
            <label for="bugline-title" class="block mb-2 font-medium text-gray-700 text-sm">Bug Title *</label>
            <input 
              type="text" 
              id="bugline-title" 
              name="title" 
              placeholder="Brief description of the issue"
              required 
              maxlength="500"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>
          <div class="mb-5">
            <label for="bugline-description" class="block mb-2 font-medium text-gray-700 text-sm">Description *</label>
            <textarea 
              id="bugline-description" 
              name="description" 
              placeholder="Please provide detailed information about the bug, including steps to reproduce..."
              required 
              rows="5"
              maxlength="10000"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition resize-vertical min-h-[100px]"
            ></textarea>
          </div>
          <div class="mb-5">
            <label for="bugline-email" class="block mb-2 font-medium text-gray-700 text-sm">Your Email (optional)</label>
            <input 
              type="email" 
              id="bugline-email" 
              name="reporter_email" 
              placeholder="your.email@example.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            />
            <small class="block mt-1 text-gray-400 text-xs">We'll only use this to follow up on your bug report</small>
          </div>
          <div class="mb-5">
            <label for="bugline-priority" class="block mb-2 font-medium text-gray-700 text-sm">Priority</label>
            <select id="bugline-priority" name="priority" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition">
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div class="flex gap-3 justify-end mt-6 flex-wrap">
            <button type="button" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition w-full sm:w-auto" id="bugline-cancel">
              Cancel
            </button>
            <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition w-full sm:w-auto" id="bugline-submit">
              Submit Bug Report
            </button>
          </div>
        </form>
        <div class="hidden" id="bugline-message"></div>
      </div>
    `;
  }

  /**
   * Get modal CSS styles
   */
  function getModalStyles() {
    return `
      .bugline-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: ${config.zIndex};
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }
      .bugline-modal-overlay.show {
        opacity: 1;
        visibility: visible;
      }
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
      @media (max-width: 640px) {
        .max-w-lg {
          width: 95vw;
          margin: 10px;
        }
        .flex-wrap {
          flex-direction: column;
        }
        .w-full {
          width: 100%;
        }
      }
    `;
  }

  /**
   * Inject CSS styles into document
   */
  function injectStyles() {
    const existingStyle = document.getElementById("bugline-modal-styles");
    if (existingStyle) return;

    const style = document.createElement("style");
    style.id = "bugline-modal-styles";
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
      showMessage("Please enter a bug title", "error");
      return;
    }

    if (!data.description?.trim()) {
      showMessage("Please provide a bug description", "error");
      return;
    }

    // Validate email if provided
    if (data.reporter_email && !isValidEmail(data.reporter_email)) {
      showMessage("Please enter a valid email address", "error");
      return;
    }

    // Clean up data
    const reportData = {
      title: data.title.trim(),
      description: data.description.trim(),
      priority: data.priority || "medium",
      reporter_email: data.reporter_email?.trim() || null,
    };

    // Disable submit button
    const submitBtn = modalElement.querySelector("#bugline-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    // Call submit handler
    if (typeof submitHandler === "function") {
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
  function showMessage(message, type = "info") {
    const messageEl = modalElement.querySelector("#bugline-message");
    messageEl.textContent = message;
    messageEl.className = `bugline-message ${type}`;
    messageEl.style.display = "block";

    // Reset submit button
    const submitBtn = modalElement.querySelector("#bugline-submit");
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Bug Report";
  }

  /**
   * Clear message
   */
  function clearMessage() {
    const messageEl = modalElement.querySelector("#bugline-message");
    messageEl.style.display = "none";
  }

  /**
   * Reset form
   */
  function resetForm() {
    const form = modalElement.querySelector(".bugline-form");
    form.reset();
    clearMessage();
  }

  /**
   * Add event listeners
   */
  function addEventListeners() {
    // Form submission
    const form = modalElement.querySelector(".bugline-form");
    form.addEventListener("submit", handleSubmit);

    // Close button
    const closeBtn = modalElement.querySelector(".bugline-close-btn");
    closeBtn.addEventListener("click", hide);

    // Cancel button
    const cancelBtn = modalElement.querySelector("#bugline-cancel");
    cancelBtn.addEventListener("click", hide);

    // Click outside to close
    overlayElement.addEventListener("click", (e) => {
      if (e.target === overlayElement) {
        hide();
      }
    });

    // ESC key to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isVisible) {
        hide();
      }
    });
  }

  /**
   * Create and render the modal
   */
  function render() {
    if (modalElement) {
      console.warn("[BugLine] Modal already rendered");
      return;
    }

    // Inject styles
    injectStyles();

    // Create overlay
    overlayElement = document.createElement("div");
    overlayElement.className = "bugline-modal-overlay";
    overlayElement.setAttribute("data-bugline-widget", "modal");

    // Create modal
    modalElement = document.createElement("div");
    modalElement.innerHTML = getModalHTML();

    // Append modal to overlay
    overlayElement.appendChild(modalElement.firstElementChild);
    modalElement = overlayElement.querySelector(".bugline-modal-content");

    // Add event listeners
    addEventListeners();

    // Append to body
    document.body.appendChild(overlayElement);

    console.log("[BugLine] Modal rendered");
  }

  /**
   * Show the modal
   */
  function show() {
    if (!overlayElement || isVisible) return;

    isVisible = true;
    overlayElement.classList.add("show");
    resetForm();

    // Focus first input
    setTimeout(() => {
      const titleInput = modalElement.querySelector("#bugline-title");
      titleInput.focus();
    }, 300);
  }

  /**
   * Hide the modal
   */
  function hide() {
    if (!overlayElement || !isVisible) return;

    isVisible = false;
    overlayElement.classList.remove("show");

    // Call close handler
    if (typeof closeHandler === "function") {
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

    console.log("[BugLine] Modal destroyed");
  }

  // Public API
  return {
    render,
    show,
    hide,
    destroy,
    showSuccess: (message) => showMessage(message, "success"),
    showError: (message) => showMessage(message, "error"),
    onSubmit: (handler) => {
      submitHandler = handler;
    },
    onClose: (handler) => {
      closeHandler = handler;
    },
    isVisible: () => isVisible,
  };
}

export default createBugReportModal;
