/**
 * Floating Button Component (Functional)
 * Creates a floating action button for bug reporting
 */

export function createFloatingButton(options = {}) {
  const config = {
    position: 'bottom-right',
    size: 'medium',
    customCSS: '',
    zIndex: 10000,
    ...options
  };
  
  let element = null;
  let clickHandler = null;
  let isVisible = true;
  let isAnimating = false;

  /**
   * Get position-specific styles
   */
  function getPositionStyles() {
    const positions = {
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;',
      'center-right': 'top: 50%; right: 20px; transform: translateY(-50%);',
      'center-left': 'top: 50%; left: 20px; transform: translateY(-50%);'
    };

    return positions[config.position] || positions['bottom-right'];
  }

  /**
   * Get size-specific styles
   */
  function getSizeStyles() {
    const sizes = {
      small: 'width: 48px; height: 48px; font-size: 18px;',
      medium: 'width: 56px; height: 56px; font-size: 20px;',
      large: 'width: 64px; height: 64px; font-size: 24px;'
    };

    return sizes[config.size] || sizes.medium;
  }

  /**
   * Set button styles
   */
  function setStyles() {
    const position = getPositionStyles();
    const size = getSizeStyles();
    
    const baseStyles = `
      position: fixed;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: linear-gradient(45deg, #6366f1, #8b5cf6);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: ${config.zIndex};
      user-select: none;
      transform: scale(0);
      opacity: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    element.style.cssText = `${baseStyles}${position}${size}${config.customCSS}`;
  }

  /**
   * Get button HTML content
   */
  function getButtonHTML() {
    return `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.1 3.9 21 5 21H11V19H5V3H13V9H21ZM14.5 19L16.5 17L15.1 15.6L14.5 16.2L13.9 15.6L12.5 17L14.5 19ZM21.7 13.35L20.7 14.35L18.65 12.3L19.65 11.3C19.86 11.09 20.21 11.09 20.42 11.3L21.7 12.58C21.91 12.79 21.91 13.14 21.7 13.35ZM12 18.94L18.06 12.88L20.12 14.94L14.06 21H12V18.94Z" fill="currentColor"/>
      </svg>
    `;
  }

  /**
   * Handle button click
   */
  function handleClick() {
    if (isAnimating) return;

    // Add click animation
    animateClick();

    // Call click handler
    if (typeof clickHandler === 'function') {
      clickHandler();
    }
  }

  /**
   * Animate button click
   */
  function animateClick() {
    isAnimating = true;
    
    // Pulse animation
    element.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      element.style.transform = 'scale(1.05)';
      
      setTimeout(() => {
        element.style.transform = 'scale(1)';
        isAnimating = false;
      }, 100);
    }, 100);
  }

  /**
   * Animate button entrance
   */
  function animateIn() {
    requestAnimationFrame(() => {
      element.style.transform = 'scale(1)';
      element.style.opacity = '1';
    });
  }

  /**
   * Add event listeners
   */
  function addEventListeners() {
    // Click handler
    element.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleClick();
    });

    // Hover effects
    element.addEventListener('mouseenter', () => {
      if (!isAnimating) {
        element.style.transform = 'scale(1.1)';
        element.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.4)';
      }
    });

    element.addEventListener('mouseleave', () => {
      if (!isAnimating) {
        element.style.transform = 'scale(1)';
        element.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
      }
    });

    // Touch support for mobile
    element.addEventListener('touchstart', (e) => {
      e.preventDefault();
      element.style.transform = 'scale(0.95)';
    });

    element.addEventListener('touchend', (e) => {
      e.preventDefault();
      element.style.transform = 'scale(1)';
      handleClick();
    });

    // Prevent context menu
    element.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  /**
   * Create and render the floating button
   */
  function render() {
    if (element) {
      console.warn('[BugLine] Button already rendered');
      return;
    }

    // Create button element
    element = document.createElement('div');
    element.className = 'bugline-floating-button';
    element.setAttribute('data-bugline-widget', 'button');
    
    // Set initial styles
    setStyles();
    
    // Add SVG icon
    element.innerHTML = getButtonHTML();
    
    // Add event listeners
    addEventListeners();
    
    // Append to body
    document.body.appendChild(element);
    
    // Animate in
    animateIn();
    
    console.log('[BugLine] Floating button rendered');
  }

  /**
   * Show the button
   */
  function show() {
    if (!element || isVisible) return;
    
    isVisible = true;
    element.style.display = 'flex';
    animateIn();
  }

  /**
   * Hide the button
   */
  function hide() {
    if (!element || !isVisible) return;
    
    isVisible = false;
    element.style.transform = 'scale(0)';
    element.style.opacity = '0';
    
    setTimeout(() => {
      if (!isVisible && element) {
        element.style.display = 'none';
      }
    }, 300);
  }

  /**
   * Destroy the button
   */
  function destroy() {
    if (!element) return;
    
    // Animate out
    element.style.transform = 'scale(0)';
    element.style.opacity = '0';
    
    setTimeout(() => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
      element = null;
    }, 300);
    
    console.log('[BugLine] Floating button destroyed');
  }

  // Public API
  return {
    render,
    show,
    hide,
    destroy,
    onClick: (handler) => { clickHandler = handler; },
    isRendered: () => element !== null && document.contains(element),
    getElement: () => element
  };
}

export default createFloatingButton;