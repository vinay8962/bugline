import React, { useState, useEffect, useRef } from "react";
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
import { useGetCompanyStatsQuery } from "../services/companyApi.js";
import { useGetProjectsByCompanyQuery } from "../services/projectApi.js";
import {
  useGetCurrentUserQuery,
  useGetUserByIdQuery,
} from "../services/userApi.js";
import CreateProject from "./CreateProject.jsx";
import ProjectDashboard from "./ProjectDashboard.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";
import EmployeeList from "../components/EmployeeList.jsx";
import AddEmployee from "../pages/Employee/AddEmployee.jsx";
import { COMPANY_ROLES } from "@bugline/shared";
import { useLocation, useNavigate } from "react-router-dom";
import { secureStorage } from "../utils/encryption.js";

const CompanyDashboard = ({ companyId, companyRole }) => {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(companyId);
  const [showCompanySelector, setShowCompanySelector] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const location = useLocation();
  const companySelectorRef = useRef(null);
  const navigate = useNavigate();

  // Handle click outside to close company selector
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        companySelectorRef.current &&
        !companySelectorRef.current.contains(event.target)
      ) {
        setShowCompanySelector(false);
      }
    };

    if (showCompanySelector) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCompanySelector]);

  // Update selectedCompanyId when companyId prop changes
  useEffect(() => {
    if (companyId && companyId !== selectedCompanyId) {
      setSelectedCompanyId(companyId);
    }
  }, [companyId, selectedCompanyId]);

  // Get current user data to get user ID
  const { data: currentUserData, isLoading: loadingCurrentUser } =
    useGetCurrentUserQuery();

  // Get user data with companies
  const currentUserId = currentUserData?.data?.id;
  const {
    data: userWithCompaniesData,
    isLoading: loadingUserCompanies,
    isFetching: isFetchingUserCompanies,
  } = useGetUserByIdQuery(currentUserId, {
    skip: !currentUserId,
  });

  const companies = userWithCompaniesData?.data?.companies || [];
  const currentCompany = companies.find(
    (c) => c.id === (selectedCompanyId || companyId)
  );

  // Filter admin companies for the selector
  const adminCompanies = companies.filter(
    (company) => company?.role === COMPANY_ROLES.ADMIN
  );

  // Get company stats
  const { data: companyStats } = useGetCompanyStatsQuery(
    selectedCompanyId || companyId,
    {
      skip: !(selectedCompanyId || companyId),
    }
  );

  // Get projects for the company
  const { data: projectsData, isLoading: loadingProjects } =
    useGetProjectsByCompanyQuery(
      {
        companyId: selectedCompanyId || companyId,
        page: 1,
        limit: 20,
        status: "",
      },
      {
        skip: !(selectedCompanyId || companyId),
      }
    );

  const projects = projectsData?.data || [];

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

  if (loadingUserCompanies || loadingCurrentUser) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading company data...</p>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <Building2 className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">
          No Companies Found
        </h3>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          It looks like you don't have access to any companies yet. Please
          contact your administrator or create a new company.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Company Selector Header - Show if multiple admin companies */}
      {adminCompanies.length > 1 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Company Dashboard
              </h3>
              <p className="text-slate-400 text-sm">
                Admin of {adminCompanies.length} companies
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative z-50" ref={companySelectorRef}>
                <button
                  onClick={() => setShowCompanySelector(!showCompanySelector)}
                  disabled={isFetchingUserCompanies}
                  className="flex items-center space-x-3 bg-slate-700/50 text-white px-4 py-3 rounded-xl hover:bg-slate-600/50 transition-colors duration-200 border border-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Building2 className="h-5 w-5" />
                  <span>
                    {adminCompanies.find((c) => c.id === selectedCompanyId)
                      ?.name ||
                      companies.find((c) => c.id === selectedCompanyId)?.name ||
                      currentCompany?.name ||
                      "Select Company"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showCompanySelector && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-[9999] overflow-hidden">
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-slate-300 mb-3">
                        Select Company
                      </h4>
                      {adminCompanies.map((company) => {
                        if (!company?.id) return null;

                        return (
                          <button
                            key={company.id}
                            onClick={async () => {
                              // Don't update if it's the same company
                              if (company.id === selectedCompanyId) {
                                setShowCompanySelector(false);
                                return;
                              }

                              setShowCompanySelector(false);

                              // Update storage
                              secureStorage.setItem("companyId", company.id);
                              secureStorage.setItem(
                                "companyRole",
                                company.role
                              );

                              // Dispatch storage change event
                              window.dispatchEvent(
                                new CustomEvent("secureStorageChange")
                              );

                              // Navigate to refresh dashboard with new company data
                              navigate("/dashboard", { replace: true });
                            }}
                            className={`w-full text-left p-3 rounded-lg transition-colors duration-200 mb-2 ${
                              selectedCompanyId === company.id
                                ? "bg-blue-600 text-white"
                                : "text-slate-300 hover:bg-slate-700"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-slate-600 rounded-lg">
                                <Building2 className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {company.name || "Unnamed Company"}
                                </p>
                                <p className="text-xs text-slate-400">
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
        </div>
      )}

      {/* Company Header */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {currentCompany?.name || "Company Dashboard"}
              </h1>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-full border border-slate-600">
                  {currentCompany?.slug}
                </span>
                <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                  {currentCompany?.role || companyRole}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                // Simple page refresh to reload all data
                window.location.reload();
              }}
              disabled={isFetchingUserCompanies || loadingUserCompanies}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setShowCreateProject(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <FolderPlus className="h-5 w-5" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Company Stats Overview */}
        {companyStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {companyStats.totalUsers}
                  </div>
                  <div className="text-sm text-slate-400">Team Members</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <FolderPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {companyStats.totalProjects}
                  </div>
                  <div className="text-sm text-slate-400">Projects</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {companyStats.totalBugs}
                  </div>
                  <div className="text-sm text-slate-400">Total Bugs</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {companyStats.activeBugs}
                  </div>
                  <div className="text-sm text-slate-400">Active Issues</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Projects Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Projects</h2>
            <p className="text-slate-400">
              Manage your company's projects and track their progress
            </p>
          </div>
          <button
            onClick={() => {
              console.log("🚀 Projects section New Project button clicked");
              alert("Projects New Project button clicked - opening modal");
              setShowCreateProject(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
        </div>

        {loadingProjects ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading projects...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderPlus className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No projects yet
            </h3>
            <p className="text-slate-400 mb-4">
              Create your first project to start tracking bugs and issues
            </p>
            <button
              onClick={() => setShowCreateProject(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200 cursor-pointer group"
                onClick={() => setSelectedProjectId(project.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <FolderPlus className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Created</div>
                    <div className="text-sm text-white">
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-200">
                  {project.name}
                </h3>
                <p className="text-slate-400 text-sm mb-4">{project.slug}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-slate-400">Active</span>
                  </div>
                  <div className="text-blue-400 group-hover:text-blue-300 transition-colors duration-200">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Members Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Team Members</h2>
            <p className="text-slate-400">
              Manage your company's team and their roles
            </p>
          </div>
          {(currentCompany?.role || companyRole) === "ADMIN" && (
            <button
              onClick={() => setShowAddEmployee(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Add Member</span>
            </button>
          )}
        </div>

        <EmployeeList
          companyId={selectedCompanyId || companyId}
          companyRole={currentCompany?.role || companyRole}
        />
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl mx-auto">
            <button
              onClick={() => setShowCreateProject(false)}
              className="absolute -top-12 right-0 text-white bg-slate-700 hover:bg-slate-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-200 border border-slate-600"
            >
              ✕
            </button>
            <CreateProject
              companyId={selectedCompanyId || companyId}
              companyName={currentCompany?.name || "Company"}
              onClose={() => setShowCreateProject(false)}
              onProjectCreated={() => {
                setShowCreateProject(false);
                // Refresh projects data
                window.location.reload();
              }}
            />
          </div>
        </div>
      )}

      {/* Project Dashboard Modal */}
      {selectedProjectId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full h-full overflow-y-auto">
            <button
              onClick={() => setSelectedProjectId(null)}
              className="absolute top-4 right-4 text-white bg-slate-700 hover:bg-slate-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-200 border border-slate-600 z-10"
            >
              ✕
            </button>
            <ProjectDashboard
              projectId={selectedProjectId}
              onBack={() => setSelectedProjectId(null)}
            />
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl mx-auto">
            <button
              onClick={() => setShowAddEmployee(false)}
              className="absolute -top-12 right-0 text-white bg-slate-700 hover:bg-slate-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-200 border border-slate-600"
            >
              ✕
            </button>
            <AddEmployee
              companyId={selectedCompanyId || companyId}
              onClose={() => setShowAddEmployee(false)}
              onEmployeeAdded={() => {
                setShowAddEmployee(false);
                // Refresh employee list
                window.location.reload();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
