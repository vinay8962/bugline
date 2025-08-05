/**
 * User Management API Slice
 * All user-related endpoints using RTK Query
 */

import { apiSlice } from './api.js';
import { API_ENDPOINTS } from '@bugline/shared';
import { decryptAuthResponse } from '../utils/encryption.js';

/**
 * User Management API endpoints
 */
export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // Get Current User Profile
    getCurrentUser: builder.query({
      query: () => API_ENDPOINTS.USERS.ME,
      transformResponse: async (response) => {
        if (response.success && response.data) {
          try {
            const decryptedData = await decryptAuthResponse(response.data);
            console.log(decryptedData);
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
      providesTags: ['User'],
    }),

    // Update Current User Profile
    updateCurrentUser: builder.mutation({
      query: (userData) => ({
        url: API_ENDPOINTS.USERS.ME_UPDATE,
        method: 'PUT',
        body: userData,
      }),
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
      invalidatesTags: ['User'],
    }),

    // Get All Users (Admin only)
    getAllUsers: builder.query({
      query: () => API_ENDPOINTS.USERS.LIST,
      providesTags: ['User'],
    }),

    // Get User by ID
    getUserById: builder.query({
      query: (userId) => API_ENDPOINTS.USERS.GET_BY_ID(userId),
      providesTags: ['User'],
    }),

    // Get Current User Companies
    getCurrentUserCompanies: builder.query({
      query: () => API_ENDPOINTS.USERS.ME_COMPANIES,
      providesTags: ['User', 'Company'],
    }),

    // Update User Role (Super Admin only)
    updateUserRole: builder.mutation({
      query: ({ userId, role }) => ({
        url: API_ENDPOINTS.USERS.UPDATE_ROLE(userId),
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),

    // Update User
    updateUser: builder.mutation({
      query: ({ userId, userData }) => ({
        url: API_ENDPOINTS.USERS.UPDATE(userId),
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Delete User (Admin only)
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: API_ENDPOINTS.USERS.DELETE(userId),
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Search Users
    searchUsers: builder.query({
      query: () => API_ENDPOINTS.USERS.SEARCH,
      providesTags: ['User'],
    }),

    // Get User by Email
    getUserByEmail: builder.query({
      query: (email) => API_ENDPOINTS.USERS.GET_BY_EMAIL(email),
      providesTags: ['User'],
    }),

    // Get User Companies
    getUserCompanies: builder.query({
      query: (userId) => API_ENDPOINTS.USERS.GET_COMPANIES(userId),
      providesTags: ['User', 'Company'],
    }),

    // Get User Stats
    getUserStats: builder.query({
      query: (userId) => API_ENDPOINTS.USERS.GET_STATS(userId),
      providesTags: ['User'],
    }),

    // Get Current User Stats
    getCurrentUserStats: builder.query({
      query: () => API_ENDPOINTS.USERS.ME_STATS,
      providesTags: ['User'],
    }),

  }),
  overrideExisting: false,
});

/**
 * Export auto-generated hooks
 */
export const {
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useGetCurrentUserCompaniesQuery,
  useUpdateUserRoleMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useSearchUsersQuery,
  useGetUserByEmailQuery,
  useGetUserCompaniesQuery,
  useGetUserStatsQuery,
  useGetCurrentUserStatsQuery,
} = userApi;

/**
 * Export the user API slice
 */
export default userApi;