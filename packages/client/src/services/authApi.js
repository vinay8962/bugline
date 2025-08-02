/**
 * Authentication API Slice
 * All authentication-related endpoints using RTK Query
 */

import { apiSlice } from './api.js';
import { API_ENDPOINTS } from '@bugline/shared';
import { decryptAuthResponse } from '../utils/encryption.js';

/**
 * Authentication API endpoints
 */
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // User Registration
    register: builder.mutation({
      query: (userData) => ({
        url: API_ENDPOINTS.AUTH.REGISTER,
        method: 'POST',
        body: userData,
      }),
      transformResponse: async (response) => {
        if (response.success && response.data) {
          try {
            const decryptedData = await decryptAuthResponse(response.data);
            return {
              ...response,
              data: decryptedData
            };
          } catch (error) {
            return response;
          }
        }
        return response;
      },
      invalidatesTags: ['Auth'],
    }),

    // User Login
    login: builder.mutation({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: 'POST',
        body: credentials,
      }),
      transformResponse: async (response) => {
        if (response.success && response.data) {
          try {
            const decryptedData = await decryptAuthResponse(response.data);
            return {
              ...response,
              data: decryptedData
            };
          } catch (error) {
            return response;
          }
        }
        return response;
      },
      invalidatesTags: ['Auth'],
    }),

    // Google OAuth Login
    googleLogin: builder.mutation({
      query: (tokenData) => ({
        url: API_ENDPOINTS.AUTH.GOOGLE_LOGIN,
        method: 'POST',
        body: tokenData,
      }),
      transformResponse: async (response) => {
        if (response.success && response.data) {
          try {
            const decryptedData = await decryptAuthResponse(response.data);
            return {
              ...response,
              data: decryptedData
            };
          } catch (error) {
            return response;
          }
        }
        return response;
      },
      invalidatesTags: ['Auth'],
    }),

    // Email Verification
    verifyEmail: builder.mutation({
      query: (verificationData) => ({
        url: API_ENDPOINTS.AUTH.VERIFY_EMAIL,
        method: 'POST',
        body: verificationData,
      }),
      transformResponse: async (response) => {
        if (response.success && response.data) {
          try {
            const decryptedData = await decryptAuthResponse(response.data);
            return {
              ...response,
              data: decryptedData
            };
          } catch (error) {
            return response;
          }
        }
        return response;
      },
      invalidatesTags: ['Auth'],
    }),

    // Resend Verification Email
    resendVerification: builder.mutation({
      query: (emailData) => ({
        url: API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
        method: 'POST',
        body: emailData,
      }),
    }),

    // Forgot Password
    forgotPassword: builder.mutation({
      query: (emailData) => ({
        url: API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        method: 'POST',
        body: emailData,
      }),
    }),

    // Reset Password
    resetPassword: builder.mutation({
      query: (resetData) => ({
        url: API_ENDPOINTS.AUTH.RESET_PASSWORD,
        method: 'POST',
        body: resetData,
      }),
    }),

    // Get Current User
    getCurrentUser: builder.query({
      query: () => API_ENDPOINTS.USERS.ME,
      transformResponse: async (response) => {
        if (response.success && response.data) {
          try {
            const decryptedData = await decryptAuthResponse(response.data);
            return {
              ...response,
              data: decryptedData.user
            };
          } catch (error) {
            return response;
          }
        }
        return response;
      },
      providesTags: ['Auth', 'User'],
    }),

    // Logout (client-side action, no API call needed)
    logout: builder.mutation({
      queryFn: () => {
        // Clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminIV');
        localStorage.removeItem('userRole');
        localStorage.removeItem('google_id_token');
        
        return { data: { success: true } };
      },
      invalidatesTags: ['Auth', 'User', 'Company', 'Project', 'Bug'],
    }),

  }),
  overrideExisting: false,
});

/**
 * Export auto-generated hooks
 */
export const {
  useRegisterMutation,
  useLoginMutation,
  useGoogleLoginMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
} = authApi;

/**
 * Export the auth API slice
 */
export default authApi;