import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Building2,
  FolderPlus,
  Users,
  Calendar,
  BarChart3,
  Plus,
  ChevronDown,
  Badge,
  Sparkles,
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
import BugsStats from "./BugsStats.jsx";

// Memoize fake stats to prevent object recreation
const FAKE_STATS = {
  totalBugs: 123,
  openBugs: 45,
  inProgressBugs: 20,
  resolvedBugs: 58,
};

const CompanyDashboard = React.memo(({ companyId, companyRole }) => {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(companyId);
  const [showCompanySelector, setShowCompanySelector] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Get current user data to get user ID
  const { data: currentUserData, isLoading: loadingCurrentUser } =
    useGetCurrentUserQuery();

  // Get user data with companies
  const currentUserId = currentUserData?.data?.id;
  const { data: userWithCompaniesData, isLoading: loadingUserCompanies } =
    useGetUserByIdQuery(currentUserId, {
      skip: !currentUserId,
      // Optimize RTK Query
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
    });

  const {
    data: companyDetails,
    isLoading: loadingCompany,
    error: companyError,
  } = useGetCompanyDetailsQuery(selectedCompanyId, {
    skip: !selectedCompanyId,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
  });

  const { data: companyStats, isLoading: loadingStats } =
    useGetCompanyStatsQuery(selectedCompanyId, {
      skip: !selectedCompanyId,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
    });

  const {
    data: projectsData,
    isLoading: loadingProjects,
    refetch: refetchProjects,
  } = useGetProjectsByCompanyQuery(
    { companyId: selectedCompanyId },
    {
      skip: !selectedCompanyId,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
    }
  );

  // Memoize computed values to prevent recalculation
  const companies = useMemo(
    () => userWithCompaniesData?.data?.companies || [],
    [userWithCompaniesData?.data?.companies]
  );

  const adminCompanies = useMemo(
    () => companies.filter((company) => company?.role === COMPANY_ROLES.ADMIN),
    [companies]
  );

  const company = useMemo(() => companyDetails?.data, [companyDetails?.data]);

  const projects = useMemo(
    () => projectsData?.data || [],
    [projectsData?.data]
  );

  const stats = useMemo(() => companyStats?.data || {}, [companyStats?.data]);

  const isAdmin = useMemo(() => companyRole === "ADMIN", [companyRole]);

  // Memoize loading state calculation
  const isLoading = useMemo(
    () =>
      loadingCurrentUser ||
      loadingUserCompanies ||
      loadingCompany ||
      loadingProjects,
    [loadingCurrentUser, loadingUserCompanies, loadingCompany, loadingProjects]
  );

  // Debug logging with useCallback to prevent recreation
  const logDebugInfo = useCallback(() => {
    if (userWithCompaniesData) {
      console.log("User with companies data:", userWithCompaniesData);
      console.log("Companies:", companies);
      console.log("Admin companies:", adminCompanies);
    }
  }, [userWithCompaniesData, companies, adminCompanies]);

  React.useEffect(() => {
    logDebugInfo();
  }, [logDebugInfo]);

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

  // Memoized event handlers to prevent recreation
  const handleProjectCreated = useCallback(() => {
    refetchProjects();
  }, [refetchProjects]);

  const handleProjectClick = useCallback((projectId) => {
    setSelectedProjectId(projectId);
  }, []);

  const handleBackToCompany = useCallback(() => {
    setSelectedProjectId(null);
  }, []);

  const toggleCreateProject = useCallback(() => {
    setShowCreateProject((prev) => !prev);
  }, []);

  const toggleCompanySelector = useCallback(() => {
    setShowCompanySelector((prev) => !prev);
  }, []);

  const handleCompanySelect = useCallback((companyId) => {
    setSelectedCompanyId(companyId);
    setShowCompanySelector(false);
  }, []);

  // Handle loading state
  if (isLoading) {
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
        <p className="text-gray-400">
          You are not an admin of any companies yet.
        </p>
      </div>
    );
  }

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
        <CompanySelectorHeader
          adminCompanies={adminCompanies}
          selectedCompanyId={selectedCompanyId}
          showCompanySelector={showCompanySelector}
          onToggleSelector={toggleCompanySelector}
          onCompanySelect={handleCompanySelect}
        />
      )}

      {/* Company Header */}
      <CompanyHeader
        company={company}
        projects={projects}
        isAdmin={isAdmin}
        onCreateProject={toggleCreateProject}
      />

      {/* Bug Stats */}
      <div className="py-8">
        <BugsStats stats={FAKE_STATS} />
      </div>

      {/* Projects Section */}
      <ProjectsSection
        projects={projects}
        isAdmin={isAdmin}
        onCreateProject={toggleCreateProject}
        onProjectClick={handleProjectClick}
      />

      {/* Employee List */}
      <div className="mt-8">
        <EmployeeList companyId={selectedCompanyId} />
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <CreateProject
          onClose={toggleCreateProject}
          companyId={selectedCompanyId}
          companyName={company?.name}
          onSuccess={handleProjectCreated}
        />
      )}
    </div>
  );
});

