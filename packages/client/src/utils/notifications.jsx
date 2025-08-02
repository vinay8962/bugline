/**
 * Centralized Notification System
 * Provides consistent toast notifications throughout the app
 */

import { toast } from 'react-toastify';

/**
 * Configuration for different notification types
 */
const toastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

/**
 * Success notification
 * @param {string} message - Success message to display
 * @param {object} options - Optional toast configuration
 */
export const showSuccess = (message, options = {}) => {
  toast.success(message, {
    ...toastConfig,
    ...options,
  });
};

/**
 * Error notification
 * @param {string} message - Error message to display
 * @param {object} options - Optional toast configuration
 */
export const showError = (message, options = {}) => {
  toast.error(message, {
    ...toastConfig,
    autoClose: 7000, // Keep error messages longer
    ...options,
  });
};

/**
 * Warning notification
 * @param {string} message - Warning message to display
 * @param {object} options - Optional toast configuration
 */
export const showWarning = (message, options = {}) => {
  toast.warning(message, {
    ...toastConfig,
    ...options,
  });
};

/**
 * Info notification
 * @param {string} message - Info message to display
 * @param {object} options - Optional toast configuration
 */
export const showInfo = (message, options = {}) => {
  toast.info(message, {
    ...toastConfig,
    ...options,
  });
};

/**
 * Loading notification with promise
 * @param {Promise} promise - Promise to track
 * @param {object} messages - Messages for different states
 * @param {object} options - Optional toast configuration
 */
export const showLoading = (promise, messages = {}, options = {}) => {
  const defaultMessages = {
    pending: 'Loading...',
    success: 'Operation completed successfully',
    error: 'Operation failed',
  };

  const finalMessages = { ...defaultMessages, ...messages };

  return toast.promise(
    promise,
    finalMessages,
    {
      ...toastConfig,
      ...options,
    }
  );
};

/**
 * Authentication-specific notifications
 */
export const authNotifications = {
  loginSuccess: (userName) => showSuccess(`Welcome back, ${userName}!`),
  loginError: (error) => showError(`Login failed: ${error}`),
  logoutSuccess: () => showInfo('You have been logged out successfully'),
  registerSuccess: () => showSuccess('Registration successful! Please check your email to verify your account.'),
  registerError: (error) => showError(`Registration failed: ${error}`),
  emailVerified: () => showSuccess('Email verified successfully!'),
  emailVerificationError: (error) => showError(`Email verification failed: ${error}`),
  passwordResetSent: () => showInfo('Password reset link sent to your email'),
  passwordResetError: (error) => showError(`Password reset failed: ${error}`),
  sessionExpired: () => showWarning('Your session has expired. Please log in again.'),
};

/**
 * API-specific notifications
 */
export const apiNotifications = {
  networkError: () => showError('Network error. Please check your connection and try again.'),
  serverError: () => showError('Server error. Please try again later.'),
  unauthorized: () => showError('You are not authorized to perform this action.'),
  forbidden: () => showError('Access denied. You do not have permission for this action.'),
  notFound: () => showError('The requested resource was not found.'),
  validationError: (errors) => {
    if (Array.isArray(errors)) {
      errors.forEach(error => showError(error));
    } else {
      showError(errors || 'Validation error occurred');
    }
  },
};

/**
 * CRUD operation notifications
 */
export const crudNotifications = {
  created: (entity) => showSuccess(`${entity} created successfully`),
  updated: (entity) => showSuccess(`${entity} updated successfully`),
  deleted: (entity) => showSuccess(`${entity} deleted successfully`),
  createError: (entity, error) => showError(`Failed to create ${entity}: ${error}`),
  updateError: (entity, error) => showError(`Failed to update ${entity}: ${error}`),
  deleteError: (entity, error) => showError(`Failed to delete ${entity}: ${error}`),
};

/**
 * Profile-specific notifications
 */
export const profileNotifications = {
  profileUpdated: () => showSuccess('Profile updated successfully'),
  profileUpdateError: (error) => showError(`Failed to update profile: ${error}`),
  profileLoaded: () => showInfo('Profile loaded successfully'),
  profileLoadError: (error) => showError(`Failed to load profile: ${error}`),
  avatarUpdated: () => showSuccess('Profile picture updated successfully'),
  avatarUpdateError: (error) => showError(`Failed to update profile picture: ${error}`),
  companyAdded: () => showSuccess('Company added successfully'),
  companyAddError: (error) => showError(`Failed to add company: ${error}`),
};

/**
 * Custom notification with action button
 * @param {string} message - Message to display
 * @param {function} onAction - Action to perform when button is clicked
 * @param {string} actionText - Text for action button
 * @param {object} options - Optional toast configuration
 */
export const showActionNotification = (message, onAction, actionText = 'Action', options = {}) => {
  const CustomToast = ({ closeToast }) => (
    <div>
      <div className="mb-2">{message}</div>
      <button
        onClick={() => {
          onAction();
          closeToast();
        }}
        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
      >
        {actionText}
      </button>
    </div>
  );

  toast(<CustomToast />, {
    ...toastConfig,
    autoClose: false,
    ...options,
  });
};

/**
 * Dismiss all notifications
 */
export const dismissAll = () => {
  toast.dismiss();
};

/**
 * Check if notifications are supported
 */
export const isNotificationSupported = () => {
  return typeof toast !== 'undefined';
};

export default {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  authNotifications,
  apiNotifications,
  crudNotifications,
  profileNotifications,
  showActionNotification,
  dismissAll,
  isNotificationSupported,
};