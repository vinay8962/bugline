/**
 * Base RTK Query API Configuration
 * Centralized API setup with interceptors and error handling
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@bugline/shared";
import { secureStorage } from "../utils/encryption.js";

// Get API base URL from environment
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

/**
 * Custom base query with interceptors
 * Handles authentication, error handling, and token refresh
 */
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get token from auth state or secure storage
    const stateToken = getState()?.auth?.accessToken;
    const storageToken = secureStorage.getItem("authToken");
    const token = stateToken || storageToken;

    // Debug logging in development
    if (import.meta.env.VITE_APP_ENV === "development") {
      // console.log("API prepareHeaders:", {
      //   stateToken: stateToken ? "Present" : "Not found",
      //   storageToken: storageToken ? "Present" : "Not found",
      //   finalToken: token ? "Using token" : "No token available",
      // });
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");
    return headers;
  },
});

/**
 * Base query with retry and error handling
 */
const baseQueryWithRetry = async (args, api, extraOptions) => {
  let result = await baseQueryWithAuth(args, api, extraOptions);

  // Handle 401 Unauthorized - token expired
  if (result.error && result.error.status === 401) {
    // Dispatch logout action to clear state
    api.dispatch({ type: "auth/logoutUser" });

    // Clear secure storage
    secureStorage.clear();

    // Redirect to login page
    window.location.href = "/auth";
  }

  // Handle network errors with retry
  if (result.error && !result.error.status) {
    // Retry once for network errors
    result = await baseQueryWithAuth(args, api, extraOptions);
  }

  return result;
};

/**
 * Main RTK Query API slice
 * Base configuration for all API endpoints
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRetry,
  tagTypes: ["Auth", "User", "Company", "Project", "Bug", "CompanyUser"],
  endpoints: () => ({}), // Individual endpoints defined in separate files
});

/**
 * Export hooks and utilities
 */
export default apiSlice;
