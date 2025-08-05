import React, { useState } from "react";
import { Users, Search, Mail, Phone, Trash2, Edit } from "lucide-react";
import { useGetCompanyEmployeesQuery, useDeleteUserMutation } from "../services/userApi.js";
import { useAuthStatus } from "../hooks/useAuth.js";
import LoadingSpinner from "./LoadingSpinner.jsx";

const EmployeeList = ({ companyId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  // Get auth context
  const { companyId: authCompanyId } = useAuthStatus();
  
  // Use passed companyId or fall back to auth companyId
  const currentCompanyId = companyId || authCompanyId;

  const {
    data: usersData,
    isLoading,
    error,
    refetch
  } = useGetCompanyEmployeesQuery(currentCompanyId, {
    skip: !currentCompanyId,
  });

  const [deleteUser] = useDeleteUserMutation();

  // Show message if no company context
  if (!currentCompanyId) {
    return (
      <div className="bg-primary border border-gray-800 rounded-lg p-6">
        <div className="text-center py-12">
          <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">No Company Context</h4>
          <p className="text-gray-400">
            Employee list requires company information to display team members.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load employees</p>
        <button
          onClick={() => refetch()}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const users = usersData?.data || [];

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      usersData.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usersData.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usersData.user.phone?.includes(searchTerm);
    
    const matchesRole =
      roleFilter === "all" || user.role?.toLowerCase() === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  console.log('fileteredUser', filteredUsers)

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      try {
        await deleteUser(userId).unwrap();
        refetch();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-600 text-white';
      case 'developer':
        return 'bg-blue-600 text-white';
      case 'qa':
        return 'bg-green-600 text-white';
      case 'super_admin':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="bg-primary border border-gray-800 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Employees ({filteredUsers.length})
        </h2>
        <p className="text-sm text-gray-400">
          Manage your team members and their roles
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full text-white border border-gray-800 rounded-md bg-transparent text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-800 rounded-md px-3 py-2 text-sm bg-primary text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="developer">Developer</option>
          <option value="qa">QA</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      {/* Employee List */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">
              {users.length === 0 ? "No Employees Yet" : "No Matching Employees"}
            </h4>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {users.length === 0 
                ? "Start building your team by adding your first employee."
                : "No employees match your current search criteria."
              }
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="border border-gray-700 rounded-lg p-4 bg-primary text-white hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.user.full_name?.charAt(0)?.toUpperCase() || user.user.email?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {user.user.full_name || 'No Name'}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(user.role)}`}
                      >
                        {user.role?.replace('_', ' ').toUpperCase() || 'NO ROLE'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{user.user.email}</span>
                    </div>
                    {user.user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button 
                    className="border border-gray-800 rounded px-3 py-1 text-sm hover:bg-gray-800 flex items-center gap-1 text-blue-400"
                    title="Edit Employee"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user.id, user.full_name || user.email)}
                    className="border border-red-800 rounded px-3 py-1 text-sm hover:bg-red-800 flex items-center gap-1 text-red-400"
                    title="Delete Employee"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployeeList;