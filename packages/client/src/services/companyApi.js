/**
 * Company Management API Slice
 * All company-related endpoints using RTK Query
 */

import { apiSlice } from "./api.js";
import { API_ENDPOINTS } from "@bugline/shared";

/**
 * Company Management API endpoints
 */
export const companyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create New Company
    createCompany: builder.mutation({
      query: (companyData) => ({
        url: API_ENDPOINTS.COMPANIES.CREATE,
        method: "POST",
        body: companyData,
      }),
      invalidatesTags: ["Company", "User", "CompanyUser"], // Invalidate all related tags
    }),

    // Get All Companies (Admin)
    getAllCompanies: builder.query({
      query: () => API_ENDPOINTS.COMPANIES.LIST,
      providesTags: ["Company"],
    }),

    // Search Companies
    searchCompanies: builder.query({
      query: () => API_ENDPOINTS.COMPANIES.SEARCH,
      providesTags: ["Company"],
    }),

    // Get Company Details
    getCompanyDetails: builder.query({
      query: (companyId) => API_ENDPOINTS.COMPANIES.GET_BY_ID(companyId),
      providesTags: ["Company"],
    }),

    // Update Company
    updateCompany: builder.mutation({
      query: ({ companyId, ...companyData }) => ({
        url: API_ENDPOINTS.COMPANIES.UPDATE(companyId),
        method: "PUT",
        body: companyData,
      }),
      invalidatesTags: ["Company"],
    }),

    // Delete Company (Admin)
    deleteCompany: builder.mutation({
      query: (companyId) => ({
        url: API_ENDPOINTS.COMPANIES.DELETE(companyId),
        method: "DELETE",
      }),
      invalidatesTags: ["Company"],
    }),

    // Get Company Members
    getCompanyMembers: builder.query({
      query: (companyId) => API_ENDPOINTS.COMPANIES.GET_MEMBERS(companyId),
      providesTags: ["Company", "User"],
    }),

    // Add User to Company
    addUserToCompany: builder.mutation({
      query: ({ companyId, userData }) => ({
        url: API_ENDPOINTS.COMPANIES.ADD_MEMBER(companyId),
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Company", "User"],
    }),

    // Remove User from Company
    removeUserFromCompany: builder.mutation({
      query: ({ companyId, userId }) => ({
        url: API_ENDPOINTS.COMPANIES.REMOVE_MEMBER(companyId, userId),
        method: "DELETE",
      }),
      invalidatesTags: ["Company", "User"],
    }),

    // Update User Company Role
    updateUserCompanyRole: builder.mutation({
      query: ({ companyId, userId, role }) => ({
        url: API_ENDPOINTS.COMPANIES.UPDATE_MEMBER_ROLE(companyId, userId),
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: ["Company", "User"],
    }),

    // Get Company Statistics
    getCompanyStats: builder.query({
      query: (companyId) => API_ENDPOINTS.COMPANIES.GET_STATS(companyId),
      providesTags: ["Company"],
    }),

    // Upload Company Logo
    uploadCompanyLogo: builder.mutation({
      query: ({ companyId, formData }) => ({
        url: API_ENDPOINTS.COMPANIES.UPLOAD_LOGO(companyId),
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Company"],
    }),

    // Get Company Settings
    getCompanySettings: builder.query({
      query: (companyId) => API_ENDPOINTS.COMPANIES.GET_SETTINGS(companyId),
      providesTags: ["Company"],
    }),

    // Update Company Settings
    updateCompanySettings: builder.mutation({
      query: ({ companyId, settings }) => ({
        url: API_ENDPOINTS.COMPANIES.UPDATE_SETTINGS(companyId),
        method: "PUT",
        body: settings,
      }),
      invalidatesTags: ["Company"],
    }),
  }),
  overrideExisting: false,
});

/**
 * Export auto-generated hooks
 */
export const {
  useCreateCompanyMutation,
  useGetAllCompaniesQuery,
  useSearchCompaniesQuery,
  useGetCompanyDetailsQuery,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
  useGetCompanyMembersQuery,
  useAddUserToCompanyMutation,
  useRemoveUserFromCompanyMutation,
  useUpdateUserCompanyRoleMutation,
  useGetCompanyStatsQuery,
  useUploadCompanyLogoMutation,
  useGetCompanySettingsQuery,
  useUpdateCompanySettingsMutation,
} = companyApi;

/**
 * Export the company API slice
 */
export default companyApi;