// Memoized sub-components to prevent unnecessary re-renders

const CompanySelectorHeader = React.memo(
  ({
    adminCompanies,
    selectedCompanyId,
    showCompanySelector,
    onToggleSelector,
    onCompanySelect,
  }) => (
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
        <div>
          <div className="relative inline-block">
            <button
              onClick={onToggleSelector}
              className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Building2 className="w-4 h-4" />
              <span>
                {adminCompanies.find((c) => c.id === selectedCompanyId)?.name ||
                  "Select Company"}
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
                        onClick={() => onCompanySelect(company.id)}
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
    </div>
  )
);

const CompanyHeader = React.memo(
  ({ company, projects, isAdmin, onCreateProject }) => {
    const formattedDate = useMemo(() => {
      return company ? new Date(company.created_at).toLocaleDateString() : "";
    }, [company?.created_at]);

    return (
      <div className="bg-primary border border-gray-800 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">
                  {company?.name}
                </h2>
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-primary hover:bg-green-100 text-green-700 border border-green-300 ">
                  <Sparkles className="w-4 h-4 mr-1 text-green-600" />
                  Active
                </span>
              </div>
              <p className="text-gray-400 mt-2">/{company?.slug}</p>
              <div className="flex items-center gap-6 mt-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{company?.company_users?.length || 0} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-4 h-4" />
                  <span>{projects.length} projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Since {formattedDate}</span>
                </div>
              </div>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={onCreateProject}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          )}
        </div>
      </div>
    );
  }
);

const ProjectsSection = React.memo(
  ({ projects, isAdmin, onCreateProject, onProjectClick }) => {
    return (
      <div className="bg-primary border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Projects</h3>
            <p className="text-gray-400 text-sm">
              Manage your company projects
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <EmptyProjectsState
            isAdmin={isAdmin}
            onCreateProject={onCreateProject}
          />
        ) : (
          <ProjectGrid
            projects={projects}
            onProjectClick={onProjectClick}
            onCreateProject={onCreateProject}
          />
        )}
      </div>
    );
  }
);

const EmptyProjectsState = React.memo(({ isAdmin, onCreateProject }) => (
  <div className="text-center py-12">
    <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
      <FolderPlus className="w-8 h-8 text-gray-400" />
    </div>
    <h4 className="text-lg font-semibold text-white mb-2">No Projects Yet</h4>
    <p className="text-gray-400 mb-6 max-w-md mx-auto">
      Get started by creating your first project to organize and track bugs
      effectively.
    </p>
    {isAdmin ? (
      <button
        onClick={onCreateProject}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
      >
        <Plus className="w-5 h-5" />
        Create Your First Project
      </button>
    ) : (
      <p className="text-gray-500 text-sm">
        Contact your company admin to create projects.
      </p>
    )}
  </div>
));

const ProjectGrid = React.memo(
  ({ projects, onProjectClick, onCreateProject }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onProjectClick={onProjectClick}
        />
      ))}
      <CreateProjectCard onCreateProject={onCreateProject} />
    </div>
  )
);

const ProjectCard = React.memo(({ project, onProjectClick }) => {
  const handleClick = useCallback(() => {
    onProjectClick(project.id);
  }, [project.id, onProjectClick]);

  const formattedDate = useMemo(() => {
    return new Date(project.created_at).toLocaleDateString();
  }, [project.created_at]);

  return (
    <div
      onClick={handleClick}
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
            <span className="text-white">{project.bug_stats.total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Open:</span>
            <span className="text-orange-300">{project.bug_stats.open}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">In Progress:</span>
            <span className="text-blue-300">
              {project.bug_stats.in_progress}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Resolved:</span>
            <span className="text-green-300">{project.bug_stats.resolved}</span>
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-500">Created {formattedDate}</p>
      </div>
    </div>
  );
});

const CreateProjectCard = React.memo(({ onCreateProject }) => (
  <div>
    <div
      onClick={onCreateProject}
      className="bg-gray-800/0 border-2 border-dashed border-gray-600 rounded-lg p-6 hover:border-blue-500 hover:bg-gray-750 transition-all cursor-pointer group min-h-[200px] flex flex-col items-center justify-center"
    >
      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Plus className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">
        Create New Project
      </h3>
      <p className="text-gray-400 text-sm text-center">
        Start a new project to organize and track bugs effectively.
      </p>
    </div>
  </div>
));

CompanyDashboard.displayName = "CompanyDashboard";

export default CompanyDashboard;
