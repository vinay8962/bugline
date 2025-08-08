/**
 * Custom Authentication Hooks
 * Provides clean interface for authentication operations
 */

import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useGoogleLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
} from "../services/authApi.js";
import { setGoogleUser, logoutUser } from "../features/auth/authSlice.js";
import { authNotifications } from "../utils/notifications.jsx";
import { secureStorage } from "../utils/encryption.js";

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
  const [registerMutation] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();

  // Current user query
  const { data: currentUser, isLoading: isLoadingUser } =
    useGetCurrentUserQuery(
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
        // Get user and token from response data
        const { user, token } = result.data;

        // Update Redux state with decrypted user data
        dispatch(
          setGoogleUser({
            user,
            accessToken: token,
          })
        );

        // Handle user authentication and store data
        try {
          // Store JWT token for API authentication
          secureStorage.setItem("authToken", token);
          secureStorage.setItem("userId", user.id);

          // Store role-specific data for company members (now included in user object)
          if (user.companyRole && user.companyId) {
            secureStorage.setItem("companyRole", user.companyRole);
            secureStorage.setItem("companyId", user.companyId);
          }

          // Store user role for super admins
          if (user.global_role === "SUPER_ADMIN") {
            secureStorage.setItem("userRole", "SUPER_ADMIN");
          }

          navigate("/dashboard");
        } catch (navigationError) {
          throw new Error("Navigation failed", navigationError);
          // If navigation fails, still return success but log the error
        }

        // Store encrypted user info
        secureStorage.setItem("user", user);

        // Show success notification
        authNotifications.loginSuccess(user.full_name || user.email);

        return { success: true, data: result.data };
      }

      return { success: false, error: result.message || "Login failed" };
    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || "Google login failed";
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

      return { success: false, error: result.message || "Registration failed" };
    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || "Registration failed";
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
      navigate("/auth");
      return { success: true };
    } catch (error) {
      // Even if API call fails, clear local state
      dispatch(logoutUser());
      secureStorage.clear();
      authNotifications.logoutSuccess();
      navigate("/auth");
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
    const companyRole = secureStorage.getItem("companyRole");
    return companyRole === role;
  };

  /**
   * Check if user is company admin
   * @returns {boolean}
   */
  const isCompanyAdmin = () => {
    // Super admins have all permissions
    if (hasRole("SUPER_ADMIN")) {
      return true;
    }

    // Check if user has ADMIN role at company level
    return hasCompanyRole("ADMIN");
  };

  /**
   * Check if user can manage bugs (ADMIN, DEVELOPER, QA)
   * @returns {boolean}
   */
  const canManageBugs = () => {
    if (hasRole("SUPER_ADMIN")) return true;
    const companyRole = secureStorage.getItem("companyRole");
    return ["ADMIN", "DEVELOPER", "QA"].includes(companyRole);
  };

  /**
   * Check if user can assign bugs (ADMIN, DEVELOPER)
   * @returns {boolean}
   */
  const canAssignBugs = () => {
    if (hasRole("SUPER_ADMIN")) return true;
    const companyRole = secureStorage.getItem("companyRole");
    return ["ADMIN", "DEVELOPER"].includes(companyRole);
  };

  /**
   * Check if user has company access (any company role)
   * @returns {boolean}
   */
  const hasCompanyAccess = () => {
    if (hasRole("SUPER_ADMIN")) return true;
    return Boolean(
      secureStorage.getItem("companyRole") && secureStorage.getItem("companyId")
    );
  };

  /**
   * Get user's current role context
   * @returns {Object} Role information
   */
  const getRoleContext = () => {
    const companyRole = secureStorage.getItem("companyRole");
    return {
      globalRole: user?.global_role,
      companyRole,
      companyId: secureStorage.getItem("companyId"),
      isSuperAdmin: hasRole("SUPER_ADMIN"),
      isCompanyAdmin: isCompanyAdmin(),
      isDeveloper: hasCompanyRole("DEVELOPER"),
      isQA: hasCompanyRole("QA"),
      canManageBugs: canManageBugs(),
      canAssignBugs: canAssignBugs(),
      hasCompanyAccess: hasCompanyAccess(),
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
    handleRegister,
    handleLogout,

    // Utilities
    hasRole,
    hasCompanyRole,
    isCompanyAdmin,
    canManageBugs,
    canAssignBugs,
    hasCompanyAccess,
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
  const companyRole = secureStorage.getItem("companyRole");
  const companyId = secureStorage.getItem("companyId");

  return {
    isAuthenticated: Boolean(user && accessToken),
    user,
    globalRole: user?.global_role,
    companyRole,
    companyId,
    isSuperAdmin: user?.global_role === "SUPER_ADMIN",
    isCompanyAdmin:
      user?.global_role === "SUPER_ADMIN" || companyRole === "ADMIN",
    isDeveloper: companyRole === "DEVELOPER",
    isQA: companyRole === "QA",
    canManageBugs:
      user?.global_role === "SUPER_ADMIN" ||
      ["ADMIN", "DEVELOPER", "QA"].includes(companyRole),
    canAssignBugs:
      user?.global_role === "SUPER_ADMIN" ||
      ["ADMIN", "DEVELOPER"].includes(companyRole),
    hasCompanyAccess:
      user?.global_role === "SUPER_ADMIN" || Boolean(companyRole && companyId),
  };
};
