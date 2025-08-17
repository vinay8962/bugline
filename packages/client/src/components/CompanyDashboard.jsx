import React, { useState, useEffect } from "react";
import {
  Building2,
  FolderPlus,
  Users,
  Calendar,
  BarChart3,
  Plus,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import {
  useGetCompanyDetailsQuery,
  useGetCompanyStatsQuery,
} from "../services/companyApi.js";
import { useGetProjectsByCompanyQuery } from "../services/projectApi.js";
import {
  useGetCurrentUserQuery,
  useGetUserByIdQuery,
} from "../services/userApi.js";
import CreateProject from "./CreateProject.jsx";
import ProjectDashboard from "./ProjectDashboard.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";
import EmployeeList from "../components/EmployeeList.jsx";
import { COMPANY_ROLES } from "@bugline/shared";
import { useLocation } from "react-router-dom";

const CompanyDashboard = ({ companyId, companyRole }) => {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(companyId);
  const [showCompanySelector, setShowCompanySelector] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const location = useLocation();

  // Get current user data to get user ID
  const { data: currentUserData, isLoading: loadingCurrentUser } =
    useGetCurrentUserQuery();

  // Get user data with companies
  const currentUserId = currentUserData?.data?.id;
  const {
    data: userWithCompaniesData,
    isLoading: loadingUserCompanies,
    refetch: refetchUserCompanies,
    isFetching: isFetchingUserCompanies,
  } = useGetUserByIdQuery(currentUserId, {
    skip: !currentUserId,
  });

  // Check if we just created a new company and force a refetch
  useEffect(() => {
    if (
      location.state?.newCompanyCreated &&
      refetchUserCompanies &&
      currentUserId &&
      !loadingUserCompanies
    ) {
      console.log("🔄 New company created, refetching user companies...");
      // Add small delay to ensure query is ready
      setTimeout(() => {
        refetchUserCompanies();
      }, 100);

      // Clear the state to prevent repeated refetches
      if (window.history.replaceState) {
        window.history.replaceState(
          { ...location.state, newCompanyCreated: false },
          ""
        );
      }
    }
  }, [
    location.state?.newCompanyCreated,
    refetchUserCompanies,
    currentUserId,
    loadingUserCompanies,
  ]);

  // Force refetch every 10 seconds if no companies (fallback for cache issues)
  useEffect(() => {
    const companies = userWithCompaniesData?.data?.companies || [];
    if (
      companies.length === 0 &&
      !loadingUserCompanies &&
      !isFetchingUserCompanies &&
      refetchUserCompanies &&
      currentUserId
    ) {
      const interval = setInterval(() => {
        console.log("🔄 No companies found, attempting refetch...");
        refetchUserCompanies();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [
    userWithCompaniesData?.data?.companies,
    loadingUserCompanies,
    isFetchingUserCompanies,
    refetchUserCompanies,
    currentUserId,
  ]);

  // Listen for company creation/updates from any component
  useEffect(() => {
    // Subscribe to store changes for company mutations
    const unsubscribe =
      refetchUserCompanies &&
      currentUserId &&
      (() => {
        // Listen for successful company mutations
        const handleStorageChange = (e) => {
          if (e.key === "company_created" && e.newValue) {
            console.log(
              "🔄 Company creation detected via storage, refetching..."
            );
            // Add delay to ensure query is ready
            setTimeout(() => {
              if (!loadingUserCompanies && !isFetchingUserCompanies) {
                refetchUserCompanies();
              }
            }, 200);
            // Clear the flag
            localStorage.removeItem("company_created");
          }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
      });

    return unsubscribe;
  }, [
    refetchUserCompanies,
    currentUserId,
    loadingUserCompanies,
    isFetchingUserCompanies,
  ]);

  // Also check localStorage on mount in case we missed the event
  useEffect(() => {
    if (
      localStorage.getItem("company_created") &&
      refetchUserCompanies &&
      currentUserId
    ) {
      console.log("🔄 Found company creation flag on mount, refetching...");
      // Only refetch if query is ready and not currently loading
      if (!loadingUserCompanies && !isFetchingUserCompanies) {
        setTimeout(() => {
          refetchUserCompanies();
        }, 300);
      }
      localStorage.removeItem("company_created");
    }
  }, [
    refetchUserCompanies,
    currentUserId,
    loadingUserCompanies,
    isFetchingUserCompanies,
  ]);

  // Remove the immediate refetch on mount that was causing the error

  const {
    data: companyDetails,
    isLoading: loadingCompany,
    error: companyError,
  } = useGetCompanyDetailsQuery(selectedCompanyId, {
    skip: !selectedCompanyId,
  });

  const { data: companyStats, isLoading: loadingStats } =
    useGetCompanyStatsQuery(selectedCompanyId, {
      skip: !selectedCompanyId,
    });

  const {
    data: projectsData,
    isLoading: loadingProjects,
    refetch: refetchProjects,
  } = useGetProjectsByCompanyQuery(
    { companyId: selectedCompanyId },
    {
      skip: !selectedCompanyId,
    }
  );

  const companies = userWithCompaniesData?.data?.companies || [];
  const adminCompanies = companies.filter(
    (company) => company?.role === COMPANY_ROLES.ADMIN
  );

  // Debug logging to understand data structure
  React.useEffect(() => {
    console.log("🔍 CompanyDashboard Debug Info:", {
      userWithCompaniesData,
      companies,
      adminCompanies,
      loadingUserCompanies,
      currentUserId,
      selectedCompanyId,
      companyId: companyId,
      timestamp: new Date().toISOString(),
    });

    if (userWithCompaniesData) {
      console.log("👤 User with companies data:", userWithCompaniesData);
      console.log("🏢 Companies:", companies);
      console.log("👨‍💼 Admin companies:", adminCompanies);
      console.log("📊 Companies count:", {
        total: companies.length,
        admin: adminCompanies.length,
      });
    } else {
      console.log("❌ No user companies data available");
    }
  }, [
    userWithCompaniesData,
    companies,
    adminCompanies,
    loadingUserCompanies,
    currentUserId,
    selectedCompanyId,
    companyId,
  ]);

  // Auto-select first admin company if none selected
  useEffect(() => {
    if (
      !selectedCompanyId &&
      adminCompanies.length > 0 &&
      adminCompanies[0]?.id
    ) {
      setSelectedCompanyId(adminCompanies[0].id);
    }
  }, [selectedCompanyId, adminCompanies]);

  // Handle loading state
  if (
    loadingCurrentUser ||
    loadingUserCompanies ||
    loadingCompany ||
    loadingProjects
  ) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle error state
  if (companyError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load company details</p>
      </div>
    );
  }

  // Handle case where user has no admin companies
  if (!loadingUserCompanies && adminCompanies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Building2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No Admin Companies
        </h3>
        <p className="text-gray-400 mb-4">
          You are not an admin of any companies yet.
        </p>
        <button
          onClick={() => {
            console.log("🔄 Manual refresh triggered");
            // Only refetch if query is ready and user is available
            if (
              refetchUserCompanies &&
              currentUserId &&
              !loadingUserCompanies &&
              !isFetchingUserCompanies
            ) {
              refetchUserCompanies();
            } else {
              console.log(
                "⚠️ Cannot refetch: query not ready or already loading"
              );
            }
          }}
          disabled={
            !refetchUserCompanies ||
            !currentUserId ||
            loadingUserCompanies ||
            isFetchingUserCompanies
          }
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              loadingUserCompanies || isFetchingUserCompanies
                ? "animate-spin"
                : ""
            }`}
          />
          {loadingUserCompanies || isFetchingUserCompanies
            ? "Refreshing..."
            : "Refresh Companies"}
        </button>
      </div>
    );
  }

  const company = companyDetails?.data;
  const projects = projectsData?.data || [];
  const stats = companyStats?.data || {};

  const isAdmin = companyRole === "ADMIN";

  const handleProjectCreated = () => {
    refetchProjects();
  };

  const handleProjectClick = (projectId) => {
    setSelectedProjectId(projectId);
  };

  const handleBackToCompany = () => {
    setSelectedProjectId(null);
  };

  // If a project is selected, show the ProjectDashboard
  if (selectedProjectId) {
    return (
      <ProjectDashboard
        projectId={selectedProjectId}
        onBack={handleBackToCompany}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Selector Header - Show if multiple admin companies */}
      {adminCompanies.length > 1 && (
        <div className="bg-primary border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Company Dashboard
              </h3>
              <p className="text-gray-400 text-sm">
                Admin of {adminCompanies.length} companies
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowCompanySelector(!showCompanySelector)}
                className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                <span>
                  {adminCompanies.find((c) => c.id === selectedCompanyId)
                    ?.name || "Select Company"}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showCompanySelector && (
                <div className="absolute right-0 mt-2 w-64 bg-primary border border-gray-700 rounded-lg shadow-xl z-50">
                  <div className="p-2">
                    {adminCompanies.map((company) => {
                      if (!company?.id) return null;

                      return (
                        <button
                          key={company.id}
                          onClick={() => {
                            setSelectedCompanyId(company.id);
                            setShowCompanySelector(false);
                          }}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedCompanyId === company.id
                              ? "bg-blue-600 text-white"
                              : "text-gray-300 hover:bg-gray-800"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1 bg-blue-600 rounded">
                              <Building2 className="w-3 h-3 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {company.name || "Unnamed Company"}
                              </p>
                              <p className="text-xs text-gray-400">
                                Role: {company.role}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Company Header */}
      <div className="bg-primary border border-gray-800 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{company?.name}</h2>
              <p className="text-gray-400">/{company?.slug}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{company?.company_users?.length || 0} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <FolderPlus className="w-4 h-4" />
                  <span>{projects.length} projects</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Since{" "}
                    {company
                      ? new Date(company.created_at).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateProject(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          )}
        </div>
      </div>

      {/* Company Stats */}
      {!loadingStats && stats && Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-primary border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <span className="text-gray-400 text-sm">Total Bugs</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">
              {stats.totalBugs || 0}
            </p>
          </div>
          <div className="bg-primary border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              <span className="text-gray-400 text-sm">Open Bugs</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">
              {stats.openBugs || 0}
            </p>
          </div>
          <div className="bg-primary border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <span className="text-gray-400 text-sm">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">
              {stats.inProgressBugs || 0}
            </p>
          </div>
          <div className="bg-primary border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              <span className="text-gray-400 text-sm">Resolved</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">
              {stats.resolvedBugs || 0}
            </p>
          </div>
        </div>
      )}

      {/* Projects Section */}
      <div className="bg-primary border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Projects</h3>
            <p className="text-gray-400 text-sm">
              Manage your company projects
            </p>
          </div>
          {isAdmin && projects.length > 0 && (
            <button
              onClick={() => setShowCreateProject(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FolderPlus className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">
              No Projects Yet
            </h4>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Get started by creating your first project to organize and track
              bugs effectively.
            </p>
            {isAdmin && (
              <button
                onClick={() => setShowCreateProject(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create Your First Project
              </button>
            )}
            {!isAdmin && (
              <p className="text-gray-500 text-sm">
                Contact your company admin to create projects.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <FolderPlus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {project.name}
                      </h4>
                      <p className="text-sm text-gray-400">/{project.slug}</p>
                    </div>
                  </div>
                </div>

                {project.bug_stats && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total:</span>
                      <span className="text-white">
                        {project.bug_stats.total}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Open:</span>
                      <span className="text-orange-300">
                        {project.bug_stats.open}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">In Progress:</span>
                      <span className="text-blue-300">
                        {project.bug_stats.in_progress}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Resolved:</span>
                      <span className="text-green-300">
                        {project.bug_stats.resolved}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-500">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/** Employee List */}
      <div className="mt-8">
        <EmployeeList companyId={selectedCompanyId} />
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <CreateProject
          onClose={() => setShowCreateProject(false)}
          companyId={selectedCompanyId}
          companyName={company?.name}
          onSuccess={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default CompanyDashboard;
