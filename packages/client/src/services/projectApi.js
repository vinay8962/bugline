/**
 * Project Management API Slice
 * All project-related endpoints using RTK Query
 */

import { apiSlice } from "./api.js";
import { API_ENDPOINTS } from "@bugline/shared";

/**
 * Project Management API endpoints
 */
export const projectApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create New Project
    createProject: builder.mutation({
      query: ({ companyId, projectData }) => ({
        url: API_ENDPOINTS.PROJECTS.CREATE(companyId),
        method: "POST",
        body: projectData,
      }),
      invalidatesTags: ["Project"],
    }),

    // Get Projects by Company
    getProjectsByCompany: builder.query({
      query: ({ companyId, page = 1, limit = 20, status = "" } = {}) => ({
        url: `${API_ENDPOINTS.PROJECTS.LIST_BY_COMPANY(
          companyId
        )}?page=${page}&limit=${limit}&status=${status}`,
      }),
      providesTags: ["Project"],
    }),

    // Get Project Details
    getProjectDetails: builder.query({
      query: (projectId) => API_ENDPOINTS.PROJECTS.GET_BY_ID(projectId),
      providesTags: ["Project"],
    }),

    // Update Project
    updateProject: builder.mutation({
      query: ({ projectId, ...projectData }) => ({
        url: API_ENDPOINTS.PROJECTS.UPDATE(projectId),
        method: "PUT",
        body: projectData,
      }),
      invalidatesTags: ["Project"],
    }),

    // Delete Project
    deleteProject: builder.mutation({
      query: (projectId) => ({
        url: API_ENDPOINTS.PROJECTS.DELETE(projectId),
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),

    // Search Projects by Company
    searchProjectsByCompany: builder.query({
      query: ({
        companyId,
        query = "",
        status = "",
        page = 1,
        limit = 20,
      } = {}) => ({
        url: `${API_ENDPOINTS.PROJECTS.SEARCH_BY_COMPANY(
          companyId
        )}?q=${query}&status=${status}&page=${page}&limit=${limit}`,
      }),
      providesTags: ["Project"],
    }),
  }),
  overrideExisting: false,
});

/**
 * Export auto-generated hooks
 */
export const {
  useCreateProjectMutation,
  useGetProjectsByCompanyQuery,
  useGetProjectDetailsQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useSearchProjectsByCompanyQuery,
} = projectApi;

/**
 * Export the project API slice
 */
export default projectApi;
