/**
 * Bug Management API Slice
 * All bug tracking and management endpoints using RTK Query
 */

import { apiSlice } from './api.js';
import { API_ENDPOINTS } from '@bugline/shared';

/**
 * Bug Management API endpoints
 */
export const bugApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // Create New Bug Report
    createBug: builder.mutation({
      query: (bugData) => ({
        url: API_ENDPOINTS.BUGS.CREATE,
        method: 'POST',
        body: bugData,
      }),
      invalidatesTags: ['Bug'],
    }),

    // Get Bug Details
    getBugDetails: builder.query({
      query: (bugId) => API_ENDPOINTS.BUGS.GET_BY_ID(bugId),
      providesTags: ['Bug'],
    }),

    // Update Bug
    updateBug: builder.mutation({
      query: ({ bugId, ...bugData }) => ({
        url: API_ENDPOINTS.BUGS.UPDATE(bugId),
        method: 'PUT',
        body: bugData,
      }),
      invalidatesTags: ['Bug'],
    }),

    // Delete Bug
    deleteBug: builder.mutation({
      query: (bugId) => ({
        url: API_ENDPOINTS.BUGS.DELETE(bugId),
        method: 'DELETE',
      }),
      invalidatesTags: ['Bug'],
    }),

    // Assign Bug to User
    assignBug: builder.mutation({
      query: ({ bugId, assignedTo }) => ({
        url: API_ENDPOINTS.BUGS.ASSIGN(bugId),
        method: 'POST',
        body: { assignedTo },
      }),
      invalidatesTags: ['Bug'],
    }),

    // Unassign Bug
    unassignBug: builder.mutation({
      query: (bugId) => ({
        url: API_ENDPOINTS.BUGS.UNASSIGN(bugId),
        method: 'POST',
      }),
      invalidatesTags: ['Bug'],
    }),

    // Get Bugs by Project
    getBugsByProject: builder.query({
      query: ({ projectId, status = '', priority = '', page = 1, limit = 20 } = {}) => ({
        url: `${API_ENDPOINTS.BUGS.LIST_BY_PROJECT(projectId)}?status=${status}&priority=${priority}&page=${page}&limit=${limit}`,
      }),
      providesTags: ['Bug'],
    }),

    // Get Bugs by Company
    getBugsByCompany: builder.query({
      query: ({ companyId, status = '', priority = '', page = 1, limit = 20 } = {}) => ({
        url: `${API_ENDPOINTS.BUGS.LIST_BY_COMPANY(companyId)}?status=${status}&priority=${priority}&page=${page}&limit=${limit}`,
      }),
      providesTags: ['Bug'],
    }),

    // Get Bugs Assigned to Current User
    getMyAssignedBugs: builder.query({
      query: ({ status = '', page = 1, limit = 20 } = {}) => ({
        url: `${API_ENDPOINTS.BUGS.USER_ASSIGNED}?status=${status}&page=${page}&limit=${limit}`,
      }),
      providesTags: ['Bug'],
    }),

    // Search Bugs by Project
    searchBugsByProject: builder.query({
      query: ({ projectId, query = '', status = '', priority = '', page = 1, limit = 20 } = {}) => ({
        url: `${API_ENDPOINTS.BUGS.SEARCH_BY_PROJECT(projectId)}?q=${query}&status=${status}&priority=${priority}&page=${page}&limit=${limit}`,
      }),
      providesTags: ['Bug'],
    }),

  }),
  overrideExisting: false,
});

/**
 * Export auto-generated hooks
 */
export const {
  useCreateBugMutation,
  useGetBugDetailsQuery,
  useUpdateBugMutation,
  useDeleteBugMutation,
  useAssignBugMutation,
  useUnassignBugMutation,
  useGetBugsByProjectQuery,
  useGetBugsByCompanyQuery,
  useGetMyAssignedBugsQuery,
  useSearchBugsByProjectQuery,
} = bugApi;

/**
 * Export the bug API slice
 */
export default bugApi;