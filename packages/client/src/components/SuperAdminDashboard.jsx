import React, { useState } from "react";
import { 
  Shield, 
  Users, 
  Building2, 
  FolderPlus, 
  Bug, 
  BarChart3, 
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Calendar,
  Activity,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { 
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation
} from "../services/userApi.js";
import { 
  useGetAllCompaniesQuery
} from "../services/companyApi.js";
import LoadingSpinner from "./LoadingSpinner.jsx";

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserRole, setSelectedUserRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // API calls
  const {
    data: usersData,
    isLoading: loadingUsers,
    refetch: refetchUsers,
  } = useGetAllUsersQuery({ 
    page: currentPage, 
    limit: 10,
    global_role: selectedUserRole === "all" ? undefined : selectedUserRole
  });

  const {
    data: companiesData,
    isLoading: loadingCompanies,
  } = useGetAllCompaniesQuery();

  const [updateUserRole] = useUpdateUserRoleMutation();
  const [deleteUser] = useDeleteUserMutation();

  const users = usersData?.data || [];
  const usersPagination = usersData?.pagination || {};
  const companies = companiesData?.data?.companies || [];
  const companiesPagination = companiesData?.data?.pagination || {};

  // Calculate global statistics
  const globalStats = {
    totalUsers: usersPagination.total || 0,
    totalCompanies: companiesPagination.total || 0,
    totalProjects: companies.reduce((acc, company) => acc + (company.projects?.length || 0), 0),
    totalBugs: 0, // This would need to be calculated from all projects
    superAdmins: users.filter(user => user.global_role === 'SUPER_ADMIN').length,
    regularUsers: users.filter(user => user.global_role === 'USER').length,
    companiesWithProjects: companies.filter(company => company.projects && company.projects.length > 0).length,
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await updateUserRole({ userId, global_role: newRole }).unwrap();
      refetchUsers();
    } catch (err) {
      console.error('Failed to update user role:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId).unwrap();
        refetchUsers();
      } catch (err) {
        console.error('Failed to delete user:', err);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingUsers && loadingCompanies) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600 rounded-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Super Admin Dashboard</h2>
            <p className="text-gray-400">Complete system overview and management</p>
          </div>
        </div>
      </div>

      {/* Global Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-primary border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-gray-400 text-sm">Total Users</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1">{globalStats.totalUsers}</p>
          <p className="text-xs text-gray-500">
            {globalStats.superAdmins} admins, {globalStats.regularUsers} users
          </p>
        </div>

        <div className="bg-primary border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-500" />
            <span className="text-gray-400 text-sm">Total Companies</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1">{globalStats.totalCompanies}</p>
          <p className="text-xs text-gray-500">
            {globalStats.companiesWithProjects} with projects
          </p>
        </div>

        <div className="bg-primary border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-purple-500" />
            <span className="text-gray-400 text-sm">Total Projects</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1">{globalStats.totalProjects}</p>
          <p className="text-xs text-gray-500">Across all companies</p>
        </div>

        <div className="bg-primary border border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-orange-500" />
            <span className="text-gray-400 text-sm">System Health</span>
          </div>
          <p className="text-2xl font-bold text-white mt-1">
            {globalStats.totalCompanies > 0 ? "Active" : "Setup"}
          </p>
          <p className="text-xs text-gray-500">Overall status</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-primary border border-gray-800 rounded-lg">
        <div className="flex border-b border-gray-800">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "users", label: "Users", icon: Users },
            { id: "companies", label: "Companies", icon: Building2 },
            { id: "analytics", label: "Analytics", icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">System Overview</h3>
              
              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-white flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Recent Users
                  </h4>
                  <div className="space-y-2">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border border-gray-700 rounded">
                        <div>
                          <p className="text-white text-sm">{user.full_name || user.email}</p>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${
                          user.global_role === 'SUPER_ADMIN' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-gray-600 text-white'
                        }`}>
                          {user.global_role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Recent Companies
                  </h4>
                  <div className="space-y-2">
                    {companies.slice(0, 5).map((company) => (
                      <div key={company.id} className="flex items-center justify-between p-3 border border-gray-700 rounded">
                        <div>
                          <p className="text-white text-sm">{company.name}</p>
                          <p className="text-gray-400 text-xs">
                            {company.company_users?.length || 0} members, {company.projects?.length || 0} projects
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(company.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">User Management</h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-800 rounded-md bg-gray-900 text-white text-sm"
                    />
                  </div>
                  <select
                    value={selectedUserRole}
                    onChange={(e) => setSelectedUserRole(e.target.value)}
                    className="border border-gray-800 rounded-md px-3 py-2 text-sm bg-gray-900 text-white"
                  >
                    <option value="all">All Roles</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="USER">User</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">
                          {(user.full_name || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.full_name || 'No name'}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        <p className="text-gray-500 text-xs">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={user.global_role}
                        onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                        className="border border-gray-800 rounded px-2 py-1 text-xs bg-gray-900 text-white"
                      >
                        <option value="USER">User</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {usersPagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: usersPagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "companies" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Company Management</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-800 rounded-md bg-gray-900 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCompanies.map((company) => (
                  <div key={company.id} className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-600 rounded-lg">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{company.name}</h4>
                          <p className="text-sm text-gray-400">/{company.slug}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Members:</span>
                        <span className="text-white">{company.company_users?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Projects:</span>
                        <span className="text-white">{company.projects?.length || 0}</span>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-700">
                      <p className="text-xs text-gray-500">
                        Created {new Date(company.created_at).toLocaleDateString()}
                      </p>
                      {company.projects && company.projects.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-400 mb-1">Recent Projects:</p>
                          {company.projects.slice(0, 2).map((project) => (
                            <p key={project.id} className="text-xs text-gray-300">• {project.name}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">System Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-white">User Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Super Admins</span>
                      <span className="text-red-400">{globalStats.superAdmins}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Regular Users</span>
                      <span className="text-blue-400">{globalStats.regularUsers}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-white">Company Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Companies with Projects</span>
                      <span className="text-green-400">{globalStats.companiesWithProjects}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Empty Companies</span>
                      <span className="text-orange-400">{globalStats.totalCompanies - globalStats.companiesWithProjects}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  System Health Checks
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Companies</span>
                    <span className={globalStats.totalCompanies > 0 ? "text-green-400" : "text-red-400"}>
                      {globalStats.totalCompanies > 0 ? "✓ Good" : "⚠ Needs Setup"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">User Registration</span>
                    <span className={globalStats.totalUsers > 1 ? "text-green-400" : "text-yellow-400"}>
                      {globalStats.totalUsers > 1 ? "✓ Active" : "⚠ Low Activity"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Project Creation</span>
                    <span className={globalStats.totalProjects > 0 ? "text-green-400" : "text-orange-400"}>
                      {globalStats.totalProjects > 0 ? "✓ Active" : "⚠ No Projects"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;