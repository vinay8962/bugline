/**
 * Custom Authentication Hooks
 * Provides clean interface for authentication operations
 */

import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  useGoogleLoginMutation, 
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery 
} from '../services/authApi.js';
import { setGoogleUser, logoutUser } from '../features/auth/authSlice.js';
import { authNotifications } from '../utils/notifications.jsx';
import { decryptAuthResponse, secureStorage } from '../utils/encryption.js';

/**
 * Main authentication hook
 * Provides all auth state and operations
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get auth state from Redux
  const { user, accessToken } = useSelector((state) => state.auth);
  
  // RTK Query mutations
  const [googleLoginMutation] = useGoogleLoginMutation();
  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();
  
  // Current user query
  const { data: currentUser, isLoading: isLoadingUser } = useGetCurrentUserQuery(
    undefined,
    { skip: !accessToken } // Skip if no token
  );

  /**
   * Google Login Handler
   * @param {string} idToken - Google ID token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  const handleGoogleLogin = async (idToken) => {
    try {
      const result = await googleLoginMutation({ idToken }).unwrap();
      
      if (result.success) {
        // Decrypt the response data
        const decryptedData = await decryptAuthResponse(result.data);
        const { user, redirectTo, token, encryptedToken, adminIV, companyId } = decryptedData;
        
        // Update Redux state with decrypted user data
        dispatch(setGoogleUser({
          user,
          accessToken: token || null
        }));
        
        console.log(redirectTo)
        // Handle different user types and redirect
        if (redirectTo === 'admin') {
          // Store admin-specific encrypted data
          secureStorage.setItem('adminToken', encryptedToken);
          secureStorage.setItem('adminIV', adminIV);
          secureStorage.setItem('companyRole', 'ADMIN'); // Correct company-level role
          if (companyId) {
            secureStorage.setItem('companyId', companyId);
          }
          navigate('/admin-dashboard');
        } else if (redirectTo === 'super-admin-dashboard') {
          secureStorage.setItem('authToken', token);
          secureStorage.setItem('userRole', 'SUPER_ADMIN');
          navigate('/super-admin-dashboard');
        } else if (redirectTo === 'onboarding') {
          secureStorage.setItem('authToken', token);
          navigate('/onboarding');
        } else {
          secureStorage.setItem('authToken', token);
          navigate('/dashboard');
        }
        
        // Store encrypted user info
        secureStorage.setItem('user', user);
        
        // Show success notification
        authNotifications.loginSuccess(user.full_name || user.email);
        
        return { success: true, data: decryptedData };
      }
      
      return { success: false, error: result.message || 'Login failed' };
      
    } catch (error) {
      const errorMessage = error?.data?.message || error?.message || 'Google login failed';
      authNotifications.loginError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Regular Login Handler
   * @param {Object} credentials - {email, password}
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  const handleLogin = async (credentials) => {
    try {
      const result = await loginMutation(credentials).unwrap();
      
      if (result.success) {
        // Decrypt the response data
        const decryptedData = await decryptAuthResponse(result.data);
        const { user, token } = decryptedData;
        
        // Update Redux state with decrypted user data
        dispatch(setGoogleUser({
          user,
          accessToken: token
        }));
        
        // Store securely
        secureStorage.setItem('authToken', token);
        secureStorage.setItem('user', user);
        
        // Show success notification
        authNotifications.loginSuccess(user.full_name || user.email);
        
        navigate('/dashboard');
        return { success: true, data: decryptedData };
      }
      
      return { success: false, error: result.message || 'Login failed' };
      
    } catch (error) {
      const errorMessage = error?.data?.message || error?.message || 'Login failed';
      authNotifications.loginError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Registration Handler
   * @param {Object} userData - User registration data
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  const handleRegister = async (userData) => {
    try {
      const result = await registerMutation(userData).unwrap();
      
      if (result.success) {
        authNotifications.registerSuccess();
        return { success: true, data: result.data };
      }
      
      return { success: false, error: result.message || 'Registration failed' };
      
    } catch (error) {
      const errorMessage = error?.data?.message || error?.message || 'Registration failed';
      authNotifications.registerError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Logout Handler
   */
  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logoutUser());
      
      // Clear all secure storage
      secureStorage.clear();
      
      authNotifications.logoutSuccess();
      navigate('/auth');
      return { success: true };
    } catch (error) {
      // Even if API call fails, clear local state
      dispatch(logoutUser());
      secureStorage.clear();
      authNotifications.logoutSuccess();
      navigate('/auth');
      return { success: true };
    }
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = Boolean(user && accessToken);

  /**
   * Check if user has specific global role
   * @param {string} role - Global role to check (SUPER_ADMIN, USER)
   * @returns {boolean}
   */
  const hasRole = (role) => {
    return user?.global_role === role;
  };

  /**
   * Check if user has specific company role
   * @param {string} role - Company role to check (ADMIN, DEVELOPER, QA, OTHERS)
   * @returns {boolean}
   */
  const hasCompanyRole = (role) => {
    const companyRole = secureStorage.getItem('companyRole');
    return companyRole === role;
  };

  /**
   * Check if user is company admin
   * @returns {boolean}
   */
  const isCompanyAdmin = () => {
    // Super admins have all permissions
    if (hasRole('SUPER_ADMIN')) {
      return true;
    }
    
    // Check if user has ADMIN role at company level
    return hasCompanyRole('ADMIN');
  };

  /**
   * Get user's current role context
   * @returns {Object} Role information
   */
  const getRoleContext = () => {
    return {
      globalRole: user?.global_role,
      companyRole: secureStorage.getItem('companyRole'),
      companyId: secureStorage.getItem('companyId'),
      isSuperAdmin: hasRole('SUPER_ADMIN'),
      isCompanyAdmin: isCompanyAdmin(),
      isDeveloper: hasCompanyRole('DEVELOPER'),
      isQA: hasCompanyRole('QA')
    };
  };

  return {
    // State
    user,
    accessToken,
    isAuthenticated,
    isLoadingUser,
    currentUser,
    
    // Actions
    handleGoogleLogin,
    handleLogin,
    handleRegister,
    handleLogout,
    
    // Utilities
    hasRole,
    hasCompanyRole,
    isCompanyAdmin,
    getRoleContext,
  };
};

/**
 * Hook for Google login specifically
 * Simplified interface for Google OAuth
 */
export const useGoogleAuth = () => {
  const { handleGoogleLogin } = useAuth();
  
  return {
    googleLogin: handleGoogleLogin,
  };
};

/**
 * Hook for checking authentication status
 * Lightweight hook for components that only need auth status
 */
export const useAuthStatus = () => {
  const { user, accessToken } = useSelector((state) => state.auth);
  const companyRole = secureStorage.getItem('companyRole');
  
  return {
    isAuthenticated: Boolean(user && accessToken),
    user,
    globalRole: user?.global_role,
    companyRole,
    isSuperAdmin: user?.global_role === 'SUPER_ADMIN',
    isCompanyAdmin: user?.global_role === 'SUPER_ADMIN' || companyRole === 'ADMIN',
  };
};