/**
 * Custom Authentication Hooks - Optimized for Performance
 * Provides clean interface for authentication operations with minimal re-renders
 */

import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useCallback, useMemo } from "react";
import {
  useGoogleLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
} from "../services/authApi.js";
import { setGoogleUser, logoutUser } from "../features/auth/authSlice.js";
import { authNotifications } from "../utils/notifications.jsx";
import { secureStorage } from "../utils/encryption.js";

// Create memoized selectors to prevent unnecessary re-renders
const selectAuthState = (state) => state.auth;
const selectUser = (state) => state.auth.user;
const selectAccessToken = (state) => state.auth.accessToken;

/**
 * Main authentication hook
 * Provides all auth state and operations
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Use specific selectors instead of destructuring entire state
  const user = useSelector(selectUser);
  const accessToken = useSelector(selectAccessToken);

  // RTK Query mutations
  const [googleLoginMutation] = useGoogleLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();

  // Current user query with proper skip condition
  const { data: currentUser, isLoading: isLoadingUser } =
    useGetCurrentUserQuery(undefined, {
      skip: !accessToken,
      // Add refetch options to prevent unnecessary calls
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
    });

  /**
   * Google Login Handler - Memoized to prevent re-creation
   */
  const handleGoogleLogin = useCallback(
    async (idToken) => {
      try {
        const result = await googleLoginMutation({ idToken }).unwrap();
        if (result.success) {
          const { user, token } = result.data;

          // Update Redux state
          dispatch(setGoogleUser({ user, accessToken: token }));

          try {
            // Store authentication data
            secureStorage.setItem("authToken", token);
            secureStorage.setItem("userId", user.id);

            if (user.companyRole && user.companyId) {
              secureStorage.setItem("companyRole", user.companyRole);
              secureStorage.setItem("companyId", user.companyId);
            }

            if (user.global_role === "SUPER_ADMIN") {
              secureStorage.setItem("userRole", "SUPER_ADMIN");
            }

            navigate("/dashboard");
          } catch (navigationError) {
            console.error("Navigation failed:", navigationError);
          }

          secureStorage.setItem("user", user);
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
    },
    [googleLoginMutation, dispatch, navigate]
  );

  /**
   * Registration Handler - Memoized
   */
  const handleRegister = useCallback(
    async (userData) => {
      try {
        const result = await registerMutation(userData).unwrap();

        if (result.success) {
          authNotifications.registerSuccess();
          return { success: true, data: result.data };
        }

        return {
          success: false,
          error: result.message || "Registration failed",
        };
      } catch (error) {
        const errorMessage =
          error?.data?.message || error?.message || "Registration failed";
        authNotifications.registerError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [registerMutation]
  );

  /**
   * Logout Handler - Memoized
   */
  const handleLogout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logoutUser());
      secureStorage.clear();
      authNotifications.logoutSuccess();
      navigate("/auth");
      return { success: true };
    } catch (error) {
      dispatch(logoutUser());
      secureStorage.clear();
      authNotifications.logoutSuccess();
      navigate("/auth");
      return { success: true };
    }
  }, [logoutMutation, dispatch, navigate]);

  // Memoize computed values to prevent recalculation
  const isAuthenticated = useMemo(() => {
    return Boolean(user && accessToken);
  }, [user, accessToken]);

  // Memoize role checking functions
  const hasRole = useCallback(
    (role) => user?.global_role === role,
    [user?.global_role]
  );

  const hasCompanyRole = useCallback((role) => {
    const companyRole = secureStorage.getItem("companyRole");
    return companyRole === role;
  }, []);

  const isCompanyAdmin = useCallback(() => {
    if (user?.global_role === "SUPER_ADMIN") return true;
    const companyRole = secureStorage.getItem("companyRole");
    return companyRole === "ADMIN";
  }, [user?.global_role]);

  const canManageBugs = useCallback(() => {
    if (user?.global_role === "SUPER_ADMIN") return true;
    const companyRole = secureStorage.getItem("companyRole");
    return ["ADMIN", "DEVELOPER", "QA"].includes(companyRole);
  }, [user?.global_role]);

  const canAssignBugs = useCallback(() => {
    if (user?.global_role === "SUPER_ADMIN") return true;
    const companyRole = secureStorage.getItem("companyRole");
    return ["ADMIN", "DEVELOPER"].includes(companyRole);
  }, [user?.global_role]);

  const hasCompanyAccess = useCallback(() => {
    if (user?.global_role === "SUPER_ADMIN") return true;
    return Boolean(
      secureStorage.getItem("companyRole") && secureStorage.getItem("companyId")
    );
  }, [user?.global_role]);

  // Memoize role context to prevent object recreation
  const getRoleContext = useCallback(() => {
    const companyRole = secureStorage.getItem("companyRole");
    const companyId = secureStorage.getItem("companyId");

    return {
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
        user?.global_role === "SUPER_ADMIN" ||
        Boolean(companyRole && companyId),
    };
  }, [user?.global_role]);

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
 * Hook for Google login specifically - Optimized
 */
export const useGoogleAuth = () => {
  const { handleGoogleLogin } = useAuth();

  return useMemo(
    () => ({
      googleLogin: handleGoogleLogin,
    }),
    [handleGoogleLogin]
  );
};

/**
 * Hook for checking authentication status - Heavily Optimized
 */
export const useAuthStatus = () => {
  const user = useSelector(selectUser);
  const accessToken = useSelector(selectAccessToken);

  // Memoize expensive secureStorage calls
  const storageData = useMemo(() => {
    const companyRole = secureStorage.getItem("companyRole");
    const companyId = secureStorage.getItem("companyId");
    return { companyRole, companyId };
  }, []);

  // Memoize all computed values
  const authStatus = useMemo(() => {
    const { companyRole, companyId } = storageData;
    const globalRole = user?.global_role;
    const isSuperAdmin = globalRole === "SUPER_ADMIN";

    return {
      isAuthenticated: Boolean(user && accessToken),
      user,
      globalRole,
      companyRole,
      companyId,
      isSuperAdmin,
      isCompanyAdmin: isSuperAdmin || companyRole === "ADMIN",
      isDeveloper: companyRole === "DEVELOPER",
      isQA: companyRole === "QA",
      canManageBugs:
        isSuperAdmin || ["ADMIN", "DEVELOPER", "QA"].includes(companyRole),
      canAssignBugs:
        isSuperAdmin || ["ADMIN", "DEVELOPER"].includes(companyRole),
      hasCompanyAccess: isSuperAdmin || Boolean(companyRole && companyId),
    };
  }, [user, accessToken, storageData]);

  return authStatus;
};
