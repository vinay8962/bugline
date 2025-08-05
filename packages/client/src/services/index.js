/**
 * Services Index
 * Central export point for all API services and hooks
 */

// Export the main API slice
export { apiSlice } from './api.js';

// Export individual API slices
export { authApi } from './authApi.js';
export { userApi } from './userApi.js';
export { companyApi } from './companyApi.js';
export { bugApi } from './bugApi.js';
export { projectApi } from './projectApi.js';

// Re-export all authentication hooks
export {
  useRegisterMutation,
  useGoogleLoginMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
} from './authApi.js';

// Re-export all user management hooks
export {
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
} from './userApi.js';

// Re-export all company management hooks
export {
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
} from './companyApi.js';

// Re-export all bug management hooks
export {
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
} from './bugApi.js';

// Re-export all project management hooks
export {
  useCreateProjectMutation,
  useGetProjectsByCompanyQuery,
  useGetProjectDetailsQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useSearchProjectsByCompanyQuery,
} from './projectApi.js';